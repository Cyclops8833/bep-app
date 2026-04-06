import { Navigate } from 'react-router-dom'
import { ReactNode } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useProfile } from '../hooks/useProfile'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { session, loading: authLoading } = useAuth()
  const { profile, loading: profileLoading } = useProfile()

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-bep-rice flex">
        {/* Sidebar shape */}
        <div className="w-[220px] md:w-[56px] lg:w-[220px] bg-bep-surface border-r border-bep-pebble shrink-0 animate-pulse" />
        {/* Content area shape */}
        <div className="flex-1 p-6 flex flex-col gap-4">
          <div className="h-8 bg-bep-pebble rounded w-48 animate-pulse" />
          <div className="h-40 bg-bep-pebble rounded-xl animate-pulse" />
          <div className="h-40 bg-bep-pebble rounded-xl animate-pulse" />
        </div>
      </div>
    )
  }

  if (!session) return <Navigate to="/login" replace />
  if (!profile) return <Navigate to="/onboarding" replace />

  return <>{children}</>
}
