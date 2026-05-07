import React, { useRef, useEffect } from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  Type, 
  Palette, 
  ChevronDown,
  AlignCenter,
  AlignLeft,
  AlignRight
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, placeholder, className }) => {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const fonts = [
    { name: 'Inter', family: 'Inter, sans-serif' },
    { name: 'Cairo (Arabic)', family: 'Cairo, sans-serif' },
    { name: 'Tajawal (Arabic)', family: 'Tajawal, sans-serif' },
    { name: 'Outfit', family: 'Outfit, sans-serif' },
  ];

  const fontSizes = ['12px', '14px', '16px', '18px', '20px', '24px', '32px'];

  return (
    <div className={cn("border border-border rounded-xl bg-muted/50 overflow-hidden", className)}>
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-border bg-card">
        <button
          onClick={() => execCommand('bold')}
          className="p-1.5 hover:bg-muted rounded transition-colors"
          title="Bold"
        >
          <Bold size={16} />
        </button>
        <button
          onClick={() => execCommand('italic')}
          className="p-1.5 hover:bg-muted rounded transition-colors"
          title="Italic"
        >
          <Italic size={16} />
        </button>
        <button
          onClick={() => execCommand('underline')}
          className="p-1.5 hover:bg-muted rounded transition-colors"
          title="Underline"
        >
          <Underline size={16} />
        </button>

        <div className="w-px h-4 bg-border mx-1" />

        <select
          onChange={(e) => execCommand('fontName', e.target.value)}
          className="bg-transparent text-xs font-medium border-none focus:ring-0 cursor-pointer"
        >
          {fonts.map(font => (
            <option key={font.name} value={font.family}>{font.name}</option>
          ))}
        </select>

        <select
          onChange={(e) => execCommand('fontSize', e.target.value)}
          className="bg-transparent text-xs font-medium border-none focus:ring-0 cursor-pointer w-16"
        >
          <option value="3">Size 16</option>
          <option value="1">Size 12</option>
          <option value="2">Size 14</option>
          <option value="4">Size 18</option>
          <option value="5">Size 24</option>
          <option value="6">Size 32</option>
          <option value="7">Size 48</option>
        </select>

        <div className="w-px h-4 bg-border mx-1" />

        <input
          type="color"
          onChange={(e) => execCommand('foreColor', e.target.value)}
          className="w-6 h-6 p-0 border-none bg-transparent cursor-pointer"
          title="Text Color"
        />

        <div className="w-px h-4 bg-border mx-1" />

        <button
          onClick={() => execCommand('justifyLeft')}
          className="p-1.5 hover:bg-muted rounded transition-colors"
        >
          <AlignLeft size={16} />
        </button>
        <button
          onClick={() => execCommand('justifyCenter')}
          className="p-1.5 hover:bg-muted rounded transition-colors"
        >
          <AlignCenter size={16} />
        </button>
        <button
          onClick={() => execCommand('justifyRight')}
          className="p-1.5 hover:bg-muted rounded transition-colors"
        >
          <AlignRight size={16} />
        </button>
      </div>

      <div
        ref={editorRef}
        contentEditable
        onInput={(e) => onChange(e.currentTarget.innerHTML)}
        className="p-4 min-h-[100px] focus:outline-none bg-transparent prose prose-sm max-w-none"
        placeholder={placeholder}
        style={{ direction: 'auto' }}
      />
    </div>
  );
};

export default RichTextEditor;
