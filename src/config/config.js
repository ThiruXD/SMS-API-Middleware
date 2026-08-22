const runtimeEnv =
  typeof globalThis !== 'undefined' && globalThis.process && globalThis.process.env
    ? globalThis.process.env
    : {};

function toInt(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export default {
  // Server Configuration
  PORT: toInt(runtimeEnv.PORT, 5000),

  // Encryption Configuration
  ENCRYPTION_KEY: runtimeEnv.ENCRYPTION_KEY || 'your-secret-encryption-key-32-chars-long',
  ENCRYPTION_IV: runtimeEnv.ENCRYPTION_IV || 'your-16-char-iv',

  // Rate Limiting Configuration
  RATE_LIMIT_WINDOW_MS: toInt(runtimeEnv.RATE_LIMIT_WINDOW_MS, 900000),
  RATE_LIMIT_MAX_REQUESTS: toInt(runtimeEnv.RATE_LIMIT_MAX_REQUESTS, 100),

  // SMS API Configuration
  SMS_API_URL: runtimeEnv.SMS_API_URL || 'https://your-sms-api.com/api/v1/sms/send',
  SMS_API_KEY: runtimeEnv.SMS_API_KEY || 'your-default-api-key',

  // Environment
  NODE_ENV: runtimeEnv.NODE_ENV || 'development',

  // Cloudflare specific
  ENVIRONMENT: runtimeEnv.ENVIRONMENT || 'production'
};