import { notFound } from 'next/navigation';
import Link from 'next/link';
import { query, queryOne } from '@/lib/db';
import type { Deal, Note, CIM, CallRecord } from '@/lib/types';
import DealDetailClient from './DealDetailClient';

export const dynamic = 'force-dynamic';

const STAGE_LABELS: Record<string, string> = {
  prospecting: 'Prospecting',
  diligence: 'Diligence',
  term_sheet: 'Term Sheet',
  closed_won: 'Closed Won',
  closed_lost: 'Closed Lost',
};

export default async function DealDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [deal, notes, linkedCIMs, linkedCalls] = await Promise.all([
    queryOne<Deal>('SELECT * FROM deals WHERE id = $1', [id]),
    query<Note>('SELECT * FROM notes WHERE deal_id = $1 ORDER BY created_at DESC', [id]),
    query<CIM>(
      `SELECT c.* FROM cims c
       WHERE c.deal_id = $1
       OR c.id IN (
         SELECT source_id FROM context_links WHERE source_type = 'cim' AND target_id = $1
       )
       ORDER BY c.created_at DESC`,
      [id]
    ),
    query<CallRecord>(
      'SELECT * FROM calls WHERE deal_id = $1 ORDER BY created_at DESC',
      [id]
    ),
  ]);

  if (!deal) notFound();

  return (
    <DealDetailClient
      deal={deal}
      initialNotes={notes}
      linkedCIMs={linkedCIMs}
      linkedCalls={linkedCalls}
      stageLabels={STAGE_LABELS}
    />
  );
}
