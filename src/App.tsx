/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { AuthFlow } from './components/AuthFlow';
import { UserSecurityDashboard } from './components/UserSecurityDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { AttackSimulator } from './components/AttackSimulator';
import { ProposalTallyView } from './components/ProposalTallyView';
import { DocumentationHub } from './components/DocumentationHub';
import { PythonCodeViewer } from './components/PythonCodeViewer';
import { VirtualMailboxModal } from './components/VirtualMailboxModal';
import { VirtualAuthenticatorModal } from './components/VirtualAuthenticatorModal';
import { AuthStore } from './services/authStore';
import { User } from './types/auth';
import { ShieldCheck, Lock, Sparkles, CheckCircle2, ShieldAlert, KeyRound } from 'lucide-react';

export default function App() {
  const store = AuthStore.getInstance();

  const [currentUser, setCurrentUser] = useState<User | null>(store.getCurrentUser());
  const [activeTab, setActiveTab] = useState<string>(store.getCurrentUser() ? 'security' : 'auth');
  const [isMailboxOpen, setIsMailboxOpen] = useState<boolean>(false);
  const [isAuthenticatorOpen, setIsAuthenticatorOpen] = useState<boolean>(false);
  const [otpFill, setOtpFill] = useState<string>('');
  const [totpFill, setTotpFill] = useState<string>('');
  const [emails, setEmails] = useState(store.getSimulatedEmails());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync state with store
  const refreshAppState = () => {
    const cur = store.getCurrentUser();
    setCurrentUser(cur);
    setEmails(store.getSimulatedEmails());
    if (!cur) {
      setActiveTab('auth');
    }
  };

  useEffect(() => {
    refreshAppState();
  }, []);

  // Periodic poll for simulated emails
  useEffect(() => {
    const interval = setInterval(() => {
      setEmails(store.getSimulatedEmails());
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // SUCCESSFUL LOGIN (Factor 1 + Factor 2 completed)
  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    refreshAppState();
    // Redirect to Security Dashboard or Admin Dashboard
    setActiveTab(user.role === 'admin' ? 'admin' : 'security');
    showToast(`Access Granted! Welcome, ${user.username} (${user.role.toUpperCase()}).`);
  };

  // LOGOUT
  const handleLogout = () => {
    store.logout();
    setCurrentUser(null);
    refreshAppState();
    setActiveTab('auth');
    showToast('Signed out successfully. Session terminated.');
  };

  // RESET DEMO
  const handleResetDemo = () => {
    if (confirm('Reset system database to clean proposal initial state?')) {
      store.resetToDemo();
      refreshAppState();
      setActiveTab('auth');
      showToast('System reset to clean proposal baseline.');
    }
  };

  // Auto-fill from Virtual Mailbox
  const handleSelectOtpFromMailbox = (code: string) => {
    setOtpFill(code);
    setActiveTab('auth');
    showToast(`OTP code ${code} pasted into verification form!`);
  };

  // Verify email directly from Virtual Mailbox
  const handleVerifyEmailFromMailbox = (email: string) => {
    const success = store.verifyEmail(email);
    if (success) {
      refreshAppState();
      showToast(`Email ${email} verified successfully! You can now log in.`);
    }
  };

  // Auto-fill from Virtual Authenticator
  const handleUseTotpCode = (code: string) => {
    setTotpFill(code);
    setActiveTab('auth');
    showToast(`TOTP code ${code} transferred to login form!`);
  };

  const unreadEmailCount = emails.filter(e => !e.read).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-slate-900 border border-emerald-500/40 text-emerald-300 text-xs font-semibold shadow-2xl flex items-center gap-3 animate-slide-up">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Top Navigation with unified alignment */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (!currentUser && tab !== 'auth') {
            showToast('Authentication Required: Please sign in first.');
            return;
          }
          setActiveTab(tab);
        }}
        currentUser={currentUser}
        unreadEmailCount={unreadEmailCount}
        onOpenMailbox={() => setIsMailboxOpen(true)}
        onOpenAuthenticator={() => setIsAuthenticatorOpen(true)}
        onLogout={handleLogout}
        onResetDemo={handleResetDemo}
      />

      {/* Sub-Header Status Strip: Perfectly aligned with max-w-7xl px-4 sm:px-6 lg:px-8 */}
      <div className="bg-slate-900/60 border-b border-slate-800 text-[11px] text-slate-400 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-10 flex items-center justify-between gap-4 overflow-x-auto scrollbar-none">
          {/* Left Telemetry */}
          <div className="flex items-center gap-3 shrink-0">
            <span className="flex items-center gap-1.5 font-semibold text-slate-200">
              <span className={`w-2 h-2 rounded-full ${currentUser ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
              {currentUser ? 'SYSTEM: ACTIVE SESSION' : 'SYSTEM: AUTHENTICATION GATE'}
            </span>
            <span className="text-slate-700 hidden sm:inline">|</span>
            <span className="hidden sm:inline text-slate-400 font-mono">
              Lockout: 5 fails / 15m
            </span>
            <span className="text-slate-700 hidden md:inline">|</span>
            <span className="hidden md:inline text-slate-400 font-mono">
              OTP: 5m TTL / 3 attempts
            </span>
          </div>

          {/* Right Status */}
          <div className="flex items-center gap-3 shrink-0">
            {currentUser ? (
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Authenticated as <strong className="text-white font-mono">{currentUser.username}</strong></span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-amber-400 font-medium">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>Dashboards Locked &bull; Please Sign In</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Viewport Router */}
      <main className="flex-1">
        {/* REQUIRE LOGIN FIRST: If user is NOT logged in, show ONLY the Login / MFA Flow */}
        {!currentUser ? (
          <div className="py-6">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 mb-4">
              <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-emerald-500/30 text-xs text-slate-300 flex items-center justify-between gap-3 shadow-lg">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-white">Authentication Gate:</span>{' '}
                    <span className="text-slate-400">Complete Factor 1 (Password) + Factor 2 (OTP / TOTP) to unlock your dashboards.</span>
                  </div>
                </div>

                <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-400">
                  <span>Demo Admin: <strong className="text-purple-300 font-mono">admin</strong></span>
                  <span>&bull;</span>
                  <span>User: <strong className="text-teal-300 font-mono">john_doe</strong></span>
                </div>
              </div>
            </div>

            <AuthFlow
              onSuccess={handleAuthSuccess}
              onOpenMailbox={() => setIsMailboxOpen(true)}
              onOpenAuthenticator={() => setIsAuthenticatorOpen(true)}
              initialOtpFill={otpFill}
              initialTotpFill={totpFill}
            />
          </div>
        ) : (
          /* ONCE LOGGED IN: Render the selected dashboard */
          <div>
            {activeTab === 'security' && (
              <UserSecurityDashboard
                currentUser={currentUser}
                onUserUpdate={refreshAppState}
                onOpenAuthenticator={() => setIsAuthenticatorOpen(true)}
                onOpenMailbox={() => setIsMailboxOpen(true)}
              />
            )}

            {activeTab === 'admin' && (
              currentUser.role === 'admin' ? (
                <AdminDashboard onRefreshNeeded={refreshAppState} />
              ) : (
                <div className="max-w-md mx-auto my-20 p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-red-950/40 text-red-400 border border-red-500/30 flex items-center justify-center mx-auto">
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Access Denied: Admin Role Required</h3>
                  <p className="text-xs text-slate-400">
                    Your current account (<span className="text-white font-mono">{currentUser.username}</span>) has role <span className="font-mono text-amber-300 font-bold">{currentUser.role}</span>.
                    Only accounts with Administrator privileges can access the Admin & Audit Command Center.
                  </p>
                  <button
                    onClick={() => setActiveTab('security')}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                  >
                    Return to User Security
                  </button>
                </div>
              )
            )}

            {activeTab === 'simulator' && <AttackSimulator />}

            {activeTab === 'tally' && <ProposalTallyView />}

            {activeTab === 'docs' && <DocumentationHub />}

            {activeTab === 'python' && <PythonCodeViewer />}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 px-4 text-center text-xs text-slate-500 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Multi-Factor Authentication & Verification System &bull; Domain: Password & Authentication</span>
          </div>
          <div>
            Compliant with NIST SP 800-63B & RFC 6238 TOTP Standard &bull; Built with React 19 & Tailwind CSS
          </div>
        </div>
      </footer>

      {/* Modals & Tool Drawers */}
      <VirtualMailboxModal
        isOpen={isMailboxOpen}
        onClose={() => setIsMailboxOpen(false)}
        emails={emails}
        onSelectCode={handleSelectOtpFromMailbox}
        onVerifyEmail={handleVerifyEmailFromMailbox}
        onClear={() => {
          store.clearEmails();
          setEmails([]);
        }}
      />

      <VirtualAuthenticatorModal
        isOpen={isAuthenticatorOpen}
        onClose={() => setIsAuthenticatorOpen(false)}
        activeSecret={currentUser?.totp_secret || 'JBSWY3DPEHPK3PXP'}
        username={currentUser?.username || 'admin'}
        onUseCode={handleUseTotpCode}
      />
    </div>
  );
}
