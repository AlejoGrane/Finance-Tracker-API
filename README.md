# Finance Tracker API

A REST API for managing personal (or small business) finances: expenses, savings, and investments. Every user has their own set of records, protected with JWT authentication.

Originally based on the [Expense Tracker API](https://roadmap.sh/projects/expense-tracker-api) project from roadmap.sh, later expanded with savings and investments modules to cover a broader use case.

## Live demo

🔗 **https://finance-tracker-api-0fy3.onrender.com**

The API is deployed on Render (free tier) with a MySQL database hosted on Aiven. Since it's running on a free instance, the service may take up to ~50 seconds to respond on the first request after a period of inactivity (cold start) — subsequent requests are fast.

## Tech stack

- **Runtime:** Node.js 24
- **Framework:** Express 5
- **Database:** MySQL (via `mysql2`, with connection pooling)
- **Authentication:** JWT (`jsonwebtoken`) + password hashing (`bcrypt`)
- **Testing:** Jest + Supertest
- **Containers:** Docker + Docker Compose
- **Security:** Helmet (HTTP security headers), input validation, parameterized queries
- **Deployment:** Render (API) + Aiven (MySQL)

## Architecture

The project follows a layered structure:

```
src/
├── config/        # database connection
├── routes/        # endpoint definitions
├── middlewares/    # JWT authentication
├── controllers/    # business logic and validation
├── models/         # database queries
└── utils/          # shared helpers (JWT, validators)
```

Each request flows through: `routes → auth middleware → controller → model → database`.

## Installation

There are two ways to run the project locally: with **Docker** (recommended, no local MySQL install needed) or **manually**.

### Option A — With Docker

**Requirements:** Docker Desktop installed and running.

1. Clone the repository:

   ```bash
   git clone https://github.com/AlejoGrane/finance-tracker-api.git
   cd finance-tracker-api
   ```

2. Copy `.env.example` to `.env` and fill in the values (`DB_PASSWORD` and `JWT_SECRET` at minimum):

   ```bash
   cp .env.example .env
   ```

3. Start the containers:

   ```bash
   docker-compose up --build
   ```

   This spins up two containers: the API and MySQL. The database is initialized automatically from `database/schema.sql` the first time it's created.

4. The API is available at `http://localhost:3000`.

To stop the containers:

```bash
docker-compose down
```

To stop them and also wipe the database volume (reset everything from scratch):

```bash
docker-compose down -v
```

### Option B — Manual installation

**Requirements:**

- Node.js 18 or higher (tested with Node 24)
- MySQL running locally (or reachable over the network)

**Steps:**

1. Clone the repository and enter the folder:

   ```bash
   git clone https://github.com/AlejoGrane/finance-tracker-api.git
   cd finance-tracker-api
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create the database by running the included script:

   ```bash
   mysql -u root -p < database/schema.sql
   ```

   Or run the contents of `database/schema.sql` directly in MySQL Workbench.

4. Copy `.env.example` to `.env` and fill in your values:

   ```bash
   cp .env.example .env
   ```

   | Variable      | Description                                              |
   | ------------- | -------------------------------------------------------- |
   | `PORT`        | Port the server runs on (default: 3000)                  |
   | `DB_HOST`     | MySQL host (`localhost` for manual installs)             |
   | `DB_PORT`     | MySQL port (default: 3306)                               |
   | `DB_USER`     | MySQL user                                               |
   | `DB_PASSWORD` | MySQL password                                           |
   | `DB_NAME`     | Database name                                            |
   | `JWT_SECRET`  | Secret string used to sign JWTs (any long, random value) |

5. Start the server:
   ```bash
   npm run dev
   ```

The API is available at `http://localhost:3000`.

## Testing

The project includes a full test suite (Jest + Supertest) covering authentication and the CRUD operations for expenses, savings, and investments, including success cases, validation errors, and authorization checks.

Tests run against a **separate test database** to avoid touching development data.

1. Create the test database and apply the schema:

   ```sql
   CREATE DATABASE finance_tracker_test;
   ```

   (then apply `database/schema.sql` against it)

2. Copy `.env.example` to `.env.test` and point it to the test database:

   ```
   DB_NAME=finance_tracker_test
   ```

3. Run the tests:
   ```bash
   npm test
   ```

## Authentication

Every endpoint except `signup` and `login` requires a valid JWT in the header:

```
Authorization: Bearer <token>
```

The token is returned on login and expires after 1 hour.

## Endpoints

### Auth

| Method | Endpoint       | Description            | Body                                          |
| ------ | -------------- | ---------------------- | --------------------------------------------- |
| POST   | `/auth/signup` | Registers a new user   | `{ "email": "string", "password": "string" }` |
| POST   | `/auth/login`  | Logs in, returns a JWT | `{ "email": "string", "password": "string" }` |

**Example — signup:**

```bash
curl -X POST https://finance-tracker-api-0fy3.onrender.com/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email": "ale@test.com", "password": "123456"}'
```

**Response:**

```json
{ "newUserId": 1, "email": "ale@test.com" }
```

**Example — login:**

```bash
curl -X POST https://finance-tracker-api-0fy3.onrender.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "ale@test.com", "password": "123456"}'
```

**Response:**

```json
{ "tokenUser": "eyJhbGciOiJIUzI1NiIs..." }
```

### Expenses

| Method | Endpoint                       | Description                      |
| ------ | ------------------------------ | -------------------------------- |
| POST   | `/expenses`                    | Creates an expense               |
| GET    | `/expenses`                    | Lists all of the user's expenses |
| GET    | `/expenses/category?category=` | Filters expenses by category     |
| GET    | `/expenses/date?date=`         | Filters expenses by date         |
| PATCH  | `/expenses/:id`                | Updates an expense (partial)     |
| DELETE | `/expenses/:id`                | Deletes an expense               |

**Body for create/update:**

```json
{
  "amount": 4500.5,
  "category": "Groceries",
  "description": "Supermarket",
  "date": "2026-08-15"
}
```

**Valid categories:** `Groceries`, `Leisure`, `Electronics`, `Utilities`, `Clothing`, `Health`, `Others`

### Savings

| Method | Endpoint                      | Description                     |
| ------ | ----------------------------- | ------------------------------- |
| POST   | `/savings`                    | Creates a saving                |
| GET    | `/savings`                    | Lists all of the user's savings |
| GET    | `/savings/category?category=` | Filters savings by category     |
| PATCH  | `/savings/:id`                | Updates a saving (partial)      |
| DELETE | `/savings/:id`                | Deletes a saving                |

**Body for create/update:**

```json
{
  "amount": 10000,
  "category": "Vacation fund",
  "description": "Savings for a trip"
}
```

Saving categories are free text (not a fixed list), since users may want to name their own goals.

### Investments

| Method | Endpoint                                              | Description                         |
| ------ | ----------------------------------------------------- | ----------------------------------- |
| POST   | `/investments`                                        | Creates an investment               |
| GET    | `/investments`                                        | Lists all of the user's investments |
| GET    | `/investments/category?category=`                     | Filters investments by category     |
| GET    | `/investments/date?filter=` or `?startDate=&endDate=` | Filters investments by date range   |
| PATCH  | `/investments/:id`                                    | Updates an investment (partial)     |
| DELETE | `/investments/:id`                                    | Deletes an investment               |

**Body for create/update:**

```json
{
  "amount": 50000,
  "category": "Stock",
  "returnRate": 8.5,
  "startDate": "2026-01-10",
  "endDate": "2026-12-10",
  "description": "Tech stocks"
}
```

**Valid categories:** `Stock`, `Bond`, `Mutual Funds`, `ETF`, `Real State`, `Term Deposit`, `Others`

`endDate` is optional — it allows representing investments with no fixed closing date (e.g. a renewable term deposit).

**Date filter:** accepts `filter=week|month|3months` as a shortcut, or `startDate`/`endDate` for a custom range.

## Data model

```
users
├── id, email, password (hash), created_at

expenses          savings            investments
├── id             ├── id             ├── id
├── user_id (FK)   ├── user_id (FK)   ├── user_id (FK)
├── amount         ├── amount         ├── amount
├── category       ├── category      ├── category
├── description     ├── description   ├── return_rate
├── date            └── created_at    ├── start_date
└── created_at                        ├── end_date
                                       └── description
```

Every financial record table is linked to `users` via `user_id`, and every query filters by the authenticated user — a user can never see or modify another user's data.

## Security

- Passwords hashed with `bcrypt` before being stored
- Stateless authentication with JWT (1 hour expiration)
- All queries use parameterized placeholders (SQL injection protection)
- Input validation on every endpoint (types, formats, allowed values)
- Body size limit (10kb) to prevent abusive payloads
- Security headers via `helmet`
- 404 handler for undefined routes
- Errors are logged server-side (`console.error`) without leaking internal details to the client

## Author

Alejo Grané — [GitHub](https://github.com/AlejoGrane) · [LinkedIn](https://www.linkedin.com/in/alejograne/)
