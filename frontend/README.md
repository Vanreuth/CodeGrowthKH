# Frontend (Next.js)

This is the frontend application for the online education platform. It is built with Next.js App Router, React, TypeScript, and React Query.

## Tech Stack

- Next.js 16 (App Router)
- React 19 + TypeScript
- Tailwind CSS 4
- TanStack React Query
- Radix UI + custom UI components
- Axios for API communication

## Key Features

- Public pages: home, courses, roadmap, contact, account
- Course browsing and filtering
- Course learning pages by slug and lesson slug
- Authentication pages (login/register/forgot password)
- OAuth2 callback support
- Dashboard pages for content management
- API route handlers under src/app/api/v1/* for proxy/auth flows

## Prerequisites

- Node.js 20+
- npm 10+

## Environment Variables

Create a file named .env in this frontend folder.

```env
# Backend base URL used by the frontend
NEXT_PUBLIC_API_URL=http://localhost:8080
```

Notes:

- `NEXT_PUBLIC_API_URL` is the primary frontend API base URL.
- Older `API_BASE_URL` is still accepted as a fallback.
- If neither env var is provided, it falls back to https://codegrowthkh.onrender.com.

## Run Locally

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Build and Start

```bash
npm run build
npm run start
```

## Project Structure (Important Paths)

- src/app/(home)/* : public routes
- src/app/(home)/courses/page.tsx : all courses page
- src/app/(home)/courses/[slug]/page.tsx : single course page
- src/app/(home)/courses/[slug]/[lesson]/page.tsx : lesson page
- src/components/* : reusable UI and feature components
- src/hooks/* : React Query hooks and client-side logic
- src/lib/* : API services and utilities
- src/types/* : shared TypeScript interfaces

## Scripts

- npm run dev : start development server
- npm run build : production build
- npm run start : run production server
- npm run lint : run ESLint

## Troubleshooting

- If routes do not update after file changes, restart dev server.
- If frontend cannot reach backend, verify `NEXT_PUBLIC_API_URL`.
- If cookies/auth fail in production, verify backend cookie and CORS settings.
