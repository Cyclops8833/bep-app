import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import type { Supplier } from '../types'

type SupplierInput = Pick<Supplier, 'name' | 'phone' | 'notes'>

export function useSuppliers() {
  const { user } = useAuth()
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)

  const fetchSuppliers = useCallback(async () => {
    if (!user) return
    const { data } = await supabase.from('suppliers').select('*').order('name')
    setSuppliers((data ?? []) as Supplier[])
    setLoading(false)
  }, [user])

  useEffect(() => { fetchSuppliers() }, [fetchSuppliers])

  const addSupplier = async (values: SupplierInput): Promise<boolean> => {
    const { data, error } = await supabase
      .from('suppliers')
      .insert({ ...values, user_id: user!.id })
      .select()
      .single()
    if (error || !data) return false
    setSuppliers(prev => [...prev, data as Supplier].sort((a, b) => a.name.localeCompare(b.name)))
    return true
  }

  const updateSupplier = async (id: string, values: SupplierInput): Promise<boolean> => {
    const { error } = await supabase.from('suppliers').update(values).eq('id', id)
    if (error) return false
    setSuppliers(prev => prev.map(s => s.id === id ? { ...s, ...values } : s))
    return true
  }

  const deleteSupplier = async (id: string): Promise<boolean> => {
    const { error } = await supabase.from('suppliers').delete().eq('id', id)
    if (error) return false
    setSuppliers(prev => prev.filter(s => s.id !== id))
    return true
  }

  return { suppliers, loading, addSupplier, updateSupplier, deleteSupplier }
}
