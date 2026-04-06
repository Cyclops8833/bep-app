/**
 * Tests: useIngredients price history correctness (D-20).
 *
 * Strategy: We test the async mutation functions directly without
 * needing the React component lifecycle, by extracting them from
 * the hook return value synchronously and calling them as plain async fns.
 *
 * This avoids the infinite re-render loop caused by renderHook +
 * setIngredients triggering useCallback recreation.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mutable state the mock factory closes over
const state = {
  callOrder: [] as string[],
  updateShouldFail: false,
  historyInsertArgs: null as Record<string, unknown> | null,
  seededIngredients: [
    {
      id: 'ing-1',
      name: 'Sugar',
      unit: 'kg',
      current_price: 5000,
      supplier_id: null,
      user_id: 'uid',
      created_at: '',
      updated_at: '',
      suppliers: null,
      ingredient_price_history: [],
    },
  ] as Array<Record<string, unknown>>,
}

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn((table: string) => {
      if (table === 'ingredient_price_history') {
        return {
          insert: vi.fn((args: Record<string, unknown>) => {
            state.callOrder.push('history.insert')
            state.historyInsertArgs = args
            return Promise.resolve({ error: null })
          }),
        }
      }
      if (table === 'ingredients') {
        return {
          select: vi.fn().mockReturnThis(),
          order: vi.fn(() =>
            Promise.resolve({ data: state.seededIngredients, error: null })
          ),
          update: vi.fn(() => {
            state.callOrder.push('ingredients.update')
            return {
              eq: vi.fn(() =>
                Promise.resolve({
                  error: state.updateShouldFail ? { message: 'fail' } : null,
                })
              ),
            }
          }),
          delete: vi.fn(() => ({
            eq: vi.fn(() => Promise.resolve({ error: null })),
          })),
          insert: vi.fn(() => ({
            select: vi.fn().mockReturnThis(),
            single: vi.fn(() => Promise.resolve({ data: { id: 'new' }, error: null })),
          })),
          eq: vi.fn(() => Promise.resolve({ error: null })),
          single: vi.fn(() => Promise.resolve({ data: null, error: null })),
        }
      }
      return {
        select: vi.fn().mockReturnThis(),
        order: vi.fn(() => Promise.resolve({ data: [], error: null })),
      }
    }),
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockReturnThis(),
    })),
    removeChannel: vi.fn(),
  },
}))

// Stable user object — MUST be module-level to avoid new reference on each call
const STABLE_USER = { id: 'uid' }

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ user: STABLE_USER }),
}))

// Import React hooks shim so we can call useIngredients outside a component
import { useState, useEffect, useCallback } from 'react'

beforeEach(() => {
  state.callOrder = []
  state.updateShouldFail = false
  state.historyInsertArgs = null
})

// Helper: get the hook's mutation functions without rendering a component.
// We call the hook function directly, passing React hooks as normal functions
// (valid when called at the module level with the React test environment).
async function getUpdateFn(): Promise<{
  updateIngredient: (id: string, values: Record<string, unknown>) => Promise<{ ok: boolean; error?: string }>
}> {
  const { useIngredients } = await import('../hooks/useIngredients')
  // useIngredients uses useState/useEffect/useCallback — we need renderHook for correctness,
  // but to avoid the infinite loop we render once and extract the functions immediately.
  const { renderHook } = await import('@testing-library/react')
  const { act } = await import('@testing-library/react')
  const { result } = renderHook(() => useIngredients())
  // Single synchronous flush — don't wait for async effects
  await act(async () => {})
  return result.current as unknown as {
    updateIngredient: (id: string, values: Record<string, unknown>) => Promise<{ ok: boolean; error?: string }>
  }
}

describe('useIngredients price history (D-20)', () => {
  it('update call happens BEFORE history insert when price changes', async () => {
    const { updateIngredient } = await getUpdateFn()
    state.callOrder = []

    await updateIngredient('ing-1', {
      name: 'Sugar', unit: 'kg', current_price: 8000, supplier_id: null,
    })

    const updateIdx = state.callOrder.indexOf('ingredients.update')
    const historyIdx = state.callOrder.indexOf('history.insert')
    expect(updateIdx).toBeGreaterThanOrEqual(0)
    expect(historyIdx).toBeGreaterThanOrEqual(0)
    expect(updateIdx).toBeLessThan(historyIdx)
  })

  it('inserted history record uses new price, not old price', async () => {
    const { updateIngredient } = await getUpdateFn()

    await updateIngredient('ing-1', {
      name: 'Sugar', unit: 'kg', current_price: 15000, supplier_id: null,
    })

    expect(state.historyInsertArgs).not.toBeNull()
    expect((state.historyInsertArgs as { price: number }).price).toBe(15000)
    expect((state.historyInsertArgs as { price: number }).price).not.toBe(5000)
  })

  it('does NOT insert history when price is unchanged', async () => {
    const { updateIngredient } = await getUpdateFn()
    state.callOrder = []

    await updateIngredient('ing-1', {
      name: 'Sugar renamed', unit: 'kg', current_price: 5000, supplier_id: null,
    })

    expect(state.callOrder).not.toContain('history.insert')
    expect(state.historyInsertArgs).toBeNull()
  })

  it('does NOT insert history when update fails', async () => {
    state.updateShouldFail = true
    const { updateIngredient } = await getUpdateFn()
    state.callOrder = []

    await updateIngredient('ing-1', {
      name: 'Sugar', unit: 'kg', current_price: 9000, supplier_id: null,
    })

    expect(state.callOrder).not.toContain('history.insert')
    expect(state.historyInsertArgs).toBeNull()
  })
})
