# Codebase Structure

**Analysis Date:** 2026-04-05

## Directory Layout

```
bep/
├── src/
│   ├── main.tsx                        # App bootstrap, React root mount
│   ├── App.tsx                         # BrowserRouter, AuthProvider, top-level routes
│   ├── index.css                       # Tailwind base imports
│   ├── vite-env.d.ts                   # Vite type declarations
│   ├── pages/
│   │   ├── Landing.tsx                 # Public marketing/home page
│   │   ├── Login.tsx                   # Email+password and Google OAuth login
│   │   ├── Signup.tsx                  # New user registration
│   │   ├── Onboarding.tsx              # 4-step profile creation wizard
│   │   ├── Dashboard.tsx               # Authenticated shell with sidebar + nested routes
│   │   ├── Suppliers.tsx               # Supplier list + CRUD
│   │   ├── Ingredients.tsx             # Ingredient list + CRUD + price history sparkline
│   │   └── Recipes.tsx                 # Recipe/menu item list + CRUD + costing
│   ├── hooks/
│   │   ├── useProfile.ts               # Profile fetch for current user
│   │   ├── useSuppliers.ts             # Supplier CRUD + local state
│   │   ├── useIngredients.ts           # Ingredient CRUD + price history recording
│   │   └── useRecipes.ts               # Recipe CRUD + realtime cost recalculation
│   ├── contexts/
│   │   └── AuthContext.tsx             # Global session/user state + signOut
│   ├── components/
│   │   ├── ProtectedRoute.tsx          # Auth + profile guard; redirects to /login or /onboarding
│   │   ├── GoogleIcon.tsx              # SVG icon component for Google OAuth button
│   │   ├── ui/
│   │   │   ├── Drawer.tsx              # Right-slide panel for add/edit forms
│   │   │   └── MarginBadge.tsx         # Colour-coded gross margin pill
│   │   └── features/
│   │       └── PriceSparkline.tsx      # Recharts sparkline for ingredient price history
│   ├── lib/
│   │   ├── supabase.ts                 # Supabase client singleton
│   │   ├── i18n.ts                     # i18next config (vi default, en supported)
│   │   ├── format.ts                   # VND currency formatters (formatVND, formatVNDShort)
│   │   └── chartConfig.ts              # Shared Recharts colour palette and axis defaults
│   ├── locales/
│   │   ├── vi.json                     # Vietnamese translation strings
│   │   └── en.json                     # English translation strings
│   └── types/
│       └── index.ts                    # All shared TypeScript interfaces and type aliases
├── index.html                          # Vite HTML entry; mounts #root
├── vite.config.ts                      # Vite config (React plugin only)
├── tailwind.config.js                  # Tailwind theme with bep-* custom colour tokens
├── postcss.config.js                   # PostCSS (Tailwind + Autoprefixer)
├── tsconfig.json                       # TypeScript project references
├── tsconfig.app.json                   # App-level TypeScript config
├── tsconfig.node.json                  # Node-level TypeScript config (Vite scripts)
├── vercel.json                         # Vercel SPA rewrite (all routes → index.html)
├── package.json                        # Dependencies and scripts
├── dist/                               # Built output (not committed)
└── .planning/
    └── codebase/                       # GSD analysis documents
```

## Directory Purposes

**`src/pages/`:**
- Purpose: One file per route; full-screen views that compose hooks and components
- Contains: Page components with all route-specific UI logic; inline form sub-components (e.g., `RecipeForm` lives inside `Recipes.tsx`)
- Key files: `Dashboard.tsx` (authenticated shell), `Recipes.tsx` (most complex page — recipe costing)

**`src/hooks/`:**
- Purpose: All Supabase data access and entity mutation logic; the data layer for the frontend
- Contains: Custom hooks returning `{ data[], loading, add, update, delete }` per entity
- Key files: `useRecipes.ts` (includes realtime subscription and `computeCosts` helper), `useIngredients.ts` (handles price history recording on update)

**`src/contexts/`:**
- Purpose: React Context providers for global state that must span the full component tree
- Contains: `AuthContext.tsx` only — session management via Supabase `onAuthStateChange`

**`src/components/ui/`:**
- Purpose: Generic, reusable UI primitives with no domain knowledge or data fetching
- Contains: `Drawer.tsx` (form panel), `MarginBadge.tsx` (margin colouring)

**`src/components/features/`:**
- Purpose: Domain-aware reusable components that encapsulate a specific display concern
- Contains: `PriceSparkline.tsx` (only feature component currently)

