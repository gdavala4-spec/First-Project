export const dynamic = 'force-dynamic';

import CIMUpload from '@/components/CIMUpload';
import { Sparkles } from 'lucide-react';

export default function IngestPage() {
  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Ingest CIM</h1>
        <p className="text-zinc-400 text-sm mt-1">
          Upload a PDF — the AI Context Engine extracts content, summarizes it, and links it to relevant deals automatically.
        </p>
      </div>

      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 mb-8">
        <div className="flex items-center gap-2 mb-5">
          <Sparkles size={15} className="text-blue-400" />
          <h2 className="text-sm font-semibold text-white">AI Context Engine</h2>
        </div>
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { n: '1', label: 'Extract', desc: 'PDF text extracted via parser' },
            { n: '2', label: 'Analyze', desc: 'Claude reads and summarizes' },
            { n: '3', label: 'Link', desc: 'Auto-matched to your deals' },
          ].map(({ n, label, desc }) => (
            <div key={n} className="bg-zinc-800 rounded-xl p-3 text-center">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center mx-auto mb-2">
                {n}
              </div>
              <p className="text-xs font-semibold text-white">{label}</p>
              <p className="text-xs text-zinc-500 mt-0.5">{desc}</p>
            </div>
          ))}
        </div>
        <CIMUpload />
      </div>
    </div>
  );
}
