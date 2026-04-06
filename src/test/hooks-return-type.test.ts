/**
 * Tests: All four hooks return { ok: boolean; error?: string } from every mutation.
 * Validates D-04 (return type migration).
 *
 * Strategy: Use renderHook once to get stable function references, then call
 * the mutation functions directly as plain async fns (no further act() needed).
 * This avoids the infinite re-render / OOM issue caused by mockImplementation
 * overrides triggering React's act() flush loop.
 */
import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'

// ---- Shared mutable state ----
const state = {
  returnError: null as { message: string } | null,
  returnNullData: false,
}

// A single comprehensive chain that satisfies all hook call patterns
function makeChain() {
  return {
    select: vi.fn().mockReturnThis(),
    order: vi.fn(() => Promise.resolve({ data: [], error: null })),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn(() =>
      Promise.resolve({ error: state.returnError })
    ),
    single: vi.fn(() =>
      Promise.resolve({
        data: state.returnNullData ? null : { id: 'x', name: 'X', suppliers: null, ingredient_price_history: [] },
        error: state.returnError,
      })
    ),
  }
}

const mockChannel = { on: vi.fn().mockReturnThis(), subscribe: vi.fn().mockReturnThis() }

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => makeChain()),
    channel: vi.fn(() => mockChannel),
    removeChannel: vi.fn(),
  },
}))

const STABLE_USER = { id: 'test-user-id' }
vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ user: STABLE_USER }),
}))

// Helper: get a hook's functions without waiting for async effects to settle
async function getHook<T>(importFn: () => Promise<{ [key: string]: () => T }>, hookName: string) {
  const mod = await importFn()
  const hookFn = mod[hookName] as () => T
  const { result } = renderHook(() => hookFn())
  await act(async () => {})
  return result.current
}

// ---- useIngredients ----

describe('useIngredients return types', () => {
  it('addIngredient returns { ok: boolean } shape', async () => {
    const { useIngredients } = await import('../hooks/useIngredients')
    const { result } = renderHook(() => useIngredients())
    await act(async () => {})
    state.returnError = null
    state.returnNullData = false

    const res = await result.current.addIngredient({
      name: 'Sugar', unit: 'kg', current_price: 10000, supplier_id: null,
    })

    expect(res).toHaveProperty('ok')
    expect(typeof res.ok).toBe('boolean')
  })

  it('addIngredient returns { ok: false, error } on supabase error', async () => {
    state.returnError = { message: 'DB error' }
    state.returnNullData = true

    const { useIngredients } = await import('../hooks/useIngredients')
    const { result } = renderHook(() => useIngredients())
    await act(async () => {})

    const res = await result.current.addIngredient({
      name: 'Sugar', unit: 'kg', current_price: 10000, supplier_id: null,
    })

    expect(res.ok).toBe(false)
    expect(typeof res.error).toBe('string')

    // Reset for subsequent tests
    state.returnError = null
    state.returnNullData = false
  })

  it('updateIngredient returns { ok: boolean } shape', async () => {
    state.returnError = null
    const { useIngredients } = await import('../hooks/useIngredients')
    const { result } = renderHook(() => useIngredients())
    await act(async () => {})

    const res = await result.current.updateIngredient('some-id', {
      name: 'Sugar', unit: 'kg', current_price: 10000, supplier_id: null,
    })

    expect(res).toHaveProperty('ok')
    expect(typeof res.ok).toBe('boolean')
  })

  it('deleteIngredient returns { ok: boolean } shape', async () => {
    state.returnError = null
    const { useIngredients } = await import('../hooks/useIngredients')
    const { result } = renderHook(() => useIngredients())
    await act(async () => {})

    const res = await result.current.deleteIngredient('some-id')

    expect(res).toHaveProperty('ok')
    expect(typeof res.ok).toBe('boolean')
  })
})

// ---- useRecipes ----

