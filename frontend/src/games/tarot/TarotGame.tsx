import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { drawTarotCards, type TarotCard, type TarotDrawResult } from '../../api.ts';
import tarotCardBack1Url from '../../assets/tarot-card-back-1.svg?url';
import tarotCardBack2Url from '../../assets/tarot-card-back-2.svg?url';
import tarotCardBack3Url from '../../assets/tarot-card-back-3.svg?url';
import { markGameCompleted } from '../completed.ts';
import './TarotGame.css';

type Step = 'question' | 'shuffling' | 'spread';

const SHUFFLE_DURATION_MS = 2000;
const GAME_SLUG = 'tarot-cards';

export default function TarotGame() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('question');
  const [question, setQuestion] = useState('');
  const [drawResult, setDrawResult] = useState<TarotDrawResult | null>(null);
  const [error, setError] = useState('');
  const [visibleCardIndex, setVisibleCardIndex] = useState(-1);
  const questionRef = useRef('');
  const revealTimeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const onFortune = () => {
    setError('');
    questionRef.current = question;
    setStep('shuffling');
  };

  useEffect(() => {
    if (step !== 'shuffling') return;
    const id = setTimeout(async () => {
      try {
        const result = await drawTarotCards(
          (questionRef.current || '').trim() || undefined,
          3
        );
        setDrawResult(result);
        setStep('spread');
        setVisibleCardIndex(0);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Ошибка');
        setStep('question');
      }
    }, SHUFFLE_DURATION_MS);
    return () => {
      clearTimeout(id);
    };
  }, [step]);

  useEffect(() => {
    if (step !== 'spread' || !drawResult) return;
    const t1 = setTimeout(() => setVisibleCardIndex(1), 300);
    const t2 = setTimeout(() => setVisibleCardIndex(2), 600);
    revealTimeoutsRef.current = [t1, t2];
    return () => {
      revealTimeoutsRef.current.forEach(clearTimeout);
      revealTimeoutsRef.current = [];
    };
  }, [step, drawResult]);

  const onDone = () => {
    markGameCompleted(GAME_SLUG);
    navigate('/games');
  };

  return (
    <div className="tarot-game">
      <div className="tarot-game-inner">
        {step === 'question' && (
          <div className="tarot-step tarot-question">
            <h1 className="tarot-title">Гадание на картах ПроПро</h1>
            <p className="tarot-prompt">Спроси колоду о самом сокровенном</p>
            <textarea
              className="tarot-input"
              placeholder="Введите ваш вопрос..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              rows={3}
            />
            {error && <p className="tarot-error">{error}</p>}
            <button type="button" className="tarot-btn tarot-btn-fortune" onClick={onFortune}>
              Погадать
            </button>
          </div>
        )}

        {step === 'shuffling' && (
          <div className="tarot-step tarot-shuffling">
            <p className="tarot-prompt">Колода тасуется...</p>
            <div className="tarot-deck" aria-hidden>
              <div className="tarot-deck-card">
                <img src={tarotCardBack1Url} alt="" className="tarot-deck-card-img" />
              </div>
              <div className="tarot-deck-card">
                <img src={tarotCardBack2Url} alt="" className="tarot-deck-card-img" />
              </div>
              <div className="tarot-deck-card">
                <img src={tarotCardBack3Url} alt="" className="tarot-deck-card-img" />
              </div>
            </div>
          </div>
        )}

        {step === 'spread' && drawResult && (
          <div className="tarot-step tarot-spread">
            <h2 className="tarot-spread-title">Ваш расклад</h2>
            <div className="tarot-cards">
              <CardSlot
                label="Прошлое"
                card={drawResult.past}
                visible={visibleCardIndex >= 0}
                backIndex={0}
              />
              <CardSlot
                label="Настоящее"
                card={drawResult.present}
                visible={visibleCardIndex >= 1}
                backIndex={1}
              />
              <CardSlot
                label="Будущее"
                card={drawResult.future}
                visible={visibleCardIndex >= 2}
                backIndex={2}
              />
            </div>
            <button type="button" className="tarot-btn tarot-btn-done" onClick={onDone}>
              Завершить
            </button>
            <button type="button" className="tarot-back" onClick={() => navigate('/games')}>
              ← К списку игр
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const TAROT_BACK_URLS = [tarotCardBack1Url, tarotCardBack2Url, tarotCardBack3Url];

function CardSlot({
  label,
  card,
  visible,
  backIndex,
}: {
  label: string;
  card: TarotCard;
  visible: boolean;
  backIndex: 0 | 1 | 2;
}) {
  return (
    <div className={`tarot-slot ${visible ? 'tarot-slot-visible' : ''}`}>
      <span className="tarot-slot-label">{label}</span>
      <div className={`tarot-card-flip ${visible ? 'tarot-card-flipped' : ''}`}>
        <div className="tarot-card-flip-inner">
          <div className="tarot-card-back" aria-hidden>
            <img src={TAROT_BACK_URLS[backIndex]} alt="" className="tarot-card-back-img" />
          </div>
          <div className="tarot-card-face">
            <div className="tarot-card-face-inner">
              <h3 className="tarot-card-title">{card.title}</h3>
              <p className="tarot-card-desc">{card.description}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
