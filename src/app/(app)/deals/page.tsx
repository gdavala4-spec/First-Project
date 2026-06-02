'use client';
import { useState, useEffect, useCallback } from 'react';
import type { Deal } from '@/lib/types';
import DealPipeline from '@/components/DealPipeline';
import { Plus, X } from 'lucide-react';

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', company: '', sector: '', description: '', deal_size: '' });

  const load = useCallback(async () => {
    const res = await fetch('/api/deals');
    setDeals(await res.json());
  }, []);

  useEffect(() => { load(); }, [load]);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/deals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        deal_size: form.deal_size ? parseFloat(form.deal_size) : null,
      }),
    });
    setShowForm(false);
    setForm({ name: '', company: '', sector: '', description: '', deal_size: '' });
    load();
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Deal Pipeline</h1>
          <p className="text-zinc-400 text-sm mt-1">{deals.length} deals across all stages</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={15} /> New Deal
        </button>
      </div>

      <DealPipeline deals={deals} onNewDeal={() => setShowForm(true)} />

      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-white">New Deal</h2>
              <button onClick={() => setShowForm(false)} className="text-zinc-400 hover:text-white">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={create} className="space-y-3">
              {[
                { key: 'name', label: 'Deal Name *', placeholder: 'Acme Corp Series B', required: true },
                { key: 'company', label: 'Company', placeholder: 'Acme Corp', required: false },
                { key: 'sector', label: 'Sector', placeholder: 'SaaS, FinTech, HealthTech…', required: false },
                { key: 'deal_size', label: 'Deal Size (USD)', placeholder: '10000000', required: false },
              ].map(({ key, label, placeholder, required }) => (
                <div key={key}>
                  <label className="block text-xs text-zinc-400 mb-1">{label}</label>
                  <input
                    value={form[key as keyof typeof form]}
                    onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
                    placeholder={placeholder}
                    required={required}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Brief overview…"
                  rows={3}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                />
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm py-2.5 rounded-lg transition-colors font-medium"
                >
                  Create Deal
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm py-2.5 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
