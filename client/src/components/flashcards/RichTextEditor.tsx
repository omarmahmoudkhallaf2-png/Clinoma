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
  onFocus?: () => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ 
  value, 
  onChange, 
  onFocus,
  placeholder, 
  className,
  minHeight = "200px"
}) => {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  return (
    <div className={cn("relative w-full group", className)}>
      <div
        ref={editorRef}
        contentEditable
        onInput={(e) => onChange(e.currentTarget.innerHTML)}
        onFocus={onFocus}
        className={cn(
          "p-6 focus:outline-none bg-card/30 border-2 border-border focus:border-primary/50 rounded-3xl prose prose-lg dark:prose-invert max-w-none transition-all",
          "empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/30 empty:before:pointer-events-none"
        )}
        style={{ minHeight }}
        data-placeholder={placeholder}
        dir="auto"
      />
    </div>
  );
};

export default RichTextEditor;
