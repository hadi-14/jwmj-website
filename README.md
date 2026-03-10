# JWMJ Website

A modern community website built with Next.js, Prisma, and Tailwind CSS (or CSS modules). This project powers the JWMJ + JWMYO digital experiences, including public site pages, event management, member portal, and admin operations.

## Core Features

- Public content pages
  - Home, About, Contact
  - About JWMYO, Youth Programs, Presidency, Privacy Policy, Terms of Service
  - Events listing with featured events and event details
- Events platform
  - Create and manage events through admin UI
  - Event application and submission tracking
  - Auto sync from source with `sync/mysql_sync.py`
- Member portal
  - Member registration, login, forgot/reset password flow
  - Account management and profile updates
  - Access restricted content for authenticated members
  - Verification email & session endpoints
- Admin dashboard
  - Admin login and role-based access
  - Event approval and moderation
  - Member and submission management
  - Audit logs and activity monitoring (`/src/app/api/audit-logs/route.ts`)
- Forms and submissions
  - Dynamic forms with reusable JSON templates
  - Submission routes (`/src/app/api/submissions`) for handling user form data
  - Admin form builder UI
- API and backend
  - Next.js API routes under `/src/app/api` for events, users, members, auth
  - Prisma ORM with `schema.prisma` models for users, events, forms, submissions
  - Email utilities (`/src/lib/email.ts`) for notifications and verification

## Local development

1. Install dependencies

```bash
npm install
```

2. Configure environment

- Create `.env` from `.env.example` (if available)
- Set `DATABASE_URL` for PostgreSQL / MySQL
- Set email provider variables for registration/verification

3. Run Prisma migrations

```bash
npx prisma migrate dev --name init
```

4. Seed or sample data

```bash
npm run prisma:seed
# or
node scripts/add-sample-events.ts
```

5. Start the dev server

```bash
npm run dev
```

6. Open the app

- Frontend: `http://localhost:3000`
- Admin: `http://localhost:3000/admin`

## Production build

```bash
npm run build
npm run start
```

## Project structure

- `app/`: Next.js app routes and layouts
- `components/`: UI components for pages and admin
- `src/actions/`: server actions and API route helpers
- `src/lib/`: business logic helpers, schema validation, email
- `prisma/`: schema, client config, migrations
- `scripts/`: data seed + utilities
- `sync/`: data sync scripts from external DB sources

## Authentication & Authorization

- JWT or session-based API guards in `/src/app/api/auth`
- `AuthContext` for member/admin login state
- Password reset flow: `forgot-password` / `reset-password`

## Development utilities

- `useForm` and `useFormSubmission` custom hooks for forms
- `Notification`, `ConfirmationModal`, and loaders for UX
- Audit logging for admin actions

## Notes

- Keep `public/uploads/pdfs` for static downloads.
- Update `next.config.ts` when adding new resource types.
- Keep `.gitignore` clean for local secrets.

