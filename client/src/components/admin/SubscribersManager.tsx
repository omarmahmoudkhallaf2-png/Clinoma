import { useState, useEffect, useMemo } from 'react';
import { db } from '../../lib/firebase';
import { collection, getDocs, doc, setDoc, getDoc } from 'firebase/firestore';
import {
  Users, DollarSign, BookOpen, Eye, Baby, FileText,
  Loader2, Search, Mail, X, Plus, ChevronDown, ChevronRight,
  TrendingUp, AlertCircle, CheckCircle2, XCircle, MinusCircle, Receipt
} from 'lucide-react';

// ─── Course definitions ────────────────────────────────────────────────────────
const COURSES = [
  {
    id: 'pediatrics',
    label: 'أطفال',
    labelEn: 'Pediatrics',
    spaceKey: 'Pediatrics',
    icon: Baby,
    color: 'indigo',
    bgClass: 'bg-indigo-500/10',
    textClass: 'text-indigo-600',
    borderClass: 'border-indigo-500/20',
    badgeClass: 'bg-indigo-500 text-white',
  },
  {
    id: 'second_paper',
    label: 'الورقة التانية (+ رمد)',
    labelEn: '2nd Paper (incl. Ophth bundle)',
    spaceKey: 'الورقة الثانية',
    icon: FileText,
    color: 'violet',
    bgClass: 'bg-violet-500/10',
    textClass: 'text-violet-600',
    borderClass: 'border-violet-500/20',
    badgeClass: 'bg-violet-500 text-white',
  },
  {
    id: 'ophthalmology',
    label: 'رمد فقط',
    labelEn: 'Ophthalmology (standalone)',
    spaceKey: 'Opthalmology',
    icon: Eye,
    color: 'teal',
    bgClass: 'bg-teal-500/10',
    textClass: 'text-teal-600',
    borderClass: 'border-teal-500/20',
    badgeClass: 'bg-teal-500 text-white',
  },
];

// ─── Pricing logic ─────────────────────────────────────────────────────────────
/**
 * Given a user's subscriptions map, return the price they should pay
 * for each subscribed course.
 *
 * Rules:
 *   أطفال   → 50 EGP always
 *   ورقة   → 80 EGP if also subscribed to أطفال, else 100 EGP
 *   رمد     → 60 EGP if only رمد (no ورقة), 80 EGP if subscribed to ورقة+رمد
 */
function getPriceForUser(
  spaceSubscriptions: Record<string, boolean> = {}
): Record<string, number> {
  const hasPeds = !!spaceSubscriptions['Pediatrics'];
  const hasSecondPaper = !!spaceSubscriptions['الورقة الثانية'];
  const hasOphth = !!spaceSubscriptions['Opthalmology'];

  const prices: Record<string, number> = {};

  if (hasPeds) prices['pediatrics'] = 50;
  if (hasSecondPaper) prices['second_paper'] = hasPeds ? 80 : 100;
  if (hasOphth) prices['ophthalmology'] = hasSecondPaper ? 80 : 60;

  return prices;
}

// ─── Firestore helpers ─────────────────────────────────────────────────────────
const SETTINGS_DOC = 'subscribers_manager_settings';

async function loadSettings() {
  const ref = doc(db, 'admin_settings', SETTINGS_DOC);
  const snap = await getDoc(ref);
  if (snap.exists()) return snap.data();
  return {};
}

