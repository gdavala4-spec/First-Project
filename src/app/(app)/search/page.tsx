import { requireSession } from '@/lib/auth';
import GlobalSearch from '@/components/GlobalSearch';

export const dynamic = 'force-dynamic';

export default async function SearchPage() {
  await requireSession();
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Search</h1>
        <p className="text-zinc-400 text-sm mt-0.5">Search across deals, theses, CIMs, calls, and notes</p>
      </div>
      <GlobalSearch />
    </div>
  );
}
