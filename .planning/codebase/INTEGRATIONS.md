# External Integrations

**Analysis Date:** 2026-04-05

## APIs & External Services

**Backend-as-a-Service:**
- Supabase - Database, auth, and realtime subscriptions; the sole backend
  - SDK/Client: `@supabase/supabase-js` 2.46
  - Client singleton: `src/lib/supabase.ts`
  - Auth env var: `VITE_SUPABASE_ANON_KEY`
  - Project URL env var: `VITE_SUPABASE_URL`

**OAuth Providers:**
- Google OAuth - Provided via Supabase Auth; used on login and signup screens
  - Implementation: `supabase.auth.signInWithOAuth({ provider: 'google' })` in `src/pages/Login.tsx` and `src/pages/Signup.tsx`
  - Redirect target: `${window.location.origin}/dashboard`

## Data Storage

**Database:**
- Supabase (PostgreSQL)
  - Connection: managed by `@supabase/supabase-js`; no direct connection string exposed in frontend
  - Client: `supabase` singleton from `src/lib/supabase.ts`
  - Tables accessed:
    - `profiles` — user business profile; read in `src/hooks/useProfile.ts`, written in `src/pages/Onboarding.tsx`
    - `suppliers` — supplier records; full CRUD in `src/hooks/useSuppliers.ts`
    - `ingredients` — ingredient records with current price; full CRUD in `src/hooks/useIngredients.ts`
    - `ingredient_price_history` — price change log; written on price update in `src/hooks/useIngredients.ts`, read via join
    - `menu_items` — recipe/menu item records; full CRUD in `src/hooks/useRecipes.ts`
    - `recipe_lines` — ingredient lines per recipe; written/deleted as part of `saveRecipe` in `src/hooks/useRecipes.ts`
  - Row-level security assumed (user_id column on all user-owned tables)

**File Storage:**
- Not used

**Caching:**
- None (all state held in React component state via custom hooks)

## Authentication & Identity

**Auth Provider:**
- Supabase Auth
  - Email/password: `supabase.auth.signInWithPassword` (login), `supabase.auth.signUp` (signup)
  - Google OAuth: `supabase.auth.signInWithOAuth`
  - Session management: `supabase.auth.getSession()` + `supabase.auth.onAuthStateChange()` in `src/contexts/AuthContext.tsx`
  - Sign out: `supabase.auth.signOut()`
  - Auth state exposed via `AuthContext` — `session`, `user`, `loading`, `signOut`
  - Protected routes handled by `src/components/ProtectedRoute.tsx`

## Realtime

**Supabase Realtime:**
- One active channel in `src/hooks/useRecipes.ts`: `ingredient-price-watch`
- Listens for `UPDATE` events on `public.ingredients` table
- Triggers recipe cost recalculation whenever an ingredient price changes
- Channel cleanup on unmount via `supabase.removeChannel()`

## Monitoring & Observability

**Error Tracking:**
- None configured

**Logs:**
- No structured logging; errors surfaced to UI via component state (`authError`, `error` state vars)

## CI/CD & Deployment

**Hosting:**
- Vercel (static SPA)
- Config: `vercel.json` — single rewrite rule for SPA routing
- Live URL: https://bep-app-mocha.vercel.app

**CI Pipeline:**
- Not detected (no GitHub Actions or other CI config found)

**Repository:**
- GitHub: Cyclops8833/bep-app

## Environment Configuration

**Required env vars:**
- `VITE_SUPABASE_URL` — Supabase project URL
- `VITE_SUPABASE_ANON_KEY` — Supabase anonymous/public key

**Secrets location:**
- `.env.local` (gitignored); example template at `.env.local.example`
- For production (Vercel): set as environment variables in Vercel project settings

## Webhooks & Callbacks

**Incoming:**
- None detected

**Outgoing:**
- None detected (Google OAuth redirect is a browser redirect, not a server webhook)

---

*Integration audit: 2026-04-05*
