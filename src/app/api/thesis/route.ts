import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import type { Thesis } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const theses = await query<Thesis>(
      'SELECT * FROM theses ORDER BY created_at DESC'
    );
    return NextResponse.json(theses);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, sector, hypothesis, criteria, risks } = body;

    if (!title) {
      return NextResponse.json({ error: 'title is required' }, { status: 400 });
    }

    const theses = await query<Thesis>(
      `INSERT INTO theses (title, sector, hypothesis, criteria, risks)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [title, sector ?? null, hypothesis ?? null, criteria ?? null, risks ?? null]
    );

    return NextResponse.json(theses[0], { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
