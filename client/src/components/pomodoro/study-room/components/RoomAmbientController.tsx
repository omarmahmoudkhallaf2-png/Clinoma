import { CloudRain, Wind, Flame, Waves, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { cn } from '../../../../lib/utils';

const AMBIENT_SOUNDS = [
  { id: 'rain', label: 'Rain', icon: CloudRain },
  { id: 'wind', label: 'Wind', icon: Wind },
  { id: 'fire', label: 'Fireplace', icon: Flame },
  { id: 'waves', label: 'Ocean', icon: Waves },
];

interface RoomAmbientControllerProps {
  volumes: Record<string, number>;
  onUpdateVolume: (id: string, vol: number) => void;
  audioEnabled: boolean;
  onEnableAudio: () => void;
}

export default function RoomAmbientController({ 
  volumes, 
  onUpdateVolume, 
  audioEnabled, 
  onEnableAudio 
}: RoomAmbientControllerProps) {
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          <Sparkles className="w-4 h-4" /> Personal Atmosphere
        </h3>
        <span className="text-[10px] font-black bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full uppercase tracking-tighter">Persistent</span>
      </div>

      <div className="grid gap-3">
        {!audioEnabled && (
          <button 
            onClick={onEnableAudio}
            className="p-4 bg-primary/10 border border-primary/20 rounded-2xl text-xs font-black text-primary uppercase tracking-widest hover:bg-primary/20 transition-all animate-pulse"
          >
            Click to Activate Audio Engine
          </button>
        )}
        
        {AMBIENT_SOUNDS.map((sound) => {
          const vol = volumes[sound.id] || 0;
          const isActive = vol > 0;

          return (
            <div key={sound.id} className="p-4 rounded-[2rem] bg-card/50 backdrop-blur-xl border border-border/50 space-y-3 transition-all hover:border-primary/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-2 rounded-xl transition-all",
                    isActive ? "bg-primary text-white" : "bg-secondary text-muted-foreground"
                  )}>
                    <sound.icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest">{sound.label}</span>
                </div>
                {isActive ? <Volume2 className="w-4 h-4 text-primary" /> : <VolumeX className="w-4 h-4 text-muted-foreground" />}
              </div>

              <input 
                type="range"
                min="0" max="1" step="0.01"
                value={vol}
                onChange={(e) => onUpdateVolume(sound.id, parseFloat(e.target.value))}
                className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
