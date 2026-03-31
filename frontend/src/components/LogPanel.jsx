import { useEffect, useRef } from 'react'

export default function LogPanel({ title, logs, borderColor, icon }) {
  const containerRef = useRef(null)

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [logs])

  const logLines = Array.isArray(logs) ? logs : (typeof logs === 'string' ? logs.split('\n') : [])

  return (
    <div className={`bg-white rounded-2xl border-2 ${borderColor} shadow-sm p-5 h-full flex flex-col`}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">{icon}</span>
        <h2 className="text-lg font-bold text-slate-800">{title}</h2>
        <span className="ml-auto text-xs text-slate-400 font-mono">
          {logLines.length} lines
        </span>
      </div>

      <div
        ref={containerRef}
        className="flex-1 bg-slate-900 rounded-xl p-3 overflow-y-auto log-container max-h-[300px] min-h-[200px]"
      >
        {logLines.length === 0 ? (
          <p className="text-slate-500 text-xs font-mono">Waiting for logs...</p>
        ) : (
          logLines.map((line, i) => (
            <div
              key={i}
              className="text-xs font-mono leading-5 hover:bg-slate-800/50 px-1 rounded transition-colors"
            >
              <span className="text-slate-500 select-none mr-2">{String(i + 1).padStart(3, ' ')}</span>
              <span className={getLogColor(line)}>{line}</span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function getLogColor(line) {
  if (!line) return 'text-slate-400'
  const lower = line.toLowerCase()
  if (lower.includes('attack') || lower.includes('blocked') || lower.includes('drop'))
    return 'text-red-400'
  if (lower.includes('warning') || lower.includes('warn'))
    return 'text-amber-400'
  if (lower.includes('benign') || lower.includes('normal') || lower.includes('pass'))
    return 'text-emerald-400'
  if (lower.includes('error') || lower.includes('fail'))
    return 'text-rose-500'
  return 'text-slate-300'
}
