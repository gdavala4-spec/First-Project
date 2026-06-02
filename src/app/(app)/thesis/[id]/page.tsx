'use client';
import { useState, useEffect, useCallback, use } from 'react';
import type { Thesis, Deal } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2, Briefcase, Plus, X } from 'lucide-react';
import Link from 'next/link';

export default function ThesisDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [thesis, setThesis] = useState<Thesis | null>(null);
  const [linkedDeals, setLinkedDeals] = useState<Deal[]>([]);
  const [allDeals, setAllDeals] = useState<Deal[]>([]);
  const [saving, setSaving] = useState(false);
  const [showAddDeal, setShowAddDeal] = useState(false);
  const router = useRouter();

  const load = useCallback(async () => {
    const [tRes, dRes] = await Promise.all([fetch(`/api/thesis/${id}`), fetch('/api/deals')]);
    if (!tRes.ok) { router.push('/thesis'); return; }
    const tData = await tRes.json();
    setThesis(tData.thesis);
    setLinkedDeals(tData.linkedDeals);
    setAllDeals(await dRes.json());
  }, [id, router]);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!thesis) return;
    setSaving(true);
    await fetch(`/api/thesis/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(thesis),
    });
    setSaving(false);
  };

  const linkDeal = async (dealId: string) => {
    await fetch(`/api/thesis/${id}/link`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deal_id: dealId }),
    });
    load();
    setShowAddDeal(false);
  };

  const unlinkDeal = async (dealId: string) => {
    await fetch(`/api/thesis/${id}/link`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deal_id: dealId }),
    });
    load();
  };

  if (!thesis) return <div className="p-8 text-zinc-400 text-sm">Loading…</div>;

  const unlinkedDeals = allDeals.filter((d) => !linkedDeals.find((l) => l.id === d.id));

  const sections = [
    { key: 'hypothesis', label: 'Core Hypothesis', placeholder: 'The fundamental belief driving this thesis…', rows: 4 },
    { key: 'criteria', label: 'Investment Criteria', placeholder: 'What does a qualifying company look like? Revenue, growth, team, moat…', rows: 5 },
    { key: 'risks', label: 'Risk Factors', placeholder: 'Key risks and what would invalidate this thesis…', rows: 4 },
    { key: 'content', label: 'Research & Notes', placeholder: 'Supporting evidence, market data, case studies, comparable companies…', rows: 6 },
  ];

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <Link href="/thesis" className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors">
          <ArrowLeft size={14} /> Back
        </Link>
        <button
          onClick={save}
          disabled={saving}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm px-4 py-2 rounded-lg transition-colors"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>

      <div className="space-y-5">
        <div>
          <input
            value={thesis.title}
            onChange={(e) => setThesis((p) => p ? { ...p, title: e.target.value } : p)}
            className="w-full bg-transparent text-2xl font-bold text-white border-none outline-none placeholder-zinc-700"
            placeholder="Thesis title…"
          />
          <input
            value={thesis.sector ?? ''}
            onChange={(e) => setThesis((p) => p ? { ...p, sector: e.target.value } : p)}
            className="w-full bg-transparent text-sm text-zinc-400 border-none outline-none placeholder-zinc-700 mt-1"
            placeholder="Sector focus…"
          />
        </div>

        {sections.map(({ key, label, placeholder, rows }) => (
          <div key={key} className="bg-zinc-900 rounded-2xl border border-zinc-800 p-5">
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">{label}</label>
            <textarea
              value={(thesis[key as keyof Thesis] as string) ?? ''}
              onChange={(e) => setThesis((p) => p ? { ...p, [key]: e.target.value } : p)}
              placeholder={placeholder}
              rows={rows}
              className="w-full bg-transparent text-sm text-zinc-200 placeholder-zinc-700 border-none outline-none resize-none leading-relaxed"
            />
          </div>
        ))}

        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Linked Deals</label>
            <button
              onClick={() => setShowAddDeal(!showAddDeal)}
              className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
            >
              <Plus size={11} /> Link Deal
            </button>
          </div>

          {showAddDeal && (
            <div className="mb-4 bg-zinc-800 rounded-xl p-3">
              <p className="text-xs text-zinc-400 mb-2">Select a deal:</p>
              <div className="space-y-0.5 max-h-40 overflow-y-auto">
                {unlinkedDeals.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => linkDeal(d.id)}
                    className="w-full text-left text-sm text-zinc-300 hover:text-white px-2 py-2 hover:bg-zinc-700 rounded-lg transition-colors"
                  >
                    {d.name}
                    <span className="text-zinc-500 text-xs ml-2">({d.stage})</span>
                  </button>
                ))}
                {!unlinkedDeals.length && <p className="text-xs text-zinc-600 px-2 py-1">No more deals to link</p>}
              </div>
            </div>
          )}

          <div className="space-y-2">
            {linkedDeals.map((d) => (
              <div key={d.id} className="flex items-center gap-2">
                <Link
                  href={`/deals/${d.id}`}
                  className="flex items-center gap-2 flex-1 text-zinc-300 hover:text-white text-sm transition-colors"
                >
                  <Briefcase size={13} className="text-zinc-500" />
                  {d.name}
                  <span className="text-xs text-zinc-600">({d.stage})</span>
                </Link>
                <button onClick={() => unlinkDeal(d.id)} className="text-zinc-600 hover:text-red-400 transition-colors">
                  <X size={12} />
                </button>
              </div>
            ))}
            {!linkedDeals.length && <p className="text-xs text-zinc-600">No deals linked yet</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
