/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Mail, X, Check, Copy, KeyRound, ExternalLink, Trash2, Clock, ShieldCheck } from 'lucide-react';
import { SimulatedEmail } from '../types/auth';

interface VirtualMailboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  emails: SimulatedEmail[];
  onSelectCode?: (code: string) => void;
  onVerifyEmail?: (email: string) => void;
  onClear: () => void;
}

export const VirtualMailboxModal: React.FC<VirtualMailboxModalProps> = ({
  isOpen,
  onClose,
  emails,
  onSelectCode,
  onVerifyEmail,
  onClear,
}) => {
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(emails[0]?.id || null);
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isOpen) return null;

  const currentEmail = emails.find(e => e.id === selectedEmailId) || emails[0];

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base">Virtual SMTP Mailbox</h3>
                <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-800/50">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  Active SMTP Simulator
                </span>
              </div>
              <p className="text-xs text-slate-400">Captures 6-digit OTP codes and account activation links in real-time</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {emails.length > 0 && (
              <button
                onClick={onClear}
                className="text-xs text-slate-400 hover:text-red-400 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear All
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body: Dual Pane */}
        <div className="flex-1 flex overflow-hidden min-h-[420px]">
          {/* Email List Left Pane */}
          <div className="w-1/3 border-r border-slate-800 overflow-y-auto bg-slate-950/30">
            {emails.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <Mail className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">Inbox is empty</p>
                <p className="text-xs text-slate-600 mt-1">Dispatched OTP emails will appear here instantaneously</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800/60">
                {emails.map(email => {
                  const isSelected = (currentEmail?.id === email.id);
                  return (
                    <button
                      key={email.id}
                      onClick={() => setSelectedEmailId(email.id)}
                      className={`w-full text-left p-3.5 transition-all flex flex-col gap-1.5 ${
                        isSelected
                          ? 'bg-slate-800/80 border-l-4 border-emerald-500'
                          : 'hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-200 truncate max-w-[130px]">{email.to}</span>
                        <span className="text-[10px] text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(email.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                      </div>
                      <div className="text-xs font-medium text-white truncate">{email.subject}</div>
                      {email.code && (
                        <div className="inline-flex items-center gap-1 self-start px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 text-[11px] font-mono font-bold">
                          <KeyRound className="w-3 h-3" />
                          OTP: {email.code}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Email Preview Right Pane */}
          <div className="w-2/3 p-6 overflow-y-auto bg-slate-900 flex flex-col justify-between">
            {currentEmail ? (
              <div className="space-y-6">
                {/* Meta details */}
                <div className="border-b border-slate-800 pb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-wider text-slate-400">To: <strong className="text-slate-200 font-mono">{currentEmail.to}</strong></span>
                    <span className="text-xs text-slate-500">{new Date(currentEmail.timestamp).toLocaleString()}</span>
                  </div>
                  <h2 className="text-lg font-bold text-white mt-2">{currentEmail.subject}</h2>
                </div>

                {/* Email HTML Template Container */}
                <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 shadow-inner space-y-4">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold tracking-wider uppercase">
                    <ShieldCheck className="w-4 h-4" />
                    Secure Authentication Service
                  </div>

                  <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                    {currentEmail.body}
                  </p>

                  {/* Highlighted 6-digit OTP Box */}
                  {currentEmail.code && (
                    <div className="my-6 p-4 bg-slate-900 border-2 border-dashed border-emerald-500/40 rounded-xl text-center space-y-3">
                      <div className="text-xs uppercase tracking-wider text-slate-400 font-medium">Your One-Time Passcode</div>
                      <div className="text-4xl font-mono font-extrabold tracking-widest text-emerald-400 select-all">
                        {currentEmail.code}
                      </div>
                      <div className="text-xs text-slate-500">
                        Expires in 5 minutes &bull; Max 3 verification attempts &bull; Single use only
                      </div>

                      <div className="flex items-center justify-center gap-3 pt-2">
                        <button
                          onClick={() => handleCopy(currentEmail.code!)}
                          className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-colors border border-slate-700"
                        >
                          {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                          {copiedCode ? 'Copied to Clipboard!' : 'Copy 6-Digit Code'}
                        </button>

                        {onSelectCode && (
                          <button
                            onClick={() => {
                              onSelectCode(currentEmail.code!);
                              onClose();
                            }}
                            className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-2 transition-colors shadow-sm"
                          >
                            <ExternalLink className="w-4 h-4" />
                            Auto-Fill in OTP Form
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Direct Email Verification Link */}
                  {currentEmail.type === 'verify' && onVerifyEmail && (
                    <div className="pt-2">
                      <button
                        onClick={() => {
                          onVerifyEmail(currentEmail.to);
                          onClose();
                        }}
                        className="w-full py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow"
                      >
                        <Check className="w-4 h-4" />
                        Click to Verify Account Email Address
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-500">
                <Mail className="w-12 h-12 mb-2 opacity-30" />
                <p className="text-sm">Select an email from the left pane to view its contents.</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-950/80 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <span>SMTP Gateway: Simulated In-Memory Mail Transport Agent (RFC 5321)</span>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white font-medium"
          >
            Close Mailbox
          </button>
        </div>
      </div>
    </div>
  );
};
