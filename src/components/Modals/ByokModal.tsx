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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div className="w-full max-w-md rounded-xl bg-[#191B22] border border-white/10 shadow-2xl overflow-hidden text-zinc-100 font-sans animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.08] bg-[#21242E]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0D0E12] border border-white/[0.08] flex items-center justify-center text-[#FF5500]">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold tracking-tight text-white font-display">
                Inference API Vault (BYOK)
              </h2>
              <p className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider">
                Client-Side Sandbox Storage
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Security Notice */}
        <div className="px-5 py-2.5 bg-[#0D0E12] border-b border-white/[0.08] flex items-center gap-2 text-[11px] text-zinc-400 font-mono">
          <Shield className="w-3.5 h-3.5 text-[#FF5500] shrink-0" />
          <span>Zero Server Relay: API keys are used directly for client-side model requests.</span>
        </div>

        {/* Body */}
        <div className="p-5 space-y-3.5 text-xs">
          <div>
            <label className="block text-[10px] font-mono font-medium uppercase tracking-wider text-zinc-400 mb-1">
              Fal.ai API Key (Flux / Kling / Wan 2.1)
            </label>
            <input
              type={showKeys ? 'text' : 'password'}
              value={falKey}
              onChange={(e) => setFalKey(e.target.value)}
              placeholder="fal_key_..."
              className="w-full bg-[#0D0E12] border border-white/[0.08] rounded-lg p-2.5 text-xs text-white font-mono focus:outline-none focus:border-[#FF5500]/60 focus:ring-1 focus:ring-[#FF5500]/20 transition-all placeholder:text-zinc-600"
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono font-medium uppercase tracking-wider text-zinc-400 mb-1">
              Higgsfield AI Key (Director of Photography)
            </label>
            <input
              type={showKeys ? 'text' : 'password'}
              value={higgsfieldKey}
              onChange={(e) => setHiggsfieldKey(e.target.value)}
              placeholder="hf_..."
              className="w-full bg-[#0D0E12] border border-white/[0.08] rounded-lg p-2.5 text-xs text-white font-mono focus:outline-none focus:border-[#FF5500]/60 focus:ring-1 focus:ring-[#FF5500]/20 transition-all placeholder:text-zinc-600"
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono font-medium uppercase tracking-wider text-zinc-400 mb-1">
              Replicate API Token (LTX-Video / Wan)
            </label>
            <input
              type={showKeys ? 'text' : 'password'}
              value={replicateKey}
              onChange={(e) => setReplicateKey(e.target.value)}
              placeholder="r8_..."
              className="w-full bg-[#0D0E12] border border-white/[0.08] rounded-lg p-2.5 text-xs text-white font-mono focus:outline-none focus:border-[#FF5500]/60 focus:ring-1 focus:ring-[#FF5500]/20 transition-all placeholder:text-zinc-600"
            />
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={() => setShowKeys(!showKeys)}
              className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              {showKeys ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{showKeys ? 'Hide Keys' : 'Show Keys'}</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-[#21242E] border-t border-white/[0.08] flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-md border border-white/[0.08] hover:bg-white/[0.06] text-zinc-300 hover:text-white text-xs font-medium transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-1.5 rounded-md bg-[#FF5500] hover:bg-[#FF661A] text-white font-semibold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-[#FF5500]/25 cursor-pointer active:scale-98"
          >
            {isSaved ? <Check className="w-3.5 h-3.5 stroke-[2]" /> : null}
            <span>{isSaved ? 'Saved Locally' : 'Save Keys'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
