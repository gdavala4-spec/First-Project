'use client';
import { useState, useEffect, useCallback, use } from 'react';
import type { Deal, CIM, Note, ContextLink, CallRecord } from '@/lib/types';
import { useRouter } from 'next/navigation';
import CIMUpload from '@/components/CIMUpload';
import AIContextPanel from '@/components/AIContextPanel';
import { ArrowLeft, FileText, StickyNote, Sparkles, Plus, Building2, TrendingUp, Phone } from 'lucide-react';
import Link from 'next/link';

const STAGES = ['prospecting', 'diligence', 'term_sheet', 'closed_won', 'closed_lost'] as const;
const STAGE_LABELS: Record<string, string> = {
  prospecting: 'Prospecting',
  diligence: 'Diligence',
  term_sheet: 'Term Sheet',
  closed_won: 'Closed Won',
  closed_lost: 'Closed Lost',
};

type Tab = 'cims' | 'notes' | 'calls' | 'context';

export default function DealDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [deal, setDeal] = useState<Deal | null>(null);
  const [cims, setCims] = useState<CIM[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [links, setLinks] = useState<ContextLink[]>([]);
  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [tab, setTab] = useState<Tab>('cims');
  const [newNote, setNewNote] = useState('');
  const [addingNote, setAddingNote] = useState(false);
  const router = useRouter();

  const load = useCallback(async () => {
    const res = await fetch(`/api/deals/${id}`);
    if (!res.ok) { router.push('/deals'); return; }
    const data = await res.json();
    setDeal(data.deal);
    setCims(data.cims);
    setNotes(data.notes);
    setLinks(data.links);
    setCalls(data.calls ?? []);
  }, [id, router]);

  useEffect(() => { load(); }, [load]);

  const updateStage = async (stage: string) => {
    if (!deal) return;
    await fetch(`/api/deals/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...deal, stage }),
    });
    load();
  };

  const addNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    setAddingNote(true);
    await fetch(`/api/deals/${id}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: newNote }),
    });
    setNewNote('');
    setAddingNote(false);
    load();
  };

  if (!deal) return <div className="p-8 text-zinc-400 text-sm">Loading…</div>;

  const tabs: { key: Tab; label: string; count: number; icon: React.ElementType }[] = [
    { key: 'cims', label: 'CIMs', count: cims.length, icon: FileText },
    { key: 'notes', label: 'Notes', count: notes.length, icon: StickyNote },
    { key: 'calls', label: 'Calls', count: calls.length, icon: Phone },
    { key: 'context', label: 'AI Context', count: links.length, icon: Sparkles },
  ];

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <Link href="/deals" className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white mb-6 transition-colors w-fit">
        <ArrowLeft size={14} /> Back to pipeline
      </Link>

      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 mb-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-white">{deal.name}</h1>
            {deal.company && (
              <div className="flex items-center gap-1.5 mt-1 text-zinc-400 text-sm">
                <Building2 size={13} /> {deal.company}
              </div>
            )}
          </div>
          <select
            value={deal.stage}
            onChange={(e) => updateStage(e.target.value)}
            className="bg-zinc-800 border border-zinc-700 text-sm text-white rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            {STAGES.map((s) => <option key={s} value={s}>{STAGE_LABELS[s]}</option>)}
          </select>
        </div>
        <div className="flex gap-3 mt-4 flex-wrap">
          {deal.sector && <span className="text-xs bg-zinc-800 text-zinc-300 px-2.5 py-1 rounded-full">{deal.sector}</span>}
          {deal.deal_size && (
            <span className="text-xs text-blue-400 flex items-center gap-1">
              <TrendingUp size={11} /> ${(deal.deal_size / 1e6).toFixed(1)}M
            </span>
          )}
        </div>
        {deal.description && <p className="text-sm text-zinc-400 mt-3 leading-relaxed">{deal.description}</p>}
      </div>

      <div className="flex gap-1 mb-6 flex-wrap">
        {tabs.map(({ key, label, count, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors ${
              tab === key ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Icon size={14} /> {label}
            <span className="text-xs bg-black/20 px-1.5 py-0.5 rounded-full">{count}</span>
          </button>
        ))}
      </div>

      {tab === 'cims' && (
        <div className="space-y-4">
          <CIMUpload dealId={id} onSuccess={() => load()} />
          {cims.map((c) => (
            <div key={c.id} className="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
              <div className="flex items-center gap-2">
                <FileText size={15} className="text-purple-400 shrink-0" />
                <span className="text-sm font-medium text-white truncate">{c.filename}</span>
                <span className="text-xs text-zinc-600 ml-auto shrink-0">{new Date(c.created_at).toLocaleDateString()}</span>
              </div>
              {c.ai_summary && (
                <div className="mt-3 bg-zinc-800 rounded-lg p-3">
                  <div className="flex items-center gap-1.5 text-xs text-zinc-400 mb-1.5">
                    <Sparkles size={10} /> AI Summary
                  </div>
                  <p className="text-sm text-zinc-300 leading-relaxed">{c.ai_summary}</p>
                </div>
              )}
            </div>
          ))}
          {!cims.length && <p className="text-center text-zinc-600 text-sm py-6">No CIMs uploaded yet</p>}
        </div>
      )}

      {tab === 'notes' && (
        <div className="space-y-4">
          <form onSubmit={addNote} className="space-y-2">
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Add a note, call summary, or observation…"
              rows={3}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500 transition-colors resize-none"
            />
            <button
              type="submit"
              disabled={addingNote || !newNote.trim()}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm px-4 py-2 rounded-lg transition-colors"
            >
              <Plus size={14} /> {addingNote ? 'Adding…' : 'Add Note'}
            </button>
          </form>
          {notes.map((n) => (
            <div key={n.id} className="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
              <p className="text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed">{n.content}</p>
              <p className="text-xs text-zinc-600 mt-2">{new Date(n.created_at).toLocaleString()}</p>
            </div>
          ))}
          {!notes.length && <p className="text-center text-zinc-600 text-sm py-6">No notes yet</p>}
        </div>
      )}

      {tab === 'calls' && (
        <div className="space-y-4">
          <Link
            href={`/calls?deal_id=${id}`}
            className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm px-4 py-2.5 rounded-lg transition-colors w-fit"
          >
            <Plus size={14} /> Log a Call
          </Link>
          {calls.map((c) => (
            <Link key={c.id} href={`/calls/${c.id}`}>
              <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4 hover:border-zinc-600 transition-colors">
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-orange-400 shrink-0" />
                  <span className="text-sm font-medium text-white">{c.title}</span>
                  <span className="text-xs text-zinc-600 ml-auto">{new Date(c.created_at).toLocaleDateString()}</span>
                </div>
                {c.ai_summary && <p className="text-xs text-zinc-400 mt-2 line-clamp-2">{c.ai_summary}</p>}
                {c.ai_sentiment && (
                  <span className={`text-xs mt-2 inline-block px-2 py-0.5 rounded-full ${
                    c.ai_sentiment.startsWith('positive') ? 'bg-green-500/20 text-green-400' :
                    c.ai_sentiment.startsWith('negative') ? 'bg-red-500/20 text-red-400' :
                    'bg-zinc-700 text-zinc-400'
                  }`}>
                    {c.ai_sentiment.split('—')[0].trim()}
                  </span>
                )}
              </div>
            </Link>
          ))}
          {!calls.length && <p className="text-center text-zinc-600 text-sm py-6">No calls logged yet</p>}
        </div>
      )}

      {tab === 'context' && <AIContextPanel links={links} cims={cims} notes={notes} calls={calls} />}
    </div>
  );
}
