import { query } from '@/lib/db';
import { requireSession } from '@/lib/auth';
import DealPipeline from '@/components/DealPipeline';
import type { Deal } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function DealsPage() {
  await requireSession();
  const deals = await query<Deal>('SELECT * FROM deals ORDER BY created_at DESC');
  return <DealPipeline initialDeals={deals} />;
}
