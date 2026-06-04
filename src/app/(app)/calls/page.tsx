'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Phone, ChevronRight } from 'lucide-react';
import type { CallRecord } from '@/lib/types';

const sentimentColor: Record<string, string> = {
  positive: 'text-green-400 bg-green-950',
  neutral: 'text-zinc-400 bg-zinc-800',
  negative: 'text-red-400 bg-red-950',
};

export default function CallsPage() {
  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ title: '', transcript: '', deal_id: '' });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetch('/api/calls')
      .then((r) => r.json())
      .then(setCalls)
      .finally(() => setLoading(false));
  }, []);

  async function handleCreate() {
    if (!form.title) return;
    setCreating(true);
    try {
      const res = await fetch('/api/calls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          transcript: form.transcript || null,
          deal_id: form.deal_id || null,
        }),
      });
      const created: CallRecord = await res.json();
      setCalls((prev) => [created, ...prev]);
      setForm({ title: '', transcript: '', deal_id: '' });
      setShowNew(false);
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Call Logs</h1>
          <p className="text-zinc-400 text-sm mt-0.5">{calls.length} calls</p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Log Call
        </button>
      </div>

      {/* New Call Modal */}
      {showNew && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold text-white mb-4">Log Call</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Call Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="Management call with Acme Corp"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Transcript</label>
                <textarea
                  value={form.transcript}
                  onChange={(e) => setForm((p) => ({ ...p, transcript: e.target.value }))}
                  rows={8}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none font-mono"
                  placeholder="Paste call transcript here — AI will analyze it automatically…"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Deal ID (optional)</label>
                <input
                  type="text"
                  value={form.deal_id}
                  onChange={(e) => setForm((p) => ({ ...p, deal_id: e.target.value }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="Link to a deal UUID"
                />
              </div>
              {form.transcript && (
                <p className="text-xs text-blue-400">AI will automatically summarize, extract action items, and assess sentiment.</p>
              )}
            </div>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setShowNew(false)}
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={creating || !form.title}
                className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                {creating ? 'Analyzing…' : 'Log Call'}
              </button>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center h-48 text-zinc-400">Loading…</div>
      )}

      {!loading && calls.length === 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
          <Phone className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
          <p className="text-zinc-400 text-sm">No calls logged yet</p>
          <p className="text-zinc-500 text-xs mt-1">Log calls with transcripts to get AI summaries and action items</p>
        </div>
      )}

      <div className="space-y-3">
        {calls.map((call) => (
          <Link
            key={call.id}
            href={`/calls/${call.id}`}
            className="block bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl p-5 transition-colors group"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Phone className="w-4 h-4 text-zinc-500 flex-shrink-0" />
                  <h3 className="text-white font-medium truncate">{call.title}</h3>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  {call.sentiment && (
                    <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${sentimentColor[call.sentiment] ?? sentimentColor.neutral}`}>
                      {call.sentiment}
                    </span>
                  )}
                  <span className="text-xs text-zinc-500">
                    {new Date(call.created_at).toLocaleDateString()}
                  </span>
                </div>
                {call.summary && (
                  <p className="text-zinc-400 text-sm mt-2 line-clamp-2">{call.summary}</p>
                )}
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 flex-shrink-0 mt-1 transition-colors" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
