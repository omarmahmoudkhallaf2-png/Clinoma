import React from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  AlignCenter,
  AlignLeft,
  AlignRight
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface RichTextToolbarProps {
  onCommand: (command: string, value?: string) => void;
  className?: string;
}

const RichTextToolbar: React.FC<RichTextToolbarProps> = ({ onCommand, className }) => {
  const fonts = [
    { name: 'Inter', family: 'Inter, sans-serif' },
    { name: 'Cairo (Arabic)', family: 'Cairo, sans-serif' },
    { name: 'Tajawal (Arabic)', family: 'Tajawal, sans-serif' },
    { name: 'Outfit', family: 'Outfit, sans-serif' },
  ];

  return (
    <div className={cn("flex flex-wrap items-center gap-1 p-2 border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-20", className)}>
      <button
        onMouseDown={(e) => { e.preventDefault(); onCommand('bold'); }}
        className="p-2 hover:bg-muted rounded-xl transition-all"
        title="Bold"
      >
        <Bold size={18} />
      </button>
      <button
        onMouseDown={(e) => { e.preventDefault(); onCommand('italic'); }}
        className="p-2 hover:bg-muted rounded-xl transition-all"
        title="Italic"
      >
        <Italic size={18} />
      </button>
      <button
        onMouseDown={(e) => { e.preventDefault(); onCommand('underline'); }}
        className="p-2 hover:bg-muted rounded-xl transition-all"
        title="Underline"
      >
        <Underline size={18} />
      </button>

      <div className="w-px h-6 bg-border mx-2" />

      <select
        onChange={(e) => onCommand('fontName', e.target.value)}
        className="bg-muted text-sm font-bold border-none rounded-lg focus:ring-0 cursor-pointer px-3 py-1.5"
      >
        {fonts.map(font => (
          <option key={font.name} value={font.family} className="bg-card text-foreground">{font.name}</option>
        ))}
      </select>

      <select
        onChange={(e) => onCommand('fontSize', e.target.value)}
        className="bg-muted text-sm font-bold border-none rounded-lg focus:ring-0 cursor-pointer px-3 py-1.5 w-24"
      >
        <option value="3" className="bg-card text-foreground">Size 16</option>
        <option value="1" className="bg-card text-foreground">Size 12</option>
        <option value="2" className="bg-card text-foreground">Size 14</option>
        <option value="4" className="bg-card text-foreground">Size 18</option>
        <option value="5" className="bg-card text-foreground">Size 24</option>
        <option value="6" className="bg-card text-foreground">Size 32</option>
        <option value="7" className="bg-card text-foreground">Size 48</option>
      </select>

      <div className="w-px h-6 bg-border mx-2" />

      <div className="flex items-center gap-2 px-2 py-1 bg-muted rounded-lg border border-border">
        <input
          type="color"
          onChange={(e) => onCommand('foreColor', e.target.value)}
          className="w-6 h-6 p-0 border-none bg-transparent cursor-pointer"
          title="Text Color"
        />
        <span className="text-[10px] font-black uppercase tracking-tighter opacity-50">Color</span>
      </div>

      <div className="w-px h-6 bg-border mx-2" />

      <button
        onMouseDown={(e) => { e.preventDefault(); onCommand('justifyLeft'); }}
        className="p-2 hover:bg-muted rounded-xl transition-all"
      >
        <AlignLeft size={18} />
      </button>
      <button
        onMouseDown={(e) => { e.preventDefault(); onCommand('justifyCenter'); }}
        className="p-2 hover:bg-muted rounded-xl transition-all"
      >
        <AlignCenter size={18} />
      </button>
      <button
        onMouseDown={(e) => { e.preventDefault(); onCommand('justifyRight'); }}
        className="p-2 hover:bg-muted rounded-xl transition-all"
      >
        <AlignRight size={18} />
      </button>
    </div>
  );
};

export default RichTextToolbar;
