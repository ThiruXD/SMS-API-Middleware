require('dotenv').config();

module.exports = {
  // API Configuration
  API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:3000',
  PORT: process.env.PORT || 5000,
  
  // Encryption Configuration
  ENCRYPTION_KEY: process.env.ENCRYPTION_KEY || 'your-secret-encryption-key-32-chars',
  ENCRYPTION_IV: process.env.ENCRYPTION_IV || 'your-16-char-iv',
  
  // Rate Limiting Configuration
  RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: 100, // Limit each IP to 100 requests per windowMs
  
  // SMS API Configuration
  SMS_API_URL: process.env.SMS_API_URL || 'http://localhost:3000/api/v1/sms/send',
  SMS_API_KEY: process.env.SMS_API_KEY || 'your-default-api-key',
};