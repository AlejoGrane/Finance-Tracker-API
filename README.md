# Finance Tracker API

REST API para gestionar finanzas personales: gastos, ahorros e inversiones. Cada usuario tiene su propio set de registros, protegidos con autenticación JWT.

Proyecto backend basado en el [Expense Tracker API](https://roadmap.sh/projects/expense-tracker-api) de roadmap.sh, expandido con módulos de ahorros e inversiones.

## Stack

- **Runtime:** Node.js 24
- **Framework:** Express 5
- **Base de datos:** MySQL (via `mysql2`, con connection pooling)
- **Autenticación:** JWT (`jsonwebtoken`) + hashing de passwords (`bcrypt`)
- **Dev tooling:** `nodemon`, `dotenv`

## Arquitectura

El proyecto sigue una estructura por capas:

```
src/
├── config/        # conexión a la base de datos
├── routes/        # definición de endpoints
├── middlewares/    # autenticación JWT
├── controllers/    # lógica de negocio y validaciones
├── models/         # queries a la base de datos
└── utils/          # helpers compartidos (JWT, validadores)
```

Cada request pasa por: `routes → middleware de auth → controller → model → base de datos`.

## Instalación

### Requisitos

- Node.js 18 o superior
- MySQL corriendo localmente (o accesible por red)

### Pasos

1. Cloná el repositorio:

   ```bash
   git clone https://github.com/AlejoGrane/finance-tracker-api.git
   cd finance-tracker-api
   ```

2. Instalá las dependencias:

   ```bash
   npm install
   ```

3. Creá la base de datos ejecutando el script incluido:

   ```bash
   mysql -u root -p < database/schema.sql
   ```

   O corré el contenido de `database/schema.sql` directamente en MySQL Workbench.

4. Copiá `.env.example` a `.env` y completá tus datos:

   ```bash
   cp .env.example .env
   ```

   | Variable      | Descripción                                                            |
   | ------------- | ---------------------------------------------------------------------- |
   | `PORT`        | Puerto donde corre el servidor (default: 3000)                         |
   | `DB_HOST`     | Host de MySQL                                                          |
   | `DB_USER`     | Usuario de MySQL                                                       |
   | `DB_PASSWORD` | Password de MySQL                                                      |
   | `DB_NAME`     | Nombre de la base de datos                                             |
   | `JWT_SECRET`  | String secreto para firmar los JWT (cualquier valor largo y aleatorio) |

5. Levantá el servidor:
   ```bash
   npm run dev
   ```

La API queda disponible en `http://localhost:3000`.

## Autenticación

Todos los endpoints, excepto `signup` y `login`, requieren un JWT válido en el header:

```
Authorization: Bearer <token>
```

El token se obtiene al hacer login y expira a la hora.

## Endpoints

### Auth

| Método | Endpoint       | Descripción                    | Body                                          |
| ------ | -------------- | ------------------------------ | --------------------------------------------- |
| POST   | `/auth/signup` | Registra un usuario nuevo      | `{ "email": "string", "password": "string" }` |
| POST   | `/auth/login`  | Inicia sesión, devuelve un JWT | `{ "email": "string", "password": "string" }` |

**Ejemplo — signup:**

```bash
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email": "ale@test.com", "password": "123456"}'
```

**Respuesta:**

```json
{ "newUserId": 1, "email": "ale@test.com" }
```

**Ejemplo — login:**

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "ale@test.com", "password": "123456"}'
```

**Respuesta:**

```json
{ "tokenUser": "eyJhbGciOiJIUzI1NiIs..." }
```

### Expenses

| Método | Endpoint                       | Descripción                        |
| ------ | ------------------------------ | ---------------------------------- |
| POST   | `/expenses`                    | Crea un gasto                      |
| GET    | `/expenses`                    | Lista todos los gastos del usuario |
| GET    | `/expenses/category?category=` | Filtra gastos por categoría        |
| GET    | `/expenses/date?date=`         | Filtra gastos por fecha            |
| PATCH  | `/expenses/:id`                | Actualiza un gasto (parcial)       |
| DELETE | `/expenses/:id`                | Elimina un gasto                   |

**Body para crear/actualizar:**

```json
{
  "amount": 4500.5,
  "category": "Groceries",
  "description": "Supermercado",
  "date": "2026-08-15"
}
```

**Categorías válidas:** `Groceries`, `Leisure`, `Electronics`, `Utilities`, `Clothing`, `Health`, `Others`

### Savings

| Método | Endpoint                      | Descripción                         |
| ------ | ----------------------------- | ----------------------------------- |
| POST   | `/savings`                    | Crea un ahorro                      |
| GET    | `/savings`                    | Lista todos los ahorros del usuario |
| GET    | `/savings/category?category=` | Filtra ahorros por categoría        |
| PATCH  | `/savings/:id`                | Actualiza un ahorro (parcial)       |
| DELETE | `/savings/:id`                | Elimina un ahorro                   |

**Body para crear/actualizar:**

```json
{
  "amount": 10000,
  "category": "Vacaciones",
  "description": "Ahorro para viaje"
}
```

La categoría de savings es un texto libre (no una lista fija).

### Investments

| Método | Endpoint                                             | Descripción                             |
| ------ | ---------------------------------------------------- | --------------------------------------- |
| POST   | `/investments`                                       | Crea una inversión                      |
| GET    | `/investments`                                       | Lista todas las inversiones del usuario |
| GET    | `/investments/category?category=`                    | Filtra inversiones por categoría        |
| GET    | `/investments/date?filter=` o `?startDate=&endDate=` | Filtra inversiones por rango de fecha   |
| PATCH  | `/investments/:id`                                   | Actualiza una inversión (parcial)       |
| DELETE | `/investments/:id`                                   | Elimina una inversión                   |

**Body para crear/actualizar:**

```json
{
  "amount": 50000,
  "category": "Stock",
  "returnRate": 8.5,
  "startDate": "2026-01-10",
  "endDate": "2026-12-10",
  "description": "Acciones tecnológicas"
}
```

**Categorías válidas:** `Stock`, `Bond`, `Mutual Funds`, `ETF`, `Real State`, `Term Deposit`, `Others`

`endDate` es opcional — permite representar inversiones sin plazo de cierre definido (ej. un plazo fijo renovable).

**Filtro por fecha:** acepta `filter=week|month|3months` como atajo, o `startDate`/`endDate` para un rango personalizado.

## Modelo de datos

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

Cada tabla de registros financieros está ligada a `users` mediante `user_id`, y todas las consultas filtran por el usuario autenticado — un usuario nunca puede ver ni modificar datos de otro.

## Seguridad

- Passwords hasheados con `bcrypt` antes de guardarse
- Autenticación stateless con JWT (expiración de 1 hora)
- Todas las queries usan placeholders parametrizados (protección contra SQL injection)
- Validación de datos de entrada en cada endpoint (tipos, formatos, valores permitidos)
- Límite de tamaño de body (10kb) para evitar payloads abusivos
