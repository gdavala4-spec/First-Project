import 'server-only';
import Database, { type Database as DB } from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const g = global as unknown as { __db?: DB };

function getDb(): DB {
  if (g.__db) return g.__db;

  const dir = path.join(process.cwd(), '.data');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const db = new Database(path.join(dir, 'crm.db'));
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  migrate(db);

  g.__db = db;
  return db;
}

// Convert Postgres $1,$2 params to SQLite ?, expanding the params array
// to handle repeated references like "WHERE a = $1 OR b = $1"
function pg2sqlite(sql: string, params: unknown[]): { sql: string; params: unknown[] } {
  const expanded: unknown[] = [];
  const converted = sql.replace(/\$(\d+)/g, (_, n) => {
    expanded.push(params[parseInt(n) - 1]);
    return '?';
  });
  return { sql: converted, params: expanded };
}

export async function query<T = Record<string, unknown>>(
  sql: string,
  params: unknown[] = []
): Promise<T[]> {
  const db = getDb();
  const { sql: converted, params: expanded } = pg2sqlite(sql, params);
  const stmt = db.prepare(converted);
  const upper = sql.trimStart().toUpperCase();
  if (upper.startsWith('SELECT') || upper.includes('RETURNING')) {
    return stmt.all(...expanded) as T[];
  }
  stmt.run(...expanded);
  return [];
}

export async function queryOne<T = Record<string, unknown>>(
  sql: string,
  params: unknown[] = []
): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows[0] ?? null;
}

function migrate(db: DB): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS deals (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      name TEXT NOT NULL,
      company TEXT,
      stage TEXT NOT NULL DEFAULT 'prospecting',
      sector TEXT,
      description TEXT,
      deal_size REAL,
      created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')),
      updated_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
    );

    CREATE TABLE IF NOT EXISTS cims (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      deal_id TEXT REFERENCES deals(id) ON DELETE SET NULL,
      filename TEXT NOT NULL,
      storage_key TEXT,
      extracted_text TEXT,
      ai_summary TEXT,
      ai_context TEXT NOT NULL DEFAULT '{}',
      created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
    );

    CREATE TABLE IF NOT EXISTS theses (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      title TEXT NOT NULL,
      sector TEXT,
      hypothesis TEXT,
      criteria TEXT,
      risks TEXT,
      content TEXT,
      created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')),
      updated_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
    );

    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      deal_id TEXT REFERENCES deals(id) ON DELETE SET NULL,
      thesis_id TEXT REFERENCES theses(id) ON DELETE SET NULL,
      content TEXT NOT NULL,
      ai_context TEXT NOT NULL DEFAULT '{}',
      created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')),
      updated_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
    );

    CREATE TABLE IF NOT EXISTS calls (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      deal_id TEXT REFERENCES deals(id) ON DELETE SET NULL,
      title TEXT NOT NULL,
      transcript TEXT,
      ai_summary TEXT,
      ai_action_items TEXT,
      ai_sentiment TEXT,
      duration_seconds INTEGER,
      recorded_at TEXT,
      created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
    );

    CREATE TABLE IF NOT EXISTS thesis_deals (
      thesis_id TEXT REFERENCES theses(id) ON DELETE CASCADE,
      deal_id TEXT REFERENCES deals(id) ON DELETE CASCADE,
      ai_suggested INTEGER DEFAULT 0,
      confidence REAL DEFAULT 0,
      PRIMARY KEY (thesis_id, deal_id)
    );

    CREATE TABLE IF NOT EXISTS context_links (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      source_type TEXT NOT NULL,
      source_id TEXT NOT NULL,
      deal_id TEXT REFERENCES deals(id) ON DELETE CASCADE,
      confidence REAL DEFAULT 0,
      reason TEXT,
      created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
    );
  `);
}
