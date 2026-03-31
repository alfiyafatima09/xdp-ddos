import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'

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

export default function TrafficChart({ data, status }) {
  const isAttack = status === 'UNDER_ATTACK'

  // Current values for the live stat boxes
  const latest = data.length > 0 ? data[data.length - 1] : { pps: 0, bps: 0 }
  const prev = data.length > 1 ? data[data.length - 2] : latest
  const ppsDelta = latest.pps - prev.pps
  const bpsDelta = latest.bps - prev.bps

  return (
    <div className={`bg-white rounded-2xl border-2 shadow-sm p-5 h-full transition-colors ${
      isAttack ? 'border-red-400 pulse-attack' : 'border-indigo-200'
    }`}>
      {/* Header row with live stats */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            Live Traffic Monitor
            {isAttack && <span className="text-red-500 animate-pulse text-sm">SPIKE DETECTED</span>}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Dual-axis: Packets/sec (left) & Bytes/sec (right) — last 2 minutes</p>
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

      {/* Chart */}
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="gradPPS" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={isAttack ? '#ef4444' : '#10b981'} stopOpacity={0.35} />
                <stop offset="100%" stopColor={isAttack ? '#ef4444' : '#10b981'} stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="gradBPS" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="time"
              tick={{ fill: '#94a3b8', fontSize: 10 }}
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
              interval="preserveStartEnd"
            />
            {/* Left Y-axis: PPS */}
            <YAxis
              yAxisId="pps"
              orientation="left"
              tick={{ fill: '#10b981', fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatNumber}
              width={50}
              label={{ value: 'PPS', position: 'insideTopLeft', fill: '#10b981', fontSize: 11, fontWeight: 600, offset: -5 }}
            />
            {/* Right Y-axis: BPS */}
            <YAxis
              yAxisId="bps"
              orientation="right"
              tick={{ fill: '#8b5cf6', fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatNumber}
              width={55}
              label={{ value: 'BPS', position: 'insideTopRight', fill: '#8b5cf6', fontSize: 11, fontWeight: 600, offset: -5 }}
            />
            <Tooltip content={<CustomTooltip />} />

            {/* BPS area — right axis */}
            <Area
              yAxisId="bps"
              type="monotone"
              dataKey="bps"
              name="Bytes/s"
              stroke="#8b5cf6"
              strokeWidth={2}
              fill="url(#gradBPS)"
              dot={false}
              animationDuration={300}
            />

            {/* PPS area — left axis */}
            <Area
              yAxisId="pps"
              type="monotone"
              dataKey="pps"
              name="Packets/s"
              stroke={isAttack ? '#ef4444' : '#10b981'}
              strokeWidth={2.5}
              fill="url(#gradPPS)"
              dot={false}
              animationDuration={300}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
