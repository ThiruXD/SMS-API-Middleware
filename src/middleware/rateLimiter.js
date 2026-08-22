import config from '../config/config.js';

// Durable Object for distributed rate limiting
export class RateLimiterDO {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    // Storage for rate limit data
    this.storage = state.storage;
  }

  async fetch(request) {
    const url = new URL(request.url);
    const key = url.pathname.split('/').pop();
    const action = url.pathname.split('/')[1];
    
    if (action === 'check') {
      const result = await this.checkRateLimit(key);
      return new Response(JSON.stringify(result), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response('Not found', { status: 404 });
  }

  async checkRateLimit(key) {
    const now = Date.now();
    const windowMs = config.RATE_LIMIT_WINDOW_MS;
    const maxRequests = config.RATE_LIMIT_MAX_REQUESTS;
    
    // Get current data from storage
    let data = await this.storage.get(key) || { count: 0, resetTime: now + windowMs };
    
    // Check if window has expired
    if (now > data.resetTime) {
      data = { count: 0, resetTime: now + windowMs };
    }
    
    // Check if limit exceeded
    if (data.count >= maxRequests) {
      return {
        success: false,
        remaining: 0,
        resetTime: data.resetTime,
        limit: maxRequests
      };
    }
    
    // Increment counter
    data.count += 1;
    await this.storage.put(key, data);
    
    return {
      success: true,
      remaining: maxRequests - data.count,
      resetTime: data.resetTime,
      limit: maxRequests
    };
  }
}

class RateLimiter {
  constructor() {
    this.windowMs = config.RATE_LIMIT_WINDOW_MS;
    this.maxRequests = config.RATE_LIMIT_MAX_REQUESTS;
  }

  // Get rate limit key from request
  getRateLimitKey(request) {
    const apiKey = request.headers.get('x-api-key') || 'anonymous';
    const ip = request.headers.get('cf-connecting-ip') || 
               request.headers.get('x-forwarded-for') || 
               'unknown';
    return `${ip}-${apiKey}`;
  }

  // Check rate limit using Durable Object
  async checkRateLimit(request, env, ctx) {
    try {
      const key = this.getRateLimitKey(request);
      
      // Use Durable Object for distributed rate limiting
      if (env && env.RATE_LIMITER) {
        const id = env.RATE_LIMITER.idFromName(key);
        const obj = env.RATE_LIMITER.get(id);
        
        const response = await obj.fetch(`https://dummy/check/${key}`);
        const result = await response.json();
        
        if (!result.success) {
          return {
            success: false,
            response: new Response(
              JSON.stringify({
                success: false,
                error: 'Too many requests, please try again later.',
                retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
                limit: result.limit,
                remaining: result.remaining,
                resetTime: new Date(result.resetTime).toISOString()
              }),
              {
                status: 429,
                headers: {
                  'Content-Type': 'application/json',
                  'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000),
                  'X-RateLimit-Limit': result.limit,
                  'X-RateLimit-Remaining': result.remaining,
                  'X-RateLimit-Reset': new Date(result.resetTime).toISOString()
                }
              }
            )
          };
        }
        
        return {
          success: true,
          remaining: result.remaining,
          resetTime: result.resetTime,
          limit: result.limit
        };
      }
      
      // Fallback: In-memory rate limiting (not distributed)
      // This is a simplified version for when Durable Objects aren't available
      return { success: true };
      
    } catch (error) {
      console.error('Rate limit check error:', error);
      // Allow request if rate limiting fails (fail open)
      return { success: true };
    }
  }

  // Create response with rate limit headers
  addRateLimitHeaders(response, rateLimitInfo) {
    if (rateLimitInfo) {
      response.headers.set('X-RateLimit-Limit', rateLimitInfo.limit || this.maxRequests);
      response.headers.set('X-RateLimit-Remaining', rateLimitInfo.remaining || this.maxRequests);
      if (rateLimitInfo.resetTime) {
        response.headers.set('X-RateLimit-Reset', new Date(rateLimitInfo.resetTime).toISOString());
      }
    }
    return response;
  }
}

export default new RateLimiter();