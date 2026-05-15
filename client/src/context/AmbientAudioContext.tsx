import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const AMBIENT_SOUNDS = [
  { id: 'rain', url: '/sounds/rain.mp3' },
  { id: 'wind', url: '/sounds/wind.mp3' },
  { id: 'fire', url: '/sounds/fire.mp3' },
  { id: 'waves', url: '/sounds/waves.mp3' },
];

interface AmbientAudioContextType {
  volumes: Record<string, number>;
  updateVolume: (id: string, vol: number) => void;
  audioEnabled: boolean;
  setAudioEnabled: (enabled: boolean) => void;
}

const AmbientAudioContext = createContext<AmbientAudioContextType | undefined>(undefined);

export function AmbientAudioProvider({ children }: { children: React.ReactNode }) {
  const audioRefs = useRef<Record<string, HTMLAudioElement>>({});
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [volumes, setVolumes] = useState<Record<string, number>>({
    rain: 0, wind: 0, fire: 0, waves: 0
  });

  useEffect(() => {
    // Initialize audio objects once and KEEP them
    AMBIENT_SOUNDS.forEach(sound => {
      if (!audioRefs.current[sound.id]) {
        const audio = new Audio(sound.url);
        audio.loop = true;
        audio.volume = 0;
        audioRefs.current[sound.id] = audio;
      }
    });

    const saved = localStorage.getItem('study_room_volumes');
    if (saved) {
      try { 
        const parsed = JSON.parse(saved);
        setVolumes(parsed);
        // If any volume was > 0, we might want to auto-enable audio if the user interacts
      } catch (e) {}
    }

    // Do NOT pause or clear src on unmount to keep audio playing
    return () => {
      // Cleanup is handled by the provider unmounting (which should be at the app level)
    };
  }, []);

  useEffect(() => {
    if (!audioEnabled) {
      // If disabled, pause all
      Object.values(audioRefs.current).forEach(a => a.pause());
      return;
    }

    Object.keys(volumes).forEach(id => {
      const audio = audioRefs.current[id];
      if (!audio) return;
      
      const vol = volumes[id];
      audio.volume = vol;

      if (vol > 0 && audio.paused) {
        audio.play().catch(e => console.log("Ambient audio play blocked:", id, e));
      } else if (vol === 0 && !audio.paused) {
        audio.pause();
      }
    });

    localStorage.setItem('study_room_volumes', JSON.stringify(volumes));
  }, [volumes, audioEnabled]);

  const updateVolume = (id: string, vol: number) => {
    if (!audioEnabled) setAudioEnabled(true);
    setVolumes(prev => ({ ...prev, [id]: vol }));
  };

  return (
    <AmbientAudioContext.Provider value={{ volumes, updateVolume, audioEnabled, setAudioEnabled }}>
      {children}
    </AmbientAudioContext.Provider>
  );
}

export function useAmbientAudio() {
  const context = useContext(AmbientAudioContext);
  if (context === undefined) {
    throw new Error('useAmbientAudio must be used within an AmbientAudioProvider');
  }
  return context;
}
