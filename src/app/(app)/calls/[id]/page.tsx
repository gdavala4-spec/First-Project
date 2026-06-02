'use client';
import { useState, useEffect, useCallback, use } from 'react';
import type { CallRecord } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Phone, Sparkles, ListChecks, TrendingUp, Mic, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function CallDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [call, setCall] = useState<CallRecord | null>(null);
  const router = useRouter();

  const load = useCallback(async () => {
    const res = await fetch(`/api/calls/${id}`);
    if (!res.ok) { router.push('/calls'); return; }
    setCall(await res.json());
  }, [id, router]);

  useEffect(() => { load(); }, [load]);

  const deleteCall = async () => {
    if (!confirm('Delete this call record?')) return;
    await fetch(`/api/calls/${id}`, { method: 'DELETE' });
    router.push('/calls');
  };

  if (!call) return <div className="p-8 text-zinc-400 text-sm">Loading…</div>;

  const sentimentStyle =
    call.ai_sentiment?.startsWith('positive') ? 'bg-green-500/20 text-green-400 border-green-500/30' :
    call.ai_sentiment?.startsWith('negative') ? 'bg-red-500/20 text-red-400 border-red-500/30' :
    'bg-zinc-800 text-zinc-400 border-zinc-700';

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <Link href="/calls" className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors">
          <ArrowLeft size={14} /> Back to calls
        </Link>
        <button onClick={deleteCall} className="text-zinc-600 hover:text-red-400 transition-colors">
          <Trash2 size={15} />
        </button>
      </div>

      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 mb-6">
        <div className="flex items-start gap-3">
          <div className="bg-orange-500/20 rounded-xl p-2.5">
            <Phone size={18} className="text-orange-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">{call.title}</h1>
            <div className="flex items-center gap-3 mt-1.5 flex-wrap text-xs text-zinc-500">
              {call.recorded_at && (
                <span>{new Date(call.recorded_at).toLocaleString()}</span>
              )}
              {call.duration_seconds && (
                <span className="flex items-center gap-1">
                  <Mic size={10} /> {Math.floor(call.duration_seconds / 60)}m {call.duration_seconds % 60}s
                </span>
              )}
              {call.deal_id && (
                <Link href={`/deals/${call.deal_id}`} className="text-blue-400 hover:text-blue-300">
                  View linked deal →
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {(call.ai_summary || call.ai_action_items || call.ai_sentiment) ? (
        <div className="space-y-4 mb-6">
          {call.ai_summary && (
            <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-5">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={14} className="text-blue-400" />
                <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">AI Summary</h2>
              </div>
              <p className="text-sm text-zinc-300 leading-relaxed">{call.ai_summary}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {call.ai_action_items && (
              <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <ListChecks size={14} className="text-green-400" />
                  <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Action Items</h2>
                </div>
                <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">{call.ai_action_items}</p>
              </div>
            )}
            {call.ai_sentiment && (
              <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp size={14} className="text-yellow-400" />
                  <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Sentiment</h2>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full border ${sentimentStyle}`}>
                  {call.ai_sentiment}
                </span>
              </div>
            )}
          </div>
        </div>
      ) : call.transcript ? (
        <div className="bg-zinc-900 rounded-2xl border border-yellow-900/50 p-5 mb-6">
          <div className="flex items-center gap-2 text-yellow-400 text-sm">
            <Sparkles size={14} className="animate-pulse" />
            AI is analyzing this transcript…
          </div>
          <p className="text-xs text-zinc-500 mt-1">Refresh the page in a moment to see the analysis.</p>
        </div>
      ) : null}

      {call.transcript && (
        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-5">
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">Transcript</h2>
          <pre className="text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed font-mono overflow-auto">
            {call.transcript}
          </pre>
        </div>
      )}
    </div>
  );
}
