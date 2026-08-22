import { Router } from 'itty-router';
import { withContent, withParams } from 'itty-router-extras';
import { handleSMSRequest } from './routes/sms.js';
import encryptionMiddleware from './middleware/encryption.js';
import rateLimiter, { RateLimiterDO }  from './middleware/rateLimiter.js';
import paramToBodyMiddleware from './middleware/paramToBody.js';
import config from './config/config.js';
export { RateLimiterDO };

// Create router
const router = Router();

// Global middleware
router.all('*', (request, env, ctx) => {
  // Add environment to request for later use
  request.env = env;
  request.ctx = ctx;
  return request;
});

// Health check endpoint
router.get('/api/health', () => {
  return new Response(
    JSON.stringify({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'SMS API Middleware',
      environment: config.NODE_ENV || 'development'
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }
  );
});

// Generate encrypted API key
router.post('/api/generate-key', async (request) => {
  try {
    const body = await request.json();
    const { apiKey } = body;
    
    if (!apiKey) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'API key is required'
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    const encryptedKey = encryptionMiddleware.generateEncryptedKey(apiKey);
    
    return new Response(
      JSON.stringify({
        success: true,
        encryptedKey: encryptedKey,
        originalKey: apiKey
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to generate encrypted key'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
});

// Main SMS endpoint
router.all('/api/send-sms', async (request) => {
  try {
    const env = request.env;
    const ctx = request.ctx;
    
    // 1. Decrypt API key
    const decryptResult = await encryptionMiddleware.decryptApiKeyMiddleware(request);
    if (!decryptResult.success) {
      return decryptResult.response;
    }
    request.decryptedApiKey = decryptResult.apiKey;
    
    // 2. Apply rate limiting
    const rateLimitResult = await rateLimiter.checkRateLimit(request, env, ctx);
    if (!rateLimitResult.success) {
      return rateLimitResult.response;
    }
    
    // 3. Convert parameters to body
    const convertResult = await paramToBodyMiddleware.convertToBody(request);
    if (!convertResult.success) {
      return convertResult.response;
    }
    request.convertedBody = convertResult.body;
    
    // 4. Handle SMS request
    const smsResponse = await handleSMSRequest(request, env);
    return smsResponse;
    
  } catch (error) {
    console.error('Error in main handler:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Internal server error',
        details: error.message
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
});

// 404 handler
router.all('*', () => {
  return new Response(
    JSON.stringify({
      success: false,
      error: 'Route not found'
    }),
    {
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    }
  );
});

// Export the worker
export default {
  async fetch(request, env, ctx) {
    // Set environment for request
    request.env = env;
    request.ctx = ctx;
    
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
      'Access-Control-Max-Age': '86400'
    };
    
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders
      });
    }
    
    // Route the request
    const response = await router.handle(request, env, ctx);
    
    // Add CORS headers to response
    const newResponse = new Response(response.body, response);
    Object.keys(corsHeaders).forEach(key => {
      newResponse.headers.set(key, corsHeaders[key]);
    });
    
    return newResponse;
  }
};