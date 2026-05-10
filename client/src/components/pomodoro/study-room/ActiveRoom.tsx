import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStudyRoom } from '../../../hooks/useStudyRoom';
import { useAuth } from '../../../context/AuthContext';
import { useAmbientAudio } from '../../../hooks/useAmbientAudio';
import SyncedTimer from './components/SyncedTimer';
import MemberGrid from './components/MemberGrid';
import ReactionPad from './components/ReactionPad';
import RoomHeader from './components/RoomHeader';
import RoomAmbientController from './components/RoomAmbientController';
import RoomStatsCard from './components/RoomStatsCard';
import RoomSettingsModal from './components/RoomSettingsModal';
import type { RoomReaction } from '../../../types/studyRoom';
import { Volume2, Users, Trophy, Clock, Sparkles, CheckCircle2, ChevronDown, ChevronUp, Smile } from 'lucide-react';
import { Button } from '../../ui/Button';
import { cn } from '../../../lib/utils';
import { toast } from 'react-hot-toast';

interface ActiveRoomProps {
  roomId: string;
  onLeave: () => void;
  isFocusMode: boolean;
}

export default function ActiveRoom({ roomId, onLeave, isFocusMode }: ActiveRoomProps) {
  const { user } = useAuth();
  const { 
    room, timeLeft, loading, error, 
    toggleTimer, resetTimer, sendReaction, updateStatus, leaveRoom, kickMember, deleteRoom, setReady 
  } = useStudyRoom(roomId);
  
  const ambientAudio = useAmbientAudio();
  
  const [showReactions, setShowReactions] = useState<RoomReaction[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [expandedSection, setExpandedSection] = useState<'sounds' | 'reactions' | null>(null);

  const isHost = room?.hostId === user?.uid;
  const currentMember = room?.members[user?.uid || ''];
  const [localIsReady, setLocalIsReady] = useState(false);

  useEffect(() => {
    if (currentMember) setLocalIsReady(!!currentMember.isReady);
  }, [currentMember?.isReady]);

  useEffect(() => {
    if (!room || !user) return;
    const heartbeat = setInterval(() => {
      updateStatus(currentMember?.status || 'online');
    }, 20000);
    return () => clearInterval(heartbeat);
  }, [room, user, currentMember?.status]);

  useEffect(() => {
    if (loading || !room) return;
    if (!currentMember && !loading) onLeave();
  }, [room?.members, user?.uid, loading]);

  useEffect(() => {
    if (room?.reactions) {
      const now = Date.now();
      const recent = room.reactions.filter(r => now - r.timestamp < 5000);
      setShowReactions(recent);
    }
  }, [room?.reactions]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full" />
      <p className="text-xl font-black animate-pulse">Entering Studio...</p>
    </div>
  );

  if (error || !room) return (
    <div className="text-center py-20 space-y-6 px-6">
      <h2 className="text-2xl md:text-3xl font-black text-destructive">Room Error</h2>
      <p className="text-muted-foreground">{error || 'Room not found'}</p>
      <Button onClick={onLeave}>Back to Lobby</Button>
    </div>
  );

  const formatHours = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getRoomTotalTime = () => {
    if (!room.createdAt) return 0;
    return Math.floor((Date.now() - room.createdAt.toMillis()) / 1000);
  };

  const getFocusTimeSeconds = () => {
    let total = room.totalWorkTime || 0;
    if (room.timerState.mode === 'work' && room.timerState.isActive) {
      total += (room.timerState.duration - timeLeft);
    }
    return total;
  };

  return (
    <div className="relative min-h-[80vh] w-full flex flex-col gap-6 md:gap-8 pb-20 max-w-7xl mx-auto px-4 md:px-6">
      
      {!isFocusMode && (
        <RoomHeader 
          room={room} 
          onLeave={() => { leaveRoom(); onLeave(); }} 
          isHost={isHost}
          onOpenSettings={() => setShowSettings(true)}
        />
      )}

      <div className={cn(
        "grid gap-8 md:gap-10 items-start",
        isFocusMode ? "grid-cols-1" : "lg:grid-cols-[1fr,320px]"
      )}>
        
        <div className="flex flex-col items-center justify-center space-y-8 md:space-y-12">
          <SyncedTimer timeLeft={timeLeft} room={room} isHost={isHost} onToggle={toggleTimer} onReset={resetTimer} />

          {!isFocusMode && (
            <div className="w-full max-w-2xl space-y-4 md:space-y-6">
               <h3 className="text-[10px] md:text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 px-2 md:px-4">
                 <Users className="w-4 h-4" /> Live Participants
               </h3>
               <MemberGrid members={room.members} hostId={room.hostId} isHost={isHost} onKick={kickMember} />
            </div>
          )}

          {!isFocusMode && (
            <div className="w-full max-w-4xl pt-4 md:pt-8">
               <RoomStatsCard room={room} />
            </div>
          )}

          {isHost && !isFocusMode && (
            <Button 
              variant="outline" 
              className="w-full md:w-auto rounded-2xl border-destructive/20 text-destructive hover:bg-destructive hover:text-white h-14 md:h-12 px-8 font-black" 
              onClick={() => setShowSummary(true)}
            >
              End Session & Summary
            </Button>
          )}
        </div>

        {!isFocusMode && (
          <div className="space-y-4 lg:sticky lg:top-24">
            <button
              onClick={() => {
                const nextState = !localIsReady;
                setLocalIsReady(nextState);
                setReady(nextState);
              }}
              className={cn(
                "w-full h-14 md:h-16 rounded-2xl md:rounded-[2rem] text-base md:text-lg font-black transition-all gap-3 flex items-center justify-center border-2",
                localIsReady 
                  ? "bg-emerald-500 text-white border-emerald-400 shadow-lg shadow-emerald-500/20 scale-[0.98]" 
                  : "bg-card text-muted-foreground border-border hover:border-primary hover:text-primary active:scale-95"
              )}
            >
              {localIsReady ? <><CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 animate-in zoom-in duration-300" /> I'm Ready!</> : <><div className="w-5 h-5 md:w-6 md:h-6 rounded-full border-2 border-current opacity-30" /> Mark as Ready</>}
            </button>

            <div className="p-1.5 md:p-2 rounded-[1.5rem] md:rounded-[2.5rem] bg-card/40 backdrop-blur-xl border border-border/50 overflow-hidden">
               <button 
                 onClick={() => setExpandedSection(expandedSection === 'sounds' ? null : 'sounds')}
                 className="w-full p-3 md:p-4 flex items-center justify-between hover:bg-secondary/50 rounded-xl md:rounded-2xl transition-all"
               >
                 <div className="flex items-center gap-3">
                   <div className="p-1.5 md:p-2 bg-primary/10 text-primary rounded-lg md:rounded-xl">
                      <Volume2 className="w-4 h-4" />
                   </div>
                   <span className="text-[10px] md:text-xs font-black uppercase tracking-widest">Atmosphere</span>
                 </div>
                 {expandedSection === 'sounds' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
               </button>
               
               <AnimatePresence>
                 {expandedSection === 'sounds' && (
                   <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="px-2 pb-4 pt-2">
                     <RoomAmbientController volumes={ambientAudio.volumes} onUpdateVolume={ambientAudio.updateVolume} audioEnabled={ambientAudio.audioEnabled} onEnableAudio={() => ambientAudio.setAudioEnabled(true)} />
                   </motion.div>
                 )}
               </AnimatePresence>
            </div>

            <div className="p-1.5 md:p-2 rounded-[1.5rem] md:rounded-[2.5rem] bg-card/40 backdrop-blur-xl border border-border/50 overflow-hidden">
               <button 
                 onClick={() => setExpandedSection(expandedSection === 'reactions' ? null : 'reactions')}
                 className="w-full p-3 md:p-4 flex items-center justify-between hover:bg-secondary/50 rounded-xl md:rounded-2xl transition-all"
               >
                 <div className="flex items-center gap-3">
                   <div className="p-1.5 md:p-2 bg-amber-500/10 text-amber-500 rounded-lg md:rounded-xl">
                      <Smile className="w-4 h-4" />
                   </div>
                   <span className="text-[10px] md:text-xs font-black uppercase tracking-widest">Reactions</span>
                 </div>
                 {expandedSection === 'reactions' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
               </button>
               
               <AnimatePresence>
                 {expandedSection === 'reactions' && (
                   <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="px-2 pb-4 pt-2">
                     <ReactionPad onSend={sendReaction} />
                   </motion.div>
                 )}
               </AnimatePresence>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showSettings && <RoomSettingsModal room={room} onClose={() => setShowSettings(false)} />}
        {showSummary && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-6 bg-black/80 backdrop-blur-xl">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-card border-2 border-border p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] max-w-xl w-full space-y-6 md:space-y-8 text-center relative overflow-hidden">
              <div className="inline-flex p-3 md:p-4 bg-primary/10 text-primary rounded-2xl md:rounded-3xl mb-2"><Trophy className="w-8 h-8 md:w-10 md:h-10" /></div>
              <h2 className="text-2xl md:text-4xl font-black">Session Summary</h2>
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div className="p-4 md:p-6 bg-secondary/50 rounded-2xl md:rounded-3xl border border-border/50"><div className="text-xl md:text-2xl font-black text-primary">{formatHours(getFocusTimeSeconds())}</div><div className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-muted-foreground">Focus</div></div>
                <div className="p-4 md:p-6 bg-secondary/50 rounded-2xl md:rounded-3xl border border-border/50"><div className="text-xl md:text-2xl font-black">{formatHours(getRoomTotalTime())}</div><div className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total</div></div>
                <div className="p-4 md:p-6 bg-secondary/50 rounded-2xl md:rounded-3xl border border-border/50 col-span-2"><div className="text-xl md:text-2xl font-black text-amber-500">{room.timerState.sessionsCompleted}</div><div className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-muted-foreground">Sessions</div></div>
              </div>
              <div className="flex flex-col md:flex-row gap-3">
                <Button variant="outline" className="h-12 md:h-14 rounded-xl md:rounded-2xl font-black" onClick={() => setShowSummary(false)}>Go Back</Button>
                <Button className="h-12 md:h-14 rounded-xl md:rounded-2xl font-black bg-destructive hover:bg-destructive/90" onClick={() => { deleteRoom(); onLeave(); }}>End & Delete</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
        <AnimatePresence>
          {showReactions.map((r, i) => (
            <motion.div key={`${r.uid}-${r.timestamp}-${i}`} initial={{ opacity: 0, y: 100, x: Math.random() * 300 }} animate={{ opacity: 1, y: -200 }} exit={{ opacity: 0 }} transition={{ duration: 3 }} className="absolute bottom-10 left-1/2 -translate-x-1/2 text-4xl">
              <span>{r.type}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
