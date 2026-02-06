# Library Management System Website

This project presents a library management system that was created to automate and simplify library operations using React and Node.js.

## Getting Started

Run frontend and backend together from the project root.

1) Install root dev dependencies (adds `concurrently`):

```bash
cd my-app
npm install
```

2) Install both subproject dependencies:

```bash
npm run install:all
```

3) Start both services in development (opens two servers):

```bash
npm run dev
```

## Alternatives

- Run backend only:

```bash
cd backend
npm install
npm run dev
```

- Run frontend only:

```bash
cd frontend
npm install
npm run dev
```

## Notes

- Vite dev server proxies `/api` requests to the backend. Ensure `backend/.env` has your DB settings and backend is running on port 8081.
- If you prefer not to use `concurrently`, open two terminals and run frontend/backend separately.
