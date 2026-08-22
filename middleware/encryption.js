const CryptoJS = require('crypto-js');
const config = require('../config/config');

class EncryptionMiddleware {
  constructor() {
    this.encryptionKey = config.ENCRYPTION_KEY;
    this.iv = config.ENCRYPTION_IV;
  }

  // Encrypt API key
  encryptApiKey(apiKey) {
    try {
      const encrypted = CryptoJS.AES.encrypt(
        apiKey, 
        this.encryptionKey,
        {
          iv: CryptoJS.enc.enc.Hex.parse(this.iv),
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7
        }
      ).toString();
      return encrypted;
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt API key');
    }
  }

  // Decrypt API key
  decryptApiKey(encryptedApiKey) {
    try {
      const decrypted = CryptoJS.AES.decrypt(
        encryptedApiKey,
        this.encryptionKey,
        {
          iv: CryptoJS.enc.enc.Hex.parse(this.iv),
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7
        }
      ).toString(CryptoJS.enc.Utf8);
      return decrypted;
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt API key');
    }
  }

  // Middleware to decrypt API key from headers
  decryptApiKeyMiddleware() {
    return (req, res, next) => {
      try {
        const encryptedApiKey = req.headers['x-api-key'];
        if (!encryptedApiKey) {
          return res.status(401).json({
            success: false,
            error: 'API key is required'
          });
        }

        // Decrypt the API key
        const decryptedApiKey = this.decryptApiKey(encryptedApiKey);
        
        // Store decrypted API key in request object for later use
        req.decryptedApiKey = decryptedApiKey;
        
        // Replace header with decrypted key for downstream requests
        req.headers['x-api-key'] = decryptedApiKey;
        
        next();
      } catch (error) {
        return res.status(401).json({
          success: false,
          error: 'Invalid encrypted API key'
        });
      }
    };
  }

  // Helper to generate encrypted API key for testing
  generateEncryptedKey(apiKey) {
    return this.encryptApiKey(apiKey);
  }
}

module.exports = new EncryptionMiddleware();