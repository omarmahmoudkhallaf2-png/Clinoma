import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Zap, Clock, XCircle, ShieldCheck, CheckCircle2 } from 'lucide-react';
import type { RoomMember } from '../../../../types/studyRoom';
import { cn } from '../../../../lib/utils';

interface MemberGridProps {
  members: Record<string, RoomMember>;
  hostId: string;
  isHost: boolean;
  onKick: (uid: string) => void;
}

export default function MemberGrid({ members, hostId, isHost, onKick }: MemberGridProps) {
  const memberList = Object.values(members).sort((a, b) => {
    if (a.uid === hostId) return -1;
    if (b.uid === hostId) return 1;
    return 0;
  });

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
      <AnimatePresence mode="popLayout">
        {memberList.map((member) => (
          <motion.div
            key={member.uid}
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className={cn(
              "p-3 md:p-5 rounded-[2rem] md:rounded-[2.5rem] bg-card/40 backdrop-blur-2xl border border-border/50 relative overflow-hidden group transition-all",
              member.isReady ? "border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.15)] ring-2 ring-emerald-500/10" : "",
              member.uid === hostId ? "bg-amber-500/5 border-amber-500/20" : ""
            )}
          >
            {/* Ready Pulse */}
            <AnimatePresence>
              {member.isReady && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0.03, 0.08, 0.03] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 bg-emerald-500 pointer-events-none"
                />
              )}
            </AnimatePresence>

            {/* Kick Button (Only for Host) */}
            {isHost && member.uid !== hostId && (
              <button
                onClick={() => onKick(member.uid)}
                className="absolute top-2 right-2 md:top-4 md:right-4 p-1.5 bg-destructive/10 text-destructive rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-destructive hover:text-white z-30"
              >
                <XCircle className="w-3.5 h-3.5 md:w-4 md:h-4" />
              </button>
            )}

            <div className="flex flex-col items-center text-center space-y-3 md:space-y-4 relative z-10">
              <div className="relative">
                <div className={cn(
                  "w-14 h-14 md:w-20 md:h-20 rounded-2xl md:rounded-[2rem] overflow-hidden border-2 transition-all group-hover:scale-105 duration-500 bg-secondary/50 shadow-lg",
                  member.isReady ? "border-emerald-500 scale-105 md:scale-110" : "border-border/50",
                  member.uid === hostId ? "border-amber-400" : ""
                )}>
                  {member.photoURL ? (
                    <img src={member.photoURL} alt={member.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-black text-xl md:text-2xl text-muted-foreground uppercase">
                      {member.name[0]}
                    </div>
                  )}
                </div>

                {/* Admin Icon */}
                {member.uid === hostId && (
                  <div className="absolute -bottom-1 -left-1 bg-amber-400 text-black p-1 rounded-lg shadow-lg ring-2 ring-card">
                    <Crown className="w-3 h-3 md:w-4 md:h-4" />
                  </div>
                )}
              </div>

              <div className="space-y-1 w-full">
                <div className={cn(
                  "font-black text-xs md:text-sm tracking-tight flex items-center justify-center gap-1.5 truncate px-1",
                  member.uid === hostId ? "text-amber-500" : "",
                  member.isReady ? "text-emerald-500" : ""
                )}>
                  <span className="truncate">{member.name}</span>
                  {member.isReady && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
                      <CheckCircle2 className="w-3 h-3 md:w-3.5 md:h-3.5 fill-emerald-500 text-white shrink-0" />
                    </motion.div>
                  )}
                </div>
                
                {member.uid === hostId && (
                  <div className="text-[7px] md:text-[8px] font-black uppercase tracking-[0.2em] text-amber-500/60 pb-1">
                    Founder
                  </div>
                )}

                <div className="flex items-center justify-center gap-2 md:gap-3 text-[8px] md:text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-secondary/30 px-2 py-0.5 md:px-3 md:py-1 rounded-full border border-border/30">
                  <span className="flex items-center gap-1"><Zap className="w-2.5 h-2.5 md:w-3 md:h-3 text-amber-500 fill-current" /> {member.streak}</span>
                  <div className="w-px h-2 md:h-3 bg-border/50" />
                  <span className="flex items-center gap-1"><Clock className="w-2.5 h-2.5 md:w-3 md:h-3" /> {member.sessionsToday}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
