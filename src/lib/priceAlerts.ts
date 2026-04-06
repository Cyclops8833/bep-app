import type { PriceAlert, IngredientWithRelations, MenuItemWithCost } from '../types'

export interface Dismissal {
  ingredient_id: string
  dismissed_at: string  // ISO timestamp
}

/**
 * Detect price alerts for ingredients whose price has risen >10% (per D-15).
 * Dismissals suppress alerts unless a NEW price entry was recorded after the dismissal.
 */
export function detectAlerts(
  ingredients: IngredientWithRelations[],
  dismissals: Dismissal[],
  recipes: MenuItemWithCost[]
): PriceAlert[] {
  const dismissalMap = new Map(dismissals.map(d => [d.ingredient_id, d.dismissed_at]))

  return ingredients
    .map(ing => {
      const history = [...ing.ingredient_price_history]
        .sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime())

      if (history.length < 2) return null

      const prev = history[history.length - 2]
      const curr = history[history.length - 1]
      if (prev.price === 0) return null

      const rise = ((curr.price - prev.price) / prev.price) * 100
      // D-15: threshold is >10%, not >=10%
      if (rise <= 10) return null

      // Dismissal check: suppress unless new price was recorded AFTER dismissal
      const dismissedAt = dismissalMap.get(ing.id)
      if (dismissedAt && new Date(curr.recorded_at) <= new Date(dismissedAt)) return null

      const affectedDishes = recipes
        .filter(r => r.recipe_lines.some(l => l.ingredient_id === ing.id))
        .map(r => ({ name: r.name, margin: r.gross_margin }))

      return {
        ingredientId: ing.id,
        ingredientName: ing.name,
        percentRise: Math.round(rise),
        affectedDishes,
      } as PriceAlert
    })
    .filter((a): a is PriceAlert => a !== null)
}
