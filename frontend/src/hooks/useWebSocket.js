import { useState, useEffect, useRef, useCallback } from 'react'

const API_BASE = 'http://localhost:8001'
const WS_URL = 'ws://localhost:8001/ws/metrics'

export function useWebSocket() {
  const [metrics, setMetrics] = useState({ pps: 0, bps: 0, timestamp: 0, status: 'IDLE' })
  const [metricsHistory, setMetricsHistory] = useState([])
  const [flows, setFlows] = useState([])
  const [blockedIps, setBlockedIps] = useState([])
  const [statsLogs, setStatsLogs] = useState([])
  const [iperfLogs, setIperfLogs] = useState([])
  const [connected, setConnected] = useState(false)
  const wsRef = useRef(null)
  const reconnectTimer = useRef(null)

  // ── Push a metrics snapshot into the rolling history ──
  const pushHistory = useCallback((m) => {
    setMetricsHistory(prev => {
      const point = {
        time: new Date(m.timestamp * 1000).toLocaleTimeString(),
        pps: m.pps,
        bps: m.bps,
      }
      const next = [...prev, point]
      return next.slice(-120) // keep last 2 min
    })
  }, [])

  // ── WebSocket connection ──
  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return

    const ws = new WebSocket(WS_URL)
    wsRef.current = ws

    ws.onopen = () => {
      setConnected(true)
      if (reconnectTimer.current) {
        clearTimeout(reconnectTimer.current)
        reconnectTimer.current = null
      }
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)

        // WS broadcast shape from backend:
        // { type, metrics, top_flows, blocked_count, logs, timestamp }
        if (data.metrics) {
          setMetrics(data.metrics)
          pushHistory(data.metrics)
        }

        if (data.top_flows) {
          setFlows(data.top_flows)
        }

        // logs from WS are combined; we still poll REST for split stats/iperf
      } catch (e) {
        console.error('WS parse error:', e)
      }
    }

    ws.onclose = () => {
      setConnected(false)
      reconnectTimer.current = setTimeout(connect, 3000)
    }

    ws.onerror = () => {
      ws.close()
    }
  }, [pushHistory])

  useEffect(() => {
    connect()
    return () => {
      if (wsRef.current) wsRef.current.close()
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current)
    }
  }, [connect])

  // ── REST polling for data not in WS broadcast ──
  // Polls every 2s: blocked IPs, stats logs, iperf logs
  // Also polls metrics+flows as fallback when WS is disconnected
  useEffect(() => {
    let active = true

    const poll = async () => {
      if (!active) return
      try {
        // Always poll these (not in WS broadcast)
        const [blockedRes, statsRes, iperfRes] = await Promise.all([
          fetch(`${API_BASE}/api/blocked-ips?lines=200`).then(r => r.json()).catch(() => null),
          fetch(`${API_BASE}/api/read-stats?lines=80`).then(r => r.json()).catch(() => null),
          fetch(`${API_BASE}/api/read-iperf?lines=80`).then(r => r.json()).catch(() => null),
        ])

        if (!active) return

        // blocked_ips endpoint returns { blocked_ips: ["ts | ip", ...] }
        if (blockedRes?.blocked_ips) {
          const parsed = blockedRes.blocked_ips.map(line => {
            const parts = line.split('|').map(s => s.trim())
            return {
              ip_address: parts[1] || parts[0] || 'Unknown',
              timestamp: parts[0] || '',
              reason: 'DDoS Attack Detected',
            }
          })
          setBlockedIps(parsed)
        }

        // stats log: { lines: ["...", ...] }
        if (statsRes?.lines) {
          setStatsLogs(statsRes.lines)
        }

        // iperf log: { lines: ["...", ...] }
        if (iperfRes?.lines) {
          setIperfLogs(iperfRes.lines)
        }

        // Fallback: if WS is down, also poll metrics + flows
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
          const [metricsRes, flowsRes] = await Promise.all([
            fetch(`${API_BASE}/api/metrics`).then(r => r.json()).catch(() => null),
            fetch(`${API_BASE}/api/flows?limit=50`).then(r => r.json()).catch(() => null),
          ])

          if (!active) return

          if (metricsRes) {
            setMetrics(metricsRes)
            pushHistory(metricsRes)
          }

          if (flowsRes?.flows) {
            setFlows(flowsRes.flows)
          }
        }
      } catch (e) {
        // silent
      }
    }

    poll()
    const interval = setInterval(poll, 2000)
    return () => {
      active = false
      clearInterval(interval)
    }
  }, [pushHistory])

  return {
    metrics,
    metricsHistory,
    flows,
    blockedIps,
    statsLogs,
    iperfLogs,
    connected,
  }
}
