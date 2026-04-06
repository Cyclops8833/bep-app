import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useProfile } from '../hooks/useProfile'

export default function VATPage() {
  const { t } = useTranslation()
  const { profile, loading } = useProfile()
  const navigate = useNavigate()

  // D-02: redirect non-VAT users to /dashboard
  useEffect(() => {
    if (!loading && profile && !profile.vat_registered) {
      navigate('/dashboard', { replace: true })
    }
  }, [loading, profile, navigate])

  // D-03: prevent flash — don't render until profile loaded
  if (loading || !profile) return null
  if (!profile.vat_registered) return null

  return (
    <div className="max-w-[800px] mx-auto p-6">
      <h1 className="text-lg font-medium text-bep-charcoal">{t('vat.title')}</h1>
      <p className="text-sm text-bep-stone mt-1">VAT summary content — Plan 02</p>
    </div>
  )
}
