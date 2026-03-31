function formatNumber(num) {
  if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M'
  if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K'
  return num.toFixed(0)
}

export default function FlowTable({ flows }) {
  return (
    <div className="bg-white rounded-2xl border-2 border-teal-300 shadow-sm p-5 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">👥</span>
        <h2 className="text-lg font-bold text-slate-800">Live User Stats</h2>
        <span className="ml-auto text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full font-semibold">
          {flows.length} flows
        </span>
      </div>

      <div className="flex-1 overflow-y-auto log-container max-h-[300px]">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-slate-400 uppercase tracking-wider border-b border-slate-100">
              <th className="text-left py-2 px-2 font-medium">IP Address</th>
              <th className="text-right py-2 px-2 font-medium">PPS</th>
              <th className="text-right py-2 px-2 font-medium">BPS</th>
              <th className="text-center py-2 px-2 font-medium">Verdict</th>
              <th className="text-center py-2 px-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {flows.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-slate-300 text-sm">
                  No active flows
                </td>
              </tr>
            ) : (
              flows.map((flow, i) => {
                const isAttack = flow.verdict === 'ATTACK' || flow.blocked
                return (
                  <tr
                    key={flow.ip_address || i}
                    className={`border-b border-slate-50 transition-colors ${
                      isAttack ? 'bg-red-50 hover:bg-red-100' : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="py-2 px-2">
                      <span className={`font-mono text-sm font-medium ${isAttack ? 'text-red-600' : 'text-slate-700'}`}>
                        {flow.ip_address || 'N/A'}
                      </span>
                    </td>
                    <td className="text-right py-2 px-2 font-mono text-sm text-slate-600">
                      {formatNumber(flow.pps || 0)}
                    </td>
                    <td className="text-right py-2 px-2 font-mono text-sm text-slate-600">
                      {formatNumber(flow.bps || 0)}
                    </td>
                    <td className="text-center py-2 px-2">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold ${
                        isAttack
                          ? 'bg-red-100 text-red-700 border border-red-200'
                          : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                      }`}>
                        {flow.verdict || 'NORMAL'}
                      </span>
                    </td>
                    <td className="text-center py-2 px-2">
                      {flow.blocked ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600">
                          <span className="w-2 h-2 rounded-full bg-red-500" />
                          BLOCKED
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          PASS
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
