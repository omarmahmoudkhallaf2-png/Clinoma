import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { Shield, User as UserIcon, CheckCircle2, XCircle, Search, Loader2, Mail, Trash2, Clock } from 'lucide-react';
import { sendNotification } from '../../lib/notificationService';

interface UserData {
  id: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: 'admin' | 'user';
  plan: 'free' | 'premium';
  batch?: '43' | '44';
  subscriptions?: Record<string, boolean>; // e.g., { "f1": true, "f2": false }
  spaceSubscriptions?: Record<string, boolean>; // e.g., { "Pediatrics": true }
  createdAt?: any;
}

export default function UserManagement() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [spaceModules, setSpaceModules] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedBatch, setSelectedBatch] = useState<'all' | '43' | '44'>('all');
  const { updateUserStatus } = useAuth();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [userSnap, courseSnap, boardSnap] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'courses')),
        getDocs(collection(db, 'flashspace_boards'))
      ]);
      
      const fetchedUsers = userSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as any[];

      const fetchedCourses = courseSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const uniqueModules = Array.from(new Set([
        'Pediatrics', // Always show Pediatrics
        'الورقة الثانية', // Always show الورقة الثانية
        ...boardSnap.docs.map(d => d.data().module).filter(Boolean)
      ])) as string[];

      setUsers(fetchedUsers);
      setCourses(fetchedCourses);
      setSpaceModules(uniqueModules);
    } catch (error) {
      console.error('Error fetching user management data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleSubscription = async (user: UserData, courseLevel: string) => {
    // Legacy support: check both legacy fields (subscribedF1) and new record (subscriptions)
    const key = `subscribed${courseLevel.toUpperCase()}`;
    const currentValue = (user as any)[key] || false;
    const newValue = !currentValue;

    try {
      await updateUserStatus(user.id, { [key]: newValue });
      setUsers(users.map(u => u.id === user.id ? { ...u, [key]: newValue } : u));
      
      if (newValue) {
        await sendNotification(user.id, {
          title: 'تم تفعيل الاشتراك! 🎉',
          message: `لقد تم تفعيل اشتراكك في كورس ${courseLevel.toUpperCase()} بنجاح. يمكنك الآن البدء في المذاكرة والوصول لكافة المحتويات.`,
          type: 'success'
        });
      }
    } catch (error) {
      alert(`Failed to update ${courseLevel} subscription`);
    }
  };

  const handleToggleSpaceSubscription = async (user: UserData, moduleName: string) => {
    const currentSubs = user.spaceSubscriptions || {};
    const currentValue = currentSubs[moduleName] || false;
    const newValue = !currentValue;
    const newSubs = { ...currentSubs, [moduleName]: newValue };

    try {
      await updateUserStatus(user.id, { spaceSubscriptions: newSubs });
      setUsers(users.map(u => u.id === user.id ? { ...u, spaceSubscriptions: newSubs } : u));
      
      if (newValue) {
        await sendNotification(user.id, {
          title: 'Space Access Granted! 🚀',
          message: `لقد تم تفعيل اشتراكك في سبيس ${moduleName} بنجاح.`,
          type: 'success'
        });
      }
    } catch (error) {
      alert(`Failed to update Space subscription for ${moduleName}`);
    }
  };

  const handleDeleteUser = async (user: UserData) => {
    if (user.role === 'admin') {
      alert('لا يمكن حذف حساب أدمن آخر بهذه الطريقة.');
      return;
    }

    if (confirm(`تحذير: هل أنت متأكد من إزالة تسجيل ${user.displayName}؟\nسيتم حذف بياناته بالكامل من المنصة ولن يتمكن من الدخول إلا بإعادة التسجيل.`)) {
      try {
        await deleteDoc(doc(db, 'users', user.id));
        setUsers(users.filter(u => u.id !== user.id));
        alert('تمت إزالة التسجيل بنجاح.');
      } catch (error) {
        alert('حدث خطأ أثناء الحذف.');
      }
    }
  };

  const filteredUsers = users
    .filter(u => {
      if (selectedBatch !== 'all') {
        const uBatch = u.batch || '43';
        if (uBatch !== selectedBatch) return false;
      }
      return (
        u.email?.toLowerCase().includes(search.toLowerCase()) || 
        u.displayName?.toLowerCase().includes(search.toLowerCase())
      );
    })
    .sort((a, b) => {
      // Admins always on top
      if (a.role === 'admin' && b.role !== 'admin') return -1;
      if (a.role !== 'admin' && b.role === 'admin') return 1;

      // For users (or between admins), sort by join date (newest first)
      const timeA = a.createdAt?.seconds || (a.createdAt instanceof Date ? a.createdAt.getTime() / 1000 : 0);
      const timeB = b.createdAt?.seconds || (b.createdAt instanceof Date ? b.createdAt.getTime() / 1000 : 0);
      
      return timeB - timeA;
    });

  if (loading) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto w-10 h-10 text-primary" /></div>;

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h2 className="text-2xl font-black">إدارة المستخدمين والصلاحيات</h2>
          <p className="text-muted-foreground font-bold italic">تحكم في وصول الطلاب لكل كورس بشكل منفرد.</p>
        </div>
        <div className="relative max-w-md w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="ابحث عن دكتور بالاسم أو البريد..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-card border border-border p-4 pl-12 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold"
          />
        </div>
      </div>

      {/* Batch Segment Selection */}
      <div className="flex justify-end border-b border-border/40 pb-2">
        <div className="flex bg-muted/30 p-1.5 rounded-2xl border border-border/60 gap-1" dir="rtl">
          <button
            onClick={() => setSelectedBatch('all')}
            className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${
              selectedBatch === 'all'
                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40'
            }`}
          >
            الكل ({users.length})
          </button>
          <button
            onClick={() => setSelectedBatch('43')}
            className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${
              selectedBatch === '43'
                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40'
            }`}
          >
            الدفعة 43 ({users.filter(u => (u.batch || '43') === '43').length})
          </button>
          <button
            onClick={() => setSelectedBatch('44')}
            className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${
              selectedBatch === '44'
                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40'
            }`}
          >
            الدفعة 44 ({users.filter(u => u.batch === '44').length})
          </button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-[2.5rem] shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right" dir="rtl">
            <thead>
              <tr className="bg-secondary/30 border-b border-border">
                <th className="px-8 py-6 text-sm font-black uppercase tracking-widest text-muted-foreground">المستخدم</th>
                {courses.map(course => (
                  <th key={course.id} className="px-6 py-6 text-sm font-black uppercase tracking-widest text-muted-foreground text-center border-l border-border/50">
                    كورس {course.level}
                  </th>
                ))}
                {spaceModules.map(mod => (
                  <th key={mod} className="px-6 py-6 text-sm font-black uppercase tracking-widest text-emerald-600 bg-emerald-500/5 text-center border-l border-border/50">
                    سبيس: {mod}
                  </th>
                ))}
                <th className="px-6 py-6 text-sm font-black uppercase tracking-widest text-muted-foreground">الرتبة</th>
                <th className="px-8 py-6 text-sm font-black uppercase tracking-widest text-muted-foreground">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-secondary/5 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <img src={user.photoURL} alt="" className="w-12 h-12 rounded-2xl bg-secondary border border-border shadow-sm group-hover:scale-105 transition-transform" />
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-card rounded-full" />
                      </div>
                      <div>
                        <div className="font-black text-foreground text-lg flex items-center gap-2">
                          {user.displayName || 'بدون اسم'}
                          <span className={`inline-flex px-2 py-0.5 rounded-lg text-[9px] font-black ${
                            (user.batch || '43') === '43' 
                              ? 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20' 
                              : 'bg-purple-500/10 text-purple-500 border border-purple-500/20'
                          }`}>
                            دفعة {user.batch || '43'}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground font-bold flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {user.email}
                        </div>
                        {user.createdAt && (
                          <div className="text-[10px] text-muted-foreground/60 font-bold flex items-center gap-1 mt-0.5">
                            <Clock className="w-2.5 h-2.5" />
                            انضم في {new Date((user.createdAt?.seconds * 1000) || user.createdAt).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  
                  {/* Dynamic Course Subscriptions */}
                  {courses.map(course => {
                    const level = course.level || 'f1';
                    const key = `subscribed${level.toUpperCase()}`;
                    const isSubscribed = (user as any)[key] || false;
                    
                    return (
                      <td key={course.id} className="px-6 py-6 text-center border-l border-border/50">
                        <button 
                          onClick={() => handleToggleSubscription(user, level)}
                          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-black text-xs transition-all ${
                            isSubscribed 
                            ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' 
                            : 'bg-secondary text-muted-foreground hover:bg-indigo-500/10 hover:text-indigo-500 border border-border'
                          }`}
                        >
                          {isSubscribed ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4 opacity-50" />}
                          {isSubscribed ? 'مشترك' : 'تفعيل'}
                        </button>
                      </td>
                    );
                  })}
                  
                  {/* Dynamic Space Subscriptions */}
                  {spaceModules.map(mod => {
                    const isSubscribed = user.spaceSubscriptions?.[mod] || false;
                    return (
                      <td key={mod} className="px-6 py-6 text-center bg-emerald-500/5 border-l border-border/50">
                        <button 
                          onClick={() => handleToggleSpaceSubscription(user, mod)}
                          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-black text-xs transition-all ${
                            isSubscribed 
                            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                            : 'bg-secondary/50 text-muted-foreground hover:bg-emerald-500/10 hover:text-emerald-500 border border-border/50'
                          }`}
                        >
                          {isSubscribed ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4 opacity-50" />}
                          {isSubscribed ? 'مشترك' : 'تفعيل'}
                        </button>
                      </td>
                    );
                  })}

                  <td className="px-6 py-6">
                    <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black tracking-tighter ${
                      user.role === 'admin' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'bg-primary/10 text-primary border border-primary/20'
                    }`}>
                      {user.role === 'admin' ? <Shield className="w-3 h-3" /> : <UserIcon className="w-3 h-3" />}
                      {user.role?.toUpperCase() || 'STUDENT'}
                    </span>
                  </td>

                  <td className="px-8 py-6 text-left">
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={async () => {
                          const newRole = user.role === 'admin' ? 'user' : 'admin';
                          if (confirm(`هل أنت متأكد من تغيير صلاحية ${user.displayName} إلى ${newRole}؟`)) {
                            await updateUserStatus(user.id, { role: newRole });
                            fetchData();
                          }
                        }}
                        className="px-4 py-2 text-xs font-black bg-background border border-border hover:bg-secondary rounded-xl transition-all shadow-sm"
                      >
                        تغيير الصلاحية
                      </button>

                      <button
                        onClick={() => handleDeleteUser(user)}
                        className="p-2.5 text-rose-500 bg-rose-500/5 hover:bg-rose-500 hover:text-white border border-rose-500/20 rounded-xl transition-all"
                        title="إزالة التسجيل"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredUsers.length === 0 && (
            <div className="p-20 text-center text-muted-foreground font-bold">
              لا يوجد مستخدمين بهذا الاسم.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
