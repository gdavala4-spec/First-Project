import 'server-only';
import { Pool } from 'pg';
import { getSdk } from './recursiv';

const PROJECT_ID = process.env.RECURSIV_PROJECT_ID;
const DB_NAME = 'crm-db';

// Persist pool across Next.js hot reloads in development
const g = global as unknown as { __pgPool?: Pool };
let _pending: Promise<Pool> | null = null;

async function buildPool(): Promise<Pool> {
  if (!PROJECT_ID) throw new Error('RECURSIV_PROJECT_ID env var is not set.');

  const r = getSdk();
  await r.databases.ensure({ project_id: PROJECT_ID, name: DB_NAME });
  const { data: creds } = await r.databases.getCredentials({ project_id: PROJECT_ID, name: DB_NAME });

  const pool = new Pool({ connectionString: creds.connection_string });
  await migrate(pool);
  return pool;
}

function getPool(): Promise<Pool> {
  if (g.__pgPool) return Promise.resolve(g.__pgPool);
  if (!_pending) {
    _pending = buildPool().then((p) => {
      g.__pgPool = p;
      return p;
    });
  }
  return _pending;
}

export async function query<T = Record<string, unknown>>(
  sql: string,
  params: unknown[] = []
): Promise<T[]> {
  const pool = await getPool();
  const result = await pool.query(sql, params.length ? params : undefined);
  return result.rows as T[];
}

export async function queryOne<T = Record<string, unknown>>(
  sql: string,
  params: unknown[] = []
): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows[0] ?? null;
}

async function migrate(pool: Pool): Promise<void> {
  const stmts = [
    `CREATE TABLE IF NOT EXISTS deals (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      company TEXT,
      stage TEXT NOT NULL DEFAULT 'prospecting',
      sector TEXT,
      description TEXT,
      deal_size NUMERIC,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS cims (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
      filename TEXT NOT NULL,
      storage_key TEXT,
      extracted_text TEXT,
      ai_summary TEXT,
      ai_context JSONB DEFAULT '{}',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS theses (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title TEXT NOT NULL,
      sector TEXT,
      hypothesis TEXT,
      criteria TEXT,
      risks TEXT,
      content TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS notes (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
      thesis_id UUID REFERENCES theses(id) ON DELETE SET NULL,
      content TEXT NOT NULL,
      ai_context JSONB DEFAULT '{}',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS calls (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
      title TEXT NOT NULL,
      transcript TEXT,
      ai_summary TEXT,
      ai_action_items TEXT,
      ai_sentiment TEXT,
      duration_seconds INTEGER,
      recorded_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS thesis_deals (
      thesis_id UUID REFERENCES theses(id) ON DELETE CASCADE,
      deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
      ai_suggested BOOLEAN DEFAULT false,
      confidence NUMERIC DEFAULT 0,
      PRIMARY KEY (thesis_id, deal_id)
    )`,
    `CREATE TABLE IF NOT EXISTS context_links (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      source_type TEXT NOT NULL,
      source_id UUID NOT NULL,
      deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
      confidence NUMERIC DEFAULT 0,
      reason TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`,
  ];
  for (const sql of stmts) {
    await pool.query(sql);
  }
}
