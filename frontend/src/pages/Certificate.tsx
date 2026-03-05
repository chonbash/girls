import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { getCertificateByToken } from '../api';
import './Certificate.css';

const POSTCARD_GIF = '/girls/certificate-postcard.gif';

export default function Certificate() {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<{ found: boolean; girl_name?: string } | null>(null);
  const confettiFired = useRef(false);

  useEffect(() => {
    if (!token) return;
    getCertificateByToken(token).then(setData);
  }, [token]);

  useEffect(() => {
    if (!data?.found || confettiFired.current) return;
    confettiFired.current = true;
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
  }, [data]);

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
      <div className="certificate-postcard-wrap">
        {data.girl_name && (
          <p className="certificate-greeting">{data.girl_name}, для тебя</p>
        )}
        <div className="certificate-postcard">
          <img
            src={POSTCARD_GIF}
            alt=""
            className="certificate-postcard-gif"
          />
        </div>
        <p className="certificate-sms-hint">А еще кое-что отправили тебе в СМС</p>
      </div>
    </div>
  );
}
