import { apiRequest, apiRequestVoid } from './client';
import type { Girl, HoroscopePredictionAdmin, TarotCardAdmin } from './types';

function adminHeaders(password: string): HeadersInit {
  return { 'X-Admin-Password': password };
}

export function adminUploadImage(password: string, file: File): Promise<{ url: string }> {
  const form = new FormData();
  form.append('file', file);
  return apiRequest<{ url: string }>(
    '/admin/upload',
    {
      method: 'POST',
      headers: adminHeaders(password),
      body: form,
    },
    'Ошибка загрузки',
  );
}

export function adminListGirls(password: string): Promise<Girl[]> {
  return apiRequest<Girl[]>(
    '/admin/girls',
    { headers: adminHeaders(password) },
    'Unauthorized',
  );
}

export function adminCreateGirl(
  password: string,
  name: string,
  email: string,
  giftCertificateUrl?: string | null,
): Promise<Girl> {
  return apiRequest<Girl>(
    '/admin/girls',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...adminHeaders(password),
      },
      body: JSON.stringify({
        name,
        email,
        gift_certificate_url: giftCertificateUrl?.trim() || null,
      }),
    },
    'Failed',
  );
}

export function adminUpdateGirl(
  password: string,
  girlId: number,
  data: { name?: string; email?: string; gift_certificate_url?: string | null },
): Promise<Girl> {
  const body: Record<string, unknown> = {};
  if (data.name !== undefined) body.name = data.name;
  if (data.email !== undefined) body.email = data.email;
  if (data.gift_certificate_url !== undefined) body.gift_certificate_url = data.gift_certificate_url?.trim() || null;

  return apiRequest<Girl>(
    `/admin/girls/${girlId}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...adminHeaders(password),
      },
      body: JSON.stringify(body),
    },
    'Failed',
  );
}

export function adminDeleteGirl(password: string, girlId: number): Promise<void> {
  return apiRequestVoid(
    `/admin/girls/${girlId}`,
    {
      method: 'DELETE',
      headers: adminHeaders(password),
    },
    'Failed',
  );
}

export function adminListTarotCards(password: string): Promise<TarotCardAdmin[]> {
  return apiRequest<TarotCardAdmin[]>(
    '/admin/tarot-cards',
    { headers: adminHeaders(password) },
    'Unauthorized',
  );
}

export function adminCreateTarotCard(
  password: string,
  data: { uuid?: string | null; title: string; description: string; image_url?: string | null; sort_order?: number },
): Promise<TarotCardAdmin> {
  const payload: Record<string, unknown> = {
    title: data.title,
    description: data.description,
    image_url: data.image_url?.trim() || null,
    sort_order: data.sort_order ?? 0,
  };
  if (data.uuid != null && data.uuid.trim() !== '') payload.uuid = data.uuid.trim();

  return apiRequest<TarotCardAdmin>(
    '/admin/tarot-cards',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...adminHeaders(password),
      },
      body: JSON.stringify(payload),
    },
    'Failed',
  );
}

export function adminUpdateTarotCard(
  password: string,
  cardId: number,
  data: Partial<{ title: string; description: string; image_url: string | null; is_active: boolean; sort_order: number }>,
): Promise<TarotCardAdmin> {
  return apiRequest<TarotCardAdmin>(
    `/admin/tarot-cards/${cardId}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...adminHeaders(password),
      },
      body: JSON.stringify(data),
    },
    'Failed',
  );
}

export function adminDeleteTarotCard(password: string, cardId: number): Promise<void> {
  return apiRequestVoid(
    `/admin/tarot-cards/${cardId}`,
    {
      method: 'DELETE',
      headers: adminHeaders(password),
    },
    'Failed',
  );
}

export function adminListHoroscopePredictions(password: string): Promise<HoroscopePredictionAdmin[]> {
  return apiRequest<HoroscopePredictionAdmin[]>(
    '/admin/horoscope-predictions',
    { headers: adminHeaders(password) },
    'Unauthorized',
  );
}

export function adminCreateHoroscopePrediction(
  password: string,
  data: { text: string; sort_order?: number; is_active?: boolean },
): Promise<HoroscopePredictionAdmin> {
  return apiRequest<HoroscopePredictionAdmin>(
    '/admin/horoscope-predictions',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...adminHeaders(password),
      },
      body: JSON.stringify({
        text: data.text,
        sort_order: data.sort_order ?? 0,
        is_active: data.is_active ?? true,
      }),
    },
    'Failed',
  );
}

export function adminUpdateHoroscopePrediction(
  password: string,
  predId: number,
  data: Partial<{ text: string; sort_order: number; is_active: boolean }>,
): Promise<HoroscopePredictionAdmin> {
  return apiRequest<HoroscopePredictionAdmin>(
    `/admin/horoscope-predictions/${predId}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...adminHeaders(password),
      },
      body: JSON.stringify(data),
    },
    'Failed',
  );
}

export function adminDeleteHoroscopePrediction(password: string, predId: number): Promise<void> {
  return apiRequestVoid(
    `/admin/horoscope-predictions/${predId}`,
    {
      method: 'DELETE',
      headers: adminHeaders(password),
    },
    'Failed',
  );
}
