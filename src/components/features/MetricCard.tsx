import { formatVNDShort } from '../../lib/format'

interface MetricCardProps {
  label: string
  value: number
  formatter?: (n: number) => string
  valueColor?: string
}

export function MetricCard({ label, value, formatter, valueColor }: MetricCardProps) {
  const format = formatter ?? formatVNDShort
  return (
    <div className="bg-bep-surface border border-bep-pebble rounded-xl p-4">
      <p className="text-xs font-medium text-bep-stone uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-2xl font-medium font-mono tabular-nums ${valueColor || 'text-bep-charcoal'}`}>
        {format(value)}
      </p>
    </div>
  )
}
