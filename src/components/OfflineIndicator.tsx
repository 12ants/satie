import React, { useEffect } from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus.ts';
import { audioManager } from '../audio/audioManager.ts';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  useEffect(() => {
    // If connection drops, seamlessly ensure client-side Web Audio felt synth is engaged
    if (!isOnline) {
      const state = audioManager.getState();
      if (state.engine === 'archival') {
        audioManager.setEngine('felt-piano');
      }
    }
  }, [isOnline]);

  if (isOnline) return null;

  return (
    <div className="fixed bottom-3 right-3 z-50 flex items-center gap-2 rounded border border-[#444444] bg-[#141414] px-2.5 py-1 text-[11px] font-mono text-[#ffffff] shadow-lg">
      <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
      <WifiOff className="h-3 w-3 text-amber-400" />
      <span>OFFLINE · CLIENT SYNTH ACTIVE</span>
    </div>
  );
};
