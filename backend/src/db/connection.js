import initSqlJs from 'sql.js';
import path from 'path';
import fs from 'fs';

let db = null;
let SQL = null;
let saveTimeout = null;
const SAVE_DEBOUNCE_MS = 100;

// Helper class to wrap sql.js prepared statements with better-sqlite3 compatible API
class PreparedStatement {
  constructor(database, sql) {
    this.db = database;
    this.sql = sql;
  }

  bind(params = []) {
    this.params = params;
    return this;
  }

  get(...params) {
    const fullParams = params.length > 0 ? params : (this.params || []);
    try {
      const stmt = this.db.prepare(this.sql);
      if (fullParams.length > 0) {
        stmt.bind(fullParams);
      }
      const result = stmt.step() ? stmt.getAsObject() : null;
      stmt.free();
      return result;
    } catch (err) {
      console.error('SQL Error in get():', this.sql, fullParams, err.message);
      return null;
    }
  }

  all(...params) {
    const fullParams = params.length > 0 ? params : (this.params || []);
    try {
      const results = [];
      const stmt = this.db.prepare(this.sql);
      if (fullParams.length > 0) {
        stmt.bind(fullParams);
      }
      while (stmt.step()) {
        results.push(stmt.getAsObject());
      }
      stmt.free();
      return results;
    } catch (err) {
      console.error('SQL Error in all():', this.sql, fullParams, err.message);
      return [];
    }
  }

  run(...params) {
    const fullParams = params.length > 0 ? params : (this.params || []);
    try {
      const stmt = this.db.prepare(this.sql);
      if (fullParams.length > 0) {
        stmt.bind(fullParams);
      }
      stmt.step();
      stmt.free();
      // Auto-save after write operations with debounce
      if (saveTimeout) clearTimeout(saveTimeout);
      saveTimeout = setTimeout(saveDb, SAVE_DEBOUNCE_MS);
      return { changes: 1 };
    } catch (err) {
      console.error('SQL Error in run():', this.sql, fullParams, err.message);
      return { changes: 0 };
    }
  }
}

// Wrapper for sql.js database to provide better-sqlite3 compatibility
class DatabaseWrapper {
  constructor(sqliteDb) {
    this.db = sqliteDb;
  }

  prepare(sql) {
    return new PreparedStatement(this.db, sql);
  }

  transaction(fn) {
    return (...args) => {
      try {
        // Execute BEGIN TRANSACTION
        const beginStmt = this.db.prepare('BEGIN TRANSACTION');
        beginStmt.step();
        beginStmt.free();

        // Execute the transaction function
        const result = fn.apply(this, args);

        // Execute COMMIT
        const commitStmt = this.db.prepare('COMMIT');
        commitStmt.step();
        commitStmt.free();

        saveDb();
        return result;
      } catch (err) {
        try {
          const rollbackStmt = this.db.prepare('ROLLBACK');
          rollbackStmt.step();
          rollbackStmt.free();
        } catch (e) {
          // Ignore rollback errors
        }
        console.error('Transaction error:', err.message);
        throw err;
      }
    };
  }

  exec(sql) {
    try {
      // Split by semicolon and execute each statement
      const statements = sql.split(';').filter(s => s.trim());
      for (const stmt of statements) {
        if (stmt.trim()) {
          const s = this.db.prepare(stmt);
          while (s.step()) {
            // Just execute
          }
          s.free();
        }
      }
      saveDb();
    } catch (err) {
      console.error('SQL Error in exec():', err.message);
    }
  }

  close() {
    if (this.db) {
      this.db.close();
    }
  }

  run(sql) {
    try {
      const statements = sql.split(';').filter(s => s.trim());
      for (const stmt of statements) {
        if (stmt.trim()) {
          const s = this.db.prepare(stmt);
          while (s.step()) {
            // Just execute
          }
          s.free();
        }
      }
      saveDb();
    } catch (err) {
      console.error('SQL Error in run():', err.message);
    }
  }

  export() {
    return this.db.export();
  }
}

export async function getDb() {
  if (db) return db;

  if (!SQL) {
    SQL = await initSqlJs();
  }

  const dbPath = process.env.DATABASE_PATH || './data/agents.db';
  const dir = path.dirname(dbPath);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  try {
    const buffer = fs.readFileSync(dbPath);
    db = new DatabaseWrapper(new SQL.Database(buffer));
  } catch (err) {
    db = new DatabaseWrapper(new SQL.Database());
  }

  return db;
}

export function saveDb() {
  if (db && db.db) {
    try {
      const data = db.export();
      const dbPath = process.env.DATABASE_PATH || './data/agents.db';
      const dir = path.dirname(dbPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(dbPath, Buffer.from(data));
    } catch (err) {
      console.error('Failed to save database:', err.message);
    }
  }
}

export function closeDb() {
  if (db) {
    saveDb();
    if (db.db) {
      db.close();
    }
    db = null;
  }
}
