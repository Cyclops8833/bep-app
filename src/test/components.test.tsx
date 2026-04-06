import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { validateCustomRange, getHealthTier } from '../lib/pnl'
import { MetricCard } from '../components/features/MetricCard'
import { HealthIndicator } from '../components/features/HealthIndicator'

// Mock react-i18next so HealthIndicator (which calls t()) renders without a provider
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}))

describe('PeriodSelector validateCustomRange integration', () => {
  it('rejects ranges exceeding 90 days', () => {
    expect(validateCustomRange('2026-01-01', '2026-06-01')).toBe(false)
  })

  it('accepts ranges within 90 days', () => {
    expect(validateCustomRange('2026-01-01', '2026-03-01')).toBe(true)
  })

  it('accepts exactly 90 days', () => {
    expect(validateCustomRange('2026-01-01', '2026-04-01')).toBe(true)
  })

  it('rejects 91 days', () => {
    expect(validateCustomRange('2026-01-01', '2026-04-02')).toBe(false)
  })
})

describe('getHealthTier boundary coverage', () => {
  it('returns profitable for margin > 20', () => {
    expect(getHealthTier(21)).toBe('profitable')
    expect(getHealthTier(50)).toBe('profitable')
  })

  it('returns watch for margin exactly 20', () => {
    expect(getHealthTier(20)).toBe('watch')
  })

  it('returns watch for margin exactly 5', () => {
    expect(getHealthTier(5)).toBe('watch')
  })

  it('returns loss for margin < 5', () => {
    expect(getHealthTier(4)).toBe('loss')
    expect(getHealthTier(0)).toBe('loss')
    expect(getHealthTier(-10)).toBe('loss')
  })
})

describe('MetricCard smoke', () => {
  it('renders without crash', () => {
    const { container } = render(<MetricCard label="Revenue" value={1000000} />)
    expect(container.textContent).toBeTruthy()
  })

  it('renders with custom valueColor', () => {
    const { container } = render(
      <MetricCard label="Net Profit" value={500000} valueColor="text-bep-profit" />
    )
    expect(container.textContent).toBeTruthy()
  })
})

describe('HealthIndicator smoke', () => {
  it('renders profitable tier without crash', () => {
    const { container } = render(<HealthIndicator tier="profitable" />)
    expect(container.textContent).toBeTruthy()
  })

  it('renders watch tier without crash', () => {
    const { container } = render(<HealthIndicator tier="watch" />)
    expect(container.textContent).toBeTruthy()
  })

  it('renders loss tier without crash', () => {
    const { container } = render(<HealthIndicator tier="loss" />)
    expect(container.textContent).toBeTruthy()
  })

  it('renders null tier without crash', () => {
    const { container } = render(<HealthIndicator tier={null} />)
    expect(container.innerHTML).toBe('')
  })
})
