import React, { useState } from 'react';
import type { Character } from '../types';
import { X } from './icons';

interface PurchaseModalProps {
  character: Character;
  onClose: () => void;
  onUnlock: (characterId: string) => void;
}

const PurchaseModal: React.FC<PurchaseModalProps> = ({ character, onClose, onUnlock }) => {
  const [transactionId, setTransactionId] = useState('');
  const [status, setStatus] = useState<'idle' | 'verifying' | 'verified'>('idle');
  const [error, setError] = useState('');

  const handleVerify = () => {
    if (!transactionId.trim()) {
      setError('Please enter a valid Transaction ID.');
      return;
    }
    setError('');
    setStatus('verifying');
    // Simulate API call
    setTimeout(() => {
      setStatus('verified');
      setTimeout(() => {
        onUnlock(character.id);
        onClose();
      }, 1000);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-8 w-full max-w-md relative shadow-2xl shadow-amber-500/10">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          aria-label="Close purchase modal"
        >
          <X size={24} />
        </button>

        <div className="text-center">
          <h2 className="text-2xl font-bold text-amber-400">Unlock Premium Avatar</h2>
          <p className="text-gray-300 mt-2">
            Get exclusive access to <span className="font-semibold text-white">{character.name}</span>
          </p>
        </div>

        <div className="my-6 p-4 bg-slate-800 rounded-lg text-center">
            <p className="text-sm text-gray-400">Total Amount</p>
            <p className="text-4xl font-bold text-white">${character.price?.toFixed(2)}</p>
        </div>

        <div className="space-y-4">
            <div>
                <label className="text-sm text-gray-400 block mb-2 text-center">Scan to pay with any UPI app</label>
                <div className="bg-white p-2 rounded-lg max-w-[200px] mx-auto">
                    {/* Placeholder QR Code */}
                    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                        <path fill="#0f172a" d="M0 0h200v200H0z"/>
                        <path fill="#FFF" d="M40 40h40v40H40zm80 0h40v40h-40zM40 120h40v40H40zm80 80h40v-40h-40zm0-40h40v-40h-40zM90 90h20v20H90z"/>
                        <path fill="#FFF" d="M120 40h-20v20h20V40zm20 20h20V40h-20v20zm-20 20V60h20v20h-20zM40 120v20H20v-20h20zm0-20H20v20h20v-20zm0 20v20H20v-20h20z"/>
                    </svg>
                </div>
            </div>
            <div>
                 <label htmlFor="txnId" className="text-sm text-gray-400 block mb-1">Enter UPI Transaction ID</label>
                 <input 
                    id="txnId"
                    type="text"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="e.g., T1234567890"
                    className="w-full bg-slate-800 text-white rounded px-3 py-2 text-sm border border-purple-500/20 focus:ring-amber-500 focus:border-amber-500"
                 />
                 {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
            </div>
        </div>

        <div className="mt-6">
          <button
            onClick={handleVerify}
            disabled={status !== 'idle'}
            className="w-full py-3 rounded-lg font-semibold text-slate-900 bg-amber-400 hover:bg-amber-300 transition-all disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {status === 'idle' && 'Verify Purchase'}
            {status === 'verifying' && <> <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-slate-900 mr-2"></div> Verifying...</>}
            {status === 'verified' && 'Unlocked!'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PurchaseModal;