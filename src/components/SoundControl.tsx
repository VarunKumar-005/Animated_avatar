import React, { useState } from 'react';
import { Volume2, VolumeX } from './icons';

const SoundControl: React.FC = () => {
  const [isMuted, setIsMuted] = useState(true);

  return (
    <button
      onClick={() => setIsMuted(!isMuted)}
      className="p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-slate-800"
      aria-label={isMuted ? 'Unmute sound' : 'Mute sound'}
    >
      {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
    </button>
  );
};

export default SoundControl;
