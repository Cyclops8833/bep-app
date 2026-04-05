# Technology Stack

**Analysis Date:** 2026-04-05

## Languages

**Primary:**
- TypeScript 5.6 - All application code under `src/`

**Secondary:**
- CSS (Tailwind utility classes) - Styling throughout `src/**/*.tsx`

## Runtime

**Environment:**
- Browser (SPA — no server-side runtime)
- Node.js required for build/dev tooling only

**Package Manager:**
- npm
- Lockfile: `package-lock.json` present

## Frameworks

**Core:**
- React 18.3 - UI rendering, `src/main.tsx` entry point, `src/App.tsx` root
- React Router DOM 6.27 - Client-side routing, configured in `src/App.tsx`

**Styling:**
- Tailwind CSS 3.4 - Utility-first CSS, config at `tailwind.config.js`
- PostCSS 8.4 - CSS processing pipeline, config at `postcss.config.js`

**Forms & Validation:**
- react-hook-form 7.72 - Form state management
- @hookform/resolvers 5.2 - Bridges react-hook-form with Zod
- Zod 4.3 - Schema validation, used in `src/pages/Login.tsx` and `src/pages/Signup.tsx`

**Internationalisation:**
- i18next 26.0 - Core i18n engine, configured in `src/lib/i18n.ts`
- react-i18next 17.0 - React bindings
- i18next-browser-languagedetector 8.2 - Auto-detects language from localStorage/navigator
- Locale files: `src/locales/vi.json` (primary), `src/locales/en.json`
- Default language: Vietnamese (`vi`); persisted to `localStorage` key `bep_lang`

**Charts:**
- Recharts 3.8 - Data visualisation; used in `src/components/features/PriceSparkline.tsx`
- Chart defaults defined in `src/lib/chartConfig.ts`

**Icons:**
- Lucide React 1.7 - Icon set; used throughout `src/pages/Dashboard.tsx`

**Build/Dev:**
- Vite 6.0 - Dev server and bundler, config at `vite.config.ts`
- @vitejs/plugin-react 4.3 - React JSX transform plugin

**Testing:**
- Not configured (no jest/vitest config detected)

## Key Dependencies

**Critical:**
- `@supabase/supabase-js` 2.46 - Database, auth, and realtime; sole backend integration; client at `src/lib/supabase.ts`
- `react-router-dom` 6.27 - All navigation; SPA routes defined in `src/App.tsx`
- `react-hook-form` + `zod` - Form validation pattern used on all auth screens

**Infrastructure:**
- `recharts` 3.8 - Required for price trend sparklines in ingredients view

## Configuration

**Environment:**
- Configured via `.env.local` (gitignored); `.env.local.example` documents required vars
- Two required vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- Variables accessed via `import.meta.env.VITE_*` (Vite convention)
- Missing vars throw at startup: see `src/lib/supabase.ts`

**TypeScript:**
- Strict mode enabled (`strict: true`)
- Additional strictness: `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`
- Target: ES2020; module resolution: `bundler`
- Config split: `tsconfig.json` (root) → `tsconfig.app.json` (src) + `tsconfig.node.json` (build tools)

**Build:**
- Output: `dist/` directory (Vite default)
- Build command: `tsc -b && vite build`
- Dev command: `vite`

**Custom Design Tokens:**
- Tailwind extended with `bep.*` color palette in `tailwind.config.js`:
  `lacquer`, `turmeric`, `amber`, `cream`, `rice`, `charcoal`, `stone`, `pebble`, `surface`, `profit`, `loss`, `warning`
- Custom fonts: `font-ui` (Be Vietnam Pro/Inter), `font-brand` (Georgia), `font-mono` (JetBrains Mono)

## Platform Requirements

**Development:**
- Node.js (version not pinned; no `.nvmrc` or `.node-version`)
- Environment file `.env.local` with Supabase credentials

**Production:**
- Static site hosting (Vercel)
- SPA rewrite rule in `vercel.json`: all paths rewrite to `/index.html`

---

*Stack analysis: 2026-04-05*
