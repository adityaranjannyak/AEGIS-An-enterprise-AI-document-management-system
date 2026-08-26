# AEGIS DMS Frontend and Spring Boot Integration

The AEGIS Console frontend is integrated with the supplied Spring Boot API at `http://localhost:8081` through the existing `VITE_API_BASE_URL` environment setting. `VITE_DMS_API_BASE_URL` can override that URL when required.

## Integrated routes

The frontend now uses `POST /login`, `GET` and `PUT /users/me`, the authenticated document routes under `/documents`, activity routes under `/activities`, notification routes under `/notifications`, user administration under `/users`, and RAG at `POST /rag/ask`.

The backend was extended with browser CORS support, a login response that includes the authenticated user, current-user profile routes, persisted `ACTIVE`/`DISABLED` account status, role resolution during user creation and update, a bulk permission-save route, and an authorization-aware multi-document RAG route. AI queries are recorded in activity history.

## Run locally

Start the backend from `DMS/` using a Java and Maven installation that satisfy the project’s configured Java version. Then start the frontend from `dms-frontend/`:

```bash
npm install
npm run dev
```

The frontend production build completes successfully. The backend build was not run in this workspace because Maven is unavailable and the supplied Maven project specifies Java 25 while the available runtime is Java 21.

## Security note

Do not keep database passwords, JWT secrets, or development JWTs in tracked source files. Move them to local environment configuration or a secret manager before sharing or deploying the project.
