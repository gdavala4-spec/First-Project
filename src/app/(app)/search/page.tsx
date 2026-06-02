import GlobalSearch from '@/components/GlobalSearch';
import { Search, Briefcase, FileText, BookOpen, StickyNote, Phone } from 'lucide-react';

export default function SearchPage() {
  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Search size={20} className="text-blue-400" />
          <h1 className="text-2xl font-bold text-white">Global Context Search</h1>
        </div>
        <p className="text-zinc-400 text-sm">Search across every deal, note, CIM, thesis, and call simultaneously</p>
      </div>

      <GlobalSearch />

      <div className="mt-8 grid grid-cols-2 gap-3">
        {[
          { icon: Briefcase, label: 'Deals', color: 'text-blue-400', desc: 'Name, company, description, sector' },
          { icon: FileText, label: 'CIMs', color: 'text-purple-400', desc: 'Filename, AI summary, full text' },
          { icon: StickyNote, label: 'Notes', color: 'text-yellow-400', desc: 'All note content across deals' },
          { icon: BookOpen, label: 'Theses', color: 'text-green-400', desc: 'Title, hypothesis, criteria, research' },
          { icon: Phone, label: 'Calls', color: 'text-orange-400', desc: 'Title, transcript, AI summary' },
        ].map(({ icon: Icon, label, color, desc }) => (
          <div key={label} className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
            <div className="flex items-center gap-2 mb-1">
              <Icon size={14} className={color} />
              <span className="text-sm font-medium text-zinc-300">{label}</span>
            </div>
            <p className="text-xs text-zinc-600">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
