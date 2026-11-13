/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Base32 alphabet for RFC 3548 / RFC 6238 (TOTP)
const RFC3548_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

export class CryptoEngine {
  /**
   * Generates a cryptographically secure 6-digit numeric OTP
   */
  static generateSecureOTP(): string {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    const num = array[0] % 1000000;
    return num.toString().padStart(6, '0');
  }

  /**
   * Hashes a string (OTP or password) using SHA-256 with an optional salt
   */
  static async sha256(text: string, salt: string = 'mfa-otp-secure-salt'): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(`${salt}:${text}`);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Verifies if input matches stored hash
   */
  static async verifyHash(input: string, storedHash: string, salt: string = 'mfa-otp-secure-salt'): Promise<boolean> {
    const computed = await this.sha256(input, salt);
    return computed === storedHash;
  }

  /**
   * Generates a random Base32 secret for TOTP (e.g. 16 or 32 chars)
   */
  static generateTOTPSecret(length: number = 16): string {
    const bytes = new Uint8Array(length);
    crypto.getRandomValues(bytes);
    let secret = '';
    for (let i = 0; i < length; i++) {
      secret += RFC3548_ALPHABET[bytes[i] % RFC3548_ALPHABET.length];
    }
    return secret;
  }

  /**
   * Decodes Base32 string to Uint8Array
   */
  private static base32ToUint8Array(base32: string): Uint8Array {
    const cleaned = base32.toUpperCase().replace(/=+$/, '');
    let bits = 0;
    let value = 0;
    const output: number[] = [];

    for (let i = 0; i < cleaned.length; i++) {
      const idx = RFC3548_ALPHABET.indexOf(cleaned[i]);
      if (idx === -1) continue;
      value = (value << 5) | idx;
      bits += 5;
      if (bits >= 8) {
        output.push((value >>> (bits - 8)) & 255);
        bits -= 8;
      }
    }
    return new Uint8Array(output);
  }

  /**
   * Computes HMAC-SHA1 using WebCrypto
   */
  private static async hmacSha1(key: Uint8Array, message: Uint8Array): Promise<Uint8Array> {
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      key as unknown as BufferSource,
      { name: 'HMAC', hash: { name: 'SHA-1' } },
      false,
      ['sign']
    );
    const signature = await crypto.subtle.sign('HMAC', cryptoKey, message as unknown as BufferSource);
    return new Uint8Array(signature);
  }

  /**
   * Generates RFC 6238 TOTP code for a given secret at time (default = now)
   * Time step: 30 seconds, 6 digits
   */
  static async generateTOTP(secret: string, timestamp: number = Date.now(), stepSeconds: number = 30): Promise<string> {
    const key = this.base32ToUint8Array(secret);
    const counter = Math.floor(timestamp / 1000 / stepSeconds);

    // 8-byte big-endian counter
    const buffer = new ArrayBuffer(8);
    const view = new DataView(buffer);
    view.setUint32(0, Math.floor(counter / 0x100000000));
    view.setUint32(4, counter & 0xffffffff);

    const hmac = await this.hmacSha1(key, new Uint8Array(buffer));
    const offset = hmac[hmac.length - 1] & 0x0f;

    const binary =
      ((hmac[offset] & 0x7f) << 24) |
      ((hmac[offset + 1] & 0xff) << 16) |
      ((hmac[offset + 2] & 0xff) << 8) |
      (hmac[offset + 3] & 0xff);

    const otp = binary % 1000000;
    return otp.toString().padStart(6, '0');
  }

  /**
   * Verifies TOTP with ±1 step clock drift (tolerance window)
   */
  static async verifyTOTP(secret: string, token: string, windowSteps: number = 1): Promise<boolean> {
    if (!token || token.trim().length !== 6) return false;
    const now = Date.now();
    const cleanToken = token.trim();

    for (let i = -windowSteps; i <= windowSteps; i++) {
      const timeOffset = now + i * 30 * 1000;
      const code = await this.generateTOTP(secret, timeOffset);
      if (code === cleanToken) {
        return true;
      }
    }
    return false;
  }

  /**
   * Calculates seconds remaining in current 30s TOTP cycle
   */
  static getTOTPSecondsRemaining(stepSeconds: number = 30): number {
    const nowSeconds = Math.floor(Date.now() / 1000);
    return stepSeconds - (nowSeconds % stepSeconds);
  }

  /**
   * Builds otpauth URL for Google Authenticator QR Code
   */
  static buildOtpAuthUrl(secret: string, username: string, issuer: string = 'MFASecure'): string {
    return `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(username)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;
  }

  /**
   * Generates a set of 8 random alphanumeric backup codes
   * Format: XXXX-XXXX (e.g. "9F4E-2A8C")
   */
  static generateBackupCodes(count: number = 8): { rawCodes: string[]; hashedCodes: { code_hash: string; code_preview: string }[] } {
    const charset = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const rawCodes: string[] = [];
    const hashedCodes: { code_hash: string; code_preview: string }[] = [];

    for (let i = 0; i < count; i++) {
      let part1 = '';
      let part2 = '';
      const bytes = new Uint8Array(8);
      crypto.getRandomValues(bytes);
      for (let j = 0; j < 4; j++) part1 += charset[bytes[j] % charset.length];
      for (let j = 4; j < 8; j++) part2 += charset[bytes[j] % charset.length];
      const code = `${part1}-${part2}`;
      rawCodes.push(code);
    }

    return { rawCodes, hashedCodes };
  }
}
