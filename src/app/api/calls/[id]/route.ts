import { NextRequest, NextResponse } from 'next/server';
import { queryOne, query } from '@/lib/db';
import type { CallRecord } from '@/lib/types';

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const call = await queryOne<CallRecord>('SELECT * FROM calls WHERE id = $1', [id]);
  if (!call) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(call);
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await query('DELETE FROM calls WHERE id = $1', [id]);
  return NextResponse.json({ ok: true });
}
