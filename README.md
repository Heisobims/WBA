# WBAcademy

A full-stack AI training data collection platform where users complete questionnaires, earn XP, level up, and help build better AI systems.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5 |
| Database | PostgreSQL via Prisma ORM |
| Auth | NextAuth v5 (Credentials + Google + GitHub) |
| Styling | Tailwind CSS + CVA |
| State | Zustand + TanStack Query |
| AI | OpenAI / Gemini / Groq |
| Payments | Stripe |
| Email | Resend |
| Rate limiting | Upstash Redis |
| Animations | Framer Motion |
| Charts | Recharts |

---

## Features

- **Questionnaire builder** — drag-and-drop editor with 20+ question types (multiple choice, code editor, voice recording, RLHF ranking, sliders, file upload, and more)
- **Adaptive AI follow-ups** — AI generates contextual follow-up questions based on user responses
- **Gamification** — XP points, levels, streaks, achievements, and a global leaderboard
- **Learning tracks** — structured curriculum paths with progress tracking
- **AI tutor** — interactive practice sessions
- **Analytics dashboard** — response quality scores, completion rates, time-on-task
- **Admin panel** — user management, content moderation, dataset export, audit logs
- **Multi-provider auth** — email/password, Google OAuth, GitHub OAuth
- **Billing** — Stripe-powered subscription plans (Free / Pro / Teams)

---

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database (local, [Supabase](https://supabase.com), or [Railway](https://railway.app))
- An OpenAI, Gemini, or Groq API key (at least one required for AI features)

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in every value. Key variables:

```env
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="..."        # openssl rand -base64 32
GOOGLE_CLIENT_ID="..."
GITHUB_CLIENT_ID="..."
OPENAI_API_KEY="sk-..."
STRIPE_SECRET_KEY="sk_test_..."
```

See [.env.example](.env.example) for the full list and generation instructions.

### 3. Set up the database

```bash
# Push schema to your database
npm run db:push

# (Optional) Run migrations instead
npm run db:migrate

# Seed with demo data and an admin account
npm run db:seed
```

The seed script creates an admin user using `ADMIN_EMAIL` and `ADMIN_PASSWORD` from your `.env.local`.

### 4. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
├── app/
│   ├── (auth)/          # Login, register, forgot-password
│   ├── (dashboard)/     # Authenticated user area
│   │   ├── dashboard/
│   │   ├── questionnaires/   # Browse, build, and play questionnaires
│   │   ├── tracks/           # Learning tracks
│   │   ├── practice/         # AI-powered practice tasks
│   │   ├── tutor/            # AI tutor chat
│   │   ├── exams/
│   │   ├── leaderboard/
│   │   ├── achievements/
│   │   ├── analytics/
│   │   ├── notifications/
│   │   ├── profile/
│   │   ├── billing/
│   │   └── settings/
│   ├── (admin)/         # Admin-only area (/admin/*)
│   ├── (marketing)/     # Public pages (home, pricing, docs, etc.)
│   └── api/             # API route handlers
│
├── components/
│   ├── ui/              # Design system (Button, Card, Badge, Input, …)
│   ├── layout/          # Navbar, sidebar, footer
│   ├── questionnaire/   # Builder and player components
│   └── gamification/    # XP bars, streak badges
│
├── lib/
│   ├── auth.ts          # NextAuth configuration
│   ├── auth.config.ts   # Auth callbacks and JWT strategy
│   ├── db.ts            # Prisma client singleton
│   ├── utils.ts         # cn(), formatDuration(), levelProgress()
│   └── rate-limit.ts    # Upstash rate limiter
│
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── seed.ts          # Demo data seeder
│
├── store/               # Zustand stores
├── types/               # Shared TypeScript types
└── .env.example         # Environment variable template
```

---

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run type-check` | TypeScript type check (`tsc --noEmit`) |
| `npm run format` | Format with Prettier |
| `npm run db:generate` | Regenerate Prisma client |
| `npm run db:push` | Push schema changes (no migration files) |
| `npm run db:migrate` | Create and apply a migration |
| `npm run db:seed` | Seed the database |
| `npm run db:studio` | Open Prisma Studio |

---

## API Routes

| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/register` | Create a new account |
| PATCH | `/api/users/me` | Update profile / notification settings |
| DELETE | `/api/users/me` | Delete own account |
| GET/POST | `/api/questionnaires` | List / create questionnaires |
| GET/PATCH/DELETE | `/api/questionnaires/[id]` | Single questionnaire |
| GET | `/api/questionnaires/[id]/analytics` | Response analytics |
| POST | `/api/responses` | Submit questionnaire answers |
| GET | `/api/achievements` | User achievements |
| GET | `/api/leaderboard` | Global leaderboard |
| GET | `/api/analytics` | Personal analytics |
| GET/PATCH | `/api/notifications` | Notifications |
| POST | `/api/contact` | Contact form submission |
| POST | `/api/ai/generate-questions` | AI question generation |
| POST | `/api/ai/follow-up` | AI adaptive follow-up |
| GET/POST | `/api/admin/users` | Admin: user management |
| PATCH/DELETE | `/api/admin/users/[id]` | Admin: update/delete user |
| GET/POST | `/api/admin/datasets` | Admin: dataset management |
| GET | `/api/admin/audit-logs` | Admin: audit log viewer |
| POST | `/api/admin/moderation` | Admin: content moderation |
| GET/PATCH | `/api/templates` | Question templates |

---

## OAuth Setup

**Google**
1. Go to [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials
2. Create an OAuth 2.0 Client ID (Web application)
3. Add `http://localhost:3000/api/auth/callback/google` as an Authorized redirect URI

**GitHub**
1. Go to GitHub → Settings → Developer settings → OAuth Apps → New OAuth App
2. Set Authorization callback URL to `http://localhost:3000/api/auth/callback/github`

---

## Deployment

The app is optimized for [Vercel](https://vercel.com):

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Set all environment variables in your Vercel project settings. Use `NEXTAUTH_URL` pointing to your production domain, and ensure your database `DATABASE_URL` is accessible from Vercel's edge network.

For the database, [Supabase](https://supabase.com) and [Railway](https://railway.app) both work well. Set both `DATABASE_URL` (connection pooler) and `DIRECT_URL` (direct connection) for Prisma migrations.

---

## Roles

| Role | Access |
|---|---|
| `USER` | Complete questionnaires, view own analytics and leaderboard |
| `AI_TRAINER` | Create and manage questionnaires |
| `REVIEWER` | Review and moderate responses |
| `ADMIN` | Full admin panel access |
| `SUPER_ADMIN` | All permissions including role assignment |

---

## License

Private — all rights reserved.
