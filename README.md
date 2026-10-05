# ClinicBook — Clinic Appointment Booking

> A full-stack demo project: **Laravel 11 REST API** (PHP, OOP, MVC, MySQL/MariaDB, roles) + **React 18** SPA.
> Built to match a PHP/Laravel + React job description.

ClinicBook is an appointment booking platform with three roles:

- **Patient** — browses doctors, books a visit, tracks and cancels appointments
- **Doctor** — sees their schedule, confirms or completes appointments
- **Admin** — manages doctors and all appointments, sees clinic statistics

Booking prevents double booking (same doctor + date + time cannot be taken twice) and
rejects appointments in the past.

## What it demonstrates

- **PHP / OOP**: Eloquent models with relationships and casts, route model binding
- **MVC + REST API**: routes grouped by role (public / patient / doctor / admin)
- **Roles & middleware**: three roles (`admin`, `doctor`, `patient`) guarded by a custom `admin` middleware
- **Validation & business rules**: `after_or_equal:today`, `date_format:H:i`, double-booking prevention
- **SQL**: migrations, foreign keys to `users` twice (`patient_id`, `doctor_id`), aggregates, `whereDate`
- **Auth**: Laravel Sanctum token authentication
- **React 18**: Router, Context API, role-based routes, reusable `StatusPill` component
- **Code quality**: PHPUnit feature tests (booking rules, roles), GitHub Actions CI, Postman collection
- **Design**: a custom "calm clinical" design system (mist / pine / clay) in plain CSS

## Project structure

```
03-clinicbook/
├── backend/          Laravel 11 API (self-contained: clone → composer install → migrate → serve)
├── frontend/         React 18 + Vite SPA
├── postman/          Postman collection for the whole API
└── .github/workflows/CI (runs the backend test suite on every push)
```

## Run locally

### Backend

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve             # http://localhost:8000
```

Seeded accounts:

| Role | Email | Password |
| ---- | ----- | -------- |
| Admin | admin@clinicbook.test | password |
| Doctor | sara@clinicbook.test | password |
| Doctor | omar@clinicbook.test | password |
| Doctor | lina@clinicbook.test | password |
| Patient | patient@clinicbook.test | password |

> Tip: `.env.example` uses SQLite (zero setup). Switch `DB_CONNECTION` to `mysql`/`mariadb`
> and fill in the `DB_*` values to practice with MySQL/MariaDB.

### Frontend

```bash
cd frontend
npm install
npm run dev                   # http://localhost:5173
```

Set `VITE_API_URL` in `frontend/.env` if the API is not at `http://localhost:8000/api`.

## API overview

| Method | Endpoint | Auth | Description |
| ------ | -------- | ---- | ----------- |
| POST | `/api/register` | — | Register as patient |
| POST | `/api/login` | — | Login, returns user + token |
| GET | `/api/doctors` | — | List doctors (`?specialty=` filter) |
| GET | `/api/doctors/{id}` | — | Doctor profile |
| GET | `/api/appointments` | ✅ patient | My appointments |
| POST | `/api/appointments` | ✅ patient | Book (double-booking prevented) |
| PATCH | `/api/appointments/{id}/cancel` | ✅ patient | Cancel |
| GET | `/api/doctor/appointments` | ✅ doctor | My schedule |
| PATCH | `/api/doctor/appointments/{id}/status` | ✅ doctor | Confirm / complete |
| GET/POST/PUT/DELETE | `/api/admin/doctors` | ✅ admin | Manage doctors |
| GET | `/api/admin/appointments` | ✅ admin | All appointments (`?status=`, `?doctor_id=`) |
| PATCH | `/api/admin/appointments/{id}/status` | ✅ admin | Update status |
| GET | `/api/admin/stats` | ✅ admin | Clinic statistics |

## Tests & CI

```bash
cd backend
php artisan test
```

## Deploy

- **Frontend** → Vercel: root directory `frontend`, env `VITE_API_URL=https://your-backend.example.com/api`.
- **Backend** → Railway / Laravel Cloud: root directory `backend`, attach MySQL, set env vars,
  run `php artisan migrate --seed --force` on deploy.

See the top-level `README.md` in this workspace for the full deployment guide.

## License

MIT
