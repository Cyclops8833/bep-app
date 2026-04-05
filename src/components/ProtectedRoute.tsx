import { Navigate } from 'react-router-dom'
import { ReactNode } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useProfile } from '../hooks/useProfile'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { session, loading: authLoading } = useAuth()
  const { profile, loading: profileLoading } = useProfile()

  if (authLoading || profileLoading) return null

  if (!session) return <Navigate to="/login" replace />
  if (!profile) return <Navigate to="/onboarding" replace />

  return <>{children}</>
}
