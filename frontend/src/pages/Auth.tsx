import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getGirls, requestCode, verifyCode, type Girl } from '../api';
import { AppButton, PageShell, StatusMessage, SurfaceCard } from '../components/AppShell';
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
      .catch((err) => setError(err instanceof Error ? err.message : 'Не удалось загрузить список'))
      .finally(() => setLoading(false));
  }, []);

  const sendCode = async (girl: Girl) => {
    setSending(true);
    setError('');
    try {
      await requestCode(girl.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка отправки');
    } finally {
      setSending(false);
    }
  };

  const onSelect = (girl: Girl) => {
    setSelected(girl);
    setStep('code');
    setCode('');
    void sendCode(girl);
  };

  const onSubmitCode = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selected) return;

    setError('');
    try {
      const { access_token } = await verifyCode(selected.id, code.trim());
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('girl_name', selected.name);
      navigate('/games', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неверный код');
    }
  };

  return (
    <PageShell
      eyebrow="Шаг 1"
      title="Вход по коду"
      subtitle="Выбери себя, получи код на email и войди в общий игровой маршрут."
      backTo="/"
      backLabel="На заставку"
    >
      <div className="auth-layout">
        <SurfaceCard>
          <div className="section-header">
            <span className="section-header__label">Персональный вход</span>
            <h2>Сначала идентификация, потом игры</h2>
            <p>Список получателей загружается из API. После подтверждения кода откроется единый хаб мини-игр.</p>
          </div>
          {loading && <StatusMessage kind="info">Загрузка списка...</StatusMessage>}
          {!loading && error && step === 'select' && <StatusMessage kind="error">{error}</StatusMessage>}
          {!loading && girls.length === 0 && !error && (
            <StatusMessage kind="info">Список пока пуст.</StatusMessage>
          )}
          {!loading && girls.length > 0 && (
            <div className="auth-list">
              {girls.map((girl) => (
                <button key={girl.id} type="button" className="auth-person" onClick={() => onSelect(girl)}>
                  <strong>{girl.name}</strong>
                  <span>{girl.email}</span>
                </button>
              ))}
            </div>
          )}
        </SurfaceCard>
        <SurfaceCard soft>
          {step === 'select' || !selected ? (
            <div className="auth-side-panel">
              <h3>Что дальше</h3>
              <p>После выбора мы отправим код на корпоративный email и откроем форму подтверждения.</p>
            </div>
          ) : (
            <form className="auth-code-form" onSubmit={onSubmitCode}>
              <div className="section-header">
                <span className="section-header__label">Шаг 2</span>
                <h2>{selected.name}</h2>
                <p>Код отправлен на {selected.email}. Введи его, чтобы попасть в хаб игр.</p>
              </div>
              {error && <StatusMessage kind="error">{error}</StatusMessage>}
              {sending && <StatusMessage kind="info">Отправляем код...</StatusMessage>}
              <input
                className="app-field"
                type="text"
                placeholder="Введи код"
                value={code}
                onChange={(event) => setCode(event.target.value.toUpperCase())}
                autoFocus
              />
              <div className="app-actions">
                <AppButton type="submit">Войти</AppButton>
                <AppButton type="button" tone="secondary" onClick={() => void sendCode(selected)} disabled={sending}>
                  Отправить код повторно
                </AppButton>
                <AppButton
                  type="button"
                  tone="ghost"
                  onClick={() => {
                    setStep('select');
                    setSelected(null);
                    setCode('');
                    setError('');
                  }}
                >
                  Сменить получателя
                </AppButton>
              </div>
            </form>
          )}
        </SurfaceCard>
      </div>
    </PageShell>
  );
}
