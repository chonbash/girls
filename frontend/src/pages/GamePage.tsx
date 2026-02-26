import { useParams } from 'react-router-dom';
import { getGameComponent } from '../games/registry';
import GameStub from './GameStub';

export default function GamePage() {
  const { slug } = useParams<{ slug: string }>();

  if (!slug) return <GameStub />;

  const Component = getGameComponent(slug);
  if (!Component) return <GameStub />;

  return <Component />;
}

