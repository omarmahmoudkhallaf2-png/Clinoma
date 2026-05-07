import React, { useState, useRef, useEffect } from 'react';
import { Square, Circle, Trash2, Move, Maximize2, X } from 'lucide-react';
import { Mask } from '../../types/flashcard';
import { cn } from '../../lib/utils';

interface ImageOcclusionEditorProps {
  imageUrl: string;
  masks: Mask[];
  onChange: (masks: Mask[]) => void;
  onClose: () => void;
}

const ImageOcclusionEditor: React.FC<ImageOcclusionEditorProps> = ({ imageUrl, masks, onChange, onClose }) => {
  const [selectedMaskId, setSelectedMaskId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const addMask = (type: 'rect' | 'circle') => {
    const newMask: Mask = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      x: 10,
      y: 10,
      width: 100,
      height: 100,
      color: '#000000'
    };
    onChange([...masks, newMask]);
    setSelectedMaskId(newMask.id);
  };

  const removeMask = (id: string) => {
    onChange(masks.filter(m => m.id !== id));
    if (selectedMaskId === id) setSelectedMaskId(null);
  };

  const handleMouseDown = (e: React.MouseEvent, maskId: string, action: 'move' | 'resize') => {
    e.stopPropagation();
    setSelectedMaskId(maskId);
    if (action === 'move') setIsDragging(true);
    else setIsResizing(true);
    
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging && !isResizing) return;
    if (!selectedMaskId || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const scaleX = 1000 / rect.width;
    const scaleY = 1000 / rect.height;

    const deltaX = (e.clientX - dragStart.x) * scaleX;
    const deltaY = (e.clientY - dragStart.y) * scaleY;

    const updatedMasks = masks.map(m => {
      if (m.id === selectedMaskId) {
        if (isDragging) {
          return { ...m, x: Math.min(Math.max(0, m.x + deltaX), 1000 - m.width), y: Math.min(Math.max(0, m.y + deltaY), 1000 - m.height) };
        } else if (isResizing) {
          return { ...m, width: Math.max(10, Math.min(m.width + deltaX, 1000 - m.x)), height: Math.max(10, Math.min(m.height + deltaY, 1000 - m.y)) };
        }
      }
      return m;
    });

    onChange(updatedMasks);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col p-4 md:p-8 animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <h2 className="text-white font-bold text-xl">Image Occlusion Editor</h2>
          <div className="flex items-center gap-2 bg-white/10 p-1 rounded-lg">
            <button
              onClick={() => addMask('rect')}
              className="p-2 hover:bg-white/20 rounded text-white flex items-center gap-2 transition-all"
            >
              <Square size={18} />
              <span className="text-sm">Rectangle</span>
            </button>
            <button
              onClick={() => addMask('circle')}
              className="p-2 hover:bg-white/20 rounded text-white flex items-center gap-2 transition-all"
            >
              <Circle size={18} />
              <span className="text-sm">Circle</span>
            </button>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-white">
          <X size={24} />
        </button>
      </div>

      <div 
        className="flex-1 relative overflow-hidden bg-white/5 rounded-3xl flex items-center justify-center cursor-crosshair"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div ref={containerRef} className="relative inline-block shadow-2xl">
          <img 
            src={imageUrl} 
            alt="Occlusion" 
            className="max-h-[70vh] max-w-full select-none rounded-lg"
            onDragStart={(e) => e.preventDefault()}
          />
          
          <svg viewBox="0 0 1000 1000" preserveAspectRatio="none" className="absolute inset-0 w-full h-full pointer-events-none">
            {masks.map(mask => (
              <g key={mask.id} className="pointer-events-auto group">
                {mask.type === 'rect' ? (
                  <rect
                    x={mask.x}
                    y={mask.y}
                    width={mask.width}
                    height={mask.height}
                    fill={mask.color}
                    className={cn(
                      "cursor-move transition-opacity",
                      selectedMaskId === mask.id ? "stroke-primary stroke-2" : "opacity-80"
                    )}
                    onMouseDown={(e) => handleMouseDown(e, mask.id, 'move')}
                  />
                ) : (
                  <ellipse
                    cx={mask.x + mask.width / 2}
                    cy={mask.y + mask.height / 2}
                    rx={mask.width / 2}
                    ry={mask.height / 2}
                    fill={mask.color}
                    className={cn(
                      "cursor-move transition-opacity",
                      selectedMaskId === mask.id ? "stroke-primary stroke-2" : "opacity-80"
                    )}
                    onMouseDown={(e) => handleMouseDown(e, mask.id, 'move')}
                  />
                )}
                
                {selectedMaskId === mask.id && (
                  <rect
                    x={mask.x + mask.width - 20}
                    y={mask.y + mask.height - 20}
                    width={40}
                    height={40}
                    fill="#3b82f6"
                    className="cursor-nwse-resize"
                    onMouseDown={(e) => handleMouseDown(e, mask.id, 'resize')}
                  />
                )}
              </g>
            ))}
          </svg>
        </div>

        {selectedMaskId && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20 flex items-center gap-4 animate-in slide-in-from-bottom-4">
            <div className="flex items-center gap-2 px-2 border-r border-white/10">
              <input 
                type="color" 
                value={masks.find(m => m.id === selectedMaskId)?.color || '#000000'}
                onChange={(e) => {
                  onChange(masks.map(m => m.id === selectedMaskId ? { ...m, color: e.target.value } : m));
                }}
                className="w-6 h-6 p-0 border-none bg-transparent cursor-pointer"
              />
              <span className="text-white text-xs font-bold uppercase tracking-widest">Color</span>
            </div>
            <button 
              onClick={() => removeMask(selectedMaskId)}
              className="flex items-center gap-2 px-4 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-500 rounded-xl transition-all font-bold"
            >
              <Trash2 size={16} />
              Delete Shape
            </button>
          </div>
        )}
      </div>

      <div className="mt-4 flex justify-center">
        <button
          onClick={onClose}
          className="px-10 py-4 bg-primary text-primary-foreground rounded-2xl font-black shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
        >
          Save & Exit Editor
        </button>
      </div>
    </div>
  );
};

export default ImageOcclusionEditor;
