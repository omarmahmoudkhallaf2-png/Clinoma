import { useState, useEffect } from 'react';
import { Bell, X, Check, Info, AlertTriangle, AlertCircle, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { subscribeToNotifications, markAsRead, markAllAsRead, Notification } from '../../lib/notificationService';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

export default function NotificationCenter() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToNotifications(user.uid, setNotifications);
    return () => unsubscribe();
  }, [user]);

  const handleMarkAsRead = (id: string) => {
    if (!user) return;
    markAsRead(user.uid, id);
  };

  const handleMarkAllAsRead = () => {
    if (!user) return;
    markAllAsRead(user.uid);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <Check className="w-4 h-4 text-emerald-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-rose-500" />;
      default: return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-3 bg-secondary/50 hover:bg-secondary rounded-xl transition-all group"
      >
        <Bell className={cn("w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors", unreadCount > 0 && "animate-wiggle")} />
        {unreadCount > 0 && (
          <span className="absolute top-2.5 right-2.5 w-4 h-4 bg-primary text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-background animate-in zoom-in">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-[100] lg:absolute lg:inset-auto lg:top-full lg:right-0 lg:mt-4 lg:w-96"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="fixed bottom-0 left-0 right-0 z-[101] lg:absolute lg:bottom-auto lg:left-auto lg:top-full lg:right-0 lg:mt-4 lg:w-96 bg-card border-2 border-border shadow-2xl rounded-t-[2.5rem] lg:rounded-[2.5rem] overflow-hidden flex flex-col max-h-[80vh]"
            >
              <div className="p-6 border-b border-border flex items-center justify-between bg-secondary/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 text-primary rounded-lg">
                    <Bell className="w-5 h-5" />
                  </div>
                  <h3 className="font-black tracking-tight">الإشعارات</h3>
                </div>
                {unreadCount > 0 && (
                  <button 
                    onClick={handleMarkAllAsRead}
                    className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline"
                  >
                    تحديد الكل كمقروء
                  </button>
                )}
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2 min-h-[300px]">
                {notifications.length > 0 ? (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleMarkAsRead(n.id)}
                      className={cn(
                        "p-4 rounded-3xl border-2 transition-all cursor-pointer relative group",
                        n.isRead 
                          ? "bg-transparent border-transparent opacity-60" 
                          : "bg-secondary/30 border-primary/10 hover:border-primary/30"
                      )}
                    >
                      <div className="flex gap-4" dir="rtl">
                        <div className={cn(
                          "p-2 rounded-xl shrink-0 mt-1",
                          n.type === 'success' && "bg-emerald-500/10",
                          n.type === 'warning' && "bg-amber-500/10",
                          n.type === 'error' && "bg-rose-500/10",
                          n.type === 'info' && "bg-blue-500/10"
                        )}>
                          {getIcon(n.type)}
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="font-black text-sm">{n.title}</p>
                          <p className="text-xs text-muted-foreground font-medium leading-relaxed">{n.message}</p>
                          <p className="text-[10px] font-bold opacity-40 uppercase tracking-tight pt-2">
                            {n.createdAt?.toDate ? n.createdAt.toDate().toLocaleTimeString() : 'الآن'}
                          </p>
                        </div>
                      </div>
                      {!n.isRead && (
                        <div className="absolute top-4 left-4 w-2 h-2 bg-primary rounded-full" />
                      )}
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                    <div className="p-6 bg-secondary/30 rounded-full">
                      <Bell className="w-12 h-12 text-muted-foreground opacity-20" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-black text-muted-foreground">لا توجد إشعارات حالياً</p>
                      <p className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest">كل شيء هادئ هنا</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
