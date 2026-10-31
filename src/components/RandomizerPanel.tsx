import React from 'react';
import { Shuffle, Sparkles, RefreshCw, Sliders } from 'lucide-react';
import { audioManager } from '../audio/audioManager.ts';
import { AudioPlayerState, CompositionMood } from '../types/satie.ts';

interface RandomizerPanelProps {
  playerState: AudioPlayerState;
}

export const RandomizerPanel: React.FC<RandomizerPanelProps> = ({ playerState }) => {
  const { randomizer } = playerState;

  const moods: Array<{ id: 'all' | CompositionMood; label: string }> = [
    { id: 'all', label: 'ALL' },
    { id: 'ambient', label: 'AMBIENT' },
    { id: 'melancholy', label: 'MELANCHOLY' },
    { id: 'mystical', label: 'MYSTICAL' },
    { id: 'eccentric', label: 'ECCENTRIC' }
  ];

  const modes = [
    { id: 'random' as const, label: 'RANDOM', desc: 'True random shuffle across selected pool' },
    { id: 'ambient-weighted' as const, label: 'WEIGHTED', desc: 'Favors slow, contemplative movements' },
    { id: 'generative' as const, label: 'GENERATIVE', desc: 'Infinite procedural Satie improvisation' }
  ];

  const tempos = [0.75, 1.0, 1.25];
  const gaps = [0, 3, 6, 10];

  return (
    <div className="space-y-4 font-mono text-xs">
      {/* Top Action Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded border border-[#222222] bg-[#121212]">
        <div className="flex items-center gap-2">
          <Shuffle className="h-4 w-4 text-[#ffffff]" />
          <span className="font-semibold text-[#ffffff] tracking-wider">
            TUNE RANDOMIZER
          </span>
          <span className="text-[#666666]">
            // {randomizer.shuffle ? 'SHUFFLE ACTIVE' : 'SEQUENTIAL'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => audioManager.updateRandomizer({ shuffle: !randomizer.shuffle })}
            className={`px-2.5 py-1 text-[11px] rounded border transition-colors ${
              randomizer.shuffle
                ? 'bg-[#ffffff] text-[#0a0a0a] border-[#ffffff] font-semibold'
                : 'bg-[#181818] text-[#888888] border-[#2b2b2b] hover:text-[#cccccc]'
            }`}
          >
            SHUFFLE: {randomizer.shuffle ? 'ON' : 'OFF'}
          </button>

          <button
            onClick={() => audioManager.randomizeNow()}
            className="flex items-center gap-1.5 px-3 py-1 text-[11px] font-semibold text-[#0a0a0a] bg-[#ffffff] rounded hover:bg-[#e0e0e0] transition-colors"
          >
            <RefreshCw className="h-3 w-3" />
            <span>PICK RANDOM</span>
          </button>
        </div>
      </div>

      {/* Grid of Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Playback Mode */}
        <div className="p-3.5 rounded border border-[#222222] bg-[#121212] space-y-2">
          <div className="flex items-center justify-between text-[#888888]">
            <span>SELECTION ALGORITHM</span>
            <span className="text-[10px] text-[#555555]">MODE</span>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            {modes.map((m) => (
              <button
                key={m.id}
                onClick={() => audioManager.updateRandomizer({ mode: m.id })}
                className={`py-1.5 px-2 text-[11px] rounded border text-center transition-colors ${
                  randomizer.mode === m.id
                    ? 'bg-[#222222] text-[#ffffff] border-[#444444] font-medium'
                    : 'bg-[#161616] text-[#777777] border-[#222222] hover:text-[#cccccc]'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          <p className="text-[10px] text-[#666666] pt-1">
            {modes.find((m) => m.id === randomizer.mode)?.desc}
          </p>
        </div>

        {/* Mood Filter */}
        <div className="p-3.5 rounded border border-[#222222] bg-[#121212] space-y-2">
          <div className="flex items-center justify-between text-[#888888]">
            <span>MOOD FILTER</span>
            <span className="text-[10px] text-[#555555]">POOL: {randomizer.moodFilter.toUpperCase()}</span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {moods.map((m) => (
              <button
                key={m.id}
                onClick={() => audioManager.updateRandomizer({ moodFilter: m.id })}
                className={`py-1 px-2.5 text-[11px] rounded border transition-colors ${
                  randomizer.moodFilter === m.id
                    ? 'bg-[#222222] text-[#ffffff] border-[#444444] font-medium'
                    : 'bg-[#161616] text-[#777777] border-[#222222] hover:text-[#cccccc]'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tempo Scale */}
        <div className="p-3.5 rounded border border-[#222222] bg-[#121212] space-y-2">
          <div className="flex items-center justify-between text-[#888888]">
            <span>TEMPO MODIFIER</span>
            <span className="text-[10px] text-[#555555]">{randomizer.tempoScale}x</span>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            {tempos.map((t) => (
              <button
                key={t}
                onClick={() => audioManager.updateRandomizer({ tempoScale: t })}
                className={`py-1.5 px-2 text-[11px] rounded border text-center transition-colors ${
                  randomizer.tempoScale === t
                    ? 'bg-[#222222] text-[#ffffff] border-[#444444] font-medium'
                    : 'bg-[#161616] text-[#777777] border-[#222222] hover:text-[#cccccc]'
                }`}
              >
                {t}x {t < 1 ? '(SLOW)' : t > 1 ? '(FAST)' : '(ORIG)'}
              </button>
            ))}
          </div>
        </div>

        {/* Inter-Track Silence Gap */}
        <div className="p-3.5 rounded border border-[#222222] bg-[#121212] space-y-2">
          <div className="flex items-center justify-between text-[#888888]">
            <span>INTER-TRACK SILENCE GAP</span>
            <span className="text-[10px] text-[#555555]">{randomizer.silenceGapSeconds} SECONDS</span>
          </div>

          <div className="grid grid-cols-4 gap-1.5">
            {gaps.map((g) => (
              <button
                key={g}
                onClick={() => audioManager.updateRandomizer({ silenceGapSeconds: g })}
                className={`py-1.5 px-2 text-[11px] rounded border text-center transition-colors ${
                  randomizer.silenceGapSeconds === g
                    ? 'bg-[#222222] text-[#ffffff] border-[#444444] font-medium'
                    : 'bg-[#161616] text-[#777777] border-[#222222] hover:text-[#cccccc]'
                }`}
              >
                {g}s
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
