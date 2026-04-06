import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import type { OutletType, LanguagePref } from '../types'
import i18n from '../lib/i18n'

interface FormData {
  business_name: string
  outlet_type: OutletType
  city: string
  vat_registered: boolean
  language_pref: LanguagePref
}

const OUTLET_TYPES: OutletType[] = ['cafe', 'restaurant', 'street_food', 'bakery', 'other']
const TOTAL_STEPS = 4

export default function Onboarding() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<FormData>({
    business_name: '',
    outlet_type: 'cafe',
    city: '',
    vat_registered: false,
    language_pref: 'vi',
  })

  const canAdvance = () => {
    if (step === 1) return data.business_name.trim().length > 0
    if (step === 3) return data.city.trim().length > 0
    return true
  }

  const handleFinish = async () => {
    if (!user) return
    setSubmitting(true)
    setError(null)
    const { error } = await supabase.from('profiles').insert({ id: user.id, ...data })
    if (error) {
      setError(t('auth.error.generic'))
      setSubmitting(false)
      return
    }
    await i18n.changeLanguage(data.language_pref)
    navigate('/dashboard', { replace: true })
  }

  return (
    <div className="min-h-screen bg-bep-rice flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-lg">

        <p className="font-ui text-2xl font-medium text-bep-lacquer text-center mb-8" style={{ letterSpacing: '-0.02em' }}>
          Bếp
        </p>

        <div className="bg-bep-surface border border-bep-pebble rounded-xl p-6">

          {/* Progress bar */}
          <div className="flex gap-1.5 mb-6">
            {Array.from({ length: TOTAL_STEPS }, (_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-colors ${i < step ? 'bg-bep-turmeric' : 'bg-bep-pebble'}`}
              />
            ))}
          </div>

          <p className="text-xs font-medium text-bep-stone uppercase tracking-wider mb-4">
            {t('onboarding.step', { current: step, total: TOTAL_STEPS })}
          </p>

          {/* Step 1 — Business name */}
          {step === 1 && (
            <div className="flex flex-col gap-4">
              <h1 className="text-lg font-medium text-bep-charcoal">{t('onboarding.step1.title')}</h1>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-bep-stone uppercase tracking-wider">
                  {t('onboarding.step1.label')}
                </label>
                <input
                  type="text"
                  autoFocus
                  value={data.business_name}
                  onChange={e => setData(d => ({ ...d, business_name: e.target.value }))}
                  placeholder={t('onboarding.step1.placeholder')}
                  className="w-full bg-bep-surface border border-bep-pebble rounded-lg px-3 py-2 text-sm text-bep-charcoal placeholder:text-bep-stone focus:outline-none focus:border-bep-turmeric transition-colors"
                />
              </div>
            </div>
          )}

          {/* Step 2 — Outlet type */}
          {step === 2 && (
            <div className="flex flex-col gap-4">
              <h1 className="text-lg font-medium text-bep-charcoal">{t('onboarding.step2.title')}</h1>
              <p className="text-sm text-bep-stone">{t('onboarding.step2.label')}</p>
              <div className="flex flex-col gap-2">
                {OUTLET_TYPES.map(type => (
                  <button
                    key={type}
                    onClick={() => setData(d => ({ ...d, outlet_type: type }))}
                    className={`flex items-center justify-between px-4 py-3 rounded-lg border text-sm transition-colors ${
                      data.outlet_type === type
                        ? 'border-bep-turmeric bg-bep-cream text-bep-turmeric font-medium'
                        : 'border-bep-pebble text-bep-charcoal hover:border-bep-turmeric'
                    }`}
                  >
                    {t(`onboarding.outlet.${type}`)}
                    {data.outlet_type === type && (
                      <div className="w-2 h-2 rounded-full bg-bep-turmeric" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3 — City + VAT */}
          {step === 3 && (
            <div className="flex flex-col gap-4">
              <h1 className="text-lg font-medium text-bep-charcoal">{t('onboarding.step3.title')}</h1>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-bep-stone uppercase tracking-wider">
                  {t('onboarding.step3.city_label')}
                </label>
                <input
                  type="text"
                  autoFocus
                  value={data.city}
                  onChange={e => setData(d => ({ ...d, city: e.target.value }))}
                  placeholder={t('onboarding.step3.city_placeholder')}
                  className="w-full bg-bep-surface border border-bep-pebble rounded-lg px-3 py-2 text-sm text-bep-charcoal placeholder:text-bep-stone focus:outline-none focus:border-bep-turmeric transition-colors"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-bep-stone uppercase tracking-wider">
                  {t('onboarding.step3.vat_label')}
                </label>
                <div className="flex gap-2">
                  {([true, false] as const).map(val => (
                    <button
                      key={String(val)}
                      onClick={() => setData(d => ({ ...d, vat_registered: val }))}
                      className={`flex-1 py-2 rounded-lg border text-sm transition-colors ${
                        data.vat_registered === val
                          ? 'border-bep-turmeric bg-bep-cream text-bep-turmeric font-medium'
                          : 'border-bep-pebble text-bep-charcoal hover:border-bep-turmeric'
                      }`}
                    >
                      {val ? t('onboarding.step3.vat_yes') : t('onboarding.step3.vat_no')}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4 — Language */}
          {step === 4 && (
            <div className="flex flex-col gap-4">
              <h1 className="text-lg font-medium text-bep-charcoal">{t('onboarding.step4.title')}</h1>
              <p className="text-sm text-bep-stone">{t('onboarding.step4.label')}</p>
              <div className="flex flex-col gap-2">
                {(['vi', 'en'] as LanguagePref[]).map(lang => (
                  <button
                    key={lang}
                    onClick={() => setData(d => ({ ...d, language_pref: lang }))}
                    className={`flex items-center justify-between px-4 py-3 rounded-lg border text-sm transition-colors ${
                      data.language_pref === lang
                        ? 'border-bep-turmeric bg-bep-cream text-bep-turmeric font-medium'
                        : 'border-bep-pebble text-bep-charcoal hover:border-bep-turmeric'
                    }`}
                  >
                    {t(`onboarding.lang.${lang}`)}
                    {data.language_pref === lang && (
                      <div className="w-2 h-2 rounded-full bg-bep-turmeric" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {error && <p className="text-sm text-bep-loss mt-4">{error}</p>}

          {/* Navigation */}
          <div className="flex justify-between mt-6">
            {step > 1 ? (
              <button
                onClick={() => setStep(s => s - 1)}
                className="bg-transparent border border-bep-pebble hover:border-bep-turmeric hover:text-bep-turmeric text-bep-stone text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              >
                {t('common.back')}
              </button>
            ) : <div />}

            {step < TOTAL_STEPS ? (
              <button
                onClick={() => setStep(s => s + 1)}
                disabled={!canAdvance()}
                className="bg-bep-lacquer hover:bg-bep-turmeric text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-40"
              >
                {t('common.continue')}
              </button>
            ) : (
              <button
                onClick={handleFinish}
                disabled={submitting}
                className="bg-bep-lacquer hover:bg-bep-turmeric text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-40"
              >
                {submitting ? t('common.loading') : t('onboarding.finish')}
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
