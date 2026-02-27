import type { ComponentType } from 'react';
import TarotGame from '../pages/TarotGame';
import FutureLetterGame from './future-letter/FutureLetterGame';
import HoroscopeGame from './horoscope/HoroscopeGame';

export type GameComponent = ComponentType;


export interface GameEntry {
  slug: string;
  Component: GameComponent;
}

// Register per-game pages here. If a slug is missing, UI will fall back to a generic stub.
export const GAMES_REGISTRY: GameEntry[] = [
  { slug: 'tarot-cards', Component: TarotGame },
  { slug: 'future-letter', Component: FutureLetterGame },
  { slug: 'horoscope', Component: HoroscopeGame},
];

// Map for O(1) lookup without a function call during render.
export const GAMES_BY_SLUG: Record<string, GameComponent> = Object.fromEntries(
  GAMES_REGISTRY.map((entry) => [entry.slug, entry.Component]),
);


