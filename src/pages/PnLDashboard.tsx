import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { usePnL } from '../hooks/usePnL'
import { PeriodSelector } from '../components/features/PeriodSelector'
import { MetricCard } from '../components/features/MetricCard'
import { HealthIndicator } from '../components/features/HealthIndicator'
import type { PnLPeriod } from '../types'

export default function PnLDashboard() {
  const { t } = useTranslation()
  const [period, setPeriod] = useState<PnLPeriod | null>(null)
  const { metrics, healthTier, loading, error, refetch } = usePnL(period)

  const isEmpty =
    !loading &&
    !error &&
    metrics !== null &&
    metrics.revenue === 0 &&
    metrics.costs === 0

  return (
    <div className="max-w-[1200px] mx-auto p-6 bg-bep-rice">
      <h1 className="text-lg font-medium text-bep-charcoal mb-4">{t('dashboard.title')}</h1>

      {/* Above-fold band */}
      <div className="flex flex-col gap-4">
        <PeriodSelector selected={period} onChange={setPeriod} />

        {/* Error state */}
        {error && (
          <div className="flex items-center gap-3 px-4 py-3 bg-bep-loss-bg rounded-lg">
            <span className="text-sm text-bep-loss">{t('dashboard.error.fetch_failed')}</span>
            <button
              onClick={refetch}
              className="text-sm font-medium text-bep-loss underline"
            >
              {t('dashboard.error.retry')}
            </button>
          </div>
        )}

        {/* Loading skeletons */}
        {loading && (
          <>
            <div className="h-10 w-full animate-pulse bg-bep-pebble rounded-xl" />
            <div className="grid grid-cols-3 gap-3">
              <div className="animate-pulse bg-bep-pebble rounded-xl h-[88px]" />
              <div className="animate-pulse bg-bep-pebble rounded-xl h-[88px]" />
              <div className="animate-pulse bg-bep-pebble rounded-xl h-[88px]" />
            </div>
          </>
        )}

        {/* Data loaded */}
        {!loading && !error && metrics !== null && (
          <>
            <HealthIndicator tier={healthTier} />

            {/* Metric cards — fixed order: Revenue → Costs → Net Profit */}
            <div className="grid grid-cols-3 gap-3">
              <MetricCard
                label={t('dashboard.metric.revenue')}
                value={metrics.revenue}
              />
              <MetricCard
                label={t('dashboard.metric.costs')}
                value={metrics.costs}
              />
              <MetricCard
                label={t('dashboard.metric.net_profit')}
                value={metrics.netProfit}
                valueColor={metrics.netProfit >= 0 ? 'text-bep-profit' : 'text-bep-loss'}
              />
            </div>

            {/* Empty state notice (below metric cards — cards still show 0 values) */}
            {isEmpty && (
              <div className="px-4 py-3 bg-bep-surface border border-bep-pebble rounded-lg">
                <p className="text-sm font-medium text-bep-charcoal mb-1">
                  {t('dashboard.empty.no_data')}
                </p>
                <p className="text-sm text-bep-stone">
                  {t('dashboard.empty.no_data_body')}
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Lower grid — placeholder slots for Plan 03 */}
      <div className="grid grid-cols-[3fr_2fr] gap-6 mt-8">
        {/* Chart card placeholder (Plan 03 replaces) */}
        <div className="bg-bep-surface border border-bep-pebble rounded-xl p-6 h-[300px]" />
        {/* Cost intelligence placeholder (Plan 03/04 replaces) */}
        <div className="bg-bep-surface border border-bep-pebble rounded-xl p-4 h-[300px]" />
      </div>
    </div>
  )
}
