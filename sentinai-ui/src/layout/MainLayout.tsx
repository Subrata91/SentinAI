import React from 'react';
import { ShieldAlert, UploadCloud, Activity } from 'lucide-react';

interface MainLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const navItems = [
    // { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'scan', label: 'Scan Content', icon: UploadCloud },
    { id: 'logs', label: 'Live Audit Logs', icon: Activity },
    // { id: 'policy', label: 'Security Policies', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-[#020617] text-slate-100 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-800 p-6 flex flex-col justify-between bg-[#020617]/80">
        <div className="space-y-8">
          <div className="flex items-center gap-3 px-2">
            <ShieldAlert className="text-blue-500" size={32} />
            <div>
              <h1 className="text-xl font-bold tracking-tight leading-none">Sentin<span className="text-blue-500">AI</span></h1>
              <span className="text-[10px] text-slate-500 uppercase tracking-widest">Enterprise Guard</span>
            </div>
          </div>
          
          <nav className="flex flex-col gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all w-full text-left ${
                    isActive 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                      : 'hover:bg-slate-800/60 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-1">
          <div className="flex items-center justify-between">
            <span>Kafka Bus:</span>
            <span className="text-emerald-400 font-medium">Ready</span>
          </div>
          <div className="flex items-center justify-between">
            <span>AI Pipeline:</span>
            <span className="text-emerald-400 font-medium">Active</span>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-8 bg-[#020617]/50 backdrop-blur-md">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            System Workspace / {activeTab}
          </h2>
          <div className="flex items-center gap-3 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-full text-slate-300 font-mono">
              Admin Session
            </span>
          </div>
        </header>
        
        <div className="flex-1 overflow-y-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
};