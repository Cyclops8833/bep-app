import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Info } from 'lucide-react'
import { useProfile } from '../hooks/useProfile'
import { useVAT } from '../hooks/useVAT'
import { formatVND } from '../lib/format'
import type { VATMonth } from '../types'

// --- MST Prompt (D-04) ---
function MSTPrompt({ onSaved }: { onSaved: () => void }) {
  const { t } = useTranslation()
  const { profile } = useProfile()
  const [mst, setMst] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!mst.trim() || !profile) return
    setSaving(true)
    setError(null)

    const { supabase } = await import('../lib/supabase')
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ mst: mst.trim() })
      .eq('id', profile.id)

    if (updateError) {
      setError(t('vat.mst_prompt_error'))
      toast.error(t('errors.save_failed'))
      setSaving(false)
    } else {
      onSaved()
    }
  }

  return (
    <div className="bg-bep-surface border border-bep-pebble rounded-xl p-6 max-w-md mx-auto">
      <h2 className="text-lg font-medium text-bep-charcoal">{t('vat.mst_prompt_title')}</h2>
      <p className="text-sm text-bep-stone mt-1">{t('vat.mst_prompt_body')}</p>
      <form onSubmit={handleSubmit} className="mt-4">
        <label className="block text-xs font-medium text-bep-stone uppercase tracking-wider mb-1">
          {t('vat.mst_prompt_label')}
        </label>
        <input
          type="text"
          value={mst}
          onChange={e => setMst(e.target.value)}
          placeholder={t('vat.mst_prompt_placeholder')}
          className="w-full border border-bep-pebble rounded-lg px-3 py-2 text-sm text-bep-charcoal bg-bep-surface focus:outline-none focus:ring-2 focus:ring-bep-turmeric focus:ring-offset-1"
        />
        {error && <p className="text-xs text-bep-loss mt-1">{error}</p>}
        <button
          type="submit"
          disabled={saving || !mst.trim()}
          className="mt-3 bg-bep-turmeric text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-bep-lacquer transition-colors disabled:text-bep-stone disabled:cursor-not-allowed disabled:bg-bep-pebble"
        >
          {t('vat.mst_prompt_save')}
        </button>
      </form>
    </div>
  )
}

// --- VAT Breakdown Row (D-08) ---
function VATRow({ primaryLabel, secondaryLabel, amount }: {
  primaryLabel: string
  secondaryLabel: string
  amount: number
}) {
  return (
    <div className="flex justify-between items-start py-3">
      <div>
        <div className="text-sm text-bep-charcoal">{primaryLabel}</div>
        <div className="text-xs text-bep-stone mt-0.5">{secondaryLabel}</div>
      </div>
      <div className="text-2xl font-medium font-mono tabular-nums text-bep-charcoal">
        {formatVND(amount)}
      </div>
    </div>
  )
}

