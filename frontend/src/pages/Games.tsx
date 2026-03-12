import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCertificate, getGames, type Game } from '../api';
import { AppButton, PageShell, SectionHeader, StatusMessage, SurfaceCard } from '../components/AppShell';
import { readCompleted } from '../games/completed';
import { GAMES_BY_SLUG } from '../games/registry';
import './Games.css';

export default function Games() {
  const navigate = useNavigate();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [completed, setCompleted] = useState<Set<string>>(readCompleted);
  const [finishing, setFinishing] = useState(false);

  useEffect(() => {
    getGames()
      .then(setGames)
      .catch((err) => setError(err instanceof Error ? err.message : 'Не удалось загрузить игры'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const onVisible = () => setCompleted(readCompleted());
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, []);

  const allDone = games.length > 0 && games.every((game) => completed.has(game.slug));

  const onFinish = async () => {
    setFinishing(true);
    setError('');
    try {
      const { url } = await createCertificate();
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось выпустить сертификат');
      setFinishing(false);
    }
  };

  return (
    <PageShell
      eyebrow="Шаг 2"
      title="Хаб мини-игр"
      subtitle="Все мини-игры запускаются из одного списка, а сертификат открывается только после полного прохождения."
      backTo="/auth"
      backLabel="К входу"
    >
      <SurfaceCard>
        <SectionHeader
          label="Прогресс"
          title="Открой каждую игру по очереди"
          description="У каждой игры теперь единый сценарий: ввод, взаимодействие, результат и завершение."
        />
        {loading && <StatusMessage kind="info">Загрузка списка игр...</StatusMessage>}
        {!loading && error && <StatusMessage kind="error">{error}</StatusMessage>}
        {!loading && games.length === 0 && !error && (
          <StatusMessage kind="info">Игр пока нет.</StatusMessage>
        )}
        {!loading && games.length > 0 && (
          <div className="games-list">
            {games.map((game, index) => {
              const entry = GAMES_BY_SLUG[game.slug];
              const done = completed.has(game.slug);
              return (
                <div key={game.id} className={`games-card ${done ? 'games-card--done' : ''}`}>
                  <div className="games-card__meta">
                    <span className="games-card__index">{String(index + 1).padStart(2, '0')}</span>
                    <span className="games-card__status">{done ? 'Завершена' : 'Ожидает прохождения'}</span>
                  </div>
                  <h3>{game.title}</h3>
                  <p>{entry?.summary ?? 'Игра зарегистрирована в API, но для неё не добавлено локальное описание.'}</p>
                  <div className="app-actions">
                    <AppButton onClick={() => navigate(`/games/${game.slug}`)}>
                      {done ? 'Открыть снова' : 'Открыть игру'}
                    </AppButton>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SurfaceCard>
      <SurfaceCard soft>
        <SectionHeader
          label="Финал"
          title="Сертификат доступен после полного прохождения"
          description={allDone ? 'Все игры завершены. Можно выпускать персональный сертификат.' : 'Сначала заверши все игры из списка.'}
        />
        <div className="games-summary">
          <div className="games-summary__item">
            <strong>{completed.size}</strong>
            <span>игр завершено</span>
          </div>
          <div className="games-summary__item">
            <strong>{games.length}</strong>
            <span>игр в маршруте</span>
          </div>
        </div>
        <div className="app-actions">
          <AppButton onClick={onFinish} disabled={!allDone || finishing}>
            {finishing ? 'Выпускаем сертификат...' : 'Получить сертификат'}
          </AppButton>
        </div>
      </SurfaceCard>
    </PageShell>
  );
}
