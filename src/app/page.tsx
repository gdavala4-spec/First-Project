import { query } from '@/lib/db';
import type { Deal, CIM, Thesis, CallRecord } from '@/lib/types';
import Link from 'next/link';
import { Briefcase, FileText, BookOpen, Phone, Sparkles, ArrowRight, TrendingUp } from 'lucide-react';
import GlobalSearch from '@/components/GlobalSearch';

const STAGE_LABELS: Record<string, string> = {
  prospecting: 'Prospecting',
  diligence: 'Diligence',
  term_sheet: 'Term Sheet',
  closed_won: 'Closed Won',
  closed_lost: 'Closed Lost',
};

export default async function DashboardPage() {
  let deals: Deal[] = [];
  let cims: CIM[] = [];
  let theses: Thesis[] = [];
  let calls: CallRecord[] = [];
  let unlinkedCIMs = 0;
  let dealsByStage: Record<string, number> = {};

  try {
    [deals, cims, theses, calls] = await Promise.all([
      query<Deal>('SELECT * FROM deals ORDER BY updated_at DESC LIMIT 6'),
      query<CIM>('SELECT * FROM cims ORDER BY created_at DESC LIMIT 4'),
      query<Thesis>('SELECT * FROM theses ORDER BY updated_at DESC LIMIT 3'),
      query<CallRecord>('SELECT * FROM calls ORDER BY created_at DESC LIMIT 3'),
    ]);
    const counts = await query<{ stage: string; count: string }>(
      'SELECT stage, COUNT(*) as count FROM deals GROUP BY stage'
    );
    dealsByStage = Object.fromEntries(counts.map((r) => [r.stage, parseInt(r.count)]));
    const unlinked = await query<{ count: string }>('SELECT COUNT(*) as count FROM cims WHERE deal_id IS NULL');
    unlinkedCIMs = parseInt(unlinked[0]?.count ?? '0');
  } catch { /* DB not initialized yet */ }

  const totalDeals = Object.values(dealsByStage).reduce((s, c) => s + c, 0);

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-zinc-400 text-sm mt-1">AI-powered deal flow overview</p>
      </div>

      <div className="mb-6">
        <GlobalSearch />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Deals', value: totalDeals, sub: `${dealsByStage['diligence'] ?? 0} in diligence`, icon: Briefcase, color: 'text-blue-400' },
          { label: 'CIMs Ingested', value: cims.length, sub: unlinkedCIMs > 0 ? `${unlinkedCIMs} unlinked` : 'All linked', icon: FileText, color: 'text-purple-400' },
          { label: 'Theses', value: theses.length, sub: 'Investment frameworks', icon: BookOpen, color: 'text-green-400' },
          { label: 'Calls Logged', value: calls.length, sub: 'With AI analysis', icon: Phone, color: 'text-orange-400' },
        ].map(({ label, value, sub, icon: Icon, color }) => (
          <div key={label} className="bg-zinc-900 rounded-xl p-5 border border-zinc-800">
            <div className="flex items-center gap-2 mb-2">
              <Icon size={15} className={color} />
              <span className="text-xs text-zinc-400">{label}</span>
            </div>
            <p className="text-3xl font-bold text-white">{value}</p>
            <p className="text-xs text-zinc-500 mt-1">{sub}</p>
          </div>
        ))}
      </div>

      {/* Pipeline mini */}
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-zinc-300">Pipeline Overview</h2>
          <Link href="/deals" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
            Full pipeline <ArrowRight size={11} />
          </Link>
        </div>
        <div className="flex gap-2 flex-wrap">
          {['prospecting', 'diligence', 'term_sheet', 'closed_won', 'closed_lost'].map((stage) => (
            <div key={stage} className="flex-1 min-w-[80px] bg-zinc-800 rounded-lg p-3 text-center">
              <p className="text-xl font-bold text-white">{dealsByStage[stage] ?? 0}</p>
              <p className="text-xs text-zinc-500 mt-0.5">{STAGE_LABELS[stage]}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Recent Deals */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-zinc-300">Recent Deals</h2>
            <Link href="/deals" className="text-xs text-blue-400 hover:text-blue-300">View all →</Link>
          </div>
          <div className="space-y-2">
            {deals.map((d) => (
              <Link key={d.id} href={`/deals/${d.id}`}>
                <div className="flex items-center gap-3 bg-zinc-900 rounded-lg p-3 border border-zinc-800 hover:border-zinc-600 transition-colors">
                  <Briefcase size={13} className="text-zinc-500 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-white truncate">{d.name}</p>
                    <p className="text-xs text-zinc-500">{STAGE_LABELS[d.stage]}{d.sector ? ` · ${d.sector}` : ''}</p>
                  </div>
                  {d.deal_size && (
                    <span className="text-xs text-blue-400 flex items-center gap-1 shrink-0">
                      <TrendingUp size={10} />${(d.deal_size / 1e6).toFixed(1)}M
                    </span>
                  )}
                </div>
              </Link>
            ))}
            {!deals.length && (
              <p className="text-sm text-zinc-600 text-center py-4">
                No deals yet.{' '}
                <Link href="/deals" className="text-blue-500 hover:text-blue-400">Add one →</Link>
              </p>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-zinc-300">Recent Activity</h2>
          </div>
          <div className="space-y-2">
            {cims.map((c) => (
              <div key={c.id} className="flex items-start gap-3 bg-zinc-900 rounded-lg p-3 border border-zinc-800">
                <FileText size={13} className="text-purple-400 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">{c.filename}</p>
                  {c.ai_summary ? (
                    <p className="text-xs text-zinc-500 line-clamp-1 mt-0.5">
                      <Sparkles size={9} className="inline mr-1" />{c.ai_summary}
                    </p>
                  ) : (
                    <p className="text-xs text-zinc-600">CIM uploaded</p>
                  )}
                </div>
              </div>
            ))}
            {calls.map((c) => (
              <Link key={c.id} href={`/calls/${c.id}`}>
                <div className="flex items-start gap-3 bg-zinc-900 rounded-lg p-3 border border-zinc-800 hover:border-zinc-600 transition-colors">
                  <Phone size={13} className="text-orange-400 mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">{c.title}</p>
                    {c.ai_summary ? (
                      <p className="text-xs text-zinc-500 line-clamp-1 mt-0.5">{c.ai_summary}</p>
                    ) : (
                      <p className="text-xs text-zinc-600">Call logged</p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
            {!cims.length && !calls.length && (
              <p className="text-sm text-zinc-600 text-center py-4">No activity yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
