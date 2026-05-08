import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
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
  CheckCircle2,
  ChevronRight,
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

// --- Vector Types ---
type Tool = 'pen' | 'highlighter' | 'eraser' | 'laser' | 'text';

interface Point {
  x: number;
  y: number;
}

interface Path {
  id: string;
  points: Point[];
  tool: Tool;
  color: string;
  size: number;
  opacity: number;
  createdAt: number;
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
  const [loading, setLoading] = useState(true);
  const [boards, setBoards] = useState<Board[]>([]);
  const [modules, setModules] = useState<string[]>([]);
  const [systems, setSystems] = useState<Record<string, string[]>>({});
  
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [selectedSystem, setSelectedSystem] = useState<string | null>(null);
  const [selectedBoard, setSelectedBoard] = useState<Board | null>(null);
  
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const [activeTool, setActiveTool] = useState<Tool>('pen');
  const [zoom, setZoom] = useState(1);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  // Vector Engine State
  const [paths, setPaths] = useState<Path[]>([]);
  const [redoPaths, setRedoPaths] = useState<Path[]>([]);
  const [currentPath, setCurrentPath] = useState<Path | null>(null);
  const [lasers, setLasers] = useState<(Path & { life: number })[]>([]);

  // Timer
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [totalTimeToday, setTotalTimeToday] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();

  const toolSettings = useMemo(() => ({
    pen: { size: 3, opacity: 1, color: '#3b82f6' },
    highlighter: { size: 30, opacity: 0.25, color: '#eab308' },
    eraser: { size: 30, opacity: 1, color: '#ffffff' },
    laser: { size: 6, opacity: 1, color: '#ef4444' },
    text: { size: 24, opacity: 1, color: '#1e293b' }
  }), []);

