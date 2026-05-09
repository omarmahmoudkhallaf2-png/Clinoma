import { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, CloudRain, Coffee, Wind, Flame, Keyboard, Moon, Waves } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

const AMBIENT_SOUNDS = [
  { id: 'rain', label: 'Rain', icon: CloudRain, url: 'https://www.soundjay.com/nature/rain-01.mp3' },
  { id: 'coffee', label: 'Coffee Shop', icon: Coffee, url: 'https://www.soundjay.com/misc/sounds/coffee-shop-1.mp3' },
  { id: 'wind', label: 'Wind', icon: Wind, url: 'https://www.soundjay.com/nature/wind-01.mp3' },
  { id: 'fire', label: 'Fireplace', icon: Flame, url: 'https://www.soundjay.com/household/sounds/fireplace-1.mp3' },
  { id: 'typing', label: 'Keyboard', icon: Keyboard, url: 'https://www.soundjay.com/mechanical/sounds/mechanical-keyboard-1.mp3' },
  { id: 'night', label: 'Night', icon: Moon, url: 'https://www.soundjay.com/nature/sounds/cricket-chirp-1.mp3' },
  { id: 'waves', label: 'Ocean', icon: Waves, url: 'https://www.soundjay.com/nature/ocean-wave-1.mp3' },
];

interface MixerProps {
  mix: Record<string, number>;
  onUpdate: (id: string, volume: number) => void;
}

export default function AmbientMixer({ mix, onUpdate }: MixerProps) {
  const audioRefs = useRef<Record<string, HTMLAudioElement>>({});

  useEffect(() => {
    // Initialize or update volumes
    AMBIENT_SOUNDS.forEach(sound => {
      const vol = mix[sound.id] || 0;
      if (!audioRefs.current[sound.id]) {
        const audio = new Audio(sound.url);
        audio.loop = true;
        audioRefs.current[sound.id] = audio;
      }
      
      const audio = audioRefs.current[sound.id];
      if (vol > 0) {
        if (audio.paused) audio.play().catch(() => {});
        audio.volume = vol;
      } else {
        audio.pause();
      }
    });

    return () => {
      // Cleanup
      Object.values(audioRefs.current).forEach(a => a.pause());
    };
  }, [mix]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-card/50 backdrop-blur-xl border border-border/50 rounded-3xl">
      {AMBIENT_SOUNDS.map((sound) => {
        const volume = mix[sound.id] || 0;
        const isActive = volume > 0;

        return (
          <div key={sound.id} className="space-y-3 p-4 rounded-2xl bg-secondary/30 border border-transparent hover:border-primary/20 transition-all">
            <div className="flex items-center justify-between">
              <div className={cn("p-2 rounded-xl", isActive ? "bg-primary text-white" : "bg-muted text-muted-foreground")}>
                <sound.icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest opacity-60">{sound.label}</span>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={() => onUpdate(sound.id, isActive ? 0 : 0.5)}
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                {isActive ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
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
