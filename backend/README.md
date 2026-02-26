# Twitter Clone – Backend

Node.js/Express API for the Twitter clone (Chirper). MVC structure, JWT auth, MySQL, AWS S3 for profile pictures.

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Database**
   - Ensure MySQL is running and the `chirper` database exists with the schema applied (see `../CS196-Database-main/README.md`).

3. **Environment**
   - Copy `.env.example` to `.env` and set:
     - `PORT` – server port (default 3000)
     - `JWT_SECRET` – secret for signing JWTs
     - `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` – MySQL connection
     - `AWS_*`, `S3_BUCKET` – for profile picture uploads (optional for local dev)

## Scripts

- `npm start` – run server
- `npm run dev` – run with nodemon
- `npm test` – run tests with coverage (target 90%+)

## Structure (MVC)

- `src/config/` – env and DB pool
- `src/models/` – DB access (users, tweets, likes, follows, blocks, comments, blacklist)
- `src/controllers/` – request handlers
- `src/routes/` – route definitions
- `src/middleware/` – auth, upload, error handler
- `src/services/` – S3 upload
- `src/utils/` – validators
- `tests/` – unit and integration tests

## API Documentation (Swagger UI)

With the server running, open **http://localhost:3000/api-docs** to view interactive API documentation (Swagger UI). You can try endpoints and add a Bearer token for protected routes.

## API (high level)

- **Auth:** `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`
- **Users:** `GET /users/:id`, `PUT /users/me`, `POST /users/me/profile-picture`, `POST|DELETE /users/:id/follow`, `POST|DELETE /users/:id/block`
- **Tweets:** `POST /tweets`, `PUT /tweets/:id`, `DELETE /tweets/:id`, `POST|DELETE /tweets/:id/like`, `POST|DELETE /tweets/:id/retweet`, `POST /tweets/:id/comments`, `GET /tweets/:id/comments`
- **Comments:** `DELETE /comments/:id`
- **Feed:** `GET /feed?limit=50&cursor=...`

All except `/health`, `/auth/register`, and `/auth/login` require `Authorization: Bearer <token>`.
