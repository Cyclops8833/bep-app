import { describe, it } from 'vitest'

describe('extract-invoice API route', () => {
  it.todo('returns structured JSON matching InvoiceExtraction schema on valid image')
  it.todo('returns { ok: false, fallback: true } on Claude API failure — not a 500')
  it.todo('rejects non-image MIME types with 400')
  it.todo('rejects storageUrl not on supabase.co domain with 400')
})
