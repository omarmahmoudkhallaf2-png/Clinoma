import { CheckCircle2 } from 'lucide-react';

interface GoalsProps {
  completed: number;
  target: number;
}

export default function DailyGoals({ completed, target }: GoalsProps) {
  const percentage = Math.min((completed / target) * 100, 100);

  return (
    <div className="bg-card border-2 border-border p-8 rounded-[3rem] shadow-sm space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-black">Daily Goal</h3>
        <span className="px-4 py-1 bg-primary/10 text-primary rounded-xl text-xs font-black">{Math.round(percentage)}%</span>
      </div>

      <div className="relative h-4 bg-secondary/30 rounded-full overflow-hidden border border-border">
        <div 
          className="h-full bg-primary rounded-full transition-all duration-1000 shadow-[0_0_20px_rgba(var(--primary),0.3)]"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="flex justify-between items-end">
        <div>
          <p className="text-3xl font-black">{completed} <span className="text-sm text-muted-foreground">/ {target}</span></p>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Questions Solved Today</p>
        </div>
        <div className="flex -space-x-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className={`w-8 h-8 rounded-full border-2 border-card flex items-center justify-center ${i < completed / (target/5) ? 'bg-emerald-500 text-white' : 'bg-secondary text-muted-foreground'}`}>
              <CheckCircle2 className="w-4 h-4" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
