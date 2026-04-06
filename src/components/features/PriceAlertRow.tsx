import { AlertTriangle, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { MarginBadge } from '../ui/MarginBadge'
import type { PriceAlert } from '../../types'

interface PriceAlertRowProps {
  alert: PriceAlert
  onDismiss: (ingredientId: string) => void
  dismissError?: string | null
}

export function PriceAlertRow({ alert, onDismiss, dismissError }: PriceAlertRowProps) {
  const { t } = useTranslation()

  return (
    <div className="flex items-start gap-2 py-2">
      <AlertTriangle size={14} className="text-bep-warning mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm text-bep-charcoal">{alert.ingredientName}</span>
          <span className="text-sm text-bep-loss font-mono">
            {t('dashboard.alert.price_rise', { percent: alert.percentRise })}
          </span>
        </div>
        {alert.affectedDishes.length > 0 && (
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-sm text-bep-stone">
              {t('dashboard.alert.affected_dishes', {
                dishes: alert.affectedDishes.map(d => d.name).join(', '),
              })}
            </span>
            {alert.affectedDishes.map(d => (
              <MarginBadge key={d.name} margin={d.margin} />
            ))}
          </div>
        )}
        {dismissError && (
          <p className="text-xs text-bep-loss mt-1">{t('dashboard.error.dismiss_failed')}</p>
        )}
      </div>
      <button
        onClick={() => onDismiss(alert.ingredientId)}
        className="text-bep-stone hover:text-bep-charcoal p-1 shrink-0"
        aria-label={t('dashboard.alert.dismiss')}
      >
        <X size={14} />
      </button>
    </div>
  )
}
