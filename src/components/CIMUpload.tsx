'use client';
import { useState, useRef } from 'react';
import { Upload, Loader2, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';

interface UploadResult {
  filename: string;
  ai_summary?: string;
  links?: { deal_id: string; confidence: number; reason: string }[];
}

interface Props {
  dealId?: string;
  onSuccess?: (result: UploadResult) => void;
}

export default function CIMUpload({ dealId, onSuccess }: Props) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{ summary: string; links: { confidence: number; reason: string }[] } | null>(null);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = async (file: File) => {
    setUploading(true);
    setError('');
    setResult(null);
    const form = new FormData();
    form.append('file', file);
    if (dealId) form.append('deal_id', dealId);
    try {
      const res = await fetch('/api/ingest', { method: 'POST', body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Upload failed');
      setResult({ summary: data.ai_summary ?? '', links: data.links ?? [] });
      onSuccess?.(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f?.type === 'application/pdf') upload(f); }}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
          dragging ? 'border-blue-500 bg-blue-500/5' : 'border-zinc-700 hover:border-zinc-500'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); }}
        />
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 size={28} className="text-blue-400 animate-spin" />
            <p className="text-sm text-zinc-400">Extracting and analyzing with AI…</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload size={28} className="text-zinc-500" />
            <p className="text-sm font-medium text-zinc-300">Drop CIM PDF here or click to upload</p>
            <p className="text-xs text-zinc-600">AI will extract content and auto-link to relevant deals</p>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 rounded-lg px-3 py-2 border border-red-500/20">
          <AlertCircle size={14} /> {error}
        </div>
      )}

      {result && (
        <div className="bg-zinc-800 rounded-xl p-4 space-y-3 border border-zinc-700">
          <div className="flex items-center gap-2 text-green-400 text-sm font-medium">
            <CheckCircle size={14} /> CIM ingested successfully
          </div>
          {result.summary && (
            <div>
              <div className="flex items-center gap-1.5 text-xs text-zinc-400 mb-1.5">
                <Sparkles size={11} /> AI Summary
              </div>
              <p className="text-sm text-zinc-300">{result.summary}</p>
            </div>
          )}
          {result.links.length > 0 && (
            <div>
              <p className="text-xs text-zinc-500 mb-2">Auto-linked to deals:</p>
              <div className="space-y-1.5">
                {result.links.map((l, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                      l.confidence > 0.8 ? 'bg-green-400' : l.confidence > 0.5 ? 'bg-yellow-400' : 'bg-zinc-500'
                    }`} />
                    <span className="text-zinc-300 font-medium">{Math.round(l.confidence * 100)}%</span>
                    <span className="text-zinc-500">{l.reason}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
