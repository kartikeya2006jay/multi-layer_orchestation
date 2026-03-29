import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../db/connection.js';
import { generatePlan } from './openai.js';
import { runAgentTask } from './agentRunner.js';
import { broadcast } from './websocket.js';

const runningTasks = new Map();

export async function launchTask({ title, description, input, agentId, priority, workspaceId }) {
    if (!workspaceId) throw new Error('workspaceId is required for launchTask');
    const db = await getDb();
    const taskId = uuidv4();

    db.prepare(`
        INSERT INTO tasks (id, workspace_id, title, description, input, agent_id, priority, status, planner_version, prompt_version)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', '1.0.0', '1.0.0')
    `).run(taskId, workspaceId, title, description || '', input || description, agentId || null, priority || 'medium');

    broadcast({ type: 'task:created', data: { id: taskId, title, status: 'pending', workspace_id: workspaceId } }, workspaceId);

    // Run asynchronously
    const promise = runAgentTask(taskId).catch(err => {
        console.error(`Task ${taskId} failed:`, err.message);
    }).finally(() => {
        runningTasks.delete(taskId);
    });

    runningTasks.set(taskId, promise);

    console.log(`[Task ${taskId}] Launched successfully for Workspace ${workspaceId}`);
    return { id: taskId, status: 'pending' };
}

export async function cancelTask(taskId, workspaceId) {
    const db = await getDb();
    const task = db.prepare('SELECT * FROM tasks WHERE id = ? AND workspace_id = ?').get(taskId, workspaceId);
    if (!task) throw new Error('Task not found');
    if (task.status === 'completed' || task.status === 'failed') {
        throw new Error('Cannot cancel a finished task');
    }

    db.prepare(`UPDATE tasks SET status = 'cancelled', updated_at = datetime('now') WHERE id = ?`).run(taskId);

    if (task.agent_id) {
        db.prepare(`UPDATE agents SET status = 'idle', updated_at = datetime('now') WHERE id = ?`).run(task.agent_id);
        broadcast({ type: 'agent:update', data: { id: task.agent_id, status: 'idle', workspace_id: workspaceId } }, workspaceId);
    }

    broadcast({ type: 'task:update', data: { id: taskId, status: 'cancelled', workspace_id: workspaceId } }, workspaceId);
    return { id: taskId, status: 'cancelled' };
}

export async function executeWorkflow(workflowId, workspaceId) {
    if (!workflowId || !workspaceId) {
        throw new Error('workflowId and workspaceId are required for execution');
    }

    const db = await getDb();
    let workflow;

    try {
        workflow = db.prepare('SELECT * FROM workflows WHERE id = ? AND workspace_id = ?').get(workflowId, workspaceId);
    } catch (err) {
        console.error('Database error in executeWorkflow (select):', err.message);
        throw new Error('Database access failed during workflow lookup');
    }

    if (!workflow) {
        throw new Error(`Workflow not found or access denied (ID: ${workflowId})`);
    }

    let steps = [];
    try {
        steps = JSON.parse(workflow.steps || '[]');
    } catch (err) {
        console.error('JSON parse error for steps in executeWorkflow:', err.message);
        throw new Error('Workflow has corrupted steps architecture (invalid JSON)');
    }

    if (!Array.isArray(steps)) {
        steps = [];
    }

    if (steps.length === 0) {
        throw new Error('Workflow architect has no configured steps to execute');
    }

    // Update status to running
    try {
        db.prepare(`UPDATE workflows SET status = 'running', current_step = 0, updated_at = datetime('now') WHERE id = ?`).run(workflowId);
    } catch (err) {
        console.error('Database error in executeWorkflow (update running):', err.message);
        throw new Error('Failed to update workflow status');
    }

    broadcast({ type: 'workflow:update', data: { id: workflowId, status: 'running', workspace_id: workspaceId } }, workspaceId);

    // Execute steps sequentially
    (async () => {
        let previousOutput = '';
        console.log(`[Workflow ${workflowId}] Starting orchestration with ${steps.length} steps...`);

        for (let i = 0; i < steps.length; i++) {
            const step = steps[i];
            try {
                db.prepare(`UPDATE workflows SET current_step = ?, updated_at = datetime('now') WHERE id = ?`).run(i, workflowId);
                broadcast({ type: 'workflow:update', data: { id: workflowId, current_step: i, workspace_id: workspaceId } }, workspaceId);

                const enrichedInput = previousOutput
                    ? `${step.input || step.description || ''}\n\nContext from previous step:\n${previousOutput}`
                    : (step.input || step.description || '');

                const result = await launchTask({
                    title: `${workflow.name} — Step ${i + 1}: ${step.title || step.description || 'Action Processor'}`,
                    description: step.description || '',
                    input: enrichedInput,
                    agentId: step.agentId || null,
                    priority: 'high',
                    workspaceId
                });

                // Wait for the task to complete
                if (runningTasks.has(result.id)) {
                    await runningTasks.get(result.id);
                }

                const completedTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(result.id);
                if (completedTask?.status === 'failed' || completedTask?.status === 'cancelled') {
                    throw new Error(`Step ${i + 1} failed: ${completedTask.error || 'Unknown error'}`);
                }

                if (completedTask?.status === 'awaiting_approval' || completedTask?.status === 'waiting_for_approval') {
                    db.prepare(`UPDATE workflows SET status = 'paused', updated_at = datetime('now') WHERE id = ?`).run(workflowId);
                    broadcast({ type: 'workflow:update', data: { id: workflowId, status: 'paused', pausedAtStep: i, workspace_id: workspaceId } }, workspaceId);
                    console.log(`[Workflow ${workflowId}] Paused for human oversight at step ${i + 1}`);
                    return;
                }

                previousOutput = completedTask?.output || '';
            } catch (error) {
                console.error(`[Workflow ${workflowId}] Orchestration error at step ${i + 1}:`, error.message);
                db.prepare(`UPDATE workflows SET status = 'failed', updated_at = datetime('now') WHERE id = ?`).run(workflowId);
                broadcast({ type: 'workflow:update', data: { id: workflowId, status: 'failed', error: error.message, workspace_id: workspaceId } }, workspaceId);
                return;
            }
        }

        db.prepare(`UPDATE workflows SET status = 'completed', updated_at = datetime('now') WHERE id = ?`).run(workflowId);
        broadcast({ type: 'workflow:update', data: { id: workflowId, status: 'completed', workspace_id: workspaceId } }, workspaceId);
        console.log(`[Workflow ${workflowId}] Successfully completed all orchestrated stages.`);
    })();

    return { id: workflowId, status: 'running' };
}

export function getRunningTaskCount() {
    return runningTasks.size;
}
