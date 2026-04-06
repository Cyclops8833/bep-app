import { useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useProfile } from '../hooks/useProfile'
import { formatVND } from '../lib/format'
import '../styles/print.css'

export default function VATSummaryPrint() {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const { profile, loading } = useProfile()
  const navigate = useNavigate()

  // Read VAT data from URL query params (passed by VATPage export handler)
  const year = searchParams.get('year')
  const month = searchParams.get('month')
  const inputVAT = Number(searchParams.get('input') ?? 0)
  const outputVAT = Number(searchParams.get('output') ?? 0)
  const netVAT = Number(searchParams.get('net') ?? 0)

  // VAT gate — print route must also check vat_registered (T-08-07)
  useEffect(() => {
    if (!loading && profile && !profile.vat_registered) {
      navigate('/dashboard', { replace: true })
    }
  }, [loading, profile, navigate])

  // Auto-print when profile data is ready (D-16)
  useEffect(() => {
    if (!loading && profile && profile.vat_registered && year && month) {
      // Small delay to let the browser render the content before print dialog
      const timer = setTimeout(() => {
        window.print()
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [loading, profile, year, month])

  // Loading / gate
  if (loading || !profile) return null
  if (!profile.vat_registered) return null

  // Missing query params — invalid direct access
  if (!year || !month) {
    return (
      <div className="max-w-[700px] mx-auto py-12 px-10 text-center">
        <p className="text-sm text-bep-stone">{t('vat.error_fetch')}</p>
      </div>
    )
  }

  const generatedDate = new Date().toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

  return (
    <div className="max-w-[700px] mx-auto py-12 px-10 bg-white min-h-screen font-ui">
      {/* Business name */}
      <h1 className="text-2xl font-medium text-bep-charcoal">
        {profile.business_name}
      </h1>

      {/* MST (D-17, VAT-05) */}
      {profile.mst && (
        <p className="text-sm text-bep-stone mt-1">
          {t('vat.print_mst_label')}: {profile.mst}
        </p>
      )}

      {/* Period (D-17) */}
      <h2 className="text-lg font-medium text-bep-charcoal mt-4">
        {t('vat.print_period', { month, year })}
      </h2>

      {/* Generated date */}
      <p className="text-xs text-bep-stone mt-1">
        {t('vat.print_generated', { date: generatedDate })}
      </p>

      {/* Divider */}
      <hr className="border-t border-bep-pebble my-6" />

      {/* VAT Breakdown Table (same dual-label rows as in-app, D-08/D-17) */}
      <div className="vat-table divide-y divide-bep-pebble">
        {/* Input VAT */}
        <div className="flex justify-between items-start py-3">
          <div>
            <div className="text-sm text-bep-charcoal">{t('vat.input_vat_primary')}</div>
            <div className="text-xs text-bep-stone mt-0.5">{t('vat.input_vat_secondary')}</div>
          </div>
          <div className="text-2xl font-medium font-mono tabular-nums text-bep-charcoal">
            {formatVND(inputVAT)}
          </div>
        </div>

        {/* Output VAT */}
        <div className="flex justify-between items-start py-3">
          <div>
            <div className="text-sm text-bep-charcoal">{t('vat.output_vat_primary')}</div>
            <div className="text-xs text-bep-stone mt-0.5">{t('vat.output_vat_secondary')}</div>
          </div>
          <div className="text-2xl font-medium font-mono tabular-nums text-bep-charcoal">
            {formatVND(outputVAT)}
          </div>
        </div>

        {/* Net VAT */}
        <div className="flex justify-between items-start py-3">
          <div>
            <div className="text-sm text-bep-charcoal">{t('vat.net_vat_primary')}</div>
            <div className="text-xs text-bep-stone mt-0.5">{t('vat.net_vat_secondary')}</div>
          </div>
          <div className="text-2xl font-medium font-mono tabular-nums text-bep-charcoal">
            {formatVND(netVAT)}
          </div>
        </div>
      </div>

      {/* Divider */}
      <hr className="border-t border-bep-pebble my-6" />

      {/* Disclaimer (D-09, VAT-06) */}
      <p className="text-sm text-bep-charcoal">
        {t('vat.disclaimer')}
      </p>

    </div>
  )
}
