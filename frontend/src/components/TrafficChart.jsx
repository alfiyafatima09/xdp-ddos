import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

function formatNumber(num) {
  if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M'
  if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K'
  return num.toFixed(0)
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white/95 backdrop-blur-sm border border-slate-200 rounded-xl p-3 shadow-xl">
      <p className="text-xs text-slate-400 mb-1.5 font-medium">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-sm font-semibold" style={{ color: entry.color }}>
          {entry.name}: {formatNumber(entry.value)}
        </p>
      ))}
    </div>
  )
}

function SingleChart({ data, dataKey, color, gradientId, name, attackColor }) {
  const allZero = data.length === 0 || data.every(d => (d[dataKey] || 0) === 0)
  const stroke = attackColor || color

  return (
    <div style={{ height: 160, position: 'relative' }}>
      {allZero && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', zIndex: 10 }}>
          <span className="text-xs text-slate-300 italic">Waiting for traffic…</span>
        </div>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={stroke} stopOpacity={0.35} />
              <stop offset="100%" stopColor={stroke} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis
            dataKey="time"
            tick={{ fill: '#94a3b8', fontSize: 9 }}
            tickLine={false}
            axisLine={{ stroke: '#e2e8f0' }}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={[0, 'auto']}
            tick={{ fill: stroke, fontSize: 9 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={formatNumber}
            width={48}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey={dataKey}
            name={name}
            stroke={stroke}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export default function TrafficChart({ data, status, metrics }) {
  const isAttack = status === 'UNDER_ATTACK'

  const latest = metrics
    ? { pps: metrics.pps || 0, bps: metrics.bps || 0 }
    : data.length > 0 ? data[data.length - 1] : { pps: 0, bps: 0 }
  const prev = data.length > 1 ? data[data.length - 2] : latest
  const ppsDelta = (latest.pps || 0) - (prev.pps || 0)
  const bpsDelta = (latest.bps || 0) - (prev.bps || 0)

  return (
    <div className={`bg-white rounded-2xl border-2 shadow-sm p-5 transition-colors ${
      isAttack ? 'border-red-400 pulse-attack' : 'border-indigo-200'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            Live Traffic Monitor
            {isAttack && <span className="text-red-500 animate-pulse text-sm ml-1">SPIKE DETECTED</span>}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Packets/sec & Bytes/sec — last 2 minutes</p>
        </div>

        {/* Live stat pills */}
        <div className="flex items-center gap-3">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-1.5 text-right">
            <p className="text-[10px] text-emerald-500 font-bold uppercase">PPS</p>
            <p className="text-lg font-extrabold text-emerald-700 font-mono leading-tight">{formatNumber(latest.pps)}</p>
            <p className={`text-[10px] font-bold ${ppsDelta >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
              {ppsDelta >= 0 ? '+' : ''}{formatNumber(ppsDelta)}
            </p>
          </div>
          <div className="bg-violet-50 border border-violet-200 rounded-xl px-3 py-1.5 text-right">
            <p className="text-[10px] text-violet-500 font-bold uppercase">BPS</p>
            <p className="text-lg font-extrabold text-violet-700 font-mono leading-tight">{formatNumber(latest.bps)}</p>
            <p className={`text-[10px] font-bold ${bpsDelta >= 0 ? 'text-violet-500' : 'text-red-500'}`}>
              {bpsDelta >= 0 ? '+' : ''}{formatNumber(bpsDelta)}
            </p>
          </div>
          <div className={`rounded-xl px-3 py-1.5 text-center border ${
            isAttack
              ? 'bg-red-50 border-red-300'
              : status === 'MONITORING'
                ? 'bg-blue-50 border-blue-200'
                : 'bg-slate-50 border-slate-200'
          }`}>
            <p className="text-[10px] text-slate-400 font-bold uppercase">Status</p>
            <p className={`text-sm font-extrabold leading-tight ${
              isAttack ? 'text-red-600' : status === 'MONITORING' ? 'text-blue-600' : 'text-slate-500'
            }`}>{status}</p>
          </div>
        </div>
      </div>

      {/* PPS chart */}
      <div className="mb-3">
        <p className="text-xs font-semibold text-emerald-600 mb-1">Packets / second (PPS)</p>
        <SingleChart
          data={data}
          dataKey="pps"
          color="#10b981"
          gradientId="gradPPS"
          name="Packets/s"
          attackColor={isAttack ? '#ef4444' : undefined}
        />
      </div>

      {/* BPS chart */}
      <div>
        <p className="text-xs font-semibold text-violet-600 mb-1">Bytes / second (BPS)</p>
        <SingleChart
          data={data}
          dataKey="bps"
          color="#8b5cf6"
          gradientId="gradBPS"
          name="Bytes/s"
        />
      </div>
    </div>
  )
}
