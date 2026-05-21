import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Brain, Clock, Settings, Play, Loader2, RotateCcw, Database, Crown, BookOpen } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, getDocs, query, doc, getDoc, where } from 'firebase/firestore';

export default function QuizSetup() {
  const { user, isSubscribed } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Setup parameters from Dashboard
  const dashboardState = location.state as { courseId?: string; subjectId?: string; lectureNumber?: number; questionType?: string } | null;
  const courseId = dashboardState?.courseId || 'F1'; // Default to F1 for now
  const subscribed = isSubscribed(courseId);

  // Form State
  const [selectedSubject, setSelectedSubject] = useState<string>(dashboardState?.subjectId || 'all');
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [timerMode, setTimerMode] = useState<boolean>(true);
  const [feedbackMode, setFeedbackMode] = useState<'instant' | 'deferred'>('deferred');
  const [retakeIncorrect, setRetakeIncorrect] = useState<boolean>(false);
  const [questionMode, setQuestionMode] = useState<string>(dashboardState?.questionType || 'practice');
  const [selectedLecture, setSelectedLecture] = useState<number>(dashboardState?.lectureNumber || 1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!user) return;

        if (courseId === 'clinical_nutrition_course') {
          setSubjects([
            {
              id: 'clinical_nutrition_subject',
              name: 'Clinical Nutrition MCQ Bank',
              courseId: 'clinical_nutrition_course'
            }
          ]);
        } else {
          // Fetch Subjects for this course
          const subjectSnap = await getDocs(query(collection(db, 'subjects'), where('courseId', '==', courseId)));
          setSubjects(subjectSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        }

        // Fetch User Settings
        const userSnap = await getDoc(doc(db, 'users', user.uid));
        if (userSnap.exists()) {
          const settings = userSnap.data().settings;
          if (settings) {
            setQuestionCount(settings.defaultQuestionCount || 10);
            setTimerMode(settings.defaultTimerMode ?? true);
          }
        }
      } catch (err) {
        console.error('Failed to fetch data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, courseId]);

  const handleStartQuiz = () => {
    navigate('/quiz', { 
      state: { 
        courseId,
        subjectId: selectedSubject, 
        count: questionCount, 
        isTimed: timerMode,
        lectureNumber: selectedLecture,
        questionType: questionMode,
        feedbackMode,
        retakeIncorrect,
        isExam: feedbackMode === 'deferred'
      } 
    });
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 gap-4">
      <Loader2 className="animate-spin w-12 h-12 text-primary" />
      <p className="font-black animate-pulse">Initializing Setup Subsystem...</p>
    </div>
  );

  return (
    <div className="w-full max-w-2xl mx-auto py-12 animate-in fade-in zoom-in-95 duration-500">
      <div className="bg-card border border-border rounded-[2.5rem] shadow-xl overflow-hidden">
        <div className="bg-primary p-10 text-white">
          <div className="flex items-center gap-4 mb-2">
            <Settings className="w-10 h-10" />
            <h1 className="text-4xl font-black tracking-tight">Setup Session</h1>
          </div>
          <p className="text-primary-foreground/80 font-medium">Fine-tune your clinical training experience</p>
        </div>

        <div className="p-10 space-y-10">
          {/* Subject Selection */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Select Subject</label>
              {!subscribed && (
                <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-600 rounded-full text-[10px] font-black border border-amber-500/20">
                  <Crown className="w-3 h-3" /> LIMITED FREE MODE
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedSubject('all')}
                className={`px-6 py-3 rounded-2xl border-2 font-bold transition-all ${
                  selectedSubject === 'all' ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:border-primary/30'
                }`}
              >
                All Subjects (Free Mix)
              </button>
              {subjects.map((sub) => {
                const isLocked = !subscribed && sub.id !== 'ANAT_01'; // ANAT_01 is free trial
                return (
                  <button
                    key={sub.id}
                    disabled={isLocked}
                    onClick={() => setSelectedSubject(sub.id)}
                    className={`px-6 py-3 rounded-2xl border-2 font-bold transition-all capitalize relative flex items-center gap-2 ${
                      selectedSubject === sub.id 
                        ? 'border-primary bg-primary/10 text-primary' 
                        : isLocked 
                          ? 'border-border opacity-50 cursor-not-allowed bg-secondary/50' 
                          : 'border-border hover:border-primary/30'
                    }`}
                  >
                    {sub.name}
                    {isLocked && <Crown className="w-4 h-4 text-amber-500" />}
                  </button>
                );
              })}
            </div>
            {!subscribed && (
              <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl flex items-center justify-between gap-4 mt-2">
                <p className="text-xs font-bold text-amber-700 leading-snug">
                  Unlock the full curriculum including all 4 subjects and 500+ questions.
                </p>
                <button 
                  onClick={() => navigate('/available')}
                  className="px-4 py-2 bg-amber-500 text-white rounded-xl text-[10px] font-black uppercase whitespace-nowrap shadow-lg shadow-amber-500/20"
                >
                  Upgrade Now
                </button>
              </div>
            )}
          </div>

          {/* Lecture Selection (Only if NOT coming from a specific lecture node) */}
          {!dashboardState?.lectureNumber && (
            <div className="space-y-4 animate-in slide-in-from-top-4 duration-300">
              <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                {courseId === 'clinical_nutrition_course' ? 'Select Chapter' : 'Select Lecture'}
              </label>
              <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                {courseId === 'clinical_nutrition_course' ? (
                  [1, 2, 3, 4, 5, 6, 7, 9].map(num => (
                    <button
                      key={num}
                      onClick={() => setSelectedLecture(num)}
                      className={`p-4 rounded-2xl border-2 font-black transition-all ${
                        selectedLecture === num 
                          ? 'border-primary bg-primary text-white' 
                          : 'border-border bg-card hover:border-primary/30'
                      }`}
                    >
                      {num === 7 ? '7&8' : num}
                    </button>
                  ))
                ) : (
                  Array.from({ length: 12 }, (_, i) => i + 1).map(num => (
                    <button
                      key={num}
                      onClick={() => setSelectedLecture(num)}
                      className={`p-4 rounded-2xl border-2 font-black transition-all ${
                        selectedLecture === num 
                          ? 'border-primary bg-primary text-white' 
                          : 'border-border bg-card hover:border-primary/30'
                      }`}
                    >
                      {num}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Question Type Selection */}
          <div className="space-y-4">
            <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
              {dashboardState?.lectureNumber ? (
                courseId === 'clinical_nutrition_course' ? (
                  `نمط التدريب للشبتر ${selectedLecture === 7 ? '7 و 8' : selectedLecture}`
                ) : (
                  `نمط التدريب للمحاضرة ${selectedLecture}`
                )
              ) : 'Question Source'}
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { id: 'practice', label: 'أسئلة تدريبية', icon: Database },
                { id: 'past_papers', label: 'سنين سابقة', icon: Clock },
                { id: 'lectures', label: 'أسئلة المحاضرة', icon: BookOpen },
              ].map((mode) => {
                const isModeLocked = !subscribed && mode.id !== 'practice';
                return (
                  <button
                    key={mode.id}
                    disabled={isModeLocked}
                    onClick={() => setQuestionMode(mode.id)}
                    className={`flex flex-col items-center gap-3 p-4 rounded-3xl border-2 transition-all relative ${
                      questionMode === mode.id 
                        ? 'border-primary bg-primary/5 text-primary' 
                        : isModeLocked 
                          ? 'opacity-40 bg-secondary/50 cursor-not-allowed' 
                          : 'border-border bg-card hover:border-primary/50'
                    }`}
                  >
                    <mode.icon className={`w-6 h-6 ${questionMode === mode.id ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className="font-black text-sm">{mode.label}</span>
                    {isModeLocked && <Crown className="w-3 h-3 text-amber-500 absolute top-2 right-2" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Number of Questions */}
          <div className="space-y-4">
            <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest flex justify-between">
              Question Count 
              <span className="text-primary">{questionCount}</span>
            </label>
            <input 
              type="range" min="5" max="50" step="5"
              value={questionCount} 
              onChange={(e) => setQuestionCount(parseInt(e.target.value))}
              className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>

          {/* Feedback Mode */}
          <div className="space-y-4">
            <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Session Type</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setFeedbackMode('deferred')}
                className={`flex items-center gap-4 p-6 rounded-3xl border-2 transition-all ${
                  feedbackMode === 'deferred' ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-primary/50'
                }`}
              >
                <div className={`p-3 rounded-2xl ${feedbackMode === 'deferred' ? 'bg-primary text-white' : 'bg-secondary'}`}>
                  <Clock className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <div className="font-bold">Exam Mode</div>
                  <div className="text-xs text-muted-foreground">Answers at the end</div>
                </div>
              </button>
              <button
                onClick={() => setFeedbackMode('instant')}
                className={`flex items-center gap-4 p-6 rounded-3xl border-2 transition-all ${
                  feedbackMode === 'instant' ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-primary/50'
                }`}
              >
                <div className={`p-3 rounded-2xl ${feedbackMode === 'instant' ? 'bg-primary text-white' : 'bg-secondary'}`}>
                  <Brain className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <div className="font-bold">Study Mode</div>
                  <div className="text-xs text-muted-foreground">Instant explanations</div>
                </div>
              </button>
            </div>
          </div>

          {/* Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center justify-between p-6 bg-card border border-border rounded-3xl">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 text-primary rounded-2xl">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-bold">Timer</div>
                  <div className="text-xs text-muted-foreground">Timed exam</div>
                </div>
              </div>
              <button
                onClick={() => setTimerMode(!timerMode)}
                className={`w-14 h-8 rounded-full p-1 transition-all ${timerMode ? 'bg-primary' : 'bg-secondary'}`}
              >
                <div className={`w-6 h-6 bg-white rounded-full shadow-sm transition-all ${timerMode ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>

            {feedbackMode === 'instant' && (
              <div className="flex items-center justify-between p-6 bg-card border border-border rounded-3xl">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl">
                    <RotateCcw className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-bold">Auto-Repeat Mistakes</div>
                    <div className="text-xs text-muted-foreground">Wrong questions reappear later</div>
                  </div>
                </div>
                <button
                  onClick={() => setRetakeIncorrect(!retakeIncorrect)}
                  className={`w-14 h-8 rounded-full p-1 transition-all ${retakeIncorrect ? 'bg-amber-500' : 'bg-secondary'}`}
                >
                  <div className={`w-6 h-6 bg-white rounded-full shadow-sm transition-all ${retakeIncorrect ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>
            )}
          </div>

          <button
            onClick={handleStartQuiz}
            className="w-full py-6 bg-primary text-white rounded-3xl font-black text-xl shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
          >
            <Play className="w-6 h-6 fill-current" />
            Launch {feedbackMode === 'instant' ? 'Study' : 'Exam'}
          </button>
        </div>
      </div>
    </div>
  );
}