describe('useRecipes return types', () => {
  it('saveRecipe returns { ok: boolean } shape', async () => {
    state.returnError = null
    state.returnNullData = false
    const { useRecipes } = await import('../hooks/useRecipes')
    const { result } = renderHook(() => useRecipes())
    await act(async () => {})

    const res = await result.current.saveRecipe(
      { name: 'Pho', selling_price: 50000, category: null },
      [{ ingredient_id: 'ing-1', quantity: 0.1 }],
    )

    expect(res).toHaveProperty('ok')
    expect(typeof res.ok).toBe('boolean')
  })

  it('deleteRecipe returns { ok: boolean } shape', async () => {
    state.returnError = null
    const { useRecipes } = await import('../hooks/useRecipes')
    const { result } = renderHook(() => useRecipes())
    await act(async () => {})

    const res = await result.current.deleteRecipe('some-id')

    expect(res).toHaveProperty('ok')
    expect(typeof res.ok).toBe('boolean')
  })

  it('saveRecipe returns { ok: false, error } on supabase error', async () => {
    state.returnError = { message: 'Insert failed' }
    state.returnNullData = true
    const { useRecipes } = await import('../hooks/useRecipes')
    const { result } = renderHook(() => useRecipes())
    await act(async () => {})

    const res = await result.current.saveRecipe(
      { name: 'Pho', selling_price: 50000, category: null },
      [],
    )

    expect(res.ok).toBe(false)
    expect(typeof res.error).toBe('string')

    state.returnError = null
    state.returnNullData = false
  })
})

// ---- useSuppliers ----

describe('useSuppliers return types', () => {
  it('addSupplier returns { ok: boolean } shape', async () => {
    state.returnError = null
    state.returnNullData = false
    const { useSuppliers } = await import('../hooks/useSuppliers')
    const { result } = renderHook(() => useSuppliers())
    await act(async () => {})

    const res = await result.current.addSupplier({ name: 'Supplier A', phone: null, notes: null })

    expect(res).toHaveProperty('ok')
    expect(typeof res.ok).toBe('boolean')
  })

  it('addSupplier returns { ok: false, error } on supabase error', async () => {
    state.returnError = { message: 'Conflict' }
    state.returnNullData = true
    const { useSuppliers } = await import('../hooks/useSuppliers')
    const { result } = renderHook(() => useSuppliers())
    await act(async () => {})

    const res = await result.current.addSupplier({ name: 'Supplier A', phone: null, notes: null })

    expect(res.ok).toBe(false)
    expect(typeof res.error).toBe('string')

    state.returnError = null
    state.returnNullData = false
  })
})

// ---- useInvoices ----

describe('useInvoices return types', () => {
  it('confirmInvoice returns { ok: boolean } shape', async () => {
    state.returnError = null
    const { useInvoices } = await import('../hooks/useInvoices')
    const { result } = renderHook(() => useInvoices())
    await act(async () => {})

    const res = await result.current.confirmInvoice('inv-1', 'sup-1', '2026-01-01', [], 100000)

    expect(res).toHaveProperty('ok')
    expect(typeof res.ok).toBe('boolean')
  })

  it('deleteInvoice returns { ok: boolean } shape', async () => {
    state.returnError = null
    const { useInvoices } = await import('../hooks/useInvoices')
    const { result } = renderHook(() => useInvoices())
    await act(async () => {})

    const res = await result.current.deleteInvoice('inv-1')

    expect(res).toHaveProperty('ok')
    expect(typeof res.ok).toBe('boolean')
  })

  it('confirmInvoice returns { ok: false, error } on linesError', async () => {
    state.returnError = { message: 'lines insert failed' }
    const { useInvoices } = await import('../hooks/useInvoices')
    const { result } = renderHook(() => useInvoices())
    await act(async () => {})

    const res = await result.current.confirmInvoice('inv-1', 'sup-1', '2026-01-01', [], 100000)

    expect(res.ok).toBe(false)
    expect(typeof res.error).toBe('string')

    state.returnError = null
  })
})
