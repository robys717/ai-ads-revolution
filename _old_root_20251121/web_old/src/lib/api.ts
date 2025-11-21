export const API_BASE = (import.meta.env.VITE_API_BASE || '').trim(); // '' in prod = stesso host
export async function apiGet(path: string, init?: RequestInit) {
  const url = `${API_BASE}/api${path}`;
  const res = await fetch(url, { ...init, credentials: 'same-origin' });
  if (!res.ok) throw new Error(`API ${path} -> ${res.status}`);
  return res.json();
}
