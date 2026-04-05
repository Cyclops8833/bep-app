import { LineChart, Line, ResponsiveContainer } from 'recharts'

interface PriceSparklineProps {
  history: { price: number; recorded_at: string }[]
}

export function PriceSparkline({ history }: PriceSparklineProps) {
  if (history.length < 2) return <span className="text-xs text-bep-stone">—</span>

  const data = [...history]
    .sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime())
    .slice(-10)
    .map(h => ({ price: h.price }))

  return (
    <ResponsiveContainer width={80} height={28}>
      <LineChart data={data}>
        <Line type="monotone" dataKey="price" stroke="#B45309" strokeWidth={1.5} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}
