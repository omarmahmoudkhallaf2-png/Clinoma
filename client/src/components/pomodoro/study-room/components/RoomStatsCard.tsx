import { motion } from 'framer-motion';
import { Zap, Target, TrendingUp, Award } from 'lucide-react';
import type { StudyRoom } from '../../../../types/studyRoom';

interface RoomStatsCardProps {
  room: StudyRoom;
}

export default function RoomStatsCard({ room }: RoomStatsCardProps) {
  const members = Object.values(room.members);
  const totalSessions = members.reduce((acc, m) => acc + (m.sessionsToday || 0), 0);
  const avgStreak = Math.round(members.reduce((acc, m) => acc + (m.streak || 0), 0) / members.length);
  
  // Calculate a "Productivity Score" based on sessions and presence
  const productivityScore = Math.min(100, Math.round((totalSessions * 10) / members.length + 50));

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
      {[
        { label: 'Room Streak', value: avgStreak, icon: Zap, color: 'text-amber-500' },
        { label: 'Total Sessions', value: totalSessions, icon: Target, color: 'text-primary' },
      ].map((stat, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 + i * 0.1 }}
          className="p-6 rounded-[2rem] bg-card/40 backdrop-blur-2xl border border-border/50 flex flex-col items-center text-center gap-2"
        >
          <div className={`p-3 rounded-2xl bg-secondary/50 ${stat.color}`}>
            <stat.icon className="w-5 h-5" />
          </div>
          <div className="text-2xl font-black">{stat.value}</div>
          <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{stat.label}</div>
        </motion.div>
      ))}
    </div>
  );
}
