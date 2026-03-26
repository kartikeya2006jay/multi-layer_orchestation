import { getDb } from '../db/connection.js';
import { getRunningTaskCount } from '../services/orchestrator.js';
import { getConnectedClients } from '../services/websocket.js';
import { isConfigured } from '../services/openai.js';

export default async function dashboardRoutes(fastify) {
    fastify.get('/api/dashboard/stats', async () => {
        const db = getDb();

        const totalAgents = db.prepare('SELECT COUNT(*) as count FROM agents').get().count;
        const activeAgents = db.prepare("SELECT COUNT(*) as count FROM agents WHERE status = 'running'").get().count;
        const idleAgents = db.prepare("SELECT COUNT(*) as count FROM agents WHERE status = 'idle'").get().count;
        const errorAgents = db.prepare("SELECT COUNT(*) as count FROM agents WHERE status = 'error'").get().count;

        const totalTasks = db.prepare('SELECT COUNT(*) as count FROM tasks').get().count;
        const pendingTasks = db.prepare("SELECT COUNT(*) as count FROM tasks WHERE status = 'pending'").get().count;
        const runningTasks = db.prepare("SELECT COUNT(*) as count FROM tasks WHERE status = 'running'").get().count;
        const completedTasks = db.prepare("SELECT COUNT(*) as count FROM tasks WHERE status = 'completed'").get().count;
        const failedTasks = db.prepare("SELECT COUNT(*) as count FROM tasks WHERE status = 'failed'").get().count;
        const awaitingApproval = db.prepare("SELECT COUNT(*) as count FROM tasks WHERE status = 'awaiting_approval'").get().count;

        const totalWorkflows = db.prepare('SELECT COUNT(*) as count FROM workflows').get().count;
        const runningWorkflows = db.prepare("SELECT COUNT(*) as count FROM workflows WHERE status = 'running'").get().count;

        const pendingOversight = db.prepare("SELECT COUNT(*) as count FROM oversight_queue WHERE status = 'pending'").get().count;

        const recentTasks = db.prepare(`
      SELECT t.id, t.title, t.status, t.progress, t.confidence, t.created_at, a.name as agent_name
      FROM tasks t LEFT JOIN agents a ON t.agent_id = a.id
      ORDER BY t.created_at DESC LIMIT 10
    `).all();

        const recentAgents = db.prepare(`SELECT id, name, status, updated_at FROM agents ORDER BY updated_at DESC LIMIT 5`).all();

        const avgConfidence = db.prepare("SELECT AVG(confidence) as avg FROM tasks WHERE status = 'completed' AND confidence > 0").get();

        return {
            agents: { total: totalAgents, active: activeAgents, idle: idleAgents, error: errorAgents },
            tasks: { total: totalTasks, pending: pendingTasks, running: runningTasks, completed: completedTasks, failed: failedTasks, awaitingApproval },
            workflows: { total: totalWorkflows, running: runningWorkflows },
            oversight: { pending: pendingOversight },
            system: {
                connectedClients: getConnectedClients(),
                runningProcesses: getRunningTaskCount(),
                openaiConfigured: isConfigured(),
                avgConfidence: avgConfidence?.avg || 0,
            },
            recentTasks,
            recentAgents,
        };
    });
}
