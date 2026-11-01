import React from 'react';
import { Play, Pause, Shuffle } from 'lucide-react';
import { audioManager } from '../audio/audioManager.ts';
import { AudioPlayerState } from '../types/satie.ts';
import { PWAInstallButton } from './PWAInstallButton.tsx';

interface HeaderProps {
  playerState: AudioPlayerState;
  activeTab: 'broadcast' | 'catalog' | 'mixer' | 'randomizer' | 'generative';
  setActiveTab: (tab: 'broadcast' | 'catalog' | 'mixer' | 'randomizer' | 'generative') => void;
  onOpenSleepTimer: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  playerState,
  activeTab,
  setActiveTab,
  onOpenSleepTimer
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#222222] bg-[#0c0c0c]/95 backdrop-blur-sm font-mono text-xs">
      <div className="mx-auto flex h-13 max-w-6xl items-center justify-between gap-4 px-4 sm:px-8">
        {/* Brand */}
        <button
          onClick={() => setActiveTab('broadcast')}
          className="flex items-center gap-2 whitespace-nowrap shrink-0 text-left hover:text-[#ffffff] transition-colors"
        >
          <span className="font-semibold tracking-wider text-[#ffffff]">
            RADIO SATIE
          </span>
          <span className="text-[#555555] hidden lg:inline">
            // {playerState.currentStation.frequency} MHz
          </span>
        </button>

        {/* Minimal Monospace Nav Links */}
        <nav className="flex items-center gap-1 overflow-x-auto">
          {(
            [
              ['broadcast', 'BROADCAST'],
              ['catalog', 'TUNES'],
              ['generative', 'GENERATIVE'],
              ['randomizer', 'SHUFFLE'],
              ['mixer', 'ATMOSPHERE']
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-2 py-1 text-[11px] rounded transition-colors whitespace-nowrap ${
                activeTab === key
                  ? 'bg-[#222222] text-[#ffffff] font-medium'
                  : 'text-[#888888] hover:text-[#cccccc] hover:bg-[#161616]'
              }`}
            >
              {label}
            </button>
          ))}
        </nav>

        {/* Right Playback Status */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <PWAInstallButton />

          {playerState.sleepTimerRemaining !== null && (
            <button
              onClick={onOpenSleepTimer}
              className="hidden sm:inline-block text-[11px] text-[#888888] hover:text-[#ffffff] tabular-nums"
            >
              SLP:{Math.floor(playerState.sleepTimerRemaining / 60)}m
            </button>
          )}

          <button
            onClick={() => audioManager.randomizeNow()}
            className="p-1.5 text-[#888888] hover:text-[#ffffff] transition-colors"
            title="Next random tune"
          >
            <Shuffle className="h-3.5 w-3.5" />
          </button>

          <button
            onClick={() => audioManager.togglePlay()}
            className="flex items-center gap-1.5 px-3 py-1 text-[11px] font-semibold text-[#0a0a0a] bg-[#ffffff] rounded hover:bg-[#e0e0e0] active:scale-[0.98] transition-all whitespace-nowrap shrink-0"
          >
            {playerState.isPlaying ? (
              <>
                <Pause className="h-3 w-3 fill-current" />
                <span>PAUSE</span>
              </>
            ) : (
              <>
                <Play className="h-3 w-3 fill-current ml-0.5" />
                <span>PLAY</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
