import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useIngredients } from './useIngredients'
import { useRecipes } from './useRecipes'
import { detectAlerts } from '../lib/priceAlerts'
import type { Dismissal } from '../lib/priceAlerts'
import type { PriceAlert } from '../types'

interface UsePriceAlertsResult {
  alerts: PriceAlert[]
  dismissAlert: (ingredientId: string) => Promise<string | null>
  loading: boolean
}

export function usePriceAlerts(): UsePriceAlertsResult {
  const { user } = useAuth()
  const { ingredients, loading: ingredientsLoading } = useIngredients()
  const { recipes, loading: recipesLoading } = useRecipes()

  const [dismissals, setDismissals] = useState<Dismissal[]>([])
  const [dismissalsLoading, setDismissalsLoading] = useState(true)
  const [alerts, setAlerts] = useState<PriceAlert[]>([])

  // Fetch dismissals from Supabase on mount
  const fetchDismissals = useCallback(async () => {
    if (!user) return
    const { data } = await supabase
      .from('price_alert_dismissals')
      .select('ingredient_id, dismissed_at')
      .eq('user_id', user.id)
    setDismissals((data ?? []) as Dismissal[])
    setDismissalsLoading(false)
  }, [user])

  useEffect(() => {
    fetchDismissals()
  }, [fetchDismissals])

  // Recompute alerts whenever inputs change
  useEffect(() => {
    if (ingredientsLoading || recipesLoading || dismissalsLoading) return
    setAlerts(detectAlerts(ingredients, dismissals, recipes))
  }, [ingredients, recipes, dismissals, ingredientsLoading, recipesLoading, dismissalsLoading])

  const dismissAlert = async (ingredientId: string): Promise<string | null> => {
    if (!user) return 'Not authenticated'

    // Optimistic update: remove from local state immediately
    const previous = alerts
    setAlerts(prev => prev.filter(a => a.ingredientId !== ingredientId))

    const dismissedAt = new Date().toISOString()

    const { error } = await supabase
      .from('price_alert_dismissals')
      .upsert(
        { user_id: user.id, ingredient_id: ingredientId, dismissed_at: dismissedAt },
        { onConflict: 'user_id,ingredient_id' }
      )

    if (error) {
      // Restore previous state on failure
      setAlerts(previous)
      return error.message
    }

    // Update local dismissals so re-trigger logic stays accurate
    setDismissals(prev => {
      const filtered = prev.filter(d => d.ingredient_id !== ingredientId)
      return [...filtered, { ingredient_id: ingredientId, dismissed_at: dismissedAt }]
    })

    return null
  }

  const loading = ingredientsLoading || recipesLoading || dismissalsLoading

  return { alerts, dismissAlert, loading }
}
