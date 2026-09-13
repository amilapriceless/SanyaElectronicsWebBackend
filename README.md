# Backend API

Express and MongoDB backend for product management, showroom targets, showroom arrears, and role-based authentication.

## Features

- REST API built with Express
- MongoDB persistence with Mongoose
- Product CRUD with pagination, filtering, search, and in-memory caching
- Showroom target and arrears tracking
- Primary-gate and role-based authentication using secure HTTP-only cookies
- Request validation with Zod
- Helmet security headers, CORS, compression, and rate limiting
- Health and readiness endpoints
- Graceful shutdown handling

## Requirements

- Node.js 18 or newer
- npm
- MongoDB Atlas or a local MongoDB instance for persistent data

In development, if `MONGO_URI` is missing or invalid, the server attempts to start an in-memory MongoDB instance.

## Getting Started

1. Clone the repository and enter the backend directory.

   ```bash
   git clone <repository-url>
   cd backend
   ```

2. Install dependencies.

   ```bash
   npm install
   ```

3. Create an environment file.

   ```bash
   copy .env.example .env
   ```

   On macOS or Linux, use `cp .env.example .env` instead.

4. Update `.env` with your MongoDB URI and authentication values.

5. Start the development server.

   ```bash
   npm run dev
   ```

The API is available at `http://localhost:5000` by default.

## Environment Variables

| Variable | Required | Description |
| --- | --- | --- |
| `PORT` | No | HTTP port. Defaults to `5000`. |
| `NODE_ENV` | No | Use `development` locally and `production` when deployed. |
| `MONGO_URI` | Production | MongoDB connection string. |
| `ALLOWED_ORIGINS` | Production | Comma-separated frontend origins allowed by CORS. |
| `AUTH_JWT_SECRET` | Production | JWT signing secret; must be at least 32 characters. |
| `AUTH_PRIMARY_PASSCODE` | Production | Passcode for the primary authentication gate. |
| `AUTH_OFFICER_PASSWORD` | Production | Initial officer account password. |
| `AUTH_SYSTEM_ADMIN_PASSWORD` | Production | Initial system administrator password. |
| `AUTH_SESSION_TTL` | No | Session lifetime. Defaults to `8h`. |

Never commit `.env` or production secrets to the repository.

## API

All API responses use a JSON shape similar to:

```json
{
  "success": true,
  "data": {}
}
```

### Health

| Method | Endpoint | Description | Auth |
| --- | --- | --- |
| `GET` | `/health/live` | Confirms that the process is running. | Public |
| `GET` | `/health/ready` | Confirms that MongoDB is connected. | Public |
| `GET` | `/api/health/live` | API-prefixed liveness check. | Public |
| `GET` | `/api/health/ready` | API-prefixed readiness check. | Public |

### Authentication

Authentication uses cookies. Send requests from a client configured to include credentials, for example `credentials: "include"` in `fetch`.

| Method | Endpoint | Description | Auth |
| --- | --- | --- | --- |
| `POST` | `/api/auth/primary-login` | Validates the primary passcode and opens the login gate. | Public |
| `POST` | `/api/auth/role-login` | Logs in as `officer` or `systemAdmin`. | Primary gate |
| `GET` | `/api/auth/me` | Returns the authenticated role. | Authenticated |
| `POST` | `/api/auth/logout` | Clears authentication cookies. | Public |
| `PUT` | `/api/auth/passwords` | Changes an officer or system administrator password. | `systemAdmin` |

Example login requests:

```bash
curl -i -c cookies.txt -H "Content-Type: application/json" \
  -d "{\"passcode\":\"your-primary-passcode\"}" \
  http://localhost:5000/api/auth/primary-login

curl -i -b cookies.txt -c cookies.txt -H "Content-Type: application/json" \
  -d "{\"role\":\"systemAdmin\",\"password\":\"your-password\"}" \
  http://localhost:5000/api/auth/role-login
```

### Products

| Method | Endpoint | Description | Auth |
| --- | --- | --- | --- |
| `GET` | `/api/products` | Lists products. | Public |
| `GET` | `/api/products/:id` | Gets one product. | Public |
| `POST` | `/api/products` | Creates a product. | `systemAdmin` |
| `PUT` | `/api/products/:id` | Updates a product. | `systemAdmin` |
| `DELETE` | `/api/products/:id` | Deletes a product. | `systemAdmin` |

Product list query parameters:

- `page`: Page number, default `1`.
- `limit`: Results per page, default `20`, maximum `100`.
- `category`: Category filter.
- `brand`: Brand filter.
- `search`: Text search filter.

A product must include fields such as `productCode`, `name`, `brand`, `category`, `powerConsumption`, `prices`, and `stock`. AC products require `btuCount`; non-AC products generally require `description` and `technology` according to the validation rules.

### Showroom Targets

All showroom target endpoints require authentication. The default year is `2026`.

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/showroom-targets/:showroomSlug?year=2026` | Lists monthly targets. |
| `GET` | `/api/showroom-targets/:showroomSlug/:month?year=2026` | Gets one monthly target. |
| `PUT` | `/api/showroom-targets/:showroomSlug/:month?year=2026` | Creates or updates a monthly target. |

Target request bodies include `target`, `achieved`, `lastYearAchievement`, and may include `updateDate` (`YYYY-MM-DD`) and `notes`.

### Showroom Arrears

All showroom arrears endpoints require authentication. The default year is `2026`.

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/showroom-arrears/:showroomSlug?year=2026` | Gets arrears for a showroom and year. |
| `PUT` | `/api/showroom-arrears/:showroomSlug?year=2026` | Creates or updates arrears. |

Arrears request bodies include `outstanding`, and may include `overdueAccounts`, `nextReview` (`YYYY-MM-DD`), and `notes`.

## Development Scripts

```bash
npm run dev    # Start the development server
npm start      # Start the production process
```

## Production Notes

Set `NODE_ENV=production` and provide every production environment variable before starting the server. Production requests must use HTTPS, and `ALLOWED_ORIGINS` must contain the frontend origin.

The API applies a general rate limit of 150 requests per 15 minutes and a stricter authentication limit of 10 attempts per 15 minutes.

## Project Structure

```text
src/
  app.js                 Express middleware and route registration
  server.js              Startup and graceful shutdown
  config/                Database and environment configuration
  controllers/           HTTP request handlers
  middleware/            Authentication, validation, and error handling
  models/                Mongoose models
  routes/                API route definitions
  services/              Business logic and database operations
  utils/                 Shared errors, caching, and async helpers
  validators/            Zod request schemas
```

## License

This project is currently distributed under the ISC license declared in `package.json`.
