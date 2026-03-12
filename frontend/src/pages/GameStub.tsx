import { useNavigate, useParams } from 'react-router-dom';
import { AppButton, GameShell, StatusMessage, SurfaceCard } from '../components/AppShell';
import { markGameCompleted } from '../games/completed';

export default function GameStub() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  return (
    <GameShell
      title={slug ? `Игра "${slug}"` : 'Мини-игра недоступна'}
      subtitle="Для этого slug пока не зарегистрирован игровой компонент, но общий продуктовый flow сохранён."
      stepLabel="Fallback"
      progressLabel="Нужна регистрация"
    >
      <SurfaceCard>
        <StatusMessage kind="info">
          Эта игра отсутствует в фронтовом реестре. Проверь `frontend/src/games/registry.ts`.
        </StatusMessage>
      </SurfaceCard>
      <div className="game-shell__actions">
        <AppButton
          onClick={() => {
            if (!slug) return;
            markGameCompleted(slug);
            navigate('/games');
          }}
          disabled={!slug}
        >
          Отметить как завершённую
        </AppButton>
      </div>
    </GameShell>
  );
}
