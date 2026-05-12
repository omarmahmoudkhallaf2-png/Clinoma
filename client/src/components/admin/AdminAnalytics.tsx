import { useMemo } from 'react';
import { 
  Users, HelpCircle, FileText, 
  Target, Zap, 
  ArrowUpRight, ArrowDownRight, Layers, Check, Clock
} from 'lucide-react';

interface AnalyticsProps {
  questions: any[];
  notes: any[];
  users: any[];
}

export default function AdminAnalytics({ questions, notes, users }: AnalyticsProps) {
  const stats = useMemo(() => {
    const categories = questions.reduce((acc: any, q) => {
      acc[q.category] = (acc[q.category] || 0) + 1;
      return acc;
    }, {});

    const statusCounts = questions.reduce((acc: any, q) => {
      acc[q.status || 'published'] = (acc[q.status || 'published'] || 0) + 1;
      return acc;
    }, {});

    // Calculate Active Users (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const activeUsers = users.filter(u => {
      if (!u.lastActiveAt) return false;
      const lastActive = u.lastActiveAt.toDate ? u.lastActiveAt.toDate() : new Date(u.lastActiveAt);
      return lastActive > sevenDaysAgo;
    }).length;

    return {
      totalQuestions: questions.length,
      totalNotes: notes.length,
      totalUsers: users.length,
      activeUsers: activeUsers,
      categories: Object.entries(categories).sort((a: any, b: any) => b[1] - a[1]),
      status: statusCounts
    };
  }, [questions, notes, users]);

  return (
    <div className="p-10 space-y-10 animate-in fade-in duration-700">
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: 'إجمالي الأسئلة', value: stats.totalQuestions, icon: HelpCircle, color: 'primary', trend: '+12%' },
          { label: 'النوتس التعليمية', value: stats.totalNotes, icon: FileText, color: 'indigo', trend: '+5%' },
          { label: 'المستخدمين النشطين (7 أيام)', value: stats.activeUsers.toLocaleString(), icon: Zap, color: 'emerald', trend: '+18%' },
          { label: 'إجمالي المشتركين', value: stats.totalUsers.toLocaleString(), icon: Users, color: 'amber', trend: '+24%' },
        ].map((stat, i) => (
          <div key={i} className="bg-card border-2 border-border p-8 rounded-[3rem] shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all group">
            <div className="flex justify-between items-start mb-6">
              <div className={`p-4 rounded-2xl bg-${stat.color}-500/10 text-${stat.color}-600 group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-8 h-8" />
              </div>
              <div className={`flex items-center gap-1 text-xs font-black ${stat.trend.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'}`}>
                {stat.trend.startsWith('+') ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                {stat.trend}
              </div>
            </div>
            <div className="text-5xl font-black mb-2">{stat.value}</div>
            <div className="text-muted-foreground font-bold uppercase tracking-widest text-xs">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Category Distribution Chart */}
        <div className="lg:col-span-2 bg-card border-2 border-border rounded-[4rem] p-10 shadow-sm">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="text-3xl font-black">توزيع الأسئلة حسب المواد</h3>
              <p className="text-muted-foreground font-bold">Question Distribution by Subject</p>
            </div>
            <div className="p-4 bg-primary/10 text-primary rounded-2xl">
              <Layers className="w-8 h-8" />
            </div>
          </div>

          <div className="space-y-6">
            {stats.categories.slice(0, 6).map(([name, count]: any, i) => {
              const percentage = (count / stats.totalQuestions) * 100;
              return (
                <div key={name} className="space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="font-black text-lg">{name}</span>
                    <span className="font-bold text-muted-foreground text-sm">{count} Questions ({Math.round(percentage)}%)</span>
                  </div>
                  <div className="h-4 bg-secondary/30 rounded-full overflow-hidden border border-border">
                    <div 
                      className={`h-full bg-primary rounded-full transition-all duration-1000 delay-${i*100}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="bg-card border-2 border-border rounded-[4rem] p-10 shadow-sm flex flex-col">
          <div className="mb-10">
            <h3 className="text-3xl font-black">حالة المحتوى</h3>
            <p className="text-muted-foreground font-bold">Content Status Flow</p>
          </div>

          <div className="flex-1 flex flex-col justify-center space-y-8">
            {[
              { label: 'تم النشر', count: stats.status.published || 0, color: 'bg-emerald-500', icon: Check },
              { label: 'تحت المراجعة', count: stats.status.review || 0, color: 'bg-amber-500', icon: Clock },
              { label: 'مسودة', count: stats.status.draft || 0, color: 'bg-indigo-500', icon: FileText },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-6 p-6 bg-secondary/20 rounded-[2.5rem] border-2 border-border hover:border-primary/30 transition-all">
                <div className={`w-14 h-14 rounded-2xl ${s.color} text-white flex items-center justify-center shadow-lg`}>
                  <s.icon className="w-8 h-8" />
                </div>
                <div className="flex-1">
                  <div className="text-3xl font-black">{s.count}</div>
                  <div className="text-xs font-black uppercase text-muted-foreground tracking-widest">{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Real-time Activity Feed Mockup */}
      <div className="bg-card border-2 border-border rounded-[4rem] p-10 shadow-sm">
        <div className="flex items-center gap-4 mb-10">
          <div className="p-4 bg-indigo-600 text-white rounded-[2rem] shadow-xl shadow-indigo-600/20 animate-pulse">
            <Zap className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-3xl font-black">النشاط المباشر</h3>
            <p className="text-muted-foreground font-bold">Real-time Admin Activity Feed</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { user: 'Admin System', action: 'Added 24 new questions to Physiology', time: '2 mins ago' },
            { user: 'Editor Sara', action: 'Published Cardiology Note set', time: '15 mins ago' },
            { user: 'Reviewer Team', action: 'Flagged 2 questions for review', time: '1 hour ago' },
          ].map((item, i) => (
            <div key={i} className="p-6 bg-secondary/10 border-2 border-border rounded-3xl space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center text-primary font-black text-xs">
                  {item.user.charAt(0)}
                </div>
                <span className="font-black text-sm">{item.user}</span>
              </div>
              <p className="font-bold text-muted-foreground text-sm">{item.action}</p>
              <p className="text-[10px] font-black uppercase text-primary/60">{item.time}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
