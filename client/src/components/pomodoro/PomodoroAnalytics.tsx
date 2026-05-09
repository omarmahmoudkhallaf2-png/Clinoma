import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Target, Clock, Zap, Award, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

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
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Study Time', value: `${stats?.totalStudyTime || 0}m`, icon: Clock, color: 'text-primary' },
          { label: 'Sessions', value: stats?.sessionsCompleted || 0, icon: Target, color: 'text-emerald-500' },
          { label: 'Day Streak', value: stats?.dailyStreak || 0, icon: Zap, color: 'text-amber-500' },
          { label: 'Productivity', value: 'High', icon: Award, color: 'text-indigo-500' },
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
              <Calendar className="w-5 h-5 text-primary" /> Weekly Progress
            </CardTitle>
          </CardHeader>
          <div className="h-64 w-full mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={MOCK_DATA}>
                <defs>
                  <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#a855f7" />
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
                  dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 8, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Intensity / Heatmap Concept */}
        <Card className="border-none bg-card/50 backdrop-blur-xl shadow-2xl p-8 rounded-[3rem]">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-xl font-black flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" /> Hourly Intensity
            </CardTitle>
          </CardHeader>
          <div className="h-64 w-full mt-6 flex items-end justify-between gap-1">
            {Array.from({ length: 24 }).map((_, i) => (
              <div 
                key={i} 
                className="flex-1 bg-primary/10 rounded-t-sm relative group"
                style={{ height: `${Math.random() * 80 + 10}%` }}
              >
                <div className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-100 transition-opacity rounded-t-sm" />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-popover text-popover-foreground text-[10px] px-2 py-1 rounded hidden group-hover:block whitespace-nowrap">
                  {i}:00 - High
                </div>
              </div>
            ))}
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
