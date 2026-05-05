import { AlertCircle, Target, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface WeakArea {
  id: string;
  count: number;
}

export default function WeakAreas({ areas }: { areas: WeakArea[] }) {
  const navigate = useNavigate();

  if (areas.length === 0) return null;

  return (
    <div className="bg-card border-2 border-border p-8 rounded-[3rem] shadow-sm space-y-6">
      <h3 className="text-2xl font-black flex items-center gap-3">
        <AlertCircle className="w-6 h-6 text-rose-500" /> نقاط تحتاج تركيز
      </h3>
      <div className="space-y-4">
        {areas.map((area, i) => (
          <div key={i} className="p-5 bg-secondary/20 rounded-2xl border border-border group hover:border-primary/40 transition-all">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-black text-sm uppercase opacity-40">Subject ID</p>
                <p className="font-black text-lg">{area.id}</p>
              </div>
              <div className="text-right">
                <p className="text-rose-500 font-black text-xl">{area.count}</p>
                <p className="text-[10px] font-bold uppercase opacity-60">Mistakes</p>
              </div>
            </div>
            <button 
              onClick={() => navigate('/quiz-setup', { state: { subjectId: area.id, mode: 'wrong' } })}
              className="mt-4 w-full py-3 bg-primary/10 text-primary rounded-xl font-black text-xs flex items-center justify-center gap-2 group-hover:bg-primary group-hover:text-white transition-all"
            >
              مراجعة هذه النقطة <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
      <div className="p-6 bg-indigo-500/10 rounded-2xl border-2 border-indigo-500/20">
        <p className="text-sm font-bold text-indigo-700 leading-relaxed">
          <Target className="w-5 h-5 inline mr-2" />
          بناءً على أدائك، ننصح بالتركيز على هذه المواد لتحسين معدل دقة الإجابات.
        </p>
      </div>
    </div>
  );
}
