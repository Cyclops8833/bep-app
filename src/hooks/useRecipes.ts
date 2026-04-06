import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import type { MenuItemWithCost } from '../types'

interface MenuItemInput {
  name: string
  selling_price: number
  category: string | null
}

interface LineInput {
  ingredient_id: string
  quantity: number
}

function computeCosts(data: Record<string, unknown>[]): MenuItemWithCost[] {
  return data.map(item => {
    const lines = (item.recipe_lines as { quantity: number; ingredients: { current_price: number } }[]) ?? []
    const cost = lines.reduce((sum, l) => sum + l.quantity * (l.ingredients?.current_price ?? 0), 0)
    const selling = item.selling_price as number
    const margin = selling > 0 ? ((selling - cost) / selling) * 100 : 0
    return { ...item, cost_per_dish: cost, gross_margin: margin } as MenuItemWithCost
  })
}

export function useRecipes() {
  const { user } = useAuth()
  const [recipes, setRecipes] = useState<MenuItemWithCost[]>([])
  const [loading, setLoading] = useState(true)

  const fetchRecipes = useCallback(async () => {
    if (!user) return
    const { data } = await supabase
      .from('menu_items')
      .select('*, recipe_lines(id, quantity, ingredient_id, ingredients(id, name, unit, current_price))')
      .order('name')
    setRecipes(computeCosts((data ?? []) as Record<string, unknown>[]))
    setLoading(false)
  }, [user])

  useEffect(() => { fetchRecipes() }, [fetchRecipes])

  // Realtime: re-calculate when ingredient prices change
  useEffect(() => {
    if (!user) return
    const channel = supabase
      .channel(`ingredient-price-watch-${user.id}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'ingredients' }, fetchRecipes)
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [user, fetchRecipes])

  const saveRecipe = async (
    menuItem: MenuItemInput,
    lines: LineInput[],
    editingId?: string,
  ): Promise<{ ok: boolean; error?: string }> => {
    if (editingId) {
      const { error } = await supabase.from('menu_items').update(menuItem).eq('id', editingId)
      if (error) return { ok: false, error: error?.message ?? 'Unknown error' }
      await supabase.from('recipe_lines').delete().eq('menu_item_id', editingId)
      if (lines.length > 0) {
        await supabase.from('recipe_lines').insert(lines.map(l => ({ ...l, menu_item_id: editingId })))
      }
    } else {
      const { data, error } = await supabase
        .from('menu_items')
        .insert({ ...menuItem, user_id: user!.id })
        .select()
        .single()
      if (error || !data) return { ok: false, error: error?.message ?? 'Unknown error' }
      if (lines.length > 0) {
        await supabase.from('recipe_lines').insert(
          lines.map(l => ({ ...l, menu_item_id: (data as { id: string }).id }))
        )
      }
    }
    await fetchRecipes()
    return { ok: true }
  }

  const deleteRecipe = async (id: string): Promise<{ ok: boolean; error?: string }> => {
    const { error } = await supabase.from('menu_items').delete().eq('id', id)
    if (error) return { ok: false, error: error?.message ?? 'Unknown error' }
    setRecipes(prev => prev.filter(r => r.id !== id))
    return { ok: true }
  }

  return { recipes, loading, saveRecipe, deleteRecipe }
}
