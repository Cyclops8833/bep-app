import type { PnLPeriod, PnLMetrics, CostDriver, HealthTier } from '../types'

function toYMD(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function periodToRange(
  period: PnLPeriod,
  _now?: Date
): { start: string; end: string } {
  if (typeof period === 'object') {
    return period
  }

  const today = _now ? new Date(_now) : new Date()
  today.setHours(0, 0, 0, 0)

  if (period === 'today') {
    const s = toYMD(today)
    return { start: s, end: s }
  }

  if (period === 'this_week') {
    // Week starts Monday (weekStartsOn: 1)
    const dow = today.getDay() // 0=Sun, 1=Mon, ...6=Sat
    const diffToMonday = (dow === 0 ? -6 : 1 - dow)
    const monday = new Date(today)
    monday.setDate(today.getDate() + diffToMonday)
    return { start: toYMD(monday), end: toYMD(today) }
  }

  if (period === 'this_month') {
    const first = new Date(today.getFullYear(), today.getMonth(), 1)
    return { start: toYMD(first), end: toYMD(today) }
  }

  if (period === 'last_month') {
    const firstOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
    const lastOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0)
    return { start: toYMD(firstOfLastMonth), end: toYMD(lastOfLastMonth) }
  }

  // Fallback — should not happen with strict typing
  const s = toYMD(today)
  return { start: s, end: s }
}

export function computeMetrics(totals: { revenue: number; costs: number }): PnLMetrics {
  const { revenue, costs } = totals
  const netProfit = revenue - costs
  const netMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0
  return { revenue, costs, netProfit, netMargin }
}

export function getHealthTier(netMargin: number): HealthTier {
  if (netMargin > 20) return 'profitable'
  if (netMargin >= 5) return 'watch'
  return 'loss'
}

export function rankCostDrivers(
  items: { ingredientId: string; name: string; totalSpend: number }[]
): CostDriver[] {
  return [...items]
    .sort((a, b) => b.totalSpend - a.totalSpend)
    .slice(0, 3)
    .map(item => ({
      ingredientId: item.ingredientId,
      name: item.name,
      totalSpend: item.totalSpend,
    }))
}

export function validateCustomRange(start: string, end: string): boolean {
  const startDate = new Date(start)
  const endDate = new Date(end)
  const diffMs = endDate.getTime() - startDate.getTime()
  const diffDays = diffMs / (1000 * 60 * 60 * 24)
  return diffDays <= 90
}
