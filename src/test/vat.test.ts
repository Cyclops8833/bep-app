import { describe, it, expect } from 'vitest'
import { computeVAT, lastDayOfMonth } from '../lib/vat'

describe('computeVAT', () => {
  it('calculates 10% input/output VAT and net correctly', () => {
    const result = computeVAT(42000000, 68000000)
    expect(result.inputVAT).toBe(4200000)
    expect(result.outputVAT).toBe(6800000)
    expect(result.netVAT).toBe(2600000)
  })

  it('handles zero revenue (netVAT is negative)', () => {
    const result = computeVAT(5000000, 0)
    expect(result.inputVAT).toBe(500000)
    expect(result.outputVAT).toBe(0)
    expect(result.netVAT).toBe(-500000)
  })

  it('handles zero costs', () => {
    const result = computeVAT(0, 10000000)
    expect(result.inputVAT).toBe(0)
    expect(result.outputVAT).toBe(1000000)
    expect(result.netVAT).toBe(1000000)
  })

  it('handles both zero', () => {
    const result = computeVAT(0, 0)
    expect(result.inputVAT).toBe(0)
    expect(result.outputVAT).toBe(0)
    expect(result.netVAT).toBe(0)
  })
})

describe('lastDayOfMonth', () => {
  it('returns 2026-02-28 for non-leap February', () => {
    expect(lastDayOfMonth(2026, 2)).toBe('2026-02-28')
  })

  it('returns 2024-02-29 for leap year February', () => {
    expect(lastDayOfMonth(2024, 2)).toBe('2024-02-29')
  })

  it('returns 2026-01-31 for January', () => {
    expect(lastDayOfMonth(2026, 1)).toBe('2026-01-31')
  })

  it('returns 2026-04-30 for April', () => {
    expect(lastDayOfMonth(2026, 4)).toBe('2026-04-30')
  })

  it('returns 2026-12-31 for December', () => {
    expect(lastDayOfMonth(2026, 12)).toBe('2026-12-31')
  })
})
