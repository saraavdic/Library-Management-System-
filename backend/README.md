# Backend README

Quick instructions to run the backend and connect to your MySQL database.

1. Copy `.env.example` to `.env` and fill your DB credentials.

2. Install dependencies:

```bash
cd backend
npm install
```

3. Start in dev mode:

```bash
npm run dev
```

4. Example endpoints (after server is running):

- `GET /api/books` — list books
- `GET /api/books/:id` — get one book
- `POST /api/books` — create book (JSON body)
- `PUT /api/books/:id` — update book
- `DELETE /api/books/:id` — delete book

Same pattern for `/api/members`.

---

5. Authentication / Admin

- Login now returns a short-lived JWT token at `POST /api/users/login` as `token` in the response. Store it client-side and send it as `Authorization: Bearer <token>` for protected endpoints.
- The backend expects a `JWT_SECRET` environment variable; a default is used for local dev but you should set a secure secret in production.
- A hidden admin endpoint is available at `GET /api/admin-6f2b3d/secret` and requires an admin role in the JWT (`role: 'admin'`).
- Admins must sign in via the hidden admin login endpoint: `POST /api/admin/login` (use the hidden frontend page `/admin-login-6f2b3d`).
  - The public login at `POST /api/users/login` will reject admin credentials and return 403 with message `Admin users must use the admin login page`.
- Admin member invite flow:
  - `POST /api/admin/members` (admin-only) — accepts `{ first_name, last_name, email }`, creates a user with `status = 'pending'`, generates a one-time token, stores its hash, and logs (mocks) an activation link. Returns `{ activationLink }` in dev.
  - `POST /api/activate-account` — accepts `{ token, password }`, validates token and expiry, sets `password_hash`, sets `status = 'active'`, and deletes the token.
  - Invitation tokens expire after 24 hours. Admin endpoints are protected with `requireAuth`/`requireAdmin`.
