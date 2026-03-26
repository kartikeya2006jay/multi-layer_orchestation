import { getDb } from '../db/connection.js';
import { isConfigured } from '../services/openai.js';

export default async function settingsRoutes(fastify) {
    // GET all settings
    fastify.get('/api/settings', async () => {
        const db = getDb();
        const rows = db.prepare('SELECT * FROM settings ORDER BY key').all();
        const settings = {};
        for (const row of rows) {
            settings[row.key] = row.value;
        }
        settings.openai_configured = isConfigured();
        return settings;
    });

    // PUT update settings
    fastify.put('/api/settings', async (request) => {
        const db = getDb();
        const updates = request.body;

        const upsert = db.prepare(`
      INSERT INTO settings (key, value, updated_at) VALUES (?, ?, datetime('now'))
      ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
    `);

        const updateMany = db.transaction((entries) => {
            for (const [key, value] of entries) {
                upsert.run(key, String(value));
            }
        });

        updateMany(Object.entries(updates));

        const rows = db.prepare('SELECT * FROM settings ORDER BY key').all();
        const settings = {};
        for (const row of rows) {
            settings[row.key] = row.value;
        }
        return settings;
    });

    // GET health check
    fastify.get('/api/health', async () => {
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
            openai: isConfigured() ? 'configured' : 'not_configured',
        };
    });
}
