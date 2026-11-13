/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User, OTPRecord, BackupCodeRecord, AuditLog, SimulatedEmail, AuditEventType, AuditStatus } from '../types/auth';
import { CryptoEngine } from './cryptoEngine';

const STORAGE_KEY_PREFIX = 'mfa_system_';

export class AuthStore {
  private static instance: AuthStore;
  private users: User[] = [];
  private otpRecords: OTPRecord[] = [];
  private backupCodes: BackupCodeRecord[] = [];
  private auditLogs: AuditLog[] = [];
  private simulatedEmails: SimulatedEmail[] = [];
  private currentUser: User | null = null;
  private preAuthUser: User | null = null;
  private clientIp: string = '192.168.1.105';
  private userAgent: string = navigator.userAgent;

  private constructor() {
    this.loadFromStorage();
    if (this.users.length === 0) {
      this.seedInitialData();
    }
  }

  static getInstance(): AuthStore {
    if (!AuthStore.instance) {
      AuthStore.instance = new AuthStore();
    }
    return AuthStore.instance;
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}users`, JSON.stringify(this.users));
      localStorage.setItem(`${STORAGE_KEY_PREFIX}otp_records`, JSON.stringify(this.otpRecords));
      localStorage.setItem(`${STORAGE_KEY_PREFIX}backup_codes`, JSON.stringify(this.backupCodes));
      localStorage.setItem(`${STORAGE_KEY_PREFIX}audit_logs`, JSON.stringify(this.auditLogs));
      localStorage.setItem(`${STORAGE_KEY_PREFIX}emails`, JSON.stringify(this.simulatedEmails));
      if (this.currentUser) {
        localStorage.setItem(`${STORAGE_KEY_PREFIX}current_user_id`, this.currentUser.id);
      } else {
        localStorage.removeItem(`${STORAGE_KEY_PREFIX}current_user_id`);
      }
    } catch (e) {
      console.warn('Storage save failed:', e);
    }
  }

  private loadFromStorage(): void {
    try {
      const u = localStorage.getItem(`${STORAGE_KEY_PREFIX}users`);
      if (u) this.users = JSON.parse(u);

      const o = localStorage.getItem(`${STORAGE_KEY_PREFIX}otp_records`);
      if (o) this.otpRecords = JSON.parse(o);

      const b = localStorage.getItem(`${STORAGE_KEY_PREFIX}backup_codes`);
      if (b) this.backupCodes = JSON.parse(b);

      const a = localStorage.getItem(`${STORAGE_KEY_PREFIX}audit_logs`);
      if (a) this.auditLogs = JSON.parse(a);

      const e = localStorage.getItem(`${STORAGE_KEY_PREFIX}emails`);
      if (e) this.simulatedEmails = JSON.parse(e);

      const curId = localStorage.getItem(`${STORAGE_KEY_PREFIX}current_user_id`);
      if (curId) {
        this.currentUser = this.users.find(x => x.id === curId) || null;
      }
    } catch (e) {
      console.warn('Storage load failed:', e);
    }
  }

  async seedInitialData(): Promise<void> {
    const adminPassHash = await CryptoEngine.sha256('AdminPass@2026');
    const userPassHash = await CryptoEngine.sha256('UserPass@2026');
    const alicePassHash = await CryptoEngine.sha256('AlicePass@2026');

    const adminTotpSecret = 'JBSWY3DPEHPK3PXP'; // Base32 test secret
    const userTotpSecret = 'MZXW6YTBOI======';

    const now = new Date().toISOString();

    const adminUser: User = {
      id: 'usr_admin_001',
      username: 'admin',
      email: 'admin@mfasecure.org',
      password_hash: adminPassHash,
      role: 'admin',
      totp_secret: adminTotpSecret,
      mfa_enabled: true,
      failed_attempts: 0,
      locked_until: null,
      email_verified: true,
      created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
      last_login: now,
      preferred_mfa: 'both',
    };

    const normalUser: User = {
      id: 'usr_john_002',
      username: 'john_doe',
      email: 'john@example.com',
      password_hash: userPassHash,
      role: 'user',
      totp_secret: userTotpSecret,
      mfa_enabled: true,
      failed_attempts: 0,
      locked_until: null,
      email_verified: true,
      created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
      last_login: new Date(Date.now() - 3600000).toISOString(),
      preferred_mfa: 'email_otp',
    };

    const aliceUser: User = {
      id: 'usr_alice_003',
      username: 'alice_smith',
      email: 'alice@example.com',
      password_hash: alicePassHash,
      role: 'user',
      totp_secret: null,
      mfa_enabled: false,
      failed_attempts: 0,
      locked_until: null,
      email_verified: true,
      created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
      last_login: null,
      preferred_mfa: 'email_otp',
    };

    this.users = [adminUser, normalUser, aliceUser];

    // Seed backup codes for admin & john_doe
    await this.generateAndStoreBackupCodes(adminUser.id, 8);
    await this.generateAndStoreBackupCodes(normalUser.id, 8);

    // Initial Audit logs
    this.auditLogs = [
      {
        id: 'log_' + Math.random().toString(36).substring(2, 9),
        user_id: adminUser.id,
        username: adminUser.username,
        event: 'REGISTER',
        ip_address: '192.168.1.1',
        user_agent: 'Mozilla/5.0 SecurityAdmin',
        status: 'SUCCESS',
        details: 'Initial system administrator initialized with MFA enabled',
        timestamp: new Date(Date.now() - 86400000 * 30).toISOString(),
      },
      {
        id: 'log_' + Math.random().toString(36).substring(2, 9),
        user_id: normalUser.id,
        username: normalUser.username,
        event: 'EMAIL_VERIFIED',
        ip_address: '192.168.1.42',
        user_agent: 'Mozilla/5.0 Firefox/128.0',
        status: 'SUCCESS',
        details: 'User email verified successfully via secure token',
        timestamp: new Date(Date.now() - 86400000 * 14).toISOString(),
      },
      {
        id: 'log_' + Math.random().toString(36).substring(2, 9),
        user_id: adminUser.id,
        username: adminUser.username,
        event: 'LOGIN_SUCCESS',
        ip_address: '192.168.1.100',
        user_agent: navigator.userAgent,
        status: 'SUCCESS',
        details: 'Admin verified password and 2FA TOTP code',
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
      },
    ];

    this.saveToStorage();
  }

  // AUDIT LOGGING HELPER
  logEvent(
    event: AuditEventType,
    status: AuditStatus,
    details: string,
    user?: User | null,
    ipOverride?: string
  ): AuditLog {
    const log: AuditLog = {
      id: 'log_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6),
      user_id: user ? user.id : null,
      username: user ? user.username : 'anonymous',
      event,
      ip_address: ipOverride || this.clientIp,
      user_agent: this.userAgent,
      status,
      details,
      timestamp: new Date().toISOString(),
    };
    this.auditLogs.unshift(log);
    // Keep max 200 logs
    if (this.auditLogs.length > 200) {
      this.auditLogs.pop();
    }
    this.saveToStorage();
    return log;
  }

  // USERS & GETTERS
  getUsers(): User[] {
    return [...this.users];
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  getPreAuthUser(): User | null {
    return this.preAuthUser;
  }

  getAuditLogs(): AuditLog[] {
    return [...this.auditLogs];
  }

  getSimulatedEmails(): SimulatedEmail[] {
    return [...this.simulatedEmails].sort((a, b) => b.timestamp - a.timestamp);
  }

  getOTPRecords(): OTPRecord[] {
    return [...this.otpRecords];
  }

  getBackupCodes(userId?: string): BackupCodeRecord[] {
    if (!userId) return [...this.backupCodes];
    return this.backupCodes.filter(b => b.user_id === userId);
  }

  // REGISTRATION & EMAIL VERIFICATION
  async register(username: string, email: string, password: string): Promise<{ success: boolean; message: string; user?: User }> {
    const cleanUser = username.trim().toLowerCase();
    const cleanEmail = email.trim().toLowerCase();

    if (this.users.some(u => u.username.toLowerCase() === cleanUser)) {
      return { success: false, message: 'Username is already taken' };
    }
    if (this.users.some(u => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, message: 'Email address is already registered' };
    }

    const passHash = await CryptoEngine.sha256(password);
    const newUser: User = {
      id: 'usr_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6),
      username: cleanUser,
      email: cleanEmail,
      password_hash: passHash,
      role: 'user',
      totp_secret: null,
      mfa_enabled: true, // Default to true as per proposal standard!
      failed_attempts: 0,
      locked_until: null,
      email_verified: false,
      created_at: new Date().toISOString(),
      last_login: null,
      preferred_mfa: 'email_otp',
    };

    this.users.push(newUser);

    // Send verification email
    const verifyToken = Math.random().toString(36).substring(2, 12);
    this.sendSimulatedEmail({
      to: cleanEmail,
      subject: 'Verify your MFA Account Email',
      type: 'verify',
      token: verifyToken,
      body: `Hello ${cleanUser}, welcome to the MFA Security System! Please verify your email to activate Factor 1 & Factor 2 logins.`,
    });

    this.logEvent('REGISTER', 'SUCCESS', `User registered: ${cleanUser}. Verification email dispatched.`, newUser);
    this.saveToStorage();
    return { success: true, message: 'Registration successful! Verification email sent.', user: newUser };
  }

  verifyEmail(email: string): boolean {
    const user = this.users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!user) return false;
    user.email_verified = true;
    this.logEvent('EMAIL_VERIFIED', 'SUCCESS', `User email verified: ${user.username}`, user);
    this.saveToStorage();
    return true;
  }

  // FACTOR 1: CREDENTIALS & LOCKOUT DEFENSE (Proposal Section 7, 10, 14, 15)
  async authenticateFirstFactor(
    username: string,
    password: string,
    ip?: string
  ): Promise<{
    status: 'SUCCESS' | 'MFA_REQUIRED' | 'INVALID_CREDENTIALS' | 'ACCOUNT_LOCKED' | 'UNVERIFIED_EMAIL';
    message: string;
    user?: User;
    lockoutRemainingMinutes?: number;
    failedAttempts?: number;
  }> {
    const cleanUser = username.trim().toLowerCase();
    const user = this.users.find(u => u.username.toLowerCase() === cleanUser || u.email.toLowerCase() === cleanUser);

    if (!user) {
      this.logEvent('LOGIN_FAILED', 'FAILURE', `Failed login attempt for non-existent user: "${cleanUser}"`, null, ip);
      return { status: 'INVALID_CREDENTIALS', message: 'Invalid username or password' };
    }

    // CHECK ACCOUNT LOCKOUT (Proposal: 5 failed attempts -> 15 min lockout)
    if (user.locked_until) {
      const lockExpiry = new Date(user.locked_until).getTime();
      const now = Date.now();
      if (now < lockExpiry) {
        const remainingMinutes = Math.ceil((lockExpiry - now) / 60000);
        this.logEvent(
          'LOGIN_FAILED',
          'BLOCKED',
          `Login rejected: Account "${user.username}" is locked. ${remainingMinutes} min remaining.`,
          user,
          ip
        );
        return {
          status: 'ACCOUNT_LOCKED',
          message: `Account is locked due to too many failed attempts. Try again in ${remainingMinutes} minutes.`,
          lockoutRemainingMinutes: remainingMinutes,
        };
      } else {
        // Lockout expired, reset counters
        user.locked_until = null;
        user.failed_attempts = 0;
        this.logEvent('ACCOUNT_UNLOCKED', 'SUCCESS', `Account lockout expired naturally for "${user.username}"`, user, ip);
      }
    }

    // VERIFY PASSWORD HASH
    const isValid = await CryptoEngine.verifyHash(password, user.password_hash);

    if (!isValid) {
      user.failed_attempts = (user.failed_attempts || 0) + 1;

      // Check if threshold reached: 5 failed attempts -> 15 minutes lockout
      if (user.failed_attempts >= 5) {
        const lockDurationMs = 15 * 60 * 1000; // 15 minutes
        user.locked_until = new Date(Date.now() + lockDurationMs).toISOString();
        this.logEvent(
          'ACCOUNT_LOCKED',
          'WARNING',
          `Brute-force protection triggered: Account "${user.username}" locked for 15 minutes after 5 consecutive failed passwords.`,
          user,
          ip
        );
        this.saveToStorage();
        return {
          status: 'ACCOUNT_LOCKED',
          message: 'Account locked for 15 minutes due to 5 failed login attempts.',
          lockoutRemainingMinutes: 15,
          failedAttempts: 5,
        };
      }

      this.logEvent(
        'LOGIN_FAILED',
        'FAILURE',
        `Incorrect password for "${user.username}". Failed attempt ${user.failed_attempts}/5.`,
        user,
        ip
      );
      this.saveToStorage();
      return {
        status: 'INVALID_CREDENTIALS',
        message: `Invalid username or password. Attempt ${user.failed_attempts} of 5 before 15-min lockout.`,
        failedAttempts: user.failed_attempts,
      };
    }

    // PASSWORD IS CORRECT!
    // Check email verification status
    if (!user.email_verified) {
      this.logEvent('LOGIN_FAILED', 'WARNING', `Login blocked: Unverified email for "${user.username}"`, user, ip);
      return { status: 'UNVERIFIED_EMAIL', message: 'Please verify your email address before logging in.' };
    }

    // CHECK IF MFA IS REQUIRED (Proposal: Factor 2)
    if (user.mfa_enabled) {
      this.preAuthUser = user;
      // Trigger automatic Email OTP dispatch if user's preference or default
      await this.generateAndSendEmailOTP(user.id);
      this.saveToStorage();
      return {
        status: 'MFA_REQUIRED',
        message: 'Factor 1 verified. Please provide your Factor 2 verification (Email OTP or TOTP code).',
        user,
      };
    }

    // No MFA required -> Complete login
    user.failed_attempts = 0;
    user.last_login = new Date().toISOString();
    this.currentUser = user;
    this.preAuthUser = null;
    this.logEvent('LOGIN_SUCCESS', 'SUCCESS', `User "${user.username}" logged in without MFA`, user, ip);
    this.saveToStorage();
    return { status: 'SUCCESS', message: 'Login successful!', user };
  }

  // FACTOR 2: SECURE EMAIL OTP (Proposal Section 9 & 13)
  async generateAndSendEmailOTP(userId: string): Promise<{ otpPreviewForDemo: string }> {
    const user = this.users.find(u => u.id === userId);
    if (!user) throw new Error('User not found');

    // Generate 6-digit cryptographically secure OTP
    const rawOtp = CryptoEngine.generateSecureOTP();
    // Hash OTP before storing (Never store plain OTP in database, as required by proposal!)
    const otpHash = await CryptoEngine.sha256(rawOtp);

    // 5-minute expiry (Proposal requirement)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    const otpRecord: OTPRecord = {
      id: 'otp_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6),
      user_id: user.id,
      otp_hash: otpHash,
      expires_at: expiresAt,
      attempts: 0, // max 3
      is_used: false,
      created_at: new Date().toISOString(),
    };

    this.otpRecords.push(otpRecord);

    // Dispatch simulated email
    this.sendSimulatedEmail({
      to: user.email,
      subject: `Your 6-Digit MFA Verification Code: ${rawOtp}`,
      type: 'otp',
      code: rawOtp,
      body: `Your One-Time Password (OTP) for authentication is: ${rawOtp}.\n\nThis code is valid for 5 minutes and will expire automatically. Do NOT share this code with anyone. (Attempt limit: 3 times).`,
    });

    this.logEvent(
      'OTP_SENT',
      'SUCCESS',
      `6-digit OTP generated, hashed, and dispatched to ${user.email} (5-min expiry, max 3 attempts)`,
      user
    );

    this.saveToStorage();
    return { otpPreviewForDemo: rawOtp };
  }

  // FACTOR 2: VERIFY EMAIL OTP (Proposal Section 13 Logic)
  async verifyEmailOTP(
    userId: string,
    enteredCode: string
  ): Promise<{ success: boolean; message: string; attemptsRemaining?: number }> {
    const user = this.users.find(u => u.id === userId);
    if (!user) return { success: false, message: 'User not found' };

    // Find the latest active OTP record for user
    const records = this.otpRecords
      .filter(r => r.user_id === user.id && !r.is_used)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const activeOtp = records[0];

    if (!activeOtp) {
      this.logEvent('OTP_FAILED', 'FAILURE', 'OTP verification failed: No active OTP record found', user);
      return { success: false, message: 'No active OTP found. Please request a new code.' };
    }

    // Check expiry (5 minutes)
    const now = Date.now();
    const expiryTime = new Date(activeOtp.expires_at).getTime();
    if (now > expiryTime) {
      activeOtp.is_used = true; // invalidate
      this.logEvent('OTP_FAILED', 'FAILURE', 'OTP verification failed: Code has expired (>5 minutes)', user);
      this.saveToStorage();
      return { success: false, message: 'This OTP has expired. Please request a new code.' };
    }

    // Check max wrong attempts (Proposal Section 13: max 3 attempts)
    if (activeOtp.attempts >= 3) {
      activeOtp.is_used = true;
      this.logEvent('OTP_FAILED', 'BLOCKED', 'OTP invalidated: Maximum 3 failed attempts exceeded', user);
      this.saveToStorage();
      return { success: false, message: 'Maximum attempts exceeded (3/3). This OTP has been invalidated.' };
    }

    // Increment attempt count
    activeOtp.attempts += 1;

    // Verify hash
    const isValid = await CryptoEngine.verifyHash(enteredCode.trim(), activeOtp.otp_hash);

    if (!isValid) {
      const remaining = 3 - activeOtp.attempts;
      if (activeOtp.attempts >= 3) {
        activeOtp.is_used = true;
        this.logEvent('OTP_FAILED', 'BLOCKED', `OTP attempt 3 failed. OTP invalidated for ${user.username}`, user);
        this.saveToStorage();
        return { success: false, message: 'Incorrect OTP. Maximum attempts reached (3/3). Code invalidated.', attemptsRemaining: 0 };
      }

      this.logEvent('OTP_FAILED', 'WARNING', `Incorrect OTP attempt (${activeOtp.attempts}/3) for ${user.username}`, user);
      this.saveToStorage();
      return {
        success: false,
        message: `Incorrect OTP. You have ${remaining} ${remaining === 1 ? 'attempt' : 'attempts'} remaining.`,
        attemptsRemaining: remaining,
      };
    }

    // SUCCESS! Mark OTP as used (Replay protection!)
    activeOtp.is_used = true;
    user.failed_attempts = 0;
    user.last_login = new Date().toISOString();
    this.currentUser = user;
    this.preAuthUser = null;

    this.logEvent('OTP_VERIFIED', 'SUCCESS', `Factor 2 verified successfully via Email OTP for ${user.username}`, user);
    this.logEvent('LOGIN_SUCCESS', 'SUCCESS', `Full MFA authentication successful for ${user.username}`, user);

    this.saveToStorage();
    return { success: true, message: 'OTP verified successfully! Welcome back.' };
  }

  // FACTOR 2: TOTP (RFC 6238 Authenticator App)
  async setupTOTP(userId: string): Promise<{ secret: string; otpAuthUrl: string }> {
    const user = this.users.find(u => u.id === userId);
    if (!user) throw new Error('User not found');

    const secret = CryptoEngine.generateTOTPSecret(16);
    const otpAuthUrl = CryptoEngine.buildOtpAuthUrl(secret, user.username, 'MFASecure');

    return { secret, otpAuthUrl };
  }

  async enableTOTP(
    userId: string,
    secret: string,
    verificationCode: string
  ): Promise<{ success: boolean; message: string; rawBackupCodes?: string[] }> {
    const user = this.users.find(u => u.id === userId);
    if (!user) return { success: false, message: 'User not found' };

    const isValid = await CryptoEngine.verifyTOTP(secret, verificationCode);
    if (!isValid) {
      return { success: false, message: 'Invalid 6-digit code. Please verify the time on your authenticator app.' };
    }

    user.totp_secret = secret;
    user.mfa_enabled = true;
    user.preferred_mfa = 'both';

    // Generate fresh backup codes
    const backupResult = await this.generateAndStoreBackupCodes(user.id, 8);

    this.logEvent('TOTP_SETUP', 'SUCCESS', `TOTP Authenticator enabled and verified for ${user.username}`, user);
    this.saveToStorage();

    return {
      success: true,
      message: 'TOTP 2FA enabled successfully! Keep your backup codes in a safe place.',
      rawBackupCodes: backupResult.rawCodes,
    };
  }

  async verifyTOTPLogin(userId: string, code: string): Promise<{ success: boolean; message: string }> {
    const user = this.users.find(u => u.id === userId);
    if (!user || !user.totp_secret) {
      return { success: false, message: 'TOTP is not configured for this account' };
    }

    const isValid = await CryptoEngine.verifyTOTP(user.totp_secret, code);
    if (!isValid) {
      this.logEvent('TOTP_FAILED', 'WARNING', `Invalid TOTP code supplied for ${user.username}`, user);
      return { success: false, message: 'Invalid TOTP code. Codes refresh every 30 seconds.' };
    }

    user.failed_attempts = 0;
    user.last_login = new Date().toISOString();
    this.currentUser = user;
    this.preAuthUser = null;

    this.logEvent('TOTP_VERIFIED', 'SUCCESS', `Factor 2 verified successfully via TOTP App for ${user.username}`, user);
    this.logEvent('LOGIN_SUCCESS', 'SUCCESS', `Full MFA authentication successful for ${user.username}`, user);

    this.saveToStorage();
    return { success: true, message: 'TOTP verified successfully! Welcome back.' };
  }

  // FACTOR 2: BACKUP RECOVERY CODES
  async generateAndStoreBackupCodes(
    userId: string,
    count: number = 8
  ): Promise<{ rawCodes: string[] }> {
    const { rawCodes } = CryptoEngine.generateBackupCodes(count);

    // Remove existing unused codes for user
    this.backupCodes = this.backupCodes.filter(b => b.user_id !== userId);

    for (const code of rawCodes) {
      const codeHash = await CryptoEngine.sha256(code);
      const preview = `${code.substring(0, 4)}-****`;
      this.backupCodes.push({
        id: 'bk_' + Math.random().toString(36).substring(2, 9),
        user_id: userId,
        code_hash: codeHash,
        code_preview: preview,
        is_used: false,
        created_at: new Date().toISOString(),
        used_at: null,
      });
    }

    this.saveToStorage();
    return { rawCodes };
  }

  async verifyBackupCode(userId: string, codeInput: string): Promise<{ success: boolean; message: string }> {
    const user = this.users.find(u => u.id === userId);
    if (!user) return { success: false, message: 'User not found' };

    const clean = codeInput.trim().toUpperCase();
    const userCodes = this.backupCodes.filter(b => b.user_id === user.id && !b.is_used);

    for (const record of userCodes) {
      const match = await CryptoEngine.verifyHash(clean, record.code_hash);
      if (match) {
        record.is_used = true;
        record.used_at = new Date().toISOString();
        user.failed_attempts = 0;
        user.last_login = new Date().toISOString();
        this.currentUser = user;
        this.preAuthUser = null;

        this.logEvent(
          'BACKUP_CODE_USED',
          'WARNING',
          `Emergency backup code redeemed (${record.code_preview}) by ${user.username}`,
          user
        );
        this.logEvent('LOGIN_SUCCESS', 'SUCCESS', `MFA completed via one-time backup recovery code`, user);

        this.saveToStorage();
        return { success: true, message: 'Backup recovery code accepted. One-time code marked as used.' };
      }
    }

    this.logEvent('BACKUP_CODE_FAILED', 'FAILURE', `Invalid or already consumed backup code entered for ${user.username}`, user);
    return { success: false, message: 'Invalid or already consumed backup code.' };
  }

  // ADMIN ACTIONS
  unlockUser(userId: string): { success: boolean; message: string } {
    const user = this.users.find(u => u.id === userId);
    if (!user) return { success: false, message: 'User not found' };

    user.locked_until = null;
    user.failed_attempts = 0;
    this.logEvent('ACCOUNT_UNLOCKED', 'SUCCESS', `Administrator manually unlocked account for ${user.username}`, user);
    this.saveToStorage();
    return { success: true, message: `Account "${user.username}" unlocked successfully.` };
  }

  toggleUserRole(userId: string): { success: boolean; message: string; newRole?: 'user' | 'admin' } {
    const user = this.users.find(u => u.id === userId);
    if (!user) return { success: false, message: 'User not found' };

    user.role = user.role === 'admin' ? 'user' : 'admin';
    this.saveToStorage();
    return { success: true, message: `Role for ${user.username} changed to ${user.role}`, newRole: user.role };
  }

  toggleUserMFA(userId: string, enabled: boolean): { success: boolean; message: string } {
    const user = this.users.find(u => u.id === userId);
    if (!user) return { success: false, message: 'User not found' };

    user.mfa_enabled = enabled;
    this.saveToStorage();
    return { success: true, message: `MFA ${enabled ? 'enabled' : 'disabled'} for ${user.username}` };
  }

  // EMAIL SIMULATOR
  private sendSimulatedEmail(email: Omit<SimulatedEmail, 'id' | 'timestamp' | 'read'>): void {
    const newEmail: SimulatedEmail = {
      ...email,
      id: 'email_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6),
      timestamp: Date.now(),
      read: false,
    };
    this.simulatedEmails.unshift(newEmail);
    // Keep max 50 emails
    if (this.simulatedEmails.length > 50) {
      this.simulatedEmails.pop();
    }
    this.saveToStorage();
  }

  markEmailRead(emailId: string): void {
    const em = this.simulatedEmails.find(e => e.id === emailId);
    if (em) {
      em.read = true;
      this.saveToStorage();
    }
  }

  clearEmails(): void {
    this.simulatedEmails = [];
    this.saveToStorage();
  }

  // LOGOUT
  logout(): void {
    if (this.currentUser) {
      this.logEvent('LOGOUT', 'SUCCESS', `User "${this.currentUser.username}" logged out`, this.currentUser);
    }
    this.currentUser = null;
    this.preAuthUser = null;
    this.saveToStorage();
  }

  cancelPreAuth(): void {
    this.preAuthUser = null;
    this.saveToStorage();
  }

  // METRICS SUMMARY FOR ADMIN DASHBOARD
  getSystemMetrics() {
    const totalUsers = this.users.length;
    const mfaEnabledCount = this.users.filter(u => u.mfa_enabled).length;
    const now = Date.now();
    const activeLockouts = this.users.filter(u => u.locked_until && new Date(u.locked_until).getTime() > now).length;
    const totalEvents = this.auditLogs.length;
    const failedLogins = this.auditLogs.filter(a => a.event === 'LOGIN_FAILED' || a.event === 'OTP_FAILED').length;
    const blockedAttacks = this.auditLogs.filter(a => a.status === 'BLOCKED' || a.event === 'SECURITY_ATTACK_BLOCKED').length;

    return {
      totalUsers,
      mfaAdoptionRate: totalUsers > 0 ? Math.round((mfaEnabledCount / totalUsers) * 100) : 0,
      activeLockouts,
      totalEvents,
      failedLogins,
      blockedAttacks,
    };
  }

  // RESET DATABASE TO DEFAULT DEMO STATE
  resetToDemo(): void {
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}users`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}otp_records`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}backup_codes`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}audit_logs`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}emails`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}current_user_id`);
    this.currentUser = null;
    this.preAuthUser = null;
    this.seedInitialData();
  }
}
