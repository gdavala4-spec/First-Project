import { query } from '@/lib/db';
import { requireSession } from '@/lib/auth';
import CIMUpload from '@/components/CIMUpload';
import type { CIM } from '@/lib/types';

export const dynamic = 'force-dynamic';

interface CIMWithDeal extends CIM {
  deal_name?: string | null;
}

export default async function IngestPage() {
  await requireSession();
  const cims = await query<CIMWithDeal>(
    `SELECT c.*, d.name AS deal_name
     FROM cims c
     LEFT JOIN deals d ON d.id = c.deal_id
     ORDER BY c.created_at DESC`
  );
  return <CIMUpload initialCIMs={cims} />;
}
