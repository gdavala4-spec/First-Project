'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, BookOpen, ChevronRight } from 'lucide-react';
import type { Thesis } from '@/lib/types';

export default function ThesisPage() {
  const [theses, setTheses] = useState<Thesis[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ title: '', sector: '', hypothesis: '', criteria: '', risks: '' });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetch('/api/thesis')
      .then((r) => r.json())
      .then(setTheses)
      .finally(() => setLoading(false));
  }, []);

  async function handleCreate() {
    if (!form.title) return;
    setCreating(true);
    try {
      const res = await fetch('/api/thesis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const created: Thesis = await res.json();
      setTheses((prev) => [created, ...prev]);
      setForm({ title: '', sector: '', hypothesis: '', criteria: '', risks: '' });
      setShowNew(false);
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Investment Theses</h1>
          <p className="text-zinc-400 text-sm mt-0.5">{theses.length} theses</p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Thesis
        </button>
      </div>

      {/* New Thesis Modal */}
      {showNew && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold text-white mb-4">New Investment Thesis</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="Healthcare Services Consolidation"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Sector</label>
                <input
                  type="text"
                  value={form.sector}
                  onChange={(e) => setForm((p) => ({ ...p, sector: e.target.value }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="Healthcare, SaaS, etc."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Hypothesis</label>
                <textarea
                  value={form.hypothesis}
                  onChange={(e) => setForm((p) => ({ ...p, hypothesis: e.target.value }))}
                  rows={3}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                  placeholder="Core investment hypothesis..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Investment Criteria</label>
                <textarea
                  value={form.criteria}
                  onChange={(e) => setForm((p) => ({ ...p, criteria: e.target.value }))}
                  rows={3}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                  placeholder="Key criteria for target companies..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Risks</label>
                <textarea
                  value={form.risks}
                  onChange={(e) => setForm((p) => ({ ...p, risks: e.target.value }))}
                  rows={2}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                  placeholder="Key risks and mitigants..."
                />
              </div>
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
                {creating ? 'Creating…' : 'Create Thesis'}
              </button>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center h-48 text-zinc-400">Loading…</div>
      )}

      {!loading && theses.length === 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
          <BookOpen className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
          <p className="text-zinc-400 text-sm">No investment theses yet</p>
          <p className="text-zinc-500 text-xs mt-1">Document your sector views and investment frameworks</p>
        </div>
      )}

      <div className="space-y-3">
        {theses.map((t) => (
          <Link
            key={t.id}
            href={`/thesis/${t.id}`}
            className="block bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl p-5 transition-colors group"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <BookOpen className="w-4 h-4 text-zinc-500 flex-shrink-0" />
                  <h3 className="text-white font-medium truncate">{t.title}</h3>
                </div>
                {t.sector && (
                  <span className="text-xs text-blue-400 bg-blue-950 px-2 py-0.5 rounded-full">{t.sector}</span>
                )}
                {t.hypothesis && (
                  <p className="text-zinc-400 text-sm mt-2 line-clamp-2">{t.hypothesis}</p>
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
