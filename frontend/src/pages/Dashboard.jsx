import StatusBadge from '../components/StatusBadge'
import TrafficChart from '../components/TrafficChart'
import BlockedIPs from '../components/BlockedIPs'
import LogPanel from '../components/LogPanel'

export default function Dashboard({ ws }) {
  const {
    metrics,
    metricsHistory,
    blockedIps,
    statsLogs,
    iperfLogs,
    connected,
  } = ws

  return (
    <div className="space-y-5">
      {/* Top bar with status */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800">Monitoring Dashboard</h1>
          <p className="text-sm text-slate-400">Real-time eBPF/XDP traffic analysis</p>
        </div>
        <div className="flex items-center gap-4">
          <StatusBadge status={metrics.status} />
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-full px-3 py-1.5">
            <span className={`w-2.5 h-2.5 rounded-full ${connected ? 'bg-emerald-500' : 'bg-red-400 animate-pulse'}`} />
            <span className={`text-xs font-medium ${connected ? 'text-emerald-600' : 'text-red-500'}`}>
              {connected ? 'WebSocket Live' : 'Reconnecting...'}
            </span>
          </div>
        </div>
      </div>

      {/* Live Traffic Chart - Full Width, stock-market style */}
      <TrafficChart data={metricsHistory} status={metrics.status} metrics={metrics} />

      {/* Stats Reader & iPerf Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <LogPanel
          title="Stats Reader Logs"
          logs={statsLogs}
          borderColor="border-amber-300"
          icon="📡"
        />
        <LogPanel
          title="iPerf Live Logs"
          logs={iperfLogs}
          borderColor="border-sky-300"
          icon="🔬"
        />
      </div>

      {/* Blocked IPs - Full Width */}
      <BlockedIPs blockedIps={blockedIps} status={metrics.status} />
    </div>
  )
}
