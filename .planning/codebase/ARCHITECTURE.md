# Architecture

**Analysis Date:** 2026-04-05

## Pattern Overview

**Overall:** Single-Page Application (SPA) with a feature-hook pattern

**Key Characteristics:**
- Pages own UI and orchestrate hooks; hooks own all data access and mutation logic
- No server-side rendering; all data fetching happens client-side via Supabase JS SDK
- Authentication state is global via React Context; all other state is local to hooks per-page
- Supabase provides auth, database (Postgres with RLS), and realtime subscriptions — no custom backend

## Layers

**Pages:**
- Purpose: Full-screen views rendered by React Router. Compose hooks and UI components. Contain form handling and user interaction logic.
- Location: `src/pages/`
- Contains: Page-level components, inline form sub-components (e.g., `RecipeForm`, `IngredientForm`, `SupplierForm`)
- Depends on: hooks, UI components, feature components, `lib/format`, types
- Used by: `src/App.tsx` routing

**Hooks:**
- Purpose: Encapsulate all Supabase data access, local state management, and CRUD mutation logic for a domain entity
- Location: `src/hooks/`
- Contains: `useIngredients`, `useSuppliers`, `useRecipes`, `useProfile` — each exports state arrays and async mutation functions
- Depends on: `lib/supabase`, `contexts/AuthContext`, types
- Used by: Pages (and some components that need the same data, e.g., `RecipeForm` calls `useIngredients`)

**Contexts:**
- Purpose: Global state that must be available anywhere in the tree
- Location: `src/contexts/`
- Contains: `AuthContext` — provides `session`, `user`, `loading`, `signOut`
- Depends on: `lib/supabase`
- Used by: `ProtectedRoute`, all hooks (to get `user.id`), pages

**UI Components:**
- Purpose: Reusable, dumb presentational components with no data-fetching logic
- Location: `src/components/ui/`
- Contains: `Drawer` (slide-in panel), `MarginBadge` (colour-coded margin display)
- Depends on: Nothing outside itself
- Used by: Pages

**Feature Components:**
- Purpose: Reusable components that encapsulate a specific domain-level rendering concern
- Location: `src/components/features/`
- Contains: `PriceSparkline` (renders Recharts sparkline for ingredient price history)
- Depends on: recharts
- Used by: `src/pages/Ingredients.tsx`

**Library Utilities:**
- Purpose: Pure functions and configuration with no React dependencies
- Location: `src/lib/`
- Contains: `supabase.ts` (Supabase client singleton), `format.ts` (VND currency formatters), `i18n.ts` (i18next setup), `chartConfig.ts` (shared Recharts theme constants)
- Depends on: external packages only
- Used by: All layers above

**Types:**
- Purpose: Shared TypeScript interfaces and type aliases that mirror the Supabase schema
- Location: `src/types/index.ts`
- Contains: `Profile`, `Supplier`, `Ingredient`, `PriceHistoryEntry`, `MenuItem`, `RecipeLineWithIngredient`, `MenuItemWithCost`, `IngredientWithRelations`
- Depends on: Nothing
- Used by: All layers

## Data Flow

**Read (list view):**

1. Page mounts and renders; hook is called (e.g., `useIngredients()`)
2. Hook reads `user` from `useAuth()`; if no user, returns early
3. Hook runs Supabase `.select()` query with joined relations (e.g., `*, suppliers(id, name), ingredient_price_history(...)`)
4. Response is stored in hook's local `useState`; `loading` is set to `false`
5. Page re-renders with data; skeleton loaders are shown while `loading === true`

**Write (add/edit):**

1. User opens `Drawer` component; form (react-hook-form + zod) is rendered
2. User submits form; page calls hook mutation function (e.g., `addIngredient(values)`)
3. Hook calls `supabase.from(...).insert(...)` or `.update(...)`; returns `boolean` success
4. On success: hook updates local state optimistically (insert) or re-fetches (update)
5. Page closes Drawer on success; shows error if `false` is returned

**Realtime (recipe cost recalculation):**

