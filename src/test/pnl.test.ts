import { describe, it, expect } from 'vitest'
import { periodToRange, computeMetrics, getHealthTier, rankCostDrivers, validateCustomRange } from '../lib/pnl'

// Fix "today" to 2026-04-06 (Monday) for deterministic tests
// Pass as _now parameter to avoid fake timers (which cause runner init issues)
const FIXED_DATE = new Date('2026-04-06T12:00:00.000+07:00') // noon Hanoi time = 2026-04-06 local

describe('periodToRange', () => {
  it('today returns same start and end', () => {
    const { start, end } = periodToRange('today', FIXED_DATE)
    expect(start).toBe('2026-04-06')
    expect(end).toBe('2026-04-06')
  })

  it('this_week returns Monday of current week to today', () => {
    // 2026-04-06 is a Monday
    const { start, end } = periodToRange('this_week', FIXED_DATE)
    expect(start).toBe('2026-04-06')
    expect(end).toBe('2026-04-06')
  })

  it('this_month returns 1st of current month to today', () => {
    const { start, end } = periodToRange('this_month', FIXED_DATE)
    expect(start).toBe('2026-04-01')
    expect(end).toBe('2026-04-06')
  })

  it('last_month returns full previous month', () => {
    const { start, end } = periodToRange('last_month', FIXED_DATE)
    expect(start).toBe('2026-03-01')
    expect(end).toBe('2026-03-31')
  })

  it('custom range passes through unchanged', () => {
    const result = periodToRange({ start: '2026-01-01', end: '2026-01-30' })
    expect(result).toEqual({ start: '2026-01-01', end: '2026-01-30' })
  })
})

describe('computeMetrics', () => {
  it('calculates net profit and margin correctly', () => {
    const result = computeMetrics({ revenue: 10000000, costs: 7000000 })
    expect(result.revenue).toBe(10000000)
    expect(result.costs).toBe(7000000)
    expect(result.netProfit).toBe(3000000)
    expect(result.netMargin).toBe(30)
  })

  it('returns netMargin of 0 when revenue is 0 (not -Infinity or NaN)', () => {
    const result = computeMetrics({ revenue: 0, costs: 5000000 })
    expect(result.netProfit).toBe(-5000000)
    expect(result.netMargin).toBe(0)
    expect(isFinite(result.netMargin)).toBe(true)
    expect(isNaN(result.netMargin)).toBe(false)
  })
})

describe('getHealthTier', () => {
  it('returns profitable for margin > 20', () => {
    expect(getHealthTier(30)).toBe('profitable')
    expect(getHealthTier(21)).toBe('profitable')
  })

  it('returns watch for margin exactly 20', () => {
    expect(getHealthTier(20)).toBe('watch')
  })

  it('returns watch for margin >= 5 and <= 20', () => {
    expect(getHealthTier(15)).toBe('watch')
    expect(getHealthTier(5)).toBe('watch')
  })

  it('returns loss for margin < 5', () => {
    expect(getHealthTier(4)).toBe('loss')
    expect(getHealthTier(0)).toBe('loss')
    expect(getHealthTier(-10)).toBe('loss')
  })
})

describe('rankCostDrivers', () => {
  it('returns top 3 by spend in descending order', () => {
    const input = [
      { ingredientId: 'a', name: 'A', totalSpend: 100 },
      { ingredientId: 'b', name: 'B', totalSpend: 300 },
      { ingredientId: 'c', name: 'C', totalSpend: 200 },
      { ingredientId: 'd', name: 'D', totalSpend: 50 },
    ]
    const result = rankCostDrivers(input)
    expect(result).toHaveLength(3)
    expect(result[0].ingredientId).toBe('b')
    expect(result[1].ingredientId).toBe('c')
    expect(result[2].ingredientId).toBe('a')
  })

  it('returns all items when fewer than 3', () => {
    const input = [
      { ingredientId: 'x', name: 'X', totalSpend: 500 },
    ]
    const result = rankCostDrivers(input)
    expect(result).toHaveLength(1)
  })

  it('does not mutate the original array', () => {
    const input = [
      { ingredientId: 'a', name: 'A', totalSpend: 100 },
      { ingredientId: 'b', name: 'B', totalSpend: 300 },
    ]
    rankCostDrivers(input)
    expect(input[0].ingredientId).toBe('a')
  })
})

describe('validateCustomRange', () => {
  it('returns false for ranges exceeding 90 days', () => {
    expect(validateCustomRange('2026-01-01', '2026-05-01')).toBe(false)
  })

  it('returns true for ranges within 90 days', () => {
    expect(validateCustomRange('2026-01-01', '2026-03-01')).toBe(true)
  })

  it('returns true for exactly 90 days', () => {
    expect(validateCustomRange('2026-01-01', '2026-04-01')).toBe(true)
  })

  it('returns false for 91 days', () => {
    expect(validateCustomRange('2026-01-01', '2026-04-02')).toBe(false)
  })
})
