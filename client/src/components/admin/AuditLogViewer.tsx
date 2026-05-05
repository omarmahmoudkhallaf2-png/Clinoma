import { useState, useEffect } from 'react';
import { fetchAuditLogs } from '../../lib/auditService';
import { Clock, User, Zap, Activity } from 'lucide-react';

export default function AuditLogViewer() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLogs = async () => {
      const data = await fetchAuditLogs();
      setLogs(data);
      setLoading(false);
    };
    loadLogs();
  }, []);

  if (loading) return <div className="p-20 text-center font-black animate-pulse">Loading Audit Stream...</div>;

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center gap-4">
        <div className="p-4 bg-indigo-600 text-white rounded-[2rem] shadow-xl shadow-indigo-600/20">
          <Activity className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-3xl font-black">سجل العمليات (Audit Logs)</h2>
          <p className="text-muted-foreground font-bold text-sm uppercase tracking-widest">Real-time Admin Action Transparency</p>
        </div>
      </div>

      <div className="space-y-4">
        {logs.map((log) => (
          <div key={log.id} className="bg-card border-2 border-border p-6 rounded-[2.5rem] flex items-center justify-between hover:border-primary/30 transition-all group">
            <div className="flex items-center gap-6">
              <div className={`p-4 rounded-2xl ${
                log.action.includes('DELETE') ? 'bg-red-500/10 text-red-500' :
                log.action.includes('CREATE') ? 'bg-emerald-500/10 text-emerald-500' :
                'bg-indigo-500/10 text-indigo-500'
              }`}>
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-black text-lg">{log.action.replace(/_/g, ' ')}</span>
                  <span className="text-[10px] font-black uppercase bg-secondary px-2 py-0.5 rounded-md text-muted-foreground">ID: {log.details?.id || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-4 text-xs font-bold text-muted-foreground">
                  <span className="flex items-center gap-1"><User className="w-3 h-3" /> {log.userId}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {log.timestamp?.toDate().toLocaleString()}</span>
                </div>
              </div>
            </div>
            
            <button className="px-6 py-2 bg-secondary/50 text-muted-foreground rounded-xl text-xs font-black hover:bg-primary hover:text-white transition-all opacity-0 group-hover:opacity-100">
              View Payload
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
