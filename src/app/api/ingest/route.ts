import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { summarizeCIM, linkContentToDeals } from '@/lib/ai';
import type { CIM, Deal } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cims = await query<CIM>(
      `SELECT c.*, d.name AS deal_name
       FROM cims c
       LEFT JOIN deals d ON d.id = c.deal_id
       ORDER BY c.created_at DESC`
    );
    return NextResponse.json(cims);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'file is required' }, { status: 400 });
    }

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      return NextResponse.json({ error: 'Only PDF files are accepted' }, { status: 400 });
    }

    // Extract text from PDF using require (as specified)
    const pdfParse = require('pdf-parse');
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const pdfData = await pdfParse(buffer);
    const extractedText: string = pdfData.text ?? '';

    // Generate AI summary
    let aiSummary: string | null = null;
    if (extractedText.trim().length > 0) {
      aiSummary = await summarizeCIM(extractedText);
    }

    // Get all deals to attempt auto-linking
    const deals = await query<Deal>('SELECT * FROM deals ORDER BY created_at DESC');

    // Insert CIM record
    const cims = await query<CIM>(
      `INSERT INTO cims (filename, extracted_text, ai_summary)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [file.name, extractedText, aiSummary]
    );
    const cim = cims[0];

    // Auto-link to deals via AI
    const links: { deal_id: string; confidence: number; reason: string }[] = [];
    if (extractedText.trim().length > 0 && deals.length > 0) {
      const aiLinks = await linkContentToDeals(extractedText, 'CIM', deals);
      for (const link of aiLinks) {
        if (link.confidence >= 0.5) {
          // Update CIM with top deal link
          if (links.length === 0) {
            await query('UPDATE cims SET deal_id = $1 WHERE id = $2', [link.deal_id, cim.id]);
            cim.deal_id = link.deal_id;
          }
          // Store context link
          await query(
            `INSERT INTO context_links (source_type, source_id, target_type, target_id)
             VALUES ('cim', $1, 'deal', $2)`,
            [cim.id, link.deal_id]
          );
          links.push(link);
        }
      }
    }

    return NextResponse.json({ cim, links }, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
