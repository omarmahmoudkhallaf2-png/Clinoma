import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Users, ArrowRight, Hash, Sparkles, Shield, Globe, Clock, ChevronRight, User, Palette } from 'lucide-react';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';
import { useAuth } from '../../../context/AuthContext';
import { useStudyRoom } from '../../../hooks/useStudyRoom';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import type { StudyRoom } from '../../../types/studyRoom';
import { cn } from '../../../lib/utils';

interface RoomLobbyProps {
  onJoinRoom: (id: string) => void;
}

const AVATARS = [
  'https://api.dicebear.com/7.x/notionists/svg?seed=Felix&backgroundColor=b6e3f4',
  'https://api.dicebear.com/7.x/notionists/svg?seed=Aneka&backgroundColor=ffdfbf',
  'https://api.dicebear.com/7.x/notionists/svg?seed=Jasper&backgroundColor=c0aede',
  'https://api.dicebear.com/7.x/notionists/svg?seed=Luna&backgroundColor=d1d4f9',
  'https://api.dicebear.com/7.x/lorelei/svg?seed=Max&backgroundColor=b6e3f4',
  'https://api.dicebear.com/7.x/lorelei/svg?seed=Bella&backgroundColor=ffdfbf',
  'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=Hacker&backgroundColor=c0aede',
  'https://api.dicebear.com/7.x/big-smile/svg?seed=Star&backgroundColor=d1d4f9',
];

