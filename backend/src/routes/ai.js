import { getOpenAIClient } from '../services/openai.js';

export default async function aiRoutes(fastify) {
    fastify.post('/api/ai/suggest-input', { preHandler: [fastify.authenticate] }, async (request, reply) => {
        const { title, context } = request.body;

        if (!title) {
            return reply.status(400).send({ error: 'Title is required for recommendation' });
        }

        try {
            const workspaceId = request.user.workspace_id;
            const openai = getOpenAIClient(workspaceId);
            const prompt = `You are an expert AI orchestrator. Given the task title "${title}" ${context ? `and context "${context}"` : ''}, generate a detailed, professional, and actionable instruction prompt for an AI agent to execute this task perfectly. The prompt should be concise but comprehensive. Just return the prompt text, no headers or conversational filler.`;

            const response = await openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 300,
            });

            const suggestion = response.choices[0].message.content.trim();
            return { suggestion };
        } catch (err) {
            fastify.log.error(err);
            return { suggestion: `Execute the task: ${title}. Ensure high quality and accuracy.` };
        }
    });
}
