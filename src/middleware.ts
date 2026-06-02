import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const COOKIE = 'crm_session';
const SESSION_VALUE = 'authenticated';

async function expectedToken(): Promise<string> {
  const secret = process.env.SESSION_SECRET ?? 'dev-secret-change-in-production';
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(SESSION_VALUE));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/sign-in') || pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE)?.value;
  const expected = await expectedToken();

  if (token !== expected) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
