import { useState } from 'react'
import { useWebSocket } from './hooks/useWebSocket'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Benchmarks from './pages/Benchmarks'
import About from './pages/About'

export default function App() {
  const [activePage, setActivePage] = useState('dashboard')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const ws = useWebSocket()

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard ws={ws} />
      case 'benchmarks':
        return <Benchmarks />
      case 'about':
        return <About />
      default:
        return <Dashboard ws={ws} />
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main content */}
      <div
        className="min-h-screen transition-all duration-300"
        style={{ marginLeft: sidebarCollapsed ? 68 : 220 }}
      >
        <main className="p-6 max-w-[1600px]">
          {renderPage()}
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-200 bg-white py-3 mt-4">
          <div className="px-6 flex items-center justify-between text-xs text-slate-400">
            <span>DNSecure — eBPF + XGBoost ML Detection</span>
            <span>
              Backend: <span className={ws.connected ? 'text-emerald-500' : 'text-red-400'}>localhost:8001</span>
            </span>
          </div>
        </footer>
      </div>
    </div>
  )
}
