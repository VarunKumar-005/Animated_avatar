import React, { useState } from 'react';
import Hero from './Hero';
import CharacterStage from './CharacterStage';
import SettingsModal from './SettingsModal';
import HelpModal from './HelpModal';
import SoundControl from './SoundControl';
import { CHARACTERS } from '../constants';
import { Settings, HelpCircle } from './icons';

const LandingPage: React.FC = () => {
  const [quality, setQuality] = useState<'low' | 'medium' | 'high'>('high');
  const [autoRotate, setAutoRotate] = useState(true);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  return (
    <div className="bg-slate-950 text-white h-screen overflow-y-scroll snap-y snap-mandatory">
      <div className="snap-start">
        <Hero />
      </div>
      <div className="relative z-10">
        {CHARACTERS.map((character, index) => (
          <div key={character.id} className="h-screen relative snap-start">
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-purple-950/20 to-slate-950 z-0"></div>
            <CharacterStage
              character={character}
              align={index % 2 === 0 ? 'left' : 'right'}
              quality={quality}
              autoRotate={autoRotate}
            />
          </div>
        ))}
      </div>
      <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3">
        <SoundControl />
        <button
          onClick={() => setIsHelpModalOpen(true)}
          className="p-3 text-gray-400 hover:text-white transition-colors rounded-full bg-slate-800/80 backdrop-blur-sm"
          aria-label="Open help"
        >
          <HelpCircle size={24} />
        </button>
        <button
          onClick={() => setIsSettingsModalOpen(true)}
          className="p-3 text-gray-400 hover:text-white transition-colors rounded-full bg-slate-800/80 backdrop-blur-sm"
          aria-label="Open settings"
        >
          <Settings size={24} />
        </button>
      </div>

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        quality={quality}
        setQuality={setQuality}
        autoRotate={autoRotate}
        setAutoRotate={setAutoRotate}
      />
      <HelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />
    </div>
  );
};

export default LandingPage;
