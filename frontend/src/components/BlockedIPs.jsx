export default function BlockedIPs({ blockedIps, status }) {
  const isAttack = status === 'UNDER_ATTACK'

  const handleDownload = () => {
    const lines = blockedIps.map(ip => {
      const addr = typeof ip === 'string' ? ip : ip.ip_address || ip.ip || ''
      const time = typeof ip === 'string' ? '' : ip.timestamp || ''
      const reason = typeof ip === 'string' ? '' : ip.reason || ''
      return `${addr}\t${time}\t${reason}`
    })
    const content = 'IP Address\tTimestamp\tReason\n' + lines.join('\n')
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `blocked_ips_${new Date().toISOString().slice(0, 19)}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className={`bg-white rounded-2xl border-2 ${isAttack ? 'border-red-400 pulse-attack' : 'border-rose-300'} shadow-sm p-5 h-full flex flex-col`}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            {isAttack && <span className="text-red-500 animate-pulse text-xl">🚨</span>}
            {isAttack ? 'UNDER ATTACK!' : 'Blocked IPs'}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {blockedIps.length} IP{blockedIps.length !== 1 ? 's' : ''} blocked
          </p>
        </div>
        <button
          onClick={handleDownload}
          disabled={blockedIps.length === 0}
          className="px-3 py-1.5 bg-rose-500 hover:bg-rose-600 disabled:bg-slate-300 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download
        </button>
      </div>

      <div className="flex-1 overflow-y-auto log-container max-h-[300px] space-y-1.5">
        {blockedIps.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-300 text-sm">
            No blocked IPs
          </div>
        ) : (
          blockedIps.map((ip, i) => {
            const addr = typeof ip === 'string' ? ip : ip.ip_address || ip.ip || 'Unknown'
            const time = typeof ip === 'string' ? '' : ip.timestamp || ''
            const reason = typeof ip === 'string' ? '' : ip.reason || ''
            return (
              <div
                key={addr + i}
                className="flex items-center justify-between px-3 py-2 bg-red-50 border border-red-200 rounded-lg group hover:bg-red-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="font-mono text-sm font-semibold text-red-700">{addr}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-red-400">
                  {reason && <span>{reason}</span>}
                  {time && <span>{time}</span>}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
