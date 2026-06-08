import { useState, useEffect } from 'react';
import { Timer } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
  } | null>(null);

  useEffect(() => {
    // Target date: June 13, 2026, 10:00 AM
    const targetDate = new Date('2026-06-13T10:00:00').getTime();

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        setTimeLeft(null);
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  if (!timeLeft) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="hidden md:flex items-center gap-4 px-4 py-1.5 bg-white/80 backdrop-blur-md rounded-full border border-slate-200 shadow-sm"
    >
      <div className="flex items-center gap-2 pr-3 border-r border-slate-200">
        <div className="p-1 bg-rose-50 rounded-lg">
          <Timer className="w-3.5 h-3.5 text-rose-500" />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-tight text-slate-500">Exam Starts In</span>
      </div>
      
      <div className="flex items-center gap-4">
        <TimeUnit value={timeLeft.days} label="Days" />
        <TimeUnit value={timeLeft.hours} label="Hours" />
      </div>
    </motion.div>
  );
}

function TimeUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center leading-none">
      <span className="text-sm font-bold text-slate-900 tabular-nums">
        {value.toString().padStart(2, '0')}
      </span>
      <span className="text-[8px] font-medium text-slate-400 uppercase tracking-tighter">{label}</span>
    </div>
  );
}
