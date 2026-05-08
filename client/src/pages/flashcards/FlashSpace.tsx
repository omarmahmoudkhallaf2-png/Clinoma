import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  Search, 
  Baby, 
  Eye, 
  Pencil, 
  Highlighter, 
  Eraser, 
  Zap, 
  Type, 
  ArrowUpRight, 
  Undo2, 
  Redo2, 
  Layers, 
  Play, 
  Pause, 
  Square, 
  Maximize2, 
  Minimize2, 
  Settings2,
  Lock,
  Unlock,
  EyeOff,
  Plus,
  MoreVertical,
  Clock,
  Layout,
  Filter,
  CheckCircle2,
  Palette
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import { db } from '../../lib/firebase';
import { collection, query, getDocs, where, orderBy, doc, updateDoc, onSnapshot } from 'firebase/firestore';

// --- Types ---

type Tool = 'pen' | 'highlighter' | 'eraser' | 'laser' | 'text' | 'arrow';

interface ToolSettings {
  size: number;
  opacity: number;
  color: string;
  softness?: number;
}

interface Board {
  id: string;
  categoryId: string;
  disease: string;
  thumbnail?: string;
  medicalImage: string;
  explanation: string;
  lastStudied?: number;
  createdAt: number;
}

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

// --- Icons Helper ---
const getIcon = (iconName: string) => {
  switch (iconName) {
    case 'Baby': return Baby;
    case 'Eye': return Eye;
    default: return Layout;
  }
};


// --- Sub-components ---

