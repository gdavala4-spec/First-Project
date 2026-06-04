import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import type { Note } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const notes = await query<Note>(
      'SELECT * FROM notes WHERE deal_id = $1 ORDER BY created_at DESC',
      [id]
    );
    return NextResponse.json(notes);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { content } = body;

    if (!content) {
      return NextResponse.json({ error: 'content is required' }, { status: 400 });
    }

    const notes = await query<Note>(
      'INSERT INTO notes (deal_id, content) VALUES ($1, $2) RETURNING *',
      [id, content]
    );

    return NextResponse.json(notes[0], { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
