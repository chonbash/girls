import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerByName } from '../api';
import './Auth.css';

export default function Auth() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Введите ваше имя');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const { access_token, girl_name } = await registerByName(trimmed);
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('girl_name', girl_name);
      navigate('/games', { replace: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка входа');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth">
      <h1 className="auth-title">Как к вам обращаться?</h1>
      <form onSubmit={onSubmit} className="auth-code">
        <input
          type="text"
          placeholder="Введите ФИО"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="auth-input"
          autoFocus
          disabled={loading}
        />
        <button type="submit" className="auth-submit" disabled={loading}>
          {loading ? '...' : 'Войти'}
        </button>
      </form>
      {error && <p className="auth-error">{error}</p>}
    </div>
  );
}
