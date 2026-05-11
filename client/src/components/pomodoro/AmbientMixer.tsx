import { Volume2, CloudRain, Wind, Flame, Waves } from 'lucide-react';
import { cn } from '../../lib/utils';

const AMBIENT_SOUNDS = [
  { id: 'rain', label: 'Rain', icon: CloudRain },
  { id: 'wind', label: 'Wind', icon: Wind },
  { id: 'fire', label: 'Fireplace', icon: Flame },
  { id: 'waves', label: 'Ocean', icon: Waves },
];

interface MixerProps {
  mix: Record<string, number>;
  onUpdate: (id: string, volume: number) => void;
}

export default function AmbientMixer({ mix, onUpdate }: MixerProps) {
  const toggleSound = (id: string, currentVol: number) => {
    onUpdate(id, currentVol > 0 ? 0 : 0.5);
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-card/50 backdrop-blur-xl border border-border/50 rounded-3xl">
      {AMBIENT_SOUNDS.map((sound) => {
        const volume = mix[sound.id] || 0;
        const isActive = volume > 0;

        return (
          <div key={sound.id} className="space-y-3 p-4 rounded-2xl bg-secondary/30 border border-transparent hover:border-primary/20 transition-all">
            <div className="flex items-center justify-between">
              <button 
                onClick={() => toggleSound(sound.id, volume)}
                className={cn("p-2 rounded-xl transition-all", isActive ? "bg-primary text-white scale-110 shadow-lg" : "bg-muted text-muted-foreground hover:bg-muted/80")}
              >
                <sound.icon className="w-5 h-5" />
              </button>
              <span className="text-xs font-bold uppercase tracking-widest opacity-60">{sound.label}</span>
            </div>
            
            <div className="flex items-center gap-3">
              <input 
                type="range" 
                min="0" max="1" step="0.01"
                value={volume}
                onChange={(e) => onUpdate(sound.id, parseFloat(e.target.value))}
                className="flex-1 h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
