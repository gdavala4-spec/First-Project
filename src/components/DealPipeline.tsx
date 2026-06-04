'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, TrendingUp, Building2 } from 'lucide-react';
import type { Deal, DealStage } from '@/lib/types';

const STAGES: { key: DealStage; label: string; color: string; headerColor: string }[] = [
  { key: 'prospecting', label: 'Prospecting', color: 'border-zinc-700', headerColor: 'bg-zinc-800 text-zinc-300' },
  { key: 'diligence', label: 'Diligence', color: 'border-blue-800', headerColor: 'bg-blue-950 text-blue-300' },
  { key: 'term_sheet', label: 'Term Sheet', color: 'border-amber-800', headerColor: 'bg-amber-950 text-amber-300' },
  { key: 'closed_won', label: 'Closed Won', color: 'border-green-800', headerColor: 'bg-green-950 text-green-300' },
  { key: 'closed_lost', label: 'Closed Lost', color: 'border-red-900', headerColor: 'bg-red-950 text-red-400' },
];

interface DealPipelineProps {
  initialDeals: Deal[];
}

function formatDealSize(size: number | null): string {
  if (!size) return '';
  if (size >= 1_000_000_000) return `$${(size / 1_000_000_000).toFixed(1)}B`;
  if (size >= 1_000_000) return `$${(size / 1_000_000).toFixed(1)}M`;
  if (size >= 1_000) return `$${(size / 1_000).toFixed(0)}K`;
  return `$${size}`;
}

export default function DealPipeline({ initialDeals }: DealPipelineProps) {
  const [deals, setDeals] = useState<Deal[]>(initialDeals);
  const [showNewDeal, setShowNewDeal] = useState(false);
  const [newDealStage, setNewDealStage] = useState<DealStage>('prospecting');
  const [newDeal, setNewDeal] = useState({ name: '', company: '', deal_size: '', sector: '' });
  const [creating, setCreating] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<DealStage | null>(null);

  const dealsByStage = STAGES.reduce<Record<DealStage, Deal[]>>(
    (acc, s) => {
      acc[s.key] = deals.filter((d) => d.stage === s.key);
      return acc;
    },
    {} as Record<DealStage, Deal[]>
  );

  async function handleCreateDeal() {
    if (!newDeal.name || !newDeal.company) return;
    setCreating(true);
    try {
      const res = await fetch('/api/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newDeal.name,
          company: newDeal.company,
          stage: newDealStage,
          deal_size: newDeal.deal_size ? Number(newDeal.deal_size) : null,
          sector: newDeal.sector || null,
        }),
      });
      const created: Deal = await res.json();
      setDeals((prev) => [created, ...prev]);
      setNewDeal({ name: '', company: '', deal_size: '', sector: '' });
      setShowNewDeal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  }

  async function handleDrop(targetStage: DealStage) {
    if (!draggingId || targetStage === deals.find((d) => d.id === draggingId)?.stage) {
      setDraggingId(null);
      setDragOverStage(null);
      return;
    }

    setDeals((prev) =>
      prev.map((d) => (d.id === draggingId ? { ...d, stage: targetStage } : d))
    );

    try {
      await fetch(`/api/deals/${draggingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: targetStage }),
      });
    } catch (err) {
      console.error(err);
    }

    setDraggingId(null);
    setDragOverStage(null);
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Deal Pipeline</h1>
          <p className="text-zinc-400 text-sm mt-0.5">{deals.length} total deals</p>
        </div>
        <button
          onClick={() => {
            setShowNewDeal(true);
            setNewDealStage('prospecting');
          }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Deal
        </button>
      </div>

      {/* New Deal Modal */}
      {showNewDeal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold text-white mb-4">New Deal</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Deal Name *</label>
                <input
                  type="text"
                  value={newDeal.name}
                  onChange={(e) => setNewDeal((p) => ({ ...p, name: e.target.value }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="Project Alpha"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Company *</label>
                <input
                  type="text"
                  value={newDeal.company}
                  onChange={(e) => setNewDeal((p) => ({ ...p, company: e.target.value }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="Acme Corp"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">Deal Size ($)</label>
                  <input
                    type="number"
                    value={newDeal.deal_size}
                    onChange={(e) => setNewDeal((p) => ({ ...p, deal_size: e.target.value }))}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder="10000000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">Stage</label>
                  <select
                    value={newDealStage}
                    onChange={(e) => setNewDealStage(e.target.value as DealStage)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    {STAGES.map((s) => (
                      <option key={s.key} value={s.key}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Sector</label>
                <input
                  type="text"
                  value={newDeal.sector}
                  onChange={(e) => setNewDeal((p) => ({ ...p, sector: e.target.value }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="SaaS, Healthcare, etc."
                />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setShowNewDeal(false)}
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateDeal}
                disabled={creating || !newDeal.name || !newDeal.company}
                className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                {creating ? 'Creating…' : 'Create Deal'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Kanban board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {STAGES.map((stage) => (
          <div
            key={stage.key}
            className={`flex-shrink-0 w-64 rounded-xl border ${stage.color} bg-zinc-900/50 flex flex-col ${
              dragOverStage === stage.key ? 'ring-2 ring-blue-500' : ''
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOverStage(stage.key);
            }}
            onDragLeave={() => setDragOverStage(null)}
            onDrop={() => handleDrop(stage.key)}
          >
            {/* Column header */}
            <div className={`px-3 py-2.5 rounded-t-xl flex items-center justify-between ${stage.headerColor}`}>
              <span className="text-xs font-semibold uppercase tracking-wide">{stage.label}</span>
              <span className="text-xs font-bold bg-black/20 rounded-full px-2 py-0.5">
                {dealsByStage[stage.key].length}
              </span>
            </div>

            {/* Cards */}
            <div className="flex-1 p-2 space-y-2 min-h-24">
              {dealsByStage[stage.key].map((deal) => (
                <div
                  key={deal.id}
                  draggable
                  onDragStart={() => setDraggingId(deal.id)}
                  onDragEnd={() => {
                    setDraggingId(null);
                    setDragOverStage(null);
                  }}
                  className={`bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 rounded-lg p-3 cursor-grab active:cursor-grabbing transition-all ${
                    draggingId === deal.id ? 'opacity-50 scale-95' : ''
                  }`}
                >
                  <Link href={`/deals/${deal.id}`} className="block" onClick={(e) => e.stopPropagation()}>
                    <p className="text-sm font-medium text-white leading-snug truncate">{deal.name}</p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <Building2 className="w-3 h-3 text-zinc-500 flex-shrink-0" />
                      <p className="text-xs text-zinc-400 truncate">{deal.company}</p>
                    </div>
                    {(deal.deal_size || deal.sector) && (
                      <div className="flex items-center gap-2 mt-2">
                        {deal.deal_size && (
                          <div className="flex items-center gap-1">
                            <TrendingUp className="w-3 h-3 text-blue-400" />
                            <span className="text-xs text-blue-400 font-medium">
                              {formatDealSize(deal.deal_size)}
                            </span>
                          </div>
                        )}
                        {deal.sector && (
                          <span className="text-xs text-zinc-500 bg-zinc-700/50 rounded-full px-1.5 py-0.5 truncate max-w-24">
                            {deal.sector}
                          </span>
                        )}
                      </div>
                    )}
                  </Link>
                </div>
              ))}

              {dealsByStage[stage.key].length === 0 && (
                <div className="flex items-center justify-center h-16 text-zinc-600 text-xs">
                  No deals
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
