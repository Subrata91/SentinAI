import React from 'react';
import { ShieldCheck, AlertTriangle, Cpu, ArrowUpRight } from 'lucide-react';

export const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs uppercase tracking-wider font-semibold">Total Scanned</span>
            <ShieldCheck size={18} className="text-blue-400" />
          </div>
          <div className="text-3xl font-bold tracking-tight">1,492</div>
          <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1">
            <ArrowUpRight size={14} /> +14% from last hour
          </p>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs uppercase tracking-wider font-semibold">Threats Flagged</span>
            <AlertTriangle size={18} className="text-rose-400" />
          </div>
          <div className="text-3xl font-bold tracking-tight text-rose-400">18</div>
          <p className="text-xs text-rose-400/80 mt-2 flex items-center gap-1">
            <ArrowUpRight size={14} /> 3 critical policy breaches
          </p>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs uppercase tracking-wider font-semibold">Avg AI Latency</span>
            <Cpu size={18} className="text-purple-400" />
          </div>
          <div className="text-3xl font-bold tracking-tight">38 ms</div>
          <p className="text-xs text-slate-400 mt-2">Deduplicated via Redis cache</p>
        </div>
      </div>

      {/* Feed Table */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 mb-4">
          Real-time Inspection Stream
        </h3>
        <div className="space-y-3">
          {[
            { id: 'EV-8902', type: 'Image File', detail: 'confidential_schematic_v2.png', score: '94% Risk', status: 'BLOCKED' },
            { id: 'EV-8901', type: 'Text Payload', detail: 'User API Key commit attempt', score: '88% Risk', status: 'FLAGGED' },
            { id: 'EV-8900', type: 'PDF Document', detail: 'Q3_Financial_Draft.pdf', score: '02% Risk', status: 'CLEARED' },
          ].map((item) => (
            <div key={item.id} className="flex items-center justify-between p-4 bg-slate-950/80 rounded-lg border border-slate-800/80 text-sm">
              <div className="flex items-center gap-4">
                <span className="font-mono text-xs text-slate-500">{item.id}</span>
                <div>
                  <p className="font-medium text-slate-200">{item.detail}</p>
                  <p className="text-xs text-slate-500">{item.type}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs font-mono text-slate-400">{item.score}</span>
                <span className={`px-2.5 py-1 text-[11px] font-bold rounded uppercase tracking-wider ${
                  item.status === 'BLOCKED' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                  item.status === 'FLAGGED' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                  'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                }`}>
                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};