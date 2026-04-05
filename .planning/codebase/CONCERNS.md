# Codebase Concerns

**Analysis Date:** 2026-04-05

## Tech Debt

**Recipe form bypasses react-hook-form for submission:**
- Issue: `Recipes.tsx` mixes two form state systems. `RecipeForm` registers fields with `react-hook-form` but the parent's `handleSave` reads values via `document.getElementById('recipe-form')` and `new FormData(form)` — raw DOM access. Validation (zod/RHF) is never triggered on save.
- Files: `src/pages/Recipes.tsx` (lines 205–222), `src/pages/Recipes.tsx` RecipeForm component
- Impact: Zod schema for `menuItemSchema` is effectively decorative — invalid inputs (e.g. empty name, 0 selling price) pass through as long as the JS guard `if (!name || !selling_price)` fires. Silent data corruption is possible. The RHF `formState.errors` are never surfaced to the user on save attempt.
- Fix approach: Lift the `useForm` instance to the parent `Recipes` component via `useFormContext`, or pass a `ref` / callback from `RecipeForm` back to the parent to trigger `handleSubmit` properly.

**Ingredient form has a hidden submit button acting as a bridge:**
- Issue: `Ingredients.tsx` and `Suppliers.tsx` place a `<button type="submit" className="hidden" />` inside the form, then the Drawer footer contains a separate `<button type="submit" form="ingredient-form">` that cross-references by form id. This is functional but fragile — relies on the `form` attribute HTML feature and is non-obvious.
- Files: `src/pages/Ingredients.tsx` (line 106), `src/pages/Suppliers.tsx` (line 84)
- Impact: Works today, but if multiple drawers are ever open simultaneously (not currently possible) or if form IDs collide (all use generic names like `ingredient-form`, `supplier-form`), submission silently targets the wrong form.
- Fix approach: Lift form submit callback refs or use a shared Drawer pattern that accepts an `onSubmit` prop and handles the trigger internally.

**Error handling silently swallows Supabase errors:**
- Issue: All hooks return `boolean` (true/false) from mutating operations. The actual Supabase `error` object is discarded after logging nothing. The UI receives only `false` with no error message to show the user.
- Files: `src/hooks/useIngredients.ts`, `src/hooks/useRecipes.ts`, `src/hooks/useSuppliers.ts`
- Impact: If a write fails (network error, RLS violation, constraint violation), the user sees nothing — the drawer stays open but no feedback is given. This is especially problematic for delete operations which don't even close the drawer on failure.
- Fix approach: Return `{ ok: boolean; error?: string }` from each mutation or use a toast/notification system to surface Supabase error messages.

**Price history records old price, not new price on update:**
- Issue: In `useIngredients.ts` `updateIngredient`, when the price changes, the *current* (old) price is inserted into `ingredient_price_history`. This means the history table stores previous values — the historical record never includes the final current price until another update occurs.
- Files: `src/hooks/useIngredients.ts` (lines 44–49)
- Impact: A sparkline for an ingredient that has been updated once will show only the price before the last change, never the current price. The `PriceSparkline` requires `history.length >= 2` to render, so a single-update ingredient always shows `—`.
- Fix approach: Insert the *new* price into history after a successful update (or insert both old and new), so the history always reflects the full timeline including the current value.

**Recipe form `lines` state lives in parent, not inside form component:**
- Issue: `LineState[]` is managed in `Recipes` (parent) and passed down into `RecipeForm` as props. This creates a split: RHF controls the text/price fields, plain `useState` controls the ingredient lines. The two systems are never reconciled or co-validated.
- Files: `src/pages/Recipes.tsx` (lines 22–26, 185–186, 326)
- Impact: No way to include line validation inside RHF's validation cycle. Adding cross-field validation (e.g. "selling price must exceed total cost") is difficult.
- Fix approach: Use RHF `useFieldArray` for recipe lines, which integrates them into the same form instance.

**`useRecipes` realtime subscription uses a static channel name:**
- Issue: `supabase.channel('ingredient-price-watch')` uses a hardcoded channel name in `useRecipes.ts`. If multiple browser tabs are open simultaneously, Supabase will receive conflicting subscriptions on the same channel identifier.
- Files: `src/hooks/useRecipes.ts` (line 47)
- Impact: Multiple tabs cause duplicate re-fetches or missed updates depending on Supabase channel deduplication behavior.
- Fix approach: Append user ID to channel name: `ingredient-price-watch-${user.id}`.

## Known Bugs

**Google OAuth login always redirects to `/dashboard`, bypassing onboarding check:**
- Symptoms: New Google sign-ups are redirected directly to `/dashboard` via `redirectTo` option. `ProtectedRoute` will then immediately redirect them to `/onboarding` (because no profile exists), but this two-step redirect is visually jarring and adds a blank render flash.
- Files: `src/pages/Login.tsx` (lines 44–49)
- Trigger: First-time Google OAuth sign-up
- Workaround: `ProtectedRoute` recovers the session by redirecting to `/onboarding`, so the user lands correctly. The flash is a UX issue, not a functional bug.

