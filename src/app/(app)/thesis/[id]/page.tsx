'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, BookOpen, Trash2 } from 'lucide-react';
import type { Thesis } from '@/lib/types';

export default function ThesisDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [thesis, setThesis] = useState<Thesis | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Thesis>>({});

  useEffect(() => {
    fetch(`/api/thesis/${id}`)
      .then((r) => r.json())
      .then(setThesis)
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSave() {
    const res = await fetch(`/api/thesis/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm),
    });
    const updated: Thesis = await res.json();
    setThesis(updated);
    setEditing(false);
  }

  async function handleDelete() {
    if (!confirm('Delete this thesis? This cannot be undone.')) return;
    await fetch(`/api/thesis/${id}`, { method: 'DELETE' });
    router.push('/thesis');
  }

  if (loading) return <div className="flex items-center justify-center h-full text-zinc-400 p-6">Loading…</div>;
  if (!thesis) {
    return (
      <div className="p-6">
        <p className="text-zinc-400">Thesis not found.</p>
        <Link href="/thesis" className="text-blue-400 hover:underline text-sm mt-2 inline-block">← Back to theses</Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/thesis" className="flex items-center gap-1 text-zinc-400 hover:text-white text-sm transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Theses
        </Link>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        {editing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Title</label>
              <input
                type="text"
                value={editForm.title ?? thesis.title}
                onChange={(e) => setEditForm((p) => ({ ...p, title: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-lg font-bold focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Sector</label>
              <input
                type="text"
                value={editForm.sector ?? thesis.sector ?? ''}
                onChange={(e) => setEditForm((p) => ({ ...p, sector: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Hypothesis</label>
              <textarea
                value={editForm.hypothesis ?? thesis.hypothesis ?? ''}
                onChange={(e) => setEditForm((p) => ({ ...p, hypothesis: e.target.value }))}
                rows={4}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Investment Criteria</label>
              <textarea
                value={editForm.criteria ?? thesis.criteria ?? ''}
                onChange={(e) => setEditForm((p) => ({ ...p, criteria: e.target.value }))}
                rows={4}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Risks</label>
              <textarea
                value={editForm.risks ?? thesis.risks ?? ''}
                onChange={(e) => setEditForm((p) => ({ ...p, risks: e.target.value }))}
                rows={3}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
              />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setEditing(false)} className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-4 py-2 rounded-lg text-sm transition-colors">Cancel</button>
              <button onClick={handleSave} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm transition-colors">Save</button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <BookOpen className="w-5 h-5 text-zinc-400" />
                  <h1 className="text-2xl font-bold text-white">{thesis.title}</h1>
                </div>
                {thesis.sector && (
                  <span className="text-xs text-blue-400 bg-blue-950 px-2.5 py-0.5 rounded-full">{thesis.sector}</span>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => { setEditForm({}); setEditing(true); }}
                  className="text-xs text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 rounded-lg transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="text-red-400 hover:text-red-300 bg-zinc-800 hover:bg-zinc-700 p-1.5 rounded-lg transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="space-y-5 mt-5">
              {thesis.hypothesis && (
                <div>
                  <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-2">Hypothesis</h3>
                  <p className="text-zinc-200 text-sm leading-relaxed whitespace-pre-wrap">{thesis.hypothesis}</p>
                </div>
              )}
              {thesis.criteria && (
                <div>
                  <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-2">Investment Criteria</h3>
                  <p className="text-zinc-200 text-sm leading-relaxed whitespace-pre-wrap">{thesis.criteria}</p>
                </div>
              )}
              {thesis.risks && (
                <div>
                  <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-2">Risks</h3>
                  <p className="text-zinc-200 text-sm leading-relaxed whitespace-pre-wrap">{thesis.risks}</p>
                </div>
              )}
              {!thesis.hypothesis && !thesis.criteria && !thesis.risks && (
                <p className="text-zinc-500 text-sm italic">No content yet — click Edit to add your thesis details.</p>
              )}
            </div>

            <p className="text-xs text-zinc-600 mt-6 pt-4 border-t border-zinc-800">
              Last updated {new Date(thesis.updated_at).toLocaleDateString()}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
