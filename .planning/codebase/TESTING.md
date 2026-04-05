# Testing Patterns

**Analysis Date:** 2026-04-05

## Test Framework

**Runner:**
- None installed or configured in the Bep application (`S:/Claude/bep/package.json`)
- No `jest`, `vitest`, `@testing-library/react`, or similar packages in `dependencies` or `devDependencies`
- No test config files present: no `jest.config.*`, `vitest.config.*`, `cypress.config.*`

**Note on test files found:**
- Test files present at `S:/Claude/bep/get-shit-done/sdk/src/*.test.ts` and `S:/Claude/bep/get-shit-done/tests/*.test.cjs` belong to the **GSD tool** — a separate sub-repo located at `S:/Claude/bep/get-shit-done/` with its own git history and package.json. These are NOT part of the Bep application codebase.

**Run Commands:**
```bash
# No test commands defined in package.json scripts
# Available scripts: dev, build, preview only
```

## Test File Organization

**Location:**
- No test files exist in `S:/Claude/bep/src/`

**Naming:**
- Not applicable — no tests present

## Current Testing Reality

The Bep application has **zero automated tests**. The codebase relies entirely on:
- TypeScript strict mode compiler checks (`"strict": true`, `"noUnusedLocals": true`, `"noUnusedParameters": true`)
- Manual QA via `npm run dev` and Vercel preview deployments
- Form validation via Zod schemas at runtime

## What to Test When Adding Tests

### Recommended Framework

Install Vitest (matches Vite build tooling) with React Testing Library:

```bash
npm install -D vitest @vitest/ui jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom
```

Add to `vite.config.ts`:
```typescript
test: {
  environment: 'jsdom',
  globals: true,
  setupFiles: './src/test/setup.ts',
}
```

### High-Priority Test Targets

**Pure utility functions (easiest to test, highest ROI):**
- `src/lib/format.ts` — `formatVND` and `formatVNDShort`
  - Verify VND currency formatting for whole numbers
  - Verify shorthand thresholds (≥1M, ≥1k)

**Business logic (pure functions, no UI):**
- `computeCosts()` in `src/hooks/useRecipes.ts` (currently unexported private function)
  - Verify cost calculation: `quantity × current_price` per line
  - Verify margin calculation: `(selling - cost) / selling × 100`
  - Edge cases: zero selling price (margin = 0), no recipe lines (cost = 0)

**Zod schemas (validation correctness):**
- Ingredient schema in `src/pages/Ingredients.tsx`
- Supplier schema in `src/pages/Suppliers.tsx`
- Menu item schema in `src/pages/Recipes.tsx`

**Custom hooks (with Supabase mocked):**
- `src/hooks/useIngredients.ts` — optimistic add/delete, sort order
- `src/hooks/useSuppliers.ts` — optimistic update
- `src/hooks/useRecipes.ts` — realtime subscription setup/teardown

**Component smoke tests:**
- `src/components/ui/MarginBadge.tsx` — renders correct color class at margin thresholds (≥30, ≥15, <15)
- `src/components/ui/Drawer.tsx` — renders children when open, returns null when closed
- `src/contexts/AuthContext.tsx` — throws when `useAuth` called outside provider

### Suggested Test File Structure

```
src/
├── test/
│   └── setup.ts               # Global test setup (jest-dom matchers)
├── lib/
│   ├── format.ts
│   └── format.test.ts         # Co-located unit tests
├── hooks/
│   ├── useIngredients.ts
│   └── useIngredients.test.ts # Co-located hook tests
└── components/
    └── ui/
        ├── MarginBadge.tsx
        └── MarginBadge.test.tsx
```

## Mocking Approach (When Tests Are Added)

**Supabase client:**
Mock the entire `src/lib/supabase.ts` module:
```typescript
vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    }),
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    },
    channel: vi.fn().mockReturnValue({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn(),
    }),
    removeChannel: vi.fn(),
  },
}))
```

**Auth context:**
Wrap components in a mock `AuthProvider` or mock `useAuth` directly:
```typescript
vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'test-user-id' }, session: {}, loading: false }),
}))
```

**What to Mock:**
- `src/lib/supabase.ts` — always mock for unit tests; never hit real DB
- `src/contexts/AuthContext.tsx` — mock `useAuth` return value for component tests

**What NOT to Mock:**
- `src/lib/format.ts` — pure functions, test directly
- `src/types/index.ts` — types only, nothing to mock
- Zod schemas — test validation logic directly

## Patterns for Hook Testing

Custom hooks use the pattern: `useCallback` fetch + `useEffect` trigger. Test with `renderHook` from React Testing Library:

```typescript
import { renderHook, waitFor } from '@testing-library/react'
import { useIngredients } from './useIngredients'

it('fetches and sets ingredients on mount', async () => {
  // arrange mock supabase to return test data
  const { result } = renderHook(() => useIngredients(), { wrapper: AuthWrapper })
  await waitFor(() => expect(result.current.loading).toBe(false))
  expect(result.current.ingredients).toHaveLength(2)
})
```

## Patterns for Utility Testing

```typescript
import { formatVND, formatVNDShort } from './format'

describe('formatVND', () => {
  it('formats whole VND amounts with currency symbol', () => {
    expect(formatVND(50000)).toBe('50.000 ₫')
  })
})

describe('formatVNDShort', () => {
  it('abbreviates millions', () => {
    expect(formatVNDShort(1_500_000)).toBe('1.5M ₫')
  })
  it('abbreviates thousands', () => {
    expect(formatVNDShort(25_000)).toBe('25k ₫')
  })
})
```

## Coverage

**Requirements:** None enforced (no test runner configured)

**Target when tests are added:**
- Prioritize `src/lib/` utilities: 100%
- Business logic in hooks (`computeCosts`): 100%
- UI components: smoke test coverage at minimum
- Skip: auth flows and pages that require full Supabase integration

---

*Testing analysis: 2026-04-05*
