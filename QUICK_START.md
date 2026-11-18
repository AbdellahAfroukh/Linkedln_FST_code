# Quick Start Guide

## Prerequisites

- **Docker Desktop** installed and running
- **Git** installed
- A copy of [backend/.env.example](backend/.env.example) saved as [backend/.env](backend/.env)

## 1) Clone the project

```bash
git clone <repository-url>
cd Linkedln_FST_code
```

## 2) Configure backend environment

Copy the example file and fill in your real values:

```bash
cd backend
copy .env.example .env
```

Required values:

```env
DATABASE_URL=postgresql://postgres:password@db:5432/LINKEDINFST
SECRET_KEY=your-secret-key-here
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-gmail-app-password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
FRONTEND_URL=http://localhost
CORS_ORIGINS=http://localhost
SCOPUS_API_KEY=your-scopus-api-key
```

Notes:

- For Gmail, use a **Google App Password**, not your normal account password.
- `FRONTEND_URL` is the link users receive in email verification messages.
- `CORS_ORIGINS` must include the URL your browser uses to open the app.

## 3) Start everything with Docker

From the project root:

```bash
docker compose up --build
```

This starts:

- PostgreSQL on the internal Docker network
- FastAPI backend on http://localhost:8000
- Nginx frontend on http://localhost

## 4) Open the app

- Frontend: http://localhost
- Backend API docs: http://localhost:8000/docs

## 5) First login

The admin user is created automatically on startup:

- Email: `admin@example.com`
- Password: `12345678`

## 6) Stop the project

```bash
docker compose down
```

If you want to remove the database volume too:

```bash
docker compose down -v
```

## Troubleshooting

### Backend or frontend does not start

- Confirm [backend/.env](backend/.env) exists and contains all required values.
- Check the logs with `docker compose logs -f`.

### Email verification does not work

- Make sure `SMTP_USER` is a real Gmail address.
- Make sure `SMTP_PASSWORD` is a Gmail App Password.
- Make sure 2-Step Verification is enabled on the Google account.

### Browser cannot reach the app

- Use http://localhost, not the Docker container name.
- If you changed the frontend URL, update `FRONTEND_URL` and `CORS_ORIGINS` to match.

### Need a clean reset

```bash
docker compose down -v
docker compose up --build
```

---

