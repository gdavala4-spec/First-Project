'use client';
import { useState, useEffect, useCallback } from 'react';
import type { Thesis } from '@/lib/types';
import Link from 'next/link';
import { Plus, BookOpen, X } from 'lucide-react';

export default function ThesisPage() {
  const [theses, setTheses] = useState<Thesis[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', sector: '', hypothesis: '' });

  const load = useCallback(async () => {
    const res = await fetch('/api/thesis');
    setTheses(await res.json());
  }, []);

  useEffect(() => { load(); }, [load]);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/thesis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setShowForm(false);
    setForm({ title: '', sector: '', hypothesis: '' });
    load();
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Thesis Manager</h1>
          <p className="text-sm text-zinc-400 mt-1">Investment frameworks and research workspaces</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={15} /> New Thesis
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-white">New Investment Thesis</h2>
              <button onClick={() => setShowForm(false)} className="text-zinc-400 hover:text-white">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={create} className="space-y-3">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Title *</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. B2B Vertical AI SaaS"
                  required
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Sector Focus</label>
                <input
                  value={form.sector}
                  onChange={(e) => setForm((p) => ({ ...p, sector: e.target.value }))}
                  placeholder="e.g. Enterprise SaaS"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Core Hypothesis</label>
                <textarea
                  value={form.hypothesis}
                  onChange={(e) => setForm((p) => ({ ...p, hypothesis: e.target.value }))}
                  placeholder="The core belief driving this thesis…"
                  rows={3}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                />
              </div>
              <div className="flex gap-2 pt-1">
                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm py-2.5 rounded-lg transition-colors font-medium">
                  Create Thesis
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm py-2.5 rounded-lg transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {theses.map((t) => (
          <Link key={t.id} href={`/thesis/${t.id}`}>
            <div className="bg-zinc-900 border border-zinc-800 hover:border-zinc-600 rounded-2xl p-5 transition-colors">
              <div className="flex items-start gap-3">
                <BookOpen size={17} className="text-green-400 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <h2 className="text-base font-semibold text-white">{t.title}</h2>
                  {t.sector && <p className="text-xs text-zinc-500 mt-0.5">{t.sector}</p>}
                  {t.hypothesis && <p className="text-sm text-zinc-400 mt-2 line-clamp-2">{t.hypothesis}</p>}
                </div>
                <p className="text-xs text-zinc-600 shrink-0">{new Date(t.updated_at).toLocaleDateString()}</p>
              </div>
            </div>
          </Link>
        ))}
        {!theses.length && (
          <div className="text-center py-16 text-zinc-600">
            <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No theses yet. Create your first investment thesis.</p>
          </div>
        )}
      </div>
    </div>
  );
}
