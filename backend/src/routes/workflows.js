import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../db/connection.js';
import { executeWorkflow } from '../services/orchestrator.js';

export default async function workflowsRoutes(fastify) {
    // GET all workflows
    fastify.get('/api/workflows', async () => {
        const db = getDb();
        const workflows = db.prepare('SELECT * FROM workflows ORDER BY created_at DESC').all();
        return workflows.map(w => ({ ...w, steps: JSON.parse(w.steps || '[]') }));
    });

    // GET single workflow
    fastify.get('/api/workflows/:id', async (request, reply) => {
        const db = getDb();
        const workflow = db.prepare('SELECT * FROM workflows WHERE id = ?').get(request.params.id);
        if (!workflow) return reply.code(404).send({ error: 'Workflow not found' });
        return { ...workflow, steps: JSON.parse(workflow.steps || '[]') };
    });

    // POST create workflow
    fastify.post('/api/workflows', async (request) => {
        const db = getDb();
        const { name, description, steps } = request.body;
        const id = uuidv4();

        db.prepare(`
      INSERT INTO workflows (id, name, description, steps)
      VALUES (?, ?, ?, ?)
    `).run(id, name, description || '', JSON.stringify(steps || []));

        const workflow = db.prepare('SELECT * FROM workflows WHERE id = ?').get(id);
        return { ...workflow, steps: JSON.parse(workflow.steps || '[]') };
    });

    // PUT update workflow
    fastify.put('/api/workflows/:id', async (request, reply) => {
        const db = getDb();
        const workflow = db.prepare('SELECT * FROM workflows WHERE id = ?').get(request.params.id);
        if (!workflow) return reply.code(404).send({ error: 'Workflow not found' });

        const { name, description, steps } = request.body;

        db.prepare(`
      UPDATE workflows SET
        name = COALESCE(?, name),
        description = COALESCE(?, description),
        steps = COALESCE(?, steps),
        updated_at = datetime('now')
      WHERE id = ?
    `).run(name || null, description ?? null, steps ? JSON.stringify(steps) : null, request.params.id);

        const updated = db.prepare('SELECT * FROM workflows WHERE id = ?').get(request.params.id);
        return { ...updated, steps: JSON.parse(updated.steps || '[]') };
    });

    // DELETE workflow
    fastify.delete('/api/workflows/:id', async (request, reply) => {
        const db = getDb();
        const workflow = db.prepare('SELECT * FROM workflows WHERE id = ?').get(request.params.id);
        if (!workflow) return reply.code(404).send({ error: 'Workflow not found' });
        db.prepare('DELETE FROM workflows WHERE id = ?').run(request.params.id);
        return { success: true, id: request.params.id };
    });

    // POST execute workflow
    fastify.post('/api/workflows/:id/execute', async (request, reply) => {
        try {
            const result = await executeWorkflow(request.params.id);
            return { success: true, ...result };
        } catch (error) {
            return reply.code(400).send({ error: error.message });
        }
    });
}
