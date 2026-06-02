import { verifyPassword, createSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Briefcase } from 'lucide-react';

async function signIn(formData: FormData) {
  'use server';
  const password = formData.get('password') as string;
  if (verifyPassword(password)) {
    await createSession();
    redirect('/');
  }
  redirect('/sign-in?error=1');
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const hasError = params.error === '1';

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Briefcase size={22} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">DealFlow CRM</h1>
          <p className="text-zinc-400 text-sm mt-1">AI-Native Investment Platform</p>
        </div>

        <form action={signIn} className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 space-y-4">
          <div>
            <label className="text-xs font-medium text-zinc-400 block mb-1.5">
              Password
            </label>
            <input
              type="password"
              name="password"
              required
              autoFocus
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="Enter your password"
            />
          </div>

          {hasError && (
            <p className="text-red-400 text-xs">Incorrect password. Try again.</p>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg px-4 py-2.5 transition-colors"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
