import { getDb } from './src/db/connection.js';

const db = getDb();
console.log('UPDATING USERS TO ADMIN...');
db.prepare("UPDATE users SET user_type = 'admin', status = 'active'").run();
db.prepare("UPDATE workspace_members SET role = 'owner'").run();

const users = db.prepare('SELECT id, name, email, user_type, status FROM users').all();
console.log('--- UPDATED USERS ---');
console.log(users);
console.log('---------------------');
process.exit(0);
