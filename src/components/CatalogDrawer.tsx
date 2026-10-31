import React, { useState } from 'react';
import { Play, Pause, Search } from 'lucide-react';
import { COMPOSITIONS } from '../data/compositions.ts';
import { audioManager } from '../audio/audioManager.ts';
import { AudioPlayerState, CompositionMood } from '../types/satie.ts';

interface CatalogDrawerProps {
  playerState: AudioPlayerState;
}

export const CatalogDrawer: React.FC<CatalogDrawerProps> = ({ playerState }) => {
  const [filterMood, setFilterMood] = useState<'all' | CompositionMood>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = COMPOSITIONS.filter((c) => {
    const matchesMood = filterMood === 'all' || c.mood === filterMood;
    const matchesSearch = searchQuery === '' ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.collection.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.key.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesMood && matchesSearch;
  });

  return (
    <div className="space-y-3 font-mono text-xs">
      {/* Search and Mood Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded border border-[#222222] bg-[#121212]">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <Search className="h-3.5 w-3.5 text-[#666666]" />
          <input
            type="text"
            placeholder="FILTER TUNES..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-[#ffffff] placeholder-[#555555] text-xs focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto">
          {(['all', 'ambient', 'melancholy', 'mystical', 'eccentric'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setFilterMood(m)}
              className={`px-2 py-0.5 text-[10px] rounded border uppercase transition-colors whitespace-nowrap ${
                filterMood === m
                  ? 'bg-[#ffffff] text-[#0a0a0a] border-[#ffffff] font-semibold'
                  : 'bg-[#161616] text-[#777777] border-[#222222] hover:text-[#cccccc]'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Monospace Dense Table */}
      <div className="rounded border border-[#222222] bg-[#101010] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#222222] text-[#666666] text-[10px]">
                <th className="py-2 px-3 w-10">ACT</th>
                <th className="py-2 px-3">TITLE</th>
                <th className="py-2 px-3 hidden md:table-cell">COLLECTION</th>
                <th className="py-2 px-3 hidden sm:table-cell">KEY</th>
                <th className="py-2 px-3 hidden sm:table-cell">MOOD</th>
                <th className="py-2 px-3 text-right">TIME</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#181818]">
              {filtered.map((comp) => {
                const isPlayingThis = playerState.isPlaying && playerState.currentComposition.id === comp.id;

                return (
                  <tr
                    key={comp.id}
                    onClick={() => audioManager.play(comp)}
                    className={`cursor-pointer transition-colors hover:bg-[#181818] ${
                      playerState.currentComposition.id === comp.id ? 'bg-[#161616]' : ''
                    }`}
                  >
                    <td className="py-2 px-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (playerState.currentComposition.id === comp.id) {
                            audioManager.togglePlay();
                          } else {
                            audioManager.play(comp);
                          }
                        }}
                        className={`h-6 w-6 rounded flex items-center justify-center transition-colors ${
                          isPlayingThis
                            ? 'bg-[#ffffff] text-[#0a0a0a]'
                            : 'text-[#888888] hover:text-[#ffffff]'
                        }`}
                      >
                        {isPlayingThis ? (
                          <Pause className="h-3 w-3 fill-current" />
                        ) : (
                          <Play className="h-3 w-3 fill-current ml-0.5" />
                        )}
                      </button>
                    </td>

                    <td className="py-2 px-3">
                      <div className="text-[#ffffff] font-medium truncate max-w-[220px] sm:max-w-none">
                        {comp.title}
                      </div>
                      <div className="text-[10px] text-[#666666] truncate">
                        {comp.englishMarking || comp.frenchMarking}
                      </div>
                    </td>

                    <td className="py-2 px-3 text-[#777777] hidden md:table-cell text-[11px]">
                      {comp.collection}
                    </td>

                    <td className="py-2 px-3 text-[#777777] hidden sm:table-cell text-[11px]">
                      {comp.key}
                    </td>

                    <td className="py-2 px-3 text-[#777777] hidden sm:table-cell uppercase text-[10px]">
                      {comp.mood}
                    </td>

                    <td className="py-2 px-3 text-right text-[#888888] tabular-nums text-[11px]">
                      {comp.durationFormatted}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
