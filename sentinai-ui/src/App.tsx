import { useState } from 'react';
import { MainLayout } from './layout/MainLayout';
// import { Dashboard } from './pages/Dashboard';
import { ScanUpload } from './pages/ScanUpload';
import { LiveAuditLogs } from './pages/LiveAuditLogs';

export function App() {
  const [activeTab, setActiveTab] = useState('scan');

  return (
    <MainLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {/* {activeTab === 'dashboard' && <Dashboard />} */}
      {activeTab === 'scan' && <ScanUpload />}
      {activeTab === 'logs' && <LiveAuditLogs />}
      {/* {activeTab === 'policy' && (
        <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-xl text-center text-slate-400 text-sm">
          Security Policy Management linked. Rules used for vector search.
        </div>
      )} */}
    </MainLayout>
  );
}

export default App;