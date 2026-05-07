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
  const [states, setStates] = React.useState({
    bold: false,
    italic: false,
    underline: false,
    justifyLeft: false,
    justifyCenter: false,
    justifyRight: false,
  });

  React.useEffect(() => {
    const updateStates = () => {
      try {
        setStates({
          bold: document.queryCommandState('bold'),
          italic: document.queryCommandState('italic'),
          underline: document.queryCommandState('underline'),
          justifyLeft: document.queryCommandState('justifyLeft'),
          justifyCenter: document.queryCommandState('justifyCenter'),
          justifyRight: document.queryCommandState('justifyRight'),
        });
      } catch (e) {
        // Ignore errors if selection is not in an editable area
      }
    };

    document.addEventListener('selectionchange', updateStates);
    // Also update on click to catch focus changes
    document.addEventListener('click', updateStates);
    return () => {
      document.removeEventListener('selectionchange', updateStates);
      document.removeEventListener('click', updateStates);
    };
  }, []);

  const fonts = [
    { name: 'Inter', family: 'Inter, sans-serif' },
    { name: 'Cairo (Arabic)', family: 'Cairo, sans-serif' },
    { name: 'Tajawal (Arabic)', family: 'Tajawal, sans-serif' },
    { name: 'Outfit', family: 'Outfit, sans-serif' },
  ];

  const handleCommand = (cmd: string, val?: string) => {
    onCommand(cmd, val);
    // Force immediate update of states
    setTimeout(() => {
      setStates(prev => ({
        ...prev,
        bold: document.queryCommandState('bold'),
        italic: document.queryCommandState('italic'),
        underline: document.queryCommandState('underline'),
        justifyLeft: document.queryCommandState('justifyLeft'),
        justifyCenter: document.queryCommandState('justifyCenter'),
        justifyRight: document.queryCommandState('justifyRight'),
      }));
    }, 10);
  };

  return (
    <div className={cn("flex flex-wrap items-center gap-0.5 p-1.5 border border-border bg-card/80 backdrop-blur-md rounded-2xl", className)}>
      <button
        onMouseDown={(e) => { e.preventDefault(); handleCommand('bold'); }}
        className={cn(
          "p-2 rounded-xl transition-all",
          states.bold ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "hover:bg-muted"
        )}
        title="Bold"
      >
        <Bold size={16} />
      </button>
      <button
        onMouseDown={(e) => { e.preventDefault(); handleCommand('italic'); }}
        className={cn(
          "p-2 rounded-xl transition-all",
          states.italic ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "hover:bg-muted"
        )}
        title="Italic"
      >
        <Italic size={16} />
      </button>
      <button
        onMouseDown={(e) => { e.preventDefault(); handleCommand('underline'); }}
        className={cn(
          "p-2 rounded-xl transition-all",
          states.underline ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "hover:bg-muted"
        )}
        title="Underline"
      >
        <Underline size={16} />
      </button>

      <div className="w-px h-4 bg-border mx-1.5" />

      <select
        onChange={(e) => handleCommand('fontName', e.target.value)}
        className="bg-muted text-[10px] font-black border-none rounded-lg focus:ring-0 cursor-pointer px-2 py-1 h-8"
      >
        {fonts.map(font => (
          <option key={font.name} value={font.family} className="bg-card text-foreground">{font.name}</option>
        ))}
      </select>

      <select
        onChange={(e) => handleCommand('fontSize', e.target.value)}
        className="bg-muted text-[10px] font-black border-none rounded-lg focus:ring-0 cursor-pointer px-2 py-1 h-8 w-20"
      >
        <option value="3" className="bg-card text-foreground">Size 16</option>
        <option value="1" className="bg-card text-foreground">Size 12</option>
        <option value="2" className="bg-card text-foreground">Size 14</option>
        <option value="4" className="bg-card text-foreground">Size 18</option>
        <option value="5" className="bg-card text-foreground">Size 24</option>
        <option value="6" className="bg-card text-foreground">Size 32</option>
        <option value="7" className="bg-card text-foreground">Size 48</option>
      </select>

      <div className="w-px h-4 bg-border mx-1.5" />

      <div className="flex items-center gap-1.5 px-2 h-8 bg-muted rounded-lg border border-border">
        <input
          type="color"
          onChange={(e) => handleCommand('foreColor', e.target.value)}
          className="w-4 h-4 p-0 border-none bg-transparent cursor-pointer"
          title="Text Color"
        />
        <span className="text-[8px] font-black uppercase tracking-tighter opacity-50">Color</span>
      </div>

      <div className="w-px h-4 bg-border mx-1.5" />

      <button
        onMouseDown={(e) => { e.preventDefault(); handleCommand('justifyLeft'); }}
        className={cn(
          "p-2 rounded-xl transition-all",
          states.justifyLeft ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "hover:bg-muted"
        )}
      >
        <AlignLeft size={16} />
      </button>
      <button
        onMouseDown={(e) => { e.preventDefault(); handleCommand('justifyCenter'); }}
        className={cn(
          "p-2 rounded-xl transition-all",
          states.justifyCenter ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "hover:bg-muted"
        )}
      >
        <AlignCenter size={16} />
      </button>
      <button
        onMouseDown={(e) => { e.preventDefault(); handleCommand('justifyRight'); }}
        className={cn(
          "p-2 rounded-xl transition-all",
          states.justifyRight ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "hover:bg-muted"
        )}
      >
        <AlignRight size={16} />
      </button>
    </div>
  );
};

export default RichTextToolbar;
