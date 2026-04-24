# Причесон — full-stack веб-приложение салона красоты

Проект переведен из статического сайта в full-stack приложение на `Node.js + Express + PostgreSQL` с авторизацией, ролями и API для записей и отзывов.

## Что реализовано

- Отдача существующего фронтенда (`index.html`, `services.html`, `reviews.html`, `color_analyzer.html`) через Express.
- База данных PostgreSQL с миграцией:
  - `users` (роль `user/admin`, email/phone уникальные, хэш пароля)
  - `appointments` (статусы `new/confirmed/cancelled`)
  - `reviews` (модерация `pending/approved/rejected`)
- JWT авторизация:
  - регистрация, логин, получение текущего пользователя
  - middleware проверки токена и роли
- API для пользовательского и админского сценариев:
  - записи на услуги
  - история записей пользователя
  - модерация и управление статусами админом
- Интеграция фронтенда:
  - форма записи отправляет данные в API
  - отзывы на странице `reviews.html` подгружаются динамически из БД

## Стек

- Backend: `Node.js`, `Express`
- Database: `PostgreSQL`, `pg`
- Auth: `JWT`, `bcryptjs`
- Frontend: существующие `HTML/CSS/Vanilla JS`

## Структура проекта

```bash
.
├── migrations/
│   └── 001_init_schema.sql
├── scripts/
│   └── migrate.js
├── src/
│   ├── db/
│   │   └── pool.js
│   ├── middleware/
│   │   └── auth.middleware.js
│   ├── models/
│   │   ├── appointments.model.js
│   │   ├── reviews.model.js
│   │   └── users.model.js
│   └── routes/
│       ├── appointments.routes.js
│       ├── auth.routes.js
│       └── reviews.routes.js
├── server.js
├── Procfile
├── .env.example
└── .gitignore
```

## Переменные окружения

Создайте файл `.env` на основе `.env.example`:

```env
PORT=3000
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DB_NAME
SECRET_KEY=replace_with_long_random_secret
DATABASE_SSL=true
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=change_me_please
ADMIN_NAME=Salon Admin
```

Примечания:
- `SECRET_KEY` должен быть длинным случайным секретом.
- Для Railway PostgreSQL обычно нужен `DATABASE_SSL=true`.

## Локальный запуск

1. Установить зависимости:
   ```bash
   npm install
   ```
2. Создать `.env` и заполнить переменные.
3. Применить миграции:
   ```bash
   npm run db:migrate
   ```
4. Создать первого администратора:
   ```bash
   npm run db:seed-admin
   ```
5. Запустить сервер:
   ```bash
   npm start
   ```
6. Открыть приложение:
   - `http://localhost:3000`
   - `http://localhost:3000/admin`
   - health-check: `http://localhost:3000/health`

## Основные API-эндпоинты

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me` (Bearer token)
- `GET /api/auth/admin` (Bearer token, role admin)

### Appointments
- `POST /api/appointments` (Bearer token)
- `GET /api/appointments/my` (Bearer token)
- `GET /api/appointments/admin/all` (admin)
- `PATCH /api/appointments/:id/status` (admin)

### Reviews
- `GET /api/reviews` (публично, только approved)
- `POST /api/reviews` (Bearer token)
- `GET /api/reviews/admin/all` (admin)
- `PATCH /api/reviews/:id/moderation-status` (admin)
- `DELETE /api/reviews/:id` (admin)

## Деплой на Railway через GitHub

1. Запушьте проект в GitHub-репозиторий.
2. В Railway выберите **New Project -> Deploy from GitHub repo**.
3. Подключите репозиторий с этим проектом.
4. Добавьте переменные окружения в Railway:
   - `PORT` (Railway обычно подставляет сам, можно не задавать вручную)
   - `DATABASE_URL` (из PostgreSQL plugin Railway)
   - `SECRET_KEY`
   - `DATABASE_SSL=true`
5. Убедитесь, что команда старта: `npm start` (Railway определит автоматически, также добавлен `Procfile`).
6. После первого деплоя выполните миграции:
   - через Railway shell: `npm run db:migrate`
   - или отдельным job/one-off run

## Важно перед продом

- Создайте первого admin-пользователя через `npm run db:seed-admin`.
- Проверьте CORS/домен, если фронт и API будут на разных доменах.
- Добавьте валидации и rate-limits для публичных эндпоинтов.
