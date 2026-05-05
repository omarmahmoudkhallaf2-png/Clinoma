import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { Shield, User as UserIcon, CheckCircle2, XCircle, Search, Loader2, Mail } from 'lucide-react';

interface UserData {
  id: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: 'admin' | 'user';
  plan: 'free' | 'premium';
  subscriptions?: Record<string, boolean>; // e.g., { "f1": true, "f2": false }
}

export default function UserManagement() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { updateUserStatus } = useAuth();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [userSnap, courseSnap] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'courses'))
      ]);
      
      const fetchedUsers = userSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as any[];

      const fetchedCourses = courseSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setUsers(fetchedUsers);
      setCourses(fetchedCourses);
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
    } catch (error) {
      alert(`Failed to update ${courseLevel} subscription`);
    }
  };

  const filteredUsers = users.filter(u => 
    u.email?.toLowerCase().includes(search.toLowerCase()) || 
    u.displayName?.toLowerCase().includes(search.toLowerCase())
  );

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

      <div className="bg-card border border-border rounded-[2.5rem] shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right" dir="rtl">
            <thead>
              <tr className="bg-secondary/30 border-b border-border">
                <th className="px-8 py-6 text-sm font-black uppercase tracking-widest text-muted-foreground">المستخدم</th>
                {courses.map(course => (
                  <th key={course.id} className="px-6 py-6 text-sm font-black uppercase tracking-widest text-muted-foreground text-center">
                    {course.level}
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
                        <div className="font-black text-foreground text-lg">{user.displayName || 'بدون اسم'}</div>
                        <div className="text-xs text-muted-foreground font-bold flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  {/* Dynamic Course Subscriptions */}
                  {courses.map(course => {
                    const level = course.level || 'f1';
                    const key = `subscribed${level.toUpperCase()}`;
                    const isSubscribed = (user as any)[key] || false;
                    
                    return (
                      <td key={course.id} className="px-6 py-6 text-center">
                        <button 
                          onClick={() => handleToggleSubscription(user, level)}
                          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-black text-xs transition-all ${
                            isSubscribed 
                            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                            : 'bg-secondary text-muted-foreground hover:bg-red-500/10 hover:text-red-500 border border-border'
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
