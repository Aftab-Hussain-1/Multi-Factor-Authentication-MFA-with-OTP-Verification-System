/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  ShieldCheck,
  Mail,
  Smartphone,
  Lock,
  Terminal,
  CheckCircle2,
  LogOut,
  FileCode,
  Sliders,
  RotateCcw,
  BookOpen,
} from 'lucide-react';
import { User } from '../types/auth';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: User | null;
  unreadEmailCount: number;
  onOpenMailbox: () => void;
  onOpenAuthenticator: () => void;
  onLogout: () => void;
  onResetDemo: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  unreadEmailCount,
  onOpenMailbox,
  onOpenAuthenticator,
  onLogout,
  onResetDemo,
}) => {
  const authenticatedTabs = [
    { id: 'security', label: 'User Security', icon: ShieldCheck, adminOnly: false },
    { id: 'admin', label: 'Admin & Audit', icon: Sliders, adminOnly: true },
    { id: 'simulator', label: 'Attack Simulator', icon: Terminal, adminOnly: false },
    { id: 'tally', label: 'Proposal Tally', icon: CheckCircle2, adminOnly: false },
    { id: 'docs', label: 'Docs & Report', icon: BookOpen, adminOnly: false },
    { id: 'python', label: 'Python Source', icon: FileCode, adminOnly: false },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-md select-none print:hidden">
      {/* TIER 1: Main Brand & Utility Toolbar (h-16) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* LEFT: Clean Brand & Identity */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-md shadow-emerald-500/20 shrink-0">
              <ShieldCheck className="w-5 h-5 text-slate-950 font-bold" />
            </div>
            <div className="flex items-center gap-2.5">
              <span className="font-extrabold tracking-tight text-white text-base">MFA & OTP Core</span>
              <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hidden sm:inline-block">
                RFC 6238 / NIST
              </span>
            </div>
          </div>

          {/* RIGHT: Dedicated Utility Tools & User Profile */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Virtual Mailbox Tool */}
            <button
              onClick={onOpenMailbox}
              title="Open Virtual Real-Time SMTP Mailbox"
              className="relative h-9 px-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 transition-colors border border-slate-700/80 flex items-center justify-center gap-2 text-xs font-semibold"
            >
              <Mail className="w-4 h-4 text-emerald-400" />
              <span>Inbox</span>
              {unreadEmailCount > 0 && (
                <span className="bg-emerald-500 text-slate-950 font-extrabold text-[10px] rounded-full px-1.5 py-0.2 min-w-[18px] text-center shadow">
                  {unreadEmailCount}
                </span>
              )}
            </button>

            {/* Virtual Authenticator Tool */}
            <button
              onClick={onOpenAuthenticator}
              title="Open Virtual Smartphone Authenticator"
              className="h-9 px-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 transition-colors border border-slate-700/80 flex items-center justify-center gap-2 text-xs font-semibold"
            >
              <Smartphone className="w-4 h-4 text-teal-400" />
              <span className="hidden sm:inline">Auth App</span>
            </button>

            {/* Reset Demo Button */}
            <button
              onClick={onResetDemo}
              title="Reset system to clean proposal demo state"
              className="h-9 px-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/60 text-xs transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Reset</span>
            </button>

            {/* User Session Profile or Sign In State */}
            {currentUser ? (
              <div className="flex items-center gap-2.5 pl-2 border-l border-slate-800">
                <div className="flex items-center gap-2 bg-slate-950/70 px-3 py-1.5 rounded-xl border border-slate-800">
                  <div className="text-right">
                    <div className="text-xs font-bold text-white leading-tight flex items-center gap-1.5">
                      <span>{currentUser.username}</span>
                      <span
                        className={`text-[9px] uppercase px-1.5 py-0.2 rounded font-extrabold ${
                          currentUser.role === 'admin'
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        }`}
                      >
                        {currentUser.role}
                      </span>
                    </div>
                    <div className="text-[10px] text-emerald-400 font-mono leading-none mt-0.5">
                      {currentUser.mfa_enabled ? 'MFA Protected' : 'MFA Off'}
                    </div>
                  </div>
                </div>

                <button
                  onClick={onLogout}
                  title="Sign Out"
                  className="h-9 px-3 rounded-xl bg-red-950/30 hover:bg-red-900/50 text-red-400 border border-red-900/40 transition-colors flex items-center gap-1.5 text-xs font-bold"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                <button
                  onClick={() => setActiveTab('auth')}
                  className="h-9 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold transition-all shadow-md shadow-emerald-500/20 flex items-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* TIER 2: Dedicated Navigation Tabs Bar (Shown ONLY when logged in!) */}
      {currentUser && (
        <div className="bg-slate-950/90 border-t border-slate-800/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center space-x-2 py-2 overflow-x-auto scrollbar-none">
              {authenticatedTabs.map(tab => {
                if (tab.adminOnly && currentUser.role !== 'admin') {
                  return null;
                }
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`h-9 px-4 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all shrink-0 ${
                      isActive
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-slate-900 border border-slate-800/60'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};
