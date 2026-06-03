import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import type { Deal } from '@/lib/types';

export async function GET() {
  try {
    const deals = await query<Deal>('SELECT * FROM deals ORDER BY created_at DESC');
    return NextResponse.json(deals);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('[GET /api/deals]', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, company, stage, sector, description, deal_size } = await req.json();
    const [deal] = await query<Deal>(
      `INSERT INTO deals (name, company, stage, sector, description, deal_size)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [name, company ?? null, stage ?? 'prospecting', sector ?? null, description ?? null, deal_size ?? null]
    );
    return NextResponse.json(deal, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('[POST /api/deals]', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
