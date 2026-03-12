import { useRef, useState } from 'react';
import {
  adminCreateGirl,
  adminCreateHoroscopePrediction,
  adminCreateTarotCard,
  adminDeleteGirl,
  adminDeleteHoroscopePrediction,
  adminDeleteTarotCard,
  adminListGirls,
  adminListHoroscopePredictions,
  adminListTarotCards,
  adminUpdateGirl,
  adminUpdateHoroscopePrediction,
  adminUpdateTarotCard,
  adminUploadImage,
  type Girl,
  type HoroscopePredictionAdmin,
  type TarotCardAdmin,
} from '../api';
import { AppButton, PageShell, SectionHeader, StatusMessage, SurfaceCard } from '../components/AppShell';
import './Admin.css';

function PencilIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    </svg>
  );
}

export default function Admin() {
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [error, setError] = useState('');
  const [girls, setGirls] = useState<Girl[]>([]);
  const [cards, setCards] = useState<TarotCardAdmin[]>([]);
  const [predictions, setPredictions] = useState<HoroscopePredictionAdmin[]>([]);
  const [loading, setLoading] = useState(false);

  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newGiftCertificateUrl, setNewGiftCertificateUrl] = useState('');

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editGiftCertificateUrl, setEditGiftCertificateUrl] = useState('');

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

  const [newPredictionText, setNewPredictionText] = useState('');
  const [editingPredId, setEditingPredId] = useState<number | null>(null);
  const [editPredictionText, setEditPredictionText] = useState('');
  const [editPredictionSortOrder, setEditPredictionSortOrder] = useState(0);
  const [editPredictionActive, setEditPredictionActive] = useState(true);

  const loadData = async () => {
    if (!password) return;

    setLoading(true);
    setError('');
    try {
      const [girlsList, cardsList, predictionList] = await Promise.all([
        adminListGirls(password),
        adminListTarotCards(password),
        adminListHoroscopePredictions(password),
      ]);
      setGirls(girlsList);
      setCards(cardsList);
      setPredictions(predictionList);
      setAuthenticated(true);
    } catch {
      setError('Неверный пароль');
      setAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const onAddGirl = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!password || !newName.trim() || !newEmail.trim()) return;
    try {
      await adminCreateGirl(password, newName.trim(), newEmail.trim(), newGiftCertificateUrl.trim() || null);
      setNewName('');
      setNewEmail('');
      setNewGiftCertificateUrl('');
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка');
    }
  };

  const onSaveGirl = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!password || editingId === null || !editName.trim() || !editEmail.trim()) return;
    try {
      await adminUpdateGirl(password, editingId, {
        name: editName.trim(),
        email: editEmail.trim(),
        gift_certificate_url: editGiftCertificateUrl.trim() || null,
      });
      cancelEditGirl();
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка сохранения');
    }
  };

  const cancelEditGirl = () => {
    setEditingId(null);
    setEditName('');
    setEditEmail('');
    setEditGiftCertificateUrl('');
  };

  const onDeleteGirl = async (girlId: number) => {
    if (!window.confirm('Удалить запись?')) return;
    try {
      await adminDeleteGirl(password, girlId);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка удаления');
    }
  };

  const onAddCard = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!password || !newCardTitle.trim() || !newCardDescription.trim()) return;
    try {
      await adminCreateTarotCard(password, {
        title: newCardTitle.trim(),
        description: newCardDescription.trim(),
        image_url: newCardImageUrl.trim() || null,
      });
      setNewCardTitle('');
      setNewCardDescription('');
      setNewCardImageUrl('');
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка');
    }
  };

  const cancelEditCard = () => {
    setEditingCardId(null);
    setEditCardTitle('');
    setEditCardDescription('');
    setEditCardImageUrl('');
    setEditCardActive(true);
    setEditCardSortOrder(0);
  };

  const onSaveCard = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!password || editingCardId == null) return;
    try {
      await adminUpdateTarotCard(password, editingCardId, {
        title: editCardTitle.trim(),
        description: editCardDescription.trim(),
        image_url: editCardImageUrl.trim() || null,
        is_active: editCardActive,
        sort_order: editCardSortOrder,
      });
      cancelEditCard();
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка сохранения');
    }
  };

  const onDeleteCard = async (cardId: number) => {
    if (!window.confirm('Удалить карту?')) return;
    try {
      await adminDeleteTarotCard(password, cardId);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка удаления');
    }
  };

  const onUploadCardImage = async (file: File, forEdit: boolean) => {
    setUploadingCardImage(true);
    try {
      const { url } = await adminUploadImage(password, file);
      if (forEdit) {
        setEditCardImageUrl(url);
      } else {
        setNewCardImageUrl(url);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки');
    } finally {
      setUploadingCardImage(false);
      if (addCardFileRef.current) addCardFileRef.current.value = '';
      if (editCardFileRef.current) editCardFileRef.current.value = '';
    }
  };

  const cancelEditPrediction = () => {
    setEditingPredId(null);
    setEditPredictionText('');
    setEditPredictionSortOrder(0);
    setEditPredictionActive(true);
  };

  const onAddPrediction = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!password || !newPredictionText.trim()) return;
    try {
      await adminCreateHoroscopePrediction(password, { text: newPredictionText.trim() });
      setNewPredictionText('');
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка');
    }
  };

  const onSavePrediction = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!password || editingPredId == null) return;
    try {
      await adminUpdateHoroscopePrediction(password, editingPredId, {
        text: editPredictionText.trim(),
        sort_order: editPredictionSortOrder,
        is_active: editPredictionActive,
      });
      cancelEditPrediction();
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка сохранения');
    }
  };

  const onDeletePrediction = async (predictionId: number) => {
    if (!window.confirm('Удалить предсказание?')) return;
    try {
      await adminDeleteHoroscopePrediction(password, predictionId);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка удаления');
    }
  };

  if (!authenticated) {
    return (
      <PageShell
        eyebrow="Admin"
        title="Административная панель"
        subtitle="Тот же продуктовый shell, но для внутренних операций с получателями, картами и предсказаниями."
      >
        <SurfaceCard className="admin-login-card">
          <SectionHeader
            label="Доступ"
            title="Войти по админ-паролю"
            description="После успешной проверки загрузятся все управляемые сущности продукта."
          />
          {error && <StatusMessage kind="error">{error}</StatusMessage>}
          <form
            className="admin-form-stack"
            onSubmit={(event) => {
              event.preventDefault();
              void loadData();
            }}
          >
            <input
              className="app-field"
              type="password"
              placeholder="Пароль"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoFocus
            />
            <AppButton type="submit" disabled={loading}>
              {loading ? 'Проверяем...' : 'Войти'}
            </AppButton>
          </form>
        </SurfaceCard>
      </PageShell>
    );
  }

  return (
    <PageShell
      eyebrow="Admin"
      title="Управление данными"
      subtitle="Один административный маршрут для получателей, карт таро и базы гороскопов."
    >
      {error && <StatusMessage kind="error">{error}</StatusMessage>}

      <div className="admin-sections">
        <SurfaceCard>
          <SectionHeader
            label="Girls"
            title="Получатели и сертификаты"
            description="Список персон с email и опциональной ссылкой на подарочный сертификат."
          />
          <form className="admin-form-grid" onSubmit={onAddGirl}>
            <input className="app-field" type="text" placeholder="ФИО" value={newName} onChange={(event) => setNewName(event.target.value)} />
            <input className="app-field" type="email" placeholder="Email" value={newEmail} onChange={(event) => setNewEmail(event.target.value)} />
            <input
              className="app-field"
              type="url"
              placeholder="Ссылка на подарочный сертификат"
              value={newGiftCertificateUrl}
              onChange={(event) => setNewGiftCertificateUrl(event.target.value)}
            />
            <AppButton type="submit">Добавить</AppButton>
          </form>
          <div className="admin-list">
            {girls.map((girl) => (
              <div key={girl.id} className="admin-list-item">
                {editingId === girl.id ? (
                  <form className="admin-form-grid" onSubmit={onSaveGirl}>
                    <input className="app-field" type="text" value={editName} onChange={(event) => setEditName(event.target.value)} />
                    <input className="app-field" type="email" value={editEmail} onChange={(event) => setEditEmail(event.target.value)} />
                    <input
                      className="app-field"
                      type="url"
                      value={editGiftCertificateUrl}
                      onChange={(event) => setEditGiftCertificateUrl(event.target.value)}
                    />
                    <div className="app-actions">
                      <AppButton type="submit">Сохранить</AppButton>
                      <AppButton type="button" tone="ghost" onClick={cancelEditGirl}>Отмена</AppButton>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="admin-list-item__content">
                      <strong>{girl.name}</strong>
                      <span>{girl.email}</span>
                      {girl.gift_certificate_url ? (
                        <a href={girl.gift_certificate_url} target="_blank" rel="noopener noreferrer">
                          Сертификат
                        </a>
                      ) : (
                        <span>Сертификат не задан</span>
                      )}
                    </div>
                    <div className="app-actions">
                      <AppButton
                        type="button"
                        tone="secondary"
                        onClick={() => {
                          setEditingId(girl.id);
                          setEditName(girl.name);
                          setEditEmail(girl.email);
                          setEditGiftCertificateUrl(girl.gift_certificate_url ?? '');
                        }}
                      >
                        <PencilIcon />
                        Изменить
                      </AppButton>
                      <AppButton type="button" tone="ghost" onClick={() => void onDeleteGirl(girl.id)}>
                        Удалить
                      </AppButton>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </SurfaceCard>

        <SurfaceCard>
          <SectionHeader
            label="Tarot"
            title="Колода ПроПро"
            description="Карты, которые используются в унифицированной игре с раскладом."
          />
          <form className="admin-form-stack" onSubmit={onAddCard}>
            <input className="app-field" type="text" placeholder="Название карты" value={newCardTitle} onChange={(event) => setNewCardTitle(event.target.value)} />
            <textarea className="app-textarea" placeholder="Описание" value={newCardDescription} onChange={(event) => setNewCardDescription(event.target.value)} />
            <div className="admin-upload-row">
              <input
                ref={addCardFileRef}
                type="file"
                accept=".jpg,.jpeg,.png,.gif,.webp,image/jpeg,image/png,image/gif,image/webp"
                className="admin-upload-input"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void onUploadCardImage(file, false);
                }}
              />
              <AppButton type="button" tone="secondary" onClick={() => addCardFileRef.current?.click()} disabled={uploadingCardImage}>
                {uploadingCardImage ? 'Загрузка...' : 'Загрузить картинку'}
              </AppButton>
              {newCardImageUrl && <span className="admin-upload-note">Картинка загружена</span>}
            </div>
            <AppButton type="submit">Добавить карту</AppButton>
          </form>
          <div className="admin-list">
            {cards.map((card) => (
              <div key={card.id} className="admin-list-item">
                {editingCardId === card.id ? (
                  <form className="admin-form-stack" onSubmit={onSaveCard}>
                    <input className="app-field" type="text" value={editCardTitle} onChange={(event) => setEditCardTitle(event.target.value)} />
                    <textarea className="app-textarea" value={editCardDescription} onChange={(event) => setEditCardDescription(event.target.value)} />
                    <div className="admin-upload-row">
                      <input
                        ref={editCardFileRef}
                        type="file"
                        accept=".jpg,.jpeg,.png,.gif,.webp,image/jpeg,image/png,image/gif,image/webp"
                        className="admin-upload-input"
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          if (file) void onUploadCardImage(file, true);
                        }}
                      />
                      <AppButton type="button" tone="secondary" onClick={() => editCardFileRef.current?.click()} disabled={uploadingCardImage}>
                        {uploadingCardImage ? 'Загрузка...' : 'Загрузить картинку'}
                      </AppButton>
                      {editCardImageUrl && <span className="admin-upload-note">Картинка загружена</span>}
                    </div>
                    <div className="admin-inline-fields">
                      <label className="admin-checkbox">
                        <input type="checkbox" checked={editCardActive} onChange={(event) => setEditCardActive(event.target.checked)} />
                        Активна
                      </label>
                      <input
                        className="app-field"
                        type="number"
                        min={0}
                        value={editCardSortOrder}
                        onChange={(event) => setEditCardSortOrder(parseInt(event.target.value, 10) || 0)}
                      />
                    </div>
                    <div className="app-actions">
                      <AppButton type="submit">Сохранить</AppButton>
                      <AppButton type="button" tone="ghost" onClick={cancelEditCard}>Отмена</AppButton>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="admin-list-item__content">
                      <strong>{card.title}</strong>
                      <span>{card.description.slice(0, 120)}{card.description.length > 120 ? '…' : ''}</span>
                      <span>{card.is_active ? 'Активна' : 'Скрыта'} • sort {card.sort_order}</span>
                    </div>
                    <div className="app-actions">
                      <AppButton
                        type="button"
                        tone="secondary"
                        onClick={() => {
                          setEditingCardId(card.id);
                          setEditCardTitle(card.title);
                          setEditCardDescription(card.description);
                          setEditCardImageUrl(card.image_url ?? '');
                          setEditCardActive(card.is_active);
                          setEditCardSortOrder(card.sort_order);
                        }}
                      >
                        <PencilIcon />
                        Изменить
                      </AppButton>
                      <AppButton type="button" tone="ghost" onClick={() => void onDeleteCard(card.id)}>
                        Удалить
                      </AppButton>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </SurfaceCard>

        <SurfaceCard>
          <SectionHeader
            label="Horoscope"
            title="База предсказаний"
            description="Тексты для унифицированной игры с гороскопом."
          />
          <form className="admin-form-stack" onSubmit={onAddPrediction}>
            <textarea
              className="app-textarea"
              placeholder="Текст предсказания"
              value={newPredictionText}
              onChange={(event) => setNewPredictionText(event.target.value)}
            />
            <AppButton type="submit">Добавить предсказание</AppButton>
          </form>
          <div className="admin-list">
            {predictions.map((prediction) => (
              <div key={prediction.id} className="admin-list-item">
                {editingPredId === prediction.id ? (
                  <form className="admin-form-stack" onSubmit={onSavePrediction}>
                    <textarea className="app-textarea" value={editPredictionText} onChange={(event) => setEditPredictionText(event.target.value)} />
                    <div className="admin-inline-fields">
                      <label className="admin-checkbox">
                        <input
                          type="checkbox"
                          checked={editPredictionActive}
                          onChange={(event) => setEditPredictionActive(event.target.checked)}
                        />
                        Активно
                      </label>
                      <input
                        className="app-field"
                        type="number"
                        min={0}
                        value={editPredictionSortOrder}
                        onChange={(event) => setEditPredictionSortOrder(parseInt(event.target.value, 10) || 0)}
                      />
                    </div>
                    <div className="app-actions">
                      <AppButton type="submit">Сохранить</AppButton>
                      <AppButton type="button" tone="ghost" onClick={cancelEditPrediction}>Отмена</AppButton>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="admin-list-item__content">
                      <strong>#{prediction.id}</strong>
                      <span>{prediction.text}</span>
                      <span>{prediction.is_active ? 'Активно' : 'Скрыто'} • sort {prediction.sort_order}</span>
                    </div>
                    <div className="app-actions">
                      <AppButton
                        type="button"
                        tone="secondary"
                        onClick={() => {
                          setEditingPredId(prediction.id);
                          setEditPredictionText(prediction.text);
                          setEditPredictionSortOrder(prediction.sort_order);
                          setEditPredictionActive(prediction.is_active);
                        }}
                      >
                        <PencilIcon />
                        Изменить
                      </AppButton>
                      <AppButton type="button" tone="ghost" onClick={() => void onDeletePrediction(prediction.id)}>
                        Удалить
                      </AppButton>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </SurfaceCard>
      </div>
    </PageShell>
  );
}
