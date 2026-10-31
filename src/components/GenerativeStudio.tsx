import React from 'react';
import { Sparkles, Play, RefreshCw, Radio, Sliders } from 'lucide-react';
import { audioManager } from '../audio/audioManager.ts';
import { AudioPlayerState, GenerativeArchetype } from '../types/satie.ts';

interface GenerativeStudioProps {
  playerState: AudioPlayerState;
}

export const GenerativeStudio: React.FC<GenerativeStudioProps> = ({ playerState }) => {
  const { generative } = playerState.randomizer;
  const isGenerativeActive = playerState.randomizer.mode === 'generative';

  const archetypes: Array<{ id: GenerativeArchetype | 'auto-cycle'; label: string; desc: string }> = [
    { id: 'gymnopedique', label: 'GYMNOPÉDIE', desc: '3/4 waltz pedal bass, maj7/min9 chords, sparse melody' },
    { id: 'gnossien', label: 'GNOSSIENNE', desc: 'Free-meter modal drone, oriental flourishes, suspended pauses' },
    { id: 'ogive', label: 'OGIVE', desc: 'Monophonic plainchant answered by massive cathedral block chords' },
    { id: 'ameublement', label: 'AMEUBLEMENT', desc: 'Hypnotic repetitive ostinato tapestry, ambient furniture texture' },
    { id: 'vexations', label: 'VEXATIONS', desc: 'Micro-chromatic altered chords, cyclical meditative silence' },
    { id: 'auto-cycle', label: 'AUTO-CYCLE', desc: 'Fluidly morphs between all 5 Satie compositional archetypes' }
  ];

  const keys = ['auto', 'D', 'G', 'C', 'E', 'A', 'F'] as const;
  const modes = ['auto', 'dorian', 'aeolian', 'lydian', 'phrygian'] as const;
  const densities = [
    { id: 'sparse' as const, label: 'SPARSE (HIGH SILENCE)' },
    { id: 'balanced' as const, label: 'BALANCED' },
    { id: 'rich' as const, label: 'RICH (EXPANSIVE)' }
  ];
  const ornaments = [0.0, 0.3, 0.6, 0.9];

  return (
    <div className="space-y-3 font-mono text-xs">
      {/* Top Banner and Quick Generation Action */}
      <div className="p-3.5 rounded border border-[#222222] bg-[#121212] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#ffffff]" />
            <span className="font-semibold text-[#ffffff] tracking-wider">
              GENERATIVE SATIE IMPROVISER
            </span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
              isGenerativeActive
                ? 'bg-[#ffffff] text-[#0a0a0a] border-[#ffffff] font-bold'
                : 'text-[#666666] border-[#222222]'
            }`}>
              {isGenerativeActive ? 'ACTIVE STREAM' : 'STANDBY'}
            </span>
          </div>
          <p className="text-[10px] text-[#666666] mt-1">
            Real-time algorithmic piano composition adhering to Erik Satie's modal voice-leading rules
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => audioManager.generateImprovisation()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-[#0a0a0a] bg-[#ffffff] rounded hover:bg-[#e0e0e0] transition-colors whitespace-nowrap"
          >
            <RefreshCw className="h-3 w-3" />
            <span>GENERATE NEW PIECE</span>
          </button>
        </div>
      </div>

      {/* Archetype Selector Strip */}
      <div className="p-3.5 rounded border border-[#222222] bg-[#121212] space-y-2.5">
        <div className="flex items-center justify-between text-[#888888]">
          <span>COMPOSITIONAL ARCHETYPE</span>
          <span className="text-[10px] text-[#555555]">SELECTED: {generative.archetype.toUpperCase()}</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1.5">
          {archetypes.map((arch) => {
            const isSelected = generative.archetype === arch.id;
            return (
              <button
                key={arch.id}
                onClick={() => {
                  audioManager.updateGenerativeSettings({ archetype: arch.id });
                  if (arch.id !== 'auto-cycle') {
                    audioManager.generateImprovisation(arch.id);
                  } else {
                    audioManager.generateImprovisation();
                  }
                }}
                className={`py-2 px-2 rounded border text-center transition-colors ${
                  isSelected
                    ? 'bg-[#ffffff] text-[#0a0a0a] border-[#ffffff] font-bold'
                    : 'bg-[#161616] text-[#777777] border-[#222222] hover:text-[#cccccc]'
                }`}
              >
                <div className="text-[11px] truncate">{arch.label}</div>
              </button>
            );
          })}
        </div>

        <p className="text-[10px] text-[#666666]">
          {archetypes.find((a) => a.id === generative.archetype)?.desc}
        </p>
      </div>

      {/* Currently Playing Improvisation Readout if Generative */}
      {playerState.currentComposition.collection === 'Generative Improvisation' && (
        <div className="p-3 rounded border border-[#333333] bg-[#151515] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="text-[#ffffff] font-bold flex items-center gap-2">
              <span>{playerState.currentComposition.title}</span>
              <span className="text-[10px] text-[#777777]">[{playerState.currentComposition.key}]</span>
            </div>
            <div className="text-[11px] text-[#888888] italic mt-0.5">
              « {playerState.currentComposition.frenchMarking} »
            </div>
          </div>
          <div className="text-[10px] text-[#666666] tabular-nums sm:text-right">
            <div>NOTES: {playerState.currentComposition.score?.length || 0} EVENTS</div>
            <div>TEMPO: {playerState.currentComposition.bpm} BPM ({playerState.currentComposition.timeSignature})</div>
          </div>
        </div>
      )}

      {/* Deep Generative Parameter Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Root Key Palette */}
        <div className="p-3.5 rounded border border-[#222222] bg-[#121212] space-y-2">
          <div className="flex items-center justify-between text-[#888888]">
            <span>TONAL ROOT</span>
            <span className="text-[10px] text-[#555555]">{generative.rootKey.toUpperCase()}</span>
          </div>

          <div className="grid grid-cols-4 gap-1">
            {keys.map((k) => (
              <button
                key={k}
                onClick={() => {
                  audioManager.updateGenerativeSettings({ rootKey: k });
                  audioManager.generateImprovisation();
                }}
                className={`py-1 text-[10px] rounded border transition-colors ${
                  generative.rootKey === k
                    ? 'bg-[#ffffff] text-[#0a0a0a] border-[#ffffff] font-bold'
                    : 'bg-[#161616] text-[#777777] border-[#222222] hover:text-[#cccccc]'
                }`}
              >
                {k.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Modal Harmony */}
        <div className="p-3.5 rounded border border-[#222222] bg-[#121212] space-y-2">
          <div className="flex items-center justify-between text-[#888888]">
            <span>MODAL HARMONY</span>
            <span className="text-[10px] text-[#555555]">{generative.mode.toUpperCase()}</span>
          </div>

          <div className="grid grid-cols-2 gap-1">
            {modes.map((m) => (
              <button
                key={m}
                onClick={() => {
                  audioManager.updateGenerativeSettings({ mode: m });
                  audioManager.generateImprovisation();
                }}
                className={`py-1 text-[10px] rounded border uppercase transition-colors ${
                  generative.mode === m
                    ? 'bg-[#ffffff] text-[#0a0a0a] border-[#ffffff] font-bold'
                    : 'bg-[#161616] text-[#777777] border-[#222222] hover:text-[#cccccc]'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Note Density */}
        <div className="p-3.5 rounded border border-[#222222] bg-[#121212] space-y-2">
          <div className="flex items-center justify-between text-[#888888]">
            <span>NOTE DENSITY</span>
            <span className="text-[10px] text-[#555555]">{generative.density.toUpperCase()}</span>
          </div>

          <div className="space-y-1">
            {densities.map((d) => (
              <button
                key={d.id}
                onClick={() => {
                  audioManager.updateGenerativeSettings({ density: d.id });
                  audioManager.generateImprovisation();
                }}
                className={`w-full py-1 px-2 text-[10px] rounded border text-left transition-colors ${
                  generative.density === d.id
                    ? 'bg-[#ffffff] text-[#0a0a0a] border-[#ffffff] font-bold'
                    : 'bg-[#161616] text-[#777777] border-[#222222] hover:text-[#cccccc]'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Textural Controls: Ornamentation and Register */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Melodic Ornamentation */}
        <div className="p-3.5 rounded border border-[#222222] bg-[#121212] space-y-2">
          <div className="flex items-center justify-between text-[#888888]">
            <span>SATIE ORNAMENTATION PROBABILITY</span>
            <span className="text-[10px] text-[#555555]">{Math.round(generative.ornamentation * 100)}%</span>
          </div>

          <div className="grid grid-cols-4 gap-1.5">
            {ornaments.map((orn) => (
              <button
                key={orn}
                onClick={() => {
                  audioManager.updateGenerativeSettings({ ornamentation: orn });
                  audioManager.generateImprovisation();
                }}
                className={`py-1.5 text-[10px] rounded border transition-colors ${
                  generative.ornamentation === orn
                    ? 'bg-[#ffffff] text-[#0a0a0a] border-[#ffffff] font-bold'
                    : 'bg-[#161616] text-[#777777] border-[#222222] hover:text-[#cccccc]'
                }`}
              >
                {Math.round(orn * 100)}%
              </button>
            ))}
          </div>
          <p className="text-[9px] text-[#555555]">
            Controls the frequency of characteristic grace notes, appoggiaturas, and modal turns.
          </p>
        </div>

        {/* Melodic Register */}
        <div className="p-3.5 rounded border border-[#222222] bg-[#121212] space-y-2">
          <div className="flex items-center justify-between text-[#888888]">
            <span>REGISTER VOICING</span>
            <span className="text-[10px] text-[#555555]">{generative.register.toUpperCase()}</span>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            {(['mid', 'high', 'full'] as const).map((r) => (
              <button
                key={r}
                onClick={() => {
                  audioManager.updateGenerativeSettings({ register: r });
                  audioManager.generateImprovisation();
                }}
                className={`py-1.5 text-[10px] rounded border uppercase transition-colors ${
                  generative.register === r
                    ? 'bg-[#ffffff] text-[#0a0a0a] border-[#ffffff] font-bold'
                    : 'bg-[#161616] text-[#777777] border-[#222222] hover:text-[#cccccc]'
                }`}
              >
                {r === 'mid' ? 'MID-WARM' : r === 'high' ? 'HIGH-SHIMMER' : 'FULL RANGE'}
              </button>
            ))}
          </div>
          <p className="text-[9px] text-[#555555]">
            Dictates pitch spread across bass octave 2 up to crystalline octave 6.
          </p>
        </div>
      </div>
    </div>
  );
};
