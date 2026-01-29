
import React, { createContext, useContext, useState, useEffect } from 'react';
import { playSignalSound } from '../lib/sound';

interface SignalState {
  xp: number;
  streak: number;
  discoveries: string[]; // IDs of discovered items
  artifacts: string[]; // IDs of created artifacts
  unlockedTools: boolean;
  hasSeenIntro: boolean;
  activeBadges: string[];
}

interface SignalContextType {
  state: SignalState;
  addXP: (amount: number, reason?: string) => void;
  unlockDiscovery: (id: string) => void;
  unlockTool: () => void;
  generateArtifact: (templateId: string, input: any) => void;
  triggerEasterEgg: (type: 'shake' | 'longpress') => void;
  resetProgress: () => void;
}

const defaultState: SignalState = {
  xp: 0,
  streak: 1,
  discoveries: [],
  artifacts: [],
  unlockedTools: false,
  hasSeenIntro: false,
  activeBadges: []
};

const SignalContext = createContext<SignalContextType | undefined>(undefined);

export const SignalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<SignalState>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('signal_card_state');
      if (saved) return JSON.parse(saved);
    }
    return defaultState;
  });

  useEffect(() => {
    localStorage.setItem('signal_card_state', JSON.stringify(state));
  }, [state]);

  const addXP = (amount: number, reason?: string) => {
    setState(prev => ({ ...prev, xp: prev.xp + amount }));
    // Optional: Toast notification here
    console.log(`[XP] +${amount} (${reason})`);
  };

  const unlockDiscovery = (id: string) => {
    if (state.discoveries.includes(id)) return;
    
    setState(prev => ({
      ...prev,
      discoveries: [...prev.discoveries, id]
    }));
    playSignalSound('unlock');
    addXP(10, 'Discovery Unlocked');
  };

  const unlockTool = () => {
    if (state.unlockedTools) return;
    setState(prev => ({ ...prev, unlockedTools: true }));
    playSignalSound('complete');
    addXP(100, 'Arsenal Unlocked');
  };

  const generateArtifact = (templateId: string, input: any) => {
    // In a real app, call API here.
    // For prototype, mock success.
    const artifactId = `art_${Date.now()}`;
    setState(prev => ({
      ...prev,
      artifacts: [...prev.artifacts, artifactId]
    }));
    playSignalSound('complete');
  };

  const triggerEasterEgg = (type: 'shake' | 'longpress') => {
    const discoveryId = `egg_${type}`;
    if (!state.discoveries.includes(discoveryId)) {
        playSignalSound(type === 'shake' ? 'shake' : 'secret');
        unlockDiscovery(discoveryId);
        addXP(50, 'Secret Found');
    }
  };

  const resetProgress = () => {
    setState(defaultState);
  }

  return (
    <SignalContext.Provider value={{
      state,
      addXP,
      unlockDiscovery,
      unlockTool,
      generateArtifact,
      triggerEasterEgg,
      resetProgress
    }}>
      {children}
    </SignalContext.Provider>
  );
};

export const useSignal = () => {
  const context = useContext(SignalContext);
  if (!context) throw new Error('useSignal must be used within SignalProvider');
  return context;
};
