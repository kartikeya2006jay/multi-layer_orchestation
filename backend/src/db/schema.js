import { getDb } from './connection.js';

export function initializeSchema() {
    const db = getDb();

    db.exec(`
    CREATE TABLE IF NOT EXISTS agents (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      system_prompt TEXT DEFAULT 'You are a helpful AI assistant.',
      model TEXT DEFAULT 'gpt-4o-mini',
      status TEXT DEFAULT 'idle' CHECK(status IN ('idle', 'running', 'paused', 'error')),
      capabilities TEXT DEFAULT '[]',
      max_tokens INTEGER DEFAULT 4096,
      temperature REAL DEFAULT 0.7,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      agent_id TEXT,
      workflow_id TEXT,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'running', 'completed', 'failed', 'cancelled', 'awaiting_approval')),
      priority TEXT DEFAULT 'medium' CHECK(priority IN ('low', 'medium', 'high', 'critical')),
      input TEXT DEFAULT '',
      output TEXT DEFAULT '',
      error TEXT DEFAULT '',
      confidence REAL DEFAULT 0,
      progress INTEGER DEFAULT 0,
      started_at TEXT,
      completed_at TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS workflows (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      steps TEXT DEFAULT '[]',
      status TEXT DEFAULT 'draft' CHECK(status IN ('draft', 'running', 'completed', 'failed', 'paused')),
      current_step INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS oversight_queue (
      id TEXT PRIMARY KEY,
      task_id TEXT NOT NULL,
      agent_id TEXT,
      type TEXT DEFAULT 'approval' CHECK(type IN ('approval', 'review', 'intervention')),
      reason TEXT DEFAULT '',
      context TEXT DEFAULT '{}',
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
      reviewer_notes TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now')),
      resolved_at TEXT,
      FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
      FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS task_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task_id TEXT NOT NULL,
      level TEXT DEFAULT 'info' CHECK(level IN ('info', 'warn', 'error', 'debug')),
      message TEXT NOT NULL,
      metadata TEXT DEFAULT '{}',
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT DEFAULT (datetime('now'))
    );
  `);

    // Seed default settings
    const insertSetting = db.prepare(
        `INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)`
    );
    insertSetting.run('max_concurrent_agents', process.env.MAX_CONCURRENT_AGENTS || '5');
    insertSetting.run('oversight_threshold', process.env.OVERSIGHT_CONFIDENCE_THRESHOLD || '0.7');
    insertSetting.run('default_model', process.env.OPENAI_MODEL || 'gpt-4o-mini');

    console.log('✅ Database schema initialized');
}
