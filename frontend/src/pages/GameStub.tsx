import { useParams, useNavigate } from 'react-router-dom';
import './GameStub.css';

const COMPLETED_KEY = 'girls_completed_games';

function getCompleted(): Set<string> {
  try {
    const s = sessionStorage.getItem(COMPLETED_KEY);
    return new Set(s ? JSON.parse(s) : []);
  } catch {
    return new Set();
  }
}

function setCompleted(slug: string) {
  const set = getCompleted();
  set.add(slug);
  sessionStorage.setItem(COMPLETED_KEY, JSON.stringify([...set]));
}

export default function GameStub() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const onDone = () => {
    if (slug) setCompleted(slug);
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
