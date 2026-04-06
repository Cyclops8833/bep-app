import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import type { InvoiceWithLines } from '../types'

export function useInvoices() {
  const { user } = useAuth()
  const [invoices, setInvoices]   = useState<InvoiceWithLines[]>([])
  const [loading, setLoading]     = useState(true)

  async function fetchInvoices() {
    if (!user) return
    setLoading(true)
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        suppliers(id, name),
        invoice_lines(*)
      `)
      .order('created_at', { ascending: false })
    if (error || !data) { setLoading(false); return }
    setInvoices(data as InvoiceWithLines[])
    setLoading(false)
  }

  useEffect(() => { fetchInvoices() }, [user])

  // Creates the initial invoice record with status='pending' and returns the invoice id.
  // storageKey is the Supabase Storage path: `${user.id}/${uuid}.${ext}`
  async function createPendingInvoice(storageKey: string): Promise<string | null> {
    if (!user) return null
    const { data, error } = await supabase
      .from('invoices')
      .insert({ user_id: user.id, storage_key: storageKey, status: 'pending' })
      .select('id')
      .single()
    if (error || !data) return null
    await fetchInvoices()
    return data.id
  }

  // Saves the confirmed invoice: inserts invoice_lines rows, updates invoices status+supplier+date+total.
  // Does NOT call updateIngredient here — that is done in InvoiceConfirm.tsx before calling this.
  async function confirmInvoice(
    invoiceId: string,
    supplierId: string | null,
    invoiceDate: string | null,
    lines: Array<{
      extracted_name: string
      ingredient_id:  string | null
      quantity:       number
      unit:           string
      unit_price:     number
      line_total:     number
    }>,
    totalAmount: number,
  ): Promise<boolean> {
    if (!user) return false

    // Insert all line items
    const lineRows = lines.map(l => ({ ...l, invoice_id: invoiceId, user_id: user.id }))
    const { error: linesError } = await supabase
      .from('invoice_lines')
      .insert(lineRows)
    if (linesError) return false

    // Update invoice header
    const { error: invoiceError } = await supabase
      .from('invoices')
      .update({
        status:       'confirmed',
        supplier_id:  supplierId,
        invoice_date: invoiceDate,
        total_amount: totalAmount,
      })
      .eq('id', invoiceId)
    if (invoiceError) return false

    await fetchInvoices()
    return true
  }

  async function deleteInvoice(id: string): Promise<boolean> {
    if (!user) return false
    // Find storage key before deleting the record
    const invoice = invoices.find(i => i.id === id)
    const { error } = await supabase.from('invoices').delete().eq('id', id)
    if (error) return false
    // Clean up Storage file
    if (invoice?.storage_key) {
      await supabase.storage.from('invoices').remove([invoice.storage_key])
    }
    setInvoices(prev => prev.filter(i => i.id !== id))
    return true
  }

  return { invoices, loading, createPendingInvoice, confirmInvoice, deleteInvoice }
}
