import { CheckCircle2, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';

interface GoalsProps {
  completed: number;
  target: number;
}

export default function DailyGoals({ completed, target }: GoalsProps) {
  const percentage = Math.min((completed / target) * 100, 100);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center flex-row-reverse" dir="rtl">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" /> الهدف اليومي
          </CardTitle>
          <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-md text-[10px] font-bold">{Math.round(percentage)}%</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="relative h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary rounded-full transition-all duration-1000"
            style={{ width: `${percentage}%` }}
          />
        </div>

        <div className="flex justify-between items-end flex-row-reverse" dir="rtl">
          <div>
            <p className="text-2xl font-bold">{completed} <span className="text-xs text-muted-foreground font-medium">/ {target}</span></p>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">أسئلة تم حلها اليوم</p>
          </div>
          <div className="flex -space-x-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className={`w-6 h-6 rounded-full border-2 border-card flex items-center justify-center ${i < completed / (target/5) ? 'bg-emerald-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                <CheckCircle2 className="w-3 h-3" />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
