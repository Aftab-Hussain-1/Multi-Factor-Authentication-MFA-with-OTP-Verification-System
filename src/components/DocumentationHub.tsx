/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  BookOpen,
  Globe,
  Video,
  Copy,
  Check,
  Download,
  Printer,
  ShieldCheck,
  Cpu,
  Terminal,
  GitBranch,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  FileText,
  ExternalLink,
  Layers,
  Lock,
  Database,
  Mail,
  Smartphone,
  Camera,
} from 'lucide-react';

const LIVE_URL = 'https://ais-pre-xmln3kujbraieztns5vza3-475063702757.asia-southeast1.run.app';

export const DocumentationHub: React.FC = () => {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>('all');

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(LIVE_URL);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleCopyCmd = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const handlePrintPdf = () => {
    window.print();
  };

  const handleDownloadFullReport = () => {
    const markdown = `# FINAL PROJECT SUBMISSION DOCUMENTATION
## Multi-Factor Authentication (MFA) with OTP & TOTP Verification System

- **Domain:** Password & Authentication (Project #5 and #9)
- **Live Deployed URL:** ${LIVE_URL}
- **Submission Deadline:** 22 November
- **Compliance:** NIST SP 800-63B | RFC 6238 | OWASP ASVS

---

## 1. Live URL & Video Demonstration Script
- **Live URL:** ${LIVE_URL}
- **Demo Accounts:**
  - Admin: \`admin\` / \`AdminPass@2026\`
  - Standard User (MFA On): \`john_doe\` / \`UserPass@2026\`
  - Standard User (MFA Off): \`alice_smith\` / \`AlicePass@2026\`

### 3-Minute Video Walkthrough Script
1. **0:00 - 0:30 (Authentication Gate):** Show locked dashboards before login, explain risks of password-only auth, and sign in with \`admin\` / \`AdminPass@2026\`.
2. **0:30 - 1:15 (Factor 2 - Email OTP):** Open **Inbox**, show 6-digit OTP email, highlight 5-minute TTL and 3-attempt limit, auto-fill and verify.
3. **1:15 - 1:45 (TOTP & Backup Codes):** Open **User Security**, demonstrate QR code setup, live **Auth App** 30s rolling code, and single-use hashed Backup Codes.
4. **1:45 - 2:30 (Admin & Audit Console):** Open **Admin & Audit**, show KPI cards, filter \`audit_logs\`, inspect \`otp_codes\` in Database Inspector (showing \`otp_hash\` only), and demonstrate 1-click Account Unlock.
5. **2:30 - 3:15 (Attack Simulator & Tally):** Run all 8 live attack simulations (Brute Force, OTP Guessing, Replay, Expired OTP, SQLi, XSS) and review **Proposal Tally** (100% compliant).

---

## 2. Project Overview & Objectives
Passwords alone are vulnerable to phishing, credential stuffing, brute-force guessing, and database breaches. This system implements a complete Multi-Factor Authentication (MFA) pipeline combining Factor 1 (Password + Lockout Defense) and Factor 2 (Hashed 6-Digit Email OTP, RFC 6238 TOTP, and One-Time Backup Codes).

### Objectives
1. Secure registration with password strength validation and salted hashing.
2. Cryptographically secure 6-digit Email OTP (hash-only DB storage, 5-min TTL, max 3 attempts, replay protection).
3. RFC 6238 TOTP Authenticator integration via Base32 secret & scannable QR codes.
4. Eight hashed one-time emergency backup recovery codes.
5. Brute-force protection: 5 failed password attempts trigger a 15-minute account lockout.
6. Immutable audit logging across 16 security event types.
7. Executive Admin Command Center with telemetry, database inspection, and 1-click unlock.
8. Interactive Security Testing Harness validating defenses against OWASP top auth attacks.

---

## 3. Features & Technologies Used
- **Frontend:** React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Canvas Confetti, Vite 8
- **Cryptography:** WebCrypto API (CSPRNG, SHA-256, HMAC-SHA1), RFC 6238 TOTP, \`qrcode\`
- **Backend Reference:** Python 3.10+, Flask, SQLAlchemy ORM, Werkzeug Security, PyOTP, Flask-Limiter, Flask-WTF
- **Unique Additions:** Virtual Real-Time SMTP Mailbox, Virtual Smartphone Authenticator, Live Attack Simulator, Relational Database Inspector, Proposal Compliance Matrix

---

## 4. Installation & Setup Instructions
1. Ensure folder path has NO \`&\` character (Windows \`cmd.exe\` requirement).
2. Run \`npm install\` in VS Code terminal.
3. Copy environment file: \`cp .env.example .env\`.
4. Start dev server: \`npm run dev\`.
5. Open \`http://localhost:3000\` in browser.

---

## 5. System Workflow & Architecture
1. **Factor 1:** User submits credentials -> Check \`locked_until\` -> Verify salted \`password_hash\` -> 5 failures = 15-min lockout.
2. **Factor 2:** Generate 6-digit CSPRNG OTP -> Store \`SHA-256(otp)\` with 5-min TTL -> Verify within 3 attempts -> Mark \`is_used = true\` (or verify RFC 6238 TOTP / Backup Code).
3. **Audit & Access:** Log \`LOGIN_SUCCESS\` in \`audit_logs\` and unlock role-appropriate dashboards.

---

## 6. Testing & Results
- **Brute-Force Password (5 failures):** Account locked 15 minutes — **PASSED**
- **OTP Guessing (3 wrong codes):** OTP invalidated at attempt 3/3 — **PASSED**
- **OTP Replay Attack:** Consumed OTP rejected (\`is_used=true\`) — **PASSED**
- **Expired OTP (>5 min):** Rejected on TTL check — **PASSED**
- **TOTP Drift Window (±30s):** Stale (-90s) token rejected — **PASSED**
- **Backup Code Reuse:** Single-use verified — **PASSED**
- **SQL Injection & XSS:** Neutralized via parameterized queries & DOM escaping — **PASSED**

---

## 7. Challenges & Future Improvements
### Challenges Solved
- Storing OTPs and backup codes securely as irreversible hashes instead of plain text.
- Preventing replay and race conditions with atomic \`is_used\` invalidation.
- Enabling zero-config evaluation via in-browser SMTP Mailbox & Smartphone Authenticator.
- Resolving Windows \`cmd.exe\` path-splitting errors caused by \`&\` in folder names.

### Future Enhancements
- FIDO2 / WebAuthn hardware keys and Passkeys.
- Biometric authentication (Fingerprint / Face ID).
- Adaptive risk-based authentication (geolocation & anomaly scoring).
- Distributed Redis rate limiting for multi-node deployments.

---

## 8. Conclusion & References
### Conclusion
Combining strong credential hashing, brute-force account lockout, short-lived hashed OTPs, RFC 6238 TOTP, backup recovery codes, and full audit logging significantly reduces account takeover risk and satisfies modern authentication standards.

### References
1. NIST SP 800-63B: Digital Identity Guidelines
2. RFC 6238: TOTP Algorithm (IETF)
3. RFC 4226: HOTP Algorithm (IETF)
4. OWASP Authentication Cheat Sheet
5. OWASP Application Security Verification Standard (ASVS)
6. Flask & SQLAlchemy Documentation
7. PyOTP Documentation
`;
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'MFA_Final_Submission_Documentation.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  const navPills = [
    { id: 'all', label: 'Complete Report' },
    { id: 'overview', label: 'Overview & Tech' },
    { id: 'architecture', label: 'Architecture & Flow' },
    { id: 'setup', label: 'Setup & Usage' },
    { id: 'testing', label: 'Testing & Results' },
    { id: 'conclusion', label: 'Challenges & Refs' },
  ];

  const show = (sectionId: string) => activeSection === 'all' || activeSection === sectionId;

  const testCases = [
    { name: 'Valid Password + Valid Email OTP', method: 'Functional', expected: 'Login succeeds, OTP marked used', actual: 'Authenticated, is_used=true', status: 'PASS' },
    { name: 'Valid Password + Wrong OTP (3x)', method: 'Functional', expected: 'Code invalidated on 3rd failure', actual: 'Invalidated at 3/3 attempts', status: 'PASS' },
    { name: 'Expired OTP (> 5 minutes)', method: 'Functional', expected: 'Rejected as expired', actual: 'Rejected with TTL error', status: 'PASS' },
    { name: 'OTP Replay Attack', method: 'Security', expected: 'Reused OTP blocked', actual: 'Blocked via is_used shield', status: 'PASS' },
    { name: 'Brute-Force (5 Wrong Passwords)', method: 'Security', expected: 'Account locked for 15 minutes', actual: 'locked_until set +15m', status: 'PASS' },
    { name: 'Admin Manual Account Unlock', method: 'Functional', expected: 'Lockout cleared immediately', actual: 'Restored to Active state', status: 'PASS' },
    { name: 'RFC 6238 TOTP & Drift (±30s)', method: 'Functional', expected: 'Current passes; -90s stale fails', actual: 'Stale code rejected', status: 'PASS' },
    { name: 'Backup Code Single-Use', method: 'Security', expected: 'Works once only', actual: 'Second submission rejected', status: 'PASS' },
    { name: "SQL Injection (' OR '1'='1')", method: 'Security', expected: 'ORM parameterization blocks SQLi', actual: 'Treated as literal, denied', status: 'PASS' },
    { name: 'XSS (<script>alert(1)</script>)', method: 'Security', expected: 'Escaped safely in UI', actual: 'Script neutralized in DOM', status: 'PASS' },
  ];

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 space-y-8 print:bg-white print:text-black print:py-2">
      {/* Header & Export Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Final Submission Package
            </span>
            <span className="text-xs text-slate-400 font-mono">Deadline: 22 November</span>
          </div>
          <h2 className="text-2xl font-bold text-white mt-1 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-emerald-400" />
            Project Documentation & Submission Center
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Complete documentation matching all submission requirements — exportable as Markdown or printable directly to PDF.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={handleDownloadFullReport}
            className="h-9 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            Download Report (.md)
          </button>

          <button
            onClick={handlePrintPdf}
            className="h-9 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
          >
            <Printer className="w-4 h-4" />
            Print / Save as PDF
          </button>
        </div>
      </div>

      {/* Print-Only Cover Header */}
      <div className="hidden print:block border-b-2 border-slate-300 pb-4 mb-6">
        <h1 className="text-2xl font-bold text-black">
          Multi-Factor Authentication (MFA) with OTP & TOTP Verification System
        </h1>
        <p className="text-sm text-slate-700 mt-1">
          Final Project Documentation &bull; Domain: Password & Authentication &bull; Live URL: {LIVE_URL}
        </p>
      </div>

      {/* Section Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs print:hidden">
        {navPills.map(pill => (
          <button
            key={pill.id}
            onClick={() => setActiveSection(pill.id)}
            className={`px-3.5 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-colors ${
              activeSection === pill.id
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {pill.label}
          </button>
        ))}
      </div>

      {/* 1. LIVE URL & VIDEO DEMO SCRIPT */}
      {show('overview') && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Live URL Card */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 print:border-slate-300 print:bg-white">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <Globe className="w-4 h-4" />
              Live Deployment URL
            </div>
            <p className="text-xs text-slate-400 print:text-slate-700">
              Your application is deployed live and ready to include in your final submission form:
            </p>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-teal-300 break-all select-all print:bg-slate-100 print:text-black print:border-slate-300">
              {LIVE_URL}
            </div>
            <div className="flex items-center gap-2 print:hidden">
              <button
                onClick={handleCopyUrl}
                className="flex-1 h-9 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center justify-center gap-2 border border-slate-700"
              >
                {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedUrl ? 'URL Copied!' : 'Copy Live URL'}
              </button>
              <a
                href={LIVE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 px-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Open
              </a>
            </div>
          </div>

          {/* 3-Min Video Demo Script Card */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3 print:border-slate-300 print:bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-wider">
                <Video className="w-4 h-4" />
                Video Demonstration Walkthrough Script (3 Min)
              </div>
              <span className="text-[10px] font-mono text-slate-500">Optional backup for Live URL</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 print:bg-slate-50 print:border-slate-200">
                <div className="font-bold text-white print:text-black">0:00 - 0:30 &bull; Auth Gate</div>
                <p className="text-slate-400 text-[11px] mt-0.5 print:text-slate-700">Show locked dashboards and log in with <code className="text-emerald-400 print:text-black">admin</code> / <code className="text-emerald-400 print:text-black">AdminPass@2026</code>.</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 print:bg-slate-50 print:border-slate-200">
                <div className="font-bold text-white print:text-black">0:30 - 1:15 &bull; Email OTP</div>
                <p className="text-slate-400 text-[11px] mt-0.5 print:text-slate-700">Open <strong>Inbox</strong>, show 6-digit OTP email (5m TTL, 3 attempts), click <strong>Auto-Fill</strong>.</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 print:bg-slate-50 print:border-slate-200">
                <div className="font-bold text-white print:text-black">1:15 - 2:15 &bull; Security & Admin</div>
                <p className="text-slate-400 text-[11px] mt-0.5 print:text-slate-700">Show QR TOTP, <strong>Auth App</strong> simulator, Backup Codes, and <strong>Admin</strong> DB Inspector (<code className="text-teal-300 print:text-black">otp_hash</code>).</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 print:bg-slate-50 print:border-slate-200">
                <div className="font-bold text-white print:text-black">2:15 - 3:00 &bull; Attack Simulator</div>
                <p className="text-slate-400 text-[11px] mt-0.5 print:text-slate-700">Run all 8 tests in <strong>Attack Simulator</strong> and show 100% pass in <strong>Proposal Tally</strong>.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. PROJECT OVERVIEW, OBJECTIVES, FEATURES & TECH STACK */}
      {show('overview') && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 print:border-slate-300 print:bg-white">
          <div className="border-b border-slate-800 pb-4 print:border-slate-300">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 print:text-black">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              Project Overview, Objectives & Technologies Used
            </h3>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed print:text-slate-800">
            Traditional password-only systems suffer from phishing, credential stuffing, keylogging, and database breach risks.
            This project implements a production-grade <strong>Multi-Factor Authentication (MFA) with OTP & TOTP Verification System</strong> compliant with <strong>NIST SP 800-63B</strong> and <strong>RFC 6238</strong>. Every sign-in enforces Factor 1 (salted password verification with 5-attempt/15-minute brute-force lockout) followed by Factor 2 (6-digit hashed Email OTP with 5-minute TTL, RFC 6238 TOTP Authenticator, or single-use Backup Recovery Codes), backed by an immutable audit trail and administrative command center.
          </p>

          {/* 8 Objectives */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-3">Core Objectives</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs text-slate-300 print:text-slate-800">
              {[
                '1. Secure registration with entropy checks and salted password hashing.',
                '2. Cryptographically secure 6-digit Email OTP (hash-only DB storage, 5m TTL, 3 tries).',
                '3. RFC 6238 TOTP Authenticator support via Base32 secret and scannable QR code.',
                '4. Eight single-use hashed emergency Backup Recovery Codes with TXT export.',
                '5. Brute-force account lockout after 5 consecutive failures for 15 minutes.',
                '6. Immutable audit logging (audit_logs) across 16 security event types.',
                '7. Admin Command Center with KPI metrics, DB inspector, and 1-click unlock.',
                '8. Automated Security Testing Harness validating OWASP authentication defenses.',
              ].map((obj, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center gap-2 print:bg-slate-50 print:border-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{obj}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tech Stack Table */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-teal-400 mb-3 flex items-center gap-1.5">
              <Cpu className="w-4 h-4" />
              Technologies & Architecture Stack
            </h4>
            <div className="overflow-x-auto rounded-2xl border border-slate-800 print:border-slate-300">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] border-b border-slate-800 print:bg-slate-100 print:text-black">
                  <tr>
                    <th className="px-4 py-3">Layer</th>
                    <th className="px-4 py-3">Technologies Used</th>
                    <th className="px-4 py-3">Security Purpose</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300 print:divide-slate-200 print:text-slate-800">
                  <tr>
                    <td className="px-4 py-3 font-semibold text-white print:text-black">Frontend Interface</td>
                    <td className="px-4 py-3 font-mono text-[11px]">React 19, TypeScript, Tailwind CSS v4, Vite 8</td>
                    <td className="px-4 py-3">XSS-escaped DOM, responsive auth gate & dashboards</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-semibold text-white print:text-black">Cryptography & MFA</td>
                    <td className="px-4 py-3 font-mono text-[11px]">WebCrypto (CSPRNG, SHA-256, HMAC-SHA1), RFC 6238, qrcode</td>
                    <td className="px-4 py-3">Hash-only OTP/password storage & 30s rolling TOTP</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-semibold text-white print:text-black">Backend Reference</td>
                    <td className="px-4 py-3 font-mono text-[11px]">Python 3.10+, Flask, SQLAlchemy, PyOTP, Flask-Limiter</td>
                    <td className="px-4 py-3">Modular ORM models, parameterized queries, rate limiting</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-semibold text-white print:text-black">Database Schema</td>
                    <td className="px-4 py-3 font-mono text-[11px]">users, otp_codes, backup_codes, audit_logs</td>
                    <td className="px-4 py-3">Relational integrity, replay protection, forensic audit trail</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. SYSTEM WORKFLOW & ARCHITECTURE (CRISP VECTOR SVG DIAGRAMS) */}
      {show('architecture') && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 print:border-slate-300 print:bg-white">
          <div className="border-b border-slate-800 pb-4 print:border-slate-300">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 print:text-black">
              <GitBranch className="w-5 h-5 text-teal-400" />
              System Architecture & Authentication Workflow
            </h3>
            <p className="text-xs text-slate-400 mt-1 print:text-slate-700">
              End-to-end architectural layers and decision pipeline for Factor 1 lockout and Factor 2 OTP/TOTP verification.
            </p>
          </div>

          {/* Vector Architecture Diagram */}
          <div className="bg-slate-950 rounded-2xl p-4 sm:p-6 border border-slate-800 overflow-x-auto print:bg-slate-50 print:border-slate-300">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3 print:text-black">
              Figure 1: Layered System Architecture
            </div>
            <svg viewBox="0 0 860 270" className="w-full min-w-[640px] h-auto">
              {/* Layer 1: Client */}
              <rect x="20" y="15" width="820" height="62" rx="12" fill="#0f172a" stroke="#10b981" strokeWidth="1.5" />
              <text x="40" y="38" fill="#34d399" fontSize="11" fontWeight="bold" fontFamily="monospace">PRESENTATION LAYER (React 19 + TypeScript + Tailwind)</text>
              <text x="40" y="58" fill="#cbd5e1" fontSize="11">Auth Gate (Login/Register)   |   Virtual SMTP Inbox   |   Virtual TOTP App   |   User Security   |   Admin & Audit   |   Attack Simulator</text>

              {/* Arrow Down */}
              <line x1="430" y1="77" x2="430" y2="103" stroke="#14b8a6" strokeWidth="2" />
              <polygon points="425,98 435,98 430,106" fill="#14b8a6" />

              {/* Layer 2: Security Engine */}
              <rect x="20" y="106" width="820" height="72" rx="12" fill="#0f172a" stroke="#14b8a6" strokeWidth="1.5" />
              <text x="40" y="128" fill="#2dd4bf" fontSize="11" fontWeight="bold" fontFamily="monospace">SECURITY & CRYPTO ENGINE (WebCrypto / Flask Services)</text>
              <rect x="40" y="138" width="145" height="28" rx="6" fill="#1e293b" stroke="#334155" />
              <text x="112" y="156" textAnchor="middle" fill="#f8fafc" fontSize="10" fontWeight="bold">Lockout (5 / 15m)</text>

              <rect x="198" y="138" width="150" height="28" rx="6" fill="#1e293b" stroke="#334155" />
              <text x="273" y="156" textAnchor="middle" fill="#f8fafc" fontSize="10" fontWeight="bold">OTP (5m / 3 tries)</text>

              <rect x="361" y="138" width="150" height="28" rx="6" fill="#1e293b" stroke="#334155" />
              <text x="436" y="156" textAnchor="middle" fill="#f8fafc" fontSize="10" fontWeight="bold">TOTP (RFC 6238)</text>

              <rect x="524" y="138" width="145" height="28" rx="6" fill="#1e293b" stroke="#334155" />
              <text x="596" y="156" textAnchor="middle" fill="#f8fafc" fontSize="10" fontWeight="bold">Backup Codes (8x)</text>

              <rect x="682" y="138" width="140" height="28" rx="6" fill="#1e293b" stroke="#334155" />
              <text x="752" y="156" textAnchor="middle" fill="#f8fafc" fontSize="10" fontWeight="bold">Audit Logger (16)</text>

              {/* Arrow Down */}
              <line x1="250" y1="178" x2="250" y2="204" stroke="#a855f7" strokeWidth="2" />
              <polygon points="245,199 255,199 250,207" fill="#a855f7" />
              <line x1="650" y1="178" x2="650" y2="204" stroke="#f59e0b" strokeWidth="2" />
              <polygon points="645,199 655,199 650,207" fill="#f59e0b" />

              {/* Layer 3: Database & Delivery */}
              <rect x="20" y="207" width="460" height="50" rx="12" fill="#0f172a" stroke="#a855f7" strokeWidth="1.5" />
              <text x="40" y="227" fill="#c084fc" fontSize="11" fontWeight="bold" fontFamily="monospace">RELATIONAL DATA LAYER</text>
              <text x="40" y="245" fill="#cbd5e1" fontSize="10.5">users (role, locked_until)  •  otp_codes (otp_hash)  •  backup_codes  •  audit_logs</text>

              <rect x="500" y="207" width="340" height="50" rx="12" fill="#0f172a" stroke="#f59e0b" strokeWidth="1.5" />
              <text x="520" y="227" fill="#fbbf24" fontSize="11" fontWeight="bold" fontFamily="monospace">DELIVERY CHANNELS</text>
              <text x="520" y="245" fill="#cbd5e1" fontSize="10.5">SMTP / Virtual Mailbox  •  otpauth:// QR Code</text>
            </svg>
          </div>

          {/* Vector Authentication Sequence Flow */}
          <div className="bg-slate-950 rounded-2xl p-4 sm:p-6 border border-slate-800 overflow-x-auto print:bg-slate-50 print:border-slate-300">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3 print:text-black">
              Figure 2: MFA Login & Lockout Verification Flowchart
            </div>
            <svg viewBox="0 0 860 150" className="w-full min-w-[640px] h-auto">
              {/* Step 1 */}
              <rect x="15" y="35" width="135" height="55" rx="10" fill="#1e293b" stroke="#10b981" strokeWidth="1.5" />
              <text x="82" y="58" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="bold">1. Factor 1 Login</text>
              <text x="82" y="75" textAnchor="middle" fill="#94a3b8" fontSize="9.5">Username + Password</text>

              <line x1="150" y1="62" x2="178" y2="62" stroke="#64748b" strokeWidth="2" />
              <polygon points="174,57 174,67 182,62" fill="#64748b" />

              {/* Step 2 */}
              <rect x="182" y="35" width="145" height="55" rx="10" fill="#1e293b" stroke="#f59e0b" strokeWidth="1.5" />
              <text x="254" y="58" textAnchor="middle" fill="#fbbf24" fontSize="11" fontWeight="bold">2. Lockout Check</text>
              <text x="254" y="75" textAnchor="middle" fill="#94a3b8" fontSize="9.5">5 fails = 15m Lock</text>

              <line x1="327" y1="62" x2="355" y2="62" stroke="#64748b" strokeWidth="2" />
              <polygon points="351,57 351,67 359,62" fill="#64748b" />

              {/* Step 3 */}
              <rect x="359" y="35" width="150" height="55" rx="10" fill="#1e293b" stroke="#14b8a6" strokeWidth="1.5" />
              <text x="434" y="58" textAnchor="middle" fill="#2dd4bf" fontSize="11" fontWeight="bold">3. Issue Factor 2</text>
              <text x="434" y="75" textAnchor="middle" fill="#94a3b8" fontSize="9.5">Hashed OTP (5m TTL)</text>

              <line x1="509" y1="62" x2="537" y2="62" stroke="#64748b" strokeWidth="2" />
              <polygon points="533,57 533,67 541,62" fill="#64748b" />

              {/* Step 4 */}
              <rect x="541" y="35" width="150" height="55" rx="10" fill="#1e293b" stroke="#a855f7" strokeWidth="1.5" />
              <text x="616" y="58" textAnchor="middle" fill="#c084fc" fontSize="11" fontWeight="bold">4. Verify Token</text>
              <text x="616" y="75" textAnchor="middle" fill="#94a3b8" fontSize="9.5">OTP / TOTP / Backup</text>

              <line x1="691" y1="62" x2="719" y2="62" stroke="#64748b" strokeWidth="2" />
              <polygon points="715,57 715,67 723,62" fill="#64748b" />

              {/* Step 5 */}
              <rect x="723" y="35" width="122" height="55" rx="10" fill="#064e3b" stroke="#10b981" strokeWidth="1.5" />
              <text x="784" y="58" textAnchor="middle" fill="#34d399" fontSize="11" fontWeight="bold">5. Access Granted</text>
              <text x="784" y="75" textAnchor="middle" fill="#a7f3d0" fontSize="9.5">Audit Log + Session</text>

              {/* Failure branch */}
              <text x="254" y="118" textAnchor="middle" fill="#f87171" fontSize="9.5" fontFamily="monospace">Invalid Password -&gt; failed_attempts++ (At 5: ACCOUNT_LOCKED)</text>
              <text x="616" y="118" textAnchor="middle" fill="#f87171" fontSize="9.5" fontFamily="monospace">Wrong OTP x3 or Expired -&gt; is_used = true (Invalidate)</text>
            </svg>
          </div>
        </div>
      )}

      {/* 4. INSTALLATION, USAGE & SCREENSHOTS GUIDE */}
      {show('setup') && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Installation Instructions */}
          <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 print:border-slate-300 print:bg-white">
            <h3 className="text-base font-bold text-white flex items-center gap-2 print:text-black">
              <Terminal className="w-5 h-5 text-emerald-400" />
              Installation & Setup Instructions
            </h3>

            <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 text-[11px] text-amber-200 flex items-start gap-2 print:bg-amber-50 print:text-black">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                <strong>Windows Note:</strong> Ensure your project folder name does <strong>not</strong> contain <code className="font-mono">&amp;</code> (e.g., use <code className="font-mono">mfa-otp-security-system</code>) so Windows <code className="font-mono">cmd.exe</code> resolves <code className="font-mono">vite</code> cleanly.
              </span>
            </div>

            <div className="space-y-3 text-xs">
              {[
                { id: 'cmd1', label: '1. Install Dependencies', cmd: 'npm install' },
                { id: 'cmd2', label: '2. Create Environment File', cmd: 'cp .env.example .env' },
                { id: 'cmd3', label: '3. Start Development Server (Port 3000)', cmd: 'npm run dev' },
                { id: 'cmd4', label: '4. Build & Type Check (Production)', cmd: 'npm run lint && npm run build' },
              ].map(step => (
                <div key={step.id} className="space-y-1">
                  <div className="text-slate-400 font-medium print:text-slate-700">{step.label}</div>
                  <div className="flex items-center justify-between bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 font-mono text-emerald-400 print:bg-slate-100 print:text-black print:border-slate-300">
                    <span>$ {step.cmd}</span>
                    <button
                      onClick={() => handleCopyCmd(step.id, step.cmd)}
                      className="text-slate-400 hover:text-white print:hidden"
                      title="Copy command"
                    >
                      {copiedCmd === step.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Usage & Screenshots Checklist */}
          <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 print:border-slate-300 print:bg-white">
            <h3 className="text-base font-bold text-white flex items-center gap-2 print:text-black">
              <Camera className="w-5 h-5 text-teal-400" />
              Usage Flow & Required Screenshots
            </h3>
            <p className="text-xs text-slate-400 print:text-slate-700">
              Follow these 6 screens when capturing screenshots for your final report PDF or presentation slides:
            </p>
            <div className="space-y-2.5 text-xs">
              {[
                { title: '1. Authentication Gate (Factor 1)', desc: 'Login portal showing locked dashboards + quick demo selector.' },
                { title: '2. Factor 2 OTP & Virtual Inbox', desc: '5-minute OTP countdown alongside the Virtual SMTP Mailbox modal.' },
                { title: '3. User Security & TOTP QR Code', desc: 'Security Posture score (100% A+), QR code, Auth App, and 8 Backup Codes.' },
                { title: '4. Admin & Audit Command Center', desc: 'KPI telemetry cards, 1-click user unlock, and live filtered audit_logs.' },
                { title: '5. Relational Database Inspector', desc: 'otp_codes table proving otp_hash is hashed (never plain text).' },
                { title: '6. Live Attack & Defense Simulator', desc: 'All 8 security tests passing with 100% Security Resilience score.' },
              ].map((item, i) => (
                <div key={i} className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 print:bg-slate-50 print:border-slate-200">
                  <div className="font-bold text-white print:text-black">{item.title}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5 print:text-slate-700">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. TESTING & RESULTS TABLE */}
      {show('testing') && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl print:border-slate-300 print:bg-white">
          <div className="px-6 py-4 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between print:bg-slate-100 print:border-slate-300">
            <div>
              <h3 className="font-bold text-white text-base print:text-black">Testing & Verification Results (Proposal Section 15)</h3>
              <p className="text-xs text-slate-400 print:text-slate-700">10/10 Functional and Security Test Scenarios Passed</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-mono text-xs font-bold print:text-emerald-700">
              100% PASS RATE
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] border-b border-slate-800 print:bg-slate-100 print:text-black">
                <tr>
                  <th className="px-5 py-3">Test Scenario</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Expected Result</th>
                  <th className="px-4 py-3">Actual Result</th>
                  <th className="px-5 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300 print:divide-slate-200 print:text-slate-800">
                {testCases.map((tc, i) => (
                  <tr key={i} className="hover:bg-slate-800/30">
                    <td className="px-5 py-3 font-semibold text-white print:text-black">{tc.name}</td>
                    <td className="px-4 py-3 font-mono text-[11px]">{tc.method}</td>
                    <td className="px-4 py-3">{tc.expected}</td>
                    <td className="px-4 py-3 font-mono text-[11px] text-teal-300 print:text-black">{tc.actual}</td>
                    <td className="px-5 py-3 text-right">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-mono font-bold text-[10px] print:text-emerald-700">
                        {tc.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. CHALLENGES, FUTURE IMPROVEMENTS, CONCLUSION & REFERENCES */}
      {show('conclusion') && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Challenges */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3 print:border-slate-300 print:bg-white">
              <h3 className="text-base font-bold text-white flex items-center gap-2 print:text-black">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                Challenges Faced & Resolved
              </h3>
              <ul className="space-y-2.5 text-xs text-slate-300 print:text-slate-800">
                <li className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 print:bg-slate-50 print:border-slate-200">
                  <strong className="text-white print:text-black">Hash-Only Secret Persistence:</strong> Eliminated plain-text OTP and backup code storage by hashing via SHA-256 prior to database insertion.
                </li>
                <li className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 print:bg-slate-50 print:border-slate-200">
                  <strong className="text-white print:text-black">OTP Replay & Timing Drift:</strong> Enforced atomic <code className="text-emerald-400 print:text-black">is_used</code> invalidation for Email OTP and a ±1 step (±30s) window for RFC 6238 TOTP.
                </li>
                <li className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 print:bg-slate-50 print:border-slate-200">
                  <strong className="text-white print:text-black">Zero-Dependency Evaluation:</strong> Built an integrated Virtual SMTP Mailbox and Virtual Smartphone Authenticator so evaluators can test every MFA flow immediately.
                </li>
              </ul>
            </div>

            {/* Future Improvements */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3 print:border-slate-300 print:bg-white">
              <h3 className="text-base font-bold text-white flex items-center gap-2 print:text-black">
                <Sparkles className="w-5 h-5 text-purple-400" />
                Future Improvements
              </h3>
              <ul className="space-y-2.5 text-xs text-slate-300 print:text-slate-800">
                <li className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 print:bg-slate-50 print:border-slate-200">
                  <strong className="text-white print:text-black">FIDO2 / WebAuthn Passkeys:</strong> Support hardware security keys (YubiKey) and platform biometrics (Touch ID / Windows Hello).
                </li>
                <li className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 print:bg-slate-50 print:border-slate-200">
                  <strong className="text-white print:text-black">Adaptive Risk-Based Auth:</strong> Score logins dynamically using IP reputation, geolocation velocity, and device fingerprinting.
                </li>
                <li className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 print:bg-slate-50 print:border-slate-200">
                  <strong className="text-white print:text-black">Push Approvals & Distributed Rate Limiting:</strong> Mobile one-tap sign-in approvals backed by Redis rate limiters.
                </li>
              </ul>
            </div>
          </div>

          {/* Conclusion & References */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-5 print:border-slate-300 print:bg-white">
            <div className="space-y-2">
              <h3 className="text-base font-bold text-white print:text-black">Conclusion</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed print:text-slate-800">
                This project demonstrates how adding properly engineered second-factor verification—combining salted credential storage, 5-attempt/15-minute brute-force lockout, time-limited hash-only Email OTPs, RFC 6238 TOTP codes, single-use backup recovery codes, and comprehensive audit logging—dramatically reduces the risk of account takeover and meets modern industry security practices.
              </p>
            </div>

            <div className="border-t border-slate-800 pt-4 print:border-slate-300">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 print:text-black">References</h4>
              <ol className="list-decimal list-inside space-y-1 text-xs text-slate-300 font-mono print:text-slate-800">
                <li>NIST Special Publication 800-63B: Digital Identity Guidelines, Authentication & Lifecycle Management.</li>
                <li>RFC 6238: TOTP: Time-Based One-Time Password Algorithm (IETF).</li>
                <li>RFC 4226: HOTP: An HMAC-Based One-Time Password Algorithm (IETF).</li>
                <li>OWASP Authentication Cheat Sheet — owasp.org.</li>
                <li>OWASP Application Security Verification Standard (ASVS).</li>
                <li>Flask & SQLAlchemy Documentation — flask.palletsprojects.com.</li>
                <li>PyOTP Documentation — pyauth.github.io/pyotp.</li>
              </ol>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
