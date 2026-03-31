const statusConfig = {
  HEALTHY: { bg: 'bg-emerald-50', border: 'border-emerald-400', text: 'text-emerald-700', dot: 'bg-emerald-500', label: 'HEALTHY' },
  MONITORING: { bg: 'bg-blue-50', border: 'border-blue-400', text: 'text-blue-700', dot: 'bg-blue-500', label: 'MONITORING' },
  WARNING: { bg: 'bg-amber-50', border: 'border-amber-400', text: 'text-amber-700', dot: 'bg-amber-500', label: 'WARNING' },
  UNDER_ATTACK: { bg: 'bg-red-50', border: 'border-red-500', text: 'text-red-700', dot: 'bg-red-500', label: 'UNDER ATTACK!' },
  IDLE: { bg: 'bg-slate-50', border: 'border-slate-300', text: 'text-slate-500', dot: 'bg-slate-400', label: 'IDLE' },
}

export default function StatusBadge({ status }) {
  const config = statusConfig[status] || statusConfig.IDLE
  const isAttack = status === 'UNDER_ATTACK'

  return (
    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 ${config.bg} ${config.border} ${isAttack ? 'pulse-attack' : ''}`}>
      <span className={`w-3 h-3 rounded-full ${config.dot} ${isAttack ? 'animate-ping' : ''}`} />
      <span className={`font-bold text-sm tracking-wide ${config.text}`}>
        {config.label}
      </span>
    </div>
  )
}
