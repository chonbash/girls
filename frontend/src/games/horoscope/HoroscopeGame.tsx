import { useState, useEffect, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getHoroscopeRoles,
  getHoroscopeSigns,
  getHoroscopePrediction,
  type HoroscopeRole,
  type HoroscopeSign,
} from '../../api';
import './HoroscopeGame.css';

const COMPLETED_KEY = 'girls_completed_games';
const GAME_SLUG = 'horoscope';

function getCompleted(): Set<string> {
  try {
    const s = sessionStorage.getItem(COMPLETED_KEY);
    return new Set(s ? JSON.parse(s) : []);
  } catch {
    return new Set();
  }
}

function markGameCompleted(slug: string) {
  const set = getCompleted();
  set.add(slug);
  sessionStorage.setItem(COMPLETED_KEY, JSON.stringify([...set]));
}

const EASTER_MARKER_START = '{{EASTER}}';
const EASTER_MARKER_END = '{{/EASTER}}';

function renderPredictionWithEasterEgg(text: string): ReactNode {
  const parts: ReactNode[] = [];
  let rest = text;
  let keyIdx = 0;
  while (rest.length > 0) {
    const startIdx = rest.indexOf(EASTER_MARKER_START);
    if (startIdx === -1) {
      parts.push(rest);
      break;
    }
    parts.push(rest.slice(0, startIdx));
    rest = rest.slice(startIdx + EASTER_MARKER_START.length);
    const endIdx = rest.indexOf(EASTER_MARKER_END);
    if (endIdx === -1) {
      parts.push(EASTER_MARKER_START + rest);
      break;
    }
    parts.push(
      <span key={`easter-${keyIdx++}`} className="horoscope-easter-egg">
        {rest.slice(0, endIdx)}
      </span>
    );
    rest = rest.slice(endIdx + EASTER_MARKER_END.length);
  }
  return parts;
}

type Step = 'role' | 'sign' | 'prediction';

export default function HoroscopeGame() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('role');
  const [roles, setRoles] = useState<HoroscopeRole[]>([]);
  const [signs, setSigns] = useState<HoroscopeSign[]>([]);
  const [selectedRole, setSelectedRole] = useState<HoroscopeRole | null>(null);
  const [, setSelectedSign] = useState<HoroscopeSign | null>(null);
  const [prediction, setPrediction] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [rolesList, signsList] = await Promise.all([
          getHoroscopeRoles(),
          getHoroscopeSigns(),
        ]);
        if (!cancelled) {
          setRoles(rolesList);
          setSigns(signsList);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Ошибка загрузки');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const onSelectRole = (role: HoroscopeRole) => {
    setSelectedRole(role);
    setStep('sign');
    setError('');
  };

  const onSelectSign = (sign: HoroscopeSign) => {
    setSelectedSign(sign);
    setStep('prediction');
    setError('');
    setLoading(true);
    setPrediction(null);
    getHoroscopePrediction(selectedRole!.id, sign.id)
      .then((res) => setPrediction(res.text))
      .catch((e) => setError(e instanceof Error ? e.message : 'Ошибка'))
      .finally(() => setLoading(false));
  };

  const onFinish = () => {
    markGameCompleted(GAME_SLUG);
    navigate('/games');
  };

  const onBackToSigns = () => {
    setSelectedSign(null);
    setPrediction(null);
    setStep('sign');
  };

  const onBackToRoles = () => {
    setSelectedRole(null);
    setSelectedSign(null);
    setPrediction(null);
    setStep('role');
  };

  return (
    <div className="horoscope-game">
      <div className="horoscope-game-inner">
        <h1 className="horoscope-title">Гороскоп на день</h1>

        {step === 'role' && (
          <div className="horoscope-step">
            <p className="horoscope-prompt">Выберите вашу роль в ИТ</p>
            {error && <p className="horoscope-error">{error}</p>}
            <ul className="horoscope-choices">
              {roles.map((r) => (
                <li key={r.id}>
                  <button
                    type="button"
                    className="horoscope-choice-btn"
                    onClick={() => onSelectRole(r)}
                  >
                    {r.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {step === 'sign' && (
          <div className="horoscope-step">
            <p className="horoscope-prompt">Выберите знак зодиака</p>
            {error && <p className="horoscope-error">{error}</p>}
            <ul className="horoscope-choices horoscope-choices-signs">
              {signs.map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    className="horoscope-choice-btn"
                    onClick={() => onSelectSign(s)}
                  >
                    {s.label}
                  </button>
                </li>
              ))}
            </ul>
            <button type="button" className="horoscope-back" onClick={onBackToRoles}>
              ← Назад к ролям
            </button>
          </div>
        )}

        {step === 'prediction' && (
          <div className="horoscope-step horoscope-step-prediction">
            {loading && <p className="horoscope-loading">Готовим предсказание...</p>}
            {error && <p className="horoscope-error">{error}</p>}
            {prediction && !loading && (
              <>
                <div className="horoscope-prediction-box">
                  <p className="horoscope-prediction-text">{renderPredictionWithEasterEgg(prediction)}</p>
                </div>
                <button type="button" className="horoscope-btn-done" onClick={onFinish}>
                  Завершить
                </button>
              </>
            )}
            <button type="button" className="horoscope-back" onClick={onBackToSigns}>
              ← К знакам зодиака
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
