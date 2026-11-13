# Final Project Documentation
## Multi-Factor Authentication (MFA) with OTP & TOTP Verification System

**Domain:** Password & Authentication (Project #5 and #9)  
**Submission Deadline:** 22 November  
**Live Deployment URL:** `https://ais-pre-xmln3kujbraieztns5vza3-475063702757.asia-southeast1.run.app`

---

## Table of Contents
1. [Live Demo & Video Walkthrough Script](#1-live-demo--video-walkthrough-script)
2. [Project Overview & Objectives](#2-project-overview--objectives)
3. [Features & Technologies Used](#3-features--technologies-used)
4. [Installation & Setup Instructions](#4-installation--setup-instructions)
5. [Usage Guide & Screenshots Checklist](#5-usage-guide--screenshots-checklist)
6. [System Workflow & Architecture](#6-system-workflow--architecture)
7. [Testing & Verification Results](#7-testing--verification-results)
8. [Challenges & Future Improvements](#8-challenges--future-improvements)
9. [Conclusion & References](#9-conclusion--references)

---

## 1. Live Demo & Video Walkthrough Script

- **Live Deployed URL:** `https://ais-pre-xmln3kujbraieztns5vza3-475063702757.asia-southeast1.run.app`

If recording a companion **Video Demonstration** (2–4 minutes using OBS Studio, Loom, or Windows Snipping Tool):
1. **0:00 – 0:30 (Authentication Gate & Factor 1):** Show the locked dashboard notice, explain single-factor vulnerabilities, and sign in with `admin` / `AdminPass@2026`.
2. **0:30 – 1:15 (Factor 2 — Email OTP & Virtual Mailbox):** Open the **Inbox** modal, show the 6-digit OTP email, highlight the 5-minute countdown & 3-attempt limit, and click **Auto-Fill**.
3. **1:15 – 1:45 (TOTP Authenticator & Backup Codes):** Open **User Security**, demonstrate the scannable QR code, launch **Auth App** (30s rolling TOTP), and inspect single-use hashed Backup Codes.
4. **1:45 – 2:30 (Admin & Audit Command Center):** Open **Admin & Audit**, inspect KPI cards, filter `audit_logs`, open **Relational Database Inspector** (`otp_codes` showing `otp_hash` instead of plain text), and demonstrate **1-Click Account Unlock**.
5. **2:30 – 3:15 (Live Attack & Defense Simulator):** Open **Attack Simulator**, click **Run All 8 Attack Tests**, and show real-time mitigation of Brute-Force (5 fails / 15-min lock), OTP Replay, Expired OTP, SQL Injection, and XSS.
6. **3:15 – 3:30 (Proposal Compliance Tally):** Open **Proposal Tally** showing 100% alignment with all proposal requirements.

---

## 2. Project Overview & Objectives

### Overview
Single-factor authentication relying solely on passwords leaves user accounts exposed to phishing, brute-force attacks, credential stuffing, and password database leaks. This project delivers a complete **Multi-Factor Authentication (MFA) System** implementing two independent authentication factors:
- **Factor 1 (Something You Know):** Username/email and password verified via salted cryptographic hashing with brute-force lockout protection.
- **Factor 2 (Something You Have):** Cryptographically generated 6-digit Email OTP, RFC 6238 TOTP Authenticator App codes, or single-use Backup Recovery Codes.

### Objectives
1. Implement secure user registration with password entropy validation and email verification.
2. Enforce salted SHA-256 / bcrypt credential verification with a **5-attempt / 15-minute account lockout** rule.
3. Build a secure Email OTP service generating 6-digit CSPRNG codes stored **only as hashes** with a **5-minute TTL** and **3-attempt invalidation**.
4. Support **RFC 6238 TOTP** compatible with Google Authenticator and Microsoft Authenticator via QR codes.
5. Provide **8 hashed one-time backup recovery codes** with download/regeneration capabilities.
6. Maintain an immutable **`audit_logs`** trail covering 16 authentication and security events.
7. Deliver an **Admin Security Command Center** with KPI metrics, user role management, and 1-click unlock controls.
8. Validate system defenses against OWASP/NIST threats using an automated **Attack & Defense Simulator**.

---

## 3. Features & Technologies Used

### Core System Features
- **Strict Authentication Gate:** Dashboards remain locked until both Factor 1 and Factor 2 succeed.
- **Role-Based Access Control (RBAC):** Distinct `admin` and `user` roles enforced across UI and data layers.
- **Virtual SMTP Mailbox:** Captures OTP & verification emails live in-browser without requiring external SMTP secrets during evaluation.
- **Virtual Smartphone Authenticator:** Real-time RFC 6238 TOTP simulator with 30-second progress ring.
- **Relational Database Inspector:** Live inspection of `users`, `otp_codes`, `backup_codes`, and `audit_logs`.
- **Proposal Tally & Python Backend Exporter:** Gap-analysis report plus downloadable Python/Flask modules (`models.py`, `otp_service.py`, `lockout_service.py`, `audit_service.py`).

### Technologies Used
- **Frontend:** React 19, TypeScript, Tailwind CSS v4, Lucide React, Canvas Confetti, Vite 8
- **Cryptography:** WebCrypto API (`crypto.getRandomValues`, `SHA-256`, `HMAC-SHA1`), RFC 6238 Base32/TOTP, `qrcode`
- **Backend Reference Stack:** Python 3.10+, Flask, SQLAlchemy ORM, Werkzeug Security, PyOTP, Flask-Limiter, Flask-WTF

---

## 4. Installation & Setup Instructions

### Local Setup (VS Code + Node.js)
1. **Verify Prerequisites:** Install Node.js v18+ (`node -v`) and VS Code.
2. **Important Windows Path Check:** Ensure the folder name does **not** contain `&` (use e.g. `mfa-otp-security-system`).
3. **Install Dependencies:**
   ```bash
   npm install
   ```
4. **Setup Environment Variables:**
   ```bash
   cp .env.example .env
   ```
5. **Run Development Server:**
   ```bash
   npm run dev
   ```
6. **Access App:** Open `http://localhost:3000` in Chrome or Edge.

### Python/Flask Reference Backend Setup
```bash
cd flask-auth-system-main
python -m venv venv
# Windows: venv\Scripts\activate | Linux/Mac: source venv/bin/activate
pip install -r requirements.txt
python run.py
```

---

## 5. Usage Guide & Screenshots Checklist

### Recommended Screenshots for Submission Appendix
Capture the following 6 screens from the running app (or export this Documentation page directly via **Print / Save as PDF**):
1. **Screenshot 1 — Factor 1 Login & Authentication Gate:** Shows quick-select demo accounts, password visibility toggle, and lockout warning.
2. **Screenshot 2 — Factor 2 Verification & Virtual SMTP Mailbox:** Shows the 6-digit OTP countdown (5:00), 3-attempt counter, and the incoming email modal.
3. **Screenshot 3 — User Security & TOTP QR Setup:** Shows the Security Posture gauge (100% A+), scannable QR code, Virtual Auth App, and 8 Backup Codes.
4. **Screenshot 4 — Admin & Audit Command Center:** Shows KPI summary cards, user lockout status table, and filtered `audit_logs`.
5. **Screenshot 5 — Relational Database Inspector (`otp_codes`):** Proves `otp_hash` is hashed and `is_used` prevents replay attacks.
6. **Screenshot 6 — Live Attack & Defense Simulator:** Shows all 8 security tests passing (`100% Security Resilience`).

---

## 6. System Workflow & Architecture

### Database Entity-Relationship Design
- **`users`**: `id (PK)`, `username`, `email`, `password_hash`, `role (user|admin)`, `totp_secret`, `mfa_enabled`, `failed_attempts`, `locked_until`, `email_verified`, `created_at`, `last_login`
- **`otp_codes`**: `id (PK)`, `user_id (FK)`, `otp_hash`, `expires_at (+5 min)`, `attempts (max 3)`, `is_used`, `created_at`
- **`backup_codes`**: `id (PK)`, `user_id (FK)`, `code_hash`, `code_preview`, `is_used`, `created_at`, `used_at`
- **`audit_logs`**: `id (PK)`, `user_id (FK)`, `username`, `event`, `ip_address`, `user_agent`, `status`, `details`, `timestamp`

### Authentication & Lockout Workflow
1. User enters credentials -> System checks `locked_until`. If locked, reject and log `LOGIN_FAILED (BLOCKED)`.
2. System verifies salted `password_hash`. On mismatch, `failed_attempts += 1`. At `5`, set `locked_until = now + 15 min` and log `ACCOUNT_LOCKED`.
3. On credential match -> Check `email_verified`. If `mfa_enabled`, generate 6-digit OTP, store `SHA-256(otp)`, dispatch email, and require Factor 2.
4. User submits Email OTP (checked for TTL <= 5m, attempts < 3, `is_used == false`), TOTP (checked ±1 step), or Backup Code (`is_used == false`).
5. On Factor 2 success -> Mark token used, reset `failed_attempts = 0`, record `LOGIN_SUCCESS`, and unlock authenticated dashboards.

---

## 7. Testing & Verification Results

| # | Test Scenario | Category | Expected Result | Observed Result | Outcome |
|---|---|---|---|---|---|
| 1 | Correct Password + Valid Email OTP | Functional | Access granted, OTP marked used | Authenticated, `is_used=true` | **PASS** |
| 2 | Wrong OTP (3 consecutive tries) | Functional | Code invalidated on 3rd failure | Invalidated at 3/3 attempts | **PASS** |
| 3 | Expired OTP (>5 min) | Functional | Rejected as expired | Rejected with TTL error | **PASS** |
| 4 | OTP Replay Attack | Security | Reused OTP rejected | Blocked by `is_used` flag | **PASS** |
| 5 | Brute-Force (5 Wrong Passwords) | Security | Account locked 15 minutes | Locked 15m, `ACCOUNT_LOCKED` logged | **PASS** |
| 6 | Admin Manual Account Unlock | Functional | `locked_until` cleared immediately | Account restored to Active | **PASS** |
| 7 | TOTP Valid & Drift Window (±30s) | Functional | Current passes; -90s stale fails | Stale code rejected | **PASS** |
| 8 | Backup Recovery Code Single-Use | Security | First use works; second blocked | Second use rejected | **PASS** |
| 9 | SQL Injection Payload (`' OR '1'='1'`) | Security | Parameterized query blocks SQLi | Denied as invalid credentials | **PASS** |
| 10 | XSS Payload (`<script>alert(1)</script>`) | Security | Escaped in output | Neutralized safely | **PASS** |

---

## 8. Challenges & Future Improvements

### Key Challenges Addressed
- **Zero Plain-Text Persistence:** Ensuring neither OTPs nor backup codes ever appear in plain text inside database records while keeping user verification fast and reliable.
- **Replay & Brute-Force Mitigation:** Coordinating attempt counters (`3` for OTP, `5` for password), expiration timestamps (`5m` for OTP, `15m` for lockout), and single-use flags (`is_used`).
- **Self-Contained Evaluation Experience:** Providing evaluators an immediate way to verify Email OTP and TOTP flows without configuring Gmail SMTP app passwords or pairing a physical mobile device.
- **Cross-Platform Path Compatibility:** Resolving Windows `cmd.exe` script execution failures caused by `&` characters in project directory names.

### Future Improvements
- **FIDO2 / WebAuthn Passkeys:** Hardware security keys and platform biometrics (Touch ID / Windows Hello).
- **Adaptive Risk-Based MFA:** Behavioral anomaly scoring using IP reputation, impossible travel, and device fingerprinting.
- **Push-Notification Approval:** One-tap mobile sign-in approval prompts.
- **Production Distributed Storage:** Redis-backed distributed rate limiting and PostgreSQL connection pooling.

---

## 9. Conclusion & References

### Conclusion
The Multi-Factor Authentication (MFA) with OTP & TOTP Verification System demonstrates how layered defense-in-depth—combining salted password hashing, 5-attempt/15-minute brute-force lockout, time-limited hash-only Email OTPs, RFC 6238 TOTP, single-use backup codes, and immutable audit logging—eliminates the single point of failure inherent in password-only portals.

### References
1. NIST Special Publication 800-63B: *Digital Identity Guidelines: Authentication and Lifecycle Management*.
2. RFC 6238: *TOTP: Time-Based One-Time Password Algorithm* (IETF).
3. RFC 4226: *HOTP: An HMAC-Based One-Time Password Algorithm* (IETF).
4. OWASP Authentication Cheat Sheet — https://cheatsheetseries.owasp.org/
5. OWASP Application Security Verification Standard (ASVS).
6. Flask Documentation — https://flask.palletsprojects.com/
7. PyOTP Documentation — https://pyauth.github.io/pyotp/
