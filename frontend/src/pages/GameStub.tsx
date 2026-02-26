import { useParams, useNavigate } from 'react-router-dom';
import { markGameCompleted } from '../games/completed';
import './GameStub.css';

export default function GameStub() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const onDone = () => {
    if (slug) markGameCompleted(slug);
    navigate('/games');
  };

  return (
    <div className="game-stub">
      <h1>Мини-игра: {slug || '...'}</h1>
      <p>Здесь будет игра (заглушка).</p>
      <button type="button" className="game-stub-done" onClick={onDone}>
        Завершить
      </button>
      <button type="button" className="game-stub-back" onClick={() => navigate('/games')}>
        ← К списку игр
      </button>
    </div>
  );
}
