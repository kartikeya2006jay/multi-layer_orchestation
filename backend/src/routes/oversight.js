import { getDb } from '../db/connection.js';
import { broadcast } from '../services/websocket.js';

export default async function oversightRoutes(fastify) {
    // GET oversight queue
    fastify.get('/api/oversight/queue', async (request) => {
        const db = getDb();
        const status = request.query.status || 'pending';

        const items = db.prepare(`
      SELECT oq.*, t.title as task_title, t.description as task_description, t.input as task_input, t.output as task_output,
             a.name as agent_name
      FROM oversight_queue oq
      LEFT JOIN tasks t ON oq.task_id = t.id
      LEFT JOIN agents a ON oq.agent_id = a.id
      WHERE oq.status = ?
      ORDER BY oq.created_at DESC
    `).all(status);

        return items.map(item => ({
            ...item,
            context: JSON.parse(item.context || '{}'),
        }));
    });

    // POST approve oversight item
    fastify.post('/api/oversight/:id/approve', async (request, reply) => {
        const db = getDb();
        const item = db.prepare('SELECT * FROM oversight_queue WHERE id = ?').get(request.params.id);
        if (!item) return reply.code(404).send({ error: 'Oversight item not found' });
        if (item.status !== 'pending') return reply.code(400).send({ error: 'Item already resolved' });

        const { notes } = request.body || {};

        db.prepare(`
      UPDATE oversight_queue SET status = 'approved', reviewer_notes = ?, resolved_at = datetime('now')
      WHERE id = ?
    `).run(notes || '', request.params.id);

        // Complete the associated task
        db.prepare(`
      UPDATE tasks SET status = 'completed', progress = 100, completed_at = datetime('now'), updated_at = datetime('now')
      WHERE id = ?
    `).run(item.task_id);

        // Add log
        db.prepare('INSERT INTO task_logs (task_id, level, message) VALUES (?, ?, ?)').run(
            item.task_id, 'info', `Approved by human reviewer${notes ? ': ' + notes : ''}`
        );

        broadcast({ type: 'oversight:resolved', data: { id: request.params.id, status: 'approved' } });
        broadcast({ type: 'task:update', data: { id: item.task_id, status: 'completed', progress: 100 } });

        return { success: true, id: request.params.id, status: 'approved' };
    });

    // POST reject oversight item
    fastify.post('/api/oversight/:id/reject', async (request, reply) => {
        const db = getDb();
        const item = db.prepare('SELECT * FROM oversight_queue WHERE id = ?').get(request.params.id);
        if (!item) return reply.code(404).send({ error: 'Oversight item not found' });
        if (item.status !== 'pending') return reply.code(400).send({ error: 'Item already resolved' });

        const { notes } = request.body || {};

        db.prepare(`
      UPDATE oversight_queue SET status = 'rejected', reviewer_notes = ?, resolved_at = datetime('now')
      WHERE id = ?
    `).run(notes || '', request.params.id);

        // Fail the associated task
        db.prepare(`
      UPDATE tasks SET status = 'failed', error = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(`Rejected by reviewer${notes ? ': ' + notes : ''}`, item.task_id);

        db.prepare('INSERT INTO task_logs (task_id, level, message) VALUES (?, ?, ?)').run(
            item.task_id, 'error', `Rejected by human reviewer${notes ? ': ' + notes : ''}`
        );

        if (item.agent_id) {
            db.prepare(`UPDATE agents SET status = 'idle', updated_at = datetime('now') WHERE id = ?`).run(item.agent_id);
        }

        broadcast({ type: 'oversight:resolved', data: { id: request.params.id, status: 'rejected' } });
        broadcast({ type: 'task:update', data: { id: item.task_id, status: 'failed' } });

        return { success: true, id: request.params.id, status: 'rejected' };
    });
}
