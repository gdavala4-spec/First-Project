import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import type { Note, Deal } from '@/lib/types';
import { linkContentToDeals } from '@/lib/ai';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: deal_id } = await params;
  const { content } = await req.json();

  const [note] = await query<Note>(
    'INSERT INTO notes (deal_id, content) VALUES ($1, $2) RETURNING *',
    [deal_id, content]
  );

  // Non-blocking AI cross-linking to other deals
  Promise.resolve().then(async () => {
    try {
      const deals = await query<Deal>('SELECT * FROM deals WHERE id != $1', [deal_id]);
      const links = await linkContentToDeals(content, 'note', deals);
      for (const link of links) {
        await query(
          `INSERT INTO context_links (source_type, source_id, deal_id, confidence, reason)
           VALUES ('note', $1, $2, $3, $4)
           ON CONFLICT DO NOTHING`,
          [note.id, link.deal_id, link.confidence, link.reason]
        );
      }
    } catch { /* non-fatal */ }
  });

  return NextResponse.json(note, { status: 201 });
}
