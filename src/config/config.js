export default {
  // Server Configuration
  PORT: parseInt(process.env.PORT || '5000'),
  
  // Encryption Configuration
  ENCRYPTION_KEY: process.env.ENCRYPTION_KEY || 'your-secret-encryption-key-32-chars-long',
  ENCRYPTION_IV: process.env.ENCRYPTION_IV || 'your-16-char-iv',
  
  // Rate Limiting Configuration
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  
  // SMS API Configuration
  SMS_API_URL: process.env.SMS_API_URL || 'https://your-sms-api.com/api/v1/sms/send',
  SMS_API_KEY: process.env.SMS_API_KEY || 'your-default-api-key',
  
  // Environment
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Cloudflare specific
  ENVIRONMENT: process.env.ENVIRONMENT || 'production'
};