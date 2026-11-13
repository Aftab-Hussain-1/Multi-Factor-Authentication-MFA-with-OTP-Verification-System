# Multi-Factor Authentication (MFA) with OTP & TOTP Security System

**Domain:** Password & Authentication  
**Standards:** NIST SP 800-63B | RFC 6238 (TOTP) | OWASP ASVS  
**Live Demo URL:** `https://ais-pre-xmln3kujbraieztns5vza3-475063702757.asia-southeast1.run.app`

---

## 1. Project Overview & Objectives

Traditional single-factor authentication (username + password) is vulnerable to credential stuffing, phishing, keyloggers, and database breaches. This project implements a full-lifecycle **Multi-Factor Authentication (MFA) with One-Time Password (OTP) & Time-Based OTP (TOTP) Verification System** built to demonstrate industry-standard authentication defense.

### Core Objectives
1. **Secure Registration & Salted Password Hashing:** Enforce strong password entropy checks and store passwords exclusively as salted cryptographic hashes.
2. **Factor 2 — Email OTP Verification:** Generate cryptographically secure 6-digit OTPs with **hash-only storage** (`otp_hash`), a strict **5-minute expiration**, **3-attempt invalidation**, and **single-use replay protection** (`is_used`).
3. **Factor 2 — RFC 6238 TOTP Authenticator:** Support Google Authenticator / Microsoft Authenticator / Authy via Base32 shared secrets, scannable QR codes, and a ±30s clock-drift window.
4. **Emergency Backup Recovery Codes:** Issue 8 single-use hashed recovery codes (`XXXX-XXXX`) with individual consumption tracking and text export.
5. **Brute-Force Lockout Defense:** Lock user accounts for **15 minutes** after **5 consecutive failed password attempts**, with live remaining-time display and administrator manual unlock.
6. **Immutable Audit Logging (`audit_logs`):** Record 16 distinct security event types with IP address, user-agent, outcome status, and timestamp.
7. **Admin Security Command Center:** Monitor MFA adoption, active lockouts, failed attempts, relational database records, and unlock locked accounts.
8. **Automated Security Testing Harness:** Validate resilience against Brute-Force, OTP Guessing, OTP Replay, Expired OTP, SQL Injection, XSS, and TOTP Drift attacks.

---

## 2. Features & Technologies Used

### Key Features
- **Authentication Gate:** Internal security dashboards and tools remain locked until Factor 1 + Factor 2 authentication succeeds.
- **Virtual Real-Time SMTP Mailbox:** Captures dispatched 6-digit OTP emails and email verification links in-browser for frictionless testing.
- **Virtual Smartphone Authenticator:** Built-in RFC 6238 TOTP generator with a live 30-second countdown ring for testing without a physical phone.
- **Relational Database Inspector:** Live inspection of `users`, `otp_codes`, `backup_codes`, and `audit_logs` schemas verifying zero plain-text secrets.
- **Proposal Compliance Matrix & Python Backend Exporter:** Line-by-line specification tally and downloadable modular Python/Flask backend files.

### Technology Stack

| Layer | Technologies Used |
|---|---|
| **Frontend UI** | React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Canvas Confetti |
| **Build & Tooling** | Vite 8, TypeScript Compiler (`tsc`), Express 4 (Runtime Server) |
| **Cryptography & MFA** | WebCrypto API (CSPRNG `getRandomValues`, SHA-256, HMAC-SHA1), RFC 6238 TOTP, `qrcode` |
| **Backend Reference (Flask)** | Python 3.10+, Flask, SQLAlchemy ORM, Werkzeug Security, PyOTP, Flask-Limiter, Flask-WTF |
| **Database Schema** | Relational Tables: `users`, `otp_codes`, `backup_codes`, `audit_logs` |

---

## 3. System Workflow & Architecture

### System Architecture

