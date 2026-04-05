export const mockExtractedInvoice = {
  supplier_name: 'Công ty TNHH Thực Phẩm Miền Nam',
  invoice_date: '2026-04-05',
  line_items: [
    { name: 'Thịt bò', quantity: 5, unit: 'kg', unit_price: 280000, line_total: 1400000 },
    { name: 'Hành tây', quantity: 10, unit: 'kg', unit_price: 15000, line_total: 150000 },
  ],
}

export const mockExtractionFailure = {
  ok: false,
  fallback: true,
  error: 'Claude API timeout',
}
