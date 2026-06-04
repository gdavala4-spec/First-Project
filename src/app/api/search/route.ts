import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import type { SearchResult } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const q = searchParams.get('q')?.trim();

    if (!q || q.length < 2) {
      return NextResponse.json([]);
    }

    const pattern = `%${q}%`;
    const results: SearchResult[] = [];

    // Search deals
    const deals = await query<{ id: string; name: string; company: string; stage: string }>(
      `SELECT id, name, company, stage FROM deals
       WHERE name ILIKE $1 OR company ILIKE $1 OR description ILIKE $1 OR sector ILIKE $1
       LIMIT 10`,
      [pattern]
    );
    for (const d of deals) {
      results.push({
        id: d.id,
        type: 'deal',
        title: d.name,
        subtitle: `${d.company} • ${d.stage}`,
        url: `/deals/${d.id}`,
      });
    }

    // Search theses
    const theses = await query<{ id: string; title: string; sector: string | null }>(
      `SELECT id, title, sector FROM theses
       WHERE title ILIKE $1 OR hypothesis ILIKE $1 OR criteria ILIKE $1 OR sector ILIKE $1
       LIMIT 10`,
      [pattern]
    );
    for (const t of theses) {
      results.push({
        id: t.id,
        type: 'thesis',
        title: t.title,
        subtitle: t.sector ?? 'Investment Thesis',
        url: `/thesis/${t.id}`,
      });
    }

    // Search CIMs
    const cims = await query<{ id: string; filename: string; ai_summary: string | null }>(
      `SELECT id, filename, ai_summary FROM cims
       WHERE filename ILIKE $1 OR extracted_text ILIKE $1 OR ai_summary ILIKE $1
       LIMIT 10`,
      [pattern]
    );
    for (const c of cims) {
      results.push({
        id: c.id,
        type: 'cim',
        title: c.filename,
        subtitle: c.ai_summary ? c.ai_summary.slice(0, 80) + '…' : 'CIM Document',
        url: `/ingest`,
      });
    }

    // Search notes
    const notes = await query<{ id: string; content: string; deal_id: string }>(
      `SELECT n.id, n.content, n.deal_id FROM notes n
       WHERE n.content ILIKE $1
       LIMIT 10`,
      [pattern]
    );
    for (const n of notes) {
      results.push({
        id: n.id,
        type: 'note',
        title: n.content.slice(0, 60) + (n.content.length > 60 ? '…' : ''),
        subtitle: 'Note',
        url: `/deals/${n.deal_id}`,
      });
    }

    // Search calls
    const calls = await query<{ id: string; title: string; summary: string | null }>(
      `SELECT id, title, summary FROM calls
       WHERE title ILIKE $1 OR transcript ILIKE $1 OR summary ILIKE $1
       LIMIT 10`,
      [pattern]
    );
    for (const c of calls) {
      results.push({
        id: c.id,
        type: 'call',
        title: c.title,
        subtitle: c.summary ? c.summary.slice(0, 80) + '…' : 'Call Log',
        url: `/calls/${c.id}`,
      });
    }

    return NextResponse.json(results);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
