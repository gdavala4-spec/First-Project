import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import type { Deal } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const deals = await query<Deal>(
      'SELECT * FROM deals ORDER BY created_at DESC'
    );
    return NextResponse.json(deals);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, company, stage = 'prospecting', deal_size, sector, description } = body;

    if (!name || !company) {
      return NextResponse.json({ error: 'name and company are required' }, { status: 400 });
    }

    const deals = await query<Deal>(
      `INSERT INTO deals (name, company, stage, deal_size, sector, description)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [name, company, stage, deal_size ?? null, sector ?? null, description ?? null]
    );

    return NextResponse.json(deals[0], { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
