import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Play, TrendingUp, CheckCircle, Crown, Loader2, LogOut, Settings } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';

interface UserStats {
  totalQuestions: number;
  accuracy: number;
  lastScore: number;
  lastTotal: number;
  totalAttempts: number;
}

export default function Dashboard() {
  const { user, userRole, userPlan, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    // Check for success param from Stripe
    const query = new URLSearchParams(location.search);
    if (query.get('success')) {
      setSuccessMessage('Payment successful! Your account is being upgraded. Please refresh if your plan has not updated yet.');
      // Remove the query param from URL without refreshing
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    if (query.get('canceled')) {
      // Optional: handle cancellation message
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [location]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (!user) return;
        const token = await user.getIdToken();
        const response = await fetch('/api/attempts/user', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (err) {
        console.error('Error fetching stats', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleUpgrade = async () => {
    setUpgradeLoading(true);
    try {
      if (!user) return;
      const token = await user.getIdToken();
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to create checkout session');
      
      const { url } = await response.json();
      window.location.href = url;
    } catch (err) {
      console.error(err);
      alert('Failed to initiate checkout. Please try again.');
    } finally {
      setUpgradeLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    setPortalLoading(true);
    try {
      if (!user) return;
      const token = await user.getIdToken();
      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to create portal session');
      
      const { url } = await response.json();
      window.location.href = url;
    } catch (err) {
      console.error(err);
      alert('Failed to access subscription portal.');
    } finally {
      setPortalLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {successMessage && (
        <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-700 dark:text-green-400 rounded-lg flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          {successMessage}
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card border border-border p-6 rounded-xl shadow-sm">
        <div className="flex items-center gap-4">
          {user?.photoURL ? (
            <img src={user.photoURL} alt="Profile" className="w-16 h-16 rounded-full border-2 border-primary/20" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold text-primary">
              {user?.displayName?.charAt(0) || user?.email?.charAt(0)}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-card-foreground">Welcome back, {user?.displayName?.split(' ')[0]}!</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                {userRole === 'admin' ? 'Admin' : 'Student'}
              </span>
              {userPlan === 'premium' ? (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-600 border border-yellow-500/20 flex items-center gap-1">
                  <Crown className="w-3 h-3" /> Premium Plan
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border">
                  Free Plan
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button onClick={handleLogout} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-lg transition-colors">
            <LogOut className="w-4 h-4" />
            Logout
          </button>
          {userPlan === 'premium' && (
            <button 
              onClick={handleManageSubscription} 
              disabled={portalLoading}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-lg transition-colors"
            >
              {portalLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Settings className="w-4 h-4" />}
              Manage Plan
            </button>
          )}
          <button onClick={() => navigate('/quiz-setup')} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2 bg-primary text-primary-foreground font-medium rounded-lg hover:opacity-90 transition-opacity">
            <Play className="w-4 h-4 fill-current" />
            Start Session
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-muted-foreground font-medium">Questions Solved</h3>
            <div className="p-2 bg-primary/10 rounded-lg">
              <CheckCircle className="w-5 h-5 text-primary" />
            </div>
          </div>
          <p className="text-4xl font-bold text-card-foreground">{stats?.totalQuestions || 0}</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-muted-foreground font-medium">Overall Accuracy</h3>
            <div className="p-2 bg-green-500/10 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
          </div>
          <div className="flex items-end gap-2">
            <p className="text-4xl font-bold text-card-foreground">{stats?.accuracy || 0}%</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-muted-foreground font-medium">Last Score</h3>
            <div className="p-2 bg-accent/10 rounded-lg">
              <Play className="w-5 h-5 text-accent" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-4xl font-bold text-card-foreground">{stats?.lastScore || 0}</p>
            <span className="text-muted-foreground font-medium">/ {stats?.lastTotal || 0}</span>
          </div>
        </div>
      </div>

      {stats && stats.totalQuestions > 0 && (
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <h3 className="text-xl font-bold mb-6">Performance Overview</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Correct', value: Math.round(stats.totalQuestions * (stats.accuracy / 100)), color: '#10b981' },
                    { name: 'Incorrect', value: stats.totalQuestions - Math.round(stats.totalQuestions * (stats.accuracy / 100)), color: '#ef4444' }
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {
                    [
                      { name: 'Correct', value: Math.round(stats.totalQuestions * (stats.accuracy / 100)), color: '#10b981' },
                      { name: 'Incorrect', value: stats.totalQuestions - Math.round(stats.totalQuestions * (stats.accuracy / 100)), color: '#ef4444' }
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))
                  }
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {userPlan !== 'premium' && (
        <div className="bg-gradient-to-r from-primary/10 via-accent/5 to-transparent border border-border rounded-xl p-8 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Crown className="w-48 h-48" />
          </div>
          <div className="max-w-xl relative z-10">
            <h2 className="text-2xl font-bold text-card-foreground mb-2">Upgrade to Premium</h2>
            <p className="text-muted-foreground mb-6">
              Unlock thousands of high-yield medical questions, detailed explanations, and advanced performance analytics.
            </p>
            <button 
              onClick={handleUpgrade}
              disabled={upgradeLoading}
              className="flex items-center gap-2 px-8 py-3 bg-card text-card-foreground border border-border hover:border-primary/50 hover:bg-secondary/50 font-medium rounded-lg transition-all disabled:opacity-50"
            >
              {upgradeLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-yellow-500" />
              ) : (
                <Crown className="w-5 h-5 text-yellow-500" />
              )}
              {upgradeLoading ? 'Redirecting to Stripe...' : 'Upgrade Now - $19.99/mo'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
