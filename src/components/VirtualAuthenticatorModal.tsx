/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Smartphone, X, Copy, Check, RefreshCw, Key, ShieldCheck, ArrowRight } from 'lucide-react';
import { CryptoEngine } from '../services/cryptoEngine';

interface VirtualAuthenticatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeSecret?: string;
  username?: string;
  onUseCode?: (code: string) => void;
}

export const VirtualAuthenticatorModal: React.FC<VirtualAuthenticatorModalProps> = ({
  isOpen,
  onClose,
  activeSecret,
  username = 'admin',
  onUseCode,
}) => {
  const [currentSecret, setCurrentSecret] = useState(activeSecret || 'JBSWY3DPEHPK3PXP');
  const [totpCode, setTotpCode] = useState('000000');
  const [secondsRemaining, setSecondsRemaining] = useState(30);
  const [copied, setCopied] = useState(false);
  const [showSecret, setShowSecret] = useState(false);

  // Synchronize active secret when passed
  useEffect(() => {
    if (activeSecret) {
      setCurrentSecret(activeSecret);
    }
  }, [activeSecret]);

  // Compute live code and countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;

    const update = async () => {
      const remaining = CryptoEngine.getTOTPSecondsRemaining(30);
      setSecondsRemaining(remaining);
      const code = await CryptoEngine.generateTOTP(currentSecret);
      setTotpCode(code);
    };

    update();
    timer = setInterval(update, 1000);

    return () => clearInterval(timer);
  }, [currentSecret]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(totpCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Progress percentage for circular ring (30s = 100%)
  const percentage = (secondsRemaining / 30) * 100;
  const circumference = 2 * Math.PI * 18;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl flex flex-col">
        {/* Smartphone Bezel Header */}
        <div className="bg-slate-950 px-6 py-3 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-slate-400">9:41 AM</span>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
          </div>
          <div className="w-16 h-3 bg-slate-800 rounded-full mx-auto"></div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Authenticator App Title */}
        <div className="p-5 pb-3 flex items-center justify-between border-b border-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Authenticator App</h4>
              <p className="text-[11px] text-slate-400">RFC 6238 Standard (30s step)</p>
            </div>
          </div>

          <button
            onClick={() => setShowSecret(!showSecret)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-teal-300 hover:bg-slate-800 transition-colors"
            title="Inspect Base32 Seed"
          >
            <Key className="w-4 h-4" />
          </button>
        </div>

        {/* Live Token Card */}
        <div className="p-6 space-y-5">
          {showSecret && (
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1">
              <div className="text-[10px] uppercase font-bold text-slate-500">Active Base32 Secret</div>
              <div className="font-mono text-teal-300 select-all break-all">{currentSecret}</div>
            </div>
          )}

          <div className="bg-slate-950/80 rounded-2xl p-5 border border-slate-800/80 space-y-4 shadow-inner">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                MFASecure: {username}
              </span>
              <span className="text-[11px] text-slate-500 font-mono">SHA1</span>
            </div>

            {/* 6-Digit Code + Circular Timer */}
            <div className="flex items-center justify-between">
              <div className="font-mono text-3xl font-extrabold tracking-widest text-teal-400 select-all">
                {totpCode.slice(0, 3)} {totpCode.slice(3, 6)}
              </div>

              {/* Animated SVG Ring */}
              <div className="relative w-12 h-12 flex items-center justify-center">
                <svg className="w-12 h-12 -rotate-90">
                  <circle
                    cx="24"
                    cy="24"
                    r="18"
                    stroke="#1e293b"
                    strokeWidth="3.5"
                    fill="none"
                  />
                  <circle
                    cx="24"
                    cy="24"
                    r="18"
                    stroke={secondsRemaining < 7 ? '#ef4444' : '#14b8a6'}
                    strokeWidth="3.5"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="none"
                    className="transition-all duration-1000 ease-linear"
                  />
                </svg>
                <span
                  className={`absolute text-xs font-mono font-bold ${
                    secondsRemaining < 7 ? 'text-red-400 animate-pulse' : 'text-slate-300'
                  }`}
                >
                  {secondsRemaining}s
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
              <button
                onClick={handleCopy}
                className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-slate-700/60"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy Code'}
              </button>

              {onUseCode && (
                <button
                  onClick={() => {
                    onUseCode(totpCode);
                    onClose();
                  }}
                  className="flex-1 py-2 px-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  Auto-Fill
                </button>
              )}
            </div>
          </div>

          {/* Quick Account Switcher for Testing */}
          <div className="space-y-2">
            <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Test Account Profiles</div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setCurrentSecret('JBSWY3DPEHPK3PXP')}
                className={`p-2 rounded-xl text-left border text-xs transition-colors ${
                  currentSecret === 'JBSWY3DPEHPK3PXP'
                    ? 'bg-slate-800 border-teal-500 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800/50'
                }`}
              >
                <div className="font-semibold text-slate-200 truncate">admin</div>
                <div className="text-[10px] text-slate-500">JBSWY3DP...</div>
              </button>

              <button
                onClick={() => setCurrentSecret('MZXW6YTBOI======')}
                className={`p-2 rounded-xl text-left border text-xs transition-colors ${
                  currentSecret === 'MZXW6YTBOI======'
                    ? 'bg-slate-800 border-teal-500 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800/50'
                }`}
              >
                <div className="font-semibold text-slate-200 truncate">john_doe</div>
                <div className="text-[10px] text-slate-500">MZXW6YTB...</div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Bar */}
        <div className="bg-slate-950 px-6 py-3 border-t border-slate-800 text-[11px] text-slate-500 text-center">
          Compatible with Google Authenticator, Authy & Microsoft Authenticator
        </div>
      </div>
    </div>
  );
};
