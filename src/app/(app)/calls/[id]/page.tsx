'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Phone, Trash2 } from 'lucide-react';
import type { CallRecord } from '@/lib/types';

const sentimentColor: Record<string, string> = {
  positive: 'text-green-400 bg-green-950',
  neutral: 'text-zinc-400 bg-zinc-800',
  negative: 'text-red-400 bg-red-950',
};

export default function CallDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [call, setCall] = useState<CallRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTranscript, setShowTranscript] = useState(false);

  useEffect(() => {
    fetch(`/api/calls/${id}`)
      .then((r) => r.json())
      .then(setCall)
      .finally(() => setLoading(false));
  }, [id]);

  async function handleDelete() {
    if (!confirm('Delete this call log? This cannot be undone.')) return;
    await fetch(`/api/calls/${id}`, { method: 'DELETE' });
    router.push('/calls');
  }

  if (loading) return <div className="flex items-center justify-center h-full text-zinc-400 p-6">Loading…</div>;
  if (!call) {
    return (
      <div className="p-6">
        <p className="text-zinc-400">Call not found.</p>
        <Link href="/calls" className="text-blue-400 hover:underline text-sm mt-2 inline-block">← Back to calls</Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/calls" className="flex items-center gap-1 text-zinc-400 hover:text-white text-sm transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Calls
        </Link>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-4">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Phone className="w-5 h-5 text-zinc-400" />
              <h1 className="text-2xl font-bold text-white">{call.title}</h1>
            </div>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {call.sentiment && (
                <span className={`text-xs px-2.5 py-0.5 rounded-full capitalize font-medium ${sentimentColor[call.sentiment] ?? sentimentColor.neutral}`}>
                  {call.sentiment}
                </span>
              )}
              <span className="text-xs text-zinc-500">{new Date(call.created_at).toLocaleString()}</span>
            </div>
          </div>
          <button
            onClick={handleDelete}
            className="text-red-400 hover:text-red-300 bg-zinc-800 hover:bg-zinc-700 p-1.5 rounded-lg transition-colors flex-shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {call.summary && (
          <div className="mb-5">
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-2">Summary</h3>
            <p className="text-zinc-200 text-sm leading-relaxed">{call.summary}</p>
          </div>
        )}

        {call.action_items && (
          <div className="mb-5">
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-2">Action Items</h3>
            <ul className="space-y-1">
              {call.action_items.split('\n').filter(Boolean).map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                  <span className="text-blue-400 mt-0.5 flex-shrink-0">•</span>
                  {item.replace(/^[-•*]\s*/, '')}
                </li>
              ))}
            </ul>
          </div>
        )}

        {!call.summary && !call.action_items && (
          <p className="text-zinc-500 text-sm italic">No AI analysis — this call was logged without a transcript.</p>
        )}
      </div>

      {call.transcript && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl">
          <button
            onClick={() => setShowTranscript((v) => !v)}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-zinc-800/50 transition-colors rounded-xl"
          >
            <span className="text-sm font-medium text-zinc-300">Full Transcript</span>
            <span className="text-xs text-zinc-500">{showTranscript ? 'Hide' : 'Show'}</span>
          </button>
          {showTranscript && (
            <div className="px-4 pb-4">
              <pre className="text-xs text-zinc-400 whitespace-pre-wrap leading-relaxed font-mono bg-zinc-800/50 rounded-lg p-4 max-h-96 overflow-y-auto">
                {call.transcript}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
