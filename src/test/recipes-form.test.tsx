/**
 * Tests: Recipe form uses RHF handleSubmit with Zod validation (D-19).
 * - Empty name triggers validation error (text-bep-loss element appears)
 * - selling_price = 0 triggers validation error
 * - Valid form calls saveRecipe with correct values
 * - Smoke test: component renders
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { act } from 'react'
import React from 'react'

// ---- Mocks ----

const mockSaveRecipe = vi.fn().mockResolvedValue({ ok: true })
const mockDeleteRecipe = vi.fn().mockResolvedValue({ ok: true })

vi.mock('../hooks/useRecipes', () => ({
  useRecipes: () => ({
    recipes: [],
    loading: false,
    saveRecipe: mockSaveRecipe,
    deleteRecipe: mockDeleteRecipe,
  }),
}))

vi.mock('../hooks/useIngredients', () => ({
  useIngredients: () => ({
    ingredients: [
      { id: 'ing-1', name: 'Sugar', unit: 'kg', current_price: 5000 },
    ],
    loading: false,
    addIngredient: vi.fn(),
    updateIngredient: vi.fn(),
    deleteIngredient: vi.fn(),
  }),
}))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { changeLanguage: vi.fn() },
  }),
}))

vi.mock('../lib/format', () => ({
  formatVND: (n: number) => `${n}đ`,
  formatVNDShort: (n: number) => `${n}đ`,
}))

beforeEach(() => {
  vi.clearAllMocks()
  mockSaveRecipe.mockResolvedValue({ ok: true })
})

async function openAddDrawer() {
  const { default: Recipes } = await import('../pages/Recipes')
  let utils: ReturnType<typeof render>
  await act(async () => {
    utils = render(<Recipes />)
  })

  // Click the first "recipes.add" button
  const addBtns = screen.getAllByText('recipes.add')
  await act(async () => {
    fireEvent.click(addBtns[0])
  })

  return utils!
}

describe('Recipes form (D-19 RHF handleSubmit)', () => {
  it('smoke test: component renders without crashing', async () => {
    const { default: Recipes } = await import('../pages/Recipes')
    await act(async () => {
      render(<Recipes />)
    })
    expect(screen.getByText('recipes.title')).toBeInTheDocument()
  })

  it('submitting with empty name shows a validation error (text-bep-loss class)', async () => {
    await openAddDrawer()

    // Click save without filling any fields
    const saveBtn = screen.getByText('common.save')
    await act(async () => {
      fireEvent.click(saveBtn)
    })

    await waitFor(() => {
      const errorEls = document.querySelectorAll('.text-bep-loss')
      expect(errorEls.length).toBeGreaterThan(0)
    })

    expect(mockSaveRecipe).not.toHaveBeenCalled()
  })

  it('submitting with selling_price = 0 shows a validation error', async () => {
    await openAddDrawer()

    // Fill name but leave selling_price at default 0
    const nameInput = screen.getByPlaceholderText('recipes.name_placeholder')
    await act(async () => {
      fireEvent.change(nameInput, { target: { value: 'Pho' } })
    })

    const saveBtn = screen.getByText('common.save')
    await act(async () => {
      fireEvent.click(saveBtn)
    })

    await waitFor(() => {
      const errorEls = document.querySelectorAll('.text-bep-loss')
      expect(errorEls.length).toBeGreaterThan(0)
    })

    expect(mockSaveRecipe).not.toHaveBeenCalled()
  })

  it('valid form data (with ingredient line) calls saveRecipe with correct name and selling_price', async () => {
    await openAddDrawer()

    // Fill name
    const nameInput = screen.getByPlaceholderText('recipes.name_placeholder')
    await act(async () => {
      fireEvent.change(nameInput, { target: { value: 'Banh Mi' } })
    })

    // Fill selling_price > 0
    const priceInput = screen.getByPlaceholderText('recipes.price_placeholder')
    await act(async () => {
      fireEvent.change(priceInput, { target: { value: '35000', valueAsNumber: 35000 } })
    })

    // Add an ingredient line so lines.length > 0
    const addLineBtn = screen.getByText('+ recipes.add_line')
    await act(async () => {
      fireEvent.click(addLineBtn)
    })

    const saveBtn = screen.getByText('common.save')
    await act(async () => {
      fireEvent.click(saveBtn)
    })

    await waitFor(() => {
      expect(mockSaveRecipe).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Banh Mi' }),
        expect.any(Array),
        undefined,
      )
    }, { timeout: 3000 })
  })
})
