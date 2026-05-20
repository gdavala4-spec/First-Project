import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import type { Deal, CIM } from '@/lib/types';
import { linkContentToDeals, summarizeCIM } from '@/lib/ai';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  const dealId = formData.get('deal_id') as string | null;

  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());

  let extractedText = '';
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require('pdf-parse');
    const parsed = await pdfParse(buffer);
    extractedText = parsed.text;
  } catch {
    extractedText = '';
  }

  const [cim] = await query<CIM>(
    'INSERT INTO cims (deal_id, filename, extracted_text) VALUES ($1, $2, $3) RETURNING *',
    [dealId ?? null, file.name, extractedText]
  );

  if (!extractedText) return NextResponse.json(cim);

  try {
    const [summary, deals] = await Promise.all([
      summarizeCIM(extractedText),
      query<Deal>('SELECT * FROM deals'),
    ]);

    await query('UPDATE cims SET ai_summary = $1 WHERE id = $2', [summary, cim.id]);

    const links = await linkContentToDeals(extractedText, 'cim', deals);
    for (const link of links) {
      await query(
        `INSERT INTO context_links (source_type, source_id, deal_id, confidence, reason)
         VALUES ('cim', $1, $2, $3, $4) ON CONFLICT DO NOTHING`,
        [cim.id, link.deal_id, link.confidence, link.reason]
      );
    }

    if (!dealId && links.length > 0) {
      await query('UPDATE cims SET deal_id = $1 WHERE id = $2', [links[0].deal_id, cim.id]);
    }

    return NextResponse.json({ ...cim, ai_summary: summary, links });
  } catch {
    return NextResponse.json(cim);
  }
}
