
export type SoundType = 'tap' | 'hover' | 'unlock' | 'complete' | 'ambient' | 'secret' | 'shake' | 'confetti';

const SOUND_FILES: Record<SoundType, string> = {
  tap: '/sounds/soft-click.mp3',
  hover: '/sounds/subtle-whoosh.mp3',
  unlock: '/sounds/vault-open.mp3',
  complete: '/sounds/orchestral-hit.mp3',
  ambient: '/sounds/vinyl-crackle.mp3',
  secret: '/sounds/whisper-psst.mp3',
  shake: '/sounds/bass-whomp.mp3',
  confetti: '/sounds/sparkle-burst.mp3'
};

export const playSignalSound = (type: SoundType) => {
  if (typeof window === 'undefined') return null;
  
  try {
    const audio = new Audio(SOUND_FILES[type]);
    
    // Volume mixing
    const volumes: Record<SoundType, number> = {
      tap: 0.4,
      hover: 0.1,
      unlock: 0.6,
      complete: 0.7,
      ambient: 0.05,
      secret: 0.5,
      shake: 0.6,
      confetti: 0.5
    };
    
    audio.volume = volumes[type] || 0.5;
    
    if (type === 'ambient') {
      audio.loop = true;
    }

    const promise = audio.play();
    if (promise) {
      promise.catch(() => {
        // Auto-play policy or missing file
      });
    }
    
    return audio;
  } catch (e) {
    console.warn('[SignalSound] System error:', e);
    return null;
  }
};
