# 8 Марта — Girls

Сайт-поздравление с 8 Марта: заставка, авторизация по коду на email, мини-игры (заглушки), персональный сертификат.

- **Фронт:** React (Vite), базовый путь `/girls/`
- **Бэк:** Python, FastAPI, SQLite
- **Деплой:** zhdanov.uno/girls/

## Локальный запуск

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
alembic upgrade head
python -m uvicorn app.main:app --reload --port 8000
```

Переменные окружения (опционально): создайте `backend/.env`:

- `DATABASE_URL` — по умолчанию `sqlite+aiosqlite:///./girls.db`
- `ADMIN_PASSWORD_HASH` — bcrypt-хеш пароля админки (пароль не длиннее 72 байт). Получить хеш: `python3 -c "import bcrypt; p='твой_пароль'; print(bcrypt.hashpw(p.encode(), bcrypt.gensalt()).decode())"`
- `SECRET_KEY` — секрет для JWT
- SMTP-переменные для отправки кодов на email (если не заданы — код выводится в консоль)

После первой миграции можно заполнить игры:

```bash
cd backend && python scripts/seed_games.py
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Откройте http://localhost:5173/girls/ (с учётом base в Vite).

Прокси API при разработке: в `vite.config.ts` можно добавить:

```ts
server: {
  proxy: { '/girls/api': 'http://localhost:8000' }
}
```

## Заставка (первая страница)

На заставке показывается картинка **`frontend/src/assets/landing.svg`**. Замените этот файл своим SVG (или поменяйте импорт в `Landing.tsx` на другой файл).

## Структура

- `frontend/` — SPA (React), сборка в `frontend/dist/`
- `backend/` — FastAPI, миграции Alembic в `backend/alembic/`
- `deploy/` — пример конфига nginx
- `.github/workflows/deploy.yml` — деплой на сервер по push в `main`

## Маршруты

| Путь | Описание |
|------|----------|
| `/girls/` | Заставка, свайп вверх → авторизация |
| `/girls/auth` | Выбор из списка, запрос кода на email, ввод кода |
| `/girls/games` | Список мини-игр, после всех — кнопка «Получить сертификат» |
| `/girls/games/:slug` | Страница игры (заглушка) |
| `/girls/certificate/:token` | Публичная страница сертификата |
| `/girls/admin` | Админка (только по прямой ссылке, без ссылок с сайта). Вход — пароль. Управление списком девушек. |

## API

- `GET /girls/api/girls` — список девушек (для выбора)
- `POST /girls/api/auth/request-code` — запрос кода (body: `{ "girl_id": number }`)
- `POST /girls/api/auth/verify` — проверка кода (body: `{ "girl_id", "code" }`) → JWT
- `GET /girls/api/games` — список игр
- `POST /girls/api/certificate` — выдать сертификат (заголовок `Authorization: Bearer <token>`)
- `GET /girls/api/certificate/:token` — данные сертификата по токену (публично)
- Админка: заголовок `X-Admin-Password` на все запросы к `/girls/api/admin/*`

## CI/CD (GitHub Actions)

### CI (при каждом push и при открытии/обновлении PR в `main`)

- **Frontend:** установка зависимостей, `npm run lint`, `npm run build`
- **Backend:** установка зависимостей, проверка импорта приложения, `alembic upgrade head` (проверка миграций)

Файл: `.github/workflows/ci.yml`. Секреты для CI не нужны.

### CD (деплой при push в `main`)

1. Сборка фронта
2. Копирование файлов на сервер (SCP)
3. На сервере: установка зависимостей бэка, миграции, перезапуск systemd-юнита `girls-api`

Файл: `.github/workflows/deploy.yml`.

Секреты репозитория (Settings → Secrets and variables → Actions):

- `DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_SSH_KEY`, `DEPLOY_PATH`
- при необходимости `DATABASE_URL` для миграций на сервере

Рекомендация: включите branch protection для `main` и добавьте обязательную проверку «CI» — тогда в `main` нельзя будет смержить PR без зелёного CI.

Пошаговая настройка деплоя (сервер, секреты, первый запуск): **[docs/DEPLOY-SETUP.md](docs/DEPLOY-SETUP.md)**.

## Сервер (Ubuntu + Nginx)

1. Разместить статику фронта в каталог, указанный в nginx как `alias` для `/girls/`.
2. Запускать FastAPI (uvicorn/gunicorn) на localhost:8000, в nginx проксировать `/girls/api/` на него.
3. Пример конфига: `deploy/nginx-girls.conf.example`.