**Login page profile check omits `user_id` filter:**
- Symptoms: `supabase.from('profiles').select('id').single()` on line 40 of `Login.tsx` has no `.eq('id', user.id)` filter. It fetches any single profile row the anon key can access.
- Files: `src/pages/Login.tsx` (line 40)
- Trigger: Any login attempt
- Workaround: Supabase RLS (if configured with `auth.uid()` policies) will naturally filter to the current user's row, masking the bug. However if RLS is misconfigured or absent on `profiles`, this could return another user's profile record and send the user to `/dashboard` even if their own profile doesn't exist.

**`addLine` in recipe builder silently does nothing when all ingredients are already added:**
- Symptoms: The "+ Add ingredient" button is not disabled when `ingredients.length > 0` but all ingredients are already in `lines`. `addLine` calls `ingredients.find(i => !lines.some(...))` which returns `undefined`, so nothing is appended.
- Files: `src/pages/Recipes.tsx` (lines 47–50)
- Trigger: User adds all available ingredients to a recipe and tries to add another line
- Workaround: None visible — button stays enabled and appears unresponsive.

## Security Considerations

**No RLS verification in client code:**
- Risk: All hooks call Supabase without asserting `user_id` in queries (relying entirely on RLS). If RLS is accidentally disabled on any table, any authenticated user can read or mutate other users' data. There is no client-side ownership check anywhere.
- Files: `src/hooks/useIngredients.ts`, `src/hooks/useRecipes.ts`, `src/hooks/useSuppliers.ts`, `src/hooks/useProfile.ts`
- Current mitigation: Supabase RLS policies on the database side
- Recommendations: Add at minimum a runtime assertion or document which tables have RLS enabled. Consider adding `.eq('user_id', user.id)` to all reads as a defense-in-depth measure.

**Non-null assertion `user!.id` used in mutations:**
- Risk: `user!.id` appears in `addIngredient`, `addSupplier`, and `saveRecipe`. If `user` is somehow null at call time (e.g. session expiry between mount and save), this throws an uncaught TypeError.
- Files: `src/hooks/useIngredients.ts` (line 33), `src/hooks/useSuppliers.ts` (line 25), `src/hooks/useRecipes.ts` (line 69)
- Current mitigation: `ProtectedRoute` blocks unauthenticated renders; hooks check `if (!user) return` in fetch. Session expiry mid-session is not guarded.
- Recommendations: Replace `user!.id` with early-return guards and return `false` / show an error.

**No CSRF protection on Supabase client:**
- Risk: The anon key is exposed in `VITE_SUPABASE_ANON_KEY` (client-side, as intended for Supabase). This is expected behavior for Supabase, but the key is visible in built JS bundles.
- Files: `src/lib/supabase.ts`
- Current mitigation: Supabase anon key is designed to be public; RLS provides the authorization layer
- Recommendations: Ensure RLS is enabled and verified on all tables before production launch.

## Performance Bottlenecks

**`useIngredients` fetches full price history for all ingredients on every mount:**
- Problem: Every ingredient row fetches its full `ingredient_price_history` regardless of how many entries exist. With many ingredients and long price histories this query grows unboundedly.
- Files: `src/hooks/useIngredients.ts` (line 21)
- Cause: `ingredient_price_history(price, recorded_at)` is an unbounded nested select
- Improvement path: Limit history in the query with `ingredient_price_history(price, recorded_at).order(recorded_at, { ascending: false }).limit(10)` — the sparkline already slices to 10 anyway.

**`updateIngredient` always re-fetches all ingredients after save:**
- Problem: After any ingredient update, `fetchIngredients()` is called which re-fetches the entire list including all history. `addIngredient` uses optimistic update; `updateIngredient` does not.
- Files: `src/hooks/useIngredients.ts` (line 58)
- Cause: Price history needs refreshing after an update, but entire list is refetched
- Improvement path: After `updateIngredient`, optimistically update the ingredient in state and append the new history entry locally rather than re-fetching all data.

**`computeCosts` runs on every render in `useRecipes`:**
- Problem: `computeCosts` is called inside `fetchRecipes` which runs on mount and on every realtime ingredient update. This is fine for small datasets. No memoization exists.
- Files: `src/hooks/useRecipes.ts` (lines 17–25, 38)
- Cause: `setRecipes(computeCosts(...))` — pure calculation, low risk now but worth noting
- Improvement path: `useMemo` in consuming component if recipe lists grow large.

## Fragile Areas

**Recipes grid is hardcoded to 3 columns with no responsive breakpoints:**
- Files: `src/pages/Recipes.tsx` (line 242, line 262)
- Why fragile: `grid-cols-3` with no `sm:` / `md:` responsive variants. On screens narrower than ~900px (tablets, mobile), recipe cards overflow or compress unreadably. The app has no mobile layout at all.
- Safe modification: Add `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` before any mobile work begins.
- Test coverage: None.

