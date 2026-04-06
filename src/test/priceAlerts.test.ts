import { describe, it, expect } from 'vitest'
import { detectAlerts } from '../lib/priceAlerts'
import type { IngredientWithRelations, MenuItemWithCost } from '../types'
import type { Dismissal } from '../lib/priceAlerts'

// Helper to build minimal IngredientWithRelations
function makeIngredient(
  id: string,
  name: string,
  prices: { price: number; recorded_at: string }[]
): IngredientWithRelations {
  return {
    id,
    user_id: 'user-1',
    name,
    unit: 'kg',
    current_price: prices[prices.length - 1]?.price ?? 0,
    supplier_id: null,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    suppliers: null,
    ingredient_price_history: prices,
  }
}

// Helper to build minimal MenuItemWithCost
function makeRecipe(
  id: string,
  name: string,
  ingredientIds: string[],
  gross_margin: number
): MenuItemWithCost {
  return {
    id,
    user_id: 'user-1',
    name,
    selling_price: 100000,
    category: null,
    created_at: '2026-01-01T00:00:00Z',
    recipe_lines: ingredientIds.map((ingredient_id, i) => ({
      id: `line-${id}-${i}`,
      menu_item_id: id,
      ingredient_id,
      quantity: 1,
      ingredients: {
        id: ingredient_id,
        name: `Ingredient ${ingredient_id}`,
        unit: 'kg',
        current_price: 10000,
      },
    })),
    cost_per_dish: 70000,
    gross_margin,
  }
}

const noDismissals: Dismissal[] = []
const noRecipes: MenuItemWithCost[] = []

describe('detectAlerts', () => {
  it('detects 12% rise (above 10% threshold)', () => {
    const ingredient = makeIngredient('ing-1', 'Thịt bò', [
      { price: 100000, recorded_at: '2026-04-01T00:00:00Z' },
      { price: 112000, recorded_at: '2026-04-05T00:00:00Z' },
    ])
    const alerts = detectAlerts([ingredient], noDismissals, noRecipes)
    expect(alerts).toHaveLength(1)
    expect(alerts[0].ingredientId).toBe('ing-1')
    expect(alerts[0].percentRise).toBe(12)
  })

  it('does NOT detect 9% rise (below 10% threshold)', () => {
    const ingredient = makeIngredient('ing-1', 'Thịt bò', [
      { price: 100000, recorded_at: '2026-04-01T00:00:00Z' },
      { price: 109000, recorded_at: '2026-04-05T00:00:00Z' },
    ])
    const alerts = detectAlerts([ingredient], noDismissals, noRecipes)
    expect(alerts).toHaveLength(0)
  })

  it('does NOT detect exactly 10% rise (boundary: must be >10, not >=10)', () => {
    const ingredient = makeIngredient('ing-1', 'Thịt bò', [
      { price: 100000, recorded_at: '2026-04-01T00:00:00Z' },
      { price: 110000, recorded_at: '2026-04-05T00:00:00Z' },
    ])
    const alerts = detectAlerts([ingredient], noDismissals, noRecipes)
    expect(alerts).toHaveLength(0)
  })

  it('detects 11% rise', () => {
    const ingredient = makeIngredient('ing-1', 'Thịt bò', [
      { price: 100000, recorded_at: '2026-04-01T00:00:00Z' },
      { price: 111000, recorded_at: '2026-04-05T00:00:00Z' },
    ])
    const alerts = detectAlerts([ingredient], noDismissals, noRecipes)
    expect(alerts).toHaveLength(1)
    expect(alerts[0].percentRise).toBe(11)
  })

  it('returns 0 alerts when ingredient has only 1 history entry (need at least 2)', () => {
    const ingredient = makeIngredient('ing-1', 'Thịt bò', [
      { price: 100000, recorded_at: '2026-04-01T00:00:00Z' },
    ])
    const alerts = detectAlerts([ingredient], noDismissals, noRecipes)
    expect(alerts).toHaveLength(0)
  })

  it('suppresses alert for dismissed ingredient', () => {
    const ingredient = makeIngredient('ing-1', 'Thịt bò', [
      { price: 100000, recorded_at: '2026-04-01T00:00:00Z' },
      { price: 115000, recorded_at: '2026-04-05T00:00:00Z' },
    ])
    const dismissals: Dismissal[] = [
      { ingredient_id: 'ing-1', dismissed_at: '2026-04-06T00:00:00Z' },
    ]
    const alerts = detectAlerts([ingredient], dismissals, noRecipes)
    expect(alerts).toHaveLength(0)
  })

  it('re-triggers alert when new price is recorded AFTER dismissal', () => {
    const ingredient = makeIngredient('ing-1', 'Thịt bò', [
      { price: 100000, recorded_at: '2026-04-01T00:00:00Z' },
      // Latest entry is AFTER the dismissed_at
      { price: 120000, recorded_at: '2026-04-08T00:00:00Z' },
    ])
    const dismissals: Dismissal[] = [
      { ingredient_id: 'ing-1', dismissed_at: '2026-04-06T00:00:00Z' },
    ]
    const alerts = detectAlerts([ingredient], dismissals, noRecipes)
    expect(alerts).toHaveLength(1)
    expect(alerts[0].percentRise).toBe(20)
  })

  it('correctly maps affected dishes for an ingredient used in multiple recipes', () => {
    const ingredient = makeIngredient('ing-1', 'Thịt bò', [
      { price: 100000, recorded_at: '2026-04-01T00:00:00Z' },
      { price: 115000, recorded_at: '2026-04-05T00:00:00Z' },
    ])
    const recipes = [
      makeRecipe('recipe-A', 'Phở bò', ['ing-1'], 25.5),
      makeRecipe('recipe-B', 'Bún bò Huế', ['ing-1', 'ing-2'], 18.0),
      makeRecipe('recipe-C', 'Cơm gà', ['ing-3'], 32.0), // unrelated dish
    ]
    const alerts = detectAlerts([ingredient], noDismissals, recipes)
    expect(alerts).toHaveLength(1)
    const alert = alerts[0]
    expect(alert.affectedDishes).toHaveLength(2)
    const dishNames = alert.affectedDishes.map(d => d.name)
    expect(dishNames).toContain('Phở bò')
    expect(dishNames).toContain('Bún bò Huế')
    expect(dishNames).not.toContain('Cơm gà')
    expect(alert.affectedDishes.find(d => d.name === 'Phở bò')?.margin).toBeCloseTo(25.5)
    expect(alert.affectedDishes.find(d => d.name === 'Bún bò Huế')?.margin).toBeCloseTo(18.0)
  })

  it('returns empty array when no ingredients have rising prices', () => {
    const ingredients = [
      makeIngredient('ing-1', 'Gà', [
        { price: 100000, recorded_at: '2026-04-01T00:00:00Z' },
        { price: 98000, recorded_at: '2026-04-05T00:00:00Z' }, // price dropped
      ]),
      makeIngredient('ing-2', 'Rau cải', [
        { price: 20000, recorded_at: '2026-04-01T00:00:00Z' },
        { price: 21000, recorded_at: '2026-04-05T00:00:00Z' }, // 5% — below threshold
      ]),
    ]
    const alerts = detectAlerts(ingredients, noDismissals, noRecipes)
    expect(alerts).toHaveLength(0)
  })
})
