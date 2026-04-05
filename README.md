# Bếp — F&B Management Built for Vietnam

Vietnamese-native F&B operations and accounting SaaS.

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy `.env.local.example` to `.env.local` and fill in your Supabase credentials:

```bash
cp .env.local.example .env.local
```

| Variable | Where to find it |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project → Settings → API → Project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase project → Settings → API → anon/public key |

### 3. Run dev server

```bash
npm run dev
```

### 4. Build for production

```bash
npm run build
```

## Deployment

Connected to Vercel via GitHub. Push to `main` to deploy. All routes fall back to `index.html` for SPA routing (configured in `vercel.json`).

## Stack

- **Frontend:** React 18 + Vite + TypeScript + Tailwind CSS
- **Auth & DB:** Supabase (Postgres + Auth + Storage)
- **AI:** Claude API (`claude-sonnet-4-6`) — invoice extraction
- **i18n:** react-i18next (Vietnamese default, English toggle)
- **Deployment:** Vercel

## Project structure

```
src/
├── components/   # Shared UI components
├── hooks/        # Custom React hooks
├── lib/          # Singletons (supabase client, i18n config)
├── locales/      # vi.json + en.json translation files
├── pages/        # Route-level page components
└── types/        # TypeScript type definitions
```
