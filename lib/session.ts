'use client';

interface SessionUserPayload {
  id: string;
  username: string;
  createdAt?: string;
}

const SESSION_COOKIE = 'mm_session';
const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

const parseCookie = (cookieString: string): SessionUserPayload | null => {
  try {
    const decoded = decodeURIComponent(cookieString);
    return JSON.parse(decoded) as SessionUserPayload;
  } catch {
    return null;
  }
};

const serializeCookie = (payload: SessionUserPayload): string => {
  return encodeURIComponent(JSON.stringify(payload));
};

export const setSessionUser = (payload: SessionUserPayload) => {
  if (typeof document === 'undefined') return;
  document.cookie = `${SESSION_COOKIE}=${serializeCookie(payload)}; Max-Age=${SESSION_MAX_AGE}; Path=/; SameSite=Lax`;
};

export const getSessionUser = (): SessionUserPayload | null => {
  if (typeof document === 'undefined') return null;
  const cookie = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${SESSION_COOKIE}=`));
  if (!cookie) return null;
  return parseCookie(cookie.split('=')[1]);
};

export const clearSessionUser = () => {
  if (typeof document === 'undefined') return;
  document.cookie = `${SESSION_COOKIE}=; Max-Age=0; Path=/; SameSite=Lax`;
};
