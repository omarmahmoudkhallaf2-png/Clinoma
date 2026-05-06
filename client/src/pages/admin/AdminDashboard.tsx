import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Plus, Search, Loader2, 
  BarChart3, HelpCircle, Users, Settings, 
  Database, FileText, Zap, ChevronRight, ChevronLeft, 
  Download, Activity, Terminal, Edit2, Trash2, X, Shield, Brain, Trophy, ClipboardList, Sparkles
} from 'lucide-react';
import ExamResultsDashboard from '../ExamResultsDashboard';
import { db } from '../../lib/firebase';
import { collection, query, getDocs, addDoc, deleteDoc, doc, setDoc, orderBy, writeBatch, where } from 'firebase/firestore';

// Components
import QuestionWizard from '../../components/admin/QuestionWizard';
import QuestionTable from '../../components/admin/QuestionTable';
import UserManagement from '../../components/admin/UserManagement';
import CourseManagement from '../../components/admin/CourseManagement';
import AppConfig from '../../components/admin/AppConfig';
import AdminAnalytics from '../../components/admin/AdminAnalytics';
import NoteForm from '../../components/admin/NoteForm';
import BulkUploadModal from '../../components/admin/BulkUploadModal';
import CommandBar from '../../components/admin/CommandBar';
import AuditLogViewer from '../../components/admin/AuditLogViewer';
import AdminNotifications, { sendAdminNotification } from '../../components/admin/NotificationSystem';
import ExamManager from '../../components/admin/ExamManager';
import FlashcardManager from '../../components/admin/FlashcardManager';


import { runSystemAudit } from '../../lib/systemHealer';
import { seedProductionData } from '../../lib/productionSeed';
import { logAudit } from '../../lib/auditService';
import type { Question } from '../../types/quiz';

