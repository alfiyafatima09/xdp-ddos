const figures = [
  {
    file: '/benchmarks/01_accuracy_precision_recall_f1.png',
    title: 'Accuracy, Precision, Recall & F1',
    description: 'Comparison of detection accuracy metrics between V1 (DNS Firewall + YARA) and V2 (XDP + XGBoost ML). V2 achieves 81.9% accuracy with 90% recall, catching nearly all attacks.',
    border: 'border-indigo-300',
    bg: 'bg-indigo-50',
  },
  {
    file: '/benchmarks/04_cpu_utilization.png',
    title: 'CPU Utilization',
    description: 'CPU overhead comparison showing XDP\'s minimal kernel-space processing cost versus userspace-based DNS firewall approach.',
    border: 'border-amber-300',
    bg: 'bg-amber-50',
  },
  {
    file: '/benchmarks/05_latency_comparison.jpeg',
    title: 'Latency Comparison',
    description: 'Per-packet processing latency. XDP drops malicious packets at the NIC driver level before they reach the kernel network stack, resulting in near-zero latency for blocked traffic.',
    border: 'border-rose-300',
    bg: 'bg-rose-50',
  },
]

export default function Benchmarks() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800">Benchmark Results</h1>
        <p className="text-sm text-slate-400 mt-1">
          V1 (DNS Firewall + YARA Rules) vs V2 (XDP/eBPF + XGBoost ML) — performance comparison
        </p>
      </div>

      {/* Summary — asymmetric layout */}
      <div className="grid grid-cols-12 gap-4">
        {/* V2 Accuracy — large featured card */}
        <div className="col-span-5 bg-slate-900 text-white rounded-2xl p-6 flex flex-col justify-between">
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">V2 Accuracy (DNSecure)</p>
          <div className="mt-4">
            <p className="text-5xl font-extrabold tracking-tight">81.9<span className="text-3xl text-slate-400">%</span></p>
            <div className="mt-3 h-2 bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full" style={{ width: '81.9%' }} />
            </div>
          </div>
        </div>

        {/* Right column — stacked cards */}
        <div className="col-span-7 grid grid-rows-2 gap-4">
          <div className="grid grid-cols-2 gap-4">
            {/* V2 Recall */}
            <div className="bg-emerald-50 border-l-4 border-emerald-500 rounded-r-2xl rounded-l-lg p-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">Recall</p>
                <p className="text-2xl font-extrabold text-emerald-700 mt-0.5">90.0%</p>
              </div>
              <div className="w-12 h-12 rounded-full border-4 border-emerald-300 flex items-center justify-center">
                <span className="text-xs font-bold text-emerald-600">V2</span>
              </div>
            </div>

            {/* V2 F1 */}
            <div className="bg-amber-50 border-l-4 border-amber-500 rounded-r-2xl rounded-l-lg p-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-amber-500 font-bold uppercase tracking-widest">F1 Score</p>
                <p className="text-2xl font-extrabold text-amber-700 mt-0.5">0.882</p>
              </div>
              <div className="w-12 h-12 rounded-full border-4 border-amber-300 flex items-center justify-center">
                <span className="text-xs font-bold text-amber-600">V2</span>
              </div>
            </div>
          </div>

          {/* V1 Accuracy — contrast row */}
          <div className="bg-white border-2 border-dashed border-slate-300 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center">
                <span className="text-sm font-bold text-rose-500">V1</span>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">V1 Baseline Accuracy</p>
                <p className="text-xl font-extrabold text-slate-600">65.0%</p>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-block bg-indigo-100 text-indigo-700 text-xs font-bold px-2.5 py-1 rounded-full">
                +16.9% improvement
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Figures */}
      <div className="space-y-6">
        {figures.map((fig, i) => (
          <div key={i} className={`bg-white rounded-2xl border-2 ${fig.border} shadow-sm overflow-hidden`}>
            <div className={`${fig.bg} px-6 py-4 border-b-2 ${fig.border}`}>
              <h3 className="text-lg font-bold text-slate-800">
                Figure {i + 1}: {fig.title}
              </h3>
              <p className="text-sm text-slate-500 mt-1">{fig.description}</p>
            </div>
            <div className="p-6 flex justify-center bg-slate-50/50">
              <img
                src={fig.file}
                alt={fig.title}
                className="max-w-full h-auto rounded-xl shadow-md border border-slate-200"
                style={{ maxHeight: '500px' }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
