import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { Settings as SettingsIcon, Save, Clock, BookOpen, Bell } from 'lucide-react';

export default function Settings() {
  const { user } = useAuth();
  const [defaultQuestionCount, setDefaultQuestionCount] = useState(10);
  const [defaultTimerMode, setDefaultTimerMode] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleSave = async () => {
    try {
      if (!user) return;
      setSaving(true);
      await updateDoc(doc(db, 'users', user.uid), {
        settings: {
          defaultQuestionCount,
          defaultTimerMode
        }
      });
      setMessage('Settings saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error(error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in">
      <div className="flex items-center gap-3">
        <SettingsIcon className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-bold">My Settings</h1>
      </div>

      <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
        <div className="p-8 space-y-8">
          {/* Practice Defaults */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              Practice Defaults
            </h3>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Default Question Count</label>
              <select 
                value={defaultQuestionCount}
                onChange={(e) => setDefaultQuestionCount(Number(e.target.value))}
                className="w-full bg-secondary/50 border border-border p-3 rounded-xl outline-none focus:ring-2 focus:ring-primary"
              >
                {[5, 10, 20, 30, 40, 50].map(n => (
                  <option key={n} value={n}>{n} Questions</option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between p-4 bg-secondary/20 rounded-2xl border border-border">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-primary" />
                <div>
                  <div className="font-bold">Default Timer Mode</div>
                  <div className="text-xs text-muted-foreground">Enable 60s timer by default</div>
                </div>
              </div>
              <button 
                onClick={() => setDefaultTimerMode(!defaultTimerMode)}
                className={`w-12 h-6 rounded-full transition-all relative ${defaultTimerMode ? 'bg-primary' : 'bg-muted'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${defaultTimerMode ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
          </div>

          <hr className="border-border" />

          {/* Account Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2 text-muted-foreground">
              <Bell className="w-5 h-5" />
              Notifications
            </h3>
            <p className="text-sm text-muted-foreground">Email notifications are coming soon.</p>
          </div>
        </div>

        <div className="p-6 bg-secondary/10 border-t border-border flex items-center justify-between">
          <p className="text-sm text-green-600 font-medium">{message}</p>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground font-bold rounded-xl shadow-lg shadow-primary/20 hover:opacity-90 disabled:opacity-50 transition-all"
          >
            {saving ? <Loader2 className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5" />}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

function Loader2({ className }: { className?: string }) {
  return <div className={`w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin ${className}`} />;
}
