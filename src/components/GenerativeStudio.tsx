import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, Download, Bookmark, Trash2, Play, Pause, Check } from 'lucide-react';
import { audioManager } from '../audio/audioManager.ts';
import { exportToMidi, exportToMp3 } from '../audio/exporter.ts';
import { getSavedTunes, saveTune, removeSavedTune } from '../utils/savedTunes.ts';
import { AudioPlayerState, GenerativeArchetype, Composition } from '../types/satie.ts';

interface GenerativeStudioProps {
  playerState: AudioPlayerState;
}

export const GenerativeStudio: React.FC<GenerativeStudioProps> = ({ playerState }) => {
  const { generative } = playerState.randomizer;
  const isGenerativeActive = playerState.randomizer.mode === 'generative';
  const current = playerState.currentComposition;

  const [savedList, setSavedList] = useState<Composition[]>([]);
  const [isExportingMp3, setIsExportingMp3] = useState(false);
  const [mp3Progress, setMp3Progress] = useState(0);
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    setSavedList(getSavedTunes());
  }, []);

  const handleSaveCurrent = () => {
    const success = saveTune(current);
    if (success) {
      setSavedList(getSavedTunes());
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2000);
    }
  };

  const handleDeleteSaved = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeSavedTune(id);
    setSavedList(getSavedTunes());
  };

  const handleExportMidi = () => {
    try {
      exportToMidi(current);
    } catch (err) {
      console.error('MIDI export error:', err);
    }
  };

  const handleExportMp3 = async () => {
    if (isExportingMp3) return;
    try {
      setIsExportingMp3(true);
      setMp3Progress(0);
      await exportToMp3(current, playerState.randomizer.tempoScale, (p) => setMp3Progress(p));
    } catch (err) {
      console.error('MP3 export error:', err);
    } finally {
      setIsExportingMp3(false);
      setMp3Progress(0);
    }
  };

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

      {/* Current Piece Save & Export Toolbar */}
      <div className="p-3 rounded border border-[#2a2a2a] bg-[#161616] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[#888888]">CURRENT PIECE:</span>
            <span className="font-bold text-[#ffffff] truncate">{current.title}</span>
            <span className="text-[10px] text-[#666666]">[{current.key}]</span>
          </div>
          {current.frenchMarking && (
            <div className="text-[10px] text-[#888888] italic truncate">
              « {current.frenchMarking} »
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5 shrink-0">
          <button
            onClick={handleSaveCurrent}
            className="px-2.5 py-1 text-[11px] rounded border border-[#333333] bg-[#1c1c1c] text-[#cccccc] hover:text-[#ffffff] hover:border-[#555555] transition-colors flex items-center gap-1"
            title="Save to local library"
          >
            {justSaved ? <Check className="h-3 w-3 text-green-400" /> : <Bookmark className="h-3 w-3" />}
            <span>{justSaved ? 'SAVED' : 'SAVE TUNE'}</span>
          </button>

          <button
            onClick={handleExportMidi}
            className="px-2.5 py-1 text-[11px] rounded border border-[#333333] bg-[#1c1c1c] text-[#cccccc] hover:text-[#ffffff] hover:border-[#555555] transition-colors flex items-center gap-1"
            title="Download Standard MIDI file"
          >
            <Download className="h-3 w-3" />
            <span>EXPORT .MID</span>
          </button>

          <button
            onClick={handleExportMp3}
            disabled={isExportingMp3}
            className={`px-2.5 py-1 text-[11px] font-bold rounded transition-colors flex items-center gap-1 ${
              isExportingMp3
                ? 'bg-[#333333] text-[#888888] cursor-wait'
                : 'bg-[#ffffff] text-[#0a0a0a] hover:bg-[#e0e0e0]'
            }`}
            title="Render offline and download MP3 audio"
          >
            <Download className="h-3 w-3" />
            <span>{isExportingMp3 ? `ENCODING ${mp3Progress}%` : 'EXPORT .MP3'}</span>
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

      {/* Textural Controls: Ornamentation, Register, and Target Runtime */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Melodic Ornamentation */}
        <div className="p-3.5 rounded border border-[#222222] bg-[#121212] space-y-2">
          <div className="flex items-center justify-between text-[#888888]">
            <span>ORNAMENTATION</span>
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
                {r === 'mid' ? 'MID' : r === 'high' ? 'HIGH' : 'FULL'}
              </button>
            ))}
          </div>
        </div>

        {/* Target Runtime */}
        <div className="p-3.5 rounded border border-[#222222] bg-[#121212] space-y-2">
          <div className="flex items-center justify-between text-[#888888]">
            <span>TARGET RUNTIME</span>
            <span className="text-[10px] text-[#555555]">
              {Math.floor((generative.targetDuration || 160) / 60)}:{String((generative.targetDuration || 160) % 60).padStart(2, '0')}
            </span>
          </div>

          <div className="grid grid-cols-4 gap-1.5">
            {[
              { sec: 120, label: '2:00' },
              { sec: 150, label: '2:30' },
              { sec: 180, label: '3:00' },
              { sec: 240, label: '4:00' }
            ].map(({ sec, label }) => {
              const currentDur = generative.targetDuration || 160;
              const isSelected = currentDur === sec;
              return (
                <button
                  key={sec}
                  onClick={() => {
                    audioManager.updateGenerativeSettings({ targetDuration: sec });
                    audioManager.generateImprovisation();
                  }}
                  className={`py-1.5 text-[10px] rounded border transition-colors ${
                    isSelected
                      ? 'bg-[#ffffff] text-[#0a0a0a] border-[#ffffff] font-bold'
                      : 'bg-[#161616] text-[#777777] border-[#222222] hover:text-[#cccccc]'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Saved Procedural Library */}
      {savedList.length > 0 && (
        <div className="p-3.5 rounded border border-[#222222] bg-[#121212] space-y-2.5">
          <div className="flex items-center justify-between text-[#888888]">
            <span>SAVED PROCEDURAL ARCHIVE ({savedList.length})</span>
            <span className="text-[10px] text-[#555555]">LOCAL REPOSITORY</span>
          </div>

          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {savedList.map((item) => {
              const isPlayingThis = playerState.isPlaying && playerState.currentComposition.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => audioManager.play(item)}
                  className={`flex items-center justify-between p-2 rounded border border-[#222222] hover:bg-[#181818] cursor-pointer transition-colors ${
                    playerState.currentComposition.id === item.id ? 'bg-[#1a1a1a] border-[#444444]' : 'bg-[#141414]'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isPlayingThis) audioManager.pause();
                        else audioManager.play(item);
                      }}
                      className="p-1 text-[#888888] hover:text-[#ffffff]"
                    >
                      {isPlayingThis ? <Pause className="h-3 w-3 fill-current" /> : <Play className="h-3 w-3 fill-current" />}
                    </button>
                    <div className="truncate">
                      <span className="text-[#ffffff] font-medium">{item.title}</span>
                      <span className="text-[#666666] text-[10px] ml-2">[{item.key}]</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        exportToMidi(item);
                      }}
                      className="px-1.5 py-0.5 text-[9px] rounded border border-[#333333] text-[#888888] hover:text-[#ffffff]"
                      title="Download MIDI"
                    >
                      .MID
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        exportToMp3(item, playerState.randomizer.tempoScale);
                      }}
                      className="px-1.5 py-0.5 text-[9px] rounded border border-[#333333] text-[#888888] hover:text-[#ffffff]"
                      title="Download MP3"
                    >
                      .MP3
                    </button>
                    <button
                      onClick={(e) => handleDeleteSaved(item.id, e)}
                      className="p-1 text-[#666666] hover:text-red-400"
                      title="Delete"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
