import { getDb } from '../db/connection.js';

// Middleware: only admins can call these routes
function adminOnly(fastify) {
    return async (request, reply) => {
        await request.jwtVerify();
        if (request.user.user_type !== 'admin') {
            reply.code(403).send({ error: 'Admin access required' });
        }
    };
}

export default async function adminRoutes(fastify) {
    const db = await getDb();

    // ─── Get members of the admin workspace (all employees under owner) ──
    fastify.get('/api/admin/workspace-members', { preHandler: [adminOnly(fastify)] }, async (request) => {
        const members = db.prepare(`
            SELECT u.id, u.name, u.email, u.user_type, u.status, wm.role, wm.joined_at,
                   COUNT(DISTINCT t.id) as task_count
            FROM workspace_members wm
            JOIN users u ON u.id = wm.user_id
            JOIN workspaces w ON w.id = wm.workspace_id
            LEFT JOIN workspace_members wm2 ON wm2.workspace_id = wm.workspace_id AND wm2.user_id = wm.user_id
            LEFT JOIN tasks t ON t.workspace_id = wm.workspace_id AND t.workspace_id != w.id
            WHERE w.owner_id = request.user.id
               OR u.user_type = 'employee'
            GROUP BY u.id
            ORDER BY wm.joined_at DESC
        `).all();

        // Simpler approach: get all employees with their info
        const employees = db.prepare(`
            SELECT u.id, u.name, u.email, u.user_type, u.status, u.created_at,
                   COUNT(DISTINCT t.id) as task_count,
                   COUNT(DISTINCT CASE WHEN t.status = 'completed' THEN t.id END) as completed_tasks,
                   MAX(ual.created_at) as last_active
            FROM users u
            LEFT JOIN workspace_members wm ON wm.user_id = u.id
            LEFT JOIN tasks t ON t.workspace_id = wm.workspace_id
            LEFT JOIN user_activity_log ual ON ual.user_id = u.id
            WHERE u.user_type = 'employee'
            GROUP BY u.id
            ORDER BY u.created_at DESC
        `).all();

        return { members: employees };
    });

    // ─── Get activity log (all employees) ────────────────────────────
    fastify.get('/api/admin/activity', { preHandler: [adminOnly(fastify)] }, async (request) => {
        const { limit = 50, user_id } = request.query;

        let query = 'SELECT * FROM user_activity_log';
        const params = [];
        if (user_id) {
            query += ' WHERE user_id = ?';
            params.push(user_id);
        }
        query += ' ORDER BY created_at DESC LIMIT ?';
        params.push(parseInt(limit));

        const logs = db.prepare(query).all(...params);
        return { logs };
    });

    // ─── Get admin dashboard summary ─────────────────────────────────
    fastify.get('/api/admin/summary', { preHandler: [adminOnly(fastify)] }, async (request) => {
        const totalEmployees = db.prepare("SELECT COUNT(*) as count FROM users WHERE user_type = 'employee'").get().count;
        const activeEmployees = db.prepare("SELECT COUNT(*) as count FROM users WHERE user_type = 'employee' AND status = 'active'").get().count;

        const totalWorkspaces = db.prepare("SELECT COUNT(*) as count FROM workspaces").get().count;

        const totalTasksAllUsers = db.prepare(`
            SELECT COUNT(*) as count FROM tasks t
            JOIN workspace_members wm ON wm.workspace_id = t.workspace_id
            JOIN users u ON u.id = wm.user_id
            WHERE u.user_type = 'employee'
        `).get().count;

        const completedTasksAllUsers = db.prepare(`
            SELECT COUNT(*) as count FROM tasks t
            JOIN workspace_members wm ON wm.workspace_id = t.workspace_id
            JOIN users u ON u.id = wm.user_id
            WHERE u.user_type = 'employee' AND t.status = 'completed'
        `).get().count;

        const recentActivity = db.prepare(`
            SELECT * FROM user_activity_log ORDER BY created_at DESC LIMIT 20
        `).all();

        // Most active employees
        const topEmployees = db.prepare(`
            SELECT u.id, u.name, u.email, COUNT(ual.id) as activity_count
            FROM users u
            LEFT JOIN user_activity_log ual ON ual.user_id = u.id
            WHERE u.user_type = 'employee'
            GROUP BY u.id
            ORDER BY activity_count DESC
            LIMIT 5
        `).all();

        // Tasks per employee
        const tasksByEmployee = db.prepare(`
            SELECT u.name, u.email,
                   COUNT(DISTINCT t.id) as total,
                   COUNT(DISTINCT CASE WHEN t.status = 'completed' THEN t.id END) as completed,
                   COUNT(DISTINCT CASE WHEN t.status = 'running' THEN t.id END) as running,
                   COUNT(DISTINCT CASE WHEN t.status = 'failed' THEN t.id END) as failed
            FROM users u
            LEFT JOIN workspace_members wm ON wm.user_id = u.id
            LEFT JOIN tasks t ON t.workspace_id = wm.workspace_id
            WHERE u.user_type = 'employee'
            GROUP BY u.id
            ORDER BY total DESC
            LIMIT 10
        `).all();

        return {
            overview: {
                totalEmployees,
                activeEmployees,
                totalWorkspaces,
                totalTasksAllUsers,
                completedTasksAllUsers,
            },
            recentActivity,
            topEmployees,
            tasksByEmployee,
        };
    });

    // ─── Update employee status (Grant permission / Suspend) ────────
    fastify.post('/api/admin/update-user', { preHandler: [adminOnly(fastify)] }, async (request, reply) => {
        const { userId, status } = request.body;

        if (!userId || !['active', 'suspended', 'pending'].includes(status)) {
            return reply.code(400).send({ error: 'Invalid user ID or status' });
        }

        const employee = db.prepare('SELECT name, user_type FROM users WHERE id = ?').get(userId);
        if (!employee || employee.user_type === 'admin') {
            return reply.code(403).send({ error: 'Cannot modify this user' });
        }

        db.prepare('UPDATE users SET status = ?, updated_at = datetime(\'now\') WHERE id = ?').run(status, userId);

        // Import logActivity dynamically or pass it via context if needed, 
        // but since we are in a route file, we can log directly or using the helper if matched.
        // For now, simple log is enough.
        console.log(`[ADMIN] User ${userId} status updated to ${status}`);

        return { success: true, status };
    });
}
