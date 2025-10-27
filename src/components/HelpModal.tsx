import React from 'react';
import { X } from './icons';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-blue-500/30 rounded-2xl p-8 w-full max-w-lg relative shadow-2xl shadow-blue-500/10">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          aria-label="Close help modal"
        >
          <X size={24} />
        </button>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-blue-400">Welcome!</h2>
          <p className="text-gray-300 mt-2">Here's how to navigate the lobby:</p>
        </div>

        <div className="space-y-4 text-gray-300">
          <p>
            - <span className="font-semibold text-white">Scroll down</span> to view different avatars. Each one has a unique set of skills and specialties.
          </p>
          <p>
            - Use the <span className="font-semibold text-white">animation controls</span> on each character's card to see them in action.
          </p>
          <p>
            - Click the <span className="font-semibold text-white">"Select Avatar"</span> button to choose a character and proceed.
          </p>
          <p>
            - You can adjust graphics quality and rotation settings in the <span className="font-semibold text-white">Settings</span> menu.
          </p>
          <p>
            - Some avatars are <span className="font-semibold text-amber-400">Premium</span> and require unlocking.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;
