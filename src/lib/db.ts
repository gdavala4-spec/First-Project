import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 10,
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
});

export async function query<T>(sql: string, params: unknown[] = []): Promise<T[]> {
  const client = await pool.connect();
  try {
    const result = await client.query(sql, params);
    return result.rows as T[];
  } finally {
    client.release();
  }
}

export async function queryOne<T>(sql: string, params: unknown[] = []): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows[0] ?? null;
}

export async function initDb(): Promise<void> {
  await query(`
    CREATE TABLE IF NOT EXISTS deals (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      company TEXT NOT NULL,
      stage TEXT NOT NULL DEFAULT 'prospecting',
      deal_size NUMERIC,
      sector TEXT,
      description TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS cims (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
      filename TEXT NOT NULL,
      extracted_text TEXT,
      ai_summary TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS theses (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title TEXT NOT NULL,
      sector TEXT,
      hypothesis TEXT,
      criteria TEXT,
      risks TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS notes (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS calls (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
      title TEXT NOT NULL,
      transcript TEXT,
      summary TEXT,
      action_items TEXT,
      sentiment TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS thesis_deals (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      thesis_id UUID NOT NULL REFERENCES theses(id) ON DELETE CASCADE,
      deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(thesis_id, deal_id)
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS context_links (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      source_type TEXT NOT NULL,
      source_id UUID NOT NULL,
      target_type TEXT NOT NULL,
      target_id UUID NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}
