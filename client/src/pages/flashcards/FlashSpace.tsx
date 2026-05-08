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
  Settings2
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

  // Timer logic
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [totalTimeToday, setTotalTimeToday] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const lastActivityRef = useRef(Date.now());

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

  // Study Timer Tracker
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

        if (Date.now() - lastActivityRef.current > 3 * 60 * 1000) {
          setIsTimerActive(false);
          toast('Study timer paused due to inactivity', { icon: '⏳' });
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerActive]);

  useEffect(() => {
    const updateActivity = () => {
      lastActivityRef.current = Date.now();
      if (selectedBoard && !isTimerActive) setIsTimerActive(true);
    };
    window.addEventListener('mousemove', updateActivity);
    window.addEventListener('keydown', updateActivity);
    return () => {
      window.removeEventListener('mousemove', updateActivity);
      window.removeEventListener('keydown', updateActivity);
    };
  }, [selectedBoard, isTimerActive]);

  const [toolSettings, setToolSettings] = useState<Record<Tool, ToolSettings>>({
    pen: { size: 3, opacity: 1, color: '#3b82f6' },
    highlighter: { size: 30, opacity: 0.25, color: '#eab308' },
    eraser: { size: 40, opacity: 1, color: '#ffffff' },
    laser: { size: 8, opacity: 1, color: '#ef4444' },
    text: { size: 24, opacity: 1, color: '#1e293b' }
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const historyRef = useRef<string[]>([]);
  const [historyStep, setHistoryStep] = useState(-1);
  const lastPoint = useRef<{ x: number, y: number } | null>(null);

  // Smooth Drawing Engine
  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (!canvasRef.current || !selectedBoard) return;
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const x = (clientX - rect.left) / zoom;
    const y = (clientY - rect.top) / zoom;
    
    lastPoint.current = { x, y };
    ctx.beginPath();
    ctx.moveTo(x, y);
    
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
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !canvasRef.current || !lastPoint.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const x = (clientX - rect.left) / zoom;
    const y = (clientY - rect.top) / zoom;

    if (activeTool === 'laser') {
      ctx.beginPath();
      ctx.arc(x, y, toolSettings.laser.size, 0, Math.PI * 2);
      ctx.fillStyle = toolSettings.laser.color;
      ctx.fill();
      setTimeout(() => {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(x, y, toolSettings.laser.size + 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalCompositeOperation = 'source-over';
      }, 1000);
    } else {
      const midPoint = {
        x: (lastPoint.current.x + x) / 2,
        y: (lastPoint.current.y + y) / 2
      };
      ctx.quadraticCurveTo(lastPoint.current.x, lastPoint.current.y, midPoint.x, midPoint.y);
      ctx.stroke();
    }
    lastPoint.current = { x, y };
  };

  const endDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      lastPoint.current = null;
      saveToHistory();
    }
  };

  const saveToHistory = () => {
    if (!canvasRef.current) return;
    const data = canvasRef.current.toDataURL();
    const newHistory = historyRef.current.slice(0, historyStep + 1);
    newHistory.push(data);
    if (newHistory.length > 50) newHistory.shift();
    historyRef.current = newHistory;
    setHistoryStep(newHistory.length - 1);
  };

  const undo = () => {
    if (historyStep > 0 && canvasRef.current) {
      const step = historyStep - 1;
      const img = new Image();
      img.src = historyRef.current[step];
      img.onload = () => {
        const ctx = canvasRef.current!.getContext('2d');
        ctx?.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
        ctx?.drawImage(img, 0, 0);
      };
      setHistoryStep(step);
    }
  };

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h > 0 ? h + 'h ' : ''}${m}m ${sec}s`;
  };

  return (
    <div className="h-screen w-full bg-[#f8fafc] flex overflow-hidden font-sans select-none no-select">
      {/* Expandable Sidebar */}
      <div 
        onMouseEnter={() => setIsSidebarHovered(true)}
        onMouseLeave={() => setIsSidebarHovered(false)}
        className={cn(
          "h-full bg-white border-r border-slate-200 transition-all duration-500 ease-in-out z-[100] flex flex-col shadow-2xl shadow-slate-200/50",
          isSidebarHovered ? "w-80" : "w-16"
        )}
      >
        <div className="p-4 border-b border-slate-100 flex items-center justify-between overflow-hidden whitespace-nowrap">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white shrink-0">
              <Layout className="w-5 h-5" />
            </div>
            <span className={cn("font-black text-lg transition-opacity duration-300", isSidebarHovered ? "opacity-100" : "opacity-0")}>CLINOMA</span>
          </div>
          <button onClick={() => navigate('/flashcards')} className={cn("p-2 hover:bg-slate-100 rounded-lg transition-all", isSidebarHovered ? "opacity-100" : "opacity-0")}>
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-6">
          {/* Modules Hierarchy */}
          <div className="space-y-1">
            <div className="px-2 mb-2">
              {isSidebarHovered && <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hierarchy</span>}
            </div>
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
                  <span className={cn("font-bold text-sm overflow-hidden whitespace-nowrap transition-opacity", isSidebarHovered ? "opacity-100" : "opacity-0")}>{mod}</span>
                </button>
                
                {selectedModule === mod && isSidebarHovered && systems[mod]?.map(sys => (
                  <div key={sys} className="ml-6 space-y-1 animate-in slide-in-from-top-2">
                    <button
                      onClick={() => setSelectedSystem(selectedSystem === sys ? null : sys)}
                      className={cn(
                        "w-full flex items-center gap-3 p-2 rounded-lg transition-all",
                        selectedSystem === sys ? "text-primary font-black" : "text-slate-500 hover:text-slate-800"
                      )}
                    >
                      <div className="w-1 h-1 bg-slate-300 rounded-full" />
                      <span className="text-xs">{sys}</span>
                    </button>
                    
                    {selectedSystem === sys && (
                      <div className="ml-4 space-y-1">
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
      </div>

      {/* Main Study Workspace */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Top Navigation & Tools Bar */}
        <div className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between z-50 shadow-sm">
          <div className="flex items-center gap-6">
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Topic</span>
              <span className="text-sm font-black text-slate-800 leading-none">{selectedBoard?.disease || 'Ready to Start'}</span>
            </div>
            <div className="h-8 w-px bg-slate-200 mx-2" />
            <div className="flex items-center gap-3 px-4 py-2 bg-emerald-50 rounded-2xl border border-emerald-100">
              <Clock className="w-4 h-4 text-emerald-600" />
              <div className="flex flex-col leading-none">
                <span className="text-[8px] font-black text-emerald-600/60 uppercase tracking-widest">Study Time</span>
                <span className="text-xs font-black text-emerald-700">{formatTime(totalTimeToday)}</span>
              </div>
            </div>
          </div>

          {/* Tools Palette */}
          <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-2xl border border-slate-200">
            {[
              { id: 'pen', icon: Pencil, label: 'Pen' },
              { id: 'highlighter', icon: Highlighter, label: 'Highlighter' },
              { id: 'eraser', icon: Eraser, label: 'Eraser' },
              { id: 'laser', icon: Zap, label: 'Laser' },
              { id: 'text', icon: Type, label: 'Text' }
            ].map(tool => (
              <div key={tool.id} className="relative">
                <button
                  onClick={() => {
                    setActiveTool(tool.id as Tool);
                    setShowSettingsFor(showSettingsFor === tool.id ? null : tool.id as Tool);
                  }}
                  className={cn(
                    "p-2.5 rounded-xl transition-all relative group",
                    activeTool === tool.id ? "bg-white text-primary shadow-md scale-110" : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  <tool.icon className="w-5 h-5" />
                  {activeTool === tool.id && <Settings2 className="absolute -top-1 -right-1 w-3 h-3 text-primary animate-pulse" />}
                </button>

                {showSettingsFor === tool.id && (
                  <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2 bg-white border-2 border-slate-200 rounded-[2rem] shadow-2xl p-6 w-64 z-[200] animate-in slide-in-from-top-4">
                    <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{tool.label} Config</span>
                        <button onClick={() => setShowSettingsFor(null)} className="p-1 hover:bg-slate-100 rounded-full"><X className="w-4 h-4 text-slate-300" /></button>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest">
                          <span>Size</span>
                          <span>{toolSettings[tool.id as Tool].size}px</span>
                        </div>
                        <input 
                          type="range" min="1" max="100" 
                          value={toolSettings[tool.id as Tool].size}
                          onChange={(e) => setToolSettings({
                            ...toolSettings, 
                            [tool.id]: { ...toolSettings[tool.id as Tool], size: parseInt(e.target.value) }
                          })}
                          className="w-full accent-primary h-1 bg-slate-100 rounded-lg appearance-none"
                        />
                      </div>
                      {tool.id !== 'eraser' && (
                        <div className="grid grid-cols-5 gap-2">
                          {['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#1e293b'].map(c => (
                            <button 
                              key={c}
                              onClick={() => setToolSettings({
                                ...toolSettings, 
                                [tool.id]: { ...toolSettings[tool.id as Tool], color: c }
                              })}
                              className={cn(
                                "w-8 h-8 rounded-full border-2 transition-transform hover:scale-110",
                                toolSettings[tool.id as Tool].color === c ? "border-slate-800" : "border-transparent"
                              )}
                              style={{ backgroundColor: c }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button onClick={undo} className="p-2 text-slate-400 hover:text-primary transition-colors"><Undo2 className="w-5 h-5" /></button>
              <button className="p-2 text-slate-400 hover:text-primary transition-colors"><Redo2 className="w-5 h-5" /></button>
            </div>
            <button 
              onClick={() => setIsFocusMode(!isFocusMode)}
              className={cn(
                "p-3 rounded-xl transition-all",
                isFocusMode ? "bg-slate-800 text-white" : "bg-white border border-slate-200 text-slate-400 hover:text-slate-800"
              )}
            >
              {isFocusMode ? <Maximize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Content Body - 95% Width */}
        <div className="flex-1 relative flex items-center justify-center p-4 bg-slate-50/50">
          {selectedBoard ? (
            <div className="relative group bg-white rounded-[4rem] shadow-2xl border border-slate-200 overflow-hidden w-full h-full max-w-[98%] max-h-[98%] flex items-center justify-center">
              <div 
                className="relative cursor-crosshair"
                style={{ transform: `scale(${zoom})` }}
              >
                <img 
                  src={selectedBoard.medicalImage} 
                  alt="Medical Content" 
                  className="max-w-full max-h-[90vh] object-contain rounded-3xl"
                  draggable={false}
                />
                <canvas
                  ref={canvasRef}
                  width={1920} // High Res Base
                  height={1080}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={endDrawing}
                  onMouseLeave={endDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={endDrawing}
                  className="absolute inset-0 z-10 w-full h-full touch-none"
                />
              </div>

              {/* Bottom Floating Controls */}
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-4 z-50">
                <button 
                  onClick={() => setShowExplanation(!showExplanation)}
                  className="px-10 py-5 bg-white/90 backdrop-blur-2xl border border-slate-200 rounded-[2.5rem] font-black text-sm shadow-2xl hover:bg-primary hover:text-white transition-all flex items-center gap-4 group"
                >
                  <FileText className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  {showExplanation ? 'Hide Notes' : 'Show Explanation'}
                </button>
                <div className="px-8 py-5 bg-white/90 backdrop-blur-2xl border border-slate-200 rounded-[2.5rem] flex items-center gap-6 shadow-2xl">
                  <button onClick={() => setZoom(z => Math.max(0.5, z - 0.2))} className="text-slate-400 hover:text-primary"><Minus className="w-5 h-5" /></button>
                  <span className="text-xs font-black text-slate-800 w-12 text-center">{Math.round(zoom * 100)}%</span>
                  <button onClick={() => setZoom(z => Math.min(3, z + 0.2))} className="text-slate-400 hover:text-primary"><Plus className="w-5 h-5" /></button>
                </div>
              </div>

              {/* Slide-up Notes */}
              {showExplanation && (
                <div className="absolute inset-x-0 bottom-0 bg-white/95 backdrop-blur-3xl border-t-2 border-slate-100 p-16 z-[100] animate-in slide-in-from-bottom-full duration-700 shadow-[0_-40px_80px_rgba(0,0,0,0.1)]">
                  <div className="max-w-5xl mx-auto space-y-8">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-primary/10 rounded-[2rem] flex items-center justify-center text-primary">
                          <Brain className="w-8 h-8" />
                        </div>
                        <div>
                          <h4 className="text-4xl font-black tracking-tight text-slate-800">{selectedBoard.disease}</h4>
                          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">{selectedModule} • {selectedSystem}</p>
                        </div>
                      </div>
                      <button onClick={() => setShowExplanation(false)} className="p-4 bg-slate-50 hover:bg-rose-50 hover:text-rose-500 rounded-[1.5rem] transition-all"><X className="w-8 h-8" /></button>
                    </div>
                    <div className="h-px bg-slate-100" />
                    <p className="text-2xl text-slate-600 leading-relaxed font-medium">{selectedBoard.explanation}</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-8 opacity-20 animate-pulse">
              <div className="w-32 h-32 bg-slate-200 rounded-[3rem] flex items-center justify-center">
                <Layout className="w-16 h-16 text-slate-400" />
              </div>
              <p className="text-3xl font-black text-slate-400">Please select a board from the sidebar</p>
            </div>
          )}
        </div>
      </div>

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
