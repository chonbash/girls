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

export interface HoroscopePredictionResponse {
  text: string;
}

export interface TarotCardAdmin {
  id: number;
  uuid: string;
  title: string;
  description: string;
  image_url: string | null;
  is_active: boolean;
  sort_order: number;
}

export interface HoroscopePredictionAdmin {
  id: number;
  uuid: string;
  text: string;
  sort_order: number;
  is_active: boolean;
}
