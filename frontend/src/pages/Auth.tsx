import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getGirls, requestCode, verifyCode, type Girl } from '../api';
import './Auth.css';

export default function Auth() {
  const navigate = useNavigate();
  const [girls, setGirls] = useState<Girl[]>([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<'select' | 'code'>('select');
  const [selected, setSelected] = useState<Girl | null>(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    getGirls()
      .then(setGirls)
      .catch(() => setError('Не удалось загрузить список'))
      .finally(() => setLoading(false));
  }, []);

  const onSelect = (g: Girl) => {
    setSelected(g);
    setStep('code');
    setCode('');
    setError('');
  };

  const onRequestCode = async () => {
    if (!selected) return;
    setSending(true);
    setError('');
    try {
      await requestCode(selected.id);
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка отправки');
    } finally {
      setSending(false);
    }
  };

  const onSubmitCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    setError('');
    try {
      const { access_token } = await verifyCode(selected.id, code.trim());
      localStorage.setItem('access_token', access_token);
      navigate('/games', { replace: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Неверный код');
    }
  };

  if (loading) {
    return (
      <div className="auth">
        <p>Загрузка...</p>
      </div>
    );
  }

  if (girls.length === 0) {
    return (
      <div className="auth">
        <p>Список пока пуст.</p>
      </div>
    );
  }

  return (
    <div className="auth">
      <h1 className="auth-title">Выбери себя</h1>
      {step === 'select' ? (
        <ul className="auth-list">
          {girls.map((g) => (
            <li key={g.id}>
              <button type="button" className="auth-button" onClick={() => onSelect(g)}>
                {g.name}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="auth-code">
          <p className="auth-selected">Привет, {selected!.name}!</p>
          <p className="auth-hint">Код отправлен на {selected!.email}</p>
          <button
            type="button"
            className="auth-link"
            onClick={onRequestCode}
            disabled={sending}
          >
            {sending ? 'Отправка...' : 'Отправить код повторно'}
          </button>
          <form onSubmit={onSubmitCode}>
            <input
              type="text"
              placeholder="Введи код"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="auth-input"
              autoFocus
            />
            <button type="submit" className="auth-submit">
              Войти
            </button>
          </form>
          {error && <p className="auth-error">{error}</p>}
          <button type="button" className="auth-back" onClick={() => setStep('select')}>
            ← Назад
          </button>
        </div>
      )}
    </div>
  );
}
