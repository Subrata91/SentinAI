import React, { useEffect, useState } from 'react';
import { Activity, RefreshCw, ShieldAlert, CheckCircle2, Clock, Loader2, Database } from 'lucide-react';

interface ScanLogItem {
  id: string;
  contentType: string;
  payload: string;
  status: string;
  threatType: string;
  confidence: string;
  timestamp: string;
}

export const LiveAuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<ScanLogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/scan/logs`);
      if (response.ok) {
        const data = await response.json();
        setLogs(data);
      }
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Activity className="text-blue-500" size={20} />
            Live System Audit Stream
          </h2>
          <p className="text-xs text-slate-400">Historical trail of all payloads analyzed via Kafka & Python AI workers</p>
        </div>
        
        <button
          onClick={fetchLogs}
          disabled={isLoading}
          className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-50 text-slate-300 text-xs font-medium rounded-lg transition-all"
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          <span>Refresh Stream</span>
        </button>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
        {isLoading ? (
          /* Dedicated Loading State */
          <div className="flex flex-col items-center justify-center p-16 space-y-3">
            <Loader2 className="animate-spin text-blue-500" size={32} />
            <p className="text-xs text-slate-400 font-medium">Fetching historical scan logs from MongoDB Atlas...</p>
          </div>
        ) : logs.length === 0 ? (
          /* Empty Collection State */
          <div className="flex flex-col items-center justify-center p-16 text-center space-y-2">
            <Database className="text-slate-600 mb-1" size={36} />
            <p className="text-sm font-semibold text-slate-300">No logs to display</p>
            <p className="text-xs text-slate-500">No scan activities have been recorded in the collection yet.</p>
          </div>
        ) : (
          /* Data Stream Table */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                <tr>
                  <th className="p-4">Scan ID</th>
                  <th className="p-4">Payload Content</th>
                  <th className="p-4">Verdict</th>
                  <th className="p-4">Threat Classification</th>
                  <th className="p-4">Confidence</th>
                  <th className="p-4">Timestamp (IST)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-4 font-bold text-blue-400">{log.id}</td>
                    <td className="p-4 max-w-xs truncate text-slate-200 font-sans" title={log.payload}>
                      {log.payload || 'N/A'}
                    </td>
                    <td className="p-4 font-sans">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-bold uppercase ${
                        log.status === 'FLAGGED' 
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                          : log.status === 'CLEARED'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {log.status === 'FLAGGED' ? <ShieldAlert size={12} /> : <CheckCircle2 size={12} />}
                        {log.status}
                      </span>
                    </td>
                    <td className="p-4 text-slate-300 font-sans">{log.threatType || 'N/A'}</td>
                    <td className="p-4 text-slate-400">{log.confidence || 'N/A'}</td>
                    <td className="p-4 text-slate-400 text-[11px] font-sans flex items-center gap-1.5">
                      <Clock size={12} className="text-slate-500" />
                      {log.timestamp || 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};