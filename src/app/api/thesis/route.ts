import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import type { Thesis } from '@/lib/types';

export async function GET() {
  const theses = await query<Thesis>('SELECT * FROM theses ORDER BY updated_at DESC');
  return NextResponse.json(theses);
}

export async function POST(req: NextRequest) {
  const { title, sector, hypothesis, criteria, risks, content } = await req.json();
  const [thesis] = await query<Thesis>(
    `INSERT INTO theses (title, sector, hypothesis, criteria, risks, content)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [title, sector ?? null, hypothesis ?? null, criteria ?? null, risks ?? null, content ?? null]
  );
  return NextResponse.json(thesis, { status: 201 });
}
