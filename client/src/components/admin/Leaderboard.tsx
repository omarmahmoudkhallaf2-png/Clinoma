import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { Trophy, Medal, User, Loader2, X } from 'lucide-react';
import { sendAdminNotification } from './NotificationSystem';

export default function Leaderboard() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const q = query(collection(db, 'users'), orderBy('spacePoints', 'desc'));
        const snap = await getDocs(q);
        const allUsers = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
        const spaceSubscribers = allUsers.filter(u => {
          if (!u.spaceSubscriptions) return false;
          return Object.values(u.spaceSubscriptions).some(val => val === true);
        });
        setUsers(spaceSubscribers);
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
        sendAdminNotification('Failed to load leaderboard', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary opacity-50" />
        <p className="font-bold text-muted-foreground uppercase tracking-widest text-sm">Loading Leaderboard...</p>
      </div>
    );
  }

  return (
    <div className="p-12 space-y-12 animate-in slide-in-from-bottom-8 duration-500">
      <div className="flex items-center gap-6 bg-gradient-to-r from-amber-500/10 to-orange-500/10 p-10 rounded-[4rem] border-2 border-amber-500/20">
        <div className="w-20 h-20 bg-amber-500 text-white rounded-3xl flex items-center justify-center shadow-xl shadow-amber-500/30">
          <Trophy className="w-10 h-10" />
        </div>
        <div>
          <h2 className="text-4xl font-black tracking-tight text-amber-600">Space Leaderboard</h2>
          <p className="text-amber-700/60 font-bold mt-1">Top Space subscribers ranked by their learning points.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.filter(u => u.spacePoints && u.spacePoints > 0).length === 0 && (
          <div className="col-span-full p-12 text-center bg-secondary/20 rounded-[3rem] border-2 border-border border-dashed">
            <Trophy className="w-16 h-16 text-muted-foreground opacity-20 mx-auto mb-4" />
            <h3 className="text-2xl font-black text-muted-foreground">No scores yet</h3>
            <p className="text-muted-foreground/60 font-bold">Points will appear here once users complete flashcard sessions.</p>
          </div>
        )}
        
        {users.filter(u => u.spacePoints && u.spacePoints > 0).map((u, index) => (
          <div 
            key={u.id} 
            onClick={() => setSelectedUser(u)}
            className="relative flex items-center gap-6 p-6 bg-card border-2 border-border rounded-[2.5rem] shadow-sm hover:border-amber-500/40 hover:shadow-xl hover:shadow-amber-500/10 transition-all group overflow-hidden cursor-pointer"
          >
            {index === 0 && <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full -mr-16 -mt-16 blur-2xl" />}
            
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black shrink-0 relative z-10
              ${index === 0 ? 'bg-amber-400 text-amber-900 shadow-lg shadow-amber-500/30' : 
                index === 1 ? 'bg-slate-300 text-slate-700' : 
                index === 2 ? 'bg-orange-400 text-orange-950' : 
                'bg-secondary text-muted-foreground'}`}
            >
              #{index + 1}
            </div>
            
            <div className="flex-1 min-w-0 relative z-10">
              <h4 className="text-xl font-black truncate">{u.name || u.displayName || 'Anonymous User'}</h4>
              <p className="text-sm font-bold text-muted-foreground truncate">{u.email}</p>
            </div>

            <div className="text-right shrink-0 relative z-10">
              <span className="text-3xl font-black text-amber-600 drop-shadow-sm">{u.spacePoints}</span>
              <p className="text-[10px] font-black uppercase tracking-widest text-amber-600/50 mt-1">Pts</p>
            </div>
          </div>
        ))}
      </div>

      {selectedUser && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-background/90 backdrop-blur-3xl animate-in zoom-in-95 duration-300">
          <div className="w-full max-w-md bg-card border-2 border-border rounded-[3rem] p-10 relative shadow-2xl">
            <button 
              onClick={() => setSelectedUser(null)} 
              className="absolute top-6 right-6 p-3 bg-secondary rounded-2xl hover:bg-rose-500 hover:text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="w-24 h-24 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center shadow-inner">
                <Trophy className="w-12 h-12" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-3xl font-black">{selectedUser.name || selectedUser.displayName || 'Anonymous User'}</h3>
                <p className="text-muted-foreground font-bold">{selectedUser.email}</p>
              </div>

              <div className="w-full bg-secondary/30 p-6 rounded-[2rem] border border-border">
                <div className="text-5xl font-black text-amber-600 mb-2">{selectedUser.spacePoints}</div>
                <div className="text-xs font-black uppercase tracking-widest text-muted-foreground">Total Points Earned</div>
              </div>

              {selectedUser.accuracy !== undefined && (
                <div className="w-full grid grid-cols-2 gap-4">
                  <div className="bg-secondary/30 p-4 rounded-2xl border border-border">
                    <div className="text-2xl font-black text-emerald-500">{selectedUser.accuracy}%</div>
                    <div className="text-[10px] font-black uppercase tracking-widest opacity-60">Accuracy</div>
                  </div>
                  <div className="bg-secondary/30 p-4 rounded-2xl border border-border">
                    <div className="text-2xl font-black text-indigo-500">{selectedUser.streak || 0}</div>
                    <div className="text-[10px] font-black uppercase tracking-widest opacity-60">Streak</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
