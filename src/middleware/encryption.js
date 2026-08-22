import CryptoJS from 'crypto-js';
import config from '../config/config.js';

class EncryptionMiddleware {
  getCredentials(env) {
    return {
      encryptionKey: (env && env.ENCRYPTION_KEY) || config.ENCRYPTION_KEY,
      iv: (env && env.ENCRYPTION_IV) || config.ENCRYPTION_IV
    };
  }

  // Encrypt API key
  encryptApiKey(apiKey, env) {
    try {
      const { encryptionKey, iv } = this.getCredentials(env);
      const encrypted = CryptoJS.AES.encrypt(
        apiKey,
        encryptionKey,
        {
          iv: CryptoJS.enc.Hex.parse(iv),
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
  decryptApiKey(encryptedApiKey, env) {
    try {
      const { encryptionKey, iv } = this.getCredentials(env);
      const decrypted = CryptoJS.AES.decrypt(
        encryptedApiKey,
        encryptionKey,
        {
          iv: CryptoJS.enc.Hex.parse(iv),
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
        const decryptedApiKey = this.decryptApiKey(encryptedApiKey, request.env);
      
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
  generateEncryptedKey(apiKey, env) {
    return this.encryptApiKey(apiKey, env);
  }
}

export default new EncryptionMiddleware();