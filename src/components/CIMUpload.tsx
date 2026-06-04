'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, X } from 'lucide-react';
import type { CIM } from '@/lib/types';

interface UploadResult {
  cim: {
    id: string;
    filename: string;
    ai_summary: string | null;
    deal_id: string | null;
  };
  links: { deal_id: string; confidence: number; reason: string }[];
}

interface CIMWithDeal extends CIM {
  deal_name?: string | null;
}

interface CIMUploadProps {
  initialCIMs?: CIMWithDeal[];
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function CIMUpload({ initialCIMs = [] }: CIMUploadProps) {
  const [cims, setCims] = useState<CIMWithDeal[]>(initialCIMs);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<string>('');
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setError('Only PDF files are accepted.');
      return;
    }

    setUploading(true);
    setError(null);
    setResult(null);
    setProgress('Uploading PDF…');

    try {
      const formData = new FormData();
      formData.append('file', file);

      setProgress('Extracting text from PDF…');
      const res = await fetch('/api/ingest', {
        method: 'POST',
        body: formData,
      });

      setProgress('Claude is analyzing the document…');
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? 'Upload failed');
      }

      const uploadResult = data as UploadResult;
      setResult(uploadResult);
      setProgress('');
      // Add to history
      setCims((prev) => [uploadResult.cim as CIMWithDeal, ...prev]);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setProgress('');
    } finally {
      setUploading(false);
    }
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    // Reset input so same file can be re-uploaded
    e.target.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        onClick={() => !uploading && inputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed p-12 cursor-pointer transition-all select-none ${
          isDragging
            ? 'border-blue-500 bg-blue-950/20'
            : uploading
            ? 'border-zinc-700 bg-zinc-900 cursor-not-allowed'
            : 'border-zinc-700 bg-zinc-900 hover:border-blue-600 hover:bg-blue-950/10'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={onInputChange}
          disabled={uploading}
        />
        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
            uploading ? 'bg-blue-600/20' : isDragging ? 'bg-blue-600/30' : 'bg-zinc-800'
          }`}
        >
          {uploading ? (
            <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Upload className={`w-6 h-6 ${isDragging ? 'text-blue-400' : 'text-zinc-400'}`} />
          )}
        </div>

        {uploading ? (
          <div className="text-center">
            <p className="text-sm font-medium text-blue-400">{progress}</p>
            <p className="text-xs text-zinc-500 mt-1">This may take a moment…</p>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-sm font-medium text-zinc-200">
              {isDragging ? 'Drop the PDF here' : 'Drag & drop a PDF, or click to browse'}
            </p>
            <p className="text-xs text-zinc-500 mt-1">
              PDF files only — Claude will extract text and generate an AI summary
            </p>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-950/40 border border-red-800 rounded-xl">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-400">Upload failed</p>
            <p className="text-sm text-red-300 mt-0.5">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-300">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-zinc-800">
            <div className="w-9 h-9 bg-green-950 rounded-lg flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Upload Successful</p>
              <p className="text-xs text-zinc-400">{result.cim.filename}</p>
            </div>
            <button
              onClick={() => setResult(null)}
              className="ml-auto text-zinc-600 hover:text-zinc-400"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {result.cim.ai_summary && (
            <div className="px-5 py-4 border-b border-zinc-800">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-blue-400" />
                <p className="text-xs font-semibold text-blue-400 uppercase tracking-wide">
                  AI Summary
                </p>
              </div>
              <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
                {result.cim.ai_summary}
              </p>
            </div>
          )}

          {result.links.length > 0 && (
            <div className="px-5 py-4">
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-2">
                Auto-linked Deals ({result.links.length})
              </p>
              <div className="space-y-2">
                {result.links.map((link, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                    <span className="text-xs text-zinc-300 flex-1">{link.reason}</span>
                    <span className="text-xs text-zinc-500 font-mono">
                      {Math.round(link.confidence * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.links.length === 0 && !result.cim.deal_id && (
            <div className="px-5 py-4">
              <p className="text-xs text-zinc-500">
                No deals were auto-linked. You can link this CIM manually from a deal page.
              </p>
            </div>
          )}
        </div>
      )}

      {/* CIM History */}
      {cims.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-zinc-800">
            <h2 className="text-sm font-semibold text-white">
              Uploaded CIMs <span className="text-zinc-500 font-normal">({cims.length})</span>
            </h2>
          </div>
          <div className="divide-y divide-zinc-800">
            {cims.map((cim) => (
              <div key={cim.id} className="px-5 py-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-amber-950/50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <FileText className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{cim.filename}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {cim.deal_name && (
                        <span className="text-xs text-blue-400">Linked: {cim.deal_name}</span>
                      )}
                      <span className="text-xs text-zinc-500">{formatDate(cim.created_at)}</span>
                    </div>
                    {cim.ai_summary && (
                      <p className="text-xs text-zinc-400 mt-1.5 line-clamp-2">{cim.ai_summary}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
