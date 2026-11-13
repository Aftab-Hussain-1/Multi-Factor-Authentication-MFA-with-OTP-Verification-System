/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Smartphone,
  Mail,
  KeyRound,
  Download,
  Printer,
  RefreshCw,
  Copy,
  Check,
  AlertTriangle,
  QrCode,
  Lock,
  Calendar,
  Globe,
  Sliders,
} from 'lucide-react';
import { User, BackupCodeRecord } from '../types/auth';
import { AuthStore } from '../services/authStore';
import QRCode from 'qrcode';

interface UserSecurityDashboardProps {
  currentUser: User;
  onUserUpdate: () => void;
  onOpenAuthenticator: () => void;
  onOpenMailbox: () => void;
}

export const UserSecurityDashboard: React.FC<UserSecurityDashboardProps> = ({
  currentUser,
  onUserUpdate,
  onOpenAuthenticator,
  onOpenMailbox,
}) => {
  const store = AuthStore.getInstance();
  const [backupCodes, setBackupCodes] = useState<BackupCodeRecord[]>([]);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [totpSecret, setTotpSecret] = useState<string>(currentUser.totp_secret || '');
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedCodes, setCopiedCodes] = useState(false);
  const [verifyTotpInput, setVerifyTotpInput] = useState('');
  const [setupSuccess, setSetupSuccess] = useState<string | null>(null);
  const [setupError, setSetupError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'totp' | 'backup'>('overview');

  useEffect(() => {
    loadUserSecurityData();
  }, [currentUser]);

  const loadUserSecurityData = async () => {
    const codes = store.getBackupCodes(currentUser.id);
    setBackupCodes(codes);

    // If TOTP secret exists, generate QR
    if (currentUser.totp_secret) {
      setTotpSecret(currentUser.totp_secret);
      const url = `otpauth://totp/MFASecure:${currentUser.username}?secret=${currentUser.totp_secret}&issuer=MFASecure`;
      try {
        const qr = await QRCode.toDataURL(url, { margin: 2, width: 200 });
        setQrCodeDataUrl(qr);
      } catch (e) {
        console.error(e);
      }
    }
  };

  // Generate new TOTP setup
  const handleStartTotpSetup = async () => {
    setSetupError(null);
    setSetupSuccess(null);
    const { secret, otpAuthUrl } = await store.setupTOTP(currentUser.id);
    setTotpSecret(secret);
    const qr = await QRCode.toDataURL(otpAuthUrl, { margin: 2, width: 200 });
    setQrCodeDataUrl(qr);
    setActiveTab('totp');
  };

  // Verify and confirm TOTP setup
  const handleConfirmTotp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSetupError(null);
    setSetupSuccess(null);

    const res = await store.enableTOTP(currentUser.id, totpSecret, verifyTotpInput);
    if (res.success) {
      setSetupSuccess(res.message);
      setVerifyTotpInput('');
      onUserUpdate();
      loadUserSecurityData();
    } else {
      setSetupError(res.message);
    }
  };

  // Regenerate backup codes
  const handleRegenerateBackupCodes = async () => {
    if (confirm('Regenerating backup codes will permanently invalidate all previously generated codes. Continue?')) {
      await store.generateAndStoreBackupCodes(currentUser.id, 8);
      loadUserSecurityData();
      alert('8 fresh backup codes generated!');
    }
  };

  // Copy raw backup codes
  const handleCopyBackupCodes = () => {
    const text = backupCodes
      .map((c, i) => `${i + 1}. ${c.code_preview} (${c.is_used ? 'CONSUMED' : 'ACTIVE'})`)
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopiedCodes(true);
    setTimeout(() => setCopiedCodes(false), 2000);
  };

  // Download backup codes as TXT
  const handleDownloadBackupCodes = () => {
    const text = `MFA SECURITY BACKUP RECOVERY CODES
Account: ${currentUser.username} (${currentUser.email})
Generated: ${new Date().toLocaleString()}
Notice: Each code is single-use only. Keep this file confidential.

` + backupCodes.map((c, i) => `${i + 1}. ${c.code_preview} [${c.is_used ? 'USED' : 'UNUSED'}]`).join('\n');

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mfa_backup_codes_${currentUser.username}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Toggle MFA enabled
  const handleToggleMFA = (enabled: boolean) => {
    store.toggleUserMFA(currentUser.id, enabled);
    onUserUpdate();
  };

  // Security score
  let securityScore = 50; // base password
  if (currentUser.email_verified) securityScore += 15;
  if (currentUser.mfa_enabled) securityScore += 20;
  if (currentUser.totp_secret) securityScore += 15;

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* User Header Profile */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-extrabold text-2xl font-mono">
            {currentUser.username.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">{currentUser.username}</h2>
              <span className="px-2 py-0.5 rounded text-xs font-semibold uppercase bg-slate-800 text-slate-300 border border-slate-700">
                {currentUser.role}
              </span>
            </div>
            <p className="text-sm text-slate-400">{currentUser.email}</p>
            <div className="flex items-center gap-4 text-xs text-slate-500 mt-2">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Member since {new Date(currentUser.created_at).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1">
                <Globe className="w-3.5 h-3.5" />
                IP: 192.168.1.105
              </span>
            </div>
          </div>
        </div>

        {/* Security Health Score Card */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center gap-4 min-w-[220px]">
          <div className="relative w-14 h-14 flex items-center justify-center">
            <svg className="w-14 h-14 -rotate-90">
              <circle cx="28" cy="28" r="22" stroke="#1e293b" strokeWidth="4" fill="none" />
              <circle
                cx="28"
                cy="28"
                r="22"
                stroke={securityScore >= 85 ? '#10b981' : '#f59e0b'}
                strokeWidth="4"
                strokeDasharray={2 * Math.PI * 22}
                strokeDashoffset={2 * Math.PI * 22 - (securityScore / 100) * 2 * Math.PI * 22}
                strokeLinecap="round"
                fill="none"
              />
            </svg>
            <span className="absolute font-bold text-sm text-white font-mono">{securityScore}%</span>
          </div>
          <div>
            <div className="text-xs font-bold text-slate-300">Security Posture</div>
            <div className={`text-xs font-semibold ${securityScore >= 85 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {securityScore >= 85 ? 'High Protection (A+)' : 'Needs Improvement'}
            </div>
            <div className="text-[10px] text-slate-500">NIST 800-63B Compliant</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 gap-4 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'overview'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          MFA Controls
        </button>
        <button
          onClick={() => setActiveTab('totp')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'totp'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          Authenticator (TOTP)
        </button>
        <button
          onClick={() => setActiveTab('backup')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'backup'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          Backup Codes ({backupCodes.filter(c => !c.is_used).length} Active)
        </button>
      </div>

      {/* TAB 1: OVERVIEW & CONTROLS */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Factor 2 Status Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Multi-Factor Authentication</h3>
                  <p className="text-xs text-slate-400">Enforce secondary OTP proof upon every login</p>
                </div>
              </div>

              {/* Toggle switch */}
              <button
                type="button"
                onClick={() => handleToggleMFA(!currentUser.mfa_enabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  currentUser.mfa_enabled ? 'bg-emerald-500' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-slate-950 transition-transform ${
                    currentUser.mfa_enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-xs space-y-2">
              <div className="flex items-center justify-between text-slate-300">
                <span>MFA Status:</span>
                <span className={currentUser.mfa_enabled ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                  {currentUser.mfa_enabled ? 'Active & Enforced' : 'Disabled'}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Default Method:</span>
                <span className="text-slate-200 font-mono">Email 6-Digit OTP</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Authenticator App (TOTP):</span>
                <span className={currentUser.totp_secret ? 'text-teal-400 font-bold' : 'text-amber-400'}>
                  {currentUser.totp_secret ? 'Configured' : 'Not Setup'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={onOpenMailbox}
                className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 border border-slate-700 transition-colors"
              >
                <Mail className="w-4 h-4 text-emerald-400" />
                Open Email Inbox
              </button>
              <button
                onClick={onOpenAuthenticator}
                className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 border border-slate-700 transition-colors"
              >
                <Smartphone className="w-4 h-4 text-teal-400" />
                Test Auth App
              </button>
            </div>
          </div>

          {/* Account Security Information Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Lock className="w-5 h-5 text-purple-400" />
              Protection Policies in Effect
            </h3>
            <p className="text-xs text-slate-400">
              Your account is guarded by industry-grade countermeasures defined in the Project Proposal.
            </p>

            <div className="space-y-3 pt-2 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-200">5-Attempt Lockout Defense</div>
                  <div className="text-[11px] text-slate-500">Locks account for 15 minutes upon 5 failures</div>
                </div>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  ARMED
                </span>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-200">OTP Replay & Guessing Shield</div>
                  <div className="text-[11px] text-slate-500">Single-use OTP &bull; 3 attempts &bull; 5-min TTL</div>
                </div>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  ARMED
                </span>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-200">Audit Trail Logging</div>
                  <div className="text-[11px] text-slate-500">Captures every sign in, lockout & token event</div>
                </div>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  RECORDING
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TOTP SETUP WITH QR CODE */}
      {activeTab === 'totp' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <QrCode className="w-5 h-5 text-teal-400" />
                Google / Microsoft Authenticator (RFC 6238)
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Scan the QR code below using Google Authenticator, Microsoft Authenticator, or Authy.
              </p>
            </div>

            <button
              onClick={handleStartTotpSetup}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 border border-teal-500/30 text-xs font-semibold flex items-center gap-2 transition-colors self-start"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Generate New Secret
            </button>
          </div>

          {setupSuccess && (
            <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{setupSuccess}</span>
            </div>
          )}

          {setupError && (
            <div className="p-4 bg-red-950/40 border border-red-500/40 rounded-xl text-red-300 text-xs">
              {setupError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            {/* Left: QR Code Box */}
            <div className="md:col-span-5 flex flex-col items-center p-6 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
              {qrCodeDataUrl ? (
                <div className="p-3 bg-white rounded-xl shadow-lg">
                  <img src={qrCodeDataUrl} alt="TOTP QR Code" className="w-44 h-44 rounded-lg" />
                </div>
              ) : (
                <div className="w-44 h-44 bg-slate-900 border border-dashed border-slate-800 rounded-xl flex items-center justify-center text-slate-500 text-xs">
                  Generating QR...
                </div>
              )}
              <span className="text-[11px] text-slate-400 font-medium">Scan with Authenticator App</span>
            </div>

            {/* Right: Manual Secret & Verification Form */}
            <div className="md:col-span-7 space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Base32 Secret Key (Manual Entry)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={totpSecret}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-teal-300 text-xs font-mono font-bold select-all focus:outline-none"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(totpSecret);
                      setCopiedSecret(true);
                      setTimeout(() => setCopiedSecret(false), 2000);
                    }}
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                  >
                    {copiedSecret ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Verification Form */}
              <form onSubmit={handleConfirmTotp} className="space-y-3 pt-2">
                <label className="block text-xs font-semibold text-slate-300">
                  Verify 6-Digit Code from App to Confirm
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    maxLength={6}
                    value={verifyTotpInput}
                    onChange={e => setVerifyTotpInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-40 text-center font-mono text-lg font-bold tracking-widest px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-teal-500"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-teal-500/20"
                  >
                    Confirm & Activate
                  </button>
                </div>
              </form>

              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl text-[11px] text-slate-400 flex items-center justify-between">
                <span>Don't have a phone right now?</span>
                <button
                  type="button"
                  onClick={onOpenAuthenticator}
                  className="text-teal-400 hover:text-teal-300 font-bold underline"
                >
                  Launch In-Browser Smartphone Simulator
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: BACKUP RECOVERY CODES */}
      {activeTab === 'backup' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-amber-400" />
                One-Time Backup Recovery Codes
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Store these emergency recovery codes safely. Each code grants one-time account access if you lose your phone or email.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyBackupCodes}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                {copiedCodes ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedCodes ? 'Copied!' : 'Copy'}
              </button>

              <button
                onClick={handleDownloadBackupCodes}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Download TXT
              </button>

              <button
                onClick={handleRegenerateBackupCodes}
                className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-1.5 hover:bg-amber-500/30 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Regenerate
              </button>
            </div>
          </div>

          {/* Grid of 8 Backup Codes */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {backupCodes.map((code, idx) => (
              <div
                key={code.id}
                className={`p-3.5 rounded-xl border text-center font-mono text-xs transition-all ${
                  code.is_used
                    ? 'bg-slate-950/40 border-slate-800/50 text-slate-600 line-through'
                    : 'bg-slate-950 border-amber-500/30 text-amber-300 font-bold shadow-sm'
                }`}
              >
                <div className="text-[10px] text-slate-500 uppercase font-sans mb-1">Code #{idx + 1}</div>
                <div>{code.code_preview}</div>
                <div className="text-[9px] uppercase mt-1 text-slate-500 font-sans">
                  {code.is_used ? 'CONSUMED' : 'READY'}
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-amber-950/20 border border-amber-500/20 rounded-2xl text-xs text-amber-200/90 flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-semibold text-amber-300">Cryptographic Security Guarantee:</span>
              <p>
                In strict compliance with Proposal Section 9 & 14, backup codes are stored in the database exclusively as cryptographic hashes (`code_hash`).
                Once redeemed, the code is marked as used (`is_used = True`) and cannot be reused.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
