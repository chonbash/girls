import { useNavigate } from 'react-router-dom';
import { useCallback, useRef, useState } from 'react';
import landingSvgRaw from '../assets/landing.svg?raw';
import './Landing.css';

export default function Landing() {
  const navigate = useNavigate();
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const goNext = useCallback(() => {
    navigate('/auth', { replace: true });
  }, [navigate]);

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientY);
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const endY = e.changedTouches[0].clientY;
    const diff = touchStart - endY;
    if (diff > 80) goNext();
    setTouchStart(null);
  };

  const onWheel = (e: React.WheelEvent) => {
    if (e.deltaY > 30) goNext();
  };

  return (
    <div
      ref={containerRef}
      className="landing"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onWheel={onWheel}
    >
      <div className="landing-art">
        <div className="landing-hero">
          <div className="landing-banner-wrap landing-banner-svg-wrap">
            <div
              className="landing-custom-image"
              dangerouslySetInnerHTML={{ __html: landingSvgRaw }}
              role="img"
              aria-label=""
            />
          </div>
          <div className="landing-placeholder">
            <span className="landing-title">8 Марта</span>
            <p className="landing-subtitle">Свайп вверх — продолжить</p>
          </div>
        </div>
      </div>
      <button type="button" className="landing-swipe-hint" onClick={goNext} aria-label="Далее">
        ↑
      </button>
    </div>
  );
}
