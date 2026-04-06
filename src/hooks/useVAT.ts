import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { computeVAT, lastDayOfMonth } from '../lib/vat'
import type { VATMonth, VATData } from '../types'

interface UseVATResult {
  data: VATData | null
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useVAT(period: VATMonth | null): UseVATResult {
  const { user } = useAuth()
  const [data, setData] = useState<VATData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  const fetchData = useCallback(async () => {
    if (!user || period === null) {
      setLoading(true)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const start = `${period.year}-${String(period.month).padStart(2, '0')}-01`
      const end = lastDayOfMonth(period.year, period.month)

      // Revenue query — lump_sum_amount per D-11
      const { data: revenueData, error: revenueError } = await supabase
        .from('revenue_entries')
        .select('lump_sum_amount')
        .eq('user_id', user.id)
        .gte('entry_date', start)
        .lte('entry_date', end)

      if (revenueError) throw revenueError

      // Cost query — confirmed invoices with lines per D-10
      const { data: invoiceData, error: invoiceError } = await supabase
        .from('invoices')
        .select('invoice_lines(line_total)')
        .eq('user_id', user.id)
        .eq('status', 'confirmed')
        .gte('invoice_date', start)
        .lte('invoice_date', end)

      if (invoiceError) throw invoiceError

      // Null-date fallback — mirror usePnL.ts lines 62-70
      const { data: nullDateInvoiceData } = await supabase
        .from('invoices')
        .select('invoice_lines(line_total)')
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

      setData(computeVAT(totalCosts, totalRevenue))
    } catch {
      setError('vat.error_fetch')
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [user, period, tick]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    data,
    loading,
    error,
    refetch: () => setTick(t => t + 1),
  }
}