1. `useRecipes` subscribes to `postgres_changes` on `UPDATE` events for the `ingredients` table
2. When an ingredient price changes, `fetchRecipes()` is re-triggered
3. `computeCosts()` recalculates `cost_per_dish` and `gross_margin` for all recipes client-side
4. Recipes state updates and UI reflects new margins without user action

**Authentication flow:**

1. `AuthProvider` calls `supabase.auth.getSession()` on mount; subscribes to `onAuthStateChange`
2. `ProtectedRoute` checks `session` and `profile`; redirects to `/login` or `/onboarding` as needed
3. After login, `Login.tsx` checks for profile existence to route to `/dashboard` vs `/onboarding`
4. Onboarding inserts a `profiles` row keyed to `user.id`; on success navigates to `/dashboard`

**State Management:**
- No global state library (no Redux/Zustand); state lives in hooks via `useState`
- Each hook independently fetches and caches its entity list for the duration of the page mount
- No cross-hook coordination (recipes hook independently subscribes to ingredient changes via realtime)

## Key Abstractions

**Domain Hook:**
- Purpose: One hook per database entity; owns the full CRUD surface for that entity
- Examples: `src/hooks/useIngredients.ts`, `src/hooks/useSuppliers.ts`, `src/hooks/useRecipes.ts`, `src/hooks/useProfile.ts`
- Pattern: `const { data, loading, add, update, delete } = useEntity()` — always includes `loading` boolean, always accepts `user_id` automatically from `useAuth`

**WithRelations / WithCost types:**
- Purpose: Extended types that include joined Supabase relations and computed fields
- Examples: `IngredientWithRelations` (includes `suppliers` and `ingredient_price_history`), `MenuItemWithCost` (includes `recipe_lines` and computed `cost_per_dish`, `gross_margin`)
- Pattern: Defined in `src/types/index.ts` as interfaces that extend base types

**Drawer pattern:**
- Purpose: All add/edit forms are rendered inside `src/components/ui/Drawer.tsx` — a right-side slide-in panel
- Pattern: Page tracks `drawerOpen: boolean` and `editing: Entity | null`; passes both to the Drawer and an inner form component

## Entry Points

**Application Bootstrap:**
- Location: `src/main.tsx`
- Triggers: Browser loads `index.html`; Vite injects script
- Responsibilities: Mounts React root in `StrictMode`; initialises i18n via `import './lib/i18n'`

**Router and Providers:**
- Location: `src/App.tsx`
- Triggers: Called from `main.tsx`
- Responsibilities: Wraps the app in `BrowserRouter` and `AuthProvider`; declares all top-level routes; wraps `/dashboard/*` in `ProtectedRoute`

**Dashboard Shell:**
- Location: `src/pages/Dashboard.tsx`
- Triggers: Matched when user navigates to `/dashboard/*`
- Responsibilities: Renders sidebar navigation with `NavLink`s; hosts nested `Routes` for all authenticated sub-pages; shows `Placeholder` components for unbuilt pages

## Error Handling

**Strategy:** Fail-silent with boolean returns from hooks; no global error boundary

**Patterns:**
- All hook mutation functions return `Promise<boolean>`; callers check `if (ok)` before closing Drawer
- Supabase errors are checked with `if (error)` pattern; logged implicitly by not propagating
- Auth errors surface as local component state (e.g., `setAuthError`) and render inline
- No `try/catch` blocks; error destructuring (`const { error }`) from Supabase responses only
- No toast/notification system; form validation errors use react-hook-form's `errors` object

## Cross-Cutting Concerns

**Localisation:** i18next configured in `src/lib/i18n.ts`; `vi` is default, `en` supported; language stored in `localStorage` under key `bep_lang`; all user-visible strings use `t('key')` via `useTranslation()`

**Validation:** Zod schemas defined at the top of each page file; passed to react-hook-form via `zodResolver`; one schema per form

**Authentication:** Supabase Auth; email+password and Google OAuth supported; session managed globally in `AuthContext`; RLS on Supabase ensures users can only access their own rows (enforced DB-side, not in frontend code)

**Currency Formatting:** All monetary values are VND integers; formatted via `formatVND` or `formatVNDShort` from `src/lib/format.ts`

---

*Architecture analysis: 2026-04-05*
