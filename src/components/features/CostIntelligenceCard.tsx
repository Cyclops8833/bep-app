import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { CostDriverRow } from './CostDriverRow'
import type { CostDriver } from '../../types'

interface CostIntelligenceCardProps {
  costDrivers: CostDriver[]
  alerts?: ReactNode
}

export function CostIntelligenceCard({ costDrivers, alerts }: CostIntelligenceCardProps) {
  const { t } = useTranslation()

  return (
    <div className="bg-bep-surface border border-bep-pebble rounded-xl p-4">
      <h2 className="text-sm font-medium text-bep-charcoal mb-3">
        {t('dashboard.cost_intelligence.title')}
      </h2>

      {/* Alert section — only renders when alerts prop has content */}
      {alerts && (
        <>
          {alerts}
          <div className="border-t border-bep-pebble my-4" />
        </>
      )}

      {/* Cost Drivers section */}
      <p className="text-xs font-medium text-bep-stone uppercase tracking-wider mb-2">
        {t('dashboard.cost_intelligence.drivers_section')}
      </p>
      {costDrivers.length > 0 ? (
        costDrivers.map((driver, i) => (
          <CostDriverRow key={driver.ingredientId} rank={i + 1} driver={driver} />
        ))
      ) : (
        <p className="text-sm text-bep-stone">
          {t('dashboard.empty.no_cost_drivers')}
        </p>
      )}
    </div>
  )
}
