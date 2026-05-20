import type { ContextLink, CIM, Note, CallRecord } from '@/lib/types';
import { Sparkles, FileText, StickyNote, Phone } from 'lucide-react';

interface Props {
  links: ContextLink[];
  cims: CIM[];
  notes: Note[];
  calls?: CallRecord[];
}

const confidenceStyle = (c: number) =>
  c > 0.8 ? 'bg-green-500/20 text-green-400' : c > 0.5 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-zinc-700/50 text-zinc-400';

export default function AIContextPanel({ links, cims, notes, calls = [] }: Props) {
  if (!links.length) {
    return (
      <div className="text-center py-10 text-zinc-600">
        <Sparkles size={28} className="mx-auto mb-2 opacity-30" />
        <p className="text-sm">No AI context links yet.</p>
        <p className="text-xs mt-1">Upload a CIM, add notes, or log a call to trigger AI linking.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {links.map((link) => {
        if (link.source_type === 'cim') {
          const cim = cims.find((c) => c.id === link.source_id);
          return (
            <div key={link.id} className="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
              <div className="flex items-center gap-2">
                <FileText size={14} className="text-purple-400 shrink-0" />
                <span className="text-sm font-medium text-white truncate">{cim?.filename ?? 'CIM Document'}</span>
                <span className={`ml-auto text-xs px-2 py-0.5 rounded-full shrink-0 ${confidenceStyle(link.confidence)}`}>
                  {Math.round(link.confidence * 100)}% match
                </span>
              </div>
              {link.reason && <p className="text-xs text-zinc-400 mt-2">{link.reason}</p>}
            </div>
          );
        }
        if (link.source_type === 'note') {
          const note = notes.find((n) => n.id === link.source_id);
          return (
            <div key={link.id} className="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
              <div className="flex items-center gap-2">
                <StickyNote size={14} className="text-yellow-400 shrink-0" />
                <span className="text-sm font-medium text-white">Note</span>
                <span className={`ml-auto text-xs px-2 py-0.5 rounded-full shrink-0 ${confidenceStyle(link.confidence)}`}>
                  {Math.round(link.confidence * 100)}% match
                </span>
              </div>
              {note && <p className="text-xs text-zinc-500 mt-1.5 truncate">{note.content.slice(0, 100)}</p>}
              {link.reason && <p className="text-xs text-zinc-400 mt-1">{link.reason}</p>}
            </div>
          );
        }
        if (link.source_type === 'call') {
          const call = calls.find((c) => c.id === link.source_id);
          return (
            <div key={link.id} className="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-orange-400 shrink-0" />
                <span className="text-sm font-medium text-white truncate">{call?.title ?? 'Call'}</span>
                <span className={`ml-auto text-xs px-2 py-0.5 rounded-full shrink-0 ${confidenceStyle(link.confidence)}`}>
                  {Math.round(link.confidence * 100)}% match
                </span>
              </div>
              {link.reason && <p className="text-xs text-zinc-400 mt-2">{link.reason}</p>}
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}