**`src/lib/`:**
- Purpose: Non-React utilities and singletons; pure functions and config
- Contains: Supabase client, i18n init, currency formatters, chart colour config

**`src/locales/`:**
- Purpose: i18n translation files; flat JSON key-value structure
- Contains: `vi.json` (primary), `en.json`

**`src/types/`:**
- Purpose: Single source of truth for all TypeScript types shared across the app
- Contains: `index.ts` — all interfaces exported from one file; mirrors Supabase schema

## Key File Locations

**Entry Points:**
- `src/main.tsx`: React DOM root mount; imports i18n initialisation
- `src/App.tsx`: Top-level router and provider tree; all route declarations

**Configuration:**
- `tailwind.config.js`: All custom `bep-*` colour tokens (bep-lacquer, bep-turmeric, bep-stone, etc.)
- `src/lib/supabase.ts`: Supabase client — reads `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- `src/lib/i18n.ts`: i18next setup — language detection, fallback to `vi`, `localStorage` caching
- `vercel.json`: SPA rewrite rule so direct URL navigation works on Vercel

**Core Logic:**
- `src/hooks/useRecipes.ts`: `computeCosts()` function — core recipe costing engine
- `src/hooks/useIngredients.ts`: Price history recording logic (writes to `ingredient_price_history` on price change)
- `src/types/index.ts`: All domain types including computed types (`MenuItemWithCost`, `IngredientWithRelations`)

**Auth Guard:**
- `src/components/ProtectedRoute.tsx`: Checks both `session` AND `profile`; redirects unauthenticated users to `/login`, authenticated users without profile to `/onboarding`

## Naming Conventions

**Files:**
- Pages: PascalCase, noun-based: `Ingredients.tsx`, `Suppliers.tsx`, `Dashboard.tsx`
- Hooks: camelCase with `use` prefix: `useIngredients.ts`, `useRecipes.ts`
- Components: PascalCase, descriptive: `ProtectedRoute.tsx`, `MarginBadge.tsx`, `PriceSparkline.tsx`
- Lib utilities: camelCase: `format.ts`, `supabase.ts`, `i18n.ts`, `chartConfig.ts`
- Locales: lowercase language code: `vi.json`, `en.json`
- Types: `index.ts` — single barrel file

**Directories:**
- Feature groupings use lowercase plurals: `pages/`, `hooks/`, `contexts/`, `components/`, `lib/`, `locales/`, `types/`
- Component sub-groupings use lowercase: `ui/`, `features/`

**TypeScript:**
- Interfaces: PascalCase — `Profile`, `Supplier`, `MenuItemWithCost`
- Type aliases: PascalCase — `OutletType`, `LanguagePref`, `Unit`
- Zod schemas: camelCase `schema` or descriptive `menuItemSchema`
- Inferred form types: PascalCase `FormData`, `MenuItemForm`

## Where to Add New Code

**New authenticated page (e.g., Invoices):**
- Implementation: `src/pages/Invoices.tsx`
- Register route: Add `<Route path="invoices" element={<Invoices />} />` in `src/pages/Dashboard.tsx`
- Nav item: Add entry to `navItems` array in `src/pages/Dashboard.tsx`

**New data entity with CRUD:**
- Hook: `src/hooks/useEntityName.ts` — follow the pattern in `useSuppliers.ts` (simplest example)
- Types: Add interface to `src/types/index.ts`
- Page: `src/pages/EntityName.tsx` — follow Suppliers or Ingredients pattern

**New reusable UI primitive:**
- File: `src/components/ui/ComponentName.tsx`

**New domain-specific display component:**
- File: `src/components/features/ComponentName.tsx`

**New utility function:**
- Add to `src/lib/format.ts` (formatting) or create `src/lib/newUtil.ts` for distinct concerns

**New translation strings:**
- Add keys to both `src/locales/vi.json` and `src/locales/en.json`

**New Tailwind colour token:**
- Add to `theme.extend.colors` in `tailwind.config.js` under the `bep-` namespace

## Special Directories

**`dist/`:**
- Purpose: Vite build output
- Generated: Yes (by `npm run build`)
- Committed: No (in `.gitignore`)

**`.planning/codebase/`:**
- Purpose: GSD architecture and convention analysis documents
- Generated: By GSD mapping agents
- Committed: Yes

**`get-shit-done/`:**
- Purpose: GSD tooling (separate sub-repo); not part of the Bep application
- Generated: No
- Committed: No (in `.gitignore`)

---

*Structure analysis: 2026-04-05*
