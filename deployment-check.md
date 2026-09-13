# Production Deployment Checklist

## Required backend variables

Set these in the hosting platform secret/environment settings. Do not commit the real values.

- `NODE_ENV=production`
- `PORT` supplied by the host, or the host's configured port
- `MONGO_URI` with a restricted MongoDB user and production database
- `ALLOWED_ORIGINS` containing only the deployed frontend origin, for example `https://app.example.com`
- `AUTH_JWT_SECRET` as a generated random value of at least 32 characters
- `AUTH_PRIMARY_PASSCODE` as a strong initial gate passcode
- `AUTH_OFFICER_PASSWORD` as a strong initial officer password
- `AUTH_SYSTEM_ADMIN_PASSWORD` as a strong initial system-admin password
- `AUTH_SESSION_TTL`, for example `8h`

## Frontend variables

Set `VITE_API_URL` to the public HTTPS backend URL before building the frontend.

## Host configuration

- Deploy the backend behind HTTPS and configure TLS at the platform or reverse proxy.
- Allow the frontend origin in `ALLOWED_ORIGINS`; never use `*` with credentials.
- Allow the backend host to reach MongoDB and restrict MongoDB network access to that host.
- Use `npm start` for the backend and `npm run build` followed by the host's static/Vite deployment for the frontend.
- Configure health checks against `/api/health/ready` and liveness checks against `/api/health/live`.
- Rotate the initial passwords after first login through the System Admin password page.
- Review platform logs and alerts without logging request bodies, passwords, cookies, or database connection strings.

## Pre-release verification

- Confirm `NODE_ENV=production` starts successfully with all required variables.
- Confirm an Officer receives `403` for product create, update, and delete API requests.
- Confirm unauthenticated requests receive `401` for protected statistics and arrears APIs.
- Confirm `/api/health/ready` returns `503` when MongoDB is unavailable.