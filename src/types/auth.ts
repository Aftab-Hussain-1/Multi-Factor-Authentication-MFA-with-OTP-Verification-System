/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  role: UserRole;
  totp_secret: string | null;
  mfa_enabled: boolean;
  failed_attempts: number;
  locked_until: string | null; // ISO Date string
  email_verified: boolean;
  created_at: string;
  last_login: string | null;
  preferred_mfa: 'email_otp' | 'totp' | 'both';
}

export interface OTPRecord {
  id: string;
  user_id: string;
  otp_hash: string;
  expires_at: string; // ISO Date string (5 min expiry)
  attempts: number; // max 3 attempts before invalidation
  is_used: boolean; // prevents replay attacks
  created_at: string;
}

export interface BackupCodeRecord {
  id: string;
  user_id: string;
  code_hash: string;
  code_preview: string; // e.g. "A7B2-****"
  is_used: boolean;
  created_at: string;
  used_at: string | null;
}

export type AuditEventType =
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILED'
  | 'OTP_SENT'
  | 'OTP_VERIFIED'
  | 'OTP_FAILED'
  | 'TOTP_SETUP'
  | 'TOTP_VERIFIED'
  | 'TOTP_FAILED'
  | 'ACCOUNT_LOCKED'
  | 'ACCOUNT_UNLOCKED'
  | 'PASSWORD_RESET'
  | 'BACKUP_CODE_USED'
  | 'BACKUP_CODE_FAILED'
  | 'LOGOUT'
  | 'REGISTER'
  | 'EMAIL_VERIFIED'
  | 'SECURITY_ATTACK_BLOCKED';

export type AuditStatus = 'SUCCESS' | 'FAILURE' | 'WARNING' | 'BLOCKED';

export interface AuditLog {
  id: string;
  user_id: string | null;
  username: string;
  event: AuditEventType;
  ip_address: string;
  user_agent: string;
  status: AuditStatus;
  details: string;
  timestamp: string;
}

export interface SimulatedEmail {
  id: string;
  to: string;
  subject: string;
  body: string;
  type: 'otp' | 'verify' | 'alert' | 'reset';
  code?: string;
  token?: string;
  timestamp: number;
  read: boolean;
}

export interface AttackTestResult {
  id: string;
  name: string;
  targetCategory: string;
  description: string;
  payload: string;
  expectedResult: string;
  actualResult: string;
  status: 'PASSED' | 'FAILED' | 'RUNNING' | 'IDLE';
  details: string;
  timestamp: string;
}

export interface ProposalTallyItem {
  id: string;
  section: string;
  requirement: string;
  description: string;
  zipStatus: 'MISSING' | 'INCOMPLETE' | 'PRESENT';
  zipDetail: string;
  ourStatus: 'RESOLVED' | 'ENHANCED';
  ourDetail: string;
  category: 'MFA & OTP' | 'Database' | 'Security & Lockout' | 'Admin & Audit' | 'Testing & Defense';
}
