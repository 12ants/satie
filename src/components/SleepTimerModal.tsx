import React from 'react';
import { X, Moon } from 'lucide-react';
import { audioManager } from '../audio/audioManager.ts';
import { AudioPlayerState } from '../types/satie.ts';

interface SleepTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerState: AudioPlayerState;
}

export const SleepTimerModal: React.FC<SleepTimerModalProps> = ({
  isOpen,
  onClose,
  playerState
}) => {
  if (!isOpen) return null;

  const presets = [15, 30, 45, 60, 90];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm font-mono text-xs">
      <div className="w-full max-w-sm rounded border border-[#262626] bg-[#101010] p-4 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#222222]">
          <div className="flex items-center gap-2 text-[#ffffff]">
            <Moon className="h-4 w-4 text-[#888888]" />
            <span className="font-semibold tracking-wider">SLEEP TIMER</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#666666] hover:text-[#ffffff] rounded transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {playerState.sleepTimerRemaining !== null && (
          <div className="rounded border border-[#333333] bg-[#161616] p-2.5 text-center">
            <span className="text-[10px] text-[#777777] uppercase">STOPS IN</span>
            <div className="text-lg font-bold text-[#ffffff] mt-0.5 tabular-nums">
              {Math.floor(playerState.sleepTimerRemaining / 60)}M {playerState.sleepTimerRemaining % 60}S
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-1.5">
          {presets.map((mins) => (
            <button
              key={mins}
              onClick={() => {
                audioManager.setSleepTimer(mins);
                onClose();
              }}
              className="py-2 px-1 text-[11px] rounded border border-[#262626] bg-[#141414] hover:bg-[#202020] hover:text-[#ffffff] text-[#999999] transition-all"
            >
              {mins} MIN
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 pt-2 border-t border-[#222222]">
          {playerState.sleepTimerRemaining !== null && (
            <button
              onClick={() => {
                audioManager.setSleepTimer(null);
                onClose();
              }}
              className="flex-1 py-1.5 px-3 text-[11px] text-[#888888] hover:text-[#ffffff] rounded border border-[#262626] transition-colors"
            >
              CANCEL
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 py-1.5 px-3 text-[11px] font-semibold text-[#0a0a0a] bg-[#ffffff] hover:bg-[#e0e0e0] rounded transition-colors"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