// --- Main VATPage ---
export default function VATPage() {
  const { t } = useTranslation()
  const { profile, loading: profileLoading, refetch: refetchProfile } = useProfile()
  const navigate = useNavigate()

  // Default to current month
  const now = new Date()
  const [period, setPeriod] = useState<VATMonth>({
    year: now.getFullYear(),
    month: now.getMonth() + 1,
  })

  const { data: vatData, loading: vatLoading, error: vatError, refetch: refetchVAT } = useVAT(period)

  // D-02: redirect non-VAT users
  useEffect(() => {
    if (!profileLoading && profile && !profile.vat_registered) {
      navigate('/dashboard', { replace: true })
    }
  }, [profileLoading, profile, navigate])

  // D-03: prevent flash
  if (profileLoading || !profile) return null
  if (!profile.vat_registered) return null

  // D-04: MST prompt if mst is null
  if (profile.mst === null || profile.mst === undefined) {
    return (
      <div className="max-w-[800px] mx-auto p-6">
        <h1 className="text-lg font-medium text-bep-charcoal mb-6">{t('vat.title')}</h1>
        <MSTPrompt onSaved={refetchProfile} />
      </div>
    )
  }

  // Year options: current year and 2 years back
  const currentYear = new Date().getFullYear()
  const years = [currentYear - 2, currentYear - 1, currentYear]

  function handleExportPDF() {
    if (!vatData) return
    const params = new URLSearchParams({
      year: String(period.year),
      month: String(period.month),
      input: String(Math.round(vatData.inputVAT)),
      output: String(Math.round(vatData.outputVAT)),
      net: String(Math.round(vatData.netVAT)),
    })
    window.open(`/dashboard/vat/print?${params}`, '_blank')
  }

  return (
    <div className="max-w-[800px] mx-auto p-6">
      {/* Page title */}
      <h1 className="text-lg font-medium text-bep-charcoal">{t('vat.title')}</h1>

      {/* Month/Year selector (D-13) */}
      <div className="mt-6">
        <div className="text-xs font-medium text-bep-stone uppercase tracking-wider mb-2">
          {t('vat.period_label')}
        </div>
        <div className="flex gap-2 items-center">
          <select
            value={period.month}
            onChange={e => setPeriod(prev => ({ ...prev, month: Number(e.target.value) }))}
            className="border border-bep-pebble rounded-lg px-3 py-2 text-sm text-bep-charcoal bg-bep-surface focus:outline-none focus:ring-2 focus:ring-bep-turmeric focus:ring-offset-1"
          >
            {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
              <option key={m} value={m}>{t('vat.month_label')} {m}</option>
            ))}
          </select>
          <select
            value={period.year}
            onChange={e => setPeriod(prev => ({ ...prev, year: Number(e.target.value) }))}
            className="border border-bep-pebble rounded-lg px-3 py-2 text-sm text-bep-charcoal bg-bep-surface focus:outline-none focus:ring-2 focus:ring-bep-turmeric focus:ring-offset-1"
          >
            {years.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* VAT Breakdown Table (D-07, D-08) */}
      <div className="mt-6 bg-bep-surface border border-bep-pebble rounded-xl p-4">
        {vatLoading ? (
          <div className="space-y-3">
            <div className="animate-pulse bg-bep-pebble rounded h-[56px]" />
            <div className="animate-pulse bg-bep-pebble rounded h-[56px]" />
            <div className="animate-pulse bg-bep-pebble rounded h-[56px]" />
          </div>
        ) : vatError ? (
          <div className="py-4 text-center">
            <p className="text-sm text-bep-charcoal">{t(vatError)}</p>
            <button
              onClick={refetchVAT}
              className="text-sm text-bep-turmeric mt-2 hover:underline"
            >
              {t('vat.error_retry')}
            </button>
          </div>
        ) : vatData && vatData.inputVAT === 0 && vatData.outputVAT === 0 ? (
          <div className="py-6 text-center">
            <p className="text-sm font-medium text-bep-charcoal">{t('vat.empty_heading')}</p>
            <p className="text-xs text-bep-stone mt-1">{t('vat.empty_body')}</p>
          </div>
        ) : vatData ? (
          <div className="divide-y divide-bep-pebble">
            <VATRow
              primaryLabel={t('vat.input_vat_primary')}
              secondaryLabel={t('vat.input_vat_secondary')}
              amount={vatData.inputVAT}
            />
            <VATRow
              primaryLabel={t('vat.output_vat_primary')}
              secondaryLabel={t('vat.output_vat_secondary')}
              amount={vatData.outputVAT}
            />
            <VATRow
              primaryLabel={t('vat.net_vat_primary')}
              secondaryLabel={t('vat.net_vat_secondary')}
              amount={vatData.netVAT}
            />
          </div>
        ) : null}
      </div>

      {/* Disclaimer banner (D-09, VAT-06) */}
      <div className="bg-bep-cream border border-bep-pebble rounded-lg px-4 py-3 mt-4 flex gap-2 items-start">
        <Info size={14} className="text-bep-turmeric mt-0.5 shrink-0" />
        <p className="text-sm text-bep-charcoal">{t('vat.disclaimer')}</p>
      </div>

      {/* Export PDF button (D-15) */}
      <div className="mt-6">
        <button
          onClick={handleExportPDF}
          disabled={!vatData || vatLoading}
          className="bg-bep-turmeric text-white rounded-lg px-6 py-2.5 text-sm font-medium hover:bg-bep-lacquer transition-colors disabled:bg-bep-pebble disabled:text-bep-stone disabled:cursor-not-allowed"
        >
          {t('vat.export_pdf')}
        </button>
      </div>
    </div>
  )
}
