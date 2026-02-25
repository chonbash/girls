import { useState, useEffect } from 'react';
import {
  adminListGirls,
  adminCreateGirl,
  adminDeleteGirl,
  type Girl,
} from '../api';
import './Admin.css';

export default function Admin() {
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [error, setError] = useState('');
  const [girls, setGirls] = useState<Girl[]>([]);
  const [loading, setLoading] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');

  const loadGirls = async () => {
    if (!password) return;
    setLoading(true);
    setError('');
    try {
      const list = await adminListGirls(password);
      setGirls(list);
      setAuthenticated(true);
    } catch {
      setError('Неверный пароль');
      setAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const onSubmitPassword = (e: React.FormEvent) => {
    e.preventDefault();
    loadGirls();
  };

  const onAddGirl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !newName.trim() || !newEmail.trim()) return;
    setError('');
    try {
      await adminCreateGirl(password, newName.trim(), newEmail.trim());
      setNewName('');
      setNewEmail('');
      await loadGirls();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка');
    }
  };

  const onDelete = async (id: number) => {
    if (!password) return;
    if (!window.confirm('Удалить?')) return;
    try {
      await adminDeleteGirl(password, id);
      await loadGirls();
    } catch {
      setError('Ошибка удаления');
    }
  };

  if (!authenticated) {
    return (
      <div className="admin-page">
        <form onSubmit={onSubmitPassword} className="admin-login">
          <h1>Админка</h1>
          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="admin-password-input"
            autoFocus
          />
          <button type="submit" disabled={loading}>
            {loading ? '...' : 'Войти'}
          </button>
          {error && <p className="admin-error">{error}</p>}
        </form>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <h1>Список девушек</h1>
      {error && <p className="admin-error">{error}</p>}
      <form onSubmit={onAddGirl} className="admin-form">
        <input
          type="text"
          placeholder="Имя"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
        />
        <button type="submit">Добавить</button>
      </form>
      <ul className="admin-list">
        {girls.map((g) => (
          <li key={g.id} className="admin-item">
            <span>{g.name}</span>
            <span className="admin-email">{g.email}</span>
            <button type="button" onClick={() => onDelete(g.id)} className="admin-delete">
              Удалить
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
