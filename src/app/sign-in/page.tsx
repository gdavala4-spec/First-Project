import { redirect } from 'next/navigation';
import { verifyPassword, createSession } from '@/lib/auth';

export default function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  async function signIn(formData: FormData) {
    'use server';
    const password = formData.get('password') as string;
    if (!verifyPassword(password)) {
      redirect('/sign-in?error=1');
    }
    await createSession();
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 mb-4">
            <svg
              className="w-7 h-7 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">PE CRM</h1>
          <p className="text-zinc-400 text-sm mt-1">Private Equity Investment Platform</p>
        </div>

        <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
          <h2 className="text-lg font-semibold text-white mb-1">Sign in</h2>
          <p className="text-zinc-400 text-sm mb-5">Enter your password to access the CRM</p>

          <form action={signIn} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-zinc-300 mb-1.5">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoFocus
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm"
                placeholder="Enter password"
              />
            </div>

            {/* We use an async searchParams approach to show error */}
            <ErrorMessage searchParams={searchParams} />

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 rounded-lg transition-colors text-sm"
            >
              Sign in
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

async function ErrorMessage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  if (!params.error) return null;
  return (
    <p className="text-red-400 text-sm bg-red-950/50 border border-red-800 rounded-lg px-3 py-2">
      Incorrect password. Please try again.
    </p>
  );
}
