import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import type { RevenueEntry, RevenueEntryInput, DishInput } from '../types'

export function useRevenue() {
  const { user } = useAuth()
  const [entries, setEntries] = useState<RevenueEntry[]>([])
  const [loading, setLoading] = useState(true)

  const fetchEntries = useCallback(async () => {
    if (!user) return
    const { data } = await supabase
      .from('revenue_entries')
      .select('*, revenue_entry_dishes(id, recipe_id, user_id, quantity, menu_items(id, name))')
      .eq('user_id', user.id)
      .order('entry_date', { ascending: false })
    setEntries((data ?? []) as RevenueEntry[])
    setLoading(false)
  }, [user])

  useEffect(() => { fetchEntries() }, [fetchEntries])

  const addEntry = async (values: RevenueEntryInput, dishes: DishInput[]): Promise<boolean> => {
    const { data, error } = await supabase
      .from('revenue_entries')
      .insert({
        user_id:         user!.id,
        entry_date:      values.entry_date,
        lump_sum_amount: values.lump_sum_amount,
        notes:           values.notes,
      })
      .select()
      .single()
    if (error || !data) return false

    const entryId = (data as { id: string }).id
    if (dishes.length > 0) {
      const { error: dishError } = await supabase
        .from('revenue_entry_dishes')
        .insert(dishes.map(d => ({
          revenue_entry_id: entryId,
          user_id:          user!.id,
          recipe_id:        d.recipe_id,
          quantity:         d.quantity,
        })))
      if (dishError) return false
    }

    await fetchEntries()
    return true
  }

  const updateEntry = async (id: string, values: RevenueEntryInput, dishes: DishInput[]): Promise<boolean> => {
    const { error } = await supabase
      .from('revenue_entries')
      .update({
        lump_sum_amount: values.lump_sum_amount,
        notes:           values.notes,
        updated_at:      new Date().toISOString(),
      })
      .eq('id', id)
    if (error) return false

    // Delete-then-reinsert dish rows (same pattern as saveRecipe in useRecipes.ts)
    await supabase.from('revenue_entry_dishes').delete().eq('revenue_entry_id', id)
    if (dishes.length > 0) {
      const { error: dishError } = await supabase
        .from('revenue_entry_dishes')
        .insert(dishes.map(d => ({
          revenue_entry_id: id,
          user_id:          user!.id,
          recipe_id:        d.recipe_id,
          quantity:         d.quantity,
        })))
      if (dishError) return false
    }

    await fetchEntries()
    return true
  }

  const deleteEntry = async (id: string): Promise<boolean> => {
    const { error } = await supabase.from('revenue_entries').delete().eq('id', id)
    if (error) return false
    await fetchEntries()
    return true
  }

  return { entries, loading, addEntry, updateEntry, deleteEntry }
}
