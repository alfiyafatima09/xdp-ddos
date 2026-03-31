const techStack = [
  { name: 'XDP / eBPF', desc: 'Kernel-space packet filtering at the NIC driver level', color: 'bg-red-100 text-red-700 border-red-200' },
  { name: 'C (XDP Program)', desc: 'High-performance packet processing compiled with LLVM/Clang', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { name: 'XGBoost ML', desc: 'Binary classifier trained on PPS & BPS features for DDoS detection', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  { name: 'Python', desc: 'Userspace monitoring, ML inference, and backend API', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  { name: 'FastAPI', desc: 'Real-time REST + WebSocket monitoring backend', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { name: 'React + Vite', desc: 'Modern frontend dashboard with live data visualization', color: 'bg-cyan-100 text-cyan-700 border-cyan-200' },
  { name: 'bpftool', desc: 'Query and update BPF maps from userspace', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  { name: 'iperf3', desc: 'Network traffic generation for testing and benchmarking', color: 'bg-pink-100 text-pink-700 border-pink-200' },
]

const pipelineSteps = [
  {
    step: '1',
    title: 'Incoming Traffic',
    desc: 'Network packets arrive at the NIC (Network Interface Card)',
    icon: '🌐',
    color: 'border-sky-400 bg-sky-50',
  },
  {
    step: '2',
    title: 'XDP Hook (Kernel)',
    desc: 'eBPF program intercepts packets before the kernel network stack. Blocked IPs are dropped instantly with XDP_DROP.',
    icon: '⚡',
    color: 'border-amber-400 bg-amber-50',
  },
  {
    step: '3',
    title: 'Stats Collection',
    desc: 'Per-IP packet count and byte count are recorded in BPF hash maps (stats_map) in kernel space.',
    icon: '📊',
    color: 'border-indigo-400 bg-indigo-50',
  },
  {
    step: '4',
    title: 'ML Inference',
    desc: 'stats_reader.py polls stats_map every second, computes PPS & BPS, and feeds them to the XGBoost model for classification.',
    icon: '🧠',
    color: 'border-violet-400 bg-violet-50',
  },
  {
    step: '5',
    title: 'Attack Detection',
    desc: 'If the model predicts ATTACK (label=1), the source IP is added to blocklist_map and logged to blocked_ips.log.',
    icon: '🛡️',
    color: 'border-red-400 bg-red-50',
  },
  {
    step: '6',
    title: 'Real-time Dashboard',
    desc: 'FastAPI backend reads BPF maps and logs, broadcasting live metrics via WebSocket to the React frontend.',
    icon: '📡',
    color: 'border-emerald-400 bg-emerald-50',
  },
]

export default function About() {
  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="bg-slate-900 rounded-2xl p-8 text-white shadow-xl">
        <h1 className="text-3xl font-extrabold tracking-tight">DNSecure</h1>
        <p className="text-slate-300 mt-2 max-w-2xl text-lg leading-relaxed">
          A kernel-level DDoS detection and mitigation system combining <strong className="text-white">eBPF/XDP</strong> for
          wire-speed packet filtering with <strong className="text-white">XGBoost machine learning</strong> for intelligent
          attack classification.
        </p>
        <div className="flex gap-4 mt-5">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2">
            <p className="text-xs text-slate-400">Detection</p>
            <p className="font-bold text-lg">ML-Based</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2">
            <p className="text-xs text-slate-400">Mitigation</p>
            <p className="font-bold text-lg">Kernel-Level</p>
          </div>
        </div>
      </div>

      {/* How it Works - Pipeline */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-800 mb-4">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pipelineSteps.map((step) => (
            <div
              key={step.step}
              className={`rounded-2xl border-2 ${step.color} p-5 transition-all hover:shadow-md hover:scale-[1.01]`}
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{step.icon}</span>
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase">Step {step.step}</span>
                  <h3 className="text-base font-bold text-slate-800">{step.title}</h3>
                </div>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Architecture Diagram */}
      <div className="bg-white rounded-2xl border-2 border-slate-200 p-6">
        <h2 className="text-xl font-extrabold text-slate-800 mb-4">System Architecture</h2>
        <div className="flex justify-center">
          <img
            src="/system-arch.png"
            alt="DNSecure System Architecture"
            className="max-w-full h-auto rounded-xl shadow-md border border-slate-200"
          />
        </div>
      </div>

      {/* BPF Maps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border-2 border-orange-300 p-5">
          <h3 className="text-lg font-bold text-slate-800 mb-3">stats_map (BPF Hash Map)</h3>
          <div className="bg-slate-50 rounded-xl p-4 font-mono text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Key:</span>
              <span className="text-orange-700 font-semibold">__u32 (IPv4 address)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Value:</span>
              <span className="text-orange-700 font-semibold">{'{ packets: u64, bytes: u64 }'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Max Entries:</span>
              <span className="text-orange-700 font-semibold">10,240</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Purpose:</span>
              <span className="text-orange-700 font-semibold">Per-IP traffic counters</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border-2 border-red-300 p-5">
          <h3 className="text-lg font-bold text-slate-800 mb-3">blocklist_map (BPF Hash Map)</h3>
          <div className="bg-slate-50 rounded-xl p-4 font-mono text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Key:</span>
              <span className="text-red-700 font-semibold">__u32 (IPv4 address)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Value:</span>
              <span className="text-red-700 font-semibold">__u8 (1 = blocked)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Max Entries:</span>
              <span className="text-red-700 font-semibold">1,024</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Purpose:</span>
              <span className="text-red-700 font-semibold">Fast-path IP blocklist</span>
            </div>
          </div>
        </div>
      </div>

      {/* ML Model Details */}
      <div className="bg-white rounded-2xl border-2 border-violet-300 p-6">
        <h2 className="text-xl font-extrabold text-slate-800 mb-4">ML Model Details</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-violet-50 rounded-xl p-4 text-center">
            <p className="text-xs text-violet-400 font-semibold uppercase">Algorithm</p>
            <p className="text-lg font-bold text-violet-700 mt-1">XGBoost</p>
          </div>
          <div className="bg-violet-50 rounded-xl p-4 text-center">
            <p className="text-xs text-violet-400 font-semibold uppercase">Features</p>
            <p className="text-lg font-bold text-violet-700 mt-1">PPS, BPS</p>
          </div>
          <div className="bg-violet-50 rounded-xl p-4 text-center">
            <p className="text-xs text-violet-400 font-semibold uppercase">Estimators</p>
            <p className="text-lg font-bold text-violet-700 mt-1">100</p>
          </div>
          <div className="bg-violet-50 rounded-xl p-4 text-center">
            <p className="text-xs text-violet-400 font-semibold uppercase">Max Depth</p>
            <p className="text-lg font-bold text-violet-700 mt-1">4</p>
          </div>
        </div>
        <div className="mt-4 bg-slate-50 rounded-xl p-4">
          <p className="text-sm text-slate-600 leading-relaxed">
            The model takes two features — <strong>Packets Per Second (PPS)</strong> and <strong>Bytes Per Second (BPS)</strong> — computed
            from the BPF stats_map every second. It classifies each IP flow as <span className="text-emerald-600 font-semibold">BENIGN (0)</span> or
            <span className="text-red-600 font-semibold"> ATTACK (1)</span>. Detected attackers are immediately added to the kernel
            blocklist_map for wire-speed dropping.
          </p>
        </div>
      </div>

      {/* Tech Stack */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-800 mb-4">Technology Stack</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {techStack.map((tech) => (
            <div key={tech.name} className={`rounded-xl border px-4 py-3 ${tech.color}`}>
              <p className="font-bold text-sm">{tech.name}</p>
              <p className="text-xs mt-0.5 opacity-80">{tech.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
