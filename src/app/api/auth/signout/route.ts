import { NextResponse } from 'next/server';
import { clearSession } from '@/lib/auth';

export async function GET() {
  try {
    await clearSession();
    return NextResponse.redirect(new URL('/sign-in', process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'));
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
