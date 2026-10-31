import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Sparkles, Feather } from 'lucide-react';
import { audioManager, AudioPlayerState } from '../audio/audioManager.ts';
import { COMPOSITIONS } from '../data/compositions.ts';

interface VexationsModeProps {
  playerState: AudioPlayerState;
}

export const VexationsMode: React.FC<VexationsModeProps> = ({ playerState }) => {
  const [repetitionCount, setRepetitionCount] = useState<number>(1);
  const [breathPhase, setBreathPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');

  const vexationsComp = COMPOSITIONS.find((c) => c.id === 'vexations-theme') || COMPOSITIONS[0];
  const isCurrentlyPlayingVexations = playerState.isPlaying && playerState.currentComposition.id === 'vexations-theme';

  // Contemplative breathing cycle
  useEffect(() => {
    if (!isCurrentlyPlayingVexations) return;
    const interval = setInterval(() => {
      setBreathPhase((prev) => {
        if (prev === 'Inhale') return 'Hold';
        if (prev === 'Hold') return 'Exhale';
        return 'Inhale';
      });
    }, 4500);

    return () => clearInterval(interval);
  }, [isCurrentlyPlayingVexations]);

  // Simulate or track repetition progression
  const handleToggleVexations = () => {
    if (isCurrentlyPlayingVexations) {
      audioManager.pause();
    } else {
      audioManager.setStation('vexations');
    }
  };

  return (
    <div className="space-y-8">
      {/* Editorial Header */}
      <div className="border-b border-[#2a2622] pb-6">
        <div className="flex items-center gap-2 text-xs font-serif italic tracking-widest text-[#a69784] uppercase">
          <span>Enigmatic Work</span>
          <span aria-hidden="true">·</span>
          <span>1893</span>
        </div>
        <h2 className="mt-2 font-serif text-3xl font-medium tracking-tight text-[#f3efe6]">
          Vexations: The 840 Repetitions
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#b5a999]">
          A single-page manuscript consisting of a brief theme and two variations with altered chords, bearing one of the most mysterious inscriptions in music history.
        </p>
      </div>

      {/* Satie Original Inscription Quote Box */}
      <div className="rounded-xl border border-[#383027] bg-[#1a1715] p-6 lg:p-8 text-center max-w-3xl mx-auto space-y-4">
        <Feather className="h-6 w-6 mx-auto text-[#c4a984]" />
        <blockquote className="font-serif text-lg lg:text-xl italic leading-relaxed text-[#ece6dc]">
          “In order to play this theme 840 times in succession, it would be advisable to prepare oneself beforehand, and in the deepest silence, by serious immobilities.”
        </blockquote>
        <p className="text-xs font-serif text-[#a69784]">
          — Erik Satie, autographed manuscript, 1893
        </p>
      </div>

      {/* Main Contemplation Controller & Counter */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center max-w-4xl mx-auto">
        {/* Visual Circular Repetition Indicator */}
        <div className="flex flex-col items-center justify-center p-8 rounded-2xl border border-[#2b2723] bg-[#161413]">
          <div className="relative flex items-center justify-center w-52 h-52">
            {/* SVG circle track */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="104"
                cy="104"
                r="90"
                stroke="#2a2520"
                strokeWidth="4"
                fill="transparent"
              />
              <circle
                cx="104"
                cy="104"
                r="90"
                stroke="#c4a984"
                strokeWidth="4"
                strokeDasharray="565.48"
                strokeDashoffset={565.48 - (565.48 * (repetitionCount / 840))}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-700"
              />
            </svg>

            {/* Inner Content */}
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="font-serif text-xs text-[#9c9081] uppercase tracking-wider">
                Repetition
              </span>
              <span className="font-mono text-3xl font-bold tracking-tight text-[#f3efe6] mt-1 tabular-nums">
                {repetitionCount}
              </span>
              <span className="text-xs font-mono text-[#786e62] mt-0.5">
                of 840
              </span>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={() => setRepetitionCount((prev) => Math.max(1, prev - 1))}
              className="px-3 py-1.5 text-xs text-[#9c9081] hover:text-[#f3efe6] border border-[#2e2924] rounded-lg bg-[#1c1917]"
            >
              -1
            </button>
            <button
              onClick={() => setRepetitionCount((prev) => Math.min(840, prev + 1))}
              className="px-3 py-1.5 text-xs text-[#c4a984] hover:text-[#e4cdad] border border-[#2e2924] rounded-lg bg-[#1c1917]"
            >
              +1 Repetition
            </button>
            <button
              onClick={() => setRepetitionCount(1)}
              className="p-1.5 text-[#786e62] hover:text-[#9c9081] rounded-lg"
              title="Reset counter"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Playback & Breathing Controller */}
        <div className="rounded-2xl border border-[#2b2723] bg-[#161413] p-8 space-y-6">
          <div>
            <span className="text-xs font-serif uppercase tracking-wider text-[#a69784]">
              Continuous Stream
            </span>
            <h3 className="font-serif text-2xl font-medium text-[#f3efe6] mt-1">
              Sonorous Immobility
            </h3>
            <p className="text-xs leading-relaxed text-[#9c9081] mt-2">
              The extremely slow tempo and unresolved harmonies evoke a hypnotic trance, foreshadowing ambient and repetitive minimalism.
            </p>
          </div>

          {/* Breathing Pacer Bar */}
          <div className="rounded-xl border border-[#2a2521] bg-[#1f1b18] p-4 text-center space-y-2">
            <div className="flex items-center justify-between text-xs text-[#8e8273]">
              <span>Breathing Rhythm</span>
              <span className="font-serif italic text-[#c4a984]">{breathPhase}</span>
            </div>
            <div className="h-1.5 w-full bg-[#2a2622] rounded-full overflow-hidden">
              <div
                className={`h-full bg-[#c4a984] transition-all duration-1000 ${
                  breathPhase === 'Inhale' ? 'w-full' : breathPhase === 'Hold' ? 'w-full opacity-60' : 'w-0'
                }`}
              />
            </div>
          </div>

          <button
            onClick={handleToggleVexations}
            className="w-full py-3 px-6 text-xs font-medium tracking-wide text-[#141210] bg-[#e4cdad] rounded-lg hover:bg-[#edd8be] transition-colors flex items-center justify-center gap-2.5"
          >
            {isCurrentlyPlayingVexations ? (
              <>
                <Pause className="h-4 w-4 fill-current" />
                <span>Pause Vexations</span>
              </>
            ) : (
              <>
                <Play className="h-4 w-4 fill-current" />
                <span>Begin Vexations Meditation</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Historical chronicle of John Cage's 1963 New York performance */}
      <div className="rounded-xl border border-[#26221e] bg-[#141211] p-6 max-w-4xl mx-auto space-y-3 text-xs leading-relaxed text-[#a89d8f]">
        <h4 className="font-serif text-base font-medium text-[#f3efe6]">
          The Mythic Premiere of September 9, 1963 in New York
        </h4>
        <p>
          Unpublished during Satie’s lifetime, <em>Vexations</em> received its complete world premiere organized by composer John Cage at Manhattan's Pocket Theatre. A relay team of ten pianists performed without interruption for 18 hours and 40 minutes, from 6:00 p.m. until 12:40 p.m. the following afternoon. Among the performers were John Cale (later of The Velvet Underground), David Tudor, and Christian Wolff.
        </p>
        <p className="text-[#7d7366]">
          Only a single audience member, actor Paul Zimet, remained seated through the entire duration from start to finish.
        </p>
      </div>
    </div>
  );
};
