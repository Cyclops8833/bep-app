interface MarginBadgeProps {
  margin: number
}

export function MarginBadge({ margin }: MarginBadgeProps) {
  if (margin >= 30) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-bep-profit-bg text-bep-profit font-mono tabular-nums">
        {margin.toFixed(1)}%
      </span>
    )
  }
  if (margin >= 15) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-bep-warning-bg text-bep-warning font-mono tabular-nums">
        {margin.toFixed(1)}%
      </span>
    )
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-bep-loss-bg text-bep-loss font-mono tabular-nums">
      {margin.toFixed(1)}%
    </span>
  )
}
