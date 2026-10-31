import React, { useState, useEffect } from 'react';
import { audioManager } from './audio/audioManager.ts';
import { AudioPlayerState } from './types/satie.ts';
import { Header } from './components/Header.tsx';
import { RadioPlayer } from './components/RadioPlayer.tsx';
import { CatalogDrawer } from './components/CatalogDrawer.tsx';
import { RandomizerPanel } from './components/RandomizerPanel.tsx';
import { GenerativeStudio } from './components/GenerativeStudio.tsx';
import { AmbientMixer } from './components/AmbientMixer.tsx';
import { SleepTimerModal } from './components/SleepTimerModal.tsx';

export default function App() {
  const [playerState, setPlayerState] = useState<AudioPlayerState>(audioManager.getState());
  const [activeTab, setActiveTab] = useState<'broadcast' | 'catalog' | 'mixer' | 'randomizer' | 'generative'>('broadcast');
  const [isSleepModalOpen, setIsSleepModalOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = audioManager.subscribe((state) => {
      setPlayerState(state);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0a] text-[#ededed] font-mono selection:bg-[#ffffff]/20">
      {/* Compact Monospace Top Navigation */}
      <Header
        playerState={playerState}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSleepTimer={() => setIsSleepModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4">
        {activeTab === 'broadcast' && (
          <RadioPlayer
            playerState={playerState}
            onOpenRandomizerTab={() => setActiveTab('randomizer')}
            onOpenMixerTab={() => setActiveTab('mixer')}
            onOpenCatalogTab={() => setActiveTab('catalog')}
            onOpenGenerativeTab={() => setActiveTab('generative')}
          />
        )}

        {activeTab === 'catalog' && (
          <CatalogDrawer playerState={playerState} />
        )}

        {activeTab === 'generative' && (
          <GenerativeStudio playerState={playerState} />
        )}

        {activeTab === 'randomizer' && (
          <RandomizerPanel playerState={playerState} />
        )}

        {activeTab === 'mixer' && (
          <AmbientMixer
            playerState={playerState}
            onOpenSleepTimer={() => setIsSleepModalOpen(true)}
          />
        )}
      </main>

      {/* Sleep Timer Modal */}
      <SleepTimerModal
        isOpen={isSleepModalOpen}
        onClose={() => setIsSleepModalOpen(false)}
        playerState={playerState}
      />

      {/* Minimal Monospace Status Footer */}
      <footer className="w-full border-t border-[#1a1a1a] bg-[#0c0c0c] py-2.5 px-4 text-[10px] text-[#555555]">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[#888888]">RADIO SATIE</span>
            <span>//</span>
            <span>FREQ: {playerState.currentStation.frequency} MHz</span>
            <span>//</span>
            <span>{playerState.engine.toUpperCase()}</span>
          </div>

          <div className="flex items-center gap-3">
            <span>SHUFFLE: {playerState.randomizer.shuffle ? 'ON' : 'OFF'}</span>
            <span>//</span>
            <span>TEMPO: {playerState.randomizer.tempoScale}X</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
