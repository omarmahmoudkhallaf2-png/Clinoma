import { Target, Zap, Trophy, Flame } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { cn } from '../../lib/utils';

interface StatsProps {
  stats: {
    accuracy: number;
    streak: number;
    points: number;
    totalSolved: number;
  };
}

export default function UserStatsGrid({ stats }: StatsProps) {
  const items = [
    { label: 'Accuracy', value: `${stats.accuracy}%`, icon: Target, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Current Streak', value: stats.streak, icon: Flame, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { label: 'Mastery Points', value: stats.points, icon: Zap, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
    { label: 'Global Rank', value: '#124', icon: Trophy, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((item, i) => (
        <Card key={i} className="overflow-hidden group">
          <CardContent className="p-6 relative">
            <div className={cn("absolute top-0 right-0 w-24 h-24 rounded-full -mr-12 -mt-12 blur-3xl opacity-20", item.bg)} />
            <div className="flex justify-between items-center mb-4">
              <div className={cn("p-2 rounded-lg transition-transform group-hover:scale-110", item.bg, item.color)}>
                <item.icon className="w-5 h-5" />
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold tracking-tight">{item.value}</div>
              <div className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">{item.label}</div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
