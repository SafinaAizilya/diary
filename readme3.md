# Мой дневник

Веб-приложение для хранения личных записей: backend с REST API и базой данных плюс интерактивный frontend на чистом JavaScript.

**Лабораторная работа №3.** Backend с REST API и базой данных.

**Выполнил(а):** [Сафина айзиля Альфредовна]

## Тема проекта

Личный дневник с записями. Frontend из лабораторной работы №2 (SPA на чистом JS) теперь получает и сохраняет данные через REST API, а не через `localStorage`. Данные хранятся в реляционной базе данных на стороне сервера.

## Основная сущность

Запись дневника (`Entry`), таблица `entries`.

| Поле | Тип | Обязательное | Описание |
|---|---|---|---|
| `id` | integer | да (генерируется) | Уникальный идентификатор, первичный ключ |
| `title` | string (до 100 символов) | да | Заголовок записи |
| `description` | text | да | Текст записи |
| `date` | date (`YYYY-MM-DD`) | да | Дата записи |
| `mood` | string (до 50 символов) | да | Настроение: радость, спокойствие, грусть, вдохновение, энергия |
| `tags` | string (до 100 символов) | нет | Теги, например `#осень, #прогулка` |
| `created_at` | datetime | да (генерируется) | Дата и время добавления, ставится сервером |

Картинка для карточки на frontend подставляется автоматически по `id` записи (`picsum.photos`) и в базе не хранится.

### Структура таблицы

```sql
CREATE TABLE entries (
    id INTEGER PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    date DATE NOT NULL,
    mood VARCHAR(50) NOT NULL,
    tags VARCHAR(100),
    created_at DATETIME DEFAULT (CURRENT_TIMESTAMP)
);
```

Таблица создаётся автоматически при первом запуске backend (`Base.metadata.create_all`).

## API

Базовый адрес: `http://127.0.0.1:8000`

| Метод | Путь | Описание | Успешный ответ |
|---|---|---|---|
| GET | `/api/entries` | Получить список записей (новые сверху) | 200 OK |
| POST | `/api/entries` | Создать запись | 201 Created |
| GET | `/api/entries/{id}` | Получить запись по id | 200 OK |
| PATCH | `/api/entries/{id}` | Частично обновить запись | 200 OK |
| DELETE | `/api/entries/{id}` | Удалить запись | 204 No Content |

### Коды ошибок

| Статус | Когда возвращается |
|---|---|
| 404 Not Found | Запись с таким `id` не найдена |
| 422 Unprocessable Content | Данные не прошли валидацию (нет обязательного поля, неверный тип или формат даты) |

## Стек

**Backend**

- Python 3
- FastAPI: REST API и автоматическая OpenAPI-документация (Swagger UI)
- SQLAlchemy: ORM для работы с базой данных
- Pydantic: схемы и валидация данных
- Uvicorn: ASGI-сервер
- SQLite: база данных (файл `diary.db`)

**Frontend**

- HTML, CSS, чистый JavaScript (Vanilla JS), без библиотек и фреймворков
- `fetch` для обращения к API
- State-Driven UI: `UI = render(state)`

## Структура проекта

```text
project-lab3/
├── backend/
│   └── app/
│       ├── __init__.py
│       ├── database.py   # подключение к БД, сессия, get_db
│       ├── models.py     # модель Entry (таблица entries)
│       ├── schemas.py    # Pydantic-схемы (создание, обновление, ответ)
│       └── main.py       # приложение FastAPI и CRUD-эндпоинты
└── frontend/
    ├── index.html
    ├── css/
    │   └── style.css
    └── js/
        └── app.js        # логика интерфейса и запросы к API
```

## Установка зависимостей

```bash
cd backend
python -m venv .venv

# Linux / macOS
source .venv/bin/activate
# Windows (PowerShell)
# .venv\Scripts\Activate.ps1

pip install fastapi "uvicorn[standard]" sqlalchemy pydantic
```

## Запуск базы данных

Используется SQLite, отдельный сервер БД запускать не нужно. Файл `diary.db` создаётся автоматически в папке `backend` при первом запуске backend (запускать нужно из этой папки).

Посмотреть содержимое таблицы можно через консоль SQLite или программу DB Browser for SQLite:

```bash
sqlite3 diary.db "SELECT * FROM entries;"
```

## Запуск backend

