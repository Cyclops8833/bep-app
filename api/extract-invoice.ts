import Anthropic from '@anthropic-ai/sdk'

const ALLOWED_MEDIA_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const
type AllowedMediaType = typeof ALLOWED_MEDIA_TYPES[number]

const EXTRACTION_SYSTEM_PROMPT = `You are an expert at reading Vietnamese supplier invoices (hoá đơn bán hàng).
Extract ALL line items from the invoice image. Include every product listed.

Rules:
- Extract the supplier/vendor name exactly as printed (tên nhà cung cấp)
- Extract the invoice date if visible (ngày lập hoá đơn) in YYYY-MM-DD format
- For each line item: name (tên hàng), quantity (số lượng), unit (đơn vị), unit price (đơn giá), line total (thành tiền)
- All prices are Vietnamese Dong (VND) — return as integers (no decimals)
- If a field is not visible or unclear, omit it or use null
- Return only the structured data — no commentary`

const INVOICE_JSON_SCHEMA = {
  type: 'object',
  properties: {
    supplier_name: { type: ['string', 'null'] },
    invoice_date:  { type: ['string', 'null'], description: 'YYYY-MM-DD format' },
    line_items: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name:       { type: 'string' },
          quantity:   { type: 'number' },
          unit:       { type: 'string' },
          unit_price: { type: 'integer' },
          line_total: { type: 'integer' },
        },
        required: ['name', 'quantity', 'unit', 'unit_price', 'line_total'],
      },
    },
  },
  required: ['line_items'],
}

export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 })
    }

    let body: { storageUrl?: string; userId?: string; mediaType?: string }
    try {
      body = await request.json()
    } catch {
      return Response.json({ ok: false, fallback: true, error: 'Invalid JSON body' }, { status: 400 })
    }

    const { storageUrl, userId, mediaType } = body

    // Validate required fields
    if (!storageUrl || !userId || !mediaType) {
      return Response.json({ ok: false, fallback: true, error: 'Missing required fields: storageUrl, userId, mediaType' }, { status: 400 })
    }

    // T-5-03: Validate media type server-side
    if (!ALLOWED_MEDIA_TYPES.includes(mediaType as AllowedMediaType)) {
      return Response.json({ ok: false, fallback: true, error: `Unsupported file type: ${mediaType}. Use JPEG, PNG, or WEBP.` }, { status: 400 })
    }

    // T-5-04: Validate storageUrl is a Supabase Storage URL (SSRF prevention)
    let parsedUrl: URL
    try {
      parsedUrl = new URL(storageUrl)
    } catch {
      return Response.json({ ok: false, fallback: true, error: 'Invalid storageUrl' }, { status: 400 })
    }
    if (!parsedUrl.hostname.endsWith('.supabase.co')) {
      return Response.json({ ok: false, fallback: true, error: 'storageUrl must be a Supabase Storage URL' }, { status: 400 })
    }

    // T-5-01: API key is server-side only — never VITE_ prefix
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return Response.json({ ok: false, fallback: true, error: 'API not configured' }, { status: 503 })
    }

    try {
      const client = new Anthropic({ apiKey })

      const response = await client.messages.create({
        model:      'claude-sonnet-4-6',
        max_tokens: 2048,
        system:     EXTRACTION_SYSTEM_PROMPT,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'url',
                url:  storageUrl,
              },
            },
            {
              type: 'text',
              text: 'Extract all line items from this supplier invoice.',
            },
          ],
        }],
        output_config: {
          format: {
            type:   'json_schema',
            schema: INVOICE_JSON_SCHEMA,
          },
        },
      } as Parameters<typeof client.messages.create>[0])

      const content = response.content[0]
      if (content.type !== 'text') {
        return Response.json({ ok: false, fallback: true, error: 'Unexpected response type from Claude' }, { status: 502 })
      }

      const extracted = JSON.parse(content.text)
      return Response.json({ ok: true, data: extracted })

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      // T-5-01: Never echo back the API key or internal stack traces
      return Response.json({
        ok:       false,
        fallback: true,
        error:    `Extraction failed: ${message.substring(0, 100)}`,
      }, { status: 502 })
    }
  },
}
