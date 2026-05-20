'use client';
import Link from 'next/link';
import type { Deal, DealStage } from '@/lib/types';
import { Building2, TrendingUp, Plus } from 'lucide-react';

const STAGES: { key: DealStage; label: string; accent: string; bar: string }[] = [
  { key: 'prospecting', label: 'Prospecting', accent: 'border-zinc-600', bar: 'bg-zinc-600' },
  { key: 'diligence', label: 'Diligence', accent: 'border-yellow-600', bar: 'bg-yellow-600' },
  { key: 'term_sheet', label: 'Term Sheet', accent: 'border-blue-600', bar: 'bg-blue-600' },
  { key: 'closed_won', label: 'Closed Won', accent: 'border-green-600', bar: 'bg-green-600' },
  { key: 'closed_lost', label: 'Closed Lost', accent: 'border-red-700', bar: 'bg-red-700' },
];

interface Props {
  deals: Deal[];
  onNewDeal?: () => void;
}

export default function DealPipeline({ deals, onNewDeal }: Props) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {STAGES.map((stage) => {
        const stageDeals = deals.filter((d) => d.stage === stage.key);
        return (
          <div key={stage.key} className="flex-shrink-0 w-60">
            <div className={`flex items-center justify-between mb-3 pb-2 border-b-2 ${stage.accent}`}>
              <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                {stage.label}
              </span>
              <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full">
                {stageDeals.length}
              </span>
            </div>
            <div className="space-y-2">
              {stageDeals.map((deal) => (
                <Link key={deal.id} href={`/deals/${deal.id}`}>
                  <div className="bg-zinc-800 rounded-xl p-3 border border-zinc-700 hover:border-zinc-500 hover:bg-zinc-750 transition-all cursor-pointer group">
                    <div className="flex items-start gap-2">
                      <Building2 size={13} className="text-zinc-500 mt-0.5 shrink-0 group-hover:text-zinc-300" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white leading-tight truncate">{deal.name}</p>
                        {deal.company && (
                          <p className="text-xs text-zinc-400 truncate mt-0.5">{deal.company}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {deal.sector && (
                        <span className="text-xs text-zinc-500 bg-zinc-900 px-1.5 py-0.5 rounded">
                          {deal.sector}
                        </span>
                      )}
                      {deal.deal_size && (
                        <span className="text-xs text-blue-400 flex items-center gap-1">
                          <TrendingUp size={10} />
                          ${(deal.deal_size / 1e6).toFixed(1)}M
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
              {stage.key === 'prospecting' && onNewDeal && (
                <button
                  onClick={onNewDeal}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-zinc-600 hover:text-zinc-300 border border-dashed border-zinc-700 hover:border-zinc-500 rounded-xl transition-colors"
                >
                  <Plus size={12} /> Add deal
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
