import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import type { CallRecord, Deal } from '@/lib/types';
import { analyzeCallTranscript, linkContentToDeals } from '@/lib/ai';

export async function GET() {
  const calls = await query<CallRecord>('SELECT * FROM calls ORDER BY created_at DESC');
  return NextResponse.json(calls);
}

export async function POST(req: NextRequest) {
  const { deal_id, title, transcript, recorded_at, duration_seconds } = await req.json();

  const [call] = await query<CallRecord>(
    `INSERT INTO calls (deal_id, title, transcript, recorded_at, duration_seconds)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [deal_id ?? null, title, transcript ?? null, recorded_at ?? null, duration_seconds ?? null]
  );

  if (transcript) {
    Promise.resolve().then(async () => {
      try {
        const [analysis, deals] = await Promise.all([
          analyzeCallTranscript(transcript),
          query<Deal>('SELECT * FROM deals'),
        ]);

        await query(
          `UPDATE calls SET ai_summary=$1, ai_action_items=$2, ai_sentiment=$3 WHERE id=$4`,
          [analysis.summary, analysis.action_items, analysis.sentiment, call.id]
        );

        const links = await linkContentToDeals(transcript, 'call', deals);
        for (const link of links) {
          await query(
            `INSERT INTO context_links (source_type, source_id, deal_id, confidence, reason)
             VALUES ('call', $1, $2, $3, $4) ON CONFLICT DO NOTHING`,
            [call.id, link.deal_id, link.confidence, link.reason]
          );
        }

        if (!deal_id && links.length > 0) {
          await query('UPDATE calls SET deal_id = $1 WHERE id = $2', [links[0].deal_id, call.id]);
        }
      } catch { /* non-fatal */ }
    });
  }

  return NextResponse.json(call, { status: 201 });
}
