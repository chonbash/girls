import { useRef, useState } from 'react';
import {
  adminListGirls,
  adminCreateGirl,
  adminUpdateGirl,
  adminDeleteGirl,
  adminListTarotCards,
  adminCreateTarotCard,
  adminUpdateTarotCard,
  adminDeleteTarotCard,
  adminUploadImage,
  adminListHoroscopePredictions,
  adminCreateHoroscopePrediction,
  adminUpdateHoroscopePrediction,
  adminDeleteHoroscopePrediction,
  type Girl,
  type TarotCardAdmin,
  type HoroscopePredictionAdmin,
} from '../api';

function PencilIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    </svg>
  );
}
import './Admin.css';

export default function Admin() {
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [error, setError] = useState('');
  const [girls, setGirls] = useState<Girl[]>([]);
  const [loading, setLoading] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newGiftCertificateUrl, setNewGiftCertificateUrl] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editGiftCertificateUrl, setEditGiftCertificateUrl] = useState('');
  const [cards, setCards] = useState<TarotCardAdmin[]>([]);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [newCardDescription, setNewCardDescription] = useState('');
  const [newCardImageUrl, setNewCardImageUrl] = useState('');
  const [editingCardId, setEditingCardId] = useState<number | null>(null);
  const [editCardTitle, setEditCardTitle] = useState('');
  const [editCardDescription, setEditCardDescription] = useState('');
  const [editCardImageUrl, setEditCardImageUrl] = useState('');
  const [editCardActive, setEditCardActive] = useState(true);
  const [editCardSortOrder, setEditCardSortOrder] = useState(0);
  const [uploadingCardImage, setUploadingCardImage] = useState(false);
  const addCardFileRef = useRef<HTMLInputElement>(null);
  const editCardFileRef = useRef<HTMLInputElement>(null);
  const [predictions, setPredictions] = useState<HoroscopePredictionAdmin[]>([]);
  const [newPredictionText, setNewPredictionText] = useState('');
  const [editingPredId, setEditingPredId] = useState<number | null>(null);
  const [editPredictionText, setEditPredictionText] = useState('');
  const [editPredictionSortOrder, setEditPredictionSortOrder] = useState(0);
  const [editPredictionActive, setEditPredictionActive] = useState(true);

  const loadGirls = async () => {
    if (!password) return;
    setLoading(true);
    setError('');
try {
        const [list, cardList, predList] = await Promise.all([
          adminListGirls(password),
          adminListTarotCards(password),
          adminListHoroscopePredictions(password),
        ]);
        setGirls(list);
        setCards(cardList);
        setPredictions(predList);
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
      await adminCreateGirl(
        password,
        newName.trim(),
        newEmail.trim(),
        newGiftCertificateUrl.trim() || null
      );
      setNewName('');
      setNewEmail('');
      setNewGiftCertificateUrl('');
      await loadGirls();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка');
    }
  };

  const startEdit = (g: Girl) => {
    setEditingId(g.id);
    setEditName(g.name);
    setEditEmail(g.email);
    setEditGiftCertificateUrl(g.gift_certificate_url ?? '');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditEmail('');
    setEditGiftCertificateUrl('');
  };

  const onSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || editingId === null || !editName.trim() || !editEmail.trim()) return;
    setError('');
    try {
      await adminUpdateGirl(password, editingId, {
        name: editName.trim(),
        email: editEmail.trim(),
        gift_certificate_url: editGiftCertificateUrl.trim() || null,
      });
      cancelEdit();
      await loadGirls();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка сохранения');
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

  const onAddCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !newCardTitle.trim() || !newCardDescription.trim()) {
      setError('Заполните название и описание карты');
      return;
    }
    setError('');
    try {
      await adminCreateTarotCard(password, {
        title: newCardTitle.trim(),
        description: newCardDescription.trim(),
        image_url: newCardImageUrl.trim() || null,
      });
      setNewCardTitle('');
      setNewCardDescription('');
      setNewCardImageUrl('');
      const list = await adminListTarotCards(password);
      setCards(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка');
    }
  };

  const startEditCard = (c: TarotCardAdmin) => {
    setEditingCardId(c.id);
    setEditCardTitle(c.title);
    setEditCardDescription(c.description);
    setEditCardImageUrl(c.image_url ?? '');
    setEditCardActive(c.is_active);
    setEditCardSortOrder(c.sort_order);
  };

  const cancelEditCard = () => {
    setEditingCardId(null);
    setEditCardTitle('');
    setEditCardDescription('');
    setEditCardImageUrl('');
    setEditCardActive(true);
    setEditCardSortOrder(0);
  };

  const onSaveCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || editingCardId == null) return;
    setError('');
    try {
      await adminUpdateTarotCard(password, editingCardId, {
        title: editCardTitle.trim(),
        description: editCardDescription.trim(),
        image_url: editCardImageUrl.trim() || null,
        is_active: editCardActive,
        sort_order: editCardSortOrder,
      });
      cancelEditCard();
      const list = await adminListTarotCards(password);
      setCards(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка сохранения');
    }
  };

  const onDeleteCard = async (id: number) => {
    if (!password) return;
    if (!window.confirm('Удалить карту?')) return;
    try {
      await adminDeleteTarotCard(password, id);
      const list = await adminListTarotCards(password);
      setCards(list);
    } catch {
      setError('Ошибка удаления');
    }
  };

  const onUploadCardImage = async (file: File, forEdit: boolean) => {
    if (!password) return;
    setError('');
    setUploadingCardImage(true);
    try {
      const { url } = await adminUploadImage(password, file);
      if (forEdit) setEditCardImageUrl(url);
      else setNewCardImageUrl(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка загрузки');
    } finally {
      setUploadingCardImage(false);
      if (addCardFileRef.current) addCardFileRef.current.value = '';
      if (editCardFileRef.current) editCardFileRef.current.value = '';
    }
  };

  const onAddPrediction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !newPredictionText.trim()) return;
    setError('');
    try {
      await adminCreateHoroscopePrediction(password, { text: newPredictionText.trim() });
      setNewPredictionText('');
      const list = await adminListHoroscopePredictions(password);
      setPredictions(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка');
    }
  };

  const startEditPrediction = (p: HoroscopePredictionAdmin) => {
    setEditingPredId(p.id);
    setEditPredictionText(p.text);
    setEditPredictionSortOrder(p.sort_order);
    setEditPredictionActive(p.is_active);
  };

  const cancelEditPrediction = () => {
    setEditingPredId(null);
    setEditPredictionText('');
    setEditPredictionSortOrder(0);
    setEditPredictionActive(true);
  };

  const onSavePrediction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || editingPredId == null) return;
    setError('');
    try {
      await adminUpdateHoroscopePrediction(password, editingPredId, {
        text: editPredictionText.trim(),
        sort_order: editPredictionSortOrder,
        is_active: editPredictionActive,
      });
      cancelEditPrediction();
      const list = await adminListHoroscopePredictions(password);
      setPredictions(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка сохранения');
    }
  };

  const onDeletePrediction = async (id: number) => {
    if (!password) return;
    if (!window.confirm('Удалить предсказание?')) return;
    try {
      await adminDeleteHoroscopePrediction(password, id);
      const list = await adminListHoroscopePredictions(password);
      setPredictions(list);
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
          placeholder="ФИО"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
        />
        <input
          type="url"
          placeholder="Ссылка на подарочный сертификат"
          value={newGiftCertificateUrl}
          onChange={(e) => setNewGiftCertificateUrl(e.target.value)}
          className="admin-form-url"
        />
        <button type="submit">Добавить</button>
      </form>
      <ul className="admin-list">
        {girls.map((g) =>
          editingId === g.id ? (
            <li key={g.id} className="admin-item admin-item-edit">
              <form onSubmit={onSaveEdit} className="admin-edit-form">
                <input
                  type="text"
                  placeholder="ФИО"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="admin-edit-input"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="admin-edit-input"
                />
                <input
                  type="url"
                  placeholder="Ссылка на сертификат"
                  value={editGiftCertificateUrl}
                  onChange={(e) => setEditGiftCertificateUrl(e.target.value)}
                  className="admin-edit-input admin-edit-url"
                />
                <button type="submit" className="admin-save">Сохранить</button>
                <button type="button" onClick={cancelEdit} className="admin-cancel">Отмена</button>
              </form>
            </li>
          ) : (
            <li key={g.id} className="admin-item">
              <span>{g.name}</span>
              <span className="admin-email">{g.email}</span>
              {g.gift_certificate_url ? (
                <a
                  href={g.gift_certificate_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="admin-cert-link"
                >
                  Сертификат
                </a>
              ) : (
                <span className="admin-no-cert">—</span>
              )}
              <span className="admin-actions">
                <button type="button" onClick={() => startEdit(g)} className="admin-edit-btn" title="Редактировать">
                  <PencilIcon />
                </button>
                <button type="button" onClick={() => onDelete(g.id)} className="admin-delete">
                  Удалить
                </button>
              </span>
            </li>
          )
        )}
      </ul>

      <h2 className="admin-section-title">Карты гадания ПроПро</h2>
      <form onSubmit={onAddCard} className="admin-form admin-form-cards">
        <input
          type="text"
          placeholder="Название"
          value={newCardTitle}
          onChange={(e) => setNewCardTitle(e.target.value)}
        />
        <textarea
          placeholder="Описание"
          value={newCardDescription}
          onChange={(e) => setNewCardDescription(e.target.value)}
          rows={2}
          className="admin-input-desc"
        />
        <div className="admin-upload-row">
          <input
            ref={addCardFileRef}
            type="file"
            accept=".jpg,.jpeg,.png,.gif,.webp,image/jpeg,image/png,image/gif,image/webp"
            className="admin-upload-input"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onUploadCardImage(f, false);
            }}
          />
          <button
            type="button"
            className="admin-upload-btn"
            disabled={uploadingCardImage}
            onClick={() => addCardFileRef.current?.click()}
          >
            {uploadingCardImage ? 'Загрузка…' : 'Загрузить картинку'}
          </button>
          {newCardImageUrl && (
            <span className="admin-upload-done">Картинка загружена</span>
          )}
        </div>
        <button type="submit">Добавить карту</button>
      </form>
      <ul className="admin-list admin-list-cards">
        {cards.map((c) =>
          editingCardId === c.id ? (
            <li key={c.id} className="admin-item admin-item-edit">
              <form onSubmit={onSaveCard} className="admin-edit-form admin-edit-form-card">
                <input
                  type="text"
                  placeholder="Название"
                  value={editCardTitle}
                  onChange={(e) => setEditCardTitle(e.target.value)}
                  className="admin-edit-input"
                />
                <textarea
                  placeholder="Описание"
                  value={editCardDescription}
                  onChange={(e) => setEditCardDescription(e.target.value)}
                  rows={3}
                  className="admin-edit-input admin-edit-desc"
                />
                <div className="admin-upload-row">
                  <input
                    ref={editCardFileRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.gif,.webp,image/jpeg,image/png,image/gif,image/webp"
                    className="admin-upload-input"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) onUploadCardImage(f, true);
                    }}
                  />
                  <button
                    type="button"
                    className="admin-upload-btn"
                    disabled={uploadingCardImage}
                    onClick={() => editCardFileRef.current?.click()}
                  >
                    {uploadingCardImage ? 'Загрузка…' : 'Загрузить картинку'}
                  </button>
                  {editCardImageUrl && (
                    <span className="admin-upload-done">Картинка загружена</span>
                  )}
                </div>
                <label className="admin-edit-checkbox">
                  <input
                    type="checkbox"
                    checked={editCardActive}
                    onChange={(e) => setEditCardActive(e.target.checked)}
                  />
                  Активна
                </label>
                <input
                  type="number"
                  min={0}
                  value={editCardSortOrder}
                  onChange={(e) => setEditCardSortOrder(parseInt(e.target.value, 10) || 0)}
                  className="admin-edit-input admin-edit-sort"
                />
                <button type="submit" className="admin-save">Сохранить</button>
                <button type="button" onClick={cancelEditCard} className="admin-cancel">Отмена</button>
              </form>
            </li>
          ) : (
            <li key={c.id} className="admin-item admin-item-card">
              <strong className="admin-card-title">{c.title}</strong>
              <span className="admin-card-desc">{c.description.slice(0, 80)}{c.description.length > 80 ? '…' : ''}</span>
              {!c.is_active && <span className="admin-card-inactive">скрыта</span>}
              <span className="admin-actions">
                <button type="button" onClick={() => startEditCard(c)} className="admin-edit-btn" title="Редактировать">
                  <PencilIcon />
                </button>
                <button type="button" onClick={() => onDeleteCard(c.id)} className="admin-delete">
                  Удалить
                </button>
              </span>
            </li>
          )
        )}
      </ul>

      <h2 className="admin-section-title">Предсказания гороскопа (8 Марта)</h2>
      <p className="admin-hint">Тексты из общего пула. Роли и знаки заданы в коде.</p>
      <form onSubmit={onAddPrediction} className="admin-form admin-form-cards">
        <textarea
          placeholder="Текст предсказания (например: придёт заказчик, знающий все процессы)"
          value={newPredictionText}
          onChange={(e) => setNewPredictionText(e.target.value)}
          rows={2}
          className="admin-input-desc"
        />
        <button type="submit">Добавить предсказание</button>
      </form>
      <ul className="admin-list admin-list-cards">
        {predictions.map((p) =>
          editingPredId === p.id ? (
            <li key={p.id} className="admin-item admin-item-edit">
              <form onSubmit={onSavePrediction} className="admin-edit-form admin-edit-form-card">
                <textarea
                  placeholder="Текст предсказания"
                  value={editPredictionText}
                  onChange={(e) => setEditPredictionText(e.target.value)}
                  rows={3}
                  className="admin-edit-input admin-edit-desc"
                />
                <label className="admin-edit-checkbox">
                  <input
                    type="checkbox"
                    checked={editPredictionActive}
                    onChange={(e) => setEditPredictionActive(e.target.checked)}
                  />
                  Активно
                </label>
                <input
                  type="number"
                  min={0}
                  value={editPredictionSortOrder}
                  onChange={(e) => setEditPredictionSortOrder(parseInt(e.target.value, 10) || 0)}
                  className="admin-edit-input admin-edit-sort"
                />
                <button type="submit" className="admin-save">Сохранить</button>
                <button type="button" onClick={cancelEditPrediction} className="admin-cancel">Отмена</button>
              </form>
            </li>
          ) : (
            <li key={p.id} className="admin-item admin-item-card">
              <strong className="admin-card-title">Предсказание</strong>
              <span className="admin-card-desc">{p.text.slice(0, 120)}{p.text.length > 120 ? '…' : ''}</span>
              {!p.is_active && <span className="admin-card-inactive">скрыто</span>}
              <span className="admin-actions">
                <button type="button" onClick={() => startEditPrediction(p)} className="admin-edit-btn" title="Редактировать">
                  <PencilIcon />
                </button>
                <button type="button" onClick={() => onDeletePrediction(p.id)} className="admin-delete">
                  Удалить
                </button>
              </span>
            </li>
          )
        )}
      </ul>
    </div>
  );
}
