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
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="w-full max-w-md rounded-2xl bg-[#0f131a] border border-[#1e2638] shadow-2xl overflow-hidden text-white font-mono">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1e2638] bg-[#141a24]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold">BRING YOUR OWN KEYS (BYOK)</h2>
              <p className="text-[10px] text-neutral-400">Stored strictly in browser localStorage</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-[#1e2638]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Security Banner */}
        <div className="px-5 py-3 bg-[#090a0f] border-b border-[#1e2638] flex items-center gap-2 text-[10px] text-emerald-400">
          <Shield className="w-4 h-4 shrink-0" />
          <span>Zero Server Storage: keys execute direct inference via client-side endpoints.</span>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-xs">
          <div>
            <label className="block text-[10px] text-neutral-400 uppercase mb-1">
              Fal.ai API Key (Flux / Kling / Wan)
            </label>
            <input
              type={showKeys ? 'text' : 'password'}
              value={falKey}
              onChange={(e) => setFalKey(e.target.value)}
              placeholder="fal_key_..."
              className="w-full bg-[#090a0f] border border-[#1e2638] rounded-lg p-2.5 text-xs text-cyan-300 focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="block text-[10px] text-neutral-400 uppercase mb-1">
              Higgsfield AI API Key (Camera Curves)
            </label>
            <input
              type={showKeys ? 'text' : 'password'}
              value={higgsfieldKey}
              onChange={(e) => setHiggsfieldKey(e.target.value)}
              placeholder="hf_..."
              className="w-full bg-[#090a0f] border border-[#1e2638] rounded-lg p-2.5 text-xs text-pink-300 focus:outline-none focus:border-pink-400"
            />
          </div>

          <div>
            <label className="block text-[10px] text-neutral-400 uppercase mb-1">
              Replicate API Token (LTX-Video / Wan)
            </label>
            <input
              type={showKeys ? 'text' : 'password'}
              value={replicateKey}
              onChange={(e) => setReplicateKey(e.target.value)}
              placeholder="r8_..."
              className="w-full bg-[#090a0f] border border-[#1e2638] rounded-lg p-2.5 text-xs text-amber-300 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setShowKeys(!showKeys)}
              className="flex items-center gap-1.5 text-[10px] text-neutral-400 hover:text-neutral-200"
            >
              {showKeys ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{showKeys ? 'Hide Keys' : 'Show Keys'}</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-[#141a24] border-t border-[#1e2638] flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg border border-[#1e2638] hover:bg-[#1e2638] text-neutral-300 text-xs"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-1.5 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-black font-bold text-xs flex items-center gap-1.5"
          >
            {isSaved ? <Check className="w-3.5 h-3.5" /> : <Key className="w-3.5 h-3.5" />}
            <span>{isSaved ? 'Saved Locally!' : 'Save Keys'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
