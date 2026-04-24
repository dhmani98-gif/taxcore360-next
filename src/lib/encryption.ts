/**
 * End-to-End Encryption Service
 * Encrypts sensitive data like SSN and TIN/EIN
 * Uses AES-256-GCM for authenticated encryption
 */

import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';

const ALGORITHM = 'aes-256-gcm';

// Generate 32-byte key from environment variable
function getKey(): Buffer {
  const envKey = process.env.ENCRYPTION_KEY;
  if (!envKey) {
    throw new Error('ENCRYPTION_KEY environment variable is required');
  }
  return scryptSync(envKey, 'salt', 32);
}

/**
 * Encrypt text using AES-256-GCM
 * Returns format: iv:authTag:encrypted (all hex encoded)
 */
export function encrypt(text: string): string {
  try {
    const key = getKey();
    const iv = randomBytes(16);
    const cipher = createCipheriv(ALGORITHM, key, iv);
    
    const encrypted = Buffer.concat([
      cipher.update(text, 'utf8'),
      cipher.final()
    ]);
    
    const authTag = cipher.getAuthTag();
    
    // Return as hex strings separated by colon
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypt text using AES-256-GCM
 * Input format: iv:authTag:encrypted (all hex encoded)
 */
export function decrypt(encryptedData: string): string {
  try {
    const key = getKey();
    const parts = encryptedData.split(':');
    
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted data format');
    }
    
    const [ivHex, authTagHex, encryptedHex] = parts;
    
    const decipher = createDecipheriv(
      ALGORITHM,
      key,
      Buffer.from(ivHex, 'hex')
    );
    
    decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
    
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(encryptedHex, 'hex')),
      decipher.final()
    ]);
    
    return decrypted.toString('utf8');
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Hash sensitive data for lookup (one-way)
 * Uses SHA-256 for deterministic hashing
 */
export function hashForLookup(data: string): string {
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Mask sensitive data for display
 * Shows only last 4 characters
 */
export function maskSensitiveData(data: string, type: 'ssn' | 'ein' | 'default' = 'default'): string {
  if (!data || data.length < 4) {
    return '****';
  }
  
  const last4 = data.slice(-4);
  
  switch (type) {
    case 'ssn':
      // XXX-XX-XXXX
      return `XXX-XX-${last4}`;
    case 'ein':
      // XX-XXXXXXX
      return `XX-XXX${last4}`;
    default:
      return `****${last4}`;
  }
}

/**
 * Encrypt SSN field
 */
export function encryptSSN(ssn: string): { encrypted: string; hash: string } {
  return {
    encrypted: encrypt(ssn),
    hash: hashForLookup(ssn)
  };
}

/**
 * Decrypt SSN field
 */
export function decryptSSN(encrypted: string): string {
  return decrypt(encrypted);
}

/**
 * Encrypt TIN/EIN field
 */
export function encryptTIN(tin: string): { encrypted: string; hash: string } {
  return {
    encrypted: encrypt(tin),
    hash: hashForLookup(tin)
  };
}

/**
 * Decrypt TIN/EIN field
 */
export function decryptTIN(encrypted: string): string {
  return decrypt(encrypted);
}

/**
 * Verify encryption is working
 */
export function verifyEncryption(): boolean {
  try {
    const testData = '123-45-6789';
    const encrypted = encrypt(testData);
    const decrypted = decrypt(encrypted);
    return decrypted === testData;
  } catch (error) {
    console.error('Encryption verification failed:', error);
    return false;
  }
}