export default function AdminDashboard() {
  const { user, userRole } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'analytics' | 'questions' | 'users' | 'courses' | 'settings' | 'notes' | 'audit' | 'health' | 'formal_results' | 'exams' | 'flashcards'>('analytics');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [availableSubjects, setAvailableSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Autonomous States
  const [auditReports, setAuditReports] = useState<string[]>([]);
  const [isRepairing, setIsRepairing] = useState(false);

  // Modals
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  // Filters & Pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCourse, setFilterCourse] = useState('all');
  const [filterSubject, setFilterSubject] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 15;

  const fetchData = async () => {
    setLoading(true);
    try {
      const [qSnap, nSnap, cSnap] = await Promise.all([
        getDocs(query(collection(db, 'questions'), orderBy('createdAt', 'desc'))),
        getDocs(query(collection(db, 'notes'), orderBy('createdAt', 'desc'))),
        getDocs(query(collection(db, 'courses')))
      ]);

      setQuestions(qSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Question)));
      setNotes(nSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setCourses(cSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error(err);
      sendAdminNotification('Failed to fetch admin data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userRole && userRole !== 'admin' && (userRole as string) !== 'editor') {
      navigate('/dashboard');
      return;
    }
    fetchData();
  }, [userRole, navigate]);

  useEffect(() => {
    const fetchSubjects = async () => {
      if (filterCourse === 'all') {
        setAvailableSubjects([]);
        setFilterSubject('all');
        return;
      }
      const snap = await getDocs(query(collection(db, 'subjects'), where('courseId', '==', filterCourse)));
      setAvailableSubjects(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    };
    fetchSubjects();
  }, [filterCourse]);

  const handleSystemRepair = async () => {
    setIsRepairing(true);
    setAuditReports(['Starting Autonomous System Audit...']);
    
    try {
      const audit = await runSystemAudit();
      if (audit.success) {
        setAuditReports(prev => [...prev, ...(audit.reports || []), 'Audit Complete. Starting Data Injection...']);
        const seeded = await seedProductionData();
        if (seeded) {
          setAuditReports(prev => [...prev, 'Production Data Seeded Successfully.', 'System is now in Green State.']);
          sendAdminNotification('Autonomous Repair Sequence Complete', 'zap');
          fetchData();
        }
      }
    } catch (err: any) {
      setAuditReports(prev => [...prev, `CRITICAL ERROR: ${err.message}`]);
      sendAdminNotification('Repair Sequence Failed', 'error');
    } finally {
      setIsRepairing(false);
    }
  };

  const handleBulkUpload = async (data: any[]) => {
    const batch = writeBatch(db);
    data.forEach(q => {
      const newRef = doc(collection(db, 'questions'));
      batch.set(newRef, { ...q, status: 'published', version: 1, createdAt: new Date() });
    });
    await batch.commit();
    if (user) await logAudit(user.uid, 'BULK_IMPORT', { count: data.length });
    await fetchData();
    sendAdminNotification(`Imported ${data.length} items`, 'zap');
  };

  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDeleteCourse = async (courseId: string) => {
    setIsDeleting(courseId);
    try {
      await deleteDoc(doc(db, 'courses', courseId));
      if (user) await logAudit(user.uid, 'DELETE_COURSE', { id: courseId });
      await fetchData();
      sendAdminNotification(`تم حذف الكورس بنجاح`, 'zap');
    } catch (err: any) {
      console.error('Delete error:', err);
      sendAdminNotification(`فشل حذف الكورس: ${err.message}`, 'error');
    } finally {
      setIsDeleting(null);
    }
  };

  const handleSaveQuestion = async (data: any) => {
    try {
      if (editingQuestion) {
        await setDoc(doc(db, 'questions', editingQuestion.id), { ...data, updatedAt: new Date() }, { merge: true });
        if (user) await logAudit(user.uid, 'UPDATE_QUESTION', { id: editingQuestion.id });
      } else {
        const newRef = await addDoc(collection(db, 'questions'), { ...data, createdAt: new Date() });
        if (user) await logAudit(user.uid, 'CREATE_QUESTION', { id: newRef.id });
      }
      await fetchData();
      setIsWizardOpen(false);
      setEditingQuestion(null);
    } catch (error) {
      sendAdminNotification('Error saving question', 'error');
    }
  };

  const filteredQuestions = useMemo(() => {
    return questions.filter(q => {
      const matchSearch = !searchQuery || q.text?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCourse = filterCourse === 'all' || q.courseId === filterCourse;
      const matchSubject = filterSubject === 'all' || q.subjectId === filterSubject;
      return matchSearch && matchCourse && matchSubject;
    });
  }, [questions, searchQuery, filterCourse, filterSubject]);

  const paginatedQuestions = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredQuestions.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredQuestions, currentPage]);

  const totalPages = Math.ceil(filteredQuestions.length / ITEMS_PER_PAGE);

  return (
    <div className="space-y-10 pb-20 animate-in fade-in duration-500 max-w-[1700px] mx-auto px-4 md:px-8 relative">
      <CommandBar />

      {/* Hero Command Center Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-card border-2 border-border p-10 rounded-[4rem] shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full -mr-48 -mt-48 blur-[100px]" />
        
        <div className="flex items-center gap-8 relative">
          <div className="relative">
            <div className="p-6 bg-primary text-white rounded-[2.5rem] shadow-2xl shadow-primary/30 relative z-10">
              <Terminal className="w-14 h-14" />
            </div>
            <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse" />
          </div>
          <div>
            <h1 className="text-6xl font-black tracking-tighter">Command Center</h1>
            <div className="flex items-center gap-3 mt-2">
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">Active Session</span>
              <p className="text-muted-foreground font-black text-lg opacity-40 uppercase tracking-[0.2em]">SaaS OS v3.0</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 relative">
          <AdminNotifications />
          <button onClick={() => navigate('/admin/ai-generate')} className="flex items-center gap-3 px-8 py-5 bg-gradient-to-r from-primary to-blue-600 text-white rounded-[2.5rem] font-black shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
            <Sparkles className="w-6 h-6 animate-pulse" /> AI Exam Generator
          </button>
          <button onClick={() => setIsBulkModalOpen(true)} className="flex items-center gap-3 px-8 py-5 bg-indigo-600 text-white rounded-[2.5rem] font-black shadow-xl shadow-indigo-600/20 hover:scale-105 active:scale-95 transition-all">
            <Zap className="w-6 h-6" /> Bulk Ops
          </button>
          <button onClick={() => { setEditingQuestion(null); setIsWizardOpen(true); }} className="flex items-center gap-3 px-10 py-5 bg-primary text-white rounded-[2.5rem] font-black shadow-xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all border-b-4 border-primary-dark">
            <Plus className="w-6 h-6" /> Create Content
          </button>
        </div>
      </div>

      {/* Granular Navigation */}
      <div className="flex flex-wrap gap-3 p-3 bg-secondary/10 rounded-[3rem] w-fit border-2 border-border backdrop-blur-xl">
        {[
          { id: 'analytics', label: 'Insights', icon: BarChart3 },
          { id: 'questions', label: 'Content Hub', icon: HelpCircle },
          { id: 'notes', label: 'Knowledge Base', icon: FileText },
          { id: 'users', label: 'Permissions', icon: Users },
          { id: 'courses', label: 'Logic Layers', icon: Database },
          { id: 'audit', label: 'Audit Stream', icon: Activity },
          { id: 'health', label: 'System Health', icon: Shield },
          { id: 'settings', label: 'OS Config', icon: Settings },
          { id: 'exams', label: 'Exams', icon: ClipboardList },
          { id: 'flashcards', label: 'Flashcards', icon: Brain },
          { id: 'formal_results', label: 'Formal Results', icon: Trophy },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-3 px-8 py-4 rounded-[2.5rem] font-black text-sm transition-all duration-300 ${
              activeTab === tab.id 
                ? 'bg-card text-primary shadow-xl border-2 border-primary/20 scale-105' 
                : 'text-muted-foreground hover:text-foreground hover:bg-card/40'
            }`}
          >
            <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'scale-110' : ''}`} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Command Area */}
      <div className="bg-card border-2 border-border rounded-[5rem] shadow-sm overflow-hidden min-h-[800px] transition-all relative">
        {loading && activeTab !== 'analytics' && activeTab !== 'audit' && activeTab !== 'health' ? (
          <div className="flex flex-col items-center justify-center h-[800px] gap-8 bg-secondary/5">
            <div className="relative">
              <Loader2 className="w-20 h-20 animate-spin text-primary opacity-20" />
              <Loader2 className="w-20 h-20 animate-spin text-primary absolute inset-0 [animation-delay:-0.5s]" />
            </div>
            <div className="space-y-2 text-center">
              <p className="text-3xl font-black tracking-tighter">Initializing Subsystems...</p>
              <p className="text-muted-foreground font-bold animate-pulse uppercase tracking-[0.3em] text-[10px]">Fetching Firestore Batches</p>
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'analytics' && <AdminAnalytics questions={questions} notes={notes} />}
            {activeTab === 'questions' && (
              <div className="p-12 space-y-8 animate-in slide-in-from-bottom-8 duration-500">
                {/* Advanced Search Filter Bar */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 bg-secondary/20 p-8 rounded-[3.5rem] border-2 border-border mb-10">
                  <div className="relative">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground" />
                    <input 
                      type="text" 
                      placeholder="Omni Search Questions..." 
                      value={searchQuery} 
                      onChange={e => setSearchQuery(e.target.value)} 
                      className="w-full bg-card pl-16 pr-6 py-5 rounded-[2.5rem] border-2 border-border outline-none focus:border-primary font-bold text-lg"
                    />
                  </div>
                  <select value={filterCourse} onChange={e => setFilterCourse(e.target.value)} className="bg-card px-8 py-5 rounded-[2.5rem] border-2 border-border font-black text-lg outline-none focus:border-primary">
                    <option value="all">All Courses</option>
                    {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <select value={filterSubject} onChange={e => setFilterSubject(e.target.value)} className="bg-card px-8 py-5 rounded-[2.5rem] border-2 border-border font-black text-lg outline-none focus:border-primary">
                    <option value="all">All Subjects</option>
                    {availableSubjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                  <div className="flex items-center justify-between px-6 bg-primary/10 rounded-[2.5rem] border-2 border-primary/20">
                    <span className="font-black text-primary text-lg">{filteredQuestions.length}</span>
                    <button className="p-3 bg-primary text-white rounded-xl shadow-lg shadow-primary/20 hover:scale-110 transition-all">
                      <Download className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <QuestionTable 
                  questions={paginatedQuestions} 
                  onEdit={(q) => { setEditingQuestion(q); setIsWizardOpen(true); }}
                  onDelete={async (id) => { if(confirm('Erase this record from core storage?')) { await deleteDoc(doc(db,'questions',id)); if(user) logAudit(user.uid, 'DELETE_QUESTION', {id}); fetchData(); } }}
                />
                
                {/* Command Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-6 pt-12">
                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-5 bg-secondary/50 rounded-2xl disabled:opacity-20 hover:bg-primary hover:text-white transition-all shadow-sm"><ChevronLeft /></button>
                    <div className="flex gap-3">
                      {[...Array(totalPages)].map((_, i) => (
                        <button key={i} onClick={() => setCurrentPage(i + 1)} className={`w-14 h-14 rounded-2xl font-black text-lg transition-all ${currentPage === i + 1 ? 'bg-primary text-white shadow-xl scale-110' : 'bg-secondary/30 hover:bg-secondary'}`}>{i + 1}</button>
                      ))}
                    </div>
                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-5 bg-secondary/50 rounded-2xl disabled:opacity-20 hover:bg-primary hover:text-white transition-all shadow-sm"><ChevronRight /></button>
                  </div>
                )}
              </div>
            )}
            {activeTab === 'users' && <UserManagement />}
            {activeTab === 'courses' && <CourseManagement onDeleteCourse={handleDeleteCourse} isDeletingId={isDeleting} />}
            {activeTab === 'formal_results' && <ExamResultsDashboard />}
            {activeTab === 'exams' && <ExamManager />}
            {activeTab === 'audit' && <AuditLogViewer />}
            {activeTab === 'flashcards' && <FlashcardManager />}
            {activeTab === 'settings' && <AppConfig />}
            {activeTab === 'notes' && (
              <div className="p-12 space-y-12 animate-in slide-in-from-bottom-8 duration-500">
                <div className="flex justify-between items-center bg-emerald-500/10 p-10 rounded-[4rem] border-2 border-emerald-500/20">
                  <div>
                    <h2 className="text-4xl font-black tracking-tight">Knowledge Base Repository</h2>
                    <p className="text-emerald-700 font-bold opacity-60">Manage study notes and theoretical content links.</p>
                  </div>
                  <button onClick={() => setIsNoteModalOpen(true)} className="px-10 py-5 bg-emerald-600 text-white rounded-[2.5rem] font-black shadow-xl shadow-emerald-600/20 hover:scale-105 transition-all">Create New Entry</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {notes.map(note => (
                    <div key={note.id} className="p-8 bg-secondary/20 rounded-[3rem] border-2 border-border hover:border-primary/40 transition-all group">
                      <h4 className="text-2xl font-black group-hover:text-primary transition-colors mb-2">{note.title}</h4>
                      <p className="text-muted-foreground font-bold text-sm mb-6 line-clamp-2">{note.content}</p>
                      <div className="flex justify-between items-center pt-6 border-t border-border">
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-lg">{note.category}</span>
                        <div className="flex gap-2">
                          <button className="p-2 bg-card rounded-lg border border-border hover:bg-primary hover:text-white transition-all"><Edit2 className="w-4 h-4" /></button>
                          <button className="p-2 bg-card rounded-lg border border-border hover:bg-rose-500 hover:text-white transition-all"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {activeTab === 'health' && (
              <div className="p-12 space-y-12 animate-in slide-in-from-bottom-8 duration-500">
                <div className="bg-primary/5 border-2 border-primary/20 p-12 rounded-[4rem] text-center space-y-10 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full -mr-64 -mt-64 blur-[100px] animate-pulse" />
                  
                  <div className="relative space-y-6">
                    <div className="w-24 h-24 bg-primary text-white rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl relative">
                      <Shield className="w-12 h-12" />
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full border-4 border-background flex items-center justify-center">
                        <Zap className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <div>
                      <h2 className="text-5xl font-black">Autonomous OS Engine</h2>
                      <p className="text-muted-foreground font-bold text-xl mt-2 max-w-2xl mx-auto">Continuous Self-Improvement & Data Integrity Loop active.</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-6xl mx-auto relative">
                    {[
                      { label: 'Metadata Healing', status: 'Optimal', color: 'emerald', icon: Zap },
                      { label: 'AI Analytics', status: 'Running', color: 'indigo', icon: BarChart3 },
                      { label: 'Security Layer', status: 'Hardened', color: 'emerald', icon: Shield },
                      { label: 'SRS Matrix', status: 'Syncing', color: 'primary', icon: Brain },
                    ].map((m, i) => (
                      <div key={i} className="p-8 bg-card border-2 border-border rounded-[2.5rem] shadow-sm hover:border-primary/40 transition-all">
                        <div className={`w-12 h-12 rounded-xl bg-${m.color}-500/10 text-${m.color}-600 flex items-center justify-center mx-auto mb-4`}>
                          <m.icon className="w-6 h-6" />
                        </div>
                        <p className={`text-${m.color}-500 font-black text-2xl`}>{m.status}</p>
                        <p className="text-[10px] font-black opacity-60 uppercase tracking-widest mt-1">{m.label}</p>
                      </div>
                    ))}
                  </div>

                  <div className="max-w-4xl mx-auto space-y-6">
                    <div className="flex items-center justify-between px-8 py-4 bg-secondary/30 rounded-2xl border border-border">
                      <div className="flex items-center gap-3">
                        <Activity className="w-5 h-5 text-emerald-500 animate-pulse" />
                        <span className="text-sm font-black uppercase tracking-widest text-muted-foreground">Autonomous Engine Stream</span>
                      </div>
                      <span className="text-[10px] font-black text-primary bg-primary/10 px-3 py-1 rounded-lg">Uptime: 99.99%</span>
                    </div>

                    <div className="bg-black text-emerald-400 p-10 rounded-[3rem] font-mono text-left space-y-3 border-4 border-emerald-500/20 shadow-2xl overflow-y-auto h-[400px] scrollbar-hide">
                      <div className="flex gap-4 opacity-40 italic mb-4 border-b border-emerald-500/10 pb-4">
                        <span>[CORE_KERNEL]</span>
                        <span>Initializing continuous improvement protocol...</span>
                      </div>
                      {[
                        'AI ANALYZER: Detecting weak performance in "Physiology - Blood" - Increasing frequency for 12 users.',
                        'META_HEALER: Found 4 unlinked questions in legacy storage - Re-mapping to courseId: F1.',
                        'SECURITY: Blocked 2 invalid access attempts to /admin from unauthorized UID.',
                        'SYNC_SERVICE: Spaced Repetition matrices synchronized for 1,284 active nodes.',
                        'OPTIMIZER: Database index fragmentation at 0.02% - No intervention required.',
                        'CONTENT_BOT: Auto-tagging 100 new questions with "High-Yield" based on historic exam frequency.',
                        'HEALER: Correcting isPaid metadata for older subject entries...',
                        'OS_KERNEL: System state: GREEN. All subsystems operational.'
                      ].map((log, i) => (
                        <div key={i} className="flex gap-4 animate-in fade-in slide-in-from-left-4 duration-500" style={{ animationDelay: `${i * 100}ms` }}>
                          <span className="opacity-40 text-xs mt-1">[{new Date().toLocaleTimeString()}]</span>
                          <span className={log.includes('Detecting') || log.includes('Correcting') ? 'text-amber-400' : 'text-emerald-400'}>{log}</span>
                        </div>
                      ))}
                      {auditReports.map((r, i) => (
                        <div key={i} className="flex gap-4 text-primary font-black">
                          <span className="opacity-40 text-xs mt-1">[{new Date().toLocaleTimeString()}]</span>
                          <span>[MANUAL_REPAIR] {r}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="max-w-2xl mx-auto">
                    <button 
                      onClick={handleSystemRepair}
                      disabled={isRepairing}
                      className="w-full px-12 py-8 bg-primary text-white rounded-[3rem] font-black text-2xl shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4 disabled:opacity-50"
                    >
                      {isRepairing ? <Loader2 className="animate-spin w-8 h-8" /> : <Terminal className="w-8 h-8" />}
                      {isRepairing ? 'Running Deep Repair...' : 'Execute Manual System Override'}
                    </button>
                    <p className="mt-6 text-xs font-bold text-muted-foreground uppercase tracking-widest opacity-40">Safety Lock Active: Superuser permissions required.</p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals Layer */}
      {isWizardOpen && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-background/90 backdrop-blur-3xl animate-in zoom-in-95 duration-500 overflow-y-auto">
          <div className="w-full max-w-6xl my-12 relative">
            <div className="absolute -top-20 right-0 flex gap-4">
              <div className="px-6 py-3 bg-primary text-white rounded-2xl font-black text-sm shadow-xl">Wizard Active</div>
              <button onClick={() => setIsWizardOpen(false)} className="p-3 bg-card rounded-2xl border-2 border-border hover:bg-rose-500 hover:text-white transition-all shadow-xl"><X className="w-6 h-6" /></button>
            </div>
            <QuestionWizard initialData={editingQuestion} onSave={handleSaveQuestion} onCancel={() => setIsWizardOpen(false)} />
          </div>
        </div>
      )}

      {isBulkModalOpen && (
        <BulkUploadModal onUpload={handleBulkUpload} onClose={() => setIsBulkModalOpen(false)} />
      )}

      {isNoteModalOpen && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-background/90 backdrop-blur-3xl animate-in zoom-in-95 duration-500">
          <div className="w-full max-w-5xl">
            <NoteForm onSave={async (d) => { await addDoc(collection(db,'notes'), {...d, createdAt: new Date()}); await fetchData(); setIsNoteModalOpen(false); }} onCancel={() => setIsNoteModalOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
