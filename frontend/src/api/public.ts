import { apiRequest, authRequest, jsonRequest } from './client';
import type {
  Game,
  Girl,
  HoroscopePredictionResponse,
  HoroscopeRole,
  HoroscopeSign,
  TarotCard,
  TarotDrawResult,
} from './types';

export function getGirls(): Promise<Girl[]> {
  return apiRequest<Girl[]>('/girls', undefined, 'Failed to load girls');
}

export function requestCode(girlId: number): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(
    '/auth/request-code',
    jsonRequest('POST', { girl_id: girlId }),
    'Failed to send code',
  );
}

export function verifyCode(
  girlId: number,
  code: string,
): Promise<{ access_token: string; token_type: string; girl_id: number }> {
  return apiRequest<{ access_token: string; token_type: string; girl_id: number }>(
    '/auth/verify',
    jsonRequest('POST', { girl_id: girlId, code }),
    'Invalid code',
  );
}

export function getGames(): Promise<Game[]> {
  return apiRequest<Game[]>('/games', undefined, 'Failed to load games');
}

export function createCertificate(): Promise<{ url: string; token: string }> {
  return apiRequest<{ url: string; token: string }>(
    '/certificate',
    authRequest('POST'),
    'Failed to create certificate',
  );
}

export function getCertificateByToken(token: string): Promise<{ found: boolean; girl_name?: string }> {
  return apiRequest<{ found: boolean; girl_name?: string }>(
    `/certificate/${token}`,
    undefined,
    'Failed to load certificate',
  );
}

export function getTarotCards(): Promise<TarotCard[]> {
  return apiRequest<TarotCard[]>('/tarot-cards', undefined, 'Failed to load tarot cards');
}

export function drawTarotCards(question?: string, count = 3): Promise<TarotDrawResult> {
  return apiRequest<TarotDrawResult>(
    '/tarot-cards/draw',
    jsonRequest('POST', { question: question || null, count }),
    'Failed to draw cards',
  );
}

export function getHoroscopeRoles(): Promise<HoroscopeRole[]> {
  return apiRequest<HoroscopeRole[]>('/horoscope/roles', undefined, 'Failed to load roles');
}

export function getHoroscopeSigns(): Promise<HoroscopeSign[]> {
  return apiRequest<HoroscopeSign[]>('/horoscope/signs', undefined, 'Failed to load signs');
}

export function getHoroscopePrediction(
  roleId: string,
  signId: string,
): Promise<HoroscopePredictionResponse> {
  return apiRequest<HoroscopePredictionResponse>(
    `/horoscope/prediction?role_id=${encodeURIComponent(roleId)}&sign_id=${encodeURIComponent(signId)}`,
    undefined,
    'Failed to get prediction',
  );
}
