import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../lib/firebase';
import { 
  collection, doc, getDoc, getDocs, updateDoc, setDoc, arrayUnion, deleteDoc 
} from 'firebase/firestore';
import { 
  Trophy, Users, UserPlus, PlusCircle, Copy, Check, RefreshCw, ArrowLeft, ArrowRight, Shield, Crown, Sparkles, Star
} from 'lucide-react';
import toast from 'react-hot-toast';

interface GroupMember {
  userId: string;
  name: string;
  avatar: string;
  points?: number;
}

interface FantasyGroup {
  id: string;
  name: string;
  course: string;
  createdBy: string;
  createdAt: number;
  members: GroupMember[];
}

const AVATARS = [
  { id: 'av1', url: 'https://api.dicebear.com/7.x/notionists/svg?seed=Felix&backgroundColor=b6e3f4', label: 'المثقف', color: 'from-blue-500 to-indigo-600' },
  { id: 'av2', url: 'https://api.dicebear.com/7.x/notionists/svg?seed=Aneka&backgroundColor=ffdfbf', label: 'الذكية', color: 'from-rose-500 to-pink-600' },
  { id: 'av3', url: 'https://api.dicebear.com/7.x/notionists/svg?seed=Jasper&backgroundColor=c0aede', label: 'الهادئ', color: 'from-purple-500 to-violet-600' },
  { id: 'av4', url: 'https://api.dicebear.com/7.x/notionists/svg?seed=Luna&backgroundColor=d1d4f9', label: 'الحالمة', color: 'from-indigo-500 to-cyan-600' },
  { id: 'av5', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Max&backgroundColor=b6e3f4', label: 'المغامر', color: 'from-amber-500 to-orange-600' },
  { id: 'av6', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Bella&backgroundColor=ffdfbf', label: 'النشيطة', color: 'from-emerald-500 to-teal-600' },
  { id: 'av7', url: 'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=Hacker&backgroundColor=c0aede', label: 'المبرمج', color: 'from-slate-700 to-slate-900' },
  { id: 'av8', url: 'https://api.dicebear.com/7.x/big-smile/svg?seed=Star&backgroundColor=d1d4f9', label: 'الضاحك', color: 'from-yellow-400 to-amber-600' },
  { id: 'av9', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Buster&backgroundColor=ffdfbf', label: 'البطل', color: 'from-red-500 to-yellow-500' },
  { id: 'av10', url: 'https://api.dicebear.com/7.x/open-peeps/svg?seed=Kiki&backgroundColor=c0aede', label: 'الفنانة', color: 'from-purple-600 to-pink-500' },
  { id: 'av11', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Milo&backgroundColor=b6e3f4', label: 'الطموح', color: 'from-green-600 to-emerald-800' },
  { id: 'av12', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Robo&backgroundColor=ffdfbf', label: 'الآلي', color: 'from-orange-400 to-red-600' }
];

export default function FantasyGroups() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [groups, setGroups] = useState<FantasyGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeGroup, setActiveGroup] = useState<FantasyGroup | null>(null);
  const [leaderboard, setLeaderboard] = useState<GroupMember[]>([]);
  const [refreshingLeaderboard, setRefreshingLeaderboard] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Forms
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  
  const [createName, setCreateName] = useState('');
  const [createCourse, setCreateCourse] = useState('Pediatrics');
  const [createNickname, setCreateNickname] = useState('');
  const [createAvatar, setCreateAvatar] = useState('av1');

  const [joinCode, setJoinCode] = useState('');
  const [joinNickname, setJoinNickname] = useState('');
  const [joinAvatar, setJoinAvatar] = useState('av1');

  useEffect(() => {
    fetchMyGroups();
  }, [user]);

  const fetchMyGroups = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'fantasy_groups'));
      const list = snap.docs.map(d => d.data() as FantasyGroup);
      const filtered = list.filter(g => g.members?.some(m => m.userId === user.uid));
      setGroups(filtered);
    } catch (err) {
      console.error(err);
      toast.error('خطأ أثناء تحميل المجموعات');
    } finally {
      setLoading(false);
    }
  };

  const loadLeaderboard = async (group: FantasyGroup) => {
    setRefreshingLeaderboard(true);
    try {
      const membersWithScores = await Promise.all(
        group.members.map(async (member) => {
          const uSnap = await getDoc(doc(db, 'users', member.userId));
          if (uSnap.exists()) {
            const uData = uSnap.data();
            const courseKey = `points_${group.course}`;
            // Fallback chain for points
            const points = uData[courseKey] ?? uData.spacePoints ?? uData.points ?? 0;
            return { ...member, points };
          }
          return { ...member, points: 0 };
        })
      );
      // Sort members by points descending
      membersWithScores.sort((a, b) => (b.points || 0) - (a.points || 0));
      setLeaderboard(membersWithScores);
    } catch (err) {
      console.error(err);
      toast.error('خطأ أثناء تحديث الترتيب');
    } finally {
      setRefreshingLeaderboard(false);
    }
  };

  const handleSelectGroup = async (group: FantasyGroup) => {
    setActiveGroup(group);
    await loadLeaderboard(group);
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!createName.trim() || !createNickname.trim()) {
      toast.error('يرجى ملء جميع الحقول');
      return;
    }

    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const newGroup: FantasyGroup = {
      id: code,
      name: createName.trim(),
      course: createCourse,
      createdBy: user.uid,
      createdAt: Date.now(),
      members: [
        {
          userId: user.uid,
          name: createNickname.trim(),
          avatar: createAvatar
        }
      ]
    };

    try {
      await setDoc(doc(db, 'fantasy_groups', code), newGroup);
      toast.success('تم إنشاء المجموعة بنجاح! 🎉');
      setCreateName('');
      setCreateNickname('');
      setShowCreate(false);
      fetchMyGroups();
    } catch (err) {
      console.error(err);
      toast.error('فشل إنشاء المجموعة');
    }
  };

  const handleJoinGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const cleanCode = joinCode.trim().toUpperCase();
    if (!cleanCode || !joinNickname.trim()) {
      toast.error('يرجى ملء جميع الحقول');
      return;
    }

    try {
      const gRef = doc(db, 'fantasy_groups', cleanCode);
      const gSnap = await getDoc(gRef);
      if (!gSnap.exists()) {
        toast.error('كود الانضمام غير صحيح');
        return;
      }

      const gData = gSnap.data() as FantasyGroup;
      if (gData.members.some(m => m.userId === user.uid)) {
        toast.error('أنت عضو بالفعل في هذه المجموعة');
        return;
      }

      const updatedMembers = [
        ...gData.members,
        {
          userId: user.uid,
          name: joinNickname.trim(),
          avatar: joinAvatar
        }
      ];

      await updateDoc(gRef, { members: updatedMembers });
      toast.success('تم الانضمام للمجموعة بنجاح! 🚀');
      setJoinCode('');
      setJoinNickname('');
      setShowJoin(false);
      fetchMyGroups();
    } catch (err) {
      console.error(err);
      toast.error('فشل الانضمام للمجموعة');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    toast.success('تم نسخ الكود بنجاح!');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleDeleteGroup = async () => {
    if (!activeGroup || !user) return;
    if (activeGroup.createdBy !== user.uid) {
      toast.error('أنت لست منشئ هذه المجموعة لحذفها');
      return;
    }
    
    const confirmDelete = window.confirm('هل أنت متأكد من رغبتك في حذف هذه المجموعة نهائياً؟');
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, 'fantasy_groups', activeGroup.id));
      toast.success('تم حذف المجموعة بنجاح');
      setActiveGroup(null);
      fetchMyGroups();
    } catch (err) {
      console.error(err);
      toast.error('فشل في حذف المجموعة');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans overflow-y-auto pb-24" style={{background: 'linear-gradient(160deg, #090a0f 0%, #0e111a 100%)'}}>
      {/* Header */}
      <div className="h-20 bg-slate-900/80 backdrop-blur-xl border-b border-white/5 px-6 flex items-center justify-between">
        <button onClick={() => navigate('/flashcards/space')} className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-slate-400 font-bold text-xs flex items-center gap-2 transition-all">
          <ArrowLeft className="w-4 h-4" /> العودة للوحات
        </button>
        <div className="flex items-center gap-3">
          <span className="text-xl font-black bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Challenge Fantasy Groups</span>
          <Trophy className="w-6 h-6 text-amber-400" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Groups list & Forms */}
        <div className={`lg:col-span-4 space-y-6 ${activeGroup ? 'hidden lg:block' : 'block'}`}>
          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => { setShowCreate(true); setShowJoin(false); }}
              className="py-4 bg-gradient-to-br from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 rounded-3xl font-black text-xs uppercase flex flex-col items-center justify-center gap-2 border border-indigo-400/20 shadow-lg shadow-indigo-600/10 active:scale-95 transition-all"
            >
              <PlusCircle className="w-5 h-5" />
              إنشاء مجموعة
            </button>
            <button 
              onClick={() => { setShowJoin(true); setShowCreate(false); }}
              className="py-4 bg-slate-900/50 hover:bg-slate-800/50 border border-white/5 rounded-3xl font-black text-xs uppercase flex flex-col items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <UserPlus className="w-5 h-5 text-indigo-400" />
              انضمام لكود
            </button>
          </div>

          {/* Create Group Panel */}
          {showCreate && (
            <form onSubmit={handleCreateGroup} className="bg-slate-900/40 backdrop-blur-xl border border-indigo-500/20 rounded-[2rem] p-6 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
              <h3 className="text-lg font-black text-indigo-300 flex items-center gap-2 justify-end" dir="rtl">
                <span>إنشاء مجموعة تحدي جديدة</span>
                <PlusCircle className="w-5 h-5" />
              </h3>
              
              <div className="space-y-1.5 text-right" dir="rtl">
                <label className="text-xs font-bold text-slate-400">اسم المجموعة</label>
                <input 
                  type="text" 
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  placeholder="مثال: عباقرة الأطفال"
                  className="w-full bg-slate-950 border border-white/5 rounded-2xl px-4 py-3.5 text-sm text-white focus:border-indigo-500 focus:outline-none transition-colors"
                />
              </div>

              <div className="space-y-1.5 text-right" dir="rtl">
                <label className="text-xs font-bold text-slate-400">المادة المخصصة</label>
                <select 
                  value={createCourse}
                  onChange={(e) => setCreateCourse(e.target.value)}
                  className="w-full bg-slate-950 border border-white/5 rounded-2xl px-4 py-3.5 text-sm text-white focus:border-indigo-500 focus:outline-none transition-colors"
                >
                  <option value="Pediatrics">طب الأطفال (Pediatrics)</option>
                  <option value="الورقة الثانية">الورقة الثانية (Second Paper)</option>
                </select>
              </div>

              <div className="space-y-1.5 text-right" dir="rtl">
                <label className="text-xs font-bold text-slate-400">اسمك داخل المجموعة</label>
                <input 
                  type="text" 
                  value={createNickname}
                  onChange={(e) => setCreateNickname(e.target.value)}
                  placeholder="مثال: د. أحمد"
                  className="w-full bg-slate-950 border border-white/5 rounded-2xl px-4 py-3.5 text-sm text-white focus:border-indigo-500 focus:outline-none transition-colors"
                />
              </div>

              {/* Avatar Selector */}
              <div className="space-y-2 text-right" dir="rtl">
                <label className="text-xs font-bold text-slate-400">اختر الأفاتار الخاص بك</label>
                <div className="grid grid-cols-4 gap-2">
                  {AVATARS.map(av => (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() => setCreateAvatar(av.id)}
                      className={`relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br ${av.color} ${createAvatar === av.id ? 'ring-2 ring-indigo-400 scale-105' : 'opacity-65 hover:opacity-100'} transition-all`}
                    >
                      <img src={av.url} alt={av.label} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button type="submit" className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 font-bold rounded-xl text-xs transition-colors">تأكيد الإنشاء</button>
                <button type="button" onClick={() => setShowCreate(false)} className="px-5 py-3 bg-white/5 hover:bg-white/10 font-bold rounded-xl text-xs transition-colors">إلغاء</button>
              </div>
            </form>
          )}

          {/* Join Group Panel */}
          {showJoin && (
            <form onSubmit={handleJoinGroup} className="bg-slate-900/40 backdrop-blur-xl border border-indigo-500/20 rounded-[2rem] p-6 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
              <h3 className="text-lg font-black text-indigo-300 flex items-center gap-2 justify-end" dir="rtl">
                <span>الانضمام لمجموعة عبر كود</span>
                <UserPlus className="w-5 h-5" />
              </h3>
              
              <div className="space-y-1.5 text-right" dir="rtl">
                <label className="text-xs font-bold text-slate-400">كود المجموعة (6 رموز)</label>
                <input 
                  type="text" 
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  placeholder="مثال: AB12XY"
                  className="w-full bg-slate-950 border border-white/5 rounded-2xl px-4 py-3.5 text-sm text-white focus:border-indigo-500 focus:outline-none transition-colors tracking-widest uppercase font-mono text-center"
                />
              </div>

              <div className="space-y-1.5 text-right" dir="rtl">
                <label className="text-xs font-bold text-slate-400">اسمك داخل المجموعة</label>
                <input 
                  type="text" 
                  value={joinNickname}
                  onChange={(e) => setJoinNickname(e.target.value)}
                  placeholder="مثال: د. محمد"
                  className="w-full bg-slate-950 border border-white/5 rounded-2xl px-4 py-3.5 text-sm text-white focus:border-indigo-500 focus:outline-none transition-colors"
                />
              </div>

              {/* Avatar Selector */}
              <div className="space-y-2 text-right" dir="rtl">
                <label className="text-xs font-bold text-slate-400">اختر الأفاتار الخاص بك</label>
                <div className="grid grid-cols-4 gap-2">
                  {AVATARS.map(av => (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() => setJoinAvatar(av.id)}
                      className={`relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br ${av.color} ${joinAvatar === av.id ? 'ring-2 ring-indigo-400 scale-105' : 'opacity-65 hover:opacity-100'} transition-all`}
                    >
                      <img src={av.url} alt={av.label} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button type="submit" className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 font-bold rounded-xl text-xs transition-colors">انضمام الآن</button>
                <button type="button" onClick={() => setShowJoin(false)} className="px-5 py-3 bg-white/5 hover:bg-white/10 font-bold rounded-xl text-xs transition-colors">إلغاء</button>
              </div>
            </form>
          )}

          {/* Groups List */}
          <div className="space-y-3">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest px-2 text-right">مجموعاتك ({groups.length})</h3>
            
            {loading ? (
              <div className="py-12 flex justify-center">
                <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : groups.length === 0 ? (
              <div className="bg-slate-900/20 border border-white/5 rounded-[2rem] p-8 text-center text-slate-500 font-bold text-sm">
                لم تنضم لأي مجموعات بعد. أنشئ مجموعة وشارك الكود مع أصدقائك!
              </div>
            ) : (
              <div className="space-y-2">
                {groups.map(g => (
                  <button 
                    key={g.id} 
                    onClick={() => handleSelectGroup(g)}
                    className={`w-full p-5 rounded-[2rem] text-right transition-all flex justify-between items-center ${activeGroup?.id === g.id ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/10 border border-indigo-500' : 'bg-slate-900/30 hover:bg-slate-900/50 border border-white/5'}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black px-2 py-1 bg-white/10 rounded-lg">{g.members.length} أعضاء</span>
                    </div>
                    <div className="space-y-1">
                      <div className="font-black text-base">{g.name}</div>
                      <div className="text-[10px] opacity-75 font-semibold">مادة التحدي: {g.course}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Active Group Leaderboard */}
        <div className={`lg:col-span-8 ${!activeGroup ? 'hidden lg:block' : 'block'}`}>
          {activeGroup ? (
            <div className="bg-slate-900/30 border border-white/5 rounded-[2.5rem] p-6 md:p-8 space-y-6 relative overflow-hidden">
              {/* Back to list button on mobile */}
              <button 
                onClick={() => setActiveGroup(null)}
                className="lg:hidden mb-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-slate-400 font-bold text-xs flex items-center gap-2 transition-all w-fit"
              >
                <ArrowRight className="w-4 h-4" /> العودة لقائمة المجموعات
              </button>
              {/* Background glows */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-72 bg-indigo-500/10 blur-[80px] rounded-full -z-10" />

              {/* Group Header Info */}
              <div className="flex flex-col md:flex-row justify-between items-center gap-6 border-b border-white/5 pb-6">
                {/* Actions (Invite & Refresh) */}
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => copyToClipboard(activeGroup.id)}
                    className="px-4 py-2.5 bg-slate-950 hover:bg-slate-900 border border-white/5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all active:scale-95"
                  >
                    {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-indigo-400" />}
                    <span>كود الدعوة: <span className="font-mono text-white tracking-widest">{activeGroup.id}</span></span>
                  </button>

                  <button 
                    onClick={() => loadLeaderboard(activeGroup)}
                    disabled={refreshingLeaderboard}
                    className="p-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white transition-all disabled:opacity-50 active:scale-95 flex items-center gap-2 text-xs font-bold"
                  >
                    <RefreshCw className={`w-4 h-4 ${refreshingLeaderboard ? 'animate-spin' : ''}`} />
                    تحديث
                  </button>

                  {activeGroup.createdBy === user?.uid && (
                    <button 
                      onClick={handleDeleteGroup}
                      className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 rounded-xl text-white transition-all active:scale-95 text-xs font-bold flex items-center gap-2"
                    >
                      حذف المجموعة 🗑️
                    </button>
                  )}
                </div>

                <div className="text-center md:text-right space-y-2">
                  <h2 className="text-3xl font-black text-white flex items-center gap-2 justify-end">
                    <span>{activeGroup.name}</span>
                    <Sparkles className="w-5 h-5 text-indigo-400" />
                  </h2>
                  <p className="text-slate-400 text-xs font-bold">تحدي نقاط: <span className="text-indigo-400">{activeGroup.course}</span></p>
                </div>
              </div>

              {/* Leaderboard Table */}
              <div className="space-y-3">
                {refreshingLeaderboard ? (
                  <div className="py-24 flex flex-col items-center justify-center gap-4">
                    <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs font-bold text-slate-500 animate-pulse">جاري سحب نقاط الطلاب وتحديث الترتيب...</p>
                  </div>
                ) : (
                  <div className="space-y-3" dir="rtl">
                    {leaderboard.map((member, index) => {
                      const avInfo = AVATARS.find(a => a.id === member.avatar) || AVATARS[0];
                      const isCurrentUser = member.userId === user?.uid;
                      const rank = index + 1;

                      return (
                        <div 
                          key={member.userId}
                          className={`relative p-5 rounded-[2rem] border transition-all flex items-center justify-between ${isCurrentUser ? 'bg-indigo-600/20 border-indigo-500/40 shadow-lg shadow-indigo-600/5' : 'bg-slate-950/40 border-white/5 hover:border-white/10'}`}
                        >
                          <div className="flex items-center gap-4">
                            {/* Rank Indicator */}
                            <div className="w-10 h-10 flex items-center justify-center font-black text-lg">
                              {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank}
                            </div>

                            {/* Avatar */}
                            <div className={`w-14 h-14 rounded-2xl overflow-hidden flex items-center justify-center bg-gradient-to-br ${avInfo.color} border border-white/10 shadow-inner`}>
                              <img src={avInfo.url} alt={avInfo.label} className="w-full h-full object-cover" />
                            </div>

                            {/* Name */}
                            <div className="space-y-1">
                              <div className="font-black text-lg flex items-center gap-2">
                                <span>{member.name}</span>
                                {isCurrentUser && <span className="text-[10px] font-black bg-indigo-500 text-white px-2 py-0.5 rounded-full">أنت</span>}
                              </div>
                              <div className="text-[10px] font-bold text-slate-500">{avInfo.label}</div>
                            </div>
                          </div>

                          {/* Points Display */}
                          <div className="text-right">
                            <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">{member.points ?? 0}</div>
                            <div className="text-[9px] font-black text-amber-400 uppercase tracking-widest mt-0.5">نقطة كورس</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/10 border border-white/5 rounded-[2.5rem] p-12 text-center h-[500px] flex flex-col items-center justify-center text-slate-500">
              <Trophy className="w-16 h-16 opacity-25 text-indigo-400 mb-6" />
              <h3 className="text-xl font-black text-white/80 mb-2">مجموعات التحدي (Fantasy)</h3>
              <p className="max-w-md text-sm leading-relaxed opacity-75">قم باختيار أو إنشاء مجموعة تحدي بينك وبين أصدقائك لرؤية من يستطيع تجميع أكبر عدد من النقاط في الكورس المختار!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
