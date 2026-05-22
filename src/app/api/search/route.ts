import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import type { SearchResult } from '@/lib/types';

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim() ?? '';
  if (!q) return NextResponse.json([]);

  const pattern = `%${q}%`;

  const [deals, notes, cims, theses, calls] = await Promise.all([
    query<{ id: string; name: string; company: string | null; description: string | null }>(
      `SELECT id, name, company, description FROM deals
       WHERE name LIKE $1 OR company LIKE $1 OR description LIKE $1 LIMIT 5`,
      [pattern]
    ),
    query<{ id: string; content: string; deal_id: string | null }>(
      `SELECT id, content, deal_id FROM notes WHERE content LIKE $1 LIMIT 5`,
      [pattern]
    ),
    query<{ id: string; filename: string; ai_summary: string | null; deal_id: string | null }>(
      `SELECT id, filename, ai_summary, deal_id FROM cims
       WHERE filename LIKE $1 OR ai_summary LIKE $1 OR extracted_text LIKE $1 LIMIT 5`,
      [pattern]
    ),
    query<{ id: string; title: string; hypothesis: string | null }>(
      `SELECT id, title, hypothesis FROM theses
       WHERE title LIKE $1 OR hypothesis LIKE $1 OR criteria LIKE $1 OR content LIKE $1 LIMIT 5`,
      [pattern]
    ),
    query<{ id: string; title: string; ai_summary: string | null; deal_id: string | null }>(
      `SELECT id, title, ai_summary, deal_id FROM calls
       WHERE title LIKE $1 OR transcript LIKE $1 OR ai_summary LIKE $1 LIMIT 5`,
      [pattern]
    ),
  ]);

  const results: SearchResult[] = [
    ...deals.map((d) => ({
      type: 'deal' as const,
      id: d.id,
      title: d.name,
      excerpt: d.description?.slice(0, 120) ?? d.company ?? '',
    })),
    ...notes.map((n) => ({
      type: 'note' as const,
      id: n.id,
      title: 'Note',
      excerpt: n.content.slice(0, 120),
      deal_id: n.deal_id ?? undefined,
    })),
    ...cims.map((c) => ({
      type: 'cim' as const,
      id: c.id,
      title: c.filename,
      excerpt: c.ai_summary?.slice(0, 120) ?? '',
      deal_id: c.deal_id ?? undefined,
    })),
    ...theses.map((t) => ({
      type: 'thesis' as const,
      id: t.id,
      title: t.title,
      excerpt: t.hypothesis?.slice(0, 120) ?? '',
    })),
    ...calls.map((c) => ({
      type: 'call' as const,
      id: c.id,
      title: c.title,
      excerpt: c.ai_summary?.slice(0, 120) ?? '',
      deal_id: c.deal_id ?? undefined,
    })),
  ];

  return NextResponse.json(results);
}
