import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getGames, createCertificate, type Game } from '../api';
import { readCompleted } from '../games/completed';
import './Games.css';

export default function Games() {
  const navigate = useNavigate();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState<Set<string>>(readCompleted);

  useEffect(() => {
    getGames()
      .then(setGames)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Re-read completed when page becomes visible (e.g. back from game)
  useEffect(() => {
    const onVis = () => setCompleted(readCompleted());
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  if (loading) {
    return (
      <div className="games-page">
        <p>Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="games-page">
      <h1 className="games-title">Мини-игры</h1>
      <p className="games-hint">Пройди игры и получи сертификат</p>
      <ul className="games-list">
        {games.map((g) => (
          <li key={g.id} className="games-item">
            <span className="games-item-title">{g.title}</span>
            {/* <span className="games-item-status">
              {completed.has(g.slug) ? '✓' : '—'}
            </span> */}
            <button
              type="button"
              className="games-item-go"
              onClick={() => navigate(`/games/${g.slug}`)}
            >
              Играть
            </button>
          </li>
        ))}
      </ul>
      {games.length === 0 && (
        <p className="games-empty">Игр пока нет.</p>
      )}
    </div>
  );
}
