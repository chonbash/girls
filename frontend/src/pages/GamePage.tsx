import { useParams } from 'react-router-dom';
import { GAMES_BY_SLUG } from '../games/registry';
import GameStub from './GameStub';

export default function GamePage() {
  const { slug } = useParams<{ slug: string }>();

  if (!slug) return <GameStub />;

  const Component = GAMES_BY_SLUG[slug];
  if (!Component) return <GameStub />;

  return <Component />;
}