**`ProtectedRoute` renders `null` during loading — no loading state shown:**
- Files: `src/components/ProtectedRoute.tsx` (line 10)
- Why fragile: `if (authLoading || profileLoading) return null` causes a blank white screen on every page load while auth resolves. On slow connections this is a noticeable flash.
- Safe modification: Replace `null` with a skeleton/spinner component.
- Test coverage: None.

**Drawer uses hardcoded fixed width of `w-[480px]`:**
- Files: `src/components/ui/Drawer.tsx` (line 24)
- Why fragile: On screens narrower than 480px the drawer overflows the viewport. No overflow handling or responsive sizing exists.
- Safe modification: Use `w-full sm:w-[480px]` with appropriate mobile handling.
- Test coverage: None.

**Landing page is a placeholder:**
- Files: `src/pages/Landing.tsx`
- Why fragile: Returns `<div>Landing — placeholder</div>`. The public-facing entry point to the product is entirely unimplemented. Any user navigating to `/` sees raw placeholder text.
- Safe modification: Implement as a distinct phase; ensure the route is not accidentally indexed by search engines in the meantime.
- Test coverage: None.

## Scaling Limits

**Single Supabase realtime channel for ingredient price updates:**
- Current capacity: One realtime channel per `useRecipes` instance, listening to all `UPDATE` events on the `ingredients` table
- Limit: If recipes page is open in many tabs or users grow significantly, the channel listener fires `fetchRecipes` (a full round-trip) on every single ingredient update by any user (RLS filters on read, but the channel event still fires the callback)
- Scaling path: Use Supabase's filtered realtime (`filter: 'user_id=eq.{user.id}'`) to subscribe only to the current user's ingredient changes.

## Dependencies at Risk

**`lucide-react` at `^1.7.0`:**
- Risk: Version `1.x` is a major version jump from the stable `0.x` series. Icon API and tree-shaking behavior may differ. The caret range means any `1.x` patch could introduce breaking changes if the maintainers publish a `1.x` with icon renames (which has happened historically in lucide).
- Impact: Build breakage or missing icons in production
- Migration plan: Pin to a specific version or constrain to `~1.7.0` until the 1.x API stabilizes.

**`i18next` at `^26.0.3` with `react-i18next` at `^17.0.2`:**
- Risk: Both libraries are at very recent major versions (26 and 17). The `^` range allows automatic minor/patch upgrades that could include breaking changes in namespace handling or hook signatures between major i18next releases.
- Impact: Translation loading failures or hook breakage
- Migration plan: Lock both to `~` (tilde) ranges to prevent automatic minor upgrades.

## Missing Critical Features

**No error boundary anywhere in the component tree:**
- Problem: Any unhandled throw in a component (e.g. the `user!.id` non-null assertions, failed Supabase responses treated as valid data) will unmount the entire React tree with a white screen.
- Blocks: Production reliability
- Recommended fix: Add a top-level `ErrorBoundary` component wrapping `<App>` or at the Dashboard layout level.

**No test coverage:**
- Problem: Zero test files exist in the project. No unit, integration, or e2e tests.
- Blocks: Safe refactoring of hooks (especially `useRecipes` cost computation), confident form validation changes, and regression detection
- Priority: High for `computeCosts` in `src/hooks/useRecipes.ts` and the price-history recording logic in `src/hooks/useIngredients.ts` — both contain business-critical calculations.

**No loading/error state for failed data fetches:**
- Problem: All hooks set `loading = false` regardless of whether the fetch succeeded or returned an error. A network failure on mount leaves the user looking at an empty state (e.g. empty ingredients table) that is indistinguishable from genuinely having no data.
- Files: `src/hooks/useIngredients.ts` (line 24), `src/hooks/useSuppliers.ts` (line 17), `src/hooks/useRecipes.ts` (line 39)
- Blocks: User trust and debuggability in production

## Test Coverage Gaps

**Cost computation logic (`computeCosts`):**
- What's not tested: The margin calculation `((selling - cost) / selling) * 100` and edge cases (selling price = 0, no recipe lines, null ingredient prices)
- Files: `src/hooks/useRecipes.ts` (lines 17–25)
- Risk: Silent incorrect margin percentages displayed to users making pricing decisions
- Priority: High

**Price history recording in `updateIngredient`:**
- What's not tested: Whether price history is correctly written when price changes, and not written when price stays the same
- Files: `src/hooks/useIngredients.ts` (lines 44–49)
- Risk: Silent data loss or duplicate history entries
- Priority: High

**Auth flow redirects:**
- What's not tested: That new Google OAuth users reach onboarding; that users with profiles reach dashboard; that unauthenticated users are blocked
- Files: `src/components/ProtectedRoute.tsx`, `src/pages/Login.tsx`
- Risk: Auth regression when auth flow changes
- Priority: Medium

---

*Concerns audit: 2026-04-05*
