# Coding Conventions

**Analysis Date:** 2026-04-05

## Naming Patterns

**Files:**
- Page components: PascalCase, no suffix — `src/pages/Ingredients.tsx`, `src/pages/Suppliers.tsx`
- Hook files: camelCase with `use` prefix — `src/hooks/useIngredients.ts`, `src/hooks/useSuppliers.ts`
- Context files: PascalCase with `Context` suffix — `src/contexts/AuthContext.tsx`
- UI components: PascalCase — `src/components/ui/Drawer.tsx`, `src/components/ui/MarginBadge.tsx`
- Feature components: PascalCase — `src/components/features/PriceSparkline.tsx`
- Utility modules: camelCase — `src/lib/format.ts`, `src/lib/supabase.ts`, `src/lib/chartConfig.ts`
- Type definitions: single barrel file — `src/types/index.ts`

**Functions and Hooks:**
- Custom hooks: `use` prefix, camelCase — `useIngredients`, `useAuth`, `useProfile`
- Event handlers on page components: `handle` prefix — `handleSave`, `handleDelete`
- Drawer open/close helpers: `openAdd`, `openEdit`, `closeDrawer`
- Async fetch functions inside hooks: `fetch` prefix — `fetchIngredients`, `fetchRecipes`
- Exported page components: `default export`, PascalCase function — `export default function Recipes()`
- Named exports for reusable components — `export function Drawer(...)`, `export function useIngredients()`

**Variables:**
- camelCase throughout
- Boolean state variables: descriptive past/present tense — `drawerOpen`, `loading`, `saving`
- Iterator variables in JSX: single letter shorthand matching entity — `i` for ingredient, `s` for supplier, `r` for recipe

**Types and Interfaces:**
- Domain types: PascalCase interfaces in `src/types/index.ts` — `Ingredient`, `Supplier`, `MenuItem`
- Relation types: `WithRelations` suffix — `IngredientWithRelations`, `MenuItemWithCost`
- Input/form types: `Input` suffix for hook inputs — `IngredientInput`, `SupplierInput`
- Schema-derived form types: inferred with `z.infer<typeof schema>` — `type FormData = z.infer<typeof schema>`
- Local component types: PascalCase with descriptive suffix — `LineState`, `MenuItemForm`
- Props interfaces: inline inline object type in function parameter, or named `interface XProps`

## Code Style

**Formatting:**
- No Prettier config detected — formatting is applied manually and consistently
- Single quotes for strings in TypeScript/TSX
- Trailing commas in multi-line objects and arrays
- Aligned object values with spaces for visual clarity (especially in zod schemas and defaultValues)
  ```typescript
  const schema = z.object({
    name:          z.string().min(1),
    unit:          z.enum([...]),
    current_price: z.number().min(0),
    supplier_id:   z.string().nullable(),
  })
  ```

**TypeScript:**
- Strict mode enabled: `"strict": true`, `"noUnusedLocals": true`, `"noUnusedParameters": true`
- `type` keyword for derived/computed types, `interface` for domain shape declarations
- Non-null assertions used sparingly when user is guaranteed (`user!.id`)
- Type casts via `as` used after Supabase queries where generic return types need narrowing
- `Pick<T, ...>` used for input types derived from domain types

**Linting:**
- No ESLint config detected — TypeScript compiler strictness serves as primary lint
- No `// @ts-ignore` or `// @ts-expect-error` found in codebase

## Import Organization

**Order (observed consistently):**
1. React core — `import { useState, useEffect } from 'react'`
2. Third-party libraries — router, form, validation, icons
3. Internal contexts — `import { useAuth } from '../contexts/AuthContext'`
4. Internal hooks — `import { useIngredients } from '../hooks/useIngredients'`
5. Internal components — `import { Drawer } from '../components/ui/Drawer'`
6. Internal utilities/lib — `import { formatVND } from '../lib/format'`
7. Types (always `import type`) — `import type { IngredientWithRelations, Unit } from '../types'`

**Path Aliases:**
- None configured — relative paths used throughout (`../hooks/`, `../lib/`, `../types`)

## Error Handling

**Hook CRUD operations:**
- All mutation functions (`add*`, `update*`, `delete*`) return `Promise<boolean>`
- `false` returned on Supabase error; `true` on success
- No error thrown to caller — component checks return value
  ```typescript
  const ok = await addIngredient({ ... })
  if (ok) closeDrawer()
  ```

**Supabase queries:**
- Destructure `{ data, error }` from Supabase calls
- Guard with `if (error || !data) return false`
- Never re-throw Supabase errors to the UI

