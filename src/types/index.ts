export type OutletType = 'cafe' | 'restaurant' | 'street_food' | 'bakery' | 'other'
export type LanguagePref = 'vi' | 'en'
export type Unit = 'g' | 'kg' | 'ml' | 'L' | 'piece' | 'bunch' | 'bottle'

export interface Profile {
  id: string
  business_name: string
  outlet_type: OutletType
  city: string
  vat_registered: boolean
  language_pref: LanguagePref
  created_at: string
}

export interface Supplier {
  id: string
  user_id: string
  name: string
  phone: string | null
  notes: string | null
  created_at: string
}

export interface Ingredient {
  id: string
  user_id: string
  name: string
  unit: Unit
  current_price: number
  supplier_id: string | null
  created_at: string
  updated_at: string
}

export interface PriceHistoryEntry {
  id: string
  ingredient_id: string
  price: number
  recorded_at: string
}

export interface MenuItem {
  id: string
  user_id: string
  name: string
  selling_price: number
  category: string | null
  created_at: string
}

export interface RecipeLineWithIngredient {
  id: string
  menu_item_id: string
  ingredient_id: string
  quantity: number
  ingredients: {
    id: string
    name: string
    unit: Unit
    current_price: number
  }
}

export interface MenuItemWithCost extends MenuItem {
  recipe_lines: RecipeLineWithIngredient[]
  cost_per_dish: number
  gross_margin: number
}

export interface IngredientWithRelations extends Ingredient {
  suppliers: { id: string; name: string } | null
  ingredient_price_history: { price: number; recorded_at: string }[]
}
