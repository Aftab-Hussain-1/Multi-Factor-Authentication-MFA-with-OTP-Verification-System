/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface CodeSnippet {
  filename: string;
  path: string;
  description: string;
  code: string;
}

export const PYTHON_CODE_SNIPPETS: CodeSnippet[] = [
  {
    filename: 'models.py',
    path: 'app/models.py',
    description: 'Updated database models including users (with role & lockout), otp_codes, backup_codes, and audit_logs exactly as in Proposal Section 9',
    code: `"""
Database models for MFA OTP Authentication System
Directly implementing Proposal Section 9 Database Design
"""
from datetime import datetime, timedelta
from database import Base
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Enum, Text
from sqlalchemy.orm import relationship

class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(100), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum('user', 'admin', name='user_roles'), default='user', nullable=False)
    totp_secret = Column(String(64), nullable=True)
    mfa_enabled = Column(Boolean, default=True, nullable=False)
    failed_attempts = Column(Integer, default=0, nullable=False)
    locked_until = Column(DateTime, nullable=True)
    email_verified = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    last_login = Column(DateTime, nullable=True)

    # Relationships
    otp_codes = relationship('OTPCode', back_populates='user', cascade='all, delete-orphan')
    backup_codes = relationship('BackupCode', back_populates='user', cascade='all, delete-orphan')
    audit_logs = relationship('AuditLog', back_populates='user', cascade='all, delete-orphan')

    def is_locked(self) -> bool:
        """Check if account is currently locked out"""
        if self.locked_until and datetime.utcnow() < self.locked_until:
            return True
        return False

    def remaining_lockout_seconds(self) -> int:
        """Calculate remaining seconds of lockout"""
        if self.is_locked():
            return int((self.locked_until - datetime.utcnow()).total_seconds())
        return 0


class OTPCode(Base):
    """
    Table: otp_codes (Proposal Section 9 & 13)
    Stores ONLY hashed OTPs with strict 5-minute expiry and 3-attempt limit
    """
    __tablename__ = 'otp_codes'

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    otp_hash = Column(String(255), nullable=False)  # Never plain text!
    expires_at = Column(DateTime, nullable=False)   # Exactly 5 minutes from creation
    attempts = Column(Integer, default=0, nullable=False) # Max 3 attempts
    is_used = Column(Boolean, default=False, nullable=False) # Replay prevention
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship('User', back_populates='otp_codes')


class BackupCode(Base):
    """
    Table: backup_codes (Proposal Section 9 & 14)
    One-time emergency account recovery codes
    """
    __tablename__ = 'backup_codes'

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    code_hash = Column(String(255), nullable=False)
    code_preview = Column(String(16), nullable=False) # e.g. "9F4E-****"
    is_used = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    used_at = Column(DateTime, nullable=True)

    user = relationship('User', back_populates='backup_codes')


class AuditLog(Base):
    """
    Table: audit_logs (Proposal Section 8, 9 & 14)
    Comprehensive immutable security audit trail
    """
    __tablename__ = 'audit_logs'

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='SET NULL'), nullable=True, index=True)
    event = Column(String(50), nullable=False, index=True) # LOGIN_SUCCESS, ACCOUNT_LOCKED, etc.
    ip_address = Column(String(45), nullable=False)
    user_agent = Column(String(255), nullable=False)
    status = Column(String(20), nullable=False) # SUCCESS, FAILURE, WARNING, BLOCKED
    details = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    user = relationship('User', back_populates='audit_logs')
`,
  },
  {
    filename: 'otp_service.py',
    path: 'app/services/otp_service.py',
    description: 'Implements secure OTP generation using secrets module, hash storage, 5-minute expiry, and max 3 attempts as in Proposal Section 13',
    code: `"""
OTP Service (Factor 2 Email Verification)
Implements Proposal Section 13 Key Implementation Logic
"""
import secrets
from datetime import datetime, timedelta
from werkzeug.security import generate_password_hash, check_password_hash
from app.models import OTPCode, User
from app.services.audit_service import audit_service
from app.services.email_service import email_service

class OTPService:
    @staticmethod
    def create_otp(db_session, user: User) -> str:
        """
        Generate 6-digit cryptographically secure OTP.
        Stores ONLY the hash in the database.
        Expires in 5 minutes.
        """
        # Cryptographically secure 6-digit number
        otp = f"{secrets.randbelow(10**6):06d}"

        # Hash before saving to database
        otp_hash = generate_password_hash(otp)
        expires_at = datetime.utcnow() + timedelta(minutes=5)

        user_otp = OTPCode(
            user_id=user.id,
            otp_hash=otp_hash,
            expires_at=expires_at,
            attempts=0,
            is_used=False
        )

        db_session.add(user_otp)
        db_session.commit()

        # Send raw OTP via email (never stored in plain text!)
        email_service.send_otp_email(user.email, otp)
        audit_service.log(
            db_session,
            event='OTP_SENT',
            status='SUCCESS',
            details=f"6-digit OTP dispatched to {user.email}. Valid for 5 min.",
            user=user
        )

        return otp

    @staticmethod
    def verify_otp(db_session, user: User, entered_code: str) -> tuple[bool, str]:
        """
        Verify user entered OTP against latest active record.
        Enforces:
        - 5-minute expiration
        - Max 3 attempts before code invalidation
        - Replay prevention (marks is_used=True)
        """
        # Retrieve latest unused OTP
        rec = db_session.query(OTPCode)\\
            .filter(OTPCode.user_id == user.id, OTPCode.is_used == False)\\
            .order_by(OTPCode.created_at.desc())\\
            .first()

        if not rec:
            audit_service.log(db_session, 'OTP_FAILED', 'FAILURE', 'No active OTP found', user=user)
            return False, "No active OTP request found. Please request a new code."

        # Check expiration (5 minutes)
        if rec.expires_at < datetime.utcnow():
            rec.is_used = True
            db_session.commit()
            audit_service.log(db_session, 'OTP_FAILED', 'FAILURE', 'Expired OTP submitted', user=user)
            return False, "This OTP has expired (> 5 minutes). Please request a new code."

        # Check attempt threshold (max 3 attempts)
        if rec.attempts >= 3:
            rec.is_used = True
            db_session.commit()
            audit_service.log(db_session, 'OTP_FAILED', 'BLOCKED', 'Max OTP attempts (3/3) reached', user=user)
            return False, "Maximum attempts reached. This OTP has been invalidated."

        rec.attempts += 1

        # Check hash
        if check_password_hash(rec.otp_hash, entered_code.strip()):
            rec.is_used = True  # Mark used immediately to prevent replay
            user.failed_attempts = 0 # Reset failed counters
            db_session.commit()
            audit_service.log(db_session, 'OTP_VERIFIED', 'SUCCESS', 'Factor 2 verified via Email OTP', user=user)
            return True, "OTP verified successfully!"

        db_session.commit()
        remaining = 3 - rec.attempts
        if remaining <= 0:
            rec.is_used = True
            db_session.commit()
            return False, "Invalid OTP. You have exhausted all 3 attempts. Code invalidated."

        return False, f"Invalid OTP. {remaining} attempt(s) remaining."

otp_service = OTPService()
`,
  },
  {
    filename: 'lockout_service.py',
    path: 'app/services/lockout_service.py',
    description: 'Enforces 5 failed attempts lockout policy with 15-minute lock window and Admin unlock capabilities (Proposal Section 7 & 10)',
    code: `"""
Lockout Service: Account protection against Brute-Force Attacks
Proposal Section 7 Flowchart & Section 14 Countermeasures
"""
from datetime import datetime, timedelta
from app.models import User
from app.services.audit_service import audit_service

class LockoutService:
    MAX_FAILED_ATTEMPTS = 5
    LOCKOUT_DURATION_MINUTES = 15

    @classmethod
    def check_lockout(cls, user: User) -> tuple[bool, str, int]:
        """
        Checks if the user account is locked.
        Returns: (is_locked, message, remaining_minutes)
        """
        if user.locked_until:
            now = datetime.utcnow()
            if now < user.locked_until:
                remaining = int((user.locked_until - now).total_seconds() / 60) + 1
                return True, f"Account locked due to 5 failed attempts. Please try again in {remaining} minute(s).", remaining
            else:
                # Lockout period expired: reset
                user.locked_until = None
                user.failed_attempts = 0
        return False, "", 0

    @classmethod
    def register_failed_attempt(cls, db_session, user: User) -> tuple[bool, str]:
        """
        Increments failed attempt counter.
        Triggers 15-minute lockout if threshold reaches 5.
        """
        user.failed_attempts += 1
        if user.failed_attempts >= cls.MAX_FAILED_ATTEMPTS:
            user.locked_until = datetime.utcnow() + timedelta(minutes=cls.LOCKOUT_DURATION_MINUTES)
            audit_service.log(
                db_session,
                event='ACCOUNT_LOCKED',
                status='WARNING',
                details=f"Brute-force protection: User {user.username} locked for 15 minutes after 5 failed passwords.",
                user=user
            )
            db_session.commit()
            return True, "Account locked for 15 minutes due to 5 consecutive failed login attempts."

        db_session.commit()
        remaining = cls.MAX_FAILED_ATTEMPTS - user.failed_attempts
        return False, f"Invalid password. {remaining} attempt(s) remaining before 15-minute account lockout."

    @classmethod
    def unlock_user(cls, db_session, user: User, admin_username: str):
        """Administrator manually unlocks a locked account"""
        user.locked_until = None
        user.failed_attempts = 0
        audit_service.log(
            db_session,
            event='ACCOUNT_UNLOCKED',
            status='SUCCESS',
            details=f"Account manually unlocked by administrator: {admin_username}",
            user=user
        )
        db_session.commit()

lockout_service = LockoutService()
`,
  },
  {
    filename: 'audit_service.py',
    path: 'app/services/audit_service.py',
    description: 'Centralized security audit logger for recording all authentication events (Proposal Section 8 & 9)',
    code: `"""
Audit Service: Centralized security event logging
Proposal Section 8, 9 & 10
"""
from flask import request
from app.models import AuditLog, User

class AuditService:
    @staticmethod
    def log(db_session, event: str, status: str, details: str = "", user: User = None, ip: str = None):
        """
        Writes immutable audit log entry.
        Events: LOGIN_SUCCESS, LOGIN_FAILED, OTP_SENT, OTP_VERIFIED,
                TOTP_VERIFIED, ACCOUNT_LOCKED, ACCOUNT_UNLOCKED, BACKUP_CODE_USED
        """
        try:
            ip_address = ip or (request.remote_addr if request else '127.0.0.1') or 'unknown'
            user_agent = (request.user_agent.string if request and request.user_agent else 'system')[:250]

            entry = AuditLog(
                user_id=user.id if user else None,
                event=event,
                ip_address=ip_address,
                user_agent=user_agent,
                status=status,
                details=details
            )
            db_session.add(entry)
            db_session.commit()
        except Exception as e:
            db_session.rollback()
            print(f"[AuditLogger Error] Failed to write log: {e}")

audit_service = AuditService()
`,
  },
];
