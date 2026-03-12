import { useNavigate } from 'react-router-dom';
import landingSvgRaw from '../assets/landing.svg?raw';
import { AppButton, PageShell, SurfaceCard } from '../components/AppShell';
import './Landing.css';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <PageShell
      eyebrow="8 Марта"
      title="Girls"
      subtitle="Один праздничный маршрут: вход по коду, мини-игры, персональный сертификат и единый продуктовый визуальный язык."
    >
      <div className="landing-grid">
        <SurfaceCard className="landing-art-card" soft>
          <div
            className="landing-custom-image"
            dangerouslySetInnerHTML={{ __html: landingSvgRaw }}
            role="img"
            aria-label="Иллюстрация к 8 Марта"
          />
        </SurfaceCard>
        <SurfaceCard className="landing-story-card">
          <div className="section-header">
            <span className="section-header__label">Праздничный маршрут</span>
            <h2>Один вход, три игры, один сертификат</h2>
            <p>
              Пройди персональный сценарий целиком. Каждая игра теперь встроена в единый поток:
              ввод, взаимодействие, результат и завершение.
            </p>
          </div>
          <div className="landing-points">
            <div className="landing-point">Выбери себя и получи код на email.</div>
            <div className="landing-point">Открой все мини-игры из одного хаба.</div>
            <div className="landing-point">После прохождения получи персональный сертификат.</div>
          </div>
          <div className="app-actions">
            <AppButton onClick={() => navigate('/auth')}>Начать маршрут</AppButton>
          </div>
        </SurfaceCard>
      </div>
    </PageShell>
  );
}