**Form validation errors:**
- Inline `{errors.fieldName && <p className="text-xs text-bep-loss">{errors.fieldName.message}</p>}`
- Auth-specific errors stored in local `authError` state, displayed inline

**Context guard:**
- `useAuth()` throws if used outside `AuthProvider`:
  ```typescript
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  ```

**Environment validation:**
- Supabase client throws immediately at module load if env vars missing — `src/lib/supabase.ts`

**Window confirm:**
- Delete actions use `window.confirm()` for destructive confirmation — no custom modal

## Logging

**Framework:** None — no logging library used

**Patterns:**
- No `console.log` / `console.error` calls in any source file
- Errors are surfaced via UI state or silently swallowed (hooks return `false` on failure)

## Comments

**When to Comment:**
- Inline comments used sparingly for non-obvious logic
- Supabase realtime subscription purpose documented: `// Realtime: re-calculate when ingredient prices change`
- Business logic steps annotated: `// Record old price to history if price changed`
- JSX section separators: `{/* Recipe builder */}`, `{/* Running totals */}`

**JSDoc/TSDoc:**
- Not used — types provide documentation via TypeScript itself

## Function Design

**Size:**
- Page components are large (100–335 lines) due to co-located form sub-components
- Sub-components extracted as private named functions within the same file — `function IngredientForm(...)`, `function RecipeForm(...)`
- Hooks are medium (30–90 lines) with one concern each

**Parameters:**
- Hooks accept no parameters; they derive context from `useAuth()`
- Component props use inline destructuring with explicit types
- Mutation functions use typed input objects, not positional arguments

**Return Values:**
- Hooks return a plain object: `return { data, loading, mutationFns }`
- CRUD mutations return `Promise<boolean>` — never void
- Pure utility functions return typed values directly

## Component Design

**Page components:**
- Each page is a `default export` at `src/pages/`
- Co-locate private form sub-component in the same file (not a separate file)
- Local UI state (`drawerOpen`, `editing`) lives in the page component
- Data fetching delegated entirely to custom hooks

**Reusable UI components:**
- Placed in `src/components/ui/` — generic, no data fetching
- Placed in `src/components/features/` — domain-specific display, no data fetching
- Exported as named exports, not default exports

**Pattern for CRUD pages:**
```
Page component
  ├── imports hook for data access
  ├── imports Drawer for add/edit UI
  ├── local state: drawerOpen, editing
  ├── openAdd / openEdit / closeDrawer helpers
  ├── handleSave (calls hook mutation, closes drawer on success)
  ├── handleDelete (window.confirm, then calls hook mutation)
  └── JSX: header + list/table + Drawer with Form
```

**Drawer pattern:**
- `Drawer` wraps all add/edit forms (`src/components/ui/Drawer.tsx`)
- `footer` prop accepts JSX (cancel + save buttons)
- Form identified by `id` attribute; save button uses `form` attribute to trigger submit cross-element

## i18n Conventions

**All UI strings use `useTranslation()`:**
- Hook: `const { t } = useTranslation()`
- Keys are namespaced by page/feature: `ingredients.title`, `suppliers.add`, `common.cancel`
- Unit labels via dynamic key: `t(\`units.${i.unit}\`)`
- Locales at `src/locales/vi.json` and `src/locales/en.json`

## Tailwind Conventions

**Design tokens:**
- All colors use custom `bep-*` palette defined in `tailwind.config.js`
- Never use raw Tailwind color classes (e.g., `red-500`) — use semantic tokens
- Semantic token mapping:
  - Primary action: `bg-bep-lacquer hover:bg-bep-turmeric`
  - Destructive hover: `hover:text-bep-loss`
  - Muted text: `text-bep-stone`
  - Primary text: `text-bep-charcoal`
  - Page background: `bg-bep-rice`
  - Card/form background: `bg-bep-surface`
  - Border: `border-bep-pebble`
  - Focus ring: `focus:border-bep-turmeric`

**Font classes:**
- `font-ui` — body and UI text (Be Vietnam Pro)
- `font-mono tabular-nums` — all monetary/numeric values

**Component structure classes:**
- Forms: `flex flex-col gap-4`
- Labels: `text-xs font-medium text-bep-stone uppercase tracking-wider`
- Inputs: `w-full bg-bep-surface border border-bep-pebble rounded-lg px-3 py-2 text-sm ... focus:outline-none focus:border-bep-turmeric transition-colors`

---

*Convention analysis: 2026-04-05*
