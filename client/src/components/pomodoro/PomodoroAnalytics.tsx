import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Target, Clock, Zap, Award, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

const MOCK_DATA = [
  { day: 'Sat', minutes: 120 },
  { day: 'Sun', minutes: 180 },
  { day: 'Mon', minutes: 240 },
  { day: 'Tue', minutes: 90 },
  { day: 'Wed', minutes: 210 },
  { day: 'Thu', minutes: 300 },
  { day: 'Fri', minutes: 150 },
];

export default function PomodoroAnalytics({ stats }: { stats: any }) {
  const chartData = useMemo(() => {
    if (!stats?.history || !Array.isArray(stats.history)) return [];
    return stats.history.slice(-7).map((h: any) => ({
      day: new Date(h.date).toLocaleDateString('en-US', { weekday: 'short' }),
      minutes: h.minutes
    }));
  }, [stats?.history]);

  const intensityData = useMemo(() => {
    if (!stats?.hourlyIntensity) return Array(24).fill(0).map((_, i) => ({ hour: i, count: 0 }));
    return Array(24).fill(0).map((_, i) => ({
      hour: i,
      count: stats.hourlyIntensity[i] || 0
    }));
  }, [stats?.hourlyIntensity]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Study Time', value: `${stats?.totalStudyTime || 0}m`, icon: Clock, color: 'text-rose-500' },
          { label: 'Sessions Completed', value: stats?.sessionsCompleted || 0, icon: Target, color: 'text-emerald-500' },
          { label: 'Day Streak', value: stats?.dailyStreak || 0, icon: Zap, color: 'text-amber-500' },
        ].map((item, i) => (
          <Card key={i} className="border-none bg-card/50 backdrop-blur-xl shadow-xl overflow-hidden group">
            <CardContent className="p-6 relative">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="text-2xl font-black">{item.value}</div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-60">{item.label}</div>
                </div>
                <div className={`p-2 rounded-xl bg-secondary group-hover:scale-110 transition-transform ${item.color}`}>
                  <item.icon className="w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Activity Chart */}
        <Card className="border-none bg-card/50 backdrop-blur-xl shadow-2xl p-8 rounded-[3rem]">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-xl font-black flex items-center gap-2">
              <Calendar className="w-5 h-5 text-rose-500" /> Weekly Progress
            </CardTitle>
          </CardHeader>
          <div className="h-64 w-full mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <defs>
                  <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#f43f5e" />
                    <stop offset="100%" stopColor="#fb7185" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  dataKey="day" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 'bold' }} 
                />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '1rem', color: '#fff' }}
                  itemStyle={{ fontWeight: 'bold' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="minutes" 
                  stroke="url(#lineGradient)" 
                  strokeWidth={4} 
                  dot={{ r: 4, fill: '#f43f5e', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 8, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Hourly Intensity Heatmap */}
        <Card className="border-none bg-card/50 backdrop-blur-xl shadow-2xl p-8 rounded-[3rem]">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-xl font-black flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" /> Hourly Intensity
            </CardTitle>
          </CardHeader>
          <div className="h-64 w-full mt-6 flex items-end justify-between gap-1">
            {intensityData.map((d, i) => {
              const max = Math.max(...intensityData.map(id => id.count)) || 1;
              const height = (d.count / max) * 100;
              return (
                <div 
                  key={i} 
                  className="flex-1 bg-rose-500/10 rounded-t-sm relative group"
                  style={{ height: `${Math.max(height, 5)}%` }}
                >
                  <div className={cn("absolute inset-0 bg-rose-500 rounded-t-sm transition-opacity", d.count > 0 ? "opacity-60" : "opacity-0")} />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-popover text-popover-foreground text-[10px] px-2 py-1 rounded hidden group-hover:block whitespace-nowrap z-50">
                    {d.hour}:00 - {d.count} sessions
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-4 text-[8px] font-bold uppercase tracking-widest text-muted-foreground opacity-40">
            <span>12 AM</span>
            <span>12 PM</span>
            <span>11 PM</span>
          </div>
        </Card>
      </div>
    </div>
  );
}
