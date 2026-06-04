import { query } from '@/lib/db';
import { requireSession } from '@/lib/auth';
import Link from 'next/link';
import { TrendingUp, FileText, Phone, BookOpen, ArrowRight } from 'lucide-react';
import type { Deal, CallRecord, Thesis } from '@/lib/types';

export const dynamic = 'force-dynamic';

function formatDealSize(size: number | null): string {
  if (!size) return '—';
  if (size >= 1_000_000_000) return `$${(size / 1_000_000_000).toFixed(1)}B`;
  if (size >= 1_000_000) return `$${(size / 1_000_000).toFixed(1)}M`;
  if (size >= 1_000) return `$${(size / 1_000).toFixed(0)}K`;
  return `$${size}`;
}

const stageBadge: Record<string, string> = {
  prospecting: 'bg-zinc-700 text-zinc-300',
  diligence: 'bg-blue-900 text-blue-300',
  term_sheet: 'bg-amber-900 text-amber-300',
  closed_won: 'bg-green-900 text-green-300',
  closed_lost: 'bg-red-900 text-red-400',
};

const stageLabel: Record<string, string> = {
  prospecting: 'Prospecting',
  diligence: 'Diligence',
  term_sheet: 'Term Sheet',
  closed_won: 'Closed Won',
  closed_lost: 'Closed Lost',
};

export default async function DashboardPage() {
  await requireSession();

  const [recentDeals, recentCalls, recentTheses, dealCountRows, cimCountRows, callCountRows, stageCounts] =
    await Promise.all([
      query<Deal>('SELECT * FROM deals ORDER BY updated_at DESC LIMIT 5'),
      query<CallRecord>('SELECT * FROM calls ORDER BY created_at DESC LIMIT 5'),
      query<Thesis>('SELECT * FROM theses ORDER BY created_at DESC LIMIT 3'),
      query<{ count: string }>('SELECT COUNT(*) as count FROM deals'),
      query<{ count: string }>('SELECT COUNT(*) as count FROM cims'),
      query<{ count: string }>('SELECT COUNT(*) as count FROM calls'),
      query<{ stage: string; count: string }>('SELECT stage, COUNT(*) as count FROM deals GROUP BY stage'),
    ]);

  const totalDeals = Number(dealCountRows[0]?.count ?? 0);
  const totalCIMs = Number(cimCountRows[0]?.count ?? 0);
  const totalCalls = Number(callCountRows[0]?.count ?? 0);
  const stageMap = Object.fromEntries(stageCounts.map((r) => [r.stage, Number(r.count)]));

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-zinc-400 mt-1">Your private equity deal flow at a glance</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-zinc-400 uppercase tracking-wide font-medium">Total Deals</span>
          </div>
          <p className="text-2xl font-bold text-white">{totalDeals}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-zinc-400 uppercase tracking-wide font-medium">In Diligence</span>
          </div>
          <p className="text-2xl font-bold text-white">{stageMap['diligence'] ?? 0}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-zinc-400 uppercase tracking-wide font-medium">CIMs Ingested</span>
          </div>
          <p className="text-2xl font-bold text-white">{totalCIMs}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Phone className="w-4 h-4 text-green-400" />
            <span className="text-xs text-zinc-400 uppercase tracking-wide font-medium">Calls Logged</span>
          </div>
          <p className="text-2xl font-bold text-white">{totalCalls}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Deals */}
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-xl">
          <div className="flex items-center justify-between p-4 border-b border-zinc-800">
            <h2 className="font-semibold text-white">Recent Deals</h2>
            <Link href="/deals" className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-zinc-800">
            {recentDeals.length === 0 && (
              <div className="p-6 text-center text-zinc-500 text-sm">
                No deals yet.{' '}
                <Link href="/deals" className="text-blue-400 hover:underline">Add your first deal</Link>
              </div>
            )}
            {recentDeals.map((deal) => (
              <Link
                key={deal.id}
                href={`/deals/${deal.id}`}
                className="flex items-center justify-between p-4 hover:bg-zinc-800/50 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-white">{deal.name}</p>
                  <p className="text-xs text-zinc-400">{deal.company}{deal.sector ? ` • ${deal.sector}` : ''}</p>
                </div>
                <div className="flex items-center gap-3">
                  {deal.deal_size && (
                    <span className="text-xs text-blue-400 font-medium">{formatDealSize(deal.deal_size)}</span>
                  )}
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${stageBadge[deal.stage] ?? 'bg-zinc-700 text-zinc-300'}`}>
                    {stageLabel[deal.stage] ?? deal.stage}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Recent Calls */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl">
            <div className="flex items-center justify-between p-4 border-b border-zinc-800">
              <h2 className="font-semibold text-white">Recent Calls</h2>
              <Link href="/calls" className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="divide-y divide-zinc-800">
              {recentCalls.length === 0 && (
                <div className="p-4 text-center text-zinc-500 text-xs">No calls logged yet</div>
              )}
              {recentCalls.map((call) => (
                <Link
                  key={call.id}
                  href={`/calls/${call.id}`}
                  className="flex items-center justify-between p-3 hover:bg-zinc-800/50 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm text-white truncate">{call.title}</p>
                    {call.sentiment && (
                      <span className={`text-xs ${call.sentiment === 'positive' ? 'text-green-400' : call.sentiment === 'negative' ? 'text-red-400' : 'text-zinc-400'}`}>
                        {call.sentiment}
                      </span>
                    )}
                  </div>
                  <Phone className="w-3 h-3 text-zinc-600 flex-shrink-0 ml-2" />
                </Link>
              ))}
            </div>
          </div>

          {/* Theses */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl">
            <div className="flex items-center justify-between p-4 border-b border-zinc-800">
              <h2 className="font-semibold text-white">Theses</h2>
              <Link href="/thesis" className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="divide-y divide-zinc-800">
              {recentTheses.length === 0 && (
                <div className="p-4 text-center text-zinc-500 text-xs">No theses yet</div>
              )}
              {recentTheses.map((t) => (
                <Link
                  key={t.id}
                  href={`/thesis/${t.id}`}
                  className="flex items-center gap-3 p-3 hover:bg-zinc-800/50 transition-colors"
                >
                  <BookOpen className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm text-white truncate">{t.title}</p>
                    {t.sector && <p className="text-xs text-zinc-400">{t.sector}</p>}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
