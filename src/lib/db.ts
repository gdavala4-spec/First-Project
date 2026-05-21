import 'server-only';
import { getSdk } from './recursiv';

const PROJECT_ID = process.env.RECURSIV_PROJECT_ID;
const DB_NAME = 'crm-db';

if (!PROJECT_ID) {
  // eslint-disable-next-line no-console
  console.warn('[db] RECURSIV_PROJECT_ID is not set. Database calls will fail.');
}

let _ensured = false;

async function ensureDb(): Promise<void> {
  if (_ensured) return;
  if (!PROJECT_ID) throw new Error('RECURSIV_PROJECT_ID env var is not set.');
  const r = getSdk();
  await r.databases.ensure({ project_id: PROJECT_ID, name: DB_NAME });
  _ensured = true;
}

export async function query<T = Record<string, unknown>>(
  sql: string,
  params: unknown[] = []
): Promise<T[]> {
  await ensureDb();
  const r = getSdk();
  const { data } = await r.databases.query({
    project_id: PROJECT_ID!,
    database_name: DB_NAME,
    sql,
    params: params.length ? params : undefined,
  });
  return data.rows as T[];
}

export async function queryOne<T = Record<string, unknown>>(
  sql: string,
  params: unknown[] = []
): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows[0] ?? null;
}

export async function initDb(): Promise<void> {
  await ensureDb();
  const statements = [
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
  for (const sql of statements) {
    await query(sql);
  }
}
