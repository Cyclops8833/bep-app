import { useNavigate } from 'react-router-dom'
import { formatVND } from '../../lib/format'
import type { CostDriver } from '../../types'

interface CostDriverRowProps {
  rank: number
  driver: CostDriver
}

export function CostDriverRow({ rank, driver }: CostDriverRowProps) {
  const navigate = useNavigate()

  return (
    <button
      onClick={() => navigate('/dashboard/ingredients')}
      className="flex items-center w-full py-2 hover:bg-bep-rice rounded transition-colors cursor-pointer"
    >
      <span className="text-xs text-bep-stone font-mono w-6">{rank}.</span>
      <span className="text-sm text-bep-charcoal flex-1 text-left">{driver.name}</span>
      <span className="text-sm text-bep-charcoal font-mono text-right">{formatVND(driver.totalSpend)}</span>
    </button>
  )
}
