import React from 'react';
import { X } from './icons';

type Quality = 'low' | 'medium' | 'high';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  quality: Quality;
  setQuality: (quality: Quality) => void;
  autoRotate: boolean;
  setAutoRotate: (autoRotate: boolean) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, quality, setQuality, autoRotate, setAutoRotate }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-purple-500/30 rounded-2xl p-8 w-full max-w-md relative shadow-2xl shadow-purple-500/10">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          aria-label="Close settings modal"
        >
          <X size={24} />
        </button>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-purple-400">Settings</h2>
          <p className="text-gray-300 mt-2">Adjust your experience</p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="text-sm text-gray-400 block mb-2">Graphics Quality</label>
            <div className="flex justify-between bg-slate-800 rounded-lg p-1">
              {(['low', 'medium', 'high'] as Quality[]).map((q) => (
                <button
                  key={q}
                  onClick={() => setQuality(q)}
                  className={`w-1/3 py-2 rounded-md text-sm font-semibold transition-all ${quality === q ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-slate-700'}`}
                >
                  {q.charAt(0).toUpperCase() + q.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center">
              <label htmlFor="autoRotate" className="text-sm text-gray-400">Auto-Rotate Avatars</label>
              <button
                role="switch"
                aria-checked={autoRotate}
                onClick={() => setAutoRotate(!autoRotate)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${autoRotate ? 'bg-purple-600' : 'bg-slate-700'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${autoRotate ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
