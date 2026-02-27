const API = '/girls/api';

function getAuthHeader(): Record<string, string> {
  const t = localStorage.getItem('access_token');
  return t ? { Authorization: `Bearer ${t}` } : {};
}

export interface Girl {
  id: number;
  name: string;
  email: string;
  gift_certificate_url: string | null;
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

// Tarot (ProPro cards)
export interface TarotCard {
  uuid: string;
  title: string;
  description: string;
  image_url: string | null;
}

export interface TarotDrawResult {
  past: TarotCard;
  present: TarotCard;
  future: TarotCard;
}

export async function getTarotCards(): Promise<TarotCard[]> {
  const r = await fetch(`${API}/tarot-cards`);
  if (!r.ok) throw new Error('Failed to load tarot cards');
  return r.json();
}

export async function drawTarotCards(question?: string, count?: number): Promise<TarotDrawResult> {
  const r = await fetch(`${API}/tarot-cards/draw`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question: question || null, count: count ?? 3 }),
  });
  if (!r.ok) {
    const d = await r.json().catch(() => ({}));
    throw new Error(d.detail || 'Failed to draw cards');
  }
  return r.json();
}

// Admin (password in header)
export async function adminUploadImage(password: string, file: File): Promise<{ url: string }> {
  const form = new FormData();
  form.append('file', file);
  const r = await fetch(`${API}/admin/upload`, {
    method: 'POST',
    headers: { 'X-Admin-Password': password },
    body: form,
  });
  if (!r.ok) {
    const err = await r.json().catch(() => ({}));
    throw new Error((err as { detail?: string })?.detail || 'Ошибка загрузки');
  }
  return r.json();
}

export async function adminListGirls(password: string): Promise<Girl[]> {
  const r = await fetch(`${API}/admin/girls`, {
    headers: { 'X-Admin-Password': password },
  });
  if (!r.ok) throw new Error('Unauthorized');
  return r.json();
}

export async function adminCreateGirl(
  password: string,
  name: string,
  email: string,
  giftCertificateUrl?: string | null
): Promise<Girl> {
  const r = await fetch(`${API}/admin/girls`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Admin-Password': password },
    body: JSON.stringify({
      name,
      email,
      gift_certificate_url: giftCertificateUrl?.trim() || null,
    }),
  });
  if (!r.ok) throw new Error((await r.json().catch(() => ({}))).detail || 'Failed');
  return r.json();
}

export async function adminUpdateGirl(
  password: string,
  girlId: number,
  data: { name?: string; email?: string; gift_certificate_url?: string | null }
): Promise<Girl> {
  const body: Record<string, unknown> = {};
  if (data.name !== undefined) body.name = data.name;
  if (data.email !== undefined) body.email = data.email;
  if (data.gift_certificate_url !== undefined) body.gift_certificate_url = data.gift_certificate_url?.trim() || null;
  const r = await fetch(`${API}/admin/girls/${girlId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'X-Admin-Password': password },
    body: JSON.stringify(body),
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

// Admin tarot cards
export interface TarotCardAdmin {
  id: number;
  uuid: string;
  title: string;
  description: string;
  image_url: string | null;
  is_active: boolean;
  sort_order: number;
}

export async function adminListTarotCards(password: string): Promise<TarotCardAdmin[]> {
  const r = await fetch(`${API}/admin/tarot-cards`, {
    headers: { 'X-Admin-Password': password },
  });
  if (!r.ok) throw new Error('Unauthorized');
  return r.json();
}

export async function adminCreateTarotCard(
  password: string,
  data: { uuid?: string | null; title: string; description: string; image_url?: string | null; sort_order?: number }
): Promise<TarotCardAdmin> {
  const payload: Record<string, unknown> = {
    title: data.title,
    description: data.description,
    image_url: data.image_url?.trim() || null,
    sort_order: data.sort_order ?? 0,
  };
  if (data.uuid != null && data.uuid.trim() !== '') payload.uuid = data.uuid.trim();
  const r = await fetch(`${API}/admin/tarot-cards`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Admin-Password': password },
    body: JSON.stringify(payload),
  });
  const res = await r.json().catch(() => ({}));
  if (!r.ok) {
    const detail = res && (typeof (res as { detail?: unknown }).detail === 'string' ? (res as { detail: string }).detail : JSON.stringify((res as { detail?: unknown }).detail));
    throw new Error(detail || 'Failed');
  }
  return res as TarotCardAdmin;
}

export async function adminUpdateTarotCard(
  password: string,
  cardId: number,
  data: Partial<{ title: string; description: string; image_url: string | null; is_active: boolean; sort_order: number }>
): Promise<TarotCardAdmin> {
  const r = await fetch(`${API}/admin/tarot-cards/${cardId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'X-Admin-Password': password },
    body: JSON.stringify(data),
  });
  if (!r.ok) throw new Error((await r.json().catch(() => ({}))).detail || 'Failed');
  return r.json();
}

