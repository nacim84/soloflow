import crypto from 'crypto';

/**
 * Génère une clé API sécurisée
 * @param environment - "production" ou "test"
 * @returns Clé au format sk_live_xxx ou sk_test_xxx
 */
export function generateApiKey(environment: 'production' | 'test'): string {
  const prefix = environment === 'production' ? 'sk_live' : 'sk_test';
  const randomBytes = crypto.randomBytes(32);
  const randomString = randomBytes.toString('base64url'); // URL-safe
  return `${prefix}_${randomString}`;
}

/**
 * Hache une clé API avec SHA-256 + Pepper
 * @param apiKey - Clé en clair
 * @returns Hash hexadécimal
 */
export function hashApiKey(apiKey: string): string {
  const pepper = process.env.API_KEY_PEPPER;
  if (!pepper) {
    throw new Error('API_KEY_PEPPER environment variable is not set');
  }

  return crypto
    .createHash('sha256')
    .update(apiKey + pepper)
    .digest('hex');
}

/**
 * Masque une clé pour affichage
 * @param apiKey - Clé complète
 * @returns Format masqué sk_live_abcd...xyz
 */
export function maskApiKey(apiKey: string): string {
  if (apiKey.length <= 12) return '••••••••';

  const start = apiKey.slice(0, 12);
  const end = apiKey.slice(-4);
  return `${start}...${end}`;
}

/**
 * Extrait les 4 derniers caractères (hint)
 * @param apiKey - Clé complète
 * @returns Hint pour affichage
 */
export function extractKeyHint(apiKey: string): string {
  return apiKey.slice(-4);
}

/**
 * Valide le format d'une clé API
 * @param apiKey - Clé à valider
 * @returns true si format valide
 */
export function isValidApiKeyFormat(apiKey: string): boolean {
  const regex = /^sk_(live|test)_[A-Za-z0-9_-]{43}$/;
  return regex.test(apiKey);
}
