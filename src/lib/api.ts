import { firebaseApiFetch } from './firebaseApi';
import type { Category, MasterGoal, Student } from './types';

export const getLocalToken = () => {
  try {
    return localStorage.getItem('admin_token');
  } catch (e) {
    console.warn("localStorage is disabled or not accessible:", e);
    return window.__inMemoryToken || null;
  }
};

export const setLocalToken = (token: string) => {
  try {
    localStorage.setItem('admin_token', token);
  } catch (e) {
    console.warn("localStorage is disabled, storing token in memory:", e);
    window.__inMemoryToken = token;
  }
};

export const removeLocalToken = () => {
  try {
    localStorage.removeItem('admin_token');
  } catch (e) {
    window.__inMemoryToken = null;
  }
};

declare global {
  interface Window {
    __inMemoryToken?: string | null;
  }
}

export const apiFetch = async (url: string, options: RequestInit = {}) => {
  const token = getLocalToken();
  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // Wrap every call in a per-request AbortController so a single hung backend
  // request can never block the entire UI loader forever. 20s is generous
  // for Supabase under load but short enough to surface real failures.
  const isWrite = (options.method || 'GET').toUpperCase() !== 'GET';
  const TIMEOUT_MS = isWrite ? 30000 : 20000;
  const userSignal = (options as any).signal as AbortSignal | undefined;
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(new DOMException('timeout', 'AbortError')), TIMEOUT_MS);
  if (userSignal) {
    if (userSignal.aborted) ctl.abort();
    else userSignal.addEventListener('abort', () => ctl.abort(), { once: true });
  }

  const doFetch = () =>
    url.startsWith('/api/')
      ? firebaseApiFetch(url, { ...options, headers, signal: ctl.signal })
      : fetch(url, { ...options, headers, credentials: 'same-origin', cache: 'no-store', signal: ctl.signal });

  try {
    let res: Response;
    try {
      res = await doFetch();
    } catch (err: any) {
      // One quick retry on transient network blips for idempotent reads only.
      if (!isWrite && err?.name !== 'AbortError') {
        await new Promise((r) => setTimeout(r, 300));
        res = await doFetch();
      } else {
        throw err;
      }
    }
    if (res.status === 401) {
      removeLocalToken();
      window.dispatchEvent(new Event('auth-expired'));
    }
    return res;
  } finally {
    clearTimeout(timer);
  }
};

export const fetchAppData = async () => {
  const [catsRes, goalsRes, studentsRes, settingsRes] = await Promise.all([
    apiFetch('/api/categories'),
    apiFetch('/api/masterGoals'),
    apiFetch('/api/students'),
    apiFetch('/api/settings'),
  ]);

  const cats = catsRes.ok ? await catsRes.json() : [];
  const goals = goalsRes.ok ? await goalsRes.json() : [];
  const stus = studentsRes.ok ? await studentsRes.json() : [];
  let sets = settingsRes.ok ? await settingsRes.json() : {};

  if (!sets || Object.keys(sets).length === 0 || !sets.primaryColor) {
    sets = {
      ...sets,
      primaryColor: { h: 144, s: 29, l: 20 },
      accentColor: { h: 34, s: 62, l: 57 },
      bgColor: { h: 79, s: 29, l: 92 },
      textColor: { h: 144, s: 18, l: 15 },
      appName: sets.appName || 'Tiny Tree',
      badgeTitle: sets.badgeTitle || 'Bonsai Collection',
      heroTitle: sets.heroTitle || 'Bonsai',
      heroSubtitle: sets.heroSubtitle || 'The fascinating and amazing world of Bonsai.'
    };
  }

  if (sets.appName) document.title = sets.appName;
  
  return {
    categories: (Array.isArray(cats) ? cats : []) as Category[],
    masterGoals: (Array.isArray(goals) ? goals : []) as MasterGoal[],
    students: (Array.isArray(stus) ? stus : []) as Student[],
    appSettings: sets
  };
};
