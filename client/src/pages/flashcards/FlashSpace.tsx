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
  Trophy,
  Search,
  BookOpen,
  ArrowRight
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
  isFading?: boolean;
  fadeStart?: number;
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
  
  // Selection States
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [selectedSystem, setSelectedSystem] = useState<string | null>(null);
  const [selectedBoard, setSelectedBoard] = useState<Board | null>(null);
  
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const [activeTool, setActiveTool] = useState<Tool>('pen');
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [showSettingsFor, setShowSettingsFor] = useState<Tool | null>(null);
  
  const [zoom, setZoom] = useState(1);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  // Vector Engine
  const [paths, setPaths] = useState<Path[]>([]);
  const [redoPaths, setRedoPaths] = useState<Path[]>([]);
  const [currentPath, setCurrentPath] = useState<Path | null>(null);
  const fadingLasersRef = useRef<Path[]>([]);

  // Timer
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [totalTimeToday, setTotalTimeToday] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number | null>(null);
  const cursorRef = useRef<HTMLDivElement>(null);

  const toolSettings = useMemo(() => ({
    pen: { size: 3, opacity: 1, color: '#3b82f6' },
    highlighter: { size: 30, opacity: 0.3, color: '#eab308' },
    eraser: { size: 40, opacity: 1, color: '#ffffff' },
    laser: { size: 10, opacity: 1, color: '#ef4444' },
    text: { size: 24, opacity: 1, color: '#1e293b' }
  }), []);

  // Cursor Tool Icons
  const ToolCursor = () => {
    const Icon = activeTool === 'pen' ? Pencil : 
                 activeTool === 'highlighter' ? Highlighter : 
                 activeTool === 'eraser' ? Eraser : 
                 activeTool === 'laser' ? Zap : Type;
    return (
      <div 
        ref={cursorRef}
        className="fixed pointer-events-none z-[1000] mix-blend-difference"
        style={{ transition: 'none' }}
      >
        <div className={cn(
          "flex items-center justify-center p-2 rounded-full border-2",
          activeTool === 'laser' ? "bg-rose-500 border-rose-200 text-white animate-pulse" : "bg-white border-slate-200 text-slate-800"
        )}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
    );
  };

  useEffect(() => {
    const handleCursorMove = (e: MouseEvent) => {
      if (cursorRef.current) {
        cursorRef.current.style.left = `${e.clientX}px`;
        cursorRef.current.style.top = `${e.clientY}px`;
        cursorRef.current.style.transform = `translate(-50%, -50%)`;
      }
    };
    window.addEventListener('mousemove', handleCursorMove);
    return () => window.removeEventListener('mousemove', handleCursorMove);
  }, []);

  // Fetch Data
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
      } catch (err) {
        toast.error('Failed to connect to cloud');
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    const savedTime = localStorage.getItem(`clinoma_time_${new Date().toDateString()}`);
    if (savedTime) setTotalTimeToday(parseInt(savedTime));
  }, []);

  // Timer
  useEffect(() => {
    let interval: any;
    if (isTimerActive) {
      interval = setInterval(() => {
        setSessionSeconds(s => s + 1);
        setTotalTimeToday(t => t + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerActive]);

  // --- Pro Vector Engine ---
  const drawPath = useCallback((ctx: CanvasRenderingContext2D, path: Path, opacityOverride?: number) => {
    if (path.points.length < 2) return;
    ctx.beginPath();
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.lineWidth = path.size;
    ctx.strokeStyle = path.color;
    ctx.globalAlpha = opacityOverride ?? path.opacity;

    if (path.tool === 'highlighter') ctx.globalCompositeOperation = 'multiply';
    else if (path.tool === 'eraser') ctx.globalCompositeOperation = 'destination-out';
    else ctx.globalCompositeOperation = 'source-over';

    ctx.moveTo(path.points[0].x, path.points[0].y);
    for (let i = 1; i < path.points.length - 2; i++) {
      const xc = (path.points[i].x + path.points[i + 1].x) / 2;
      const yc = (path.points[i].y + path.points[i + 1].y) / 2;
      ctx.quadraticCurveTo(path.points[i].x, path.points[i].y, xc, yc);
    }
    if (path.points.length > 2) {
      const n = path.points.length;
      ctx.quadraticCurveTo(path.points[n - 2].x, path.points[n - 2].y, path.points[n - 1].x, path.points[n - 1].y);
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

    // 1. Draw Saved Paths
    paths.forEach(p => drawPath(ctx, p));

    // 2. Draw Current Active Path
    if (currentPath) drawPath(ctx, currentPath);

    // 3. Draw Fading Lasers
    const now = Date.now();
    fadingLasersRef.current = fadingLasersRef.current.filter(l => {
      const elapsed = now - (l.fadeStart || 0);
      if (elapsed > 1500) return false;
      const opacity = 1 - (elapsed / 1500);
      drawPath(ctx, l, opacity);
      return true;
    });

    requestRef.current = requestAnimationFrame(renderFrame);
  }, [paths, currentPath, drawPath]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(renderFrame);
    return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); };
  }, [renderFrame]);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
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
    if (!selectedBoard) return;
    const pos = getPos(e);
    const settings = toolSettings[activeTool];
    setCurrentPath({
      id: Math.random().toString(),
      points: [pos],
      tool: activeTool,
      color: settings.color,
      size: settings.size,
      opacity: settings.opacity
    });
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!currentPath) return;
    const pos = getPos(e);
    setCurrentPath(prev => prev ? ({ ...prev, points: [...prev.points, pos] }) : null);
  };

  const handleEnd = () => {
    if (!currentPath) return;
    if (activeTool === 'laser') {
      fadingLasersRef.current.push({ ...currentPath, fadeStart: Date.now(), isFading: true });
    } else {
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

  // --- State Handlers ---
  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50 gap-6">
        <div className="w-20 h-20 bg-primary/10 rounded-[2.5rem] flex items-center justify-center animate-bounce">
          <Brain className="w-10 h-10 text-primary" />
        </div>
        <p className="text-xl font-black text-slate-400 animate-pulse uppercase tracking-widest">Initialising CLINOMA Space...</p>
      </div>
    );
  }

  // --- Initial Selection View ---
  if (!selectedBoard) {
    return (
      <div className="h-screen w-full bg-[#f8fafc] flex flex-col overflow-hidden font-sans">
        {/* Selection Header */}
        <div className="h-20 bg-white border-b border-slate-200 px-12 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center text-white">
              <Brain className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black tracking-tight">CLINOMA Flash Space</h1>
          </div>
          <button onClick={() => navigate('/flashcards')} className="p-3 bg-slate-100 rounded-2xl hover:bg-slate-200 transition-all font-bold text-xs flex items-center gap-2">
            <ChevronLeft className="w-4 h-4" /> Back to Library
          </button>
        </div>

        {/* Selection Content */}
        <div className="flex-1 overflow-y-auto p-12 bg-slate-50/50">
          <div className="max-w-7xl mx-auto space-y-12">
            {/* Steps Indicator */}
            <div className="flex items-center gap-4">
              <div className={cn("px-6 py-2 rounded-full font-black text-xs border-2", !selectedModule ? "bg-primary text-white border-primary" : "bg-emerald-500 text-white border-emerald-500")}>1. Select Module</div>
              <ArrowRight className="w-4 h-4 text-slate-300" />
              <div className={cn("px-6 py-2 rounded-full font-black text-xs border-2", selectedModule && !selectedSystem ? "bg-primary text-white border-primary" : "bg-slate-100 text-slate-400 border-slate-200")}>2. Select Chapter</div>
              <ArrowRight className="w-4 h-4 text-slate-300" />
              <div className={cn("px-6 py-2 rounded-full font-black text-xs border-2", selectedSystem ? "bg-primary text-white border-primary" : "bg-slate-100 text-slate-400 border-slate-200")}>3. Select Topic</div>
            </div>

            {/* Modules Grid */}
            {!selectedModule ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-8">
                {modules.map(mod => (
                  <button
                    key={mod}
                    onClick={() => setSelectedModule(mod)}
                    className="group bg-white p-10 rounded-[3rem] border-2 border-slate-100 hover:border-primary transition-all text-left shadow-xl shadow-slate-200/50 relative overflow-hidden"
                  >
                    <div className="relative z-10 space-y-4">
                      <div className="w-16 h-16 bg-primary/10 rounded-3xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                        <BookOpen className="w-8 h-8" />
                      </div>
                      <h3 className="text-2xl font-black text-slate-800">{mod}</h3>
                      <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">{systems[mod]?.length || 0} Systems</p>
                    </div>
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                      <Brain className="w-32 h-32" />
                    </div>
                  </button>
                ))}
              </div>
            ) : !selectedSystem ? (
              <div className="space-y-8">
                <button onClick={() => setSelectedModule(null)} className="text-primary font-black flex items-center gap-2 hover:underline">
                  <ChevronLeft className="w-5 h-5" /> Back to Modules
                </button>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-left-8">
                  {systems[selectedModule]?.map(sys => (
                    <button
                      key={sys}
                      onClick={() => setSelectedSystem(sys)}
                      className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-100 hover:border-primary transition-all text-center shadow-lg hover:shadow-2xl"
                    >
                      <h4 className="text-xl font-black text-slate-800">{sys}</h4>
                      <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest">{boards.filter(b => b.module === selectedModule && b.system === sys).length} Clinical Topics</p>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                <button onClick={() => setSelectedSystem(null)} className="text-primary font-black flex items-center gap-2 hover:underline">
                  <ChevronLeft className="w-5 h-5" /> Back to Systems
                </button>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in zoom-in-95">
                  {boards.filter(b => b.module === selectedModule && b.system === selectedSystem).map(board => (
                    <button
                      key={board.id}
                      onClick={() => { setSelectedBoard(board); setIsTimerActive(true); }}
                      className="group bg-white p-6 rounded-[2rem] border-2 border-slate-100 hover:border-emerald-500 transition-all text-left shadow-md flex flex-col gap-4"
                    >
                      <div className="aspect-video rounded-2xl overflow-hidden border border-slate-100">
                        <img src={board.medicalImage} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                      </div>
                      <h5 className="font-black text-slate-800 line-clamp-2">{board.disease}</h5>
                      <div className="mt-auto flex items-center justify-between text-[10px] font-black uppercase text-emerald-600">
                        <span>Ready to study</span>
                        <ArrowRight className="w-3 h-3" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- Study View ---
  return (
    <div className="h-screen w-full bg-[#f8fafc] flex overflow-hidden font-sans no-select cursor-none">
      <ToolCursor />
      
      {/* Sidebar Hierarchy */}
      <div 
        onMouseEnter={() => setIsSidebarHovered(true)}
        onMouseLeave={() => setIsSidebarHovered(false)}
        className={cn(
          "h-full bg-white border-r border-slate-200 transition-all duration-500 ease-in-out z-[100] flex flex-col shadow-2xl",
          isSidebarHovered ? "w-80" : "w-16"
        )}
      >
        <div className="h-16 flex items-center px-4 border-b border-slate-100">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white shrink-0">
            <Brain className="w-5 h-5" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-4">
          {modules.map(mod => (
            <div key={mod} className="space-y-1">
              <button
                onClick={() => { setSelectedModule(selectedModule === mod ? null : mod); setSelectedSystem(null); }}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-xl transition-all",
                  selectedModule === mod ? "bg-primary/10 text-primary" : "hover:bg-slate-50 text-slate-600"
                )}
              >
                <BookOpen className="w-5 h-5 shrink-0" />
                <span className={cn("font-bold text-sm whitespace-nowrap transition-opacity duration-300", isSidebarHovered ? "opacity-100" : "opacity-0")}>{mod}</span>
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

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Top Navigation */}
        <div className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between z-50">
          <div className="flex items-center gap-4">
            <button onClick={() => setShowSummary(true)} className="p-2.5 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all flex items-center gap-2 font-black text-[10px] uppercase tracking-widest">
              <LogOut className="w-4 h-4" /> End Session
            </button>
            <div className="h-6 w-px bg-slate-200" />
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <span>{selectedBoard.module}</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-slate-800">{selectedBoard.disease}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Tool Settings Popovers */}
            <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-2xl border border-slate-100 relative">
              {[
                { id: 'pen', icon: Pencil },
                { id: 'highlighter', icon: Highlighter },
                { id: 'eraser', icon: Eraser },
                { id: 'laser', icon: Zap }
              ].map(tool => (
                <div key={tool.id} className="relative">
                  <button
                    onClick={() => {
                      setActiveTool(tool.id as Tool);
                      setShowSettingsFor(showSettingsFor === tool.id ? null : tool.id as Tool);
                    }}
                    className={cn(
                      "p-2.5 rounded-xl transition-all relative",
                      activeTool === tool.id ? "bg-white text-primary shadow-sm border border-slate-200" : "text-slate-400 hover:text-slate-600"
                    )}
                  >
                    <tool.icon className="w-4 h-4" />
                    {activeTool === tool.id && <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-pulse" />}
                  </button>

                  {showSettingsFor === tool.id && (
                    <div className="absolute top-full mt-4 left-1/2 -translate-x-1/2 bg-white border-2 border-slate-100 rounded-3xl shadow-2xl p-6 w-56 z-[2000] animate-in slide-in-from-top-2">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-400">
                          <span>Brush Size</span>
                          <span className="text-primary">{toolSettings[tool.id as Tool].size}px</span>
                        </div>
                        <input 
                          type="range" min="1" max="100" 
                          value={toolSettings[tool.id as Tool].size}
                          onChange={(e) => {}} // Handle setting update logic
                          className="w-full accent-primary h-1 bg-slate-100 rounded-lg appearance-none"
                        />
                        <div className="grid grid-cols-5 gap-2">
                          {['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#1e293b'].map(c => (
                            <button key={c} className="w-6 h-6 rounded-full border border-slate-200" style={{ backgroundColor: c }} />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-2xl border border-slate-100">
              <button onClick={undo} className="p-2 text-slate-400 hover:text-primary transition-all"><Undo2 className="w-4 h-4" /></button>
              <button onClick={redo} className="p-2 text-slate-400 hover:text-primary transition-all"><Redo2 className="w-4 h-4" /></button>
            </div>

            <div className="flex items-center gap-3 px-4 py-2 bg-emerald-50 rounded-2xl border border-emerald-100">
              <Clock className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-black text-emerald-700 w-12 text-center tabular-nums">{Math.floor(sessionSeconds / 60)}:{(sessionSeconds % 60).toString().padStart(2, '0')}</span>
              <button onClick={() => setIsTimerActive(!isTimerActive)} className="p-1.5 bg-white rounded-lg text-emerald-600 shadow-sm">
                {isTimerActive ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              </button>
            </div>
          </div>
        </div>

        {/* Study Content Area */}
        <div className="flex-1 relative bg-slate-50 flex items-center justify-center p-6 overflow-hidden">
          <div className="relative w-full h-full bg-white rounded-[4rem] shadow-2xl border border-slate-200 overflow-hidden flex items-center justify-center">
            <div 
              className="relative transition-transform duration-300"
              style={{ transform: `scale(${zoom})` }}
            >
              <img 
                src={selectedBoard.medicalImage} 
                alt="" className="max-w-full max-h-[85vh] rounded-3xl pointer-events-none"
                draggable={false}
              />
              <canvas
                ref={canvasRef}
                width={2000}
                height={1500}
                onMouseDown={handleStart}
                onMouseMove={handleMove}
                onMouseUp={handleEnd}
                onMouseLeave={handleEnd}
                onTouchStart={handleStart}
                onTouchMove={handleMove}
                onTouchEnd={handleEnd}
                className="absolute inset-0 z-10 w-full h-full touch-none"
              />
            </div>

            {/* Controls */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-4 z-50">
              <button onClick={() => setShowExplanation(!showExplanation)} className="px-10 py-5 bg-slate-900 text-white rounded-[2.5rem] font-black text-[10px] uppercase tracking-widest shadow-2xl hover:bg-primary transition-all flex items-center gap-3">
                <FileText className="w-5 h-5" /> View Notes
              </button>
              <div className="px-8 py-5 bg-white/90 backdrop-blur-xl border border-slate-200 rounded-[2.5rem] flex items-center gap-8 shadow-2xl">
                <button onClick={() => setZoom(z => Math.max(0.5, z - 0.2))} className="text-slate-400 hover:text-primary"><Minus className="w-5 h-5" /></button>
                <span className="text-[10px] font-black text-slate-800 w-10 text-center">{Math.round(zoom * 100)}%</span>
                <button onClick={() => setZoom(z => Math.min(3, z + 0.2))} className="text-slate-400 hover:text-primary"><Plus className="w-5 h-5" /></button>
              </div>
            </div>

            {/* Slide-up Notes */}
            {showExplanation && (
              <div className="absolute inset-0 bg-white/98 backdrop-blur-3xl p-16 z-[100] animate-in slide-in-from-bottom-full duration-700">
                <div className="max-w-4xl mx-auto space-y-8">
                  <div className="flex justify-between items-center">
                    <h4 className="text-5xl font-black text-slate-900 tracking-tight">{selectedBoard.disease}</h4>
                    <button onClick={() => setShowExplanation(false)} className="p-4 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 rounded-[2rem] transition-all">
                      <X className="w-8 h-8" />
                    </button>
                  </div>
                  <div className="h-px bg-slate-100 w-full" />
                  <p className="text-2xl text-slate-600 leading-relaxed font-medium">{selectedBoard.explanation}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Summary Trophy */}
      {showSummary && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-slate-900/60 backdrop-blur-3xl p-4">
          <div className="w-full max-w-md bg-white rounded-[4.5rem] p-16 text-center space-y-10 shadow-3xl animate-in zoom-in-95 duration-500">
            <div className="w-28 h-28 bg-emerald-500/10 text-emerald-500 rounded-[3rem] flex items-center justify-center mx-auto">
              <Trophy className="w-14 h-14" />
            </div>
            <h2 className="text-3xl font-black text-slate-800">Mastery Complete!</h2>
            <div className="p-8 bg-emerald-50 rounded-[2.5rem] border border-emerald-100">
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest block mb-2">Study Session</span>
              <span className="text-4xl font-black text-emerald-700">{Math.floor(sessionSeconds / 60)}m {sessionSeconds % 60}s</span>
            </div>
            <button onClick={() => navigate('/dashboard')} className="w-full py-7 bg-slate-900 text-white rounded-[2.5rem] font-black text-xl hover:scale-105 active:scale-95 transition-all">
              Return to Dashboard
            </button>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        canvas { touch-action: none; }
      `}</style>
    </div>
  );
};

export default FlashSpace;
