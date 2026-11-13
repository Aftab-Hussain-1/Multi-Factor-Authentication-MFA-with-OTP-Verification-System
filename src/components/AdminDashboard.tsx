/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Users,
  ShieldCheck,
  ShieldAlert,
  Unlock,
  KeyRound,
  Database,
  Search,
  Filter,
  RefreshCw,
  Clock,
  Terminal,
  Activity,
  UserCheck,
  UserX,
  FileText,
} from 'lucide-react';
import { User, AuditLog, AuditEventType, AuditStatus } from '../types/auth';
import { AuthStore } from '../services/authStore';

interface AdminDashboardProps {
  onRefreshNeeded?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onRefreshNeeded }) => {
  const store = AuthStore.getInstance();
  const [users, setUsers] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [metrics, setMetrics] = useState(store.getSystemMetrics());
  const [activeSubTab, setActiveSubTab] = useState<'users' | 'audit' | 'database'>('users');

  // Audit filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [eventFilter, setEventFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Database table view state
  const [selectedDbTable, setSelectedDbTable] = useState<'users' | 'otp_codes' | 'backup_codes' | 'audit_logs'>('users');

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setUsers(store.getUsers());
    setAuditLogs(store.getAuditLogs());
    setMetrics(store.getSystemMetrics());
    if (onRefreshNeeded) onRefreshNeeded();
  };

  // Handle Admin Manual Unlock
  const handleUnlockUser = (userId: string) => {
    const res = store.unlockUser(userId);
    refreshData();
    alert(res.message);
  };

  // Handle Role Toggle
  const handleToggleRole = (userId: string) => {
    store.toggleUserRole(userId);
    refreshData();
  };

  // Filtered Audit Logs
  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch =
      log.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.ip_address.includes(searchQuery) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesEvent = eventFilter === 'ALL' || log.event === eventFilter;
    const matchesStatus = statusFilter === 'ALL' || log.status === statusFilter;
    return matchesSearch && matchesEvent && matchesStatus;
  });

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* Admin Title & Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/20">
              Admin Console
            </span>
            <span className="text-xs text-slate-400 font-mono">Proposal Sec 8 & 10</span>
          </div>
          <h2 className="text-2xl font-bold text-white mt-1">Authentication & Audit Command Center</h2>
          <p className="text-xs text-slate-400">
            Real-time telemetry, lockout intervention, database verification, and comprehensive forensic audit logging.
          </p>
        </div>

        <button
          onClick={refreshData}
          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 border border-slate-700 transition-colors self-start"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Telemetry
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Users */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Total Accounts</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">{metrics.totalUsers}</div>
          <div className="text-[10px] text-slate-500">Registered identities</div>
        </div>

        {/* MFA Adoption Rate */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>MFA Adoption</span>
            <ShieldCheck className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-teal-400">{metrics.mfaAdoptionRate}%</div>
          <div className="text-[10px] text-slate-500">Factor 2 enforced</div>
        </div>

        {/* Active Lockouts */}
        <div
          className={`border rounded-2xl p-4 space-y-1 transition-colors ${
            metrics.activeLockouts > 0
              ? 'bg-red-950/30 border-red-500/40 text-red-300'
              : 'bg-slate-900 border-slate-800 text-slate-400'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-medium">
            <span>Active Lockouts</span>
            <ShieldAlert className={`w-4 h-4 ${metrics.activeLockouts > 0 ? 'text-red-400 animate-bounce' : 'text-slate-500'}`} />
          </div>
          <div className={`text-2xl font-bold font-mono ${metrics.activeLockouts > 0 ? 'text-red-400' : 'text-white'}`}>
            {metrics.activeLockouts}
          </div>
          <div className="text-[10px] text-slate-500">15-min brute-force blocks</div>
        </div>

        {/* Failed Attempt Events */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Auth Failures</span>
            <Activity className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400">{metrics.failedLogins}</div>
          <div className="text-[10px] text-slate-500">Password & OTP rejections</div>
        </div>

        {/* Audit Log Events Total */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1 col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Audit Entries</span>
            <FileText className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">{metrics.totalEvents}</div>
          <div className="text-[10px] text-slate-500">Immutable forensic logs</div>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex border-b border-slate-800 gap-4 text-sm font-semibold">
        <button
          onClick={() => setActiveSubTab('users')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
            activeSubTab === 'users'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          User Management & Lockout Control
        </button>

        <button
          onClick={() => setActiveSubTab('audit')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
            activeSubTab === 'audit'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity className="w-4 h-4" />
          Live Audit Trail ({auditLogs.length})
        </button>

        <button
          onClick={() => setActiveSubTab('database')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
            activeSubTab === 'database'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Database className="w-4 h-4" />
          Relational Database Inspector (Proposal Sec 9)
        </button>
      </div>

      {/* TAB 1: USER MANAGEMENT & UNLOCK CONTROLS */}
      {activeSubTab === 'users' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="px-6 py-4 bg-slate-950/40 border-b border-slate-800 flex items-center justify-between">
            <h3 className="font-bold text-white text-base">Registered Users & Lockout States</h3>
            <span className="text-xs text-slate-400">Total: {users.length} accounts</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                <tr>
                  <th className="px-6 py-3.5">User Details</th>
                  <th className="px-4 py-3.5">Role</th>
                  <th className="px-4 py-3.5">MFA Status</th>
                  <th className="px-4 py-3.5">Failed Passwords</th>
                  <th className="px-4 py-3.5">Lockout Status</th>
                  <th className="px-6 py-3.5 text-right">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {users.map(u => {
                  const isLocked = u.locked_until && new Date(u.locked_until).getTime() > Date.now();
                  const remainingMinutes = isLocked
                    ? Math.ceil((new Date(u.locked_until!).getTime() - Date.now()) / 60000)
                    : 0;

                  return (
                    <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-white text-sm">{u.username}</div>
                        <div className="text-slate-400 text-xs font-mono">{u.email}</div>
                      </td>

                      <td className="px-4 py-4">
                        <button
                          onClick={() => handleToggleRole(u.id)}
                          title="Click to toggle role"
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase cursor-pointer border transition-colors ${
                            u.role === 'admin'
                              ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                              : 'bg-slate-800 text-slate-300 border-slate-700'
                          }`}
                        >
                          {u.role}
                        </button>
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                            u.mfa_enabled
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-slate-800 text-slate-500'
                          }`}
                        >
                          {u.mfa_enabled ? 'Enforced' : 'Off'}
                        </span>
                      </td>

                      <td className="px-4 py-4 font-mono">
                        <span
                          className={`font-bold ${
                            u.failed_attempts >= 5
                              ? 'text-red-400'
                              : u.failed_attempts > 0
                              ? 'text-amber-400'
                              : 'text-slate-400'
                          }`}
                        >
                          {u.failed_attempts} / 5
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        {isLocked ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-red-950/60 text-red-400 border border-red-500/40 animate-pulse">
                            <ShieldAlert className="w-3.5 h-3.5" />
                            LOCKED ({remainingMinutes}m left)
                          </span>
                        ) : (
                          <span className="text-emerald-400 flex items-center gap-1 text-xs">
                            <UserCheck className="w-3.5 h-3.5" />
                            Active / Normal
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-right">
                        {isLocked ? (
                          <button
                            onClick={() => handleUnlockUser(u.id)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 ml-auto shadow-sm transition-all"
                          >
                            <Unlock className="w-3.5 h-3.5" />
                            Unlock Account
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              // Simulate locking user for testing
                              u.failed_attempts = 5;
                              u.locked_until = new Date(Date.now() + 15 * 60 * 1000).toISOString();
                              store.logEvent('ACCOUNT_LOCKED', 'WARNING', `Admin triggered test lockout on ${u.username}`, u);
                              refreshData();
                            }}
                            className="text-[11px] text-slate-400 hover:text-red-400 hover:underline"
                          >
                            Simulate Lockout
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: AUDIT TRAIL */}
      {activeSubTab === 'audit' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl space-y-4 p-6">
          {/* Filters Bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs">
            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search user, IP, or details..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Event Filter */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <span className="text-slate-400">Event:</span>
              <select
                value={eventFilter}
                onChange={e => setEventFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none"
              >
                <option value="ALL">All Security Events</option>
                <option value="LOGIN_SUCCESS">LOGIN_SUCCESS</option>
                <option value="LOGIN_FAILED">LOGIN_FAILED</option>
                <option value="OTP_SENT">OTP_SENT</option>
                <option value="OTP_VERIFIED">OTP_VERIFIED</option>
                <option value="OTP_FAILED">OTP_FAILED</option>
                <option value="ACCOUNT_LOCKED">ACCOUNT_LOCKED</option>
                <option value="ACCOUNT_UNLOCKED">ACCOUNT_UNLOCKED</option>
                <option value="TOTP_VERIFIED">TOTP_VERIFIED</option>
                <option value="BACKUP_CODE_USED">BACKUP_CODE_USED</option>
                <option value="SECURITY_ATTACK_BLOCKED">SECURITY_ATTACK_BLOCKED</option>
              </select>

              {/* Status Filter */}
              <span className="text-slate-400 ml-2">Status:</span>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="SUCCESS">SUCCESS</option>
                <option value="FAILURE">FAILURE</option>
                <option value="WARNING">WARNING</option>
                <option value="BLOCKED">BLOCKED</option>
              </select>
            </div>
          </div>

          {/* Audit Logs Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Event</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Target User</th>
                  <th className="px-4 py-3">IP Address</th>
                  <th className="px-4 py-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                {filteredLogs.map(log => {
                  let statusBadge = 'bg-slate-800 text-slate-300';
                  if (log.status === 'SUCCESS') statusBadge = 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30';
                  if (log.status === 'FAILURE') statusBadge = 'bg-red-500/15 text-red-400 border border-red-500/30';
                  if (log.status === 'WARNING') statusBadge = 'bg-amber-500/15 text-amber-400 border border-amber-500/30';
                  if (log.status === 'BLOCKED') statusBadge = 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold';

                  return (
                    <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>
                      <td className="px-4 py-3 font-bold text-white whitespace-nowrap">{log.event}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${statusBadge}`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-300 whitespace-nowrap">{log.username}</td>
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{log.ip_address}</td>
                      <td className="px-4 py-3 text-slate-300 font-sans text-xs">{log.details}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: RELATIONAL DATABASE INSPECTOR */}
      {activeSubTab === 'database' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Database className="w-5 h-5 text-emerald-400" />
                Relational Database Inspector (Proposal Section 9)
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Inspect raw table entities to confirm hash-only OTP storage, salt hashing, and relational foreign keys.
              </p>
            </div>

            {/* Table Selector */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
              {(['users', 'otp_codes', 'backup_codes', 'audit_logs'] as const).map(tableName => (
                <button
                  key={tableName}
                  onClick={() => setSelectedDbTable(tableName)}
                  className={`px-3 py-1.5 rounded-lg font-mono font-semibold transition-colors ${
                    selectedDbTable === tableName
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tableName}
                </button>
              ))}
            </div>
          </div>

          {/* Table Schema Description Note */}
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-xs space-y-2">
            <div className="font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              Inspecting Schema: <span className="font-mono text-emerald-400">{selectedDbTable}</span>
            </div>
            {selectedDbTable === 'otp_codes' && (
              <p className="text-slate-400 leading-relaxed">
                <strong>Crucial Proposal Compliance Note:</strong> Notice the <code className="text-teal-300 font-mono">otp_hash</code> column.
                The 6-digit OTP code is <strong>NEVER stored in plain text</strong>. The hash expires automatically after 5 minutes,
                tracks wrong attempts (max 3), and enforces the <code className="text-teal-300 font-mono">is_used</code> flag to prevent replay attacks.
              </p>
            )}
            {selectedDbTable === 'users' && (
              <p className="text-slate-400 leading-relaxed">
                Contains user records with <code className="text-teal-300 font-mono">password_hash</code>, <code className="text-teal-300 font-mono">role</code> (user/admin),
                <code className="text-teal-300 font-mono">failed_attempts</code>, and <code className="text-teal-300 font-mono">locked_until</code> for 15-minute brute-force lockout.
              </p>
            )}
            {selectedDbTable === 'backup_codes' && (
              <p className="text-slate-400 leading-relaxed">
                Each emergency recovery code is individually hashed (<code className="text-teal-300 font-mono">code_hash</code>) with a preview mask and marked <code className="text-teal-300 font-mono">is_used</code> once consumed.
              </p>
            )}
            {selectedDbTable === 'audit_logs' && (
              <p className="text-slate-400 leading-relaxed">
                Immutable audit trail recording all authentication events, IP addresses, statuses, and granular details.
              </p>
            )}
          </div>

          {/* Raw JSON / Table Viewer */}
          <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 overflow-x-auto max-h-96">
            <pre className="text-[11px] font-mono text-slate-300 leading-relaxed">
              {JSON.stringify(
                selectedDbTable === 'users'
                  ? store.getUsers()
                  : selectedDbTable === 'otp_codes'
                  ? store.getOTPRecords()
                  : selectedDbTable === 'backup_codes'
                  ? store.getBackupCodes()
                  : store.getAuditLogs().slice(0, 20),
                null,
                2
              )}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
