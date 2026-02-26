import type { ComponentType } from 'react';
import TarotGame from '../pages/TarotGame';
import FutureLetterGame from './future-letter/FutureLetterGame';

export type GameComponent = ComponentType;

export interface GameEntry {
  slug: string;
  Component: GameComponent;
}

// Register per-game pages here. If a slug is missing, UI will fall back to a generic stub.
export const GAMES_REGISTRY: GameEntry[] = [
  { slug: 'tarot-cards', Component: TarotGame },
  { slug: 'future-letter', Component: FutureLetterGame },
];

export function getGameComponent(slug: string): GameComponent | null {
  const found = GAMES_REGISTRY.find((g) => g.slug === slug);
  return found ? found.Component : null;
}
