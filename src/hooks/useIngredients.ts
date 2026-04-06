import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import type { IngredientWithRelations, Unit } from '../types'

type IngredientInput = {
  name: string
  unit: Unit
  current_price: number
  supplier_id: string | null
}

export function useIngredients() {
  const { user } = useAuth()
  const [ingredients, setIngredients] = useState<IngredientWithRelations[]>([])
  const [loading, setLoading] = useState(true)

  const fetchIngredients = useCallback(async () => {
    if (!user) return
    const { data } = await supabase
      .from('ingredients')
      .select('*, suppliers(id, name), ingredient_price_history(price, recorded_at)')
      .order('name')
    setIngredients((data ?? []) as IngredientWithRelations[])
    setLoading(false)
  }, [user])

  useEffect(() => { fetchIngredients() }, [fetchIngredients])

  const addIngredient = async (values: IngredientInput): Promise<{ ok: boolean; error?: string }> => {
    const { data, error } = await supabase
      .from('ingredients')
      .insert({ ...values, user_id: user!.id })
      .select('*, suppliers(id, name), ingredient_price_history(price, recorded_at)')
      .single()
    if (error || !data) return { ok: false, error: error?.message ?? 'Unknown error' }
    setIngredients(prev => [...prev, data as IngredientWithRelations].sort((a, b) => a.name.localeCompare(b.name)))
    return { ok: true }
  }

  const updateIngredient = async (id: string, values: IngredientInput): Promise<{ ok: boolean; error?: string }> => {
    const current = ingredients.find(i => i.id === id)

    // Run the update first
    const { error } = await supabase
      .from('ingredients')
      .update({ ...values, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (error) return { ok: false, error: error?.message ?? 'Unknown error' }

    // Only record price history AFTER successful update, and only when price changed
    if (current && values.current_price !== current.current_price) {
      await supabase.from('ingredient_price_history').insert({
        ingredient_id: id,
        price: values.current_price,
      })
    }

    await fetchIngredients()
    return { ok: true }
  }

  const deleteIngredient = async (id: string): Promise<{ ok: boolean; error?: string }> => {
    const { error } = await supabase.from('ingredients').delete().eq('id', id)
    if (error) return { ok: false, error: error?.message ?? 'Unknown error' }
    setIngredients(prev => prev.filter(i => i.id !== id))
    return { ok: true }
  }

  return { ingredients, loading, addIngredient, updateIngredient, deleteIngredient }
}
