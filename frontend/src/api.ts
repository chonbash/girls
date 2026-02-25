const API = '/girls/api';

function getAuthHeader(): Record<string, string> {
  const t = localStorage.getItem('access_token');
  return t ? { Authorization: `Bearer ${t}` } : {};
}

export interface Girl {
  id: number;
  name: string;
  email: string;
  is_active: boolean;
  created_at: string;
}

export interface Game {
  id: number;
  slug: string;
  title: string;
  sort_order: number;
  is_active: boolean;
}

export async function getGirls(): Promise<Girl[]> {
  const r = await fetch(`${API}/girls`);
  if (!r.ok) throw new Error('Failed to load girls');
  return r.json();
}

export async function requestCode(girlId: number): Promise<void> {
  const r = await fetch(`${API}/auth/request-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ girl_id: girlId }),
  });
  if (!r.ok) {
    const d = await r.json().catch(() => ({}));
    throw new Error(d.detail || 'Failed to send code');
  }
}

export async function verifyCode(girlId: number, code: string): Promise<{ access_token: string; girl_id: number }> {
  const r = await fetch(`${API}/auth/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ girl_id: girlId, code }),
  });
  if (!r.ok) {
    const d = await r.json().catch(() => ({}));
    throw new Error(Array.isArray(d.detail) ? d.detail[0]?.msg || 'Invalid code' : d.detail || 'Invalid code');
  }
  return r.json();
}

export async function getGames(): Promise<Game[]> {
  const r = await fetch(`${API}/games`);
  if (!r.ok) throw new Error('Failed to load games');
  return r.json();
}

export async function createCertificate(): Promise<{ url: string; token: string }> {
  const r = await fetch(`${API}/certificate`, {
    method: 'POST',
    headers: getAuthHeader(),
  });
  if (!r.ok) throw new Error('Failed to create certificate');
  return r.json();
}

export async function getCertificateByToken(token: string): Promise<{ found: boolean; girl_name?: string }> {
  const r = await fetch(`${API}/certificate/${token}`);
  return r.json();
}

// Admin (password in header)
export async function adminListGirls(password: string): Promise<Girl[]> {
  const r = await fetch(`${API}/admin/girls`, {
    headers: { 'X-Admin-Password': password },
  });
  if (!r.ok) throw new Error('Unauthorized');
  return r.json();
}

export async function adminCreateGirl(password: string, name: string, email: string): Promise<Girl> {
  const r = await fetch(`${API}/admin/girls`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Admin-Password': password },
    body: JSON.stringify({ name, email }),
  });
  if (!r.ok) throw new Error((await r.json().catch(() => ({}))).detail || 'Failed');
  return r.json();
}

export async function adminDeleteGirl(password: string, girlId: number): Promise<void> {
  const r = await fetch(`${API}/admin/girls/${girlId}`, {
    method: 'DELETE',
    headers: { 'X-Admin-Password': password },
  });
  if (!r.ok) throw new Error('Failed');
}
