import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getCertificateByToken } from '../api';
import { PageShell, StatusMessage, SurfaceCard } from '../components/AppShell';
import './Certificate.css';

export default function Certificate() {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<{ found: boolean; girl_name?: string } | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    getCertificateByToken(token)
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : 'Не удалось загрузить сертификат'));
  }, [token]);

  return (
    <PageShell
      eyebrow="Финал"
      title="Персональный сертификат"
      subtitle="Завершение единого праздничного маршрута после прохождения всех мини-игр."
    >
      <div className="certificate-layout">
        <SurfaceCard className="certificate-card">
          {data === null && !error && <StatusMessage kind="info">Загрузка сертификата...</StatusMessage>}
          {error && <StatusMessage kind="error">{error}</StatusMessage>}
          {data && !data.found && <StatusMessage kind="error">Сертификат не найден.</StatusMessage>}
          {data?.found && (
            <>
              <span className="certificate-chip">8 Марта • Girls</span>
              <h2>{data.girl_name}</h2>
              <p>
                Поздравляем. Маршрут пройден полностью: вход подтверждён, игры завершены,
                сертификат выпущен.
              </p>
            </>
          )}
        </SurfaceCard>
      </div>
    </PageShell>
  );
}