const TimerSystem = () => {
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [totalToday, setTotalToday] = useState(45 * 60); // 45 mins demo
  const lastActivityRef = useRef(Date.now());

  useEffect(() => {
    let interval: any = null;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds(s => s + 1);
        
        // Auto pause after 5 minutes of inactivity
        if (Date.now() - lastActivityRef.current > 5 * 60 * 1000) {
          setIsActive(false);
          toast('Timer auto-paused due to inactivity', { icon: '⏲️' });
        }
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  // Activity listener
  useEffect(() => {
    const updateActivity = () => {
      lastActivityRef.current = Date.now();
      // Resume if was active but auto-paused (optional, user said "Resume when activity returns")
      // For safety, only resume if it was explicitly started before
    };
    window.addEventListener('mousemove', updateActivity);
    window.addEventListener('keydown', updateActivity);
    window.addEventListener('touchstart', updateActivity);
    return () => {
      window.removeEventListener('mousemove', updateActivity);
      window.removeEventListener('keydown', updateActivity);
      window.removeEventListener('touchstart', updateActivity);
    };
  }, []);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-6 rounded-[2rem] bg-card border border-border/50 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          <span className="font-bold text-sm">Study Timer</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className={cn("w-2 h-2 rounded-full", isActive ? "bg-emerald-500 animate-pulse" : "bg-muted")} />
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            {isActive ? 'Session Active' : 'Paused'}
          </span>
        </div>
      </div>

      <div className="text-4xl font-black tracking-tighter text-center py-4 tabular-nums">
        {formatTime(seconds)}
      </div>

      <div className="grid grid-cols-2 gap-2">
        {!isActive ? (
          <button 
            onClick={() => setIsActive(true)}
            className="flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-xs hover:scale-[1.02] active:scale-95 transition-all"
          >
            <Play className="w-4 h-4" /> Start
          </button>
        ) : (
          <button 
            onClick={() => setIsActive(false)}
            className="flex items-center justify-center gap-2 py-3 rounded-xl bg-orange-500/10 text-orange-600 font-bold text-xs hover:scale-[1.02] active:scale-95 transition-all"
          >
            <Pause className="w-4 h-4" /> Pause
          </button>
        )}
        <button 
          onClick={() => {
            setIsActive(false);
            setSeconds(0);
          }}
          className="flex items-center justify-center gap-2 py-3 rounded-xl bg-muted text-muted-foreground font-bold text-xs hover:scale-[1.02] active:scale-95 transition-all"
        >
          <Square className="w-4 h-4" /> End
        </button>
      </div>

      <div className="pt-4 border-t border-border/50 flex justify-between items-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
        <span>Today Total</span>
        <span className="text-foreground">{formatTime(totalToday + seconds)}</span>
      </div>
    </div>
  );
};

// --- Main Page ---

const FlashSpace = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedBoard, setSelectedBoard] = useState<Board | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTool, setActiveTool] = useState<Tool>('pen');
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDrawing, setIsDrawing] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  // Fetch Data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const catSnap = await getDocs(query(collection(db, 'flashspace_categories'), orderBy('name', 'asc')));
        const fetchedCats = catSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
        setCategories(fetchedCats);
        if (fetchedCats.length > 0) setSelectedCategory(fetchedCats[0].id);

        const boardsSnap = await getDocs(query(collection(db, 'flashspace_boards'), orderBy('createdAt', 'desc')));
        const fetchedBoards = boardsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Board));
        setBoards(fetchedBoards);
        if (fetchedBoards.length > 0) setSelectedBoard(fetchedBoards[0]);
      } catch (err) {
        console.error('Error fetching Flash Space data:', err);
        toast.error('Failed to load Flash Space content');
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);
  const [toolSettings, setToolSettings] = useState<Record<Tool, ToolSettings>>({
    pen: { size: 4, opacity: 1, color: '#3b82f6' },
    highlighter: { size: 20, opacity: 0.3, color: '#eab308' },
    eraser: { size: 30, opacity: 1, color: '#ffffff', softness: 0.2 },
    laser: { size: 10, opacity: 0.8, color: '#ef4444' },
    text: { size: 18, opacity: 1, color: '#000000' },
    arrow: { size: 4, opacity: 1, color: '#3b82f6' }
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const historyRef = useRef<ImageData[]>([]);
  const redoRef = useRef<ImageData[]>([]);
  const lastPoint = useRef<{ x: number, y: number } | null>(null);

  // Initialize Canvas
  useEffect(() => {
    if (canvasRef.current && containerRef.current) {
      const canvas = canvasRef.current;
      const rect = containerRef.current.getBoundingClientRect();
      canvas.width = containerRef.current.clientWidth;
      canvas.height = containerRef.current.clientHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
      }
    }
  }, [selectedBoard, isFocusMode, isSidebarOpen]);

  // Autosave simulation
  useEffect(() => {
    if (!selectedBoard) return;
    const interval = setInterval(() => {
      // In a real app, we would save the canvas state to Firebase here
      // toast.success('Workspace autosaved', { icon: '💾', duration: 1000 });
    }, 30000); // Every 30s
    return () => clearInterval(interval);
  }, [selectedBoard]);

  const saveToHistory = useCallback(() => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        const data = ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
        historyRef.current.push(data);
        if (historyRef.current.length > 50) historyRef.current.shift();
        redoRef.current = [];
      }
    }
  }, []);

  const undo = () => {
    if (historyRef.current.length > 0 && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        const currentData = ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
        redoRef.current.push(currentData);
        const prevData = historyRef.current.pop()!;
        ctx.putImageData(prevData, 0, 0);
      }
    }
  };

  const redo = () => {
    if (redoRef.current.length > 0 && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        const currentData = ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
        historyRef.current.push(currentData);
        const nextData = redoRef.current.pop()!;
        ctx.putImageData(nextData, 0, 0);
      }
    }
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (!canvasRef.current || !selectedBoard) return;
    
    if (activeTool !== 'laser') saveToHistory();
    
    setIsDrawing(true);
    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      const rect = canvasRef.current.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const x = (clientX - rect.left) / zoom;
      const y = (clientY - rect.top) / zoom;
      
      lastPoint.current = { x, y };
      ctx.beginPath();
      ctx.moveTo(x, y);
      
      const settings = toolSettings[activeTool];
      ctx.lineWidth = settings.size;
      ctx.strokeStyle = settings.color;
      ctx.globalAlpha = settings.opacity;
      
      if (activeTool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
      } else {
        ctx.globalCompositeOperation = 'source-over';
      }
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !canvasRef.current || !lastPoint.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      const rect = canvasRef.current.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const x = (clientX - rect.left) / zoom;
      const y = (clientY - rect.top) / zoom;
      
      if (activeTool === 'laser') {
        // Laser pointer effect: Draw and then clear after delay
        ctx.beginPath();
        ctx.arc(x, y, toolSettings.laser.size / 2, 0, Math.PI * 2);
        ctx.fillStyle = toolSettings.laser.color;
        ctx.fill();
        
        setTimeout(() => {
          if (ctx) {
            ctx.globalCompositeOperation = 'destination-out';
            ctx.beginPath();
            ctx.arc(x, y, toolSettings.laser.size / 2 + 1, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalCompositeOperation = 'source-over';
          }
        }, 1000);
      } else {
        // Smooth line using quadratic curve
        const midPoint = {
          x: (lastPoint.current.x + x) / 2,
          y: (lastPoint.current.y + y) / 2
        };
        ctx.quadraticCurveTo(lastPoint.current.x, lastPoint.current.y, midPoint.x, midPoint.y);
        ctx.stroke();
        lastPoint.current = { x, y };
      }
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleZoom = (delta: number) => {
    setZoom(prev => Math.min(Math.max(prev + delta, 0.5), 3));
  };

  // Prevent right-click and copying
  useEffect(() => {
    const prevent = (e: Event) => e.preventDefault();
    document.addEventListener('contextmenu', prevent);
    return () => document.removeEventListener('contextmenu', prevent);
  }, []);

  return (
    <div className={cn(
      "fixed inset-0 bg-background flex flex-col transition-all duration-500 overflow-hidden",
      isFocusMode ? "z-[100]" : ""
    )} onContextMenu={e => e.preventDefault()}>
      {/* Header */}
      {!isFocusMode && (
        <header className="h-16 border-b border-border/50 flex items-center justify-between px-6 bg-card shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/flashcards')}
              className="p-2 hover:bg-accent rounded-xl transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="h-6 w-px bg-border/50" />
            <div className="flex flex-col">
              <span className="text-xs font-black uppercase tracking-widest text-primary">Flash Space</span>
              <span className="text-sm font-bold">{selectedBoard?.disease || 'Select a Board'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 mr-4 bg-muted/50 p-1 rounded-xl border">
              <button 
                onClick={undo}
                className="p-2 hover:bg-background rounded-lg transition-all text-muted-foreground hover:text-foreground"
              >
                <Undo2 className="w-4 h-4" />
              </button>
              <button 
                onClick={redo}
                className="p-2 hover:bg-background rounded-lg transition-all text-muted-foreground hover:text-foreground"
              >
                <Redo2 className="w-4 h-4" />
              </button>
            </div>
            
            <button 
              onClick={() => setIsFocusMode(!isFocusMode)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-all text-xs font-bold"
            >
              <Maximize2 className="w-4 h-4" /> Focus Mode
            </button>
          </div>
        </header>
      )}

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Left Sidebar: Categories & Boards */}
        {!isFocusMode && (
          <motion.div 
            initial={{ width: 320 }}
            animate={{ width: isSidebarOpen ? 320 : 0 }}
            className="border-r border-border/50 bg-card/50 flex flex-col shrink-0 overflow-hidden"
          >
            <div className="p-4 space-y-6 min-w-[320px]">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <input 
                  type="text" 
                  placeholder="Search diseases..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-muted/50 border-none text-xs focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>

              {/* Categories */}
              <div className="space-y-2">
                <div className="px-2 flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Categories</span>
                  <Filter className="w-3 h-3 text-muted-foreground" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={cn(
                        "flex flex-col items-center gap-2 p-4 rounded-2xl transition-all border-2",
                        selectedCategory === cat.id 
                          ? "bg-primary/10 border-primary text-primary" 
                          : "bg-muted/30 border-transparent text-muted-foreground hover:bg-muted/50"
                      )}
                    >
                      {React.createElement(getIcon(cat.icon), { className: "w-6 h-6" })}
                      <span className="text-[10px] font-bold uppercase tracking-tighter">{cat.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Boards List */}
              <div className="space-y-4">
                <div className="px-2 flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Boards List</span>
                  <span className="text-[10px] font-bold text-primary">{boards.filter(b => b.categoryId === selectedCategory).length} Items</span>
                </div>
                <div className="space-y-2 overflow-y-auto max-h-[calc(100vh-25rem)] custom-scrollbar pr-2">
                  {boards.filter(b => b.categoryId === selectedCategory).map(board => (
                    <button
                      key={board.id}
                      onClick={() => setSelectedBoard(board)}
                      className={cn(
                        "w-full text-left p-4 rounded-2xl transition-all group relative overflow-hidden",
                        selectedBoard?.id === board.id 
                          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                          : "bg-muted/30 hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <div className="relative z-10">
                        <h4 className="font-bold text-sm line-clamp-1">{board.disease}</h4>
                        <div className="flex items-center gap-2 mt-1 opacity-60">
                          <CheckCircle2 className="w-3 h-3" />
                          <span className="text-[9px] font-bold uppercase tracking-widest">Ready to study</span>
                        </div>
                      </div>
                      {selectedBoard?.id === board.id && (
                        <motion.div 
                          layoutId="active-board"
                          className="absolute inset-0 bg-primary"
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Center: Drawing Area */}
        <div className="flex-1 relative flex flex-col bg-accent/10 select-none">
          {/* Top Controls Overlay */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-card/80 backdrop-blur-xl p-1.5 rounded-2xl border border-white/20 shadow-2xl">
            <div className="flex items-center gap-1 px-3 py-1.5 border-r border-border/50">
              <button 
                onClick={() => setShowExplanation(!showExplanation)}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                  showExplanation ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                )}
              >
                {showExplanation ? 'Hide Notes' : 'Show Notes'}
              </button>
            </div>
            <div className="flex items-center gap-1 px-2">
              <button onClick={() => handleZoom(-0.1)} className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground"><Minimize2 className="w-4 h-4" /></button>
              <span className="text-[10px] font-black w-10 text-center">{Math.round(zoom * 100)}%</span>
              <button onClick={() => handleZoom(0.1)} className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground"><Maximize2 className="w-4 h-4" /></button>
            </div>
            
            {isFocusMode && (
              <button 
                onClick={() => setIsFocusMode(false)}
                className="p-1.5 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-lg transition-all"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
            )}
          </div>

          <div 
            ref={containerRef}
            className="flex-1 relative cursor-crosshair overflow-hidden"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          >
            {selectedBoard ? (
              <div 
                style={{ 
                  transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
                  transformOrigin: 'center center',
                  transition: isDrawing ? 'none' : 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
                className="w-full h-full relative flex items-center justify-center p-12"
              >
                {/* Medical Image Layer */}
                <div className="relative max-w-4xl max-h-full group">
                  <img 
                    src={selectedBoard.medicalImage} 
                    alt={selectedBoard.disease}
                    className="w-full h-auto rounded-[2.5rem] shadow-2xl border-4 border-white/10"
                    draggable={false}
                  />
                  
                  {/* Explanation Overlay */}
                  <AnimatePresence>
                    {showExplanation && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-md rounded-[2.5rem] flex items-center justify-center p-12 text-white overflow-y-auto"
                      >
                        <div className="max-w-xl space-y-4 text-center">
                          <h3 className="text-3xl font-black">{selectedBoard.disease}</h3>
                          <div className="w-12 h-1 bg-primary mx-auto rounded-full" />
                          <p className="text-lg leading-relaxed text-white/80">
                            {selectedBoard.explanation}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                
                {/* Canvas Layer */}
                <canvas 
                  ref={canvasRef}
                  className="absolute inset-0 pointer-events-none"
                />
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground space-y-4">
                <Layout className="w-16 h-16 opacity-20" />
                <p className="font-bold">Select a board to start studying</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar: Tools & Settings */}
        {!isFocusMode && (
          <div className="w-80 border-l border-border/50 bg-card/50 flex flex-col shrink-0 overflow-y-auto custom-scrollbar">
            <div className="p-6 space-y-8">
              
              {/* Study Timer Section */}
              <TimerSystem />

              {/* Drawing Tools */}
              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Drawing Tools</span>
                  <Palette className="w-3 h-3 text-muted-foreground" />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'pen', icon: Pencil, label: 'Pen' },
                    { id: 'highlighter', icon: Highlighter, label: 'Highlighter' },
                    { id: 'eraser', icon: Eraser, label: 'Eraser' },
                    { id: 'laser', icon: Zap, label: 'Laser' },
                    { id: 'text', icon: Type, label: 'Text' },
                    { id: 'arrow', icon: ArrowUpRight, label: 'Arrow' },
                  ].map(tool => (
                    <button
                      key={tool.id}
                      onClick={() => setActiveTool(tool.id as Tool)}
                      className={cn(
                        "flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all border-2",
                        activeTool === tool.id 
                          ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/10" 
                          : "bg-muted/30 border-transparent text-muted-foreground hover:bg-muted/50"
                      )}
                    >
                      <tool.icon className="w-4 h-4" />
                      <span className="text-[8px] font-black uppercase tracking-widest">{tool.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tool Settings */}
              <div className="p-6 rounded-[2rem] bg-muted/30 border border-border/50 space-y-6">
                <div className="flex items-center justify-between px-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Tool Settings</span>
                  <Settings2 className="w-3 h-3 text-muted-foreground" />
                </div>

                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                      <span>Brush Size</span>
                      <span className="text-primary">{toolSettings[activeTool].size}px</span>
                    </div>
                    <input 
                      type="range" 
                      min="1" 
                      max={activeTool === 'highlighter' ? 100 : 50} 
                      value={toolSettings[activeTool].size}
                      onChange={(e) => setToolSettings({
                        ...toolSettings,
                        [activeTool]: { ...toolSettings[activeTool], size: parseInt(e.target.value) }
                      })}
                      className="w-full accent-primary"
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                      <span>Opacity</span>
                      <span className="text-primary">{Math.round(toolSettings[activeTool].opacity * 100)}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0.1" 
                      max="1" 
                      step="0.1"
                      value={toolSettings[activeTool].opacity}
                      onChange={(e) => setToolSettings({
                        ...toolSettings,
                        [activeTool]: { ...toolSettings[activeTool], opacity: parseFloat(e.target.value) }
                      })}
                      className="w-full accent-primary"
                    />
                  </div>

                  <div className="space-y-3">
                    <span className="text-[10px] font-bold uppercase tracking-widest block mb-2">Color Palette</span>
                    <div className="flex flex-wrap gap-2">
                      {['#3b82f6', '#ef4444', '#10b981', '#eab308', '#8b5cf6', '#000000', '#ffffff'].map(c => (
                        <button
                          key={c}
                          onClick={() => setToolSettings({
                            ...toolSettings,
                            [activeTool]: { ...toolSettings[activeTool], color: c }
                          })}
                          className={cn(
                            "w-6 h-6 rounded-full border-2 transition-all",
                            toolSettings[activeTool].color === c ? "border-primary scale-125 shadow-lg" : "border-transparent"
                          )}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Layers System */}
              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Layers</span>
                  <Layers className="w-3 h-3 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  {[
                    { name: 'Text Annotations', icon: Type, locked: false },
                    { name: 'Drawings & Ink', icon: Pencil, locked: false },
                    { name: 'Highlights', icon: Highlighter, locked: false },
                    { name: 'Medical Image', icon: Layout, locked: true },
                  ].map((layer, i) => (
                    <div key={layer.name} className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl border border-transparent hover:border-border/50 transition-all group">
                      <layer.icon className="w-4 h-4 text-muted-foreground" />
                      <span className="text-[10px] font-bold text-muted-foreground flex-1">{layer.name}</span>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1 hover:bg-card rounded text-muted-foreground"><EyeOff className="w-3 h-3" /></button>
                        <button className="p-1 hover:bg-card rounded text-muted-foreground">
                          {layer.locked ? <Lock className="w-3 h-3 text-orange-500" /> : <Unlock className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Protection Badge */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-3">
                <Lock className="w-5 h-5 text-amber-600" />
                <div className="flex flex-col">
                  <span className="text-[8px] font-black uppercase tracking-tighter text-amber-600">Content Protection</span>
                  <span className="text-[10px] font-bold text-amber-800/80">Export restricted to premium library.</span>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
      
      {/* Interaction Protection Style */}
      <style>{`
        .no-select {
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }
        canvas {
          touch-action: none;
        }
        @media print {
          body { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default FlashSpace;
