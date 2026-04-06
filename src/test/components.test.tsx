import { describe, it, expect } from 'vitest'
import { validateCustomRange, getHealthTier } from '../lib/pnl'

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

// Smoke tests for components created in Plan 07-02.
// These use dynamic imports so the file compiles even before 07-02 runs.
// Plan 07-02 executor: once MetricCard and HealthIndicator exist, convert
// these to static imports and add render assertions.

describe('MetricCard smoke', () => {
  it.todo('renders without crash — pending 07-02 creating MetricCard')
})

describe('HealthIndicator smoke', () => {
  it.todo('renders without crash — pending 07-02 creating HealthIndicator')
})
