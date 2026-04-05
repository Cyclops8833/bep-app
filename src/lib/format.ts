export const formatVND = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount)
}

export const formatVNDShort = (amount: number): string => {
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M ₫`
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)}k ₫`
  return `${amount} ₫`
}
