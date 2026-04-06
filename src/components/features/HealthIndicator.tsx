import { useTranslation } from 'react-i18next'
import type { HealthTier } from '../../types'

interface HealthIndicatorProps {
  tier: HealthTier | null
}

interface TierConfig {
  bg: string
  dot: string
  text: string
  labelKey: string
  sentenceKey: string
}

const TIER_CONFIG: Record<HealthTier, TierConfig> = {
  profitable: {
    bg: 'bg-bep-profit-bg',
    dot: 'bg-bep-profit',
    text: 'text-bep-profit',
    labelKey: 'dashboard.health.profitable',
    sentenceKey: 'dashboard.health.sentence.profitable',
  },
  watch: {
    bg: 'bg-bep-warning-bg',
    dot: 'bg-bep-warning',
    text: 'text-bep-warning',
    labelKey: 'dashboard.health.watch',
    sentenceKey: 'dashboard.health.sentence.watch',
  },
  loss: {
    bg: 'bg-bep-loss-bg',
    dot: 'bg-bep-loss',
    text: 'text-bep-loss',
    labelKey: 'dashboard.health.loss',
    sentenceKey: 'dashboard.health.sentence.loss',
  },
}

export function HealthIndicator({ tier }: HealthIndicatorProps) {
  const { t } = useTranslation()

  if (tier === null) return null

  const { bg, dot, text, labelKey, sentenceKey } = TIER_CONFIG[tier]

  return (
    <div className={`flex items-center gap-2 px-4 py-3 ${bg} rounded-lg`}>
      <div className={`w-2 h-2 rounded-full ${dot}`} />
      <span className={`text-sm font-medium ${text}`}>{t(labelKey)}</span>
      <span className={`text-sm ${text} ml-1`}>{t(sentenceKey)}</span>
    </div>
  )
}
