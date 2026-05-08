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
  
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [selectedSystem, setSelectedSystem] = useState<string | null>(null);
  const [selectedBoard, setSelectedBoard] = useState<Board | null>(null);
  
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const [activeTool, setActiveTool] = useState<Tool>('pen');
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
  const [isTimerActive, setIsTimerActive] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number | null>(null);
  const cursorRef = useRef<HTMLDivElement>(null);

  const [toolSettings, setToolSettings] = useState<Record<Tool, { size: number, opacity: number, color: string }>>({
    pen: { size: 3, opacity: 1, color: '#3b82f6' },
    highlighter: { size: 35, opacity: 0.3, color: '#eab308' },
    eraser: { size: 40, opacity: 1, color: '#ffffff' },
    laser: { size: 10, opacity: 1, color: '#ef4444' },
    text: { size: 24, opacity: 1, color: '#1e293b' }
  });

  // --- Professional Zero-Lag Cursor ---
  useEffect(() => {
    const cursor = cursorRef.current;
    const handleMove = (e: MouseEvent) => {
      if (cursor) {
        // Direct DOM update for performance (No React re-render)
        cursor.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  const CursorUI = () => {
    // Persistent subtle outline for Eraser, tiny dot for others
    const isEraser = activeTool === 'eraser';
    const size = isEraser ? toolSettings.eraser.size * zoom : 4;
    
    return (
      <div 
        ref={cursorRef}
        className="fixed top-0 left-0 pointer-events-none z-[2000] -translate-x-1/2 -translate-y-1/2"
        style={{ width: `${size}px`, height: `${size}px` }}
      >
        <div className={cn(
          "w-full h-full rounded-full border transition-all duration-200",
          isEraser ? "border-slate-400 bg-white/20" : "bg-primary border-white scale-50"
        )} />
      </div>
    );
  };

  // --- Pro Rendering Engine (Optimized) ---
  const drawPath = useCallback((ctx: CanvasRenderingContext2D, path: Path, opacityOverride?: number) => {
    if (path.points.length < 2) return;
    
    ctx.beginPath();
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.globalAlpha = opacityOverride ?? path.opacity;

    if (path.tool === 'highlighter') ctx.globalCompositeOperation = 'multiply';
    else if (path.tool === 'eraser') ctx.globalCompositeOperation = 'destination-out';
    else ctx.globalCompositeOperation = 'source-over';

    ctx.lineWidth = path.size;
    ctx.strokeStyle = path.color;

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

    // Zero-Lag 3D Laser Effect (Double Stroke instead of Shadows)
    if (path.tool === 'laser') {
      ctx.beginPath();
      ctx.lineWidth = path.size / 2.5;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.moveTo(path.points[0].x, path.points[0].y);
      for (let i = 1; i < path.points.length - 1; i++) {
        ctx.lineTo(path.points[i].x, path.points[i].y);
      }
      ctx.stroke();
    }

    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }, []);

  const renderFrame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    paths.forEach(p => drawPath(ctx, p));
    if (currentPath) drawPath(ctx, currentPath);

    const now = Date.now();
    fadingLasersRef.current = fadingLasersRef.current.filter(l => {
      const elapsed = now - (l.fadeStart || 0);
      if (elapsed > 1500) return false;
      drawPath(ctx, l, 1 - (elapsed / 1500));
      return true;
    });

    requestRef.current = requestAnimationFrame(renderFrame);
  }, [paths, currentPath, drawPath]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(renderFrame);
    return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); };
  }, [renderFrame]);

  // --- Object-Based Pro Eraser ---
  const handleEraser = (pos: Point) => {
    const eraserSize = toolSettings.eraser.size;
    setPaths(prev => prev.filter(path => {
      // If any point in the path is near the eraser, remove the entire path (Object Eraser)
      const isHit = path.points.some(p => {
        const dx = p.x - pos.x;
        const dy = p.y - pos.y;
        return Math.sqrt(dx * dx + dy * dy) < eraserSize / 2;
      });
      return !isHit;
    }));
  };

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
    
    if (activeTool === 'eraser') {
      handleEraser(pos);
      setCurrentPath({ id: 'eraser-mark', points: [pos], tool: 'eraser', color: '#fff', size: 1, opacity: 0 });
      return;
    }

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
    if (activeTool === 'eraser') {
      handleEraser(pos);
      return;
    }
    setCurrentPath(prev => prev ? ({ ...prev, points: [...prev.points, pos] }) : null);
  };

  const handleEnd = () => {
    if (!currentPath) return;
    if (activeTool === 'laser') {
      fadingLasersRef.current.push({ ...currentPath, fadeStart: Date.now(), isFading: true });
    } else if (activeTool !== 'eraser') {
      setPaths(prev => [...prev, currentPath]);
      setRedoPaths([]);
    }
    setCurrentPath(null);
  };

  const updateSetting = (tool: Tool, key: string, val: any) => {
    setToolSettings(prev => ({ ...prev, [tool]: { ...prev[tool], [key]: val } }));
  };

  // UI Components (Same beautiful structure)
  if (loading) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50 gap-6">
      <div className="w-20 h-20 bg-primary/10 rounded-[2.5rem] flex items-center justify-center animate-bounce"><Brain className="w-10 h-10 text-primary" /></div>
      <p className="text-xl font-black text-slate-400 animate-pulse uppercase tracking-widest">Initialising CLINOMA Space...</p>
    </div>
  );

  if (!selectedBoard) {
    return (
      <div className="h-screen w-full bg-[#f8fafc] flex flex-col overflow-hidden font-sans">
        <div className="h-20 bg-white border-b border-slate-200 px-12 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4"><div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center text-white"><Brain className="w-6 h-6" /></div><h1 className="text-2xl font-black tracking-tight">CLINOMA Flash Space</h1></div>
          <button onClick={() => navigate('/flashcards')} className="p-3 bg-slate-100 rounded-2xl hover:bg-slate-200 transition-all font-bold text-xs flex items-center gap-2"><ChevronLeft className="w-4 h-4" /> Back</button>
        </div>
        <div className="flex-1 overflow-y-auto p-12 bg-slate-50/50">
          <div className="max-w-7xl mx-auto space-y-12">
            {!selectedModule ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-8">
                {modules.map(mod => (
                  <button key={mod} onClick={() => setSelectedModule(mod)} className="group bg-white p-10 rounded-[3rem] border-2 border-slate-100 hover:border-primary transition-all text-left shadow-xl relative overflow-hidden">
                    <div className="relative z-10 space-y-4"><div className="w-16 h-16 bg-primary/10 rounded-3xl flex items-center justify-center text-primary"><BookOpen className="w-8 h-8" /></div><h3 className="text-2xl font-black text-slate-800">{mod}</h3></div>
                  </button>
                ))}
              </div>
            ) : !selectedSystem ? (
              <div className="space-y-8">
                <button onClick={() => setSelectedModule(null)} className="text-primary font-black flex items-center gap-2"><ChevronLeft className="w-5 h-5" /> Back</button>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-left-8">
                  {systems[selectedModule]?.map(sys => (
                    <button key={sys} onClick={() => setSelectedSystem(sys)} className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-100 hover:border-primary transition-all text-center shadow-lg"><h4 className="text-xl font-black text-slate-800">{sys}</h4></button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                <button onClick={() => setSelectedSystem(null)} className="text-primary font-black flex items-center gap-2"><ChevronLeft className="w-5 h-5" /> Back</button>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in zoom-in-95">
                  {boards.filter(b => b.module === selectedModule && b.system === selectedSystem).map(board => (
                    <button key={board.id} onClick={() => { setSelectedBoard(board); setIsTimerActive(true); }} className="group bg-white p-6 rounded-[2rem] border-2 border-slate-100 hover:border-emerald-500 transition-all text-left shadow-md flex flex-col gap-4">
                      <div className="aspect-video rounded-2xl overflow-hidden"><img src={board.medicalImage} alt="" className="w-full h-full object-cover" /></div>
                      <h5 className="font-black text-slate-800 line-clamp-2">{board.disease}</h5>
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

  return (
    <div className="h-screen w-full bg-[#f8fafc] flex overflow-hidden font-sans no-select cursor-none">
      <CursorUI />
      
      <div onMouseEnter={() => setIsSidebarHovered(true)} onMouseLeave={() => setIsSidebarHovered(false)} className={cn("h-full bg-white border-r border-slate-200 transition-all duration-500 z-[100] flex flex-col shadow-2xl", isSidebarHovered ? "w-80" : "w-16")}>
        <div className="h-16 flex items-center px-4 border-b border-slate-100"><div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white shrink-0"><Brain className="w-5 h-5" /></div></div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-4">
          {modules.map(mod => (
            <div key={mod} className="space-y-1">
              <button onClick={() => { setSelectedModule(selectedModule === mod ? null : mod); setSelectedSystem(null); }} className={cn("w-full flex items-center gap-3 p-3 rounded-xl transition-all", selectedModule === mod ? "bg-primary/10 text-primary" : "hover:bg-slate-50 text-slate-600")}><BookOpen className="w-5 h-5 shrink-0" /><span className={cn("font-bold text-sm", isSidebarHovered ? "opacity-100" : "opacity-0")}>{mod}</span></button>
              {selectedModule === mod && isSidebarHovered && systems[mod]?.map(sys => (
                <div key={sys} className="ml-6 space-y-1">
                  <button onClick={() => setSelectedSystem(selectedSystem === sys ? null : sys)} className={cn("w-full flex items-center gap-3 p-2 rounded-lg text-left transition-all", selectedSystem === sys ? "text-primary font-black" : "text-slate-500 hover:text-slate-800")}><ChevronRight className={cn("w-3 h-3 transition-transform", selectedSystem === sys ? "rotate-90" : "")} /><span className="text-xs font-bold">{sys}</span></button>
                  {selectedSystem === sys && (
                    <div className="ml-4 space-y-1 border-l-2 border-slate-100 pl-4">
                      {boards.filter(b => b.module === mod && b.system === sys).map(board => (
                        <button key={board.id} onClick={() => setSelectedBoard(board)} className={cn("w-full text-left p-2 rounded-lg text-[11px] font-bold transition-all", selectedBoard?.id === board.id ? "bg-emerald-500 text-white shadow-md" : "text-slate-400 hover:text-slate-600")}>{board.disease}</button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col relative overflow-hidden">
        <div className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between z-50">
          <div className="flex items-center gap-4">
            <button onClick={() => setShowSummary(true)} className="p-2.5 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all flex items-center gap-2 font-black text-[10px] uppercase tracking-widest"><LogOut className="w-4 h-4" /> End Session</button>
            <div className="h-6 w-px bg-slate-200" />
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest"><span>{selectedBoard.module}</span><ChevronRight className="w-3 h-3" /><span className="text-slate-800">{selectedBoard.disease}</span></div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-2xl border border-slate-100 relative">
              {[
                { id: 'pen', icon: Pencil },
                { id: 'highlighter', icon: Highlighter },
                { id: 'eraser', icon: Eraser },
                { id: 'laser', icon: Zap }
              ].map(tool => (
                <div key={tool.id} className="relative">
                  <button onClick={() => { setActiveTool(tool.id as Tool); setShowSettingsFor(showSettingsFor === tool.id ? null : tool.id as Tool); }} className={cn("p-2.5 rounded-xl transition-all relative", activeTool === tool.id ? "bg-white text-primary shadow-sm border border-slate-200" : "text-slate-400 hover:text-slate-600")}><tool.icon className="w-4 h-4" /></button>
                  {showSettingsFor === tool.id && (
                    <div className="absolute top-full mt-4 left-1/2 -translate-x-1/2 bg-white border-2 border-slate-100 rounded-3xl shadow-2xl p-6 w-64 z-[2000] animate-in slide-in-from-top-2">
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-400"><span>Size</span><span className="text-primary">{toolSettings[tool.id as Tool].size}px</span></div>
                          <input type="range" min="1" max="100" value={toolSettings[tool.id as Tool].size} onChange={(e) => updateSetting(tool.id as Tool, 'size', parseInt(e.target.value))} className="w-full accent-primary h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer" />
                        </div>
                        {tool.id === 'highlighter' && (
                          <div className="space-y-2">
                            <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-400"><span>Opacity</span><span className="text-primary">{Math.round(toolSettings.highlighter.opacity * 100)}%</span></div>
                            <input type="range" min="0.1" max="1" step="0.1" value={toolSettings.highlighter.opacity} onChange={(e) => updateSetting('highlighter', 'opacity', parseFloat(e.target.value))} className="w-full accent-emerald-500 h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer" />
                          </div>
                        )}
                        <div className="grid grid-cols-5 gap-2">
                          {['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#1e293b'].map(c => (
                            <button key={c} onClick={() => updateSetting(tool.id as Tool, 'color', c)} className={cn("w-6 h-6 rounded-full border-2 transition-transform", toolSettings[tool.id as Tool].color === c ? "border-slate-800 scale-110" : "border-transparent")} style={{ backgroundColor: c }} />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-2xl border border-slate-100">
              <button onClick={() => { if(paths.length > 0) { setRedoPaths(prev => [...prev, paths[paths.length-1]]); setPaths(prev => prev.slice(0,-1)); } }} className="p-2 text-slate-400 hover:text-primary transition-all"><Undo2 className="w-4 h-4" /></button>
              <button onClick={() => { if(redoPaths.length > 0) { setPaths(prev => [...prev, redoPaths[redoPaths.length-1]]); setRedoPaths(prev => prev.slice(0,-1)); } }} className="p-2 text-slate-400 hover:text-primary transition-all"><Redo2 className="w-4 h-4" /></button>
            </div>
            <div className="flex items-center gap-3 px-4 py-2 bg-emerald-50 rounded-2xl border border-emerald-100"><Clock className="w-4 h-4 text-emerald-600" /><span className="text-xs font-black text-emerald-700 w-12 text-center tabular-nums">{Math.floor(sessionSeconds/60)}:{(sessionSeconds%60).toString().padStart(2,'0')}</span><button onClick={() => setIsTimerActive(!isTimerActive)} className="p-1.5 bg-white rounded-lg text-emerald-600 shadow-sm">{isTimerActive ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}</button></div>
          </div>
        </div>

        <div className="flex-1 relative bg-slate-50 flex items-center justify-center p-6 overflow-hidden">
          <div className="relative w-full h-full bg-white rounded-[4rem] shadow-2xl border border-slate-200 overflow-hidden flex items-center justify-center">
            <div className="relative transition-transform duration-300" style={{ transform: `scale(${zoom})` }}>
              <img src={selectedBoard.medicalImage} alt="" className="max-w-full max-h-[85vh] rounded-3xl pointer-events-none" draggable={false} />
              <canvas ref={canvasRef} width={2500} height={1800} onMouseDown={handleStart} onMouseMove={handleMove} onMouseUp={handleEnd} onMouseLeave={handleEnd} onTouchStart={handleStart} onTouchMove={handleMove} onTouchEnd={handleEnd} className="absolute inset-0 z-10 w-full h-full touch-none" />
            </div>
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-4 z-50">
              <button onClick={() => setShowExplanation(!showExplanation)} className="px-10 py-5 bg-slate-900 text-white rounded-[2.5rem] font-black text-[10px] uppercase tracking-widest shadow-2xl hover:bg-primary transition-all flex items-center gap-3"><FileText className="w-5 h-5" /> View Notes</button>
              <div className="px-8 py-5 bg-white/90 backdrop-blur-xl border border-slate-200 rounded-[2.5rem] flex items-center gap-8 shadow-2xl"><button onClick={() => setZoom(z => Math.max(0.5, z-0.2))} className="text-slate-400 hover:text-primary"><Minus className="w-5 h-5" /></button><span className="text-[10px] font-black text-slate-800 w-10 text-center">{Math.round(zoom*100)}%</span><button onClick={() => setZoom(z => Math.min(3, z+0.2))} className="text-slate-400 hover:text-primary"><Plus className="w-5 h-5" /></button></div>
            </div>
            {showExplanation && (
              <div className="absolute inset-0 bg-white/98 backdrop-blur-3xl p-16 z-[100] animate-in slide-in-from-bottom-full duration-700">
                <div className="max-w-4xl mx-auto space-y-8"><div className="flex justify-between items-center"><h4 className="text-5xl font-black text-slate-900 tracking-tight">{selectedBoard.disease}</h4><button onClick={() => setShowExplanation(false)} className="p-4 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 rounded-[2rem] transition-all"><X className="w-8 h-8" /></button></div><div className="h-px bg-slate-100 w-full" /><p className="text-2xl text-slate-600 leading-relaxed font-medium">{selectedBoard.explanation}</p></div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showSummary && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-slate-900/60 backdrop-blur-3xl p-4">
          <div className="w-full max-w-md bg-white rounded-[4.5rem] p-16 text-center space-y-10 shadow-3xl animate-in zoom-in-95 duration-500">
            <div className="w-28 h-28 bg-emerald-500/10 text-emerald-500 rounded-[3rem] flex items-center justify-center mx-auto"><Trophy className="w-14 h-14" /></div>
            <h2 className="text-3xl font-black text-slate-800">Mastery Complete!</h2>
            <div className="p-8 bg-emerald-50 rounded-[2.5rem] border border-emerald-100"><span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest block mb-2">Study Session</span><span className="text-4xl font-black text-emerald-700">{Math.floor(sessionSeconds/60)}m {sessionSeconds%60}s</span></div>
            <button onClick={() => navigate('/dashboard')} className="w-full py-7 bg-slate-900 text-white rounded-[2.5rem] font-black text-xl hover:scale-105 active:scale-95 transition-all">Return to Dashboard</button>
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