export default function RoomLobby({ onJoinRoom }: RoomLobbyProps) {
  const { user } = useAuth();
  const { createRoom, joinRoomByCode } = useStudyRoom(null);
  const [roomCode, setRoomCode] = useState('');
  const [roomName, setRoomName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeRooms, setActiveRooms] = useState<StudyRoom[]>([]);
  
  // New Identity State
  const [customName, setCustomName] = useState(user?.displayName || '');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'study_rooms'), where(`members.${user.uid}.uid`, '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setActiveRooms(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StudyRoom)));
    });
    return () => unsubscribe();
  }, [user]);

  const handleCreate = async () => {
    if (!roomName.trim() || !user || !customName.trim()) return;
    setLoading(true);
    try {
      const id = await createRoom(roomName, user.uid, customName, selectedAvatar);
      onJoinRoom(id);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!roomCode.trim() || !user || !customName.trim()) return;
    setLoading(true);
    try {
      const id = await joinRoomByCode(roomCode, user.uid, customName, selectedAvatar);
      onJoinRoom(id);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-[1.2fr,1fr] gap-12 items-start py-12 max-w-7xl mx-auto px-6">
      {/* Left Side: Marketing & Active Rooms */}
      <div className="space-y-12">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-black tracking-widest uppercase">
            <Sparkles className="w-4 h-4" /> Study With Friends
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none">
            Focus <span className="text-primary underline decoration-amber-500/30">Together.</span>
          </h1>
          <p className="text-xl text-muted-foreground font-medium max-w-md">
            The ultimate medical student focus hub. Pick your vibe and start studying.
          </p>
        </motion.div>

        {activeRooms.length > 0 && (
          <div className="space-y-6">
            <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Clock className="w-4 h-4" /> Jump Back In
            </h3>
            <div className="grid gap-4">
              {activeRooms.map((room) => (
                <button
                  key={room.id}
                  onClick={() => onJoinRoom(room.id)}
                  className="group flex items-center justify-between p-6 bg-card/40 backdrop-blur-xl border border-border/50 rounded-[2rem] hover:border-primary/50 hover:bg-card/60 transition-all text-left"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center font-black text-primary group-hover:scale-110 transition-transform">
                      {room.name[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="font-black text-lg">{room.name}</div>
                      <div className="flex items-center gap-3 text-xs font-bold text-muted-foreground">
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {Object.keys(room.members).length} online</span>
                        <span className="px-2 py-0.5 bg-secondary rounded-lg uppercase tracking-tighter text-primary">{room.code}</span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right Side: Identity & Actions */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-6"
      >
        <Card className="p-8 bg-card/50 backdrop-blur-3xl border-2 border-border/50 rounded-[3rem] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[80px] -mr-32 -mt-32 rounded-full" />
          
          <div className="relative z-10 space-y-8">
            {/* Step 1: Identity */}
            <div className="space-y-6 border-b border-border/50 pb-8">
               <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary mb-4">
                 <User className="w-4 h-4" /> Your Identity
               </div>
               
               <div className="flex flex-col items-center gap-6">
                 <div className="relative group">
                    <div className="w-24 h-24 rounded-[2rem] bg-secondary border-4 border-primary/20 overflow-hidden shadow-xl transition-all group-hover:scale-105">
                      <img src={selectedAvatar} alt="Selected Avatar" className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-primary text-white p-2 rounded-xl shadow-lg">
                      <Palette className="w-4 h-4" />
                    </div>
                 </div>

                 <div className="flex flex-wrap justify-center gap-3">
                   {AVATARS.map((avatar, i) => (
                     <button 
                       key={i}
                       onClick={() => setSelectedAvatar(avatar)}
                       className={cn(
                         "w-10 h-10 rounded-xl overflow-hidden border-2 transition-all hover:scale-110",
                         selectedAvatar === avatar ? "border-primary scale-110 shadow-lg" : "border-transparent opacity-60"
                       )}
                     >
                       <img src={avatar} className="w-full h-full object-cover" />
                     </button>
                   ))}
                 </div>

                 <div className="w-full relative">
                    <input
                      type="text"
                      placeholder="Your Nickname"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      className="w-full p-4 bg-secondary/50 rounded-2xl font-bold text-center border-2 border-transparent focus:border-primary focus:outline-none transition-all"
                    />
                 </div>
               </div>
            </div>

            {/* Step 2: Room Actions */}
            <div className="space-y-6">
              <div className="flex p-1 bg-secondary/50 rounded-2xl border border-border/50">
                <button
                  onClick={() => setIsCreating(false)}
                  className={cn(
                    "flex-1 py-3 rounded-xl font-black text-xs transition-all uppercase tracking-widest",
                    !isCreating ? "bg-background shadow-lg text-foreground" : "text-muted-foreground"
                  )}
                >
                  Join Room
                </button>
                <button
                  onClick={() => setIsCreating(true)}
                  className={cn(
                    "flex-1 py-3 rounded-xl font-black text-xs transition-all uppercase tracking-widest",
                    isCreating ? "bg-background shadow-lg text-foreground" : "text-muted-foreground"
                  )}
                >
                  Create New
                </button>
              </div>

              {isCreating ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Room Name (e.g. Surgery Prep)"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    className="w-full p-5 bg-secondary/50 rounded-2xl font-bold border-2 border-transparent focus:border-primary focus:outline-none transition-all"
                  />
                  <Button 
                    onClick={handleCreate} 
                    disabled={loading || !roomName.trim() || !customName.trim()}
                    className="w-full h-16 rounded-2xl text-lg font-black gap-2 shadow-xl shadow-primary/20"
                  >
                    {loading ? 'Creating...' : 'Launch Room'}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Enter Room Code"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    className="w-full p-5 bg-secondary/50 rounded-2xl font-bold text-center border-2 border-transparent focus:border-primary focus:outline-none transition-all uppercase tracking-[0.2em]"
                    maxLength={6}
                  />
                  <Button 
                    onClick={handleJoin} 
                    disabled={loading || roomCode.length < 6 || !customName.trim()}
                    className="w-full h-16 rounded-2xl text-lg font-black gap-2 shadow-xl shadow-primary/20"
                  >
                    {loading ? 'Joining...' : 'Enter Session'}
                  </Button>
                </div>
              )}

              {error && (
                <p className="text-destructive text-xs font-bold text-center bg-destructive/10 p-3 rounded-xl border border-destructive/20">
                  {error}
                </p>
              )}
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
