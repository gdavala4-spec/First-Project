'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Briefcase, BookOpen, Upload, Phone, Search, LogOut } from 'lucide-react';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/deals', label: 'Deals', icon: Briefcase },
  { href: '/thesis', label: 'Thesis', icon: BookOpen },
  { href: '/calls', label: 'Calls', icon: Phone },
  { href: '/ingest', label: 'Ingest CIM', icon: Upload },
];

export default function Navigation() {
  const pathname = usePathname();
  return (
    <aside className="w-56 bg-zinc-900 min-h-screen flex flex-col border-r border-zinc-800 shrink-0">
      <div className="p-5 border-b border-zinc-800">
        <h1 className="text-base font-bold text-white tracking-tight">DealFlow CRM</h1>
        <p className="text-xs text-zinc-500 mt-0.5">AI-Native Investment Platform</p>
      </div>
      <nav className="flex-1 p-3 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
              pathname === href
                ? 'bg-blue-600 text-white'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Icon size={15} />
            {label}
          </Link>
        ))}
      </nav>
      <div className="p-3 border-t border-zinc-800 space-y-0.5">
        <Link
          href="/search"
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
            pathname === '/search'
              ? 'bg-blue-600 text-white'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
          }`}
        >
          <Search size={15} />
          Global Search
        </Link>
        <a
          href="/api/auth/signout"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
        >
          <LogOut size={15} />
          Sign Out
        </a>
      </div>
    </aside>
  );
}
