/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Lock,
  Mail,
  Smartphone,
  KeyRound,
  ShieldAlert,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
  AlertTriangle,
  UserPlus,
  LogIn,
  Eye,
  EyeOff,
  Clock,
  Sparkles,
} from 'lucide-react';
import { AuthStore } from '../services/authStore';
import { User } from '../types/auth';
import confetti from 'canvas-confetti';

interface AuthFlowProps {
  onSuccess: (user: User) => void;
  onOpenMailbox: () => void;
  onOpenAuthenticator: () => void;
  initialOtpFill?: string;
  initialTotpFill?: string;
}

export const AuthFlow: React.FC<AuthFlowProps> = ({
  onSuccess,
  onOpenMailbox,
  onOpenAuthenticator,
  initialOtpFill,
  initialTotpFill,
}) => {
  const store = AuthStore.getInstance();

  // Mode: 'login' | 'register'
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Factor 1 Form
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('AdminPass@2026');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [lockoutMinutes, setLockoutMinutes] = useState<number | null>(null);
  const [failedAttempts, setFailedAttempts] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  // Register Form
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regSuccessMsg, setRegSuccessMsg] = useState<string | null>(null);
  const [regError, setRegError] = useState<string | null>(null);

  // Factor 2 State
  const [mfaStep, setMfaStep] = useState(false);
  const [mfaType, setMfaType] = useState<'email_otp' | 'totp' | 'backup_code'>('email_otp');
  const [otpCode, setOtpCode] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [backupCode, setBackupCode] = useState('');
  const [mfaError, setMfaError] = useState<string | null>(null);
  const [mfaRemainingAttempts, setMfaRemainingAttempts] = useState<number>(3);
  const [otpTimerSeconds, setOtpTimerSeconds] = useState<number>(300); // 5 min countdown

  // Sync fills from navbar / modals
  useEffect(() => {
    if (initialOtpFill) {
      setOtpCode(initialOtpFill);
      setMfaType('email_otp');
    }
  }, [initialOtpFill]);

  useEffect(() => {
    if (initialTotpFill) {
      setTotpCode(initialTotpFill);
      setMfaType('totp');
    }
  }, [initialTotpFill]);

  // Check pre-existing preAuth
  useEffect(() => {
    const preAuth = store.getPreAuthUser();
    if (preAuth) {
      setMfaStep(true);
      if (preAuth.preferred_mfa === 'totp') setMfaType('totp');
      else setMfaType('email_otp');
    }
  }, []);

  // 5-minute countdown for Email OTP
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (mfaStep && mfaType === 'email_otp' && otpTimerSeconds > 0) {
      interval = setInterval(() => {
        setOtpTimerSeconds(prev => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [mfaStep, mfaType, otpTimerSeconds]);

  // Fast autofill accounts
  const handleAutoFill = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setLoginError(null);
    setLockoutMinutes(null);
  };

  // Password Strength Calculation
  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (pass.length >= 12) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[a-z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score; // 0 to 6
  };

  // 1. SUBMIT FACTOR 1 LOGIN
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoading(true);

    try {
      const res = await store.authenticateFirstFactor(username, password);

      if (res.status === 'ACCOUNT_LOCKED') {
        setLockoutMinutes(res.lockoutRemainingMinutes || 15);
        setLoginError(res.message);
      } else if (res.status === 'INVALID_CREDENTIALS') {
        setLoginError(res.message);
        setFailedAttempts(res.failedAttempts || 0);
      } else if (res.status === 'UNVERIFIED_EMAIL') {
        setLoginError(res.message);
      } else if (res.status === 'MFA_REQUIRED') {
        setMfaStep(true);
        setOtpTimerSeconds(300); // 5 min
        setMfaRemainingAttempts(3);
        setMfaError(null);
      } else if (res.status === 'SUCCESS' && res.user) {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
        onSuccess(res.user);
      }
    } finally {
      setLoading(false);
    }
  };

  // 2. SUBMIT FACTOR 2 VERIFICATION
  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMfaError(null);
    const preAuth = store.getPreAuthUser();
    if (!preAuth) {
      setMfaError('Authentication session expired. Please sign in again.');
      setMfaStep(false);
      return;
    }

    setLoading(true);

    try {
      if (mfaType === 'email_otp') {
        const res = await store.verifyEmailOTP(preAuth.id, otpCode);
        if (res.success) {
          confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
          const cur = store.getCurrentUser();
          if (cur) onSuccess(cur);
        } else {
          setMfaError(res.message);
          if (res.attemptsRemaining !== undefined) {
            setMfaRemainingAttempts(res.attemptsRemaining);
          }
        }
      } else if (mfaType === 'totp') {
        const res = await store.verifyTOTPLogin(preAuth.id, totpCode);
        if (res.success) {
          confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
          const cur = store.getCurrentUser();
          if (cur) onSuccess(cur);
        } else {
          setMfaError(res.message);
        }
      } else if (mfaType === 'backup_code') {
        const res = await store.verifyBackupCode(preAuth.id, backupCode);
        if (res.success) {
          confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
          const cur = store.getCurrentUser();
          if (cur) onSuccess(cur);
        } else {
          setMfaError(res.message);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // RESEND EMAIL OTP
  const handleResendOTP = async () => {
    const preAuth = store.getPreAuthUser();
    if (!preAuth) return;
    setLoading(true);
    await store.generateAndSendEmailOTP(preAuth.id);
    setOtpTimerSeconds(300);
    setMfaRemainingAttempts(3);
    setMfaError(null);
    setLoading(false);
  };

  // SUBMIT REGISTER
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);
    setRegSuccessMsg(null);

    if (regPassword.length < 8) {
      setRegError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);
    try {
      const res = await store.register(regUsername, regEmail, regPassword);
      if (res.success) {
        setRegSuccessMsg('Account registered! A verification link was sent to your Virtual Mailbox.');
        setRegUsername('');
        setRegEmail('');
        setRegPassword('');
      } else {
        setRegError(res.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const minutesRemaining = Math.floor(otpTimerSeconds / 60);
  const secondsMod = otpTimerSeconds % 60;
  const formattedCountdown = `${minutesRemaining.toString().padStart(2, '0')}:${secondsMod.toString().padStart(2, '0')}`;
  const strength = getPasswordStrength(regPassword);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      {/* Top Banner / System Specification */}
      <div className="mb-8 p-4 bg-slate-900/80 border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-300">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20 font-mono font-bold">
            2FA
          </div>
          <div>
            <span className="font-semibold text-white">Full NIST 800-63B Authentication Lifecycle</span>
            <p className="text-slate-400 text-[11px]">Factor 1 (Credentials) + Factor 2 (Hashed 5-min OTP / RFC 6238 TOTP)</p>
          </div>
        </div>

        {/* Demo Fast Logins */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] uppercase font-bold text-slate-500 mr-1">Quick Select:</span>
          <button
            type="button"
            onClick={() => handleAutoFill('admin', 'AdminPass@2026')}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-purple-300 border border-purple-500/30 font-mono text-[11px]"
          >
            admin
          </button>
          <button
            type="button"
            onClick={() => handleAutoFill('john_doe', 'UserPass@2026')}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-teal-300 border border-teal-500/30 font-mono text-[11px]"
          >
            john_doe
          </button>
          <button
            type="button"
            onClick={() => handleAutoFill('alice_smith', 'AlicePass@2026')}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 font-mono text-[11px]"
          >
            alice_smith
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left Side: Authentication Panel */}
        <div className="md:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
          {!mfaStep ? (
            /* FACTOR 1: LOGIN & REGISTER */
            <div>
              {/* Tab Header: Sign In vs Sign Up */}
              <div className="flex border-b border-slate-800 mb-6">
                <button
                  onClick={() => setMode('login')}
                  className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
                    mode === 'login'
                      ? 'border-emerald-500 text-emerald-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <LogIn className="w-4 h-4" />
                  Sign In (Factor 1)
                </button>
                <button
                  onClick={() => setMode('register')}
                  className={`ml-6 pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
                    mode === 'register'
                      ? 'border-emerald-500 text-emerald-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <UserPlus className="w-4 h-4" />
                  Register Account
                </button>
              </div>

              {mode === 'login' ? (
                /* LOGIN FORM */
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  {/* Account Lockout Alert (Proposal Section 7 & 14) */}
                  {lockoutMinutes && (
                    <div className="p-4 bg-red-950/50 border border-red-500/40 rounded-2xl text-red-200 space-y-2 animate-shake">
                      <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-red-400">
                        <ShieldAlert className="w-4 h-4" />
                        Account Lockout Defense Engaged
                      </div>
                      <p className="text-xs text-red-300 leading-relaxed">
                        This account has been locked for <strong>15 minutes</strong> due to 5 consecutive failed login attempts.
                        Remaining lock time: <strong className="font-mono text-white">{lockoutMinutes} min</strong>.
                      </p>
                      <div className="text-[11px] text-red-400/80 pt-1">
                        Administrator can unlock this account immediately from the <strong>Admin & Audit</strong> tab.
                      </div>
                    </div>
                  )}

                  {/* Failed Attempt Warning (1 to 4) */}
                  {!lockoutMinutes && failedAttempts > 0 && failedAttempts < 5 && (
                    <div className="p-3 bg-amber-950/40 border border-amber-500/30 rounded-xl text-amber-200 text-xs flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>
                        Security Warning: <strong>{failedAttempts} of 5</strong> failed attempts. 5 failures trigger a 15-minute lockout.
                      </span>
                    </div>
                  )}

                  {/* Standard Error */}
                  {loginError && !lockoutMinutes && (
                    <div className="p-3 bg-red-950/30 border border-red-900/40 rounded-xl text-red-300 text-xs">
                      {loginError}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Username or Email
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      required
                      placeholder="e.g. admin or john_doe"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-slate-300">Password</label>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        {showPassword ? 'Hide' : 'Show'}
                      </button>
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      placeholder="••••••••••••"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors font-mono"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || Boolean(lockoutMinutes)}
                    className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        Verify Factor 1 Credentials
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* REGISTRATION FORM */
                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  {regSuccessMsg && (
                    <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center justify-between">
                      <span>{regSuccessMsg}</span>
                      <button
                        type="button"
                        onClick={onOpenMailbox}
                        className="underline font-bold text-white ml-2"
                      >
                        Open Mailbox
                      </button>
                    </div>
                  )}

                  {regError && (
                    <div className="p-3 bg-red-950/30 border border-red-900/40 rounded-xl text-red-300 text-xs">
                      {regError}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Username</label>
                    <input
                      type="text"
                      value={regUsername}
                      onChange={e => setRegUsername(e.target.value)}
                      required
                      placeholder="alphanumeric, min 3 chars"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
                    <input
                      type="email"
                      value={regEmail}
                      onChange={e => setRegEmail(e.target.value)}
                      required
                      placeholder="user@example.com"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
                    <input
                      type="password"
                      value={regPassword}
                      onChange={e => setRegPassword(e.target.value)}
                      required
                      placeholder="Min 8 chars with mixed characters"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                    />

                    {/* Password Entropy Meter */}
                    {regPassword.length > 0 && (
                      <div className="mt-2 space-y-1">
                        <div className="flex justify-between text-[11px] text-slate-400">
                          <span>Password Entropy</span>
                          <span
                            className={
                              strength >= 4
                                ? 'text-emerald-400 font-bold'
                                : strength >= 2
                                ? 'text-amber-400'
                                : 'text-red-400'
                            }
                          >
                            {strength >= 5 ? 'Very Strong' : strength >= 3 ? 'Medium' : 'Weak'}
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden flex gap-0.5">
                          <div
                            className={`h-full transition-all duration-300 ${
                              strength >= 1
                                ? strength >= 4
                                  ? 'bg-emerald-500 w-full'
                                  : strength >= 2
                                  ? 'bg-amber-400 w-3/4'
                                  : 'bg-red-500 w-1/3'
                                : 'w-0'
                            }`}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
                  >
                    {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Create Account & Dispatch OTP'}
                  </button>
                </form>
              )}
            </div>
          ) : (
            /* FACTOR 2: MULTI-FACTOR AUTHENTICATION STEP */
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                    <ShieldCheck className="w-4 h-4" />
                    Factor 1 Verified
                  </div>
                  <h3 className="text-xl font-bold text-white mt-1">Multi-Factor Verification (Factor 2)</h3>
                </div>

                <button
                  onClick={() => {
                    store.cancelPreAuth();
                    setMfaStep(false);
                  }}
                  className="text-xs text-slate-400 hover:text-white underline"
                >
                  Cancel / Switch User
                </button>
              </div>

              {/* Factor 2 Method Selector Tabs */}
              <div className="grid grid-cols-3 gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setMfaType('email_otp');
                    setMfaError(null);
                  }}
                  className={`py-2 px-2 rounded-lg font-medium flex items-center justify-center gap-1.5 transition-colors ${
                    mfaType === 'email_otp'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  Email OTP
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMfaType('totp');
                    setMfaError(null);
                  }}
                  className={`py-2 px-2 rounded-lg font-medium flex items-center justify-center gap-1.5 transition-colors ${
                    mfaType === 'totp'
                      ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  Authenticator
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMfaType('backup_code');
                    setMfaError(null);
                  }}
                  className={`py-2 px-2 rounded-lg font-medium flex items-center justify-center gap-1.5 transition-colors ${
                    mfaType === 'backup_code'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  Backup Code
                </button>
              </div>

              {/* MFA Error Banner */}
              {mfaError && (
                <div className="p-3 bg-red-950/40 border border-red-500/30 rounded-xl text-red-300 text-xs flex items-center justify-between">
                  <span>{mfaError}</span>
                  {mfaRemainingAttempts < 3 && mfaRemainingAttempts > 0 && (
                    <span className="text-[11px] font-bold text-red-400">
                      {mfaRemainingAttempts} attempt{mfaRemainingAttempts === 1 ? '' : 's'} left
                    </span>
                  )}
                </div>
              )}

              {/* FORM PER SELECTED FACTOR 2 METHOD */}
              <form onSubmit={handleMfaSubmit} className="space-y-4">
                {mfaType === 'email_otp' && (
                  <div className="space-y-4">
                    <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Target Email: <strong className="text-white">{store.getPreAuthUser()?.email}</strong></span>
                        <span className="flex items-center gap-1 font-mono text-emerald-400 text-xs font-bold">
                          <Clock className="w-3.5 h-3.5" />
                          {formattedCountdown}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        A cryptographically secure 6-digit OTP was dispatched. Valid for 5 minutes, 3 attempt limit.
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-semibold text-slate-300">Enter 6-Digit OTP</label>
                        <button
                          type="button"
                          onClick={onOpenMailbox}
                          className="text-[11px] text-emerald-400 hover:text-emerald-300 underline font-medium"
                        >
                          Check Virtual Mailbox
                        </button>
                      </div>

                      <input
                        type="text"
                        maxLength={6}
                        value={otpCode}
                        onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
                        required
                        placeholder="••••••"
                        className="w-full text-center tracking-widest text-2xl font-mono py-3 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="button"
                        onClick={handleResendOTP}
                        disabled={loading}
                        className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Resend New OTP
                      </button>

                      <span className="text-[11px] text-slate-500">
                        Remaining attempts: <strong className="text-white">{mfaRemainingAttempts} / 3</strong>
                      </span>
                    </div>
                  </div>
                )}

                {mfaType === 'totp' && (
                  <div className="space-y-4">
                    <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-semibold text-white">Google / Microsoft Authenticator</div>
                        <div className="text-[11px] text-slate-400">RFC 6238 time-based rolling code</div>
                      </div>
                      <button
                        type="button"
                        onClick={onOpenAuthenticator}
                        className="px-3 py-1.5 rounded-lg bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-semibold flex items-center gap-1.5 hover:bg-teal-500/30 transition-colors"
                      >
                        <Smartphone className="w-3.5 h-3.5" />
                        Open Auth App
                      </button>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">Enter Authenticator Code</label>
                      <input
                        type="text"
                        maxLength={6}
                        value={totpCode}
                        onChange={e => setTotpCode(e.target.value.replace(/\D/g, ''))}
                        required
                        placeholder="123456"
                        className="w-full text-center tracking-widest text-2xl font-mono py-3 rounded-xl bg-slate-950 border border-slate-800 text-teal-400 focus:outline-none focus:border-teal-500"
                      />
                    </div>
                  </div>
                )}

                {mfaType === 'backup_code' && (
                  <div className="space-y-4">
                    <div className="bg-amber-950/20 p-4 rounded-xl border border-amber-500/20 text-xs text-amber-200/90 space-y-1">
                      <div className="font-bold flex items-center gap-1.5 text-amber-400">
                        <KeyRound className="w-4 h-4" />
                        Emergency Recovery Code
                      </div>
                      <p>Use one of your 8-digit emergency backup codes. Each code can only be used once.</p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">Backup Code (XXXX-XXXX)</label>
                      <input
                        type="text"
                        value={backupCode}
                        onChange={e => setBackupCode(e.target.value.toUpperCase())}
                        required
                        placeholder="e.g. 9F4E-2A8C"
                        className="w-full text-center tracking-wider text-xl font-mono py-3 rounded-xl bg-slate-950 border border-slate-800 text-amber-400 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Confirm Factor 2 & Access Portal'}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Right Side: Security Pipeline Live Architecture Diagram */}
        <div className="md:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              Real-Time Security Architecture
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every attempt is passed through an active pipeline enforcing cryptographic verification, rate limits, and audit trails.
            </p>

            <div className="space-y-3 pt-2">
              {/* Step 1 */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold text-xs shrink-0">
                  1
                </div>
                <div className="text-xs">
                  <div className="font-semibold text-slate-200">Factor 1: Credential Guard</div>
                  <div className="text-slate-400 text-[11px]">Salted SHA-256 hash check &bull; 5-attempt brute force shield (15 min lockout)</div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center justify-center font-bold text-xs shrink-0">
                  2
                </div>
                <div className="text-xs">
                  <div className="font-semibold text-slate-200">Factor 2: Secure OTP / TOTP</div>
                  <div className="text-slate-400 text-[11px]">Hashed storage &bull; 5-min TTL &bull; Max 3 attempts &bull; Replay defense</div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center font-bold text-xs shrink-0">
                  3
                </div>
                <div className="text-xs">
                  <div className="font-semibold text-slate-200">Immutable Audit Trail</div>
                  <div className="text-slate-400 text-[11px]">Automatic logging of IP, user-agent, outcome, and timestamp</div>
                </div>
              </div>
            </div>

            {/* Quick Link to Test Scenarios */}
            <div className="pt-2">
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] text-slate-400">
                Want to test Brute-Force lockout or OTP replay attacks? Head over to the <strong className="text-emerald-400">Attack Simulator</strong> tab!
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