```text
+-----------------------------------------------------------------------+
|                         CLIENT / USER BROWSER                         |
|  [Auth Gate: Factor 1 & 2]  [User Security]  [Admin & Audit Console]  |
|  [Virtual SMTP Mailbox]     [Virtual TOTP]   [Live Attack Simulator]  |
+-----------------------------------+-----------------------------------+
                                    | HTTPS / Encrypted State
                                    v
+-----------------------------------------------------------------------+
|                     CORE AUTH & SECURITY ENGINE                       |
|  1. Credential Guard     -> Salted SHA-256 Check + 5-Attempt Lockout  |
|  2. OTP Service          -> CSPRNG 6-Digit, 5m TTL, 3 Tries, Hash-Only|
|  3. TOTP Engine          -> RFC 6238 HMAC-SHA1 (30s Window ±1 Step)   |
|  4. Backup Code Service  -> 8x Single-Use Hashed Recovery Tokens      |
|  5. Audit Logger         -> Immutable Security Event Stream           |
+-------------------+-------------------------------+-------------------+
                    |                               |
                    v                               v
+-----------------------------------+   +-------------------------------+
|        RELATIONAL DATA STORE      |   |    DELIVERY & VERIFICATION    |
|  - users (role, locked_until)     |   |  - Virtual SMTP Transport     |
|  - otp_codes (otp_hash, is_used)  |   |  - QR Code / otpauth:// URI   |
|  - backup_codes (code_hash)       |   |                               |
|  - audit_logs (event, ip, status) |   |                               |
+-----------------------------------+   +-------------------------------+
```

### Authentication Flow

1. **Factor 1 (Password Verification):** User submits username/email and password.
   - If account `locked_until > now` -> Reject immediately with remaining lockout minutes.
   - If password invalid -> Increment `failed_attempts`. At `5` failures, set `locked_until = now + 15 minutes` and log `ACCOUNT_LOCKED`.
   - If password valid & `email_verified == true` -> Proceed to Factor 2 (if `mfa_enabled == true`).
2. **Factor 2 (OTP / TOTP / Backup Code):**
   - **Email OTP:** Server generates 6-digit CSPRNG code, stores `SHA-256(otp)` in `otp_codes` with `expires_at = +5 min`, dispatches email. User gets max `3` tries; on success `is_used = true`.
   - **TOTP:** Server verifies 6-digit HMAC-SHA1 code against `totp_secret` within ±30s window.
   - **Backup Code:** Server checks `code_hash` against unused codes in `backup_codes` and marks `is_used = true`.
3. **Session Granted:** `failed_attempts` resets to `0`, `LOGIN_SUCCESS` is written to `audit_logs`, and user/admin dashboards unlock.

---

## 4. Installation & Setup Instructions (VS Code / Local)

### Prerequisites
- **Node.js** v18 or v20+ (`node -v`, `npm -v`)
- **VS Code** or modern terminal
- *(Important for Windows)* Ensure the project folder path does **not** contain `&` (ampersand) characters (e.g., use `mfa-otp-security-system` instead of `mfa-with-otp-&-totp-security-system`), because Windows `cmd.exe` splits commands at `&`.

### Frontend Setup (React + Vite)
1. **Open Project in VS Code** and launch the integrated terminal (`Ctrl + \``).
2. **Install Dependencies:**
   ```bash
   npm install
   ```
   *(If `esbuild` script approval is prompted on newer npm versions, run `npm install-scripts approve esbuild && npm rebuild esbuild`.)*
3. **Configure Environment:**
   ```bash
   cp .env.example .env
   ```
4. **Start Development Server:**
   ```bash
   npm run dev
   ```
5. **Open in Browser:** Navigate to `http://localhost:3000`.

### Production Build Check
```bash
npm run lint
npm run build
```

---

## 5. Usage & Demo Credentials

| Role | Username | Password | MFA Configuration |
|---|---|---|---|
| **Administrator** | `admin` | `AdminPass@2026` | MFA Enforced (Email OTP + TOTP + Backup Codes) |
| **Standard User** | `john_doe` | `UserPass@2026` | MFA Enforced (Email OTP + TOTP + Backup Codes) |
| **Single-Factor User** | `alice_smith` | `AlicePass@2026` | MFA Disabled (Can be enabled in User Security) |

### Walkthrough
1. **Sign In (Factor 1):** Click a quick-select profile or enter `admin` / `AdminPass@2026`.
2. **Verify Factor 2:** Click **Inbox** in the top-right header to inspect the incoming 6-digit OTP email and click **Auto-Fill in OTP Form**, or click **Auth App** to copy the live 30s TOTP code.
3. **Explore Dashboards:**
   - **Admin & Audit:** View security KPIs, unlock locked accounts with 1 click, filter audit logs, and inspect database tables.
   - **User Security:** Configure TOTP QR codes, view security posture score, and download/regenerate backup recovery codes.
   - **Attack Simulator:** Run all 8 automated attack simulations to verify brute-force, replay, expiration, SQLi, and XSS countermeasures.

