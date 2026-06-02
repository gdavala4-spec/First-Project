import Navigation from '@/components/Navigation';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Navigation />
      <main className="flex-1 overflow-auto min-h-screen">{children}</main>
    </div>
  );
}
