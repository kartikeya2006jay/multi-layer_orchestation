import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import websocket from '@fastify/websocket';
import { initializeSchema } from './db/schema.js';
import authRoutes from './routes/auth.js';
import billingRoutes from './routes/billing.js';
import agentsRoutes from './routes/agents.js';
import tasksRoutes from './routes/tasks.js';
import workflowsRoutes from './routes/workflows.js';
import oversightRoutes from './routes/oversight.js';
import dashboardRoutes from './routes/dashboard.js';
import settingsRoutes from './routes/settings.js';
import wsRoutes from './routes/ws.js';

const PORT = parseInt(process.env.PORT || '3001');
const HOST = process.env.HOST || '0.0.0.0';

async function start() {
    const fastify = Fastify({
        logger: {
            level: 'info',
        },
    });

    // Register plugins
    await fastify.register(cors, { origin: true });
    await fastify.register(websocket);

    // Initialize database
    initializeSchema();

    // Register routes
    await fastify.register(authRoutes);
    await fastify.register(billingRoutes);
    await fastify.register(agentsRoutes);
    await fastify.register(tasksRoutes);
    await fastify.register(workflowsRoutes);
    await fastify.register(oversightRoutes);
    await fastify.register(dashboardRoutes);
    await fastify.register(settingsRoutes);
    await fastify.register(wsRoutes);

    // Start server
    try {
        await fastify.listen({ port: PORT, host: HOST });
        console.log(`\n🚀 AI Agent Command Center Backend running on http://${HOST}:${PORT}`);
        console.log(`📡 WebSocket available at ws://${HOST}:${PORT}/ws`);
        console.log(`🔑 OpenAI API: ${process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here' ? 'Configured ✅' : 'Not configured ❌'}\n`);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
}

start();
