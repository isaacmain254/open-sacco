# Open SACCO

Open SACCO is an open-source savings and credit cooperative (SACCO) management system. It provides a Django REST API and a React web application for member management, savings accounts, transactions, and loan applications.

For day-to-day operation, see the concise [User Guide](USER_GUIDE.md). This README is for contributors and maintainers.

## What it includes

- Member profiles and KYC-related information
- Savings products, member accounts, balances, deposits, and withdrawals
- Transaction history and account-level activity
- Loan products, draft applications, guarantors, documents, review, approval, rejection, and disbursement workflows
- Role-based module access for administrators, managers, operations, finance, loan officers, and accountants
- A live operations dashboard with savings, transaction, and loan insights

## Stack

- Backend: Python 3.13, Django 4.2, Django REST Framework, Simple JWT, PostgreSQL
- Frontend: React 18, TypeScript, Vite, Tailwind CSS, TanStack Query/Table, Recharts
- Local containers: Docker Compose

## Quick start with Docker

Prerequisites: Docker and Docker Compose.

1. Create local environment files from the examples and replace all example secrets before sharing or deploying:

   ```bash
   cp backend/.env.example backend/.env
   cp web-app/.env.example web-app/.env
   ```

2. Start the stack:

   ```bash
   docker compose up --build
   ```

   The frontend is served at `http://localhost:3000`, the API at `http://localhost:8000/api/v1/`, and PostgreSQL is exposed on host port `5433`.

3. Optionally load safe-to-discard demo data:

   ```bash
   docker compose exec backend python manage.py seed_demo_data
   ```

   The seed command creates an administrator account: `admin@example.com` / `admin12345`. Change this password immediately in any non-demo environment.

Useful commands:

```bash
docker compose down
docker compose exec backend python manage.py createsuperuser
docker compose exec backend python manage.py test
```

## Local development

Local Python development uses SQLite automatically, so PostgreSQL and Docker are not required. Copy the environment example (or set `DATABASE_MODE=sqlite`) and run migrations; the database is stored at `backend/db.sqlite3` and is ignored by Git.

```bash
# Backend
cd backend
python -m venv .venv
source .venv/bin/activate              # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

To use a locally running PostgreSQL instance instead, set `DATABASE_MODE=postgres` in `backend/.env` and provide the `DATABASE_NAME`, `DATABASE_USERNAME`, `DATABASE_PASSWORD`, `DATABASE_HOST`, and `DATABASE_PORT` values. Docker Compose does this automatically.

In another terminal:

```bash
# Frontend
cd web-app
npm install
npm run dev
```

Validate frontend changes with:

```bash
cd web-app
npm run build
npm run lint
```

## Project layout

```text
backend/     Django project, REST API, migrations, and business rules
web-app/     React/Vite application
compose.yaml Local development stack
USER_GUIDE.md Short guide for SACCO staff
```

## API and access control

The API is rooted at `/api/v1/` and uses JWT bearer authentication. The frontend obtains tokens through `/api/v1/auth/login` and refreshes them through `/api/v1/auth/refresh-token`.

Role permissions are enforced by the backend and reflected in the frontend navigation. Do not rely on a hidden frontend menu as an authorization boundary; add or update backend permission checks whenever a feature changes.

## Contributing

1. Fork the repository and create a focused branch.
2. Keep API, frontend types, and permission rules aligned.
3. Run the relevant backend tests and `npm run build` before opening a pull request.
4. Describe user-visible changes, migrations, environment changes, and test coverage in the pull request.

Please never commit real credentials, production database dumps, generated media, or access tokens. Use `.env.example` files for configuration templates.

## License

This repository does not currently include a license file. Add an approved open-source license before distributing or accepting contributions under specific reuse terms.
