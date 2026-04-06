import { ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useTranslation } from 'react-i18next'
import { CHART_COLORS, chartDefaults } from '../../lib/chartConfig'
import { formatVND, formatVNDShort } from '../../lib/format'
import type { DailyPoint } from '../../types'

function PnLTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ dataKey: string; color: string; value: number }>; label?: string }) {
  const { t } = useTranslation()
  if (!active || !payload?.length) return null
  const parts = (label as string).split('-')
  const dateLabel = `${parts[2]}/${parts[1]}`
  return (
    <div className="bg-bep-surface border border-bep-pebble rounded-lg shadow-sm px-3 py-2">
      <p className="text-xs text-bep-charcoal mb-1">{dateLabel}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="text-xs" style={{ color: p.color }}>
          {p.dataKey === 'revenue' ? t('dashboard.metric.revenue') : t('dashboard.metric.costs')}: {formatVND(p.value)}
        </p>
      ))}
    </div>
  )
}

export function TrendChart({ data }: { data: DailyPoint[] }) {
  const { t } = useTranslation()
  const isSinglePoint = data.length === 1

  if (data.length === 0) {
    return (
      <div className="bg-bep-surface border border-bep-pebble rounded-xl p-6">
        <h2 className="text-sm font-medium text-bep-charcoal mb-4">
          {t('dashboard.chart.title')}
        </h2>
        <div className="flex items-center justify-center h-[240px]">
          <p className="text-sm text-bep-stone">{t('dashboard.empty.no_data')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-bep-surface border border-bep-pebble rounded-xl p-6">
      <h2 className="text-sm font-medium text-bep-charcoal mb-4">
        {t('dashboard.chart.title')}
      </h2>
      <ResponsiveContainer width="100%" height={240}>
        <ComposedChart data={data} style={chartDefaults.style}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={chartDefaults.grid.stroke}
            vertical={false}
          />
          <XAxis
            dataKey="date"
            tick={{ ...chartDefaults.tick }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(d: string) => {
              const parts = d.split('-')
              return `${parts[2]}/${parts[1]}`
            }}
          />
          <YAxis
            tick={{ ...chartDefaults.tick }}
            axisLine={false}
            tickLine={false}
            tickFormatter={formatVNDShort}
            width={60}
          />
          {/* Areas first — render behind lines */}
          <Area
            dataKey="revenue"
            fill="rgba(180,83,9,0.10)"
            stroke="none"
            type="monotone"
          />
          <Area
            dataKey="cost"
            fill="rgba(220,38,38,0.10)"
            stroke="none"
            type="monotone"
          />
          {/* Lines on top */}
          <Line
            dataKey="revenue"
            stroke={CHART_COLORS.revenue}
            strokeWidth={2}
            dot={isSinglePoint ? { r: 4, fill: CHART_COLORS.revenue } : false}
            type="monotone"
          />
          <Line
            dataKey="cost"
            stroke={CHART_COLORS.cost}
            strokeWidth={2}
            dot={isSinglePoint ? { r: 4, fill: CHART_COLORS.cost } : false}
            type="monotone"
          />
          <Tooltip content={<PnLTooltip />} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
