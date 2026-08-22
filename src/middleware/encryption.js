import CryptoJS from 'crypto-js';
import config from '../config/config.js';

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

  // Middleware to decrypt API key from headers (Cloudflare version)
  async decryptApiKeyMiddleware(request) {
    try {
      const encryptedApiKey = request.headers.get('x-api-key');
      
      if (!encryptedApiKey) {
        return {
          success: false,
          response: new Response(
            JSON.stringify({
              success: false,
              error: 'API key is required'
            }),
            {
              status: 401,
              headers: { 'Content-Type': 'application/json' }
            }
          )
        };
      }

      // Decrypt the API key
      const decryptedApiKey = this.decryptApiKey(encryptedApiKey);
      
      return {
        success: true,
        apiKey: decryptedApiKey
      };
      
    } catch (error) {
      return {
        success: false,
        response: new Response(
          JSON.stringify({
            success: false,
            error: 'Invalid encrypted API key'
          }),
          {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
          }
        )
      };
    }
  }

  // Helper to generate encrypted API key for testing
  generateEncryptedKey(apiKey) {
    return this.encryptApiKey(apiKey);
  }
}

export default new EncryptionMiddleware();