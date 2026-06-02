import { createHmac } from 'node:crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const COOKIE = 'crm_session';
const SESSION_VALUE = 'authenticated';

function sign(value: string): string {
  const secret = process.env.SESSION_SECRET ?? 'dev-secret-change-in-production';
  return createHmac('sha256', secret).update(value).digest('hex');
}

export function verifyPassword(password: string): boolean {
  const appPassword = process.env.APP_PASSWORD;
  if (!appPassword) return false;
  return password === appPassword;
}

export async function createSession(): Promise<void> {
  const token = sign(SESSION_VALUE);
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  });
}

export async function getSession(): Promise<boolean> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return false;
  return token === sign(SESSION_VALUE);
}

export async function requireSession(): Promise<void> {
  const valid = await getSession();
  if (!valid) redirect('/sign-in');
}

export async function clearSession(): Promise<void> {
  (await cookies()).delete(COOKIE);
}
