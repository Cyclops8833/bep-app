import type { VATData } from '../types'

export function computeVAT(totalCosts: number, totalRevenue: number): VATData {
  const inputVAT = totalCosts * 0.10
  const outputVAT = totalRevenue * 0.10
  return { inputVAT, outputVAT, netVAT: outputVAT - inputVAT }
}

export function lastDayOfMonth(year: number, month: number): string {
  const d = new Date(year, month, 0)
  return `${year}-${String(month).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
