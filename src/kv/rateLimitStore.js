export class RateLimitStore {
  constructor(env) {
    this.kv = env.RATE_LIMIT_STORE;
  }

  async get(key) {
    if (!this.kv) return null;
    try {
      const data = await this.kv.get(key, 'json');
      return data;
    } catch (error) {
      console.error('KV get error:', error);
      return null;
    }
  }

  async set(key, data, ttl) {
    if (!this.kv) return;
    try {
      await this.kv.put(key, JSON.stringify(data), { expirationTtl: ttl });
    } catch (error) {
      console.error('KV set error:', error);
    }
  }

  async increment(key, windowMs, maxRequests) {
    const now = Date.now();
    const data = await this.get(key) || { count: 0, resetTime: now + windowMs };
    
    if (now > data.resetTime) {
      data.count = 0;
      data.resetTime = now + windowMs;
    }
    
    data.count += 1;
    await this.set(key, data, Math.ceil(windowMs / 1000));
    
    return {
      count: data.count,
      resetTime: data.resetTime,
      remaining: maxRequests - data.count
    };
  }
}