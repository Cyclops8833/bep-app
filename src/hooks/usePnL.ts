import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { periodToRange, computeMetrics, getHealthTier, rankCostDrivers } from '../lib/pnl'
import type { PnLPeriod, PnLMetrics, DailyPoint, CostDriver, HealthTier } from '../types'

interface UsePnLResult {
  metrics: PnLMetrics | null
  healthTier: HealthTier | null
  chartData: DailyPoint[]
  costDrivers: CostDriver[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export function usePnL(period: PnLPeriod | null): UsePnLResult {
  const { user } = useAuth()
  const [metrics, setMetrics] = useState<PnLMetrics | null>(null)
  const [healthTier, setHealthTier] = useState<HealthTier | null>(null)
  const [chartData, setChartData] = useState<DailyPoint[]>([])
  const [costDrivers, setCostDrivers] = useState<CostDriver[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  const fetchData = useCallback(async () => {
    // When period is null, prevent flash (Pitfall 4) — return loading state
    if (!user || period === null) {
      setLoading(true)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { start, end } = periodToRange(period)

      // Revenue query — lump_sum_amount only per D-12
      const { data: revenueData, error: revenueError } = await supabase
        .from('revenue_entries')
        .select('entry_date, lump_sum_amount')
        .eq('user_id', user.id)
        .gte('entry_date', start)
        .lte('entry_date', end)

      if (revenueError) throw revenueError

      // Cost query — confirmed invoices with all lines (including null ingredient_id for total)
      const { data: invoiceData, error: invoiceError } = await supabase
        .from('invoices')
        .select('invoice_date, created_at, invoice_lines(line_total, ingredient_id, ingredients(id, name))')
        .eq('user_id', user.id)
        .eq('status', 'confirmed')
        .gte('invoice_date', start)
        .lte('invoice_date', end)

      if (invoiceError) throw invoiceError

      // Also fetch invoices with null invoice_date using created_at as fallback (Open Question 1)
      const { data: nullDateInvoiceData } = await supabase
        .from('invoices')
        .select('invoice_date, created_at, invoice_lines(line_total, ingredient_id, ingredients(id, name))')
        .eq('user_id', user.id)
        .eq('status', 'confirmed')
        .is('invoice_date', null)
        .gte('created_at', start + 'T00:00:00.000Z')
        .lte('created_at', end + 'T23:59:59.999Z')

      const allInvoices = [...(invoiceData ?? []), ...(nullDateInvoiceData ?? [])]

      // Aggregate totals
      const totalRevenue = (revenueData ?? []).reduce(
        (sum, r) => sum + (r.lump_sum_amount ?? 0),
        0
      )

      const totalCosts = allInvoices.reduce((sum, inv) => {
        const lines = (inv.invoice_lines ?? []) as { line_total: number }[]
        return sum + lines.reduce((s, l) => s + (l.line_total ?? 0), 0)
      }, 0)

      // Build DailyPoint chart data
      const dailyMap: Record<string, DailyPoint> = {}

      for (const r of revenueData ?? []) {
        const date = r.entry_date
        if (!dailyMap[date]) dailyMap[date] = { date, revenue: 0, cost: 0 }
        dailyMap[date].revenue += r.lump_sum_amount ?? 0
      }

      for (const inv of allInvoices) {
        // Resolve date: invoice_date or created_at cast to YYYY-MM-DD
        const rawDate = inv.invoice_date ?? inv.created_at?.slice(0, 10)
        if (!rawDate) continue
        const date = rawDate.slice(0, 10)
        if (!dailyMap[date]) dailyMap[date] = { date, revenue: 0, cost: 0 }
        const lines = (inv.invoice_lines ?? []) as { line_total: number }[]
        dailyMap[date].cost += lines.reduce((s, l) => s + (l.line_total ?? 0), 0)
      }

      const sortedChartData = Object.values(dailyMap).sort((a, b) =>
        a.date.localeCompare(b.date)
      )

      // Cost drivers — only non-null ingredient_id lines
      const spendByIngredient: Record<string, { name: string; totalSpend: number }> = {}

      for (const inv of allInvoices) {
        const lines = (inv.invoice_lines ?? []) as unknown as {
          line_total: number
          ingredient_id: string | null
          ingredients: { id: string; name: string } | null
        }[]
        for (const line of lines) {
          if (!line.ingredient_id || !line.ingredients) continue
          const { id, name } = line.ingredients
          if (!spendByIngredient[id]) {
            spendByIngredient[id] = { name, totalSpend: 0 }
          }
          spendByIngredient[id].totalSpend += line.line_total ?? 0
        }
      }

      const driverInput = Object.entries(spendByIngredient).map(([ingredientId, v]) => ({
        ingredientId,
        name: v.name,
        totalSpend: v.totalSpend,
      }))

      const computed = computeMetrics({ revenue: totalRevenue, costs: totalCosts })
      setMetrics(computed)
      setHealthTier(getHealthTier(computed.netMargin))
      setChartData(sortedChartData)
      setCostDrivers(rankCostDrivers(driverInput))
    } catch {
      setError('Không thể tải dữ liệu. Vui lòng thử lại.')
      setMetrics(null)
      setHealthTier(null)
    } finally {
      setLoading(false)
    }
  }, [user, period, tick]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Period persistence: on mount, read dashboard_period (handled by parent via useProfile)
  // On period change, fire-and-forget update
  useEffect(() => {
    if (!user || period === null) return
    const periodValue = typeof period === 'string' ? period : 'custom'
    supabase
      .from('profiles')
      .update({ dashboard_period: periodValue })
      .eq('id', user.id)
      .then(() => {
        // fire-and-forget — no loading state needed
      })
  }, [user, period])

  return {
    metrics,
    healthTier,
    chartData,
    costDrivers,
    loading,
    error,
    refetch: () => setTick(t => t + 1),
  }
}
