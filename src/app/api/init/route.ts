import { NextResponse } from 'next/server';
import { initDb } from '@/lib/db';

export async function GET() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    return NextResponse.json({ ok: false, error: 'DATABASE_URL is not set' }, { status: 500 });
  }
  try {
    await initDb();
    return NextResponse.json({ ok: true, db: dbUrl.slice(0, 30) + '...' });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

export async function POST() {
  try {
    await initDb();
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
