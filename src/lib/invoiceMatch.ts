import Fuse from 'fuse.js'
import type { Ingredient } from '../types'
import type { Supplier } from '../types'

export type ConfidenceTier = 'high' | 'low' | 'none'

export interface IngredientMatch {
  ingredient: Ingredient | null
  confidence: ConfidenceTier
}

export interface SupplierMatch {
  supplier: Supplier | null
  confidence: ConfidenceTier
}

// Ingredient matching — ignoreDiacritics: false to preserve Vietnamese semantic tones
// (e.g. "Bò Tơ" ≠ "Bò Úc"; only diacritical normalisation for case is needed)
// Fuse.js score: 0 = perfect match, 1 = no match
// score < 0.1  → high confidence (exact/near-exact)
// 0.1–0.3      → low confidence (partial match)
// > 0.3        → no match
export function matchIngredient(extractedName: string, ingredients: Ingredient[]): IngredientMatch {
  if (!ingredients.length) return { ingredient: null, confidence: 'none' }
  const fuse = new Fuse(ingredients, {
    keys:         ['name'],
    threshold:    0.3,
    includeScore: true,
  })
  const results = fuse.search(extractedName)
  if (!results.length) return { ingredient: null, confidence: 'none' }
  const top = results[0]
  if (top.score! < 0.1)  return { ingredient: top.item, confidence: 'high' }
  if (top.score! <= 0.3) return { ingredient: top.item, confidence: 'low' }
  return { ingredient: null, confidence: 'none' }
}

// Supplier matching — more lenient threshold (0.4) since cafe owners have 5–15 known suppliers
// and partial name matches (e.g. "Miền Nam Foods" vs "Cty Miền Nam") should still match
export function matchSupplier(extractedName: string | null, suppliers: Supplier[]): SupplierMatch {
  if (!extractedName || !suppliers.length) return { supplier: null, confidence: 'none' }
  const fuse = new Fuse(suppliers, {
    keys:         ['name'],
    threshold:    0.4,
    includeScore: true,
  })
  const results = fuse.search(extractedName)
  if (!results.length) return { supplier: null, confidence: 'none' }
  const top = results[0]
  if (top.score! < 0.15) return { supplier: top.item, confidence: 'high' }
  if (top.score! <= 0.4) return { supplier: top.item, confidence: 'low' }
  return { supplier: null, confidence: 'none' }
}

// Returns the Tailwind class for the full cell background tint
// D-01: high → bg-bep-profit-bg
// D-02: low  → bg-bep-warning-bg
// D-03: none → no tint (empty string)
export function confidenceCellClass(tier: ConfidenceTier): string {
  if (tier === 'high') return 'bg-bep-profit-bg'
  if (tier === 'low')  return 'bg-bep-warning-bg'
  return ''
}
