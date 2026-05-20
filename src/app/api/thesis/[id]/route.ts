import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import type { Thesis, Deal, Note } from '@/lib/types';

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const thesis = await queryOne<Thesis>('SELECT * FROM theses WHERE id = $1', [id]);
  if (!thesis) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const [linkedDeals, notes] = await Promise.all([
    query<Deal & { ai_suggested: boolean; confidence: number }>(
      `SELECT d.*, td.ai_suggested, td.confidence
       FROM deals d JOIN thesis_deals td ON d.id = td.deal_id
       WHERE td.thesis_id = $1`,
      [id]
    ),
    query<Note>(
      'SELECT * FROM notes WHERE thesis_id = $1 ORDER BY created_at DESC',
      [id]
    ),
  ]);

  return NextResponse.json({ thesis, linkedDeals, notes });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { title, sector, hypothesis, criteria, risks, content } = await req.json();
  const [thesis] = await query<Thesis>(
    `UPDATE theses
     SET title=$1, sector=$2, hypothesis=$3, criteria=$4, risks=$5, content=$6, updated_at=NOW()
     WHERE id=$7 RETURNING *`,
    [title, sector ?? null, hypothesis ?? null, criteria ?? null, risks ?? null, content ?? null, id]
  );
  return NextResponse.json(thesis);
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await query('DELETE FROM theses WHERE id = $1', [id]);
  return NextResponse.json({ ok: true });
}
