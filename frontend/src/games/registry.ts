import type { ComponentType } from 'react';
import FutureLetterGame from './future-letter/FutureLetterGame';
import HoroscopeGame from './horoscope/HoroscopeGame';
import TarotGame from './tarot/TarotGame';

export type GameComponent = ComponentType;

export interface GameEntry {
  slug: string;
  Component: GameComponent;
  eyebrow: string;
  title: string;
  summary: string;
}

export const GAMES_REGISTRY: GameEntry[] = [
  {
    slug: 'tarot-cards',
    Component: TarotGame,
    eyebrow: 'Мини-игра',
    title: 'Карты ПроПро',
    summary: 'Задай вопрос, дождись расклада и прочитай три карты в едином игровом сценарии.',
  },
  {
    slug: 'future-letter',
    Component: FutureLetterGame,
    eyebrow: 'Мини-игра',
    title: 'Письмо из будущего',
    summary: 'Выбери горизонт, открой письмо и заверши игру только после результата.',
  },
  {
    slug: 'horoscope',
    Component: HoroscopeGame,
    eyebrow: 'Мини-игра',
    title: 'Гороскоп на день',
    summary: 'Выбери роль, знак и получи персональное предсказание перед завершением игры.',
  },
];

export const GAMES_BY_SLUG: Record<string, GameEntry> = Object.fromEntries(
  GAMES_REGISTRY.map((entry) => [entry.slug, entry]),
);