export async function adminDeleteTarotCard(password: string, cardId: number): Promise<void> {
  const r = await fetch(`${API}/admin/tarot-cards/${cardId}`, {
    method: 'DELETE',
    headers: { 'X-Admin-Password': password },
  });
  if (!r.ok) throw new Error('Failed');
}

// Horoscope (8 March mini-game)
export interface HoroscopeRole {
  id: string;
  label: string;
  label_rod: string;
}

export interface HoroscopeSign {
  id: string;
  label: string;
  label_rod: string;
}

export async function getHoroscopeRoles(): Promise<HoroscopeRole[]> {
  const r = await fetch(`${API}/horoscope/roles`);
  if (!r.ok) throw new Error('Failed to load roles');
  return r.json();
}

export async function getHoroscopeSigns(): Promise<HoroscopeSign[]> {
  const r = await fetch(`${API}/horoscope/signs`);
  if (!r.ok) throw new Error('Failed to load signs');
  return r.json();
}

export async function getHoroscopePrediction(roleId: string, signId: string): Promise<{ text: string }> {
  // #region agent log
  fetch('http://127.0.0.1:7252/ingest/4fab8e05-2547-4b63-9f93-0997be3825ed', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      location: 'api.ts:getHoroscopePrediction',
      message: 'prediction request start',
      data: { roleId, signId, roleIdType: typeof roleId, signIdType: typeof signId },
      timestamp: Date.now(),
      hypothesisId: 'H4',
    }),
  }).catch(() => {});
  // #endregion
  const r = await fetch(
    `${API}/horoscope/prediction?role_id=${encodeURIComponent(roleId)}&sign_id=${encodeURIComponent(signId)}`
  );
  if (!r.ok) {
    const text = await r.text();
    let d: { detail?: string } = {};
    try {
      d = JSON.parse(text);
    } catch {
      d = {};
    }
    const detail = (d as { detail?: string })?.detail || 'Failed to get prediction';
    // #region agent log
    fetch('http://127.0.0.1:7252/ingest/4fab8e05-2547-4b63-9f93-0997be3825ed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'api.ts:getHoroscopePrediction',
        message: 'prediction request failed',
        data: { status: r.status, statusText: r.statusText, bodyPreview: text.slice(0, 200), parsedDetail: (d as { detail?: string })?.detail },
        timestamp: Date.now(),
        hypothesisId: 'H1,H2,H3,H5',
      }),
    }).catch(() => {});
    // #endregion
    throw new Error(detail);
  }
  return r.json();
}

// Admin horoscope predictions
export interface HoroscopePredictionAdmin {
  id: number;
  uuid: string;
  text: string;
  sort_order: number;
  is_active: boolean;
}

export async function adminListHoroscopePredictions(password: string): Promise<HoroscopePredictionAdmin[]> {
  const r = await fetch(`${API}/admin/horoscope-predictions`, {
    headers: { 'X-Admin-Password': password },
  });
  if (!r.ok) throw new Error('Unauthorized');
  return r.json();
}

export async function adminCreateHoroscopePrediction(
  password: string,
  data: { text: string; sort_order?: number; is_active?: boolean }
): Promise<HoroscopePredictionAdmin> {
  const r = await fetch(`${API}/admin/horoscope-predictions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Admin-Password': password },
    body: JSON.stringify({
      text: data.text,
      sort_order: data.sort_order ?? 0,
      is_active: data.is_active ?? true,
    }),
  });
  if (!r.ok) throw new Error((await r.json().catch(() => ({}))).detail || 'Failed');
  return r.json();
}

export async function adminUpdateHoroscopePrediction(
  password: string,
  predId: number,
  data: Partial<{ text: string; sort_order: number; is_active: boolean }>
): Promise<HoroscopePredictionAdmin> {
  const r = await fetch(`${API}/admin/horoscope-predictions/${predId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'X-Admin-Password': password },
    body: JSON.stringify(data),
  });
  if (!r.ok) throw new Error((await r.json().catch(() => ({}))).detail || 'Failed');
  return r.json();
}

export async function adminDeleteHoroscopePrediction(password: string, predId: number): Promise<void> {
  const r = await fetch(`${API}/admin/horoscope-predictions/${predId}`, {
    method: 'DELETE',
    headers: { 'X-Admin-Password': password },
  });
  if (!r.ok) throw new Error('Failed');
}
