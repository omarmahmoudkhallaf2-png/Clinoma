import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  ChevronLeft, 
  Pencil, 
  Highlighter, 
  Eraser, 
  Zap, 
  Type, 
  Undo2, 
  Redo2, 
  Maximize2, 
  Clock,
  Layout,
  Plus,
  Minus,
  FileText,
  X,
  Brain,
  MoreVertical,
  CheckCircle2,
  ChevronRight,
  Settings2,
  Play,
  Pause,
  LogOut,
  Trophy
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { db } from '../../lib/firebase';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';

// --- Types ---
type Tool = 'pen' | 'highlighter' | 'eraser' | 'laser' | 'text';

interface ToolSettings {
  size: number;
  opacity: number;
  color: string;
}

interface Board {
  id: string;
  module: string;
  system: string;
  disease: string;
  medicalImage: string;
  explanation: string;
  createdAt: number;
}

const FlashSpace = () => {
  const navigate = useNavigate();
  const [modules, setModules] = useState<string[]>([]);
  const [systems, setSystems] = useState<Record<string, string[]>>({});
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [selectedSystem, setSelectedSystem] = useState<string | null>(null);
  const [selectedBoard, setSelectedBoard] = useState<Board | null>(null);
  
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const [activeTool, setActiveTool] = useState<Tool>('pen');
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [showSettingsFor, setShowSettingsFor] = useState<Tool | null>(null);
  
  const [zoom, setZoom] = useState(1);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  // Timer logic
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [totalTimeToday, setTotalTimeToday] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const lastActivityRef = useRef(Date.now());

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [redoStack, setRedoStack] = useState<ImageData[]>([]);
  const lastPoint = useRef<{ x: number, y: number } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const snap = await getDocs(query(collection(db, 'flashspace_boards'), orderBy('createdAt', 'desc')));
        const fetched = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Board));
        setBoards(fetched);
        
        const mods = Array.from(new Set(fetched.map(b => b.module))).filter(Boolean);
        const sysMap: Record<string, string[]> = {};
        fetched.forEach(b => {
          if (b.module && b.system) {
            if (!sysMap[b.module]) sysMap[b.module] = [];
            if (!sysMap[b.module].includes(b.system)) sysMap[b.module].push(b.system);
          }
        });
        
        setModules(mods);
        setSystems(sysMap);
        if (mods.length > 0) setSelectedModule(mods[0]);
        if (fetched.length > 0) setSelectedBoard(fetched[0]);
      } catch (err) {
        toast.error('Failed to load content');
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    const savedTime = localStorage.getItem(`clinoma_study_time_${new Date().toDateString()}`);
    if (savedTime) setTotalTimeToday(parseInt(savedTime));
  }, []);

  // Sync Timer with Local Storage
  useEffect(() => {
    let interval: any;
    if (isTimerActive) {
      interval = setInterval(() => {
        setSessionSeconds(s => s + 1);
        setTotalTimeToday(t => {
          const newTotal = t + 1;
          localStorage.setItem(`clinoma_study_time_${new Date().toDateString()}`, newTotal.toString());
          return newTotal;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerActive]);

  const [toolSettings, setToolSettings] = useState<Record<Tool, ToolSettings>>({
    pen: { size: 4, opacity: 1, color: '#3b82f6' },
    highlighter: { size: 30, opacity: 0.3, color: '#eab308' },
    eraser: { size: 40, opacity: 1, color: '#ffffff' },
    laser: { size: 8, opacity: 1, color: '#ef4444' },
    text: { size: 24, opacity: 1, color: '#1e293b' }
  });

  // Canvas Setup & History
  const saveState = useCallback(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const state = ctx.getImageData(0, 0, canvas.width, canvas.height);
        setHistory(prev => [...prev.slice(-19), state]); // Keep last 20 steps
        setRedoStack([]);
      }
    }
  }, []);

  const undo = () => {
    if (history.length === 0) return;
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const currentState = ctx.getImageData(0, 0, canvas.width, canvas.height);
        setRedoStack(prev => [...prev, currentState]);
        
        const prevState = history[history.length - 1];
        ctx.putImageData(prevState, 0, 0);
        setHistory(prev => prev.slice(0, -1));
      }
    }
  };

  const redo = () => {
    if (redoStack.length === 0) return;
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const currentState = ctx.getImageData(0, 0, canvas.width, canvas.height);
        setHistory(prev => [...prev, currentState]);
        
        const nextState = redoStack[redoStack.length - 1];
        ctx.putImageData(nextState, 0, 0);
        setRedoStack(prev => prev.slice(0, -1));
      }
    }
  };

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    // Crucial: Accounting for CSS scaling vs internal resolution
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (!canvasRef.current || !selectedBoard) return;
    saveState();
    setIsDrawing(true);
    const coords = getCoordinates(e);
    lastPoint.current = coords;

    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(coords.x, coords.y);
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.strokeStyle = toolSettings[activeTool].color;
      ctx.lineWidth = toolSettings[activeTool].size;

      if (activeTool === 'highlighter') {
        ctx.globalAlpha = toolSettings.highlighter.opacity;
        ctx.globalCompositeOperation = 'multiply';
      } else if (activeTool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.globalAlpha = 1;
      } else {
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'source-over';
      }
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !canvasRef.current || !lastPoint.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const coords = getCoordinates(e);

    if (activeTool === 'laser') {
      // Smooth Laser with persistent fade
      const x = coords.x;
      const y = coords.y;
      
      ctx.beginPath();
      ctx.arc(x, y, toolSettings.laser.size / 2, 0, Math.PI * 2);
      ctx.fillStyle = toolSettings.laser.color;
      ctx.fill();

      // Fade out logic: use a temporary canvas or clear after timeout
      setTimeout(() => {
        if (canvasRef.current) {
          const c = canvasRef.current.getContext('2d');
          if (c) {
            c.globalCompositeOperation = 'destination-out';
            c.beginPath();
            c.arc(x, y, toolSettings.laser.size / 2 + 1, 0, Math.PI * 2);
            c.fill();
            c.globalCompositeOperation = 'source-over';
          }
        }
      }, 1500);
    } else {
      // Smooth line using Midpoint Quadratic Curves
      const midPoint = {
        x: (lastPoint.current.x + coords.x) / 2,
        y: (lastPoint.current.y + coords.y) / 2
      };
      
      ctx.quadraticCurveTo(lastPoint.current.x, lastPoint.current.y, midPoint.x, midPoint.y);
      ctx.stroke();
    }
    
    lastPoint.current = coords;
  };

  const endDrawing = () => {
    setIsDrawing(false);
    lastPoint.current = null;
  };

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h > 0 ? h + 'h ' : ''}${m}m ${sec}s`;
  };

  const endSession = () => {
    setIsTimerActive(false);
    setShowSummary(true);
  };

  return (
    <div className="h-screen w-full bg-[#f8fafc] flex overflow-hidden font-sans select-none no-select">
      {/* Expandable Sidebar */}
      <div 
        onMouseEnter={() => setIsSidebarHovered(true)}
        onMouseLeave={() => setIsSidebarHovered(false)}
        className={cn(
          "h-full bg-white border-r border-slate-200 transition-all duration-500 ease-in-out z-[100] flex flex-col shadow-2xl",
          isSidebarHovered ? "w-80" : "w-16"
        )}
      >
        <div className="p-4 border-b border-slate-100 flex items-center justify-between overflow-hidden">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white shrink-0">
              <Brain className="w-5 h-5" />
            </div>
            <span className={cn("font-black text-lg transition-opacity", isSidebarHovered ? "opacity-100" : "opacity-0")}>CLINOMA</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-4">
          {/* Current Path Info */}
          {isSidebarHovered && selectedBoard && (
            <div className="px-3 py-4 mb-4 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Location</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <Layout className="w-3 h-3 text-primary" /> {selectedModule}
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-600 ml-4">
                  <div className="w-1 h-1 bg-slate-300 rounded-full" /> {selectedSystem}
                </div>
                <div className="flex items-center gap-2 text-[11px] font-black text-emerald-600 ml-8">
                  <CheckCircle2 className="w-3 h-3" /> {selectedBoard.disease}
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          {modules.map(mod => (
            <div key={mod} className="space-y-1">
              <button
                onClick={() => { setSelectedModule(selectedModule === mod ? null : mod); setSelectedSystem(null); }}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-xl transition-all",
                  selectedModule === mod ? "bg-primary/10 text-primary" : "hover:bg-slate-50 text-slate-600"
                )}
              >
                <Brain className="w-5 h-5 shrink-0" />
                <span className={cn("font-bold text-sm whitespace-nowrap transition-opacity", isSidebarHovered ? "opacity-100" : "opacity-0")}>{mod}</span>
              </button>
              
              {selectedModule === mod && isSidebarHovered && systems[mod]?.map(sys => (
                <div key={sys} className="ml-6 space-y-1">
                  <button
                    onClick={() => setSelectedSystem(selectedSystem === sys ? null : sys)}
                    className={cn(
                      "w-full flex items-center gap-3 p-2 rounded-lg text-left transition-all",
                      selectedSystem === sys ? "text-primary font-black" : "text-slate-500 hover:text-slate-800"
                    )}
                  >
                    <ChevronRight className={cn("w-3 h-3 transition-transform", selectedSystem === sys ? "rotate-90" : "")} />
                    <span className="text-xs">{sys}</span>
                  </button>
                  
                  {selectedSystem === sys && (
                    <div className="ml-4 space-y-1 border-l-2 border-slate-100 pl-4">
                      {boards.filter(b => b.module === mod && b.system === sys).map(board => (
                        <button
                          key={board.id}
                          onClick={() => setSelectedBoard(board)}
                          className={cn(
                            "w-full text-left p-2 rounded-lg text-[11px] font-bold transition-all",
                            selectedBoard?.id === board.id ? "bg-emerald-500 text-white shadow-md" : "text-slate-400 hover:text-slate-600"
                          )}
                        >
                          {board.disease}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Top Navigation */}
        <div className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between z-50">
          <div className="flex items-center gap-4">
            <button onClick={endSession} className="p-2 hover:bg-rose-50 text-rose-500 rounded-xl transition-all flex items-center gap-2 font-black text-xs">
              <LogOut className="w-4 h-4" /> End Session
            </button>
            <div className="h-6 w-px bg-slate-200" />
            <span className="text-sm font-black text-slate-800">{selectedBoard?.disease || 'Ready'}</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Drawing Tools */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl mr-4">
              {[
                { id: 'pen', icon: Pencil },
                { id: 'highlighter', icon: Highlighter },
                { id: 'eraser', icon: Eraser },
                { id: 'laser', icon: Zap }
              ].map(tool => (
                <button
                  key={tool.id}
                  onClick={() => setActiveTool(tool.id as Tool)}
                  className={cn(
                    "p-2 rounded-xl transition-all",
                    activeTool === tool.id ? "bg-white text-primary shadow-sm" : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  <tool.icon className="w-4 h-4" />
                </button>
              ))}
            </div>

            {/* Undo/Redo */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl mr-4">
              <button onClick={undo} className="p-2 text-slate-400 hover:text-primary"><Undo2 className="w-4 h-4" /></button>
              <button onClick={redo} className="p-2 text-slate-400 hover:text-primary"><Redo2 className="w-4 h-4" /></button>
            </div>

            {/* Timer Controls */}
            <div className="flex items-center gap-3 px-4 py-2 bg-emerald-50 rounded-2xl border border-emerald-100">
              <Clock className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-black text-emerald-700 w-16 text-center">{formatTime(sessionSeconds)}</span>
              <button 
                onClick={() => setIsTimerActive(!isTimerActive)}
                className="p-1.5 bg-white rounded-lg text-emerald-600 hover:scale-110 transition-transform shadow-sm"
              >
                {isTimerActive ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              </button>
            </div>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 relative bg-slate-50 flex items-center justify-center p-8">
          {selectedBoard ? (
            <div className="relative w-full h-full max-w-5xl max-h-full bg-white rounded-[3rem] shadow-2xl border border-slate-200 overflow-hidden flex items-center justify-center">
              <div className="relative" style={{ transform: `scale(${zoom})` }}>
                <img 
                  src={selectedBoard.medicalImage} 
                  alt="Medical" 
                  className="max-w-full max-h-[85vh] rounded-2xl pointer-events-none"
                  draggable={false}
                />
                <canvas
                  ref={canvasRef}
                  width={2000}
                  height={1500}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={endDrawing}
                  onMouseLeave={endDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={endDrawing}
                  className="absolute inset-0 z-10 w-full h-full touch-none cursor-crosshair"
                  style={{ imageRendering: 'auto' }}
                />
              </div>

              {/* Floating Controls */}
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 z-50">
                <button 
                  onClick={() => setShowExplanation(!showExplanation)}
                  className="px-8 py-4 bg-white/90 backdrop-blur-xl border border-slate-200 rounded-[2rem] font-black text-xs shadow-xl hover:bg-primary hover:text-white transition-all flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" /> Notes
                </button>
                <div className="px-6 py-4 bg-white/90 backdrop-blur-xl border border-slate-200 rounded-[2rem] flex items-center gap-4 shadow-xl">
                  <button onClick={() => setZoom(z => Math.max(0.5, z - 0.1))} className="text-slate-400 hover:text-primary"><Minus className="w-4 h-4" /></button>
                  <span className="text-[10px] font-black text-slate-800 w-8 text-center">{Math.round(zoom * 100)}%</span>
                  <button onClick={() => setZoom(z => Math.min(3, z + 0.1))} className="text-slate-400 hover:text-primary"><Plus className="w-4 h-4" /></button>
                </div>
              </div>

              {/* Notes Slide-up */}
              {showExplanation && (
                <div className="absolute inset-0 bg-white/95 backdrop-blur-3xl p-12 z-[100] animate-in slide-in-from-bottom duration-500">
                  <div className="max-w-3xl mx-auto space-y-6">
                    <div className="flex justify-between items-center">
                      <h4 className="text-3xl font-black text-slate-800">{selectedBoard.disease}</h4>
                      <button onClick={() => setShowExplanation(false)} className="p-3 hover:bg-slate-100 rounded-2xl"><X className="w-6 h-6" /></button>
                    </div>
                    <p className="text-xl text-slate-600 leading-relaxed">{selectedBoard.explanation}</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 opacity-30">
              <Layout className="w-20 h-20" />
              <p className="text-2xl font-black">Select a Topic to Start</p>
            </div>
          )}
        </div>
      </div>

      {/* Summary Modal */}
      {showSummary && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/40 backdrop-blur-2xl p-4">
          <div className="w-full max-w-md bg-white rounded-[4rem] p-12 text-center space-y-8 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="w-24 h-24 bg-emerald-500/10 text-emerald-500 rounded-[2.5rem] flex items-center justify-center mx-auto">
              <Trophy className="w-12 h-12" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-slate-800">Great Session!</h2>
              <p className="text-slate-400 font-bold mt-2">You completed your study mission today.</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Session</p>
                <p className="text-xl font-black text-slate-800">{formatTime(sessionSeconds)}</p>
              </div>
              <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100">
                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Total Today</p>
                <p className="text-xl font-black text-emerald-700">{formatTime(totalTimeToday)}</p>
              </div>
            </div>
            <button 
              onClick={() => navigate('/dashboard')}
              className="w-full py-6 bg-slate-800 text-white rounded-[2rem] font-black text-xl hover:scale-105 active:scale-95 transition-all shadow-xl"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      )}

      <style>{`
        .no-select { -webkit-user-select: none; user-select: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        canvas { touch-action: none; }
      `}</style>
    </div>
  );
};

export default FlashSpace;
