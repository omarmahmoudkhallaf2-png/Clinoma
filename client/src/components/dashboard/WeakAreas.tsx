import { AlertCircle, Target, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';

interface WeakArea {
  id: string;
  count: number;
}

export default function WeakAreas({ areas }: { areas: WeakArea[] }) {
  const navigate = useNavigate();

  if (areas.length === 0) return null;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold flex items-center gap-2 flex-row-reverse" dir="rtl">
          <AlertCircle className="w-5 h-5 text-rose-500" /> نقاط تحتاج تركيز
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          {areas.map((area, i) => (
            <div key={i} className="p-4 bg-muted/50 rounded-xl border border-transparent hover:border-primary/20 transition-all group">
              <div className="flex justify-between items-center flex-row-reverse" dir="rtl">
                <div>
                  <p className="text-[10px] font-bold uppercase opacity-40">Subject ID</p>
                  <p className="font-bold text-sm">{area.id}</p>
                </div>
                <div className="text-left">
                  <p className="text-rose-500 font-bold text-lg">{area.count}</p>
                  <p className="text-[10px] font-bold uppercase opacity-60">أخطاء</p>
                </div>
              </div>
              <Button 
                variant="outline"
                size="sm"
                onClick={() => navigate('/quiz-setup', { state: { subjectId: area.id, mode: 'wrong' } })}
                className="mt-3 w-full h-8 text-[10px] font-bold group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all gap-1"
              >
                مراجعة هذه النقطة <ArrowRight className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
        <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
          <p className="text-xs font-medium text-primary/80 leading-relaxed text-right" dir="rtl">
            <Target className="w-4 h-4 inline ml-2 text-primary" />
            بناءً على أدائك، ننصح بالتركيز على هذه المواد لتحسين معدل دقة الإجابات.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
