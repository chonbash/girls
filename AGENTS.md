# AGENTS.md — Girls (8 Марта)

Этот репозиторий — сайт‑поздравление к 8 Марта:
заставка → вход по коду на email → мини‑игры → персональный сертификат.

Цель этой инструкции — упростить параллельную разработку несколькими разработчиками.
Каждый разработчик добавляет свою игру с минимальными конфликтами в git.

## Архитектура (коротко)

- `frontend/`: React (Vite), SPA с базовым путём `/girls/`
- `backend/`: FastAPI + SQLite (async SQLAlchemy), API под `/girls/api/*`
- `deploy/`: примеры `nginx`/`systemd`
- `.github/workflows/`: CI/CD

## Контракт игры

- У каждой игры есть `slug` (ASCII, `kebab-case`, уникальный и стабильный).
- Список игр для главной страницы берётся из API: `GET /girls/api/games` (таблица `games` в БД).
- URL игры на фронте: `/girls/games/:slug`
- Завершение игры — на фронте: `sessionStorage["girls_completed_games"]` содержит массив `slug`.
- После прохождения всех игр фронт показывает кнопку «Получить сертификат» и делает `POST /girls/api/certificate` (нужен JWT).

## Где лежит код игр (frontend)

- Все игры складываем в: `frontend/src/games/<slug>/`
- Каждая игра регистрируется в: `frontend/src/games/registry.ts`
- Общая утилита отметки прохождения: `frontend/src/games/completed.ts`

Правило: не правим чужие игры. В PR обычно меняется только:

- `frontend/src/games/<your-slug>/**`
- `frontend/src/games/registry.ts` (1 небольшая правка)
- `backend/scripts/seed_games.py` (1 запись)

## Как добавить новую игру (чеклист)

1. Выбрать `slug`.

- Только латиница/цифры/`-`
- Пример: `future-letter`

2. Добавить игру на фронте:

- создать папку `frontend/src/games/<slug>/`
- реализовать экран игры
- при завершении вызвать `markGameCompleted("<slug>")` и перейти на `/games`

3. Зарегистрировать игру:

- добавить запись в `frontend/src/games/registry.ts`

4. Добавить игру в сидинг бэка (чтобы она появилась в списке):

- дописать запись в `backend/scripts/seed_games.py` (`slug`, `title`, `sort_order`)
- локально после миграций выполнить: `python scripts/seed_games.py`

5. Прогнать локальные проверки:

- backend:
- `cd backend`
- `alembic upgrade head`
- `python scripts/seed_games.py`
- `python -m uvicorn app.main:app --reload --port 8000`
- frontend:
- `cd frontend`
- `npm ci`
- `npm run lint`
- `npm run dev`

## Важные детали

- Фронт работает под `/girls/` (см. `frontend/vite.config.ts`, `BrowserRouter basename="/girls"`).
- API на сервере ожидается под `/girls/api/*` (nginx проксирует на `127.0.0.1:8000/api/*`).
- Админка `/girls/admin` защищена заголовком `X-Admin-Password` (пароль сравнивается с `ADMIN_PASSWORD_HASH`).

## Git workflow

- Одна игра = одна ветка = один PR.
- Название ветки: `game/<slug>` или `<author>/<slug>`.
- Не меняйте форматирование/стили по всему проекту «заодно».
- Конфликты чаще всего будут в `frontend/src/games/registry.ts` и `backend/scripts/seed_games.py` — держим правки минимальными.

