import { createHmac } from 'node:crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const COOKIE_NAME = 'crm_session';

function computeToken(): string {
  const secret = process.env.SESSION_SECRET ?? 'default-secret';
  return createHmac('sha256', secret).update('authenticated').digest('hex');
}

export function verifyPassword(password: string): boolean {
  return password === process.env.APP_PASSWORD;
}

export async function createSession(): Promise<void> {
  const token = computeToken();
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function getSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(COOKIE_NAME);
  if (!cookie) return false;
  const expected = computeToken();
  return cookie.value === expected;
}

export async function requireSession(): Promise<void> {
  const valid = await getSession();
  if (!valid) {
    redirect('/sign-in');
  }
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
