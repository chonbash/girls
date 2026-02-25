import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getCertificateByToken } from '../api';
import './Certificate.css';

export default function Certificate() {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<{ found: boolean; girl_name?: string } | null>(null);

  useEffect(() => {
    if (!token) return;
    getCertificateByToken(token).then(setData);
  }, [token]);

  if (data === null) {
    return (
      <div className="certificate-page">
        <p>Загрузка...</p>
      </div>
    );
  }

  if (!data.found) {
    return (
      <div className="certificate-page">
        <p>Сертификат не найден.</p>
      </div>
    );
  }

  return (
    <div className="certificate-page">
      <div className="certificate-card">
        <h1>Сертификат</h1>
        <p className="certificate-name">{data.girl_name}</p>
        <p className="certificate-text">Поздравляем с 8 Марта!</p>
      </div>
    </div>
  );
}
