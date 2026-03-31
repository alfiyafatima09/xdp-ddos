function formatNumber(num) {
  if (num >= 1e6) return (num / 1e6).toFixed(2) + ' M'
  if (num >= 1e3) return (num / 1e3).toFixed(2) + ' K'
  return num.toFixed(0)
}

const cards = [
  {
    key: 'pps',
    label: 'Packets / sec',
    icon: '⚡',
    border: 'border-cyan-300',
    bg: 'bg-cyan-50',
    accent: 'text-cyan-700',
    format: v => formatNumber(v),
  },
  {
    key: 'bps',
    label: 'Bytes / sec',
    icon: '📊',
    border: 'border-purple-300',
    bg: 'bg-purple-50',
    accent: 'text-purple-700',
    format: v => formatNumber(v),
  },
  {
    key: 'flows',
    label: 'Active Flows',
    icon: '🌐',
    border: 'border-emerald-300',
    bg: 'bg-emerald-50',
    accent: 'text-emerald-700',
    format: v => v.toString(),
  },
  {
    key: 'blocked',
    label: 'Blocked IPs',
    icon: '🛡️',
    border: 'border-rose-300',
    bg: 'bg-rose-50',
    accent: 'text-rose-700',
    format: v => v.toString(),
  },
]

export default function MetricCards({ metrics, flowCount, blockedCount }) {
  const values = {
    pps: metrics.pps || 0,
    bps: metrics.bps || 0,
    flows: flowCount,
    blocked: blockedCount,
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(card => (
        <div
          key={card.key}
          className={`${card.bg} border-2 ${card.border} rounded-2xl p-4 transition-all hover:shadow-md hover:scale-[1.02]`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">{card.icon}</span>
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{card.label}</span>
          </div>
          <p className={`text-3xl font-extrabold ${card.accent} font-mono`}>
            {card.format(values[card.key])}
          </p>
        </div>
      ))}
    </div>
  )
}