```bash
cd backend
uvicorn app.main:app --reload
```

Backend будет доступен по адресу http://127.0.0.1:8000

**Swagger UI:** http://127.0.0.1:8000/docs
**ReDoc:** http://127.0.0.1:8000/redoc
**OpenAPI-спецификация (JSON):** http://127.0.0.1:8000/openapi.json

## Запуск frontend

Открыть `frontend/index.html` через локальный сервер (backend при этом должен быть запущен):

```bash
cd frontend
python -m http.server 5500
```

Затем открыть http://127.0.0.1:5500

Адрес API задан в `frontend/js/app.js`:

```javascript
const API_URL = "http://127.0.0.1:8000/api/entries";
```

В backend включён CORS, поэтому frontend, открытый на другом порту, может обращаться к API.

## Возможности frontend

- Загрузка списка записей с сервера через `fetch` при открытии страницы.
- Создание записи через модальное окно с клиентской валидацией (`POST`).
- Редактирование записи (кнопка ✎ на карточке, `PATCH`).
- Удаление записи с подтверждением (кнопка × на карточке, `DELETE`).
- Просмотр полной записи по клику на карточку.
- Поиск по названию, фильтр по настроению и сортировка выполняются на клиенте.
- Безопасный вывод пользовательских данных через `textContent` (защита от XSS).
- Единый объект `state` и функция `render()`: после каждого ответа сервера интерфейс перерисовывается из состояния.

## Примеры запросов

### Создать запись

```http
POST /api/entries HTTP/1.1
Content-Type: application/json

{
  "title": "Прогулка в парке",
  "description": "Сегодня гуляла по осеннему парку, было тихо и красиво.",
  "date": "2026-10-24",
  "mood": "спокойствие",
  "tags": "#осень, #прогулка"
}
```

Ответ `201 Created`:

```json
{
  "title": "Прогулка в парке",
  "description": "Сегодня гуляла по осеннему парку, было тихо и красиво.",
  "date": "2026-10-24",
  "mood": "спокойствие",
  "tags": "#осень, #прогулка",
  "id": 1,
  "created_at": "2026-10-24T10:00:00"
}
```

### Получить список записей

```http
GET /api/entries HTTP/1.1
```

### Получить одну запись

```http
GET /api/entries/1 HTTP/1.1
```

### Частично обновить запись

```http
PATCH /api/entries/1 HTTP/1.1
Content-Type: application/json

{
  "mood": "радость"
}
```

Обновляются только переданные поля, остальные остаются без изменений.

### Удалить запись

```http
DELETE /api/entries/1 HTTP/1.1
```

Ответ: `204 No Content`.

### Запись не найдена

```http
GET /api/entries/999 HTTP/1.1
```

Ответ `404 Not Found`:

```json
{
  "detail": "Запись не найдена"
}
```

### Ошибка валидации

```http
POST /api/entries HTTP/1.1
Content-Type: application/json

{
  "description": "Запись без названия"
}
```

Ответ `422 Unprocessable Content`: сервер сообщает, что поля `title`, `date` и `mood` обязательны.

### Пример через curl

```bash
curl -X POST http://127.0.0.1:8000/api/entries \
  -H "Content-Type: application/json" \
  -d '{"title":"Прогулка","description":"Тихий осенний вечер","date":"2026-10-24","mood":"спокойствие","tags":"#осень"}'

curl http://127.0.0.1:8000/api/entries
curl -X PATCH http://127.0.0.1:8000/api/entries/1 -H "Content-Type: application/json" -d '{"mood":"радость"}'
curl -X DELETE http://127.0.0.1:8000/api/entries/1
```

## Скриншоты

1. Swagger UI с раскрытыми методами API: `screenshots/swagger.png`
2. Таблица `entries` в базе данных с добавленными записями: `screenshots/database.png`
3. Frontend с данными, загруженными с backend: `screenshots/frontend.png`

## Вывод

Статическое SPA из лабораторной работы №2 разделено на две части: frontend получает данные по HTTP через `fetch`, а backend на FastAPI хранит их в реляционной базе данных и предоставляет REST API с полным набором CRUD-операций. Освоены проектирование REST API, работа с ORM SQLAlchemy, валидация данных через Pydantic, автоматическая генерация OpenAPI-документации (Swagger UI) и связывание frontend, backend и БД.
