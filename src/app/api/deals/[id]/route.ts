import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import type { Deal, CIM, Note, ContextLink, CallRecord } from '@/lib/types';

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const deal = await queryOne<Deal>('SELECT * FROM deals WHERE id = $1', [id]);
  if (!deal) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const [cims, notes, links, calls] = await Promise.all([
    query<CIM>('SELECT * FROM cims WHERE deal_id = $1 ORDER BY created_at DESC', [id]),
    query<Note>('SELECT * FROM notes WHERE deal_id = $1 ORDER BY created_at DESC', [id]),
    query<ContextLink>('SELECT * FROM context_links WHERE deal_id = $1 ORDER BY confidence DESC', [id]),
    query<CallRecord>('SELECT * FROM calls WHERE deal_id = $1 ORDER BY created_at DESC', [id]),
  ]);

  return NextResponse.json({ deal, cims, notes, links, calls });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { name, company, stage, sector, description, deal_size } = await req.json();
  const [deal] = await query<Deal>(
    `UPDATE deals
     SET name=$1, company=$2, stage=$3, sector=$4, description=$5, deal_size=$6, updated_at=NOW()
     WHERE id=$7 RETURNING *`,
    [name, company ?? null, stage, sector ?? null, description ?? null, deal_size ?? null, id]
  );
  return NextResponse.json(deal);
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await query('DELETE FROM deals WHERE id = $1', [id]);
  return NextResponse.json({ ok: true });
}
