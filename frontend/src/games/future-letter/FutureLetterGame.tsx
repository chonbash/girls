import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { markGameCompleted } from '../completed';
import './FutureLetterGame.css';
import owlImageUrl from './assets/Pattern2_owl.png?url';
import calendarImageUrl from './assets/Pattern3_calendar.png?url';
import letterImageUrl from './assets/Pattern5_letter.png?url';
import {
  buildLetterTemplate,
  type Horizon,
  type LetterData,
} from './templates';

const GAME_SLUG = 'future-letter';
const LETTER_COUNT_KEY = 'future_letter_count';
const MONTHS_RU = [
  'января',
  'февраля',
  'марта',
  'апреля',
  'мая',
  'июня',
  'июля',
  'августа',
  'сентября',
  'октября',
  'ноября',
  'декабря',
];
type Phase = 'config' | 'owl' | 'open';

type MonthItem = {
  label: string;
  date: Date;
};

function getNext12Months(): MonthItem[] {
  const now = new Date();
  const base = new Date(now.getFullYear(), now.getMonth(), 1);
  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date(base.getFullYear(), base.getMonth() + i, 1);
    const label = `${MONTHS_RU[d.getMonth()]} ${d.getFullYear()}`;
    return {
      label,
      date: d,
    };
  });
}

export default function FutureLetterGame() {
  const navigate = useNavigate();
  const owlOpenedRef = useRef(false);
  const [phase, setPhase] = useState<Phase>('config');
  const [selectedHorizon, setSelectedHorizon] = useState<Horizon>('month');
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(0);
  const [temperature] = useState(35);
  const [letter, setLetter] = useState<LetterData | null>(null);
  const [lettersUsed, setLettersUsed] = useState(() => {
    const raw = sessionStorage.getItem(LETTER_COUNT_KEY);
    const parsed = raw ? Number(raw) : 0;
    return Number.isFinite(parsed) ? parsed : 0;
  });

  const userName = (localStorage.getItem('girl_name') || '').trim() || 'подруга';
  const months = useMemo(() => getNext12Months(), []);
  const selectedMonth = months[selectedMonthIndex] || months[0];
  const canRequestLetter = lettersUsed < 3;

  const onRequestLetter = () => {
    if (!canRequestLetter) return;
    owlOpenedRef.current = false;
    setLetter(
      buildLetterTemplate({
        horizon: selectedHorizon,
        name: userName,
        temperature,
        monthDate: selectedMonth?.date || new Date(),
      })
    );
    setPhase('owl');
  };

  const onOpenLetter = () => {
    if (!letter || owlOpenedRef.current) return;
    owlOpenedRef.current = true;
    setPhase('open');
    setLettersUsed((prev) => {
      const nextCount = prev + 1;
      sessionStorage.setItem(LETTER_COUNT_KEY, String(nextCount));
      return nextCount;
    });
  };

  const onOpenLetterKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onOpenLetter();
    }
  };

  const onCloseLetter = () => {
    setPhase('config');
  };

  const onCloseLetterKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onCloseLetter();
    }
  };

  const onDone = () => {
    markGameCompleted(GAME_SLUG);
    navigate('/games');
  };

  return (
    <div className="future-letter">
      <div className="future-letter-inner">
        <header className="future-letter-header">
          <h1>Письмо из будущего</h1>
          <p className="future-letter-subtitle">
            Настрой параметры и получи письмо, которое прилетит от совы.
          </p>
        </header>

        <div className="future-letter-layout">
          <section className="future-letter-panel">
            <div className="panel-block">
              <h2>Период</h2>
              <div className="horizon-tabs">
                <button
                  type="button"
                  className={selectedHorizon === 'month' ? 'active' : ''}
                  onClick={() => setSelectedHorizon('month')}
                  disabled={phase !== 'config'}
                >
                  12 месяцев
                </button>
                <button
                  type="button"
                  className={selectedHorizon === '5y' ? 'active' : ''}
                  onClick={() => setSelectedHorizon('5y')}
                  disabled={phase !== 'config'}
                >
                  +5 лет
                </button>
                <button
                  type="button"
                  className={selectedHorizon === '50y' ? 'active' : ''}
                  onClick={() => setSelectedHorizon('50y')}
                  disabled={phase !== 'config'}
                >
                  +50 лет
                </button>
              </div>
            </div>

            {selectedHorizon === 'month' && (
              <div className="panel-block">
                <h2 className="panel-title">
                  <img className="panel-icon" src={calendarImageUrl} alt="" aria-hidden />
                  Месяц
                </h2>
                <div className="month-grid">
                  {months.map((m, idx) => (
                    <button
                      key={`${m.label}-${idx}`}
                      type="button"
                      className={selectedMonthIndex === idx ? 'active' : ''}
                      onClick={() => setSelectedMonthIndex(idx)}
                      disabled={phase !== 'config'}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="panel-actions">
              <button type="button" onClick={onRequestLetter} disabled={!canRequestLetter || phase !== 'config'}>
                <img className="btn-icon" src={letterImageUrl} alt="" aria-hidden />
                Получить письмо
              </button>
              {!canRequestLetter && (
                <p className="limit-note">Лимит 3 письма за сессию исчерпан.</p>
              )}
            </div>
          </section>

        </div>

        {phase === 'owl' && (
          <div className="owl-stage">
            <div className="owl" role="button" tabIndex={0} onClick={onOpenLetter} onKeyDown={onOpenLetterKeyDown}>
              <img className="owl-img" src={owlImageUrl} alt="Сова с письмом" />
              <p>Сова принесла письмо. Нажми, чтобы открыть.</p>
            </div>
          </div>
        )}

        {phase === 'open' && letter && (
          <div className="letter-stage">
            <div className="letter" role="button" tabIndex={0} onClick={onCloseLetter} onKeyDown={onCloseLetterKeyDown}>
              <h2>{letter.title}</h2>
              <p className="paper-subtitle">{letter.greeting}</p>
              <p className="paper-meta">{letter.authorLine}</p>
              <p className="paper-date">{letter.dateLine}</p>
              <p>{letter.originBlock}</p>
              <p>{letter.weatherBlock}</p>
              <p>{letter.workBlock}</p>
              <p>{letter.wishBlock}</p>
              <p>{letter.closingLine}</p>
              <p className="paper-sign">{letter.signature}</p>
              <p className="letter-hint">Кликни, чтобы свернуть письмо.</p>
            </div>
            <button
              type="button"
              className="rds-button"
              onClick={onCloseLetter}
              disabled={!canRequestLetter}
            >
              Выставить РДС на сову для получения нового письма
            </button>
            <button type="button" className="letter-done" onClick={onDone}>
              Завершить
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
