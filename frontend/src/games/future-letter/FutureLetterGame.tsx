import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppButton, GameShell, StatusMessage, SurfaceCard } from '../../components/AppShell';
import { markGameCompleted } from '../completed';
import {
  buildLetterTemplate,
  type Horizon,
  type LetterData,
} from './templates';
import './FutureLetterGame.css';

const GAME_SLUG = 'future-letter';
const LETTER_COUNT_KEY = 'future_letter_count';
const MONTHS_RU = [
  'январь',
  'февраль',
  'март',
  'апрель',
  'май',
  'июнь',
  'июль',
  'август',
  'сентябрь',
  'октябрь',
  'ноябрь',
  'декабрь',
];

type Phase = 'config' | 'delivery' | 'result';

type MonthItem = {
  label: string;
  date: Date;
};

function getNext12Months(): MonthItem[] {
  const now = new Date();
  const base = new Date(now.getFullYear(), now.getMonth(), 1);
  return Array.from({ length: 12 }, (_, index) => {
    const date = new Date(base.getFullYear(), base.getMonth() + index, 1);
    return {
      label: `${MONTHS_RU[date.getMonth()]} ${date.getFullYear()}`,
      date,
    };
  });
}

export default function FutureLetterGame() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>('config');
  const [selectedHorizon, setSelectedHorizon] = useState<Horizon>('month');
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(0);
  const [letter, setLetter] = useState<LetterData | null>(null);
  const [lettersUsed, setLettersUsed] = useState(() => {
    const raw = sessionStorage.getItem(LETTER_COUNT_KEY);
    const parsed = raw ? Number(raw) : 0;
    return Number.isFinite(parsed) ? parsed : 0;
  });

  const months = useMemo(() => getNext12Months(), []);
  const selectedMonth = months[selectedMonthIndex] || months[0];
  const canRequestLetter = lettersUsed < 3;
  const userName = (localStorage.getItem('girl_name') || '').trim() || 'подруга';

  const buildLetter = () => {
    if (!canRequestLetter) return;
    setLetter(
      buildLetterTemplate({
        horizon: selectedHorizon,
        name: userName,
        temperature: 35,
        monthDate: selectedMonth?.date || new Date(),
      }),
    );
    setPhase('delivery');
  };

  const openLetter = () => {
    if (!letter || !canRequestLetter) return;
    setLettersUsed((prev) => {
      const next = prev + 1;
      sessionStorage.setItem(LETTER_COUNT_KEY, String(next));
      return next;
    });
    setPhase('result');
  };

  return (
    <GameShell
      title="Письмо из будущего"
      subtitle="Выбери временной горизонт, дождись доставки и открой письмо как финальный результат игры."
      stepLabel={phase === 'config' ? 'Настройка' : phase === 'delivery' ? 'Доставка' : 'Письмо'}
      progressLabel="3 из 3"
    >
      <SurfaceCard>
        <div className="section-header">
          <span className="section-header__label">Настройка</span>
          <h2>Сформируй письмо</h2>
          <p>Эта игра тоже приведена к единому сценарию: выбор параметров, получение результата, завершение.</p>
        </div>

        <div className="future-letter-stack">
          <div className="future-letter-tabs">
            <button
              type="button"
              className={selectedHorizon === 'month' ? 'future-letter-tab future-letter-tab--active' : 'future-letter-tab'}
              onClick={() => setSelectedHorizon('month')}
              disabled={phase !== 'config'}
            >
              2026
            </button>
            <button
              type="button"
              className={selectedHorizon === '5y' ? 'future-letter-tab future-letter-tab--active' : 'future-letter-tab'}
              onClick={() => setSelectedHorizon('5y')}
              disabled={phase !== 'config'}
            >
              +5 лет
            </button>
            <button
              type="button"
              className={selectedHorizon === '50y' ? 'future-letter-tab future-letter-tab--active' : 'future-letter-tab'}
              onClick={() => setSelectedHorizon('50y')}
              disabled={phase !== 'config'}
            >
              +50 лет
            </button>
          </div>

          {selectedHorizon === 'month' && (
            <div className="future-letter-months">
              {months.map((month, index) => (
                <button
                  key={month.label}
                  type="button"
                  className={selectedMonthIndex === index ? 'future-letter-month future-letter-month--active' : 'future-letter-month'}
                  onClick={() => setSelectedMonthIndex(index)}
                  disabled={phase !== 'config'}
                >
                  {month.label}
                </button>
              ))}
            </div>
          )}

          {!canRequestLetter && (
            <StatusMessage kind="info">Лимит 3 письма за сессию уже достигнут.</StatusMessage>
          )}
        </div>
      </SurfaceCard>

      {phase === 'delivery' && (
        <SurfaceCard soft>
          <div className="section-header">
            <span className="section-header__label">Доставка</span>
            <h2>Письмо готово к открытию</h2>
            <p>Сова больше не открывает отдельный мир. Результат встроен в общий flow игры.</p>
          </div>
          <div className="game-shell__actions">
            <AppButton onClick={openLetter}>Открыть письмо</AppButton>
          </div>
        </SurfaceCard>
      )}

      {phase === 'result' && letter && (
        <SurfaceCard className="future-letter-result">
          <span className="future-letter-result__chip">Результат</span>
          <h2>{letter.title}</h2>
          <div className="future-letter-paper">
            <p className="future-letter-paper__greeting">{letter.greeting}</p>
            <p>{letter.authorLine}</p>
            <p>{letter.dateLine}</p>
            <p>{letter.originBlock}</p>
            <p>{letter.weatherBlock}</p>
            <p>{letter.workBlock}</p>
            <p>{letter.wishBlock}</p>
            <p>{letter.closingLine}</p>
            <p className="future-letter-paper__sign">{letter.signature}</p>
            {letter.postscriptum && <p>{letter.postscriptum}</p>}
          </div>
        </SurfaceCard>
      )}

      <div className="game-shell__actions">
        {phase === 'config' && (
          <AppButton onClick={buildLetter} disabled={!canRequestLetter}>
            Получить письмо
          </AppButton>
        )}
        {phase === 'result' && (
          <>
            <AppButton
              onClick={() => {
                markGameCompleted(GAME_SLUG);
                navigate('/games');
              }}
            >
              Завершить игру
            </AppButton>
            <AppButton tone="secondary" onClick={() => setPhase('config')} disabled={!canRequestLetter}>
              Подготовить новое письмо
            </AppButton>
          </>
        )}
      </div>
    </GameShell>
  );
}
