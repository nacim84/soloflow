/**
 * Encryption utilities for API keys
 * Uses AES-256-CBC encryption with PBKDF2 key derivation
 */

import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16; // 128 bits for AES
const SALT_LENGTH = 64;
const ITERATIONS = 100000; // PBKDF2 iterations

/**
 * Get encryption key from environment variable
 * @throws {Error} if ENCRYPTION_KEY is not set
 */
function getEncryptionKey(): string {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error(
      'ENCRYPTION_KEY environment variable is not set. Generate one with: openssl rand -base64 32'
    );
  }
  return key;
}

/**
 * Derive a cryptographic key from the master encryption key
 * @param salt - Salt for key derivation
 * @returns Derived key buffer
 */
function deriveKey(salt: Buffer): Buffer {
  const masterKey = getEncryptionKey();
  return crypto.pbkdf2Sync(masterKey, salt, ITERATIONS, KEY_LENGTH, 'sha256');
}

/**
 * Encrypt an API key using AES-256-CBC
 * @param apiKey - The plain text API key to encrypt
 * @returns Encrypted string in format: salt:iv:encryptedData (all base64)
 * @throws {Error} if encryption fails
 */
export function encryptApiKey(apiKey: string): string {
  try {
    // Generate random salt and IV
    const salt = crypto.randomBytes(SALT_LENGTH);
    const iv = crypto.randomBytes(IV_LENGTH);

    // Derive encryption key from master key + salt
    const key = deriveKey(salt);

    // Create cipher and encrypt
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    let encrypted = cipher.update(apiKey, 'utf8', 'base64');
    encrypted += cipher.final('base64');

    // Return format: salt:iv:encryptedData (all base64 encoded)
    return `${salt.toString('base64')}:${iv.toString('base64')}:${encrypted}`;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt API key');
  }
}

/**
 * Decrypt an API key using AES-256-CBC
 * @param encryptedKey - Encrypted string in format: salt:iv:encryptedData
 * @returns Decrypted plain text API key
 * @throws {Error} if decryption fails or format is invalid
 */
export function decryptApiKey(encryptedKey: string): string {
  try {
    // Parse the encrypted string
    const parts = encryptedKey.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted key format. Expected: salt:iv:encryptedData');
    }

    const [saltBase64, ivBase64, encryptedData] = parts;

    // Decode from base64
    const salt = Buffer.from(saltBase64, 'base64');
    const iv = Buffer.from(ivBase64, 'base64');

    // Derive the same key using salt
    const key = deriveKey(salt);

    // Create decipher and decrypt
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    let decrypted = decipher.update(encryptedData, 'base64', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt API key');
  }
}

/**
 * Generate a secure random API key
 * Format: prefix_randomBase64String
 * @param prefix - Optional prefix (e.g., 'sk', 'pk')
 * @param length - Number of random bytes (default: 32)
 * @returns Generated API key string
 */
export function generateApiKey(prefix: string = 'sk', length: number = 32): string {
  const randomBytes = crypto.randomBytes(length);
  const randomString = randomBytes.toString('base64url'); // URL-safe base64
  return `${prefix}_${randomString}`;
}

/**
 * Hash an API key for safe logging/comparison
 * @param apiKey - The API key to hash
 * @returns SHA-256 hash of the key (hex format)
 */
export function hashApiKey(apiKey: string): string {
  return crypto.createHash('sha256').update(apiKey).digest('hex');
}

/**
 * Mask an API key for display purposes
 * Shows only first 8 chars and last 4 chars
 * @param apiKey - The API key to mask
 * @returns Masked string like "sk_abcd...xyz123"
 */
export function maskApiKey(apiKey: string): string {
  if (apiKey.length <= 12) {
    return '••••••••';
  }
  const start = apiKey.slice(0, 8);
  const end = apiKey.slice(-4);
  return `${start}...${end}`;
}

/**
 * Validate API key format
 * @param apiKey - The API key to validate
 * @returns true if valid format
 */
export function isValidApiKeyFormat(apiKey: string): boolean {
  // Basic validation: should have prefix and content
  const parts = apiKey.split('_');
  if (parts.length < 2) return false;

  const [prefix, ...rest] = parts;
  const content = rest.join('_');

  // Prefix should be 2-4 chars, content should be at least 20 chars
  return prefix.length >= 2 && prefix.length <= 4 && content.length >= 20;
}
