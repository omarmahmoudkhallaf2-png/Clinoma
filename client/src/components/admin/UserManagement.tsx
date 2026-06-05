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
  const [isResetting, setIsResetting] = useState(false);

  const handleResetAllPoints = async () => {
    if (!confirm("⚠️ تحذير هام جداً:\n\nهل أنت متأكد من تصفير نقاط جميع الطلاب والبدء من الصفر؟\nهذا الإجراء سيقوم بتصفير نقاط (points و spacePoints و points_*) لكل المستخدمين ولا يمكن التراجع عنه.")) {
      return;
    }
    
    setIsResetting(true);
    try {
      const { writeBatch, doc } = await import('firebase/firestore');
      let batch = writeBatch(db);
      let count = 0;
      
      for (const u of users) {
        const userRef = doc(db, 'users', u.id);
        const resetFields: any = {
          points: 0,
          spacePoints: 0
        };
        Object.keys(u).forEach(key => {
          if (key.startsWith('points_')) {
            resetFields[key] = 0;
          }
        });
        batch.update(userRef, resetFields);
        count++;
        
        if (count === 500) {
          await batch.commit();
          batch = writeBatch(db);
          count = 0;
        }
      }
      if (count > 0) {
        await batch.commit();
      }
      
      alert("🎉 تم تصفير جميع النقاط بنجاح للجميع!");
      fetchData();
    } catch (error: any) {
      console.error("Error resetting points:", error);
      alert("حدث خطأ أثناء تصفير النقاط: " + error.message);
    } finally {
      setIsResetting(false);
    }
  };

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
      })).filter((c: any) => c.level !== 'Clinical Nutrition' && c.id !== 'clinical_nutrition' && c.name !== 'Clinical Nutrition');

      const uniqueModules = Array.from(new Set([
        'Pediatrics', // Always show Pediatrics
        'الورقة الثانية', // Always show الورقة الثانية
        'Opthalmology', // Always show Opthalmology
        ...boardSnap.docs.map(d => d.data().module).filter(Boolean)
      ])).filter((m: any) => m !== 'Clinical Nutrition') as string[];

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

  if (loading) return <div className="p-8 md:p-20 text-center"><Loader2 className="animate-spin mx-auto w-10 h-10 text-primary" /></div>;

  return (
    <div className="p-3 md:p-8 space-y-4 md:space-y-8 animate-in fade-in duration-500 max-w-full overflow-hidden">
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 md:gap-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div>
            <h2 className="text-lg md:text-2xl font-black text-right md:text-right">إدارة المستخدمين والصلاحيات</h2>
            <p className="text-muted-foreground font-bold italic text-[11px] md:text-sm">تحكم في وصول الطلاب لكل كورس بشكل منفرد.</p>
          </div>
          <button
            onClick={handleResetAllPoints}
            disabled={isResetting}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs md:text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 self-start md:self-center disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            {isResetting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            تصفير نقاط الجميع
          </button>
        </div>
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="ابحث عن دكتور بالاسم أو البريد..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-card border border-border p-2.5 pl-10 md:p-4 md:pl-12 rounded-xl md:rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold text-xs md:text-sm"
          />
        </div>
      </div>

      {/* Batch Segment Selection */}
      <div className="flex justify-end border-b border-border/40 pb-2">
        <div className="flex bg-muted/30 p-1 md:p-1.5 rounded-xl md:rounded-2xl border border-border/60 gap-1" dir="rtl">
          <button
            onClick={() => setSelectedBatch('all')}
            className={`px-3 py-1.5 md:px-6 md:py-2.5 rounded-lg md:rounded-xl text-[10px] md:text-xs font-black transition-all ${
              selectedBatch === 'all'
                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40'
            }`}
          >
            الكل ({users.length})
          </button>
          <button
            onClick={() => setSelectedBatch('43')}
            className={`px-3 py-1.5 md:px-6 md:py-2.5 rounded-lg md:rounded-xl text-[10px] md:text-xs font-black transition-all ${
              selectedBatch === '43'
                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40'
            }`}
          >
            الدفعة 43 ({users.filter(u => (u.batch || '43') === '43').length})
          </button>
          <button
            onClick={() => setSelectedBatch('44')}
            className={`px-3 py-1.5 md:px-6 md:py-2.5 rounded-lg md:rounded-xl text-[10px] md:text-xs font-black transition-all ${
              selectedBatch === '44'
                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40'
            }`}
          >
            الدفعة 44 ({users.filter(u => u.batch === '44').length})
          </button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl md:rounded-[2.5rem] shadow-xl overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-right table-auto min-w-[650px] md:min-w-full" dir="rtl">
            <thead>
              <tr className="bg-secondary/30 border-b border-border">
                <th className="px-3 md:px-8 py-3 md:py-5 text-[11px] md:text-sm font-black uppercase tracking-wider text-muted-foreground min-w-[200px] md:min-w-[280px]">المستخدم</th>
                {courses.map(course => (
                  <th key={course.id} className="px-1.5 md:px-4 py-3 md:py-5 text-[9px] md:text-xs font-black uppercase tracking-wider text-muted-foreground text-center border-l border-border/50">
                    كورس {course.level}
                  </th>
                ))}
                {spaceModules.map(mod => (
                  <th key={mod} className="px-1.5 md:px-4 py-3 md:py-5 text-[9px] md:text-xs font-black uppercase tracking-wider text-emerald-600 bg-emerald-500/5 text-center border-l border-border/50">
                    سبيس: {mod}
                  </th>
                ))}
                <th className="px-1.5 md:px-4 py-3 md:py-5 text-[9px] md:text-xs font-black uppercase tracking-wider text-muted-foreground text-center">الرتبة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-secondary/5 transition-colors group">
                  <td className="px-3 md:px-8 py-3 md:py-5 min-w-[200px] md:min-w-[280px]">
                    <div className="flex items-center gap-2 md:gap-4">
                      <div className="relative shrink-0">
                        <img src={user.photoURL} alt="" className="w-8 h-8 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-secondary border border-border shadow-sm group-hover:scale-105 transition-transform" />
                        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 md:w-4 md:h-4 bg-green-500 border-2 border-card rounded-full" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-black text-foreground text-xs md:text-lg flex items-center gap-1.5 truncate">
                          {user.displayName || 'بدون اسم'}
                          <span className={`inline-flex px-1 py-0.2 md:px-2 md:py-0.5 rounded-md md:rounded-lg text-[8px] md:text-[9px] font-black shrink-0 ${
                            (user.batch || '43') === '43' 
                              ? 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20' 
                              : 'bg-purple-500/10 text-purple-500 border border-purple-500/20'
                          }`}>
                            دفعة {user.batch || '43'}
                          </span>
                        </div>
                        <div className="text-[10px] md:text-xs text-muted-foreground font-bold flex items-center gap-1 truncate">
                          <Mail className="w-2.5 h-2.5 md:w-3 md:h-3 shrink-0" />
                          {user.email}
                        </div>
                        {user.createdAt && (
                          <div className="text-[8px] md:text-[10px] text-muted-foreground/60 font-bold flex items-center gap-1 mt-0.5">
                            <Clock className="w-2.5 h-2.5 shrink-0" />
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
                      <td key={course.id} className="px-1.5 md:px-4 py-3 md:py-5 text-center border-l border-border/50">
                        <button 
                          onClick={() => handleToggleSubscription(user, level)}
                          className={`inline-flex items-center gap-1 px-1.5 py-1 md:px-3 md:py-1.5 rounded-lg md:rounded-xl font-black text-[8px] md:text-[11px] transition-all ${
                            isSubscribed 
                            ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' 
                            : 'bg-secondary text-muted-foreground hover:bg-indigo-500/10 hover:text-indigo-500 border border-border'
                          }`}
                        >
                          {isSubscribed ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3 opacity-50" />}
                          <span className="hidden sm:inline">{isSubscribed ? 'مشترك' : 'تفعيل'}</span>
                          <span className="sm:hidden">{isSubscribed ? 'نشط' : 'تفعيل'}</span>
                        </button>
                      </td>
                    );
                  })}
                  
                  {/* Dynamic Space Subscriptions */}
                  {spaceModules.map(mod => {
                    const isSubscribed = user.spaceSubscriptions?.[mod] || false;
                    return (
                      <td key={mod} className="px-1.5 md:px-4 py-3 md:py-5 text-center bg-emerald-500/5 border-l border-border/50">
                        <button 
                          onClick={() => handleToggleSpaceSubscription(user, mod)}
                          className={`inline-flex items-center gap-1 px-1.5 py-1 md:px-3 md:py-1.5 rounded-lg md:rounded-xl font-black text-[8px] md:text-[11px] transition-all ${
                            isSubscribed 
                            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                            : 'bg-secondary/50 text-muted-foreground hover:bg-emerald-500/10 hover:text-emerald-500 border border-border/50'
                          }`}
                        >
                          {isSubscribed ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3 opacity-50" />}
                          <span className="hidden sm:inline">{isSubscribed ? 'مشترك' : 'تفعيل'}</span>
                          <span className="sm:hidden">{isSubscribed ? 'نشط' : 'تفعيل'}</span>
                        </button>
                      </td>
                    );
                  })}

                  <td className="px-1.5 md:px-4 py-3 md:py-5 text-center">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[8px] md:text-[9px] font-black tracking-tighter ${
                      user.role === 'admin' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'bg-primary/10 text-primary border border-primary/20'
                    }`}>
                      {user.role === 'admin' ? <Shield className="w-2.5 h-2.5" /> : <UserIcon className="w-2.5 h-2.5" />}
                      {user.role?.toUpperCase() || 'STUDENT'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredUsers.length === 0 && (
            <div className="p-10 md:p-20 text-center text-muted-foreground font-bold text-xs md:text-sm">
              لا يوجد مستخدمين بهذا الاسم.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
