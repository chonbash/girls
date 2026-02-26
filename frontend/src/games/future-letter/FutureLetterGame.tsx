import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { markGameCompleted } from '../completed';

const GAME_SLUG = 'future-letter';

export default function FutureLetterGame() {
  const navigate = useNavigate();
  const [text, setText] = useState('');

  const preview = useMemo(() => {
    const t = text.trim();
    if (!t) return '...';
    return t.length > 220 ? `${t.slice(0, 220)}…` : t;
  }, [text]);

  const onDone = () => {
    markGameCompleted(GAME_SLUG);
    navigate('/games');
  };

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 16px' }}>
      <h1 style={{ margin: '0 0 8px' }}>Письмо из будущего</h1>
      <p style={{ margin: '0 0 16px', opacity: 0.75 }}>
        Заглушка игры: здесь можно будет оформить механику письма/предсказания.
      </p>

      <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>
        Напиши себе сообщение
      </label>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={6}
        placeholder="Например: «Через год ты будешь гордиться тем, что…»"
        style={{
          width: '100%',
          padding: 12,
          borderRadius: 12,
          border: '1px solid rgba(0,0,0,0.15)',
          resize: 'vertical',
        }}
      />

      <div style={{ marginTop: 16, padding: 12, borderRadius: 12, background: 'rgba(0,0,0,0.04)' }}>
        <div style={{ fontSize: 12, opacity: 0.65, marginBottom: 6 }}>Превью:</div>
        <div style={{ whiteSpace: 'pre-wrap' }}>{preview}</div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
        <button type="button" onClick={onDone} style={{ padding: '10px 14px', borderRadius: 12 }}>
          Завершить
        </button>
        <button type="button" onClick={() => navigate('/games')} style={{ padding: '10px 14px', borderRadius: 12 }}>
          ← К списку игр
        </button>
      </div>
    </div>
  );
}

