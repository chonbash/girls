import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { markGameCompleted } from '../completed';
import './FutureLetterGame.css';

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

const MONTH_CONTEXT: Record<number, string> = {
  0: 'Переходный ритм после праздников, мягкий вход в задачи и выравнивание процессов.',
  1: 'Стабилизация темпа и подготовка к планированию следующего квартала.',
  2: 'Закрытие суперспринта Q1 и фиксация ключевых результатов.',
  3: 'Сезон премий и старт планирования Q2, внимание к метрикам и точности.',
  4: 'Ровная нагрузка и спокойная реализация инициатив после весеннего рывка.',
  5: 'Закрытие суперспринта Q2, подведение итогов и уточнение приоритетов.',
  6: 'Планирование Q3 и более спокойный летний ритм работы.',
  7: 'Поддержание темпа, сезонная просадка компенсируется точечной фокусировкой.',
  8: 'Закрытие суперспринта Q3 и сбор метрик перед осенним рывком.',
  9: 'Планирование Q4 и подготовка к высокому сезону в финорганизации.',
  10: 'Высокий сезон: рост нагрузки, усиление внимания к качеству и срокам.',
  11: 'Годовое закрытие, максимальная концентрация и точность исполнения.',
};

type Horizon = 'month' | '5y' | '50y';
type Phase = 'config' | 'owl' | 'open';

type MonthItem = {
  label: string;
  monthIndex: number;
  year: number;
  date: Date;
};

type LetterData = {
  title: string;
  subtitle?: string;
  dateLine?: string;
  greeting: string;
  body: string;
  closing: string;
};

