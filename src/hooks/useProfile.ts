import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import type { Profile } from '../types'

export function useProfile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = useCallback(async () => {
    if (!user) {
      setProfile(null)
      setLoading(false)
      return
    }
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    setProfile(data as Profile | null)
    setLoading(false)
  }, [user])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  return { profile, loading, refetch: fetchProfile }
}
