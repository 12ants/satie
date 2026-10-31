import React from 'react';
import { Play, Pause, SkipBack, SkipForward, Shuffle, RefreshCw, Volume2, CloudRain, Disc, Sliders } from 'lucide-react';
import { audioManager } from '../audio/audioManager.ts';
import { RADIO_STATIONS } from '../data/compositions.ts';
import { Visualizer } from './Visualizer.tsx';
import { AudioPlayerState } from '../types/satie.ts';
import { exportToMidi, exportToMp3 } from '../audio/exporter.ts';

interface RadioPlayerProps {
  playerState: AudioPlayerState;
  onOpenRandomizerTab: () => void;
  onOpenMixerTab: () => void;
  onOpenCatalogTab: () => void;
  onOpenGenerativeTab: () => void;
}

export const RadioPlayer: React.FC<RadioPlayerProps> = ({
  playerState,
  onOpenRandomizerTab,
  onOpenMixerTab,
  onOpenCatalogTab,
  onOpenGenerativeTab
}) => {
  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const { randomizer } = playerState;
  const isGenerative = playerState.currentComposition.collection === 'Generative Improvisation';
  const [isExportingMp3, setIsExportingMp3] = React.useState(false);
  const [exportProgress, setExportProgress] = React.useState(0);

  const handleMp3Export = async () => {
    if (isExportingMp3) return;
    try {
      setIsExportingMp3(true);
      setExportProgress(0);
      await exportToMp3(playerState.currentComposition, playerState.randomizer.tempoScale, (p) => setExportProgress(p));
    } catch (err) {
      console.error('Failed to export MP3:', err);
    } finally {
      setIsExportingMp3(false);
      setExportProgress(0);
    }
  };

  return (
    <div className="space-y-3 font-mono text-xs">
      {/* Station Selector Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1.5 rounded border border-[#222222] bg-[#121212]">
        {RADIO_STATIONS.map((station) => {
          const isActive = playerState.currentStation.id === station.id && !isGenerative;
          return (
            <button
              key={station.id}
              onClick={() => audioManager.setStation(station.id)}
              className={`py-1.5 px-2.5 rounded text-left transition-colors flex items-center justify-between ${
                isActive
                  ? 'bg-[#ffffff] text-[#0a0a0a] font-semibold'
                  : 'text-[#777777] hover:text-[#cccccc] hover:bg-[#181818]'
              }`}
            >
              <span className="truncate">{station.frequency} {station.name.toUpperCase()}</span>
              {isActive && playerState.isPlaying && (
                <span className="text-[9px] font-bold">●</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Playback Console */}
      <div className="rounded border border-[#222222] bg-[#101010] p-4 sm:p-5 space-y-4">
        {/* Track Title and Meta Line */}
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-[#1c1c1c] pb-3">
          <div className="min-w-0">
            <div className="flex items-baseline gap-2">
              <h2 className="text-base sm:text-lg font-bold text-[#ffffff] tracking-tight truncate">
                {playerState.currentComposition.title}
              </h2>
              <span className="text-[11px] text-[#666666]">
                [{playerState.currentComposition.year}]
              </span>
              {isGenerative && (
                <span className="text-[10px] font-bold bg-[#ffffff] text-[#0a0a0a] px-1.5 py-0.2 rounded">
                  PROCEDURAL
                </span>
              )}
            </div>

            <div className="text-[11px] text-[#888888] flex items-center gap-2 mt-0.5">
              <span>{playerState.currentComposition.englishMarking || playerState.currentComposition.frenchMarking}</span>
              <span className="text-[#444444]">·</span>
              <span>{playerState.currentComposition.key}</span>
              <span className="text-[#444444]">·</span>
              <span className="uppercase text-[#666666]">{playerState.currentComposition.mood}</span>
            </div>

            {playerState.currentComposition.frenchMarking && isGenerative && (
              <div className="text-[10px] text-[#888888] italic mt-1">
                « {playerState.currentComposition.frenchMarking} »
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1.5 shrink-0">
            <button
              onClick={() => {
                try {
                  exportToMidi(playerState.currentComposition);
                } catch (err) {
                  console.error('MIDI export error:', err);
                }
              }}
              className="px-2 py-0.5 text-[10px] rounded border border-[#333333] bg-[#161616] text-[#cccccc] hover:text-[#ffffff] hover:border-[#555555] transition-colors"
              title="Download Standard MIDI file"
            >
              .MID
            </button>
            <button
              onClick={handleMp3Export}
              disabled={isExportingMp3}
              className={`px-2 py-0.5 text-[10px] rounded border transition-colors ${
                isExportingMp3
                  ? 'bg-[#2a2a2a] text-[#ffffff] border-[#666666] cursor-wait'
                  : 'border-[#333333] bg-[#161616] text-[#cccccc] hover:text-[#ffffff] hover:border-[#555555]'
              }`}
              title="Render and download MP3 audio"
            >
              {isExportingMp3 ? `MP3 ${exportProgress}%` : '.MP3'}
            </button>
            <button
              onClick={onOpenGenerativeTab}
              className="px-2 py-0.5 text-[10px] rounded border border-[#444444] bg-[#202020] text-[#ffffff] hover:bg-[#2a2a2a] transition-colors"
            >
              GENERATIVE STUDIO →
            </button>
            <button
              onClick={() => audioManager.setEngine(playerState.engine === 'felt-piano' ? 'archival' : 'felt-piano')}
              className="px-2 py-0.5 text-[10px] rounded border border-[#333333] bg-[#181818] text-[#cccccc] hover:text-[#ffffff]"
            >
              {playerState.engine === 'felt-piano' ? 'FELT PIANO' : 'ARCHIVAL'}
            </button>
          </div>
        </div>

        {/* Minimal Progress Scrubber */}
        <div className="space-y-1.5">
          <input
            type="range"
            min="0"
            max={playerState.duration || 100}
            value={playerState.currentTime}
            onChange={(e) => audioManager.seek(parseFloat(e.target.value))}
            className="w-full cursor-pointer h-1 bg-[#222222] rounded"
          />
          <div className="flex justify-between text-[11px] text-[#666666] tabular-nums">
            <span>{formatTime(playerState.currentTime)}</span>
            <span>{formatTime(playerState.duration)}</span>
          </div>
        </div>

        {/* Transport & Randomizer Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => audioManager.playPreviousInRadio()}
              className="p-2 text-[#777777] hover:text-[#ffffff] rounded border border-[#222222] bg-[#141414] transition-colors"
              title="Previous"
            >
              <SkipBack className="h-4 w-4" />
            </button>

            <button
              onClick={() => audioManager.togglePlay()}
              className="flex h-9 px-4 items-center justify-center gap-1.5 rounded font-bold text-[#0a0a0a] bg-[#ffffff] hover:bg-[#e0e0e0] active:scale-[0.98] transition-all"
            >
              {playerState.isPlaying ? (
                <>
                  <Pause className="h-4 w-4 fill-current" />
                  <span>PAUSE</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 fill-current ml-0.5" />
                  <span>PLAY</span>
                </>
              )}
            </button>

            <button
              onClick={() => audioManager.playNextInRadio()}
              className="p-2 text-[#777777] hover:text-[#ffffff] rounded border border-[#222222] bg-[#141414] transition-colors"
              title="Next"
            >
              <SkipForward className="h-4 w-4" />
            </button>
          </div>

          {/* Randomizer & Generative Quick Controls */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => audioManager.generateImprovisation()}
              className="px-2.5 py-1.5 text-[11px] rounded border border-[#ffffff] bg-[#ffffff] text-[#0a0a0a] font-bold hover:bg-[#e0e0e0] transition-colors flex items-center gap-1"
              title="Generate new original movement"
            >
              <RefreshCw className="h-3 w-3" />
              <span>IMPROVISE</span>
            </button>

            <button
              onClick={() => audioManager.updateRandomizer({ shuffle: !randomizer.shuffle })}
              className={`px-2.5 py-1.5 text-[11px] rounded border transition-colors flex items-center gap-1.5 ${
                randomizer.shuffle
                  ? 'bg-[#222222] text-[#ffffff] border-[#444444] font-medium'
                  : 'bg-[#141414] text-[#666666] border-[#222222] hover:text-[#cccccc]'
              }`}
              title="Toggle Shuffle"
            >
              <Shuffle className="h-3 w-3" />
              <span>SHUFFLE</span>
            </button>

            <button
              onClick={onOpenRandomizerTab}
              className="px-2 py-1.5 text-[10px] text-[#777777] hover:text-[#cccccc] rounded border border-[#222222] bg-[#141414]"
              title="Shuffle & Randomizer settings"
            >
              MODE:{randomizer.mode.toUpperCase()}
            </button>
          </div>
        </div>

        {/* Minimal Monochrome Oscilloscope */}
        <Visualizer isPlaying={playerState.isPlaying} />

        {/* Quick Inline Sound Adjustments */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-[#1c1c1c] text-[11px]">
          <div className="flex items-center justify-between p-2 rounded bg-[#141414] border border-[#222222]">
            <span className="text-[#666666] flex items-center gap-1">
              <CloudRain className="h-3 w-3" /> RAIN
            </span>
            <button
              onClick={() => audioManager.setRainVolume(playerState.rainVolume > 0 ? 0 : 0.25)}
              className="text-[#ffffff] hover:underline"
            >
              {Math.round(playerState.rainVolume * 100)}%
            </button>
          </div>

          <div className="flex items-center justify-between p-2 rounded bg-[#141414] border border-[#222222]">
            <span className="text-[#666666] flex items-center gap-1">
              <Disc className="h-3 w-3" /> VINYL
            </span>
            <button
              onClick={() => audioManager.setVinylVolume(playerState.vinylVolume > 0 ? 0 : 0.2)}
              className="text-[#ffffff] hover:underline"
            >
              {Math.round(playerState.vinylVolume * 100)}%
            </button>
          </div>

          <div className="flex items-center justify-between p-2 rounded bg-[#141414] border border-[#222222]">
            <span className="text-[#666666]">FELT MUTE</span>
            <button
              onClick={() => audioManager.setFeltDampened(!playerState.feltDampened)}
              className="text-[#ffffff] font-semibold hover:underline"
            >
              {playerState.feltDampened ? 'ON' : 'OFF'}
            </button>
          </div>

          <div className="flex items-center justify-between p-2 rounded bg-[#141414] border border-[#222222]">
            <span className="text-[#666666] flex items-center gap-1">
              <Volume2 className="h-3 w-3" /> VOL
            </span>
            <span className="text-[#ffffff] tabular-nums">
              {Math.round(playerState.volume * 100)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