---

## 6. Testing & Results

All functional and security test cases from Proposal Section 15 were verified using the built-in **Attack Simulator** and TypeScript compiler checks:

| Test Case | Method | Expected Result | Actual Result | Status |
|---|---|---|---|---|
| Valid Password + Valid Email OTP | Functional | Login succeeds, `is_used=true` | Session granted, OTP marked used | **PASSED** |
| Valid Password + Wrong OTP (x3) | Functional | Code invalidated after 3 tries | Rejected & invalidated on 3rd try | **PASSED** |
| Expired OTP (> 5 minutes) | Functional | Rejected as expired | Rejected with expiry error | **PASSED** |
| Reused OTP (Replay Attack) | Security | Second use blocked | Rejected (`is_used` replay shield) | **PASSED** |
| 5 Consecutive Wrong Passwords | Security | Account locked for 15 minutes | `locked_until` set +15m, login blocked | **PASSED** |
| TOTP Rolling Code (RFC 6238) | Functional | Valid within ±30s, stale rejected | Valid passes; -90s code blocked | **PASSED** |
| Backup Recovery Code Reuse | Security | Works once only | First succeeds; second rejected | **PASSED** |
| SQL Injection (`' OR '1'='1'`) | Security | Parameterized query blocks SQLi | Treated as literal string, denied | **PASSED** |
| XSS Script Injection | Security | Escaped in DOM rendering | `<script>` neutralized safely | **PASSED** |

---

## 7. Challenges & Future Improvements

### Challenges Faced & Resolved
1. **Plain-Text Secret Exposure Risk:** Storing OTPs or backup codes in plain text exposes accounts if the database leaks. *Solution:* Stored salted SHA-256 hashes (`otp_hash`, `code_hash`) and never persisted raw codes.
2. **OTP Replay & Race Conditions:** Ensuring a valid OTP cannot be submitted twice. *Solution:* Enforced atomic `is_used = true` invalidation upon first successful verification or 3rd failure.
3. **TOTP Clock Drift:** Minor client-server time differences causing valid TOTP failures. *Solution:* Implemented a ±1 step (±30 seconds) verification window per RFC 6238.
4. **Testing Without External SMTP/Mobile Devices:** Evaluators often lack live SMTP credentials or physical authenticator devices during demos. *Solution:* Built the integrated **Virtual SMTP Mailbox** and **Virtual Smartphone Authenticator**.

### Future Improvements
- **FIDO2 / WebAuthn Hardware Keys & Passkeys** for phishing-resistant passwordless MFA.
- **Biometric Factor** (WebAuthn Fingerprint / Face ID integration).
- **Adaptive Risk-Based Authentication** scoring IP geolocation, device fingerprint, and impossible-travel anomalies.
- **Distributed Redis Rate Limiter** for horizontal scaling across clustered backend nodes.

---

## 8. Conclusion & References

### Conclusion
This project demonstrates that combining strong salted credential storage with properly engineered second-factor verification (time-limited hashed Email OTP, RFC 6238 TOTP, and single-use backup codes), backed by a 5-attempt/15-minute lockout policy and immutable audit logging, drastically mitigates account takeover, brute-force, and OTP replay threats.

### References
1. NIST Special Publication 800-63B: *Digital Identity Guidelines — Authentication and Lifecycle Management*.
2. RFC 6238: *TOTP: Time-Based One-Time Password Algorithm*, IETF.
3. RFC 4226: *HOTP: An HMAC-Based One-Time Password Algorithm*, IETF.
4. OWASP Authentication Cheat Sheet — [owasp.org](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html).
5. OWASP Application Security Verification Standard (ASVS).
6. Flask & SQLAlchemy Documentation — [flask.palletsprojects.com](https://flask.palletsprojects.com/).
7. PyOTP Documentation — [pyauth.github.io/pyotp](https://pyauth.github.io/pyotp/).
