import { describe, it, expect, vi, beforeAll } from 'vitest'

// Stub env var before any imports
vi.stubEnv('ANTHROPIC_API_KEY', 'test-key')

// Create a mutable spy for messages.create so individual tests can override it
const mockCreate = vi.fn().mockResolvedValue({
  content: [{
    type: 'text',
    text: JSON.stringify({
      supplier_name: 'Test Supplier',
      invoice_date:  '2026-04-05',
      line_items: [
        { name: 'Thịt bò', quantity: 5, unit: 'kg', unit_price: 280000, line_total: 1400000 }
      ],
    }),
  }],
})

// Mock the @anthropic-ai/sdk before importing the handler
vi.mock('@anthropic-ai/sdk', () => ({
  default: vi.fn().mockImplementation(function () {
    return { messages: { create: mockCreate } }
  }),
}))

describe('extract-invoice API route', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let handler: any

  const VALID_BODY = {
    storageUrl: 'https://project.supabase.co/storage/v1/object/sign/invoices/user/img.jpg',
    userId:     'user-1',
    mediaType:  'image/jpeg',
  }

  beforeAll(async () => {
    const mod = await import('../../api/extract-invoice')
    handler = mod.default
  })

  it('returns structured JSON matching InvoiceExtraction schema on valid image', async () => {
    mockCreate.mockResolvedValueOnce({
      content: [{
        type: 'text',
        text: JSON.stringify({
          supplier_name: 'Test Supplier',
          invoice_date:  '2026-04-05',
          line_items: [
            { name: 'Thịt bò', quantity: 5, unit: 'kg', unit_price: 280000, line_total: 1400000 }
          ],
        }),
      }],
    })
    const req = new Request('http://localhost/api/extract-invoice', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(VALID_BODY),
    })
    const res  = await handler.fetch(req)
    const body = await res.json()
    expect(body.ok).toBe(true)
    expect(body.data.line_items).toHaveLength(1)
    expect(body.data.line_items[0].name).toBe('Thịt bò')
  })

  it('returns { ok: false, fallback: true } on Claude API failure — not a 500', async () => {
    mockCreate.mockRejectedValueOnce(new Error('API timeout'))
    const req = new Request('http://localhost/api/extract-invoice', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(VALID_BODY),
    })
    const res  = await handler.fetch(req)
    const body = await res.json()
    expect(body.ok).toBe(false)
    expect(body.fallback).toBe(true)
    expect(res.status).not.toBe(500)
  })

  it('rejects non-image MIME types with 400', async () => {
    const req = new Request('http://localhost/api/extract-invoice', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ ...VALID_BODY, mediaType: 'application/pdf' }),
    })
    const res = await handler.fetch(req)
    expect(res.status).toBe(400)
  })

  it('rejects storageUrl not on supabase.co domain with 400', async () => {
    const req = new Request('http://localhost/api/extract-invoice', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ ...VALID_BODY, storageUrl: 'https://evil.com/image.jpg' }),
    })
    const res = await handler.fetch(req)
    expect(res.status).toBe(400)
  })
})
