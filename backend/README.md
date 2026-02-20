# Smart E-Waste Collection System (React + Django)

This project implements the SUZA Smart E-Waste Collection System with:

- `backend/` Django API and admin
- `frontend/` React (Vite) client

## Features

- User registration/login/logout
- Role-based access: `user`, `admin`, `collector`
- Users submit pickup requests
- Admin assigns collectors and updates status
- Collectors view assigned pickups and mark completed
- Admin dashboard stats

## Backend Setup (Django)

From `c:\Users\XS0ulR3aperX\Desktop\SEWSYSTEM\backend`:

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

Backend base URL: `http://127.0.0.1:8000`

## Frontend Setup (React)

From `c:\Users\XS0ulR3aperX\Desktop\SEWSYSTEM\backend\frontend`:

```powershell
npm install
npm run dev
```

Frontend URL: `http://127.0.0.1:5173`

## API Endpoints

- `POST /api/auth/register/`
- `POST /api/auth/login/`
- `POST /api/auth/logout/`
- `GET /api/me/`
- `GET, POST /api/requests/`
- `GET, PATCH /api/requests/<id>/`
- `POST /api/requests/<id>/assign/`
- `POST /api/requests/<id>/status/`
- `GET /api/collectors/`
- `GET /api/dashboard/stats/`

## Notes

- CORS is enabled for local development.
- Default database is SQLite (`db.sqlite3`).
- Use Django admin at `/admin/` for direct data management.
