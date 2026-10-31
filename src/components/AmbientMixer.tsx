import React from 'react';
import { CloudRain, Disc, Volume2, Moon } from 'lucide-react';
import { audioManager } from '../audio/audioManager.ts';
import { AudioPlayerState } from '../types/satie.ts';

interface AmbientMixerProps {
  playerState: AudioPlayerState;
  onOpenSleepTimer: () => void;
}

export const AmbientMixer: React.FC<AmbientMixerProps> = ({ playerState }) => {
  return (
    <div className="space-y-4 font-mono text-xs">
      <div className="p-3 rounded border border-[#222222] bg-[#121212] flex items-center justify-between">
        <span className="font-semibold text-[#ffffff] tracking-wider">
          ATMOSPHERIC MIXER
        </span>
        <span className="text-[#666666]">
          // BACKGROUND LAYER
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Rain */}
        <div className="p-3.5 rounded border border-[#222222] bg-[#121212] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#ffffff]">
              <CloudRain className="h-4 w-4 text-[#888888]" />
              <span>RAIN</span>
            </div>
            <span className="text-[#888888] tabular-nums">
              {Math.round(playerState.rainVolume * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={playerState.rainVolume}
            onChange={(e) => audioManager.setRainVolume(parseFloat(e.target.value))}
            className="w-full cursor-pointer h-1 bg-[#262626] rounded"
          />
        </div>

        {/* Vinyl Crackle */}
        <div className="p-3.5 rounded border border-[#222222] bg-[#121212] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#ffffff]">
              <Disc className="h-4 w-4 text-[#888888]" />
              <span>VINYL CRACKLE (78 RPM)</span>
            </div>
            <span className="text-[#888888] tabular-nums">
              {Math.round(playerState.vinylVolume * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={playerState.vinylVolume}
            onChange={(e) => audioManager.setVinylVolume(parseFloat(e.target.value))}
            className="w-full cursor-pointer h-1 bg-[#262626] rounded"
          />
        </div>

        {/* Felt Damper Toggle & Master Volume */}
        <div className="p-3.5 rounded border border-[#222222] bg-[#121212] flex items-center justify-between gap-4">
          <div>
            <span className="text-[#ffffff]">FELT MUTE</span>
            <div className="text-[10px] text-[#666666]">WARM DAMPED HAMMERS</div>
          </div>
          <button
            onClick={() => audioManager.setFeltDampened(!playerState.feltDampened)}
            className={`px-3 py-1 text-[11px] rounded border transition-colors ${
              playerState.feltDampened
                ? 'bg-[#ffffff] text-[#0a0a0a] border-[#ffffff] font-semibold'
                : 'bg-[#181818] text-[#777777] border-[#222222]'
            }`}
          >
            {playerState.feltDampened ? 'ON' : 'OFF'}
          </button>
        </div>

        {/* Master Volume */}
        <div className="p-3.5 rounded border border-[#222222] bg-[#121212] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#ffffff]">
              <Volume2 className="h-4 w-4 text-[#888888]" />
              <span>MASTER OUTPUT</span>
            </div>
            <span className="text-[#888888] tabular-nums">
              {Math.round(playerState.volume * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={playerState.volume}
            onChange={(e) => audioManager.setVolume(parseFloat(e.target.value))}
            className="w-full cursor-pointer h-1 bg-[#262626] rounded"
          />
        </div>
      </div>

      {/* Sleep Timer Bar */}
      <div className="p-3.5 rounded border border-[#222222] bg-[#121212] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-[#ffffff]">
          <Moon className="h-4 w-4 text-[#888888]" />
          <span>SLEEP TIMER:</span>
          <span className="text-[#888888]">
            {playerState.sleepTimerRemaining !== null
              ? `${Math.floor(playerState.sleepTimerRemaining / 60)}M REMAINING`
              : 'INACTIVE'}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {[15, 30, 45, 60].map((mins) => (
            <button
              key={mins}
              onClick={() => audioManager.setSleepTimer(mins)}
              className="px-2.5 py-1 text-[11px] rounded border border-[#2b2b2b] bg-[#181818] text-[#888888] hover:text-[#ffffff] hover:border-[#444444]"
            >
              {mins}M
            </button>
          ))}
          {playerState.sleepTimerRemaining !== null && (
            <button
              onClick={() => audioManager.setSleepTimer(null)}
              className="px-2.5 py-1 text-[11px] rounded border border-[#444444] bg-[#222222] text-[#ffffff]"
            >
              CLEAR
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
