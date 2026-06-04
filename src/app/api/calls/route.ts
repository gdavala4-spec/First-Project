import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { analyzeCallTranscript } from '@/lib/ai';
import type { CallRecord } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const calls = await query<CallRecord>(
      'SELECT * FROM calls ORDER BY created_at DESC'
    );
    return NextResponse.json(calls);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, transcript, deal_id } = body;

    if (!title) {
      return NextResponse.json({ error: 'title is required' }, { status: 400 });
    }

    let summary: string | null = null;
    let action_items: string | null = null;
    let sentiment: string | null = null;

    if (transcript) {
      const analysis = await analyzeCallTranscript(transcript);
      summary = analysis.summary;
      action_items = analysis.action_items;
      sentiment = analysis.sentiment;
    }

    const calls = await query<CallRecord>(
      `INSERT INTO calls (deal_id, title, transcript, summary, action_items, sentiment)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [deal_id ?? null, title, transcript ?? null, summary, action_items, sentiment]
    );

    return NextResponse.json(calls[0], { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
