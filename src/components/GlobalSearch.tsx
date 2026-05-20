'use client';
import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, FileText, Briefcase, BookOpen, StickyNote, Phone, Loader2 } from 'lucide-react';
import type { SearchResult } from '@/lib/types';

const typeConfig = {
  deal: { icon: Briefcase, label: 'Deal', color: 'text-blue-400' },
  note: { icon: StickyNote, label: 'Note', color: 'text-yellow-400' },
  cim: { icon: FileText, label: 'CIM', color: 'text-purple-400' },
  thesis: { icon: BookOpen, label: 'Thesis', color: 'text-green-400' },
  call: { icon: Phone, label: 'Call', color: 'text-orange-400' },
};

export default function GlobalSearch() {
  const [q, setQ] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback((query: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!query.trim()) { setResults([]); setLoading(false); return; }
    setLoading(true);
    timerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        setResults(await res.json());
      } finally {
        setLoading(false);
      }
    }, 300);
  }, []);

  const navigate = (result: SearchResult) => {
    setOpen(false);
    setQ('');
    if (result.type === 'deal') router.push(`/deals/${result.id}`);
    else if (result.type === 'thesis') router.push(`/thesis/${result.id}`);
    else if (result.type === 'call') router.push(`/calls/${result.id}`);
    else if (result.deal_id) router.push(`/deals/${result.deal_id}`);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" size={16} />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 animate-spin" size={14} />
        )}
        <input
          type="text"
          value={q}
          onChange={(e) => { setQ(e.target.value); setOpen(true); search(e.target.value); }}
          onFocus={() => q && setOpen(true)}
          placeholder="Search deals, notes, CIMs, theses, calls…"
          className="w-full bg-zinc-800 border border-zinc-700 rounded-xl pl-9 pr-9 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
        />
      </div>

      {open && q && (
        <div className="absolute top-full mt-2 w-full bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl z-50 overflow-hidden max-h-96 overflow-y-auto">
          {results.length > 0 ? (
            results.map((r) => {
              const cfg = typeConfig[r.type];
              const Icon = cfg.icon;
              return (
                <button
                  key={`${r.type}-${r.id}`}
                  onClick={() => navigate(r)}
                  className="w-full flex items-start gap-3 px-4 py-3 hover:bg-zinc-800 transition-colors text-left border-b border-zinc-800 last:border-0"
                >
                  <Icon size={14} className={`${cfg.color} mt-0.5 shrink-0`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-white text-sm font-medium truncate">{r.title}</span>
                      <span className="text-xs text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded shrink-0">
                        {cfg.label}
                      </span>
                    </div>
                    {r.excerpt && <p className="text-xs text-zinc-400 truncate mt-0.5">{r.excerpt}</p>}
                  </div>
                </button>
              );
            })
          ) : !loading ? (
            <div className="px-4 py-3 text-sm text-zinc-500">No results for &quot;{q}&quot;</div>
          ) : null}
        </div>
      )}
    </div>
  );
}
