import { getDb } from './src/db/connection.js';

const db = getDb();
const users = db.prepare('SELECT id, name, email, user_type FROM users').all();
console.log('--- USERS ---');
console.log(JSON.stringify(users, null, 2));

const workspaces = db.prepare('SELECT id, name, owner_id FROM workspaces').all();
console.log('--- WORKSPACES ---');
console.log(JSON.stringify(workspaces, null, 2));
