import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { validateCustomRange } from '../../lib/pnl'
import type { PnLPeriod } from '../../types'

interface PeriodSelectorProps {
  selected: PnLPeriod | null
  onChange: (period: PnLPeriod) => void
}

const FIXED_PERIODS = [
  { key: 'today' as const, labelKey: 'dashboard.period.today' },
  { key: 'this_week' as const, labelKey: 'dashboard.period.this_week' },
  { key: 'this_month' as const, labelKey: 'dashboard.period.this_month' },
  { key: 'last_month' as const, labelKey: 'dashboard.period.last_month' },
]

function isCustom(period: PnLPeriod | null): boolean {
  return period !== null && typeof period === 'object'
}

function isFixedPeriod(period: PnLPeriod | null, key: string): boolean {
  return period === key
}

export function PeriodSelector({ selected, onChange }: PeriodSelectorProps) {
  const { t } = useTranslation()
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')
  const [customError, setCustomError] = useState('')
  // Track whether custom tab is "open" separately from the selected value
  const [customOpen, setCustomOpen] = useState(() => isCustom(selected))

  const handleFixedClick = (key: 'today' | 'this_week' | 'this_month' | 'last_month') => {
    setCustomOpen(false)
    setCustomError('')
    onChange(key)
  }

  const handleCustomClick = () => {
    setCustomOpen(true)
    // If there's already a valid custom range selected, keep it
    // Otherwise initialize with today
    if (!isCustom(selected)) {
      // Don't call onChange yet — wait for valid dates
    }
  }

  const handleDateChange = (start: string, end: string) => {
    setCustomStart(start)
    setCustomEnd(end)
    setCustomError('')

    if (!start || !end) return

    if (!validateCustomRange(start, end)) {
      setCustomError(t('dashboard.period.custom_error'))
      return
    }

    onChange({ start, end })
  }

  const activeButtonClass = 'bg-bep-cream text-bep-turmeric font-medium'
  const inactiveButtonClass =
    'bg-bep-surface border border-bep-pebble text-bep-stone hover:text-bep-turmeric'

  const buttonBase =
    'px-3 py-2 rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-bep-turmeric focus:ring-offset-1'

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        {FIXED_PERIODS.map(({ key, labelKey }) => (
          <button
            key={key}
            type="button"
            onClick={() => handleFixedClick(key)}
            className={`${buttonBase} min-h-[40px] ${
              isFixedPeriod(selected, key) ? activeButtonClass : inactiveButtonClass
            }`}
          >
            {t(labelKey)}
          </button>
        ))}
        <button
          type="button"
          onClick={handleCustomClick}
          className={`${buttonBase} min-h-[40px] ${
            customOpen ? activeButtonClass : inactiveButtonClass
          }`}
        >
          {t('dashboard.period.custom')}
        </button>
      </div>

      {customOpen && (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={customStart}
              onChange={e => handleDateChange(e.target.value, customEnd)}
              className="border border-bep-pebble rounded-lg px-3 py-2 text-sm text-bep-charcoal bg-bep-surface focus:outline-none focus:ring-2 focus:ring-bep-turmeric focus:ring-offset-1"
            />
            <span className="text-sm text-bep-stone">—</span>
            <input
              type="date"
              value={customEnd}
              onChange={e => handleDateChange(customStart, e.target.value)}
              className="border border-bep-pebble rounded-lg px-3 py-2 text-sm text-bep-charcoal bg-bep-surface focus:outline-none focus:ring-2 focus:ring-bep-turmeric focus:ring-offset-1"
            />
          </div>
          {customError && (
            <p className="text-xs text-bep-loss" role="alert">
              {customError}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
