'use client';

import React, { useState, useEffect } from 'react';
import { X, Key, Shield, Check, Eye, EyeOff } from 'lucide-react';

interface ByokModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ByokModal: React.FC<ByokModalProps> = ({ isOpen, onClose }) => {
  const [falKey, setFalKey] = useState('');
  const [replicateKey, setReplicateKey] = useState('');
  const [higgsfieldKey, setHiggsfieldKey] = useState('');
  const [showKeys, setShowKeys] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setFalKey(localStorage.getItem('kinobeat_fal_key') || '');
      setReplicateKey(localStorage.getItem('kinobeat_replicate_key') || '');
      setHiggsfieldKey(localStorage.getItem('kinobeat_higgsfield_key') || '');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    localStorage.setItem('kinobeat_fal_key', falKey);
    localStorage.setItem('kinobeat_replicate_key', replicateKey);
    localStorage.setItem('kinobeat_higgsfield_key', higgsfieldKey);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-xl bg-[#12161F] border border-[#1E2638] shadow-2xl overflow-hidden text-zinc-100 font-sans">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1E2638] bg-[#161B26]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-md bg-zinc-800 border border-zinc-700 text-zinc-200">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold tracking-tight text-zinc-100">Inference API Keys (BYOK)</h2>
              <p className="text-[11px] text-zinc-400">Stored locally in your browser sandbox</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Security Notice */}
        <div className="px-5 py-2.5 bg-[#0D1119] border-b border-[#1E2638] flex items-center gap-2 text-[11px] text-zinc-400">
          <Shield className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
          <span>Zero Server Relay: API keys are used directly for client-side inference requests.</span>
        </div>

        {/* Body */}
        <div className="p-5 space-y-3.5 text-xs">
          <div>
            <label className="block text-[11px] font-medium text-zinc-400 mb-1">
              Fal.ai API Key (Flux / Kling / Wan)
            </label>
            <input
              type={showKeys ? 'text' : 'password'}
              value={falKey}
              onChange={(e) => setFalKey(e.target.value)}
              placeholder="fal_key_..."
              className="w-full bg-[#0D1119] border border-[#1E2638] rounded-md p-2 text-xs text-zinc-200 font-mono focus:outline-none focus:border-zinc-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-zinc-400 mb-1">
              Higgsfield AI Key (Director of Photography)
            </label>
            <input
              type={showKeys ? 'text' : 'password'}
              value={higgsfieldKey}
              onChange={(e) => setHiggsfieldKey(e.target.value)}
              placeholder="hf_..."
              className="w-full bg-[#0D1119] border border-[#1E2638] rounded-md p-2 text-xs text-zinc-200 font-mono focus:outline-none focus:border-zinc-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-zinc-400 mb-1">
              Replicate API Token (LTX-Video)
            </label>
            <input
              type={showKeys ? 'text' : 'password'}
              value={replicateKey}
              onChange={(e) => setReplicateKey(e.target.value)}
              placeholder="r8_..."
              className="w-full bg-[#0D1119] border border-[#1E2638] rounded-md p-2 text-xs text-zinc-200 font-mono focus:outline-none focus:border-zinc-500"
            />
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={() => setShowKeys(!showKeys)}
              className="flex items-center gap-1.5 text-[11px] text-zinc-400 hover:text-zinc-200"
            >
              {showKeys ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{showKeys ? 'Hide Keys' : 'Show Keys'}</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-[#161B26] border-t border-[#1E2638] flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-md border border-[#1E2638] hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-1.5 rounded-md bg-zinc-100 hover:bg-white text-zinc-900 font-semibold text-xs flex items-center gap-1.5 transition-colors"
          >
            {isSaved ? <Check className="w-3.5 h-3.5" /> : null}
            <span>{isSaved ? 'Saved Locally' : 'Save Keys'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
