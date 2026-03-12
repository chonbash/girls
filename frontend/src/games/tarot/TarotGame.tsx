import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { drawTarotCards, type TarotCard, type TarotDrawResult } from '../../api';
import { AppButton, GameShell, StatusMessage, SurfaceCard } from '../../components/AppShell';
import { markGameCompleted } from '../completed';
import './TarotGame.css';

type Step = 'intro' | 'drawing' | 'result';

const GAME_SLUG = 'tarot-cards';

export default function TarotGame() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('intro');
  const [question, setQuestion] = useState('');
  const [drawResult, setDrawResult] = useState<TarotDrawResult | null>(null);
  const [error, setError] = useState('');
  const questionRef = useRef('');

  useEffect(() => {
    if (step !== 'drawing') return;

    const timeoutId = setTimeout(async () => {
      try {
        const result = await drawTarotCards(questionRef.current.trim() || undefined, 3);
        setDrawResult(result);
        setStep('result');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ошибка');
        setStep('intro');
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [step]);

  const onDraw = () => {
    setError('');
    questionRef.current = question;
    setStep('drawing');
  };

  return (
    <GameShell
      title="Карты ПроПро"
      subtitle="Сформулируй вопрос, дождись расклада и прочитай три карты в едином формате результата."
      stepLabel={step === 'intro' ? 'Подготовка' : step === 'drawing' ? 'Расклад' : 'Результат'}
      progressLabel="1 из 3"
    >
      {step === 'intro' && (
        <SurfaceCard>
          <div className="section-header">
            <span className="section-header__label">Ввод</span>
            <h2>Спроси колоду о самом сокровенном</h2>
            <p>Вопрос необязателен, но он помогает оформить единый сюжет расклада.</p>
          </div>
          <div className="app-stack">
            <textarea
              className="app-textarea"
              placeholder="Например: что меня ждёт этой весной?"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
            />
            {error && <StatusMessage kind="error">{error}</StatusMessage>}
            <div className="game-shell__actions">
              <AppButton onClick={onDraw}>Сделать расклад</AppButton>
            </div>
          </div>
        </SurfaceCard>
      )}

      {step === 'drawing' && (
        <SurfaceCard>
          <div className="section-header">
            <span className="section-header__label">Процесс</span>
            <h2>Колода собирает ответ</h2>
            <p>Сейчас формируется расклад из трёх карт: прошлое, настоящее и будущее.</p>
          </div>
          <div className="tarot-loading">
            <div className="tarot-loading__card" />
            <div className="tarot-loading__card" />
            <div className="tarot-loading__card" />
          </div>
        </SurfaceCard>
      )}

      {step === 'result' && drawResult && (
        <>
          <SurfaceCard>
            <div className="section-header">
              <span className="section-header__label">Результат</span>
              <h2>Три карты одного ответа</h2>
              <p>Завершение игры доступно только после показа результата.</p>
            </div>
            <div className="tarot-grid">
              <TarotCardView label="Прошлое" card={drawResult.past} />
              <TarotCardView label="Настоящее" card={drawResult.present} />
              <TarotCardView label="Будущее" card={drawResult.future} />
            </div>
          </SurfaceCard>
          <div className="game-shell__actions">
            <AppButton
              onClick={() => {
                markGameCompleted(GAME_SLUG);
                navigate('/games');
              }}
            >
              Завершить игру
            </AppButton>
            <AppButton tone="secondary" onClick={() => setStep('intro')}>
              Сделать новый расклад
            </AppButton>
          </div>
        </>
      )}
    </GameShell>
  );
}

function TarotCardView({ label, card }: { label: string; card: TarotCard }) {
  return (
    <div className="tarot-card">
      <span className="tarot-card__label">{label}</span>
      <h3>{card.title}</h3>
      <p>{card.description}</p>
    </div>
  );
}