async function saveSettings(data: any) {
  const ref = doc(db, 'admin_settings', SETTINGS_DOC);
  await setDoc(ref, data, { merge: true });
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function SubscribersManager() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // Per-course manual price override (admin can set custom price)
  const [coursePrices, setCoursePrices] = useState<Record<string, string>>({
    pediatrics: '',
    second_paper: '',
    ophthalmology: '',
  });

  // Per-course exceptions: emails that have access but didn't pay
  const [exceptions, setExceptions] = useState<Record<string, string[]>>({
    pediatrics: [],
    second_paper: [],
    ophthalmology: [],
  });
  const [newException, setNewException] = useState('');

  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);

  // Per-course expenses list: items that get deducted from course revenue
  const [expenses, setExpenses] = useState<Record<string, { id: string; name: string; amount: string }[]>>({
    pediatrics: [],
    second_paper: [],
    ophthalmology: [],
  });
  const [newExpenseName, setNewExpenseName] = useState('');
  const [newExpenseAmount, setNewExpenseAmount] = useState('');

  // ── Fetch users ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const snap = await getDocs(collection(db, 'users'));
        setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error('Error fetching users:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // ── Load admin settings (prices + exceptions + expenses) ─────────────────────
  useEffect(() => {
    loadSettings().then(data => {
      if (data.coursePrices) setCoursePrices(prev => ({ ...prev, ...data.coursePrices }));
      if (data.exceptions) setExceptions(prev => ({ ...prev, ...data.exceptions }));
      if (data.expenses) {
        if (Array.isArray(data.expenses)) {
          // Migration from global array to per-course record: place in second_paper by default
          setExpenses(prev => ({
            ...prev,
            second_paper: data.expenses,
          }));
        } else {
          setExpenses(prev => ({ ...prev, ...data.expenses }));
        }
      }
      setSettingsLoaded(true);
    });
  }, []);

  // ── Auto-save settings on change ─────────────────────────────────────────────
  useEffect(() => {
    if (!settingsLoaded) return;
    const timeout = setTimeout(async () => {
      setSavingSettings(true);
      try {
        await saveSettings({ coursePrices, exceptions, expenses });
      } finally {
        setSavingSettings(false);
      }
    }, 800);
    return () => clearTimeout(timeout);
  }, [coursePrices, exceptions, expenses, settingsLoaded]);

  // ── Derived: subscribers per course ─────────────────────────────────────────
  // NOTE: مشتركي الرمد اللي عندهم ورقة تانية برضو → بيتحسبوا تحت الورقة التانية
  // لأن سعرهم (80 أو 100) بيتحسب في الورقة التانية كحزمة.
  // الرمد بيعرض بس اللي اشتركوا في الرمد لوحده (60 EGP).
  const courseSubscribers = useMemo(() => {
    const result: Record<string, any[]> = {
      pediatrics: [],
      second_paper: [],
      ophthalmology: [],
    };
    for (const user of users) {
      const subs = user.spaceSubscriptions || {};
      if (subs['Pediatrics']) result.pediatrics.push(user);
      if (subs['الورقة الثانية']) result.second_paper.push(user);
      // رمد فقط اللي مش عندهم ورقة تانية — الباقي بيتحسبوا في الورقة التانية
      if (subs['Opthalmology'] && !subs['الورقة الثانية']) result.ophthalmology.push(user);
    }
    return result;
  }, [users]);

  // ── Revenue computation for a given course ───────────────────────────────────
  const computeRevenue = useMemo(() => {
    return (courseId: string) => {
      const subscribers = courseSubscribers[courseId] || [];
      const courseExceptions = new Set((exceptions[courseId] || []).map(e => e.toLowerCase().trim()));

      // Paying subscribers: exclude exceptions
      const payingSubscribers = subscribers.filter(
        u => !courseExceptions.has((u.email || '').toLowerCase().trim())
      );

      // Calculate total revenue using dynamic pricing per user
      let totalRevenue = 0;
      for (const u of payingSubscribers) {
        const userPrices = getPriceForUser(u.spaceSubscriptions || {});
        // If admin overrode the price, use that; else use the computed price
        const overridePrice = coursePrices[courseId] ? Number(coursePrices[courseId]) : null;
        const computedPrice = userPrices[courseId] || 0;
        totalRevenue += overridePrice !== null ? overridePrice : computedPrice;
      }

      const courseExpensesList = expenses[courseId] || [];
      const totalCourseExpenses = courseExpensesList.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

      return {
        total: subscribers.length,
        paying: payingSubscribers.length,
        exceptions: subscribers.length - payingSubscribers.length,
        revenue: totalRevenue,
        expenses: totalCourseExpenses,
        netRevenue: totalRevenue - totalCourseExpenses,
      };
    };
  }, [courseSubscribers, exceptions, coursePrices, expenses]);

  // ── Filtered subscribers for the selected course ─────────────────────────────
  const filteredSubscribers = useMemo(() => {
    if (!selectedCourse) return [];
    return (courseSubscribers[selectedCourse] || []).filter(u => {
      const q = search.toLowerCase();
      return (
        !q ||
        (u.email || '').toLowerCase().includes(q) ||
        (u.displayName || '').toLowerCase().includes(q)
      );
    });
  }, [selectedCourse, courseSubscribers, search]);

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const addException = (courseId: string) => {
    const email = newException.trim().toLowerCase();
    if (!email) return;
    if ((exceptions[courseId] || []).includes(email)) {
      setNewException('');
      return;
    }
    setExceptions(prev => ({
      ...prev,
      [courseId]: [...(prev[courseId] || []), email],
    }));
    setNewException('');
  };

  const removeException = (courseId: string, email: string) => {
    setExceptions(prev => ({
      ...prev,
      [courseId]: (prev[courseId] || []).filter(e => e !== email),
    }));
  };

  // ── Expense handlers ──────────────────────────────────────────────────────────
  const addCourseExpense = (courseId: string) => {
    const name = newExpenseName.trim();
    const amount = newExpenseAmount.trim();
    if (!name || !amount || isNaN(Number(amount))) return;
    setExpenses(prev => ({
      ...prev,
      [courseId]: [
        ...(prev[courseId] || []),
        { id: Date.now().toString(), name, amount },
      ],
    }));
    setNewExpenseName('');
    setNewExpenseAmount('');
  };

  const removeCourseExpense = (courseId: string, id: string) => {
    setExpenses(prev => ({
      ...prev,
      [courseId]: (prev[courseId] || []).filter(e => e.id !== id),
    }));
  };

  // ── Overall platform financial stats ──────────────────────────────────────────
  const platformStats = useMemo(() => {
    let gross = 0;
    let exps = 0;
    for (const c of COURSES) {
      const rev = computeRevenue(c.id);
      gross += rev.revenue;
      exps += rev.expenses;
    }
    return {
      gross,
      expenses: exps,
      net: gross - exps,
    };
  }, [computeRevenue]);

  // ─── Render ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-12 h-12 animate-spin text-primary opacity-40" />
      </div>
    );
  }

  const selectedCourseData = COURSES.find(c => c.id === selectedCourse);
  const stats = selectedCourse ? computeRevenue(selectedCourse) : null;

  return (
    <div className="p-6 md:p-10 space-y-8 animate-in fade-in duration-500" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black">إدارة المشتركين والإيرادات</h2>
          <p className="text-muted-foreground font-bold text-sm mt-1">
            عرض المشتركين في كل كورس، حساب الإيرادات، وإدارة الاستثناءات والمصاريف
          </p>
        </div>
        {savingSettings && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-bold animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin" />
            جاري الحفظ...
          </div>
        )}
      </div>

      {/* Course Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {COURSES.map(course => {
          const rev = computeRevenue(course.id);
          const Icon = course.icon;
          const isSelected = selectedCourse === course.id;

          return (
            <button
              key={course.id}
              onClick={() => setSelectedCourse(isSelected ? null : course.id)}
              className={`relative text-right p-6 rounded-3xl border-2 transition-all duration-300 group hover:scale-[1.02] active:scale-95 shadow-sm ${
                isSelected
                  ? `${course.bgClass} ${course.borderClass} shadow-lg scale-[1.02]`
                  : 'bg-card border-border hover:border-primary/30'
              }`}
            >
              {/* Glow on selected */}
              {isSelected && (
                <div className={`absolute inset-0 rounded-3xl ${course.bgClass} blur-2xl opacity-30 -z-10`} />
              )}

              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-2xl ${course.bgClass}`}>
                  <Icon className={`w-6 h-6 ${course.textClass}`} />
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  {isSelected ? (
                    <ChevronDown className="w-4 h-4 text-primary" />
                  ) : (
                    <ChevronRight className="w-4 h-4 opacity-40" />
                  )}
                </div>
              </div>

              <div>
                <p className="font-black text-xl">{course.label}</p>
                <p className="text-muted-foreground text-xs font-bold mt-0.5">{course.labelEn}</p>
              </div>

              <div className="mt-4 flex items-end justify-between">
                <div>
                  <p className={`text-3xl font-black ${course.textClass}`}>{rev.total}</p>
                  <p className="text-xs text-muted-foreground font-bold">مشترك</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black text-foreground">
                    {rev.netRevenue.toLocaleString('ar-EG')} <span className="text-xs text-muted-foreground">EGP</span>
                  </p>
                  <p className="text-[10px] text-muted-foreground font-bold">
                    {rev.expenses > 0 ? 'صافي الإيرادات' : 'إجمالي الإيرادات'}
                  </p>
                </div>
              </div>

              {rev.expenses > 0 && (
                <div className="mt-1 text-[10px] text-rose-500 font-bold">
                  (بعد خصم {rev.expenses.toLocaleString('ar-EG')} EGP مصاريف)
                </div>
              )}

              {rev.exceptions > 0 && (
                <div className="mt-3 flex items-center gap-1.5 text-amber-600 bg-amber-500/10 px-3 py-1.5 rounded-xl w-fit">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span className="text-xs font-black">{rev.exceptions} استثناء</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Course Detail Panel ─────────────────────────────────────────────── */}
      {selectedCourse && selectedCourseData && stats && (
        <div className="bg-card border-2 border-border rounded-[2.5rem] overflow-hidden shadow-xl animate-in slide-in-from-top-4 duration-300">
          {/* Panel Header */}
          <div className={`p-6 md:p-8 ${selectedCourseData.bgClass} border-b border-border/50`}>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl bg-card/80 shadow-sm`}>
                  <selectedCourseData.icon className={`w-7 h-7 ${selectedCourseData.textClass}`} />
                </div>
                <div>
                  <h3 className="text-xl font-black">{selectedCourseData.label}</h3>
                  <p className="text-muted-foreground text-xs font-bold">{selectedCourseData.labelEn}</p>
                </div>
              </div>

              {/* Revenue Summary */}
              <div className="flex flex-wrap gap-4">
                <div className="bg-card/80 rounded-2xl px-5 py-3 text-center shadow-sm">
                  <p className={`text-2xl font-black ${selectedCourseData.textClass}`}>{stats.total}</p>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">مشترك</p>
                </div>
                <div className="bg-card/80 rounded-2xl px-5 py-3 text-center shadow-sm">
                  <p className="text-2xl font-black text-emerald-600">{stats.paying}</p>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">دافع</p>
                </div>
                {stats.exceptions > 0 && (
                  <div className="bg-amber-500/10 rounded-2xl px-5 py-3 text-center shadow-sm">
                    <p className="text-2xl font-black text-amber-600">{stats.exceptions}</p>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">استثناء</p>
                  </div>
                )}
                {stats.expenses > 0 && (
                  <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl px-5 py-3 text-center shadow-sm">
                    <p className="text-2xl font-black text-rose-600">{stats.expenses.toLocaleString('ar-EG')}</p>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">EGP مصاريف</p>
                  </div>
                )}
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl px-5 py-3 text-center shadow-sm">
                  <p className="text-2xl font-black text-emerald-600">{stats.netRevenue.toLocaleString('ar-EG')}</p>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">EGP صافي</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8 space-y-8">
            {/* ─ Settings Grid ─ */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Column 1: Manual Price */}
              <div className="bg-secondary/20 rounded-2xl p-6 border border-border space-y-3">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-primary" />
                  <h4 className="font-black">تحديد سعر الكورس يدوياً</h4>
                </div>
                <p className="text-xs text-muted-foreground font-bold">
                  اترك الخانة فارغة لاستخدام الأسعار التلقائية المحسوبة بناءً على اشتراكات كل مستخدم
                </p>
                <div className="flex gap-3 items-center">
                  <input
                    type="number"
                    min="0"
                    placeholder="مثال: 100"
                    value={coursePrices[selectedCourse]}
                    onChange={e => setCoursePrices(prev => ({ ...prev, [selectedCourse]: e.target.value }))}
                    className="flex-1 bg-card border-2 border-border rounded-xl px-4 py-3 font-black text-lg outline-none focus:border-primary transition-all text-right"
                    dir="ltr"
                  />
                  <span className="text-muted-foreground font-black text-sm">EGP</span>
                  {coursePrices[selectedCourse] && (
                    <button
                      onClick={() => setCoursePrices(prev => ({ ...prev, [selectedCourse]: '' }))}
                      className="p-2 bg-secondary rounded-xl hover:bg-rose-500 hover:text-white transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Pricing guide */}
                <div className="bg-card rounded-xl p-3 border border-border/50 space-y-1.5">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">الأسعار التلقائية (بدون تحديد يدوي):</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground font-bold">أطفال</span>
                    <span className="font-black text-indigo-600">50 EGP</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground font-bold">ورقة تانية (مشترك أطفال) — شامل الرمد</span>
                    <span className="font-black text-violet-600">80 EGP</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground font-bold">ورقة تانية (غير مشترك أطفال) — شامل الرمد</span>
                    <span className="font-black text-violet-600">100 EGP</span>
                  </div>
                  <div className="flex items-center justify-between text-xs border-t border-border/40 pt-1.5">
                    <span className="text-muted-foreground font-bold">رمد فقط (بدون ورقة تانية)</span>
                    <span className="font-black text-teal-600">60 EGP</span>
                  </div>
                  <p className="text-[9px] text-amber-600 font-bold mt-1 border-t border-border/30 pt-1">
                    ⚠ مشتركي الرمد + الورقة التانية بيتحسبوا في كارد الورقة التانية
                  </p>
                </div>
              </div>

              {/* Column 2: Exceptions */}
              <div className="bg-amber-500/5 rounded-2xl p-6 border border-amber-500/20 space-y-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                  <h4 className="font-black">استثناءات (مفتحلهم بدون دفع)</h4>
                </div>
                <p className="text-xs text-muted-foreground font-bold">
                  ضع إيميلات المشتركين اللي مفتحتلهم الكورس بدون ما دفعوا — مش هيتحسبوا في الإيرادات
                </p>

                {/* Add exception input */}
                <div className="flex gap-2" dir="ltr">
                  <input
                    type="email"
                    placeholder="example@gmail.com"
                    value={newException}
                    onChange={e => setNewException(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addException(selectedCourse)}
                    className="flex-1 bg-card border-2 border-border rounded-xl px-4 py-2.5 font-bold text-sm outline-none focus:border-amber-500 transition-all"
                  />
                  <button
                    onClick={() => addException(selectedCourse)}
                    className="p-2.5 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-all shadow-md shadow-amber-500/20"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Exception list */}
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {(exceptions[selectedCourse] || []).length === 0 ? (
                    <p className="text-xs text-muted-foreground/60 font-bold text-center py-4">
                      لا توجد استثناءات حتى الآن
                    </p>
                  ) : (
                    (exceptions[selectedCourse] || []).map(email => (
                      <div
                        key={email}
                        className="flex items-center justify-between bg-card rounded-xl px-3 py-2 border border-border/60 group"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Mail className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span className="text-xs font-bold truncate" dir="ltr">{email}</span>
                        </div>
                        <button
                          onClick={() => removeException(selectedCourse, email)}
                          className="p-1 rounded-lg text-muted-foreground hover:bg-rose-500 hover:text-white transition-all opacity-0 group-hover:opacity-100 shrink-0"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Column 3: Course Expenses */}
              <div className="bg-rose-500/5 rounded-2xl p-6 border border-rose-500/20 space-y-3">
                <div className="flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-rose-500" />
                  <h4 className="font-black">مصاريف الكورس (تخصم منه)</h4>
                </div>
                <p className="text-xs text-muted-foreground font-bold">
                  أضف مصاريف خاصة بهذا الكورس ليتم خصمها تلقائياً وحساب صافي الربح
                </p>

                {/* Add expense inputs */}
                <div className="flex flex-col gap-2">
                  <input
                    type="text"
                    placeholder="اسم المصروف (مثال: إيجار، تسويق، ...)"
                    value={newExpenseName}
                    onChange={e => setNewExpenseName(e.target.value)}
                    className="bg-card border-2 border-border rounded-xl px-4 py-2 font-bold text-xs outline-none focus:border-rose-500 transition-all text-right"
                  />
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="number"
                        min="0"
                        placeholder="المبلغ"
                        value={newExpenseAmount}
                        onChange={e => setNewExpenseAmount(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && addCourseExpense(selectedCourse)}
                        className="w-full bg-card border-2 border-border rounded-xl px-4 py-2 font-black text-xs outline-none focus:border-rose-500 transition-all text-right"
                        dir="ltr"
                      />
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground font-bold">EGP</span>
                    </div>
                    <button
                      onClick={() => addCourseExpense(selectedCourse)}
                      className="px-4 py-2 bg-rose-500 text-white rounded-xl hover:bg-rose-600 transition-all shadow-md shadow-rose-500/20 text-xs font-black flex items-center gap-1 shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      إضافة
                    </button>
                  </div>
                </div>

                {/* Expenses list */}
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {!(expenses[selectedCourse] && expenses[selectedCourse].length > 0) ? (
                    <p className="text-xs text-muted-foreground/60 font-bold text-center py-4">
                      لا توجد مصاريف مضافة لهذا الكورس
                    </p>
                  ) : (
                    expenses[selectedCourse].map(exp => (
                      <div
                        key={exp.id}
                        className="flex items-center justify-between bg-card rounded-xl px-3 py-2 border border-border/60 group"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Receipt className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          <span className="text-xs font-black truncate">{exp.name}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs font-black text-rose-500">
                            − {Number(exp.amount).toLocaleString('ar-EG')} EGP
                          </span>
                          <button
                            onClick={() => removeCourseExpense(selectedCourse, exp.id)}
                            className="p-1 rounded-lg text-muted-foreground hover:bg-rose-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* ─ Subscriber List ─ */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-black flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  قائمة المشتركين ({filteredSubscribers.length})
                </h4>
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="ابحث بالاسم أو الإيميل..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="bg-card border-2 border-border rounded-xl pr-10 pl-4 py-2.5 font-bold text-sm outline-none focus:border-primary transition-all w-64"
                  />
                </div>
              </div>

              {filteredSubscribers.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground font-bold">
                  <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  لا يوجد مشتركين
                </div>
              ) : (
                <div className="bg-secondary/10 rounded-2xl border border-border overflow-hidden">
                  <table className="w-full text-right" dir="rtl">
                    <thead>
                      <tr className="bg-secondary/30 border-b border-border">
                        <th className="px-4 py-3 text-xs font-black uppercase tracking-wider text-muted-foreground">المستخدم</th>
                        <th className="px-4 py-3 text-xs font-black uppercase tracking-wider text-muted-foreground text-center">الاشتراكات الأخرى</th>
                        <th className="px-4 py-3 text-xs font-black uppercase tracking-wider text-muted-foreground text-center">السعر المحسوب</th>
                        <th className="px-4 py-3 text-xs font-black uppercase tracking-wider text-muted-foreground text-center">الحالة</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {filteredSubscribers.map(user => {
                        const isException = (exceptions[selectedCourse] || [])
                          .includes((user.email || '').toLowerCase().trim());
                        const userPrices = getPriceForUser(user.spaceSubscriptions || {});
                        const overridePrice = coursePrices[selectedCourse] ? Number(coursePrices[selectedCourse]) : null;
                        const finalPrice = overridePrice !== null ? overridePrice : (userPrices[selectedCourse] || 0);
                        const subs = user.spaceSubscriptions || {};

                        return (
                          <tr
                            key={user.id}
                            className={`transition-colors ${isException ? 'bg-amber-500/5' : 'hover:bg-secondary/10'}`}
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                {user.photoURL ? (
                                  <img
                                    src={user.photoURL}
                                    alt=""
                                    className="w-9 h-9 rounded-xl bg-secondary border border-border shrink-0"
                                  />
                                ) : (
                                  <div className="w-9 h-9 rounded-xl bg-secondary border border-border flex items-center justify-center shrink-0">
                                    <Users className="w-4 h-4 text-muted-foreground" />
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <p className="font-black text-sm truncate">{user.displayName || 'بدون اسم'}</p>
                                  <p className="text-xs text-muted-foreground font-bold truncate" dir="ltr">
                                    {user.email}
                                  </p>
                                </div>
                              </div>
                            </td>

                            {/* Other subscriptions */}
                            <td className="px-4 py-3 text-center">
                              <div className="flex items-center justify-center gap-1.5 flex-wrap">
                                {subs['Pediatrics'] && selectedCourse !== 'pediatrics' && (
                                  <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-600 rounded-lg text-[10px] font-black border border-indigo-500/20">
                                    أطفال
                                  </span>
                                )}
                                {subs['الورقة الثانية'] && selectedCourse !== 'second_paper' && (
                                  <span className="px-2 py-0.5 bg-violet-500/10 text-violet-600 rounded-lg text-[10px] font-black border border-violet-500/20">
                                    ورقة تانية
                                  </span>
                                )}
                                {subs['Opthalmology'] && selectedCourse !== 'ophthalmology' && (
                                  <span className="px-2 py-0.5 bg-teal-500/10 text-teal-600 rounded-lg text-[10px] font-black border border-teal-500/20">
                                    رمد
                                  </span>
                                )}
                                {!subs['Pediatrics'] && !subs['الورقة الثانية'] && !subs['Opthalmology'] && (
                                  <span className="text-[10px] text-muted-foreground font-bold">—</span>
                                )}
                              </div>
                            </td>

                            {/* Computed price */}
                            <td className="px-4 py-3 text-center">
                              <span className={`font-black text-sm ${isException ? 'line-through text-muted-foreground' : 'text-emerald-600'}`}>
                                {finalPrice} EGP
                              </span>
                              {overridePrice !== null && (
                                <span className="block text-[9px] text-muted-foreground font-bold">يدوي</span>
                              )}
                            </td>

                            {/* Status */}
                            <td className="px-4 py-3 text-center">
                              {isException ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-500/10 text-amber-600 rounded-xl text-[10px] font-black border border-amber-500/20">
                                  <XCircle className="w-3 h-3" />
                                  استثناء
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-500/10 text-emerald-600 rounded-xl text-[10px] font-black border border-emerald-500/20">
                                  <CheckCircle2 className="w-3 h-3" />
                                  دافع
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* ─ Revenue Summary Footer ─ */}
            <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-500/10 rounded-2xl">
                  <TrendingUp className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="font-black text-lg">صافي إيرادات الكورس المتوقعة</p>
                  <p className="text-xs text-muted-foreground font-bold">
                    {stats.paying} دافع × {coursePrices[selectedCourse] ? `${coursePrices[selectedCourse]} EGP (سعر ثابت)` : 'سعر تلقائي لكل مستخدم'}
                    {stats.exceptions > 0 ? ` — ${stats.exceptions} استثناء مستبعد` : ''}
                  </p>
                  {stats.expenses > 0 && (
                    <p className="text-xs text-rose-500 font-bold mt-0.5">
                      − {stats.expenses.toLocaleString('ar-EG')} EGP مصاريف الكورس
                      {' '}= صافي {stats.netRevenue.toLocaleString('ar-EG')} EGP
                    </p>
                  )}
                </div>
              </div>
              <div className="text-center md:text-right">
                <p className="text-4xl font-black text-emerald-600">
                  {stats.revenue.toLocaleString('ar-EG')}
                </p>
                <p className="text-sm font-black text-muted-foreground">جنيه مصري (إجمالي الإيرادات)</p>
                {stats.expenses > 0 && (
                  <p className={`text-2xl font-black mt-1 ${
                    stats.netRevenue >= 0 ? 'text-teal-600' : 'text-rose-500'
                  }`}>
                    {stats.netRevenue.toLocaleString('ar-EG')}
                    <span className="text-xs text-muted-foreground font-bold mr-1">صافي الكورس</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ Platform Financial Summary Card ════════════════════════════════════ */}
      <div className="bg-card border-2 border-primary/20 rounded-[2.5rem] overflow-hidden shadow-xl">
        <div className="p-6 md:p-8 bg-primary/5 border-b border-primary/10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-primary/10">
                <TrendingUp className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-black">الملخص المالي للمنصة بالكامل</h3>
                <p className="text-muted-foreground text-xs font-bold">تجميع إيرادات ومصاريف كل الكورسات وصافي الأرباح الكلية</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-6 text-center">
            <p className="text-3xl font-black text-emerald-600">{platformStats.gross.toLocaleString('ar-EG')}</p>
            <p className="text-xs font-black text-muted-foreground mt-1">EGP إجمالي الإيرادات الكلية</p>
          </div>
          <div className="bg-rose-500/5 border border-rose-500/20 rounded-2xl p-6 text-center">
            <p className="text-3xl font-black text-rose-500">{platformStats.expenses.toLocaleString('ar-EG')}</p>
            <p className="text-xs font-black text-muted-foreground mt-1">EGP إجمالي المصاريف الكلية</p>
          </div>
          <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 rounded-2xl p-6 text-center">
            <p className="text-4xl font-black text-emerald-600">{platformStats.net.toLocaleString('ar-EG')}</p>
            <p className="text-sm font-black text-primary mt-1">EGP صافي الربح الكلي للمنصة</p>
          </div>
        </div>
      </div>

      {/* All courses collapsed hint */}
      {!selectedCourse && (
        <div className="text-center py-8 text-muted-foreground font-bold text-sm">
          <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-20" />
          اضغط على أي كورس لعرض تفاصيل المشتركين والمصاريف والاستثناءات الخاصة به
        </div>
      )}
    </div>
  );
}
