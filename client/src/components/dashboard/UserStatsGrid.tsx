import { Target, Zap, Trophy, Flame } from 'lucide-react';

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
    { label: 'Accuracy', value: `${stats.accuracy}%`, icon: Target, color: 'emerald', desc: 'Correct Answers' },
    { label: 'Streak', value: stats.streak, icon: Flame, color: 'orange', desc: 'Consecutive Days' },
    { label: 'Mastery Points', value: stats.points, icon: Zap, color: 'indigo', desc: 'Experience Gained' },
    { label: 'Rank', value: '#124', icon: Trophy, color: 'amber', desc: 'Global Standing' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
      {items.map((item, i) => (
        <div key={i} className="bg-card border-2 border-border p-6 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group overflow-hidden relative">
          <div className={`absolute top-0 right-0 w-24 h-24 bg-${item.color}-500/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-${item.color}-500/10 transition-all`} />
          <div className="flex justify-between items-start mb-4 relative">
            <div className={`p-3 rounded-2xl bg-${item.color}-500/10 text-${item.color}-600 group-hover:scale-110 transition-transform`}>
              <item.icon className="w-6 h-6" />
            </div>
          </div>
          <div className="relative">
            <div className="text-3xl font-black mb-1 tracking-tight">{item.value}</div>
            <div className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{item.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
