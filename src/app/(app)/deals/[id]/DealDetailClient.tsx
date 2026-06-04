'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Building2,
  TrendingUp,
  Calendar,
  StickyNote,
  FileText,
  Phone,
  Plus,
  Trash2,
  Edit3,
  Check,
  X,
} from 'lucide-react';
import type { Deal, Note, CIM, CallRecord, DealStage } from '@/lib/types';

const STAGES: { key: DealStage; label: string }[] = [
  { key: 'prospecting', label: 'Prospecting' },
  { key: 'diligence', label: 'Diligence' },
  { key: 'term_sheet', label: 'Term Sheet' },
  { key: 'closed_won', label: 'Closed Won' },
  { key: 'closed_lost', label: 'Closed Lost' },
];

const STAGE_COLORS: Record<string, string> = {
  prospecting: 'bg-zinc-700 text-zinc-300',
  diligence: 'bg-blue-900/60 text-blue-300',
  term_sheet: 'bg-amber-900/60 text-amber-300',
  closed_won: 'bg-green-900/60 text-green-300',
  closed_lost: 'bg-red-900/60 text-red-400',
};

function formatDealSize(size: number | null): string {
  if (!size) return 'N/A';
  if (size >= 1_000_000_000) return `$${(size / 1_000_000_000).toFixed(1)}B`;
  if (size >= 1_000_000) return `$${(size / 1_000_000).toFixed(1)}M`;
  if (size >= 1_000) return `$${(size / 1_000).toFixed(0)}K`;
  return `$${size}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

interface Props {
  deal: Deal;
  initialNotes: Note[];
  linkedCIMs: CIM[];
  linkedCalls: CallRecord[];
  stageLabels: Record<string, string>;
}

export default function DealDetailClient({
  deal: initialDeal,
  initialNotes,
  linkedCIMs,
  linkedCalls,
  stageLabels,
}: Props) {
  const router = useRouter();
  const [deal, setDeal] = useState<Deal>(initialDeal);
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [newNote, setNewNote] = useState('');
  const [addingNote, setAddingNote] = useState(false);
  const [editingStage, setEditingStage] = useState(false);
  const [editingDeal, setEditingDeal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: deal.name,
    company: deal.company,
    deal_size: deal.deal_size?.toString() ?? '',
    sector: deal.sector ?? '',
    description: deal.description ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleStageChange(stage: DealStage) {
    setEditingStage(false);
    if (stage === deal.stage) return;
    const prev = deal;
    setDeal((d) => ({ ...d, stage }));
    try {
      await fetch(`/api/deals/${deal.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage }),
      });
    } catch {
      setDeal(prev);
    }
  }

  async function handleSaveEdit() {
    setSaving(true);
    try {
      const res = await fetch(`/api/deals/${deal.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editForm.name,
          company: editForm.company,
          deal_size: editForm.deal_size ? Number(editForm.deal_size) : null,
          sector: editForm.sector || null,
          description: editForm.description || null,
        }),
      });
      const updated = await res.json();
      setDeal(updated);
      setEditingDeal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  async function handleAddNote() {
    if (!newNote.trim()) return;
    setAddingNote(true);
    try {
      const res = await fetch(`/api/deals/${deal.id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newNote.trim() }),
      });
      const note: Note = await res.json();
      setNotes((prev) => [note, ...prev]);
      setNewNote('');
    } catch (err) {
      console.error(err);
    } finally {
      setAddingNote(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this deal permanently?')) return;
    setDeleting(true);
    try {
      await fetch(`/api/deals/${deal.id}`, { method: 'DELETE' });
      router.push('/deals');
    } catch (err) {
      console.error(err);
      setDeleting(false);
    }
  }

  return (
    <div className="p-6 max-w-5xl space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-zinc-400">
        <Link href="/deals" className="flex items-center gap-1 hover:text-zinc-200 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          Deal Pipeline
        </Link>
        <span>/</span>
        <span className="text-zinc-200 truncate">{deal.name}</span>
      </div>

      {/* Header */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {editingDeal ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-lg font-bold focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-zinc-400 mb-1 block">Company</label>
                    <input
                      type="text"
                      value={editForm.company}
                      onChange={(e) => setEditForm((p) => ({ ...p, company: e.target.value }))}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400 mb-1 block">Deal Size ($)</label>
                    <input
                      type="number"
                      value={editForm.deal_size}
                      onChange={(e) => setEditForm((p) => ({ ...p, deal_size: e.target.value }))}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400 mb-1 block">Sector</label>
                    <input
                      type="text"
                      value={editForm.sector}
                      onChange={(e) => setEditForm((p) => ({ ...p, sector: e.target.value }))}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Description</label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))}
                    rows={3}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingDeal(false)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs transition-colors"
                  >
                    <X className="w-3 h-3" /> Cancel
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    disabled={saving}
                    className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                  >
                    <Check className="w-3 h-3" /> {saving ? 'Saving…' : 'Save'}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-white">{deal.name}</h1>
                <div className="flex flex-wrap items-center gap-3 mt-2">
                  <div className="flex items-center gap-1.5 text-zinc-400 text-sm">
                    <Building2 className="w-3.5 h-3.5" />
                    {deal.company}
                  </div>
                  {deal.deal_size && (
                    <div className="flex items-center gap-1.5 text-blue-400 text-sm font-medium">
                      <TrendingUp className="w-3.5 h-3.5" />
                      {formatDealSize(deal.deal_size)}
                    </div>
                  )}
                  {deal.sector && (
                    <span className="text-xs bg-zinc-800 text-zinc-300 px-2 py-1 rounded-full">{deal.sector}</span>
                  )}
                  <div className="flex items-center gap-1.5 text-zinc-500 text-xs">
                    <Calendar className="w-3 h-3" />
                    Added {formatDate(deal.created_at)}
                  </div>
                </div>
                {deal.description && (
                  <p className="text-sm text-zinc-400 mt-3 leading-relaxed">{deal.description}</p>
                )}
              </>
            )}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Stage badge / selector */}
            <div className="relative">
              <button
                onClick={() => setEditingStage(!editingStage)}
                className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${STAGE_COLORS[deal.stage] ?? 'bg-zinc-700 text-zinc-300'}`}
              >
                {stageLabels[deal.stage] ?? deal.stage}
              </button>
              {editingStage && (
                <div className="absolute right-0 top-8 z-10 bg-zinc-900 border border-zinc-700 rounded-xl overflow-hidden shadow-xl min-w-36">
                  {STAGES.map((s) => (
                    <button
                      key={s.key}
                      onClick={() => handleStageChange(s.key)}
                      className={`w-full text-left px-3 py-2 text-xs hover:bg-zinc-800 transition-colors ${
                        deal.stage === s.key ? 'text-blue-400 font-medium' : 'text-zinc-300'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {!editingDeal && (
              <button
                onClick={() => {
                  setEditForm({
                    name: deal.name,
                    company: deal.company,
                    deal_size: deal.deal_size?.toString() ?? '',
                    sector: deal.sector ?? '',
                    description: deal.description ?? '',
                  });
                  setEditingDeal(true);
                }}
                className="p-1.5 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={handleDelete}
              disabled={deleting}
              className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Notes — takes 2 cols */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3.5 border-b border-zinc-800">
              <StickyNote className="w-4 h-4 text-green-400" />
              <h2 className="text-sm font-semibold text-white">Notes</h2>
              <span className="text-xs text-zinc-500 ml-auto">{notes.length} note{notes.length !== 1 ? 's' : ''}</span>
            </div>

            {/* Add note */}
            <div className="p-4 border-b border-zinc-800">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add a note…"
                rows={3}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    handleAddNote();
                  }
                }}
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-zinc-600">Cmd+Enter to save</span>
                <button
                  onClick={handleAddNote}
                  disabled={addingNote || !newNote.trim()}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-xs font-medium transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  {addingNote ? 'Adding…' : 'Add Note'}
                </button>
              </div>
            </div>

            {/* Notes list */}
            <div className="divide-y divide-zinc-800">
              {notes.length === 0 && (
                <p className="text-sm text-zinc-500 text-center py-8">No notes yet. Add your first note above.</p>
              )}
              {notes.map((note) => (
                <div key={note.id} className="px-5 py-4">
                  <p className="text-sm text-zinc-200 leading-relaxed whitespace-pre-wrap">{note.content}</p>
                  <p className="text-xs text-zinc-600 mt-2">{formatDate(note.created_at)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          {/* Linked CIMs */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800">
              <FileText className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-semibold text-white">CIMs</h2>
              <span className="text-xs text-zinc-500 ml-auto">{linkedCIMs.length}</span>
            </div>
            <div className="divide-y divide-zinc-800">
              {linkedCIMs.length === 0 && (
                <div className="px-4 py-3 text-xs text-zinc-500">
                  No CIMs linked.{' '}
                  <Link href="/ingest" className="text-blue-400 hover:underline">Upload a CIM</Link>
                </div>
              )}
              {linkedCIMs.map((cim) => (
                <div key={cim.id} className="px-4 py-3">
                  <p className="text-xs font-medium text-zinc-200 truncate">{cim.filename}</p>
                  {cim.ai_summary && (
                    <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{cim.ai_summary}</p>
                  )}
                  <p className="text-xs text-zinc-600 mt-1">{formatDate(cim.created_at)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Linked Calls */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800">
              <Phone className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-semibold text-white">Calls</h2>
              <span className="text-xs text-zinc-500 ml-auto">{linkedCalls.length}</span>
            </div>
            <div className="divide-y divide-zinc-800">
              {linkedCalls.length === 0 && (
                <div className="px-4 py-3 text-xs text-zinc-500">
                  No calls linked.{' '}
                  <Link href="/calls" className="text-blue-400 hover:underline">Log a call</Link>
                </div>
              )}
              {linkedCalls.map((call) => (
                <Link
                  key={call.id}
                  href={`/calls/${call.id}`}
                  className="block px-4 py-3 hover:bg-zinc-800 transition-colors"
                >
                  <p className="text-xs font-medium text-zinc-200 truncate">{call.title}</p>
                  {call.sentiment && (
                    <span className={`text-xs ${
                      call.sentiment === 'positive' ? 'text-green-400' :
                      call.sentiment === 'negative' ? 'text-red-400' : 'text-zinc-400'
                    }`}>
                      {call.sentiment}
                    </span>
                  )}
                  <p className="text-xs text-zinc-600 mt-0.5">{formatDate(call.created_at)}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