function formatDateRu(date: Date) {
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${dd}.${mm}.${yyyy}`;
}

function getNext12Months(): MonthItem[] {
  const now = new Date();
  const base = new Date(now.getFullYear(), now.getMonth(), 1);
  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date(base.getFullYear(), base.getMonth() + i, 1);
    const label = `${MONTHS_RU[d.getMonth()]} ${d.getFullYear()}`;
    return {
      label,
      monthIndex: d.getMonth(),
      year: d.getFullYear(),
      date: d,
    };
  });
}

function getTemperatureTone(temp: number) {
  if (temp <= 40) {
    return 'Реалистичный и спокойный тон: все достижимо и подкреплено хорошей дисциплиной.';
  }
  if (temp <= 70) {
    return 'Легкая фантастика с оптимизмом: мир чуть смелее, но надежный и дружелюбный.';
  }
  return 'Позитивный постапокалипсис: много перемен, но вы сохраняете тепло и силу.';
}

function buildMonthLetter(
  month: MonthItem,
  temperature: number,
  userName: string
): LetterData {
  const context = MONTH_CONTEXT[month.monthIndex] || '';
  const tone = getTemperatureTone(temperature);
  return {
    title: `Письмо из ${month.label}`,
    greeting: `Привет, ${userName}!`,
    body: `${context} ${tone}`.trim(),
    closing:
      'Ты держишь фокус на важных вещах и не теряешь человеческое тепло даже в плотном графике.',
  };
}

function buildFutureLetter(
  horizon: Horizon,
  temperature: number,
  userName: string
): LetterData {
  const now = new Date();
  if (horizon === '5y') {
    const future = new Date(now.getFullYear() + 5, now.getMonth(), now.getDate());
    return {
      title: 'Письмо от председателя правления одного синего банка',
      subtitle: `Для ${userName}`,
      dateLine: `Дата отправки: ${formatDateRu(future)}`,
      greeting: `Здравствуйте, ${userName}!`,
      body:
        'Мы живем в эпохе тонких решений и новых стандартов. Важные изменения проходят мягко и почти незаметно, как в знакомом фильме, где будущее становится уютным, но требует смелости. ' +
        getTemperatureTone(temperature),
      closing: 'Продолжайте делать свою работу точно и с уважением к людям вокруг.',
    };
  }
  const future = new Date(now.getFullYear() + 50, now.getMonth(), now.getDate());
  return {
    title: 'Письмо от комбинированного киберорганизма председателя правления одного синего банка',
    subtitle: `Для ${userName}`,
    dateLine: `Дата отправки: ${formatDateRu(future)}`,
    greeting: `Здравствуйте, ${userName}!`,
    body:
      'Сеть городов поет тихим электрическим светом, а память о людских решениях все так же важна. Этот мир напоминает известную киноленту о дальнем будущем, но в нем есть место теплу и заботе. ' +
      getTemperatureTone(temperature),
    closing: 'Ваш выбор сегодня делает устойчивым завтрашний день.',
  };
}

export default function FutureLetterGame() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>('config');
  const [selectedHorizon, setSelectedHorizon] = useState<Horizon>('month');
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(0);
  const [temperature, setTemperature] = useState(35);
  const [letter, setLetter] = useState<LetterData | null>(null);
  const [lettersUsed, setLettersUsed] = useState(() => {
    const raw = sessionStorage.getItem(LETTER_COUNT_KEY);
    const parsed = raw ? Number(raw) : 0;
    return Number.isFinite(parsed) ? parsed : 0;
  });

  const userName = (localStorage.getItem('girl_name') || '').trim() || 'друг';
  const months = useMemo(() => getNext12Months(), []);
  const selectedMonth = months[selectedMonthIndex] || months[0];
  const canRequestLetter = lettersUsed < 3;

  const onRequestLetter = () => {
    if (!canRequestLetter) return;
    if (selectedHorizon === 'month' && selectedMonth) {
      setLetter(buildMonthLetter(selectedMonth, temperature, userName));
    } else {
      setLetter(buildFutureLetter(selectedHorizon, temperature, userName));
    }
    setPhase('owl');
  };

  const onOpenLetter = () => {
    if (!letter) return;
    setPhase('open');
    const nextCount = lettersUsed + 1;
    setLettersUsed(nextCount);
    sessionStorage.setItem(LETTER_COUNT_KEY, String(nextCount));
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
                <h2>Месяц</h2>
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

            <div className="panel-block">
              <div className="temp-title">
                <h2>Температура сценария</h2>
                <span>{temperature}</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={temperature}
                onChange={(e) => setTemperature(Number(e.target.value))}
                disabled={phase !== 'config'}
              />
              <div className="temp-labels">
                <span>Реализм</span>
                <span>Постапок</span>
              </div>
              <p className="temp-hint">{getTemperatureTone(temperature)}</p>
            </div>

            <div className="panel-actions">
              <button type="button" onClick={onRequestLetter} disabled={!canRequestLetter || phase !== 'config'}>
                Получить письмо
              </button>
              {!canRequestLetter && (
                <p className="limit-note">Лимит 3 письма за сессию исчерпан.</p>
              )}
            </div>
          </section>

          <section className="future-letter-preview">
            <div className="paper">
              <div className="paper-title">Черновик письма</div>
              <div className="paper-body">
                {letter ? (
                  <>
                    <h3>{letter.title}</h3>
                    {letter.subtitle && <p className="paper-subtitle">{letter.subtitle}</p>}
                    {letter.dateLine && <p className="paper-date">{letter.dateLine}</p>}
                    <p>{letter.greeting}</p>
                    <p>{letter.body}</p>
                    <p>{letter.closing}</p>
                  </>
                ) : (
                  <p>Выбери период и параметры, чтобы увидеть черновик письма.</p>
                )}
              </div>
            </div>
          </section>
        </div>

        {phase === 'owl' && (
          <div className="owl-stage">
            <div className="owl" role="button" tabIndex={0} onClick={onOpenLetter} onKeyDown={onOpenLetterKeyDown}>
              <div className="owl-body">
                <div className="owl-eye" />
                <div className="owl-eye" />
                <div className="owl-wing" />
                <div className="owl-wing" />
                <div className="owl-letter" />
              </div>
              <p>Сова принесла письмо. Нажми, чтобы открыть.</p>
            </div>
          </div>
        )}

        {phase === 'open' && letter && (
          <div className="letter-stage">
            <div className="letter" role="button" tabIndex={0} onClick={onCloseLetter} onKeyDown={onCloseLetterKeyDown}>
              <h2>{letter.title}</h2>
              {letter.subtitle && <p className="paper-subtitle">{letter.subtitle}</p>}
              {letter.dateLine && <p className="paper-date">{letter.dateLine}</p>}
              <p>{letter.greeting}</p>
              <p>{letter.body}</p>
              <p>{letter.closing}</p>
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
