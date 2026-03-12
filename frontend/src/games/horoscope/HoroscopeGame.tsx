import { useEffect, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getHoroscopePrediction,
  getHoroscopeRoles,
  getHoroscopeSigns,
  type HoroscopeRole,
  type HoroscopeSign,
} from '../../api';
import { AppButton, GameShell, StatusMessage, SurfaceCard } from '../../components/AppShell';
import { markGameCompleted } from '../completed';
import './HoroscopeGame.css';

const GAME_SLUG = 'horoscope';
const EASTER_MARKER_START = '{{EASTER}}';
const EASTER_MARKER_END = '{{/EASTER}}';

type Step = 'role' | 'sign' | 'result';

function renderPrediction(text: string): ReactNode {
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
      <span key={`egg-${keyIdx++}`} className="horoscope-easter">
        {rest.slice(0, endIdx)}
      </span>,
    );
    rest = rest.slice(endIdx + EASTER_MARKER_END.length);
  }

  return parts;
}

export default function HoroscopeGame() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('role');
  const [roles, setRoles] = useState<HoroscopeRole[]>([]);
  const [signs, setSigns] = useState<HoroscopeSign[]>([]);
  const [selectedRole, setSelectedRole] = useState<HoroscopeRole | null>(null);
  const [selectedSign, setSelectedSign] = useState<HoroscopeSign | null>(null);
  const [prediction, setPrediction] = useState('');
  const [loading, setLoading] = useState(true);
  const [predicting, setPredicting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [rolesList, signsList] = await Promise.all([getHoroscopeRoles(), getHoroscopeSigns()]);
        if (!cancelled) {
          setRoles(rolesList);
          setSigns(signsList);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Ошибка загрузки');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const onSelectRole = (role: HoroscopeRole) => {
    setSelectedRole(role);
    setSelectedSign(null);
    setPrediction('');
    setError('');
    setStep('sign');
  };

  const onSelectSign = async (sign: HoroscopeSign) => {
    if (!selectedRole) return;

    setSelectedSign(sign);
    setPredicting(true);
    setError('');
    setPrediction('');

    try {
      const result = await getHoroscopePrediction(selectedRole.id, sign.id);
      setPrediction(result.text);
      setStep('result');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка');
    } finally {
      setPredicting(false);
    }
  };

  return (
    <GameShell
      title="Гороскоп на день"
      subtitle="Выбери роль и знак зодиака, затем заверши игру после получения персонального предсказания."
      stepLabel={step === 'role' ? 'Роль' : step === 'sign' ? 'Знак' : 'Предсказание'}
      progressLabel="2 из 3"
    >
      <SurfaceCard>
        <div className="section-header">
          <span className="section-header__label">Выбор</span>
          <h2>
            {step === 'role'
              ? 'Определи свою роль'
              : step === 'sign'
                ? 'Выбери знак зодиака'
                : 'Твоё предсказание готово'}
          </h2>
          <p>
            {step === 'role'
              ? 'Первый шаг единого сценария: сначала роль в ИТ.'
              : step === 'sign'
                ? 'Второй шаг: знак зодиака для генерации персонального текста.'
                : 'Финальный шаг: прочитать текст и явно завершить игру.'}
          </p>
        </div>

        {loading && <StatusMessage kind="info">Загрузка данных...</StatusMessage>}
        {error && <StatusMessage kind="error">{error}</StatusMessage>}

        {!loading && step === 'role' && (
          <div className="horoscope-options">
            {roles.map((role) => (
              <button key={role.id} type="button" className="horoscope-option" onClick={() => onSelectRole(role)}>
                {role.label}
              </button>
            ))}
          </div>
        )}

        {!loading && step === 'sign' && (
          <div className="horoscope-options">
            {signs.map((sign) => (
              <button key={sign.id} type="button" className="horoscope-option" onClick={() => void onSelectSign(sign)}>
                {sign.label}
              </button>
            ))}
          </div>
        )}

        {predicting && <StatusMessage kind="info">Готовим персональное предсказание...</StatusMessage>}

        {!loading && step === 'result' && prediction && (
          <div className="horoscope-result">
            <div className="horoscope-result__meta">
              <span>{selectedRole?.label}</span>
              <span>{selectedSign?.label}</span>
            </div>
            <p>{renderPrediction(prediction)}</p>
          </div>
        )}
      </SurfaceCard>

      <div className="game-shell__actions">
        {step === 'sign' && (
          <AppButton tone="secondary" onClick={() => setStep('role')}>
            Вернуться к ролям
          </AppButton>
        )}
        {step === 'result' && (
          <>
            <AppButton
              onClick={() => {
                markGameCompleted(GAME_SLUG);
                navigate('/games');
              }}
            >
              Завершить игру
            </AppButton>
            <AppButton
              tone="secondary"
              onClick={() => {
                setStep('role');
                setSelectedRole(null);
                setSelectedSign(null);
                setPrediction('');
                setError('');
              }}
            >
              Составить новый гороскоп
            </AppButton>
          </>
        )}
      </div>
    </GameShell>
  );
}
