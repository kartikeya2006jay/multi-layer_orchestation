export default async function authRoutes(fastify) {
    // Signup Flow: User -> Signup Page -> Enter Details -> Verify Email -> Create Workspace
    fastify.post('/auth/signup', async (request, reply) => {
        const { name, email, password } = request.body;
        // 1. Hash password (bcrypt)
        // 2. Store in DB (users table)
        // 3. Send verification email
        return { message: 'Signup successful. Please verify your email.', email };
    });

    fastify.get('/auth/verify-email', async (request, reply) => {
        // 1. Verify token
        // 2. Create workspace (tenant)
        // 3. Assign user as owner
        return { message: 'Email verified. Workspace created.' };
    });

    // Login Flow: Login -> Validate -> JWT Token -> Access Dashboard
    fastify.post('/auth/login', async (request, reply) => {
        const { email, password } = request.body;
        // 1. Validate user
        // 2. Generate JWT
        return { token: 'mock-jwt-token', user: { email, name: 'User' } };
    });

    fastify.post('/auth/logout', async (request, reply) => {
        return { message: 'Logged out' };
    });

    fastify.get('/auth/me', async (request, reply) => {
        return { user: { id: '1', name: 'Admin', role: 'owner' } };
    });
}
