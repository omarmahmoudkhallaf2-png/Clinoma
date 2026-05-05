import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, query, orderBy, limit, onSnapshot, updateDoc, doc, addDoc } from 'firebase/firestore';
import { Bell, Check, AlertCircle, Info, Zap } from 'lucide-react';

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, 'admin_notifications'),
      orderBy('createdAt', 'desc'),
      limit(20)
    );

    return onSnapshot(q, (snap) => {
      setNotifications(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }, []);

  const markAsRead = async (id: string) => {
    await updateDoc(doc(db, 'admin_notifications', id), { isRead: true });
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`p-3 rounded-2xl transition-all relative ${isOpen ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground'}`}
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-background animate-bounce">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-[100]" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-4 w-96 bg-card border-2 border-border rounded-[2.5rem] shadow-2xl z-[101] overflow-hidden animate-in slide-in-from-top-4 duration-300">
            <div className="p-6 border-b border-border bg-primary/5 flex justify-between items-center">
              <h3 className="font-black text-xl">التنبيهات الإدارية</h3>
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-xs font-black">{unreadCount} New</span>
            </div>
            
            <div className="max-h-[400px] overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.map(n => (
                  <div 
                    key={n.id} 
                    className={`p-5 border-b border-border transition-colors flex gap-4 ${!n.isRead ? 'bg-primary/5' : 'opacity-60'}`}
                  >
                    <div className={`p-2 rounded-xl h-fit ${
                      n.type === 'error' ? 'bg-red-500/10 text-red-500' : 
                      n.type === 'zap' ? 'bg-indigo-500/10 text-indigo-500' :
                      'bg-emerald-500/10 text-emerald-500'
                    }`}>
                      {n.type === 'error' ? <AlertCircle className="w-5 h-5" /> : 
                       n.type === 'zap' ? <Zap className="w-5 h-5" /> :
                       <Info className="w-5 h-5" />}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className={`font-bold text-sm leading-snug ${!n.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>{n.message}</p>
                      <p className="text-[10px] font-black uppercase text-muted-foreground">{new Date(n.createdAt?.seconds * 1000).toLocaleString()}</p>
                    </div>
                    {!n.isRead && (
                      <button onClick={() => markAsRead(n.id)} className="p-1 hover:bg-primary/10 rounded-lg text-primary transition-all h-fit">
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-10 text-center text-muted-foreground italic">لا توجد تنبيهات حالياً</div>
              )}
            </div>
            
            <div className="p-4 bg-secondary/10 text-center">
              <button className="text-xs font-black text-primary hover:underline">مشاهدة السجل الكامل</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Helper to send notifications
export const sendAdminNotification = async (message: string, type: 'info' | 'error' | 'zap' = 'info') => {
  await addDoc(collection(db, 'admin_notifications'), {
    message,
    type,
    isRead: false,
    createdAt: new Date()
  });
};
