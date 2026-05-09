import { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, CloudRain, Coffee, Wind, Flame, Keyboard, Moon, Waves } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

const AMBIENT_SOUNDS = [
  { id: 'rain', label: 'Rain', icon: CloudRain, url: '/sounds/rain.mp3' },
  { id: 'wind', label: 'Wind', icon: Wind, url: '/sounds/wind.mp3' },
  { id: 'fire', label: 'Fireplace', icon: Flame, url: '/sounds/fire.mp3' },
  { id: 'waves', label: 'Ocean', icon: Waves, url: '/sounds/waves.mp3' },
];

interface MixerProps {
  mix: Record<string, number>;
  onUpdate: (id: string, volume: number) => void;
}

export default function AmbientMixer({ mix, onUpdate }: MixerProps) {
  const audioRefs = useRef<Record<string, HTMLAudioElement>>({});
  const [audioEnabled, setAudioEnabled] = useState(false);

  // Initialize audio objects once
  useEffect(() => {
    AMBIENT_SOUNDS.forEach(sound => {
      const audio = new Audio(sound.url);
      audio.loop = true;
      audioRefs.current[sound.id] = audio;
    });

    return () => {
      Object.values(audioRefs.current).forEach(a => {
        a.pause();
        a.src = "";
      });
    };
  }, []);

  // Update volumes and play/pause
  useEffect(() => {
    if (!audioEnabled) return;

    AMBIENT_SOUNDS.forEach(sound => {
      const audio = audioRefs.current[sound.id];
      if (!audio) return;

      const vol = mix[sound.id] || 0;
      audio.volume = vol;

      if (vol > 0 && audio.paused) {
        audio.play().catch(e => console.log("Autoplay blocked or error:", e));
      } else if (vol === 0 && !audio.paused) {
        audio.pause();
      }
    });
  }, [mix, audioEnabled]);

  const toggleSound = (id: string, currentVol: number) => {
    setAudioEnabled(true); // User interaction enables audio
    onUpdate(id, currentVol > 0 ? 0 : 0.5);
  };

  return (
    <div className="space-y-6">
      {!audioEnabled && (
        <div className="p-4 bg-primary/10 border border-primary/20 rounded-2xl text-center">
          <p className="text-sm font-bold text-primary mb-2">اضغط على أي أيقونة لتفعيل محرك الصوت</p>
        </div>
      )}
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
                  disabled={!audioEnabled && !isActive}
                  onChange={(e) => {
                    setAudioEnabled(true);
                    onUpdate(sound.id, parseFloat(e.target.value));
                  }}
                  className="flex-1 h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
