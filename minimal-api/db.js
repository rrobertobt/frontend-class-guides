const Database = require("better-sqlite3");

const db = new Database("todo.sqlite");

// Enable foreign keys
db.pragma("foreign_keys = ON");

// Create schema if not exists
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    done INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TRIGGER IF NOT EXISTS todos_updated_at
  AFTER UPDATE ON todos
  BEGIN
    UPDATE todos SET updated_at = datetime('now') WHERE id = NEW.id;
  END;
`);

module.exports = db;
