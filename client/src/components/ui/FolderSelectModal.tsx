import { X, Lock, Unlock, ArrowRight } from 'lucide-react';

interface FolderSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (folder: 'f1' | 'f2' | 'f1_free' | 'f2_free') => void;
  subject: string;
  isPremium: boolean;
  forcedFolder?: 'f1' | 'f2';
}

export default function FolderSelectModal({ isOpen, onClose, onSelect, subject, isPremium, forcedFolder }: FolderSelectModalProps) {
  if (!isOpen) return null;

  const freeFolder = forcedFolder === 'f2' ? 'f2_free' : 'f1_free';

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-card border border-border w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95">
        <div className="p-8 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Select Access Level</h2>
              <p className="text-muted-foreground capitalize">{subject} • {forcedFolder?.toUpperCase()} Level</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-secondary rounded-xl transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="grid gap-4">
            <button
              onClick={() => onSelect(freeFolder as any)}
              className="flex items-center justify-between p-6 bg-secondary/30 hover:bg-secondary/50 border border-border rounded-2xl transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-500/10 text-green-600 rounded-xl">
                  <Unlock className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-lg">{forcedFolder?.toUpperCase()} Free Version</div>
                  <div className="text-sm text-muted-foreground">Introductory materials & basic Qs</div>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => onSelect(forcedFolder || 'f1')}
              className={`flex items-center justify-between p-6 border rounded-2xl transition-all group ${
                isPremium 
                  ? 'bg-amber-500/5 hover:bg-amber-500/10 border-amber-500/20' 
                  : 'bg-secondary/20 border-border'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${isPremium ? 'bg-amber-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                  {isPremium ? <Unlock className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
                </div>
                <div className="text-left">
                  <div className="font-bold text-lg flex items-center gap-2">
                    {forcedFolder?.toUpperCase()} Premium Version
                    {!isPremium && <span className="text-[10px] bg-amber-500/10 text-amber-600 px-1.5 py-0.5 rounded font-bold uppercase">Upgrade</span>}
                  </div>
                  <div className="text-sm text-muted-foreground">High-yield content & full bank</div>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
