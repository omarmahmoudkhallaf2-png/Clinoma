import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Check, Trash2, Trophy, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';

interface Task {
  id: string;
  text: string;
  completed: boolean;
}

const MOTIVATIONAL_MESSAGES = [
  "عاش يا بطل! كمل اللي بدأته. 🚀",
  "إنجاز رائع! خطوة كمان وتقرب من حلمك. ✨",
  "فخور بيك! الاستمرارية هي سر النجاح. 🔥",
  "خلصت مهمة؟ أنت وحش! 💪",
  "كل خطوة صغيرة بتعمل فرق كبير. 🌟",
  "استمر يا بطل، النجاح بيناديك! 🎓",
  "أنت أقوى من أي تشتت! ركز وكمل. 🧠"
];

export default function PomodoroTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('pomodoro_tasks');
    if (saved) {
      try {
        setTasks(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse tasks', e);
      }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('pomodoro_tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newTask.trim()) return;
    
    const task: Task = {
      id: Math.random().toString(36).substr(2, 9),
      text: newTask.trim(),
      completed: false
    };
    
    setTasks([task, ...tasks]);
    setNewTask('');
  };

  const toggleTask = (id: string) => {
    setTasks(prev => {
      const updated = prev.map(t => {
        if (t.id === id) {
          if (!t.completed) {
            // Show motivational message when completing a task
            const randomMsg = MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)];
            setMessage(randomMsg);
            setTimeout(() => setMessage(null), 3000);
          }
          return { ...t, completed: !t.completed };
        }
        return t;
      });
      return updated;
    });
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const completedCount = tasks.filter(t => t.completed).length;

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <h3 className="text-xl font-black tracking-tight flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            Session Goals
          </h3>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            {completedCount} of {tasks.length} completed
          </p>
        </div>
      </div>

      <form onSubmit={addTask} className="relative group">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="What's your next goal?"
          className="w-full h-14 pl-6 pr-14 bg-secondary/50 backdrop-blur-xl border-2 border-transparent focus:border-primary/30 rounded-2xl font-bold transition-all outline-none placeholder:text-muted-foreground/50"
        />
        <button
          type="submit"
          disabled={!newTask.trim()}
          className="absolute right-2 top-2 h-10 w-10 flex items-center justify-center bg-primary text-white rounded-xl shadow-lg shadow-primary/20 disabled:opacity-50 disabled:shadow-none hover:scale-105 active:scale-95 transition-all"
        >
          <Plus className="w-5 h-5" />
        </button>
      </form>

      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        <AnimatePresence mode="popLayout">
          {tasks.map((task) => (
            <motion.div
              key={task.id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={cn(
                "group flex items-center gap-4 p-4 rounded-2xl border transition-all",
                task.completed 
                  ? "bg-emerald-500/5 border-emerald-500/20 opacity-70" 
                  : "bg-secondary/30 border-border/50 hover:border-primary/30"
              )}
            >
              <button
                onClick={() => toggleTask(task.id)}
                className={cn(
                  "h-6 w-6 rounded-lg flex items-center justify-center transition-all border-2",
                  task.completed
                    ? "bg-emerald-500 border-emerald-500 text-white"
                    : "border-muted-foreground/30 hover:border-primary/50"
                )}
              >
                {task.completed && <Check className="w-4 h-4" />}
              </button>
              
              <span className={cn(
                "flex-1 font-bold text-sm md:text-base transition-all",
                task.completed && "line-through text-muted-foreground"
              )}>
                {task.text}
              </span>

              <button
                onClick={() => deleteTask(task.id)}
                className="opacity-0 group-hover:opacity-100 p-2 text-muted-foreground hover:text-destructive transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {tasks.length === 0 && (
          <div className="text-center py-8 opacity-40">
            <Sparkles className="w-8 h-8 mx-auto mb-2" />
            <p className="text-xs font-bold uppercase tracking-widest">No goals set for this session</p>
          </div>
        )}
      </div>

      {/* Toast-like motivational message */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[110] px-6 py-4 bg-primary text-white rounded-2xl shadow-2xl font-black text-center flex items-center gap-3 border-2 border-white/20 whitespace-nowrap"
          >
            <Trophy className="w-6 h-6 fill-amber-500 text-amber-500" />
            {message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
