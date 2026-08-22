import { Router } from 'itty-router';
import { handleSMSRequest } from './routes/sms.js';
import encryptionMiddleware from './middleware/encryption.js';
import rateLimiter, { RateLimiterDO }  from './middleware/rateLimiter.js';
import paramToBodyMiddleware from './middleware/paramToBody.js';
import config from './config/config.js';
export { RateLimiterDO };

// Create router
const router = Router();

// Health check endpoint
function healthHandler(request) {
  return new Response(
    JSON.stringify({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'SMS API Middleware',
      environment: request?.env?.NODE_ENV || config.NODE_ENV || 'development'
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}

router.get('/api/health', healthHandler);
router.get('/health', healthHandler);

// Generate encrypted API key
async function generateKeyHandler(request) {
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
    
    const encryptedKey = encryptionMiddleware.generateEncryptedKey(apiKey, request.env);
    
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
}

router.post('/api/generate-key', generateKeyHandler);
router.post('/generate-key', generateKeyHandler);

// Main SMS endpoint
async function sendSmsHandler(request) {
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
}

router.all('/api/send-sms', sendSmsHandler);
router.all('/send-sms', sendSmsHandler);

router.get('/', () => {
  return new Response(
    JSON.stringify({
      success: true,
      service: 'SMS API Middleware',
      endpoints: ['/api/health', '/api/generate-key', '/api/send-sms']
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }
  );
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
    try {
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

      // Route the request with a timeout guard to avoid indefinite hangs
      const response = await Promise.race([
        router.fetch(request, env, ctx),
        new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Route handling timed out')), 9000);
        })
      ]);

      if (!(response instanceof Response)) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Invalid handler response'
          }),
          {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          }
        );
      }

      // Add CORS headers to response
      const newResponse = new Response(response.body, response);
      Object.keys(corsHeaders).forEach(key => {
        newResponse.headers.set(key, corsHeaders[key]);
      });

      return newResponse;
    } catch (error) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Unhandled worker error',
          details: error.message
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
            'Access-Control-Max-Age': '86400'
          }
        }
      );
    }
  }
};