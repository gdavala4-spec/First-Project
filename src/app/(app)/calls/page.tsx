'use client';
import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import type { CallRecord, Deal } from '@/lib/types';
import Link from 'next/link';
import { Phone, Plus, X, Mic, FileText, Loader2, Sparkles } from 'lucide-react';

function CallsPageInner() {
  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: '',
    deal_id: '',
    transcript: '',
    recorded_at: '',
    duration_seconds: '',
  });
  const searchParams = useSearchParams();
  const router = useRouter();
  const preselectedDeal = searchParams.get('deal_id') ?? '';

  const load = useCallback(async () => {
    const [cRes, dRes] = await Promise.all([fetch('/api/calls'), fetch('/api/deals')]);
    setCalls(await cRes.json());
    setDeals(await dRes.json());
  }, []);

  useEffect(() => {
    load();
    if (preselectedDeal) {
      setForm((p) => ({ ...p, deal_id: preselectedDeal }));
      setShowForm(true);
    }
  }, [load, preselectedDeal]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const res = await fetch('/api/calls', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        deal_id: form.deal_id || null,
        duration_seconds: form.duration_seconds ? parseInt(form.duration_seconds) : null,
        recorded_at: form.recorded_at || null,
      }),
    });
    const call = await res.json();
    setSubmitting(false);
    setShowForm(false);
    setForm({ title: '', deal_id: '', transcript: '', recorded_at: '', duration_seconds: '' });
    router.push(`/calls/${call.id}`);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Calls & Transcripts</h1>
          <p className="text-sm text-zinc-400 mt-1">Log calls and transcripts — AI analyzes and links them to deals</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={15} /> Log Call
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-white">Log a Call</h2>
              <button onClick={() => setShowForm(false)} className="text-zinc-400 hover:text-white">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Call Title *</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. Intro call with Acme CEO"
                  required
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Link to Deal</label>
                  <select
                    value={form.deal_id}
                    onChange={(e) => setForm((p) => ({ ...p, deal_id: e.target.value }))}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                  >
                    <option value="">AI will auto-link</option>
                    {deals.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Duration (seconds)</label>
                  <input
                    type="number"
                    value={form.duration_seconds}
                    onChange={(e) => setForm((p) => ({ ...p, duration_seconds: e.target.value }))}
                    placeholder="e.g. 2700"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Date & Time</label>
                <input
                  type="datetime-local"
                  value={form.recorded_at}
                  onChange={(e) => setForm((p) => ({ ...p, recorded_at: e.target.value }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">
                  <span className="flex items-center gap-1.5">
                    <FileText size={11} /> Transcript / Notes
                    <span className="text-zinc-600">(AI will analyze and summarize)</span>
                  </span>
                </label>
                <textarea
                  value={form.transcript}
                  onChange={(e) => setForm((p) => ({ ...p, transcript: e.target.value }))}
                  placeholder="Paste the call transcript or your notes here…&#10;&#10;AI will extract: summary, action items, sentiment, and auto-link to relevant deals."
                  rows={8}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500 transition-colors resize-none font-mono"
                />
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm py-2.5 rounded-lg transition-colors font-medium"
                >
                  {submitting ? (
                    <><Loader2 size={14} className="animate-spin" /> Analyzing with AI…</>
                  ) : (
                    <><Sparkles size={14} /> Log & Analyze</>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm py-2.5 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {calls.map((c) => (
          <Link key={c.id} href={`/calls/${c.id}`}>
            <div className="bg-zinc-900 border border-zinc-800 hover:border-zinc-600 rounded-2xl p-5 transition-colors">
              <div className="flex items-start gap-3">
                <div className="bg-orange-500/20 rounded-lg p-2 shrink-0">
                  <Phone size={15} className="text-orange-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-base font-semibold text-white">{c.title}</h2>
                    {c.ai_sentiment && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        c.ai_sentiment.startsWith('positive') ? 'bg-green-500/20 text-green-400' :
                        c.ai_sentiment.startsWith('negative') ? 'bg-red-500/20 text-red-400' :
                        'bg-zinc-700 text-zinc-400'
                      }`}>
                        {c.ai_sentiment.split('—')[0].trim()}
                      </span>
                    )}
                  </div>
                  {c.ai_summary && (
                    <p className="text-sm text-zinc-400 mt-1.5 line-clamp-2">{c.ai_summary}</p>
                  )}
                  {c.transcript && !c.ai_summary && (
                    <div className="flex items-center gap-1.5 text-xs text-zinc-500 mt-1">
                      <Loader2 size={10} className="animate-spin" /> AI analysis in progress…
                    </div>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-zinc-600">{new Date(c.created_at).toLocaleDateString()}</p>
                  {c.duration_seconds && (
                    <p className="text-xs text-zinc-500 mt-0.5">
                      <Mic size={9} className="inline mr-1" />
                      {Math.floor(c.duration_seconds / 60)}m
                    </p>
                  )}
                </div>
              </div>
            </div>
          </Link>
        ))}
        {!calls.length && (
          <div className="text-center py-16 text-zinc-600">
            <Phone size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No calls logged yet.</p>
            <p className="text-xs mt-1">Log a call with a transcript and AI will analyze it.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CallsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-zinc-400 text-sm">Loading…</div>}>
      <CallsPageInner />
    </Suspense>
  );
}
