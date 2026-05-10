import { useState, useEffect, useRef } from 'react';

const AMBIENT_SOUNDS = [
  { id: 'rain', url: '/sounds/rain.mp3' },
  { id: 'wind', url: '/sounds/wind.mp3' },
  { id: 'fire', url: '/sounds/fire.mp3' },
  { id: 'waves', url: '/sounds/waves.mp3' },
];

export function useAmbientAudio() {
  const audioRefs = useRef<Record<string, HTMLAudioElement>>({});
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [volumes, setVolumes] = useState<Record<string, number>>({
    rain: 0, wind: 0, fire: 0, waves: 0
  });

  useEffect(() => {
    // Initialize audio objects once
    AMBIENT_SOUNDS.forEach(sound => {
      const audio = new Audio(sound.url);
      audio.loop = true;
      audio.volume = 0;
      audioRefs.current[sound.id] = audio;
    });

    const saved = localStorage.getItem('study_room_volumes');
    if (saved) {
      try { setVolumes(JSON.parse(saved)); } catch (e) {}
    }

    return () => {
      Object.values(audioRefs.current).forEach(a => {
        a.pause();
        a.src = "";
      });
    };
  }, []);

  useEffect(() => {
    if (!audioEnabled) return;

    Object.keys(volumes).forEach(id => {
      const audio = audioRefs.current[id];
      if (!audio) return;
      
      const vol = volumes[id];
      audio.volume = vol;

      if (vol > 0 && audio.paused) {
        audio.play().catch(() => {});
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

  return { volumes, updateVolume, audioEnabled, setAudioEnabled };
}
