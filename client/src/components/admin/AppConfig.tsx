import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Settings, Save, Shield, Zap, Bell, Globe, Lock } from 'lucide-react';
import { sendAdminNotification } from './NotificationSystem';

export default function AppConfig() {
  const [config, setConfig] = useState<any>({
    features: {
      enableQuizTimer: true,
      enableAIHints: true,
      enableSRS: true,
      maintenanceMode: false,
      registrationOpen: true
    },
    general: {
      telegramUser: '',
      whatsappNumber: '',
      preferredContact: 'telegram'
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConfig = async () => {
      const snap = await getDoc(doc(db, 'settings', 'config'));
      if (snap.exists()) setConfig(snap.data());
      setLoading(false);
    };
    fetchConfig();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      await setDoc(doc(db, 'settings', 'config'), config);
      sendAdminNotification('OS Configuration Updated', 'zap');
    } catch (err) {
      sendAdminNotification('Failed to update config', 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleFeature = (key: string) => {
    setConfig((prev: any) => ({
      ...prev,
      features: { ...prev.features, [key]: !prev.features[key] }
    }));
  };

  if (loading) return <div className="p-20 text-center font-black animate-bounce">Accessing Core Config...</div>;

  return (
    <div className="p-12 space-y-12 animate-in slide-in-from-right-8 duration-500">
      <div className="flex justify-between items-center bg-secondary/20 p-10 rounded-[4rem] border-2 border-border shadow-sm">
        <div className="flex items-center gap-6">
          <div className="p-5 bg-primary text-white rounded-[2.5rem] shadow-xl shadow-primary/20">
            <Settings className="w-10 h-10" />
          </div>
          <div>
            <h2 className="text-4xl font-black">SaaS OS Configuration</h2>
            <p className="text-muted-foreground font-bold opacity-60">System-wide Feature Flags & Global Settings</p>
          </div>
        </div>
        <button 
          onClick={handleSave}
          className="flex items-center gap-3 px-10 py-5 bg-emerald-600 text-white rounded-[2.5rem] font-black shadow-xl shadow-emerald-600/20 hover:scale-105 active:scale-95 transition-all"
        >
          <Save className="w-6 h-6" /> Deploy Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Feature Flags */}
        <div className="bg-card border-2 border-border rounded-[4rem] p-12 shadow-sm space-y-10">
          <div className="flex items-center gap-4">
            <Zap className="w-8 h-8 text-amber-500" />
            <h3 className="text-3xl font-black">Feature Flags</h3>
          </div>
          
          <div className="space-y-6">
            {Object.entries(config.features).map(([key, val]: [string, any]) => (
              <div key={key} className="flex items-center justify-between p-6 bg-secondary/20 rounded-3xl border-2 border-border hover:border-primary/20 transition-all">
                <div>
                  <p className="font-black text-lg capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">System Protocol</p>
                </div>
                <button 
                  onClick={() => toggleFeature(key)}
                  className={`w-16 h-8 rounded-full relative transition-all duration-500 ${val ? 'bg-primary' : 'bg-muted'}`}
                >
                  <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all duration-500 ${val ? 'left-9' : 'left-1'}`} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Global Access */}
        <div className="bg-card border-2 border-border rounded-[4rem] p-12 shadow-sm space-y-10">
          <div className="flex items-center gap-4">
            <Globe className="w-8 h-8 text-primary" />
            <h3 className="text-3xl font-black">Global Parameters</h3>
          </div>

          <div className="space-y-8">
            <div className="space-y-3">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-2">Telegram Integration (Username)</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={config.general.telegramUser}
                  onChange={e => setConfig({...config, general: {...config.general, telegramUser: e.target.value}})}
                  className="w-full bg-secondary/30 border-2 border-border p-5 rounded-2xl font-black outline-none focus:border-primary"
                  placeholder="@username"
                />
                <Bell className="absolute right-6 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground opacity-30" />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-2">Support WhatsApp Protocol</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={config.general.whatsappNumber}
                  onChange={e => setConfig({...config, general: {...config.general, whatsappNumber: e.target.value}})}
                  className="w-full bg-secondary/30 border-2 border-border p-5 rounded-2xl font-black outline-none focus:border-primary"
                  placeholder="+20 123 456 7890"
                />
                <Shield className="absolute right-6 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground opacity-30" />
              </div>
            </div>

            <div className="p-8 bg-amber-500/5 border-2 border-amber-500/20 rounded-[2.5rem] space-y-4">
              <div className="flex items-center gap-3 text-amber-600 font-black">
                <Lock className="w-5 h-5" /> Maintenance Security
              </div>
              <p className="text-xs font-bold text-amber-700/60 leading-relaxed">
                Activating Maintenance Mode will restrict platform access to admins only. All student sessions will be terminated. Use with caution during system upgrades.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
