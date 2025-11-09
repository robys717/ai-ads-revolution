export const API_BASE = (import.meta.env.VITE_API_BASE || '').trim(); // '' in prod = stesso host
export async function apiGet(path: string, init?: RequestInit) {
  const res = await fetch(`${API_BASE}/api${path}`, { ...init, credentials: 'same-origin' });
  if (!res.ok) throw new Error(`API ${path} -> ${res.status}`);
  return res.json();
}
