import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: thesis_id } = await params;
  const { deal_id, ai_suggested = false, confidence = 0 } = await req.json();
  await query(
    `INSERT INTO thesis_deals (thesis_id, deal_id, ai_suggested, confidence)
     VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING`,
    [thesis_id, deal_id, ai_suggested, confidence]
  );
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: thesis_id } = await params;
  const { deal_id } = await req.json();
  await query(
    'DELETE FROM thesis_deals WHERE thesis_id = $1 AND deal_id = $2',
    [thesis_id, deal_id]
  );
  return NextResponse.json({ ok: true });
}