  // Fetch Initial Data
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
        toast.error('Connection failed');
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    const savedTime = localStorage.getItem(`clinoma_time_${new Date().toDateString()}`);
    if (savedTime) setTotalTimeToday(parseInt(savedTime));
  }, []);

  // Timer Persistence
  useEffect(() => {
    let interval: any;
    if (isTimerActive) {
      interval = setInterval(() => {
        setSessionSeconds(s => s + 1);
        setTotalTimeToday(t => {
          const newTotal = t + 1;
          localStorage.setItem(`clinoma_time_${new Date().toDateString()}`, newTotal.toString());
          return newTotal;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerActive]);

  // --- Professional Vector Rendering Engine ---
  const drawPath = useCallback((ctx: CanvasRenderingContext2D, path: Path, overrideOpacity?: number) => {
    if (path.points.length < 2) return;

    ctx.beginPath();
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.lineWidth = path.size;
    ctx.strokeStyle = path.color;
    ctx.globalAlpha = overrideOpacity ?? path.opacity;

    if (path.tool === 'highlighter') {
      ctx.globalCompositeOperation = 'multiply';
    } else if (path.tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
    } else {
      ctx.globalCompositeOperation = 'source-over';
    }

    ctx.moveTo(path.points[0].x, path.points[0].y);

    // Quadratic Curve Smoothing for "Ink" feel
    for (let i = 1; i < path.points.length - 2; i++) {
      const xc = (path.points[i].x + path.points[i + 1].x) / 2;
      const yc = (path.points[i].y + path.points[i + 1].y) / 2;
      ctx.quadraticCurveTo(path.points[i].x, path.points[i].y, xc, yc);
    }
    
    // Connect to last point
    if (path.points.length > 2) {
      const n = path.points.length;
      ctx.quadraticCurveTo(
        path.points[n - 2].x, 
        path.points[n - 2].y, 
        path.points[n - 1].x, 
        path.points[n - 1].y
      );
    }

    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }, []);

  const renderFrame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw saved paths
    paths.forEach(p => drawPath(ctx, p));

    // Draw current path (Live)
    if (currentPath) drawPath(ctx, currentPath);

    // Draw active lasers with life cycle
    setLasers(prev => {
      const active = prev.filter(l => l.life > 0);
      active.forEach(l => {
        drawPath(ctx, l, l.life / 100);
      });
      return active.map(l => ({ ...l, life: l.life - 1.5 })); // Fade speed
    });

    requestRef.current = requestAnimationFrame(renderFrame);
  }, [paths, currentPath, drawPath]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(renderFrame);
    return () => cancelAnimationFrame(requestRef.current!);
  }, [renderFrame]);

  // Coordinate Mapping
  const getMousePos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height)
    };
  };

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    const pos = getMousePos(e);
    const settings = toolSettings[activeTool];
    
    const newPath: Path = {
      id: Math.random().toString(36),
      points: [pos],
      tool: activeTool,
      color: settings.color,
      size: settings.size,
      opacity: settings.opacity,
      createdAt: Date.now()
    };

    if (activeTool === 'laser') {
      setLasers(prev => [...prev, { ...newPath, life: 100 }]);
      setCurrentPath({ ...newPath, life: 100 } as any);
    } else {
      setCurrentPath(newPath);
    }
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!currentPath) return;
    const pos = getMousePos(e);
    
    // Optimization: Only add point if moved enough
    const lastPoint = currentPath.points[currentPath.points.length - 1];
    const dist = Math.sqrt(Math.pow(pos.x - lastPoint.x, 2) + Math.pow(pos.y - lastPoint.y, 2));
    
    if (dist > 2) {
      if (activeTool === 'laser') {
        setLasers(prev => {
          const last = prev[prev.length - 1];
          if (last) last.points.push(pos);
          return [...prev];
        });
      } else {
        setCurrentPath(prev => prev ? ({ ...prev, points: [...prev.points, pos] }) : null);
      }
    }
  };

  const handleEnd = () => {
    if (currentPath && activeTool !== 'laser') {
      setPaths(prev => [...prev, currentPath]);
      setRedoPaths([]);
    }
    setCurrentPath(null);
  };

  const undo = () => {
    if (paths.length === 0) return;
    const last = paths[paths.length - 1];
    setRedoPaths(prev => [...prev, last]);
    setPaths(prev => prev.slice(0, -1));
  };

  const redo = () => {
    if (redoPaths.length === 0) return;
    const last = redoPaths[redoPaths.length - 1];
    setPaths(prev => [...prev, last]);
    setRedoPaths(prev => prev.slice(0, -1));
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-screen w-full bg-[#f8fafc] flex overflow-hidden font-sans select-none no-select">
      {/* Sidebar - Pro Navigation */}
      <div 
        onMouseEnter={() => setIsSidebarHovered(true)}
        onMouseLeave={() => setIsSidebarHovered(false)}
        className={cn(
          "h-full bg-white border-r border-slate-200 transition-all duration-500 ease-in-out z-[100] flex flex-col shadow-2xl shadow-slate-200/50",
          isSidebarHovered ? "w-80" : "w-16"
        )}
      >
        <div className="p-4 border-b border-slate-100 flex items-center gap-3 h-16 shrink-0 overflow-hidden">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white shrink-0">
            <Brain className="w-5 h-5" />
          </div>
          <span className={cn("font-black text-lg transition-opacity", isSidebarHovered ? "opacity-100" : "opacity-0")}>CLINOMA</span>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-4">
          {isSidebarHovered && (
            <div className="px-3 py-4 mb-2 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Current Focus</p>
              <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{selectedBoard?.disease || 'Unit Selection'}</h4>
            </div>
          )}

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
                <span className={cn("font-bold text-sm transition-opacity", isSidebarHovered ? "opacity-100" : "opacity-0")}>{mod}</span>
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
                    <span className="text-xs font-bold">{sys}</span>
                  </button>
                  
                  {selectedSystem === sys && (
                    <div className="ml-4 space-y-1 border-l-2 border-slate-100 pl-4 animate-in slide-in-from-top-2">
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

      {/* Workspace */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Pro Top Bar */}
        <div className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between z-50">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowSummary(true)}
              className="p-2.5 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all flex items-center gap-2 font-black text-[10px] uppercase tracking-widest"
            >
              <LogOut className="w-4 h-4" /> End Session
            </button>
            <div className="h-6 w-px bg-slate-200" />
            <div className="flex flex-col">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Active Board</span>
              <span className="text-xs font-black text-slate-800">{selectedBoard?.disease || 'Ready to Study'}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Vector Tools */}
            <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-2xl border border-slate-100">
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
                    "p-2.5 rounded-xl transition-all",
                    activeTool === tool.id ? "bg-white text-primary shadow-sm border border-slate-200" : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  <tool.icon className="w-4 h-4" />
                </button>
              ))}
            </div>

            {/* History Controls */}
            <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-2xl border border-slate-100">
              <button onClick={undo} className="p-2 text-slate-400 hover:text-primary"><Undo2 className="w-4 h-4" /></button>
              <button onClick={redo} className="p-2 text-slate-400 hover:text-primary"><Redo2 className="w-4 h-4" /></button>
            </div>

            {/* Smart Timer */}
            <div className="flex items-center gap-3 px-4 py-2 bg-emerald-50 rounded-2xl border border-emerald-100">
              <Clock className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-black text-emerald-700 w-12 text-center tabular-nums">{formatTime(sessionSeconds)}</span>
              <button 
                onClick={() => setIsTimerActive(!isTimerActive)}
                className="p-1.5 bg-white rounded-lg text-emerald-600 hover:scale-110 transition-transform shadow-sm"
              >
                {isTimerActive ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              </button>
            </div>
          </div>
        </div>

        {/* Vector Canvas Area */}
        <div className="flex-1 relative bg-slate-50 flex items-center justify-center p-6">
          {selectedBoard ? (
            <div className="relative w-full h-full bg-white rounded-[3.5rem] shadow-2xl border border-slate-200 overflow-hidden flex items-center justify-center">
              <div className="relative" style={{ transform: `scale(${zoom})`, transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}>
                <img 
                  src={selectedBoard.medicalImage} 
                  alt="Board" 
                  className="max-w-full max-h-[85vh] rounded-3xl pointer-events-none border-4 border-slate-50"
                  draggable={false}
                />
                <canvas
                  ref={canvasRef}
                  width={2500} // Ultra-High Internal Resolution for Vectors
                  height={1800}
                  onMouseDown={handleStart}
                  onMouseMove={handleMove}
                  onMouseUp={handleEnd}
                  onMouseLeave={handleEnd}
                  onTouchStart={handleStart}
                  onTouchMove={handleMove}
                  onTouchEnd={handleEnd}
                  className="absolute inset-0 z-10 w-full h-full touch-none cursor-crosshair"
                />
              </div>

              {/* Floating Toolbar */}
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-4 z-50 animate-in fade-in slide-in-from-bottom-4">
                <button 
                  onClick={() => setShowExplanation(!showExplanation)}
                  className="px-10 py-5 bg-slate-900 text-white rounded-[2.5rem] font-black text-[10px] uppercase tracking-widest shadow-2xl hover:bg-primary transition-all flex items-center gap-3"
                >
                  <FileText className="w-5 h-5" /> View Notes
                </button>
                <div className="px-8 py-5 bg-white/90 backdrop-blur-xl border border-slate-200 rounded-[2.5rem] flex items-center gap-8 shadow-2xl">
                  <button onClick={() => setZoom(z => Math.max(0.5, z - 0.2))} className="text-slate-400 hover:text-primary transition-colors"><Minus className="w-5 h-5" /></button>
                  <span className="text-[10px] font-black text-slate-800 w-10 text-center">{Math.round(zoom * 100)}%</span>
                  <button onClick={() => setZoom(z => Math.min(3, z + 0.2))} className="text-slate-400 hover:text-primary transition-colors"><Plus className="w-5 h-5" /></button>
                </div>
              </div>

              {/* Pro Notes View */}
              {showExplanation && (
                <div className="absolute inset-0 bg-white/98 backdrop-blur-3xl p-16 z-[100] animate-in fade-in slide-in-from-bottom-full duration-700">
                  <div className="max-w-4xl mx-auto space-y-10">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <h4 className="text-5xl font-black text-slate-900 tracking-tight">{selectedBoard.disease}</h4>
                        <div className="flex items-center gap-2 text-primary font-bold uppercase text-xs tracking-widest">
                          <span>{selectedModule}</span>
                          <ChevronRight className="w-4 h-4" />
                          <span>{selectedSystem}</span>
                        </div>
                      </div>
                      <button onClick={() => setShowExplanation(false)} className="p-5 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 rounded-[2rem] transition-all shadow-sm">
                        <X className="w-8 h-8" />
                      </button>
                    </div>
                    <div className="h-px bg-slate-100 w-24" />
                    <p className="text-2xl text-slate-600 leading-relaxed font-medium">{selectedBoard.explanation}</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-6 opacity-20">
              <div className="w-32 h-32 bg-slate-200 rounded-[3rem] flex items-center justify-center animate-pulse">
                <Layout className="w-16 h-16 text-slate-400" />
              </div>
              <p className="text-3xl font-black text-slate-400">Select clinical content from the left sidebar</p>
            </div>
          )}
        </div>
      </div>

      {/* Pro Session Summary */}
      {showSummary && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/60 backdrop-blur-3xl p-4 animate-in fade-in duration-500">
          <div className="w-full max-w-md bg-white rounded-[4.5rem] p-16 text-center space-y-10 shadow-3xl">
            <div className="w-28 h-28 bg-emerald-500/10 text-emerald-500 rounded-[3rem] flex items-center justify-center mx-auto shadow-inner">
              <Trophy className="w-14 h-14" />
            </div>
            <div className="space-y-2">
              <h2 className="text-4xl font-black text-slate-900 tracking-tight">Mission Accomplished</h2>
              <p className="text-slate-400 font-bold">You've mastered this clinical unit today.</p>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div className="p-8 bg-emerald-50 rounded-[2.5rem] border border-emerald-100 shadow-sm flex flex-col items-center">
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Deep Focus Time</span>
                <span className="text-4xl font-black text-emerald-700 tabular-nums">{formatTime(sessionSeconds)}</span>
              </div>
            </div>
            <button 
              onClick={() => navigate('/dashboard')}
              className="w-full py-7 bg-slate-900 text-white rounded-[2.5rem] font-black text-xl hover:scale-105 active:scale-95 transition-all shadow-2xl"
            >
              Exit to Dashboard
            </button>
          </div>
        </div>
      )}

      <style>{`
        .no-select { -webkit-user-select: none; user-select: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        canvas { touch-action: none; image-rendering: -webkit-optimize-contrast; }
      `}</style>
    </div>
  );
};

export default FlashSpace;
