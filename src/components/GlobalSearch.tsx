'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Search, Briefcase, BookOpen, FileText, MessageSquare, StickyNote, Loader2 } from 'lucide-react';
import type { SearchResult } from '@/lib/types';

const TYPE_ICONS: Record<SearchResult['type'], React.ComponentType<{ className?: string }>> = {
  deal: Briefcase,
  thesis: BookOpen,
  cim: FileText,
  note: StickyNote,
  call: MessageSquare,
};

const TYPE_LABELS: Record<SearchResult['type'], string> = {
  deal: 'Deals',
  thesis: 'Theses',
  cim: 'CIMs',
  note: 'Notes',
  call: 'Calls',
};

const TYPE_COLORS: Record<SearchResult['type'], string> = {
  deal: 'text-blue-400',
  thesis: 'text-purple-400',
  cim: 'text-amber-400',
  note: 'text-green-400',
  call: 'text-cyan-400',
};

export default function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const doSearch = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults([]);
      setSearched(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(Array.isArray(data) ? data : []);
      setSearched(true);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      doSearch(query);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, doSearch]);

  // Group results by type
  const grouped = results.reduce<Partial<Record<SearchResult['type'], SearchResult[]>>>(
    (acc, r) => {
      if (!acc[r.type]) acc[r.type] = [];
      acc[r.type]!.push(r);
      return acc;
    },
    {}
  );

  const types = Object.keys(grouped) as SearchResult['type'][];

  return (
    <div className="p-6 max-w-2xl">
      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search deals, notes, CIMs, theses, calls…"
          className="w-full bg-zinc-800 border border-zinc-700 rounded-xl pl-10 pr-10 py-3 text-white text-sm placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          autoFocus
        />
        {loading && (
          <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 animate-spin" />
        )}
      </div>

      {/* Results */}
      <div className="mt-4 space-y-6">
        {query.length >= 2 && !loading && searched && results.length === 0 && (
          <div className="text-center py-12">
            <Search className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
            <p className="text-zinc-400 text-sm font-medium">No results for "{query}"</p>
            <p className="text-zinc-600 text-xs mt-1">Try different keywords</p>
          </div>
        )}

        {types.map((type) => {
          const Icon = TYPE_ICONS[type];
          const items = grouped[type]!;
          return (
            <div key={type}>
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-3.5 h-3.5 ${TYPE_COLORS[type]}`} />
                <span className={`text-xs font-semibold uppercase tracking-wide ${TYPE_COLORS[type]}`}>
                  {TYPE_LABELS[type]}
                </span>
                <span className="text-xs text-zinc-600">({items.length})</span>
              </div>
              <div className="space-y-1">
                {items.map((result) => (
                  <Link
                    key={result.id}
                    href={result.url}
                    className="flex items-start gap-3 p-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-xl transition-all group"
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-zinc-800 group-hover:bg-zinc-700 transition-colors`}>
                      <Icon className={`w-4 h-4 ${TYPE_COLORS[type]}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate group-hover:text-blue-300 transition-colors">
                        {result.title}
                      </p>
                      {result.subtitle && (
                        <p className="text-xs text-zinc-400 mt-0.5 truncate">{result.subtitle}</p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty state hint */}
      {query.length < 2 && (
        <div className="mt-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-zinc-800 mb-3">
            <Search className="w-5 h-5 text-zinc-500" />
          </div>
          <p className="text-zinc-400 text-sm">Start typing to search across your CRM</p>
          <p className="text-zinc-600 text-xs mt-1">Searches deals, notes, CIMs, theses, and calls</p>
        </div>
      )}
    </div>
  );
}
