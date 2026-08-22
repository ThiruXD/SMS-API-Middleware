# 📨 SMS API Middleware

<p align="center">
  <a href="https://github.com/ThiruXD/SMS-API-Middleware/stargazers"><img src="https://img.shields.io/github/stars/ThiruXD/SMS-API-Middleware?style=social" alt="GitHub stars"></a>
  <a href="https://github.com/ThiruXD/SMS-API-Middleware/network/members"><img src="https://img.shields.io/github/forks/ThiruXD/SMS-API-Middleware?style=social" alt="GitHub forks"></a>
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT"></a>
</p>

A secure, production-ready API middleware that acts as a gateway for SMS services with built-in encryption, rate limiting, and parameter-to-body conversion support for both GET and POST requests. Deployable on Node.js or Cloudflare Workers.

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-18.x-339933?style=for-the-badge&logo=nodedotjs" alt="Node.js">
  <img src="https://img.shields.io/badge/Cloudflare_Workers-✓-F38020?style=for-the-badge&logo=cloudflare" alt="Cloudflare Workers">
  <img src="https://img.shields.io/badge/Express.js-4.x-000000?style=for-the-badge&logo=express" alt="Express.js">
  <img src="https://img.shields.io/badge/TypeScript-Ready-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript">
</p>

## 📋 Table of Contents

- [Features](#-features)
- [Architecture](#-architecture)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Cloudflare Deployment](#-cloudflare-deployment)
- [API Documentation](#-api-documentation)
- [Usage Examples](#-usage-examples)
- [Security](#-security)
- [Error Handling](#-error-handling)
- [Monitoring & Logging](#-monitoring--logging)
- [Testing](#-testing)
- [Contributing](#-contributing)
- [License](#-license)

## 🚀 Features

### Core Features
- **🔐 AES-256 Encryption**: Secure API key transmission with CBC mode encryption
- **⏱️ Distributed Rate Limiting**: Cloudflare Durable Objects for global rate limiting
- **🔄 Smart Parameter Conversion**: Automatically converts GET params or POST body to required format
- **📡 Dual Method Support**: Handles both GET and POST requests seamlessly
- **🛡️ Enterprise Security**: Helmet.js, CORS, and input validation
- **📝 Comprehensive Logging**: Request/response logging for debugging
- **⚡ Edge Computing**: Deploy globally on Cloudflare's edge network
- **🔍 Input Validation**: Robust validation with meaningful error messages

### Cloudflare-Specific Features
- 🌍 **Global Deployment**: Deploy to Cloudflare's 300+ locations worldwide
- 🎯 **Edge Computing**: Process requests closest to users
- 🔄 **Auto-scaling**: Handles traffic spikes automatically
- 💰 **Cost-Effective**: Pay-per-use pricing model
- 🚀 **Zero Cold Starts**: Always-on edge compute

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Request                          │
│                    (GET or POST with params)                    │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Cloudflare Workers Edge                     │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────────────────┐│
│  │   CORS &    │   │   API Key   │   │  Distributed Rate       ││
│  │   Preflight │──▶  Decryption │──▶  Limiting (DO/KV)       ││
│  └─────────────┘   └─────────────┘   └─────────────────────────┘│
│                           │                                     │
│                           ▼                                     │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │            Parameter to Body Conversion                     ││
│  │       -> Extracts from query string or request body         ││
│  │       -> Case-insensitive parameter matching                ││
│  │       -> Validates required fields                          ││
│  └─────────────────────────────────────────────────────────────┘│
│                           │                                     │
│                           ▼                                     │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │            Forward to SMS API                               ││
│  │       -> Adds decrypted API key to headers                  ││
│  │       -> Converts to POST request                           ││
│  │       -> Handles response and errors                        ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                     SMS API Provider                            │
│                  (Twilio, Vonage, etc.)                         │
└─────────────────────────────────────────────────────────────────┘
```

## 📋 Prerequisites

### For Node.js Deployment
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Environment**: Linux, macOS, or Windows

### For Cloudflare Workers Deployment
- **Cloudflare Account**: Free or paid
- **Wrangler CLI**: Latest version
- **Domain**: (Optional) Custom domain for your worker

### OpenSSL (Command Line)
- Use **OpenSSL** to generate ENCRYPTION_KEY and ENCRYPTION_IV 
- Install OpenSSL in your local computer
- Never use online generators for production keys

## 💻 Installation

### Generate 
```bash
# Generate 32-character (256-bit) encryption key (ENCRYPTION_KEY)
openssl rand -hex 32 | cut -c1-32
# Example output: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6

# Generate 16-character (128-bit) initialization vector (ENCRYPTION_IV)
openssl rand -hex 16 | cut -c1-16
# Example output: q8r9s0t1u2v3w4x5
```

### Standard Node.js Installation

```bash
# Clone the repository
git clone https://github.com/ThiruXD/SMS-API-Middleware.git
cd SMS-API-Middleware

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start development server
npm run dev

# Start production server
npm start
```

### Cloudflare Workers Installation

```bash
# Clone the repository
git clone https://github.com/ThiruXD/SMS-API-Middleware.git
cd SMS-API-Middleware

# Install dependencies
npm install

# Install Wrangler CLI globally (if not installed)
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Set up environment variables
wrangler secret put ENCRYPTION_KEY
wrangler secret put SMS_API_KEY
wrangler secret put SMS_API_URL

# Deploy to Cloudflare Workers
npm run deploy:prod  # Deploy to production
npm run deploy:staging  # Deploy to staging

# For development with local testing
npm run dev
```

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `ENCRYPTION_KEY` | AES-256 encryption key (32 chars) | - | ✅ Yes |
| `ENCRYPTION_IV` | Initialization vector (16 chars) | - | ✅ Yes |
| `SMS_API_URL` | Target SMS API URL | - | ✅ Yes |
| `SMS_API_KEY` | Default API key | - | ❌ No |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window in milliseconds | `900000` | ❌ No |
| `RATE_LIMIT_MAX_REQUESTS` | Maximum requests per window | `100` | ❌ No |
| `PORT` | Server port (Node.js only) | `5000` | ❌ No |
| `NODE_ENV` | Environment (development/production) | `development` | ❌ No |

### Cloudflare wrangler.toml Configuration

```toml
name = "sms-api-middleware"
main = "src/index.js"
compatibility_date = "2026-08-04"

[vars]
ENCRYPTION_KEY = "your-secret-encryption-key-32-chars-long"
ENCRYPTION_IV = "your-16-char-iv"
SMS_API_URL = "https://your-sms-api.com/api/v1/sms/send"
SMS_API_KEY = "your-default-api-key"
RATE_LIMIT_WINDOW_MS = "900000"
RATE_LIMIT_MAX_REQUESTS = "100"
NODE_ENV = "production"

# Durable Objects for rate limiting
[[durable_objects.bindings]]
name = "RATE_LIMITER"
class_name = "RateLimiterDO"

[[migrations]]
tag = "v1"
new_classes = ["RateLimiterDO"]

# KV Namespace (optional)
[[kv_namespaces]]
binding = "RATE_LIMIT_STORE"
id = "your-kv-namespace-id"
```

## ☁️ Cloudflare Deployment

### Step-by-Step Deployment Guide

#### 1. Install and Configure Wrangler

```bash
# Install Wrangler
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Verify installation
wrangler --version
```

#### 2. Set Up Secrets

```bash
# Set encryption key (32 characters)
wrangler secret put ENCRYPTION_KEY

# Set SMS API key
wrangler secret put SMS_API_KEY

# Set SMS API URL
wrangler secret put SMS_API_URL
```

#### 3. Create Durable Objects (for rate limiting)

```bash
# Create Durable Object
wrangler deploy --do

# Create KV Namespace (optional)
wrangler kv:namespace create "RATE_LIMIT_STORE"
```

#### 4. Deploy to Cloudflare

```bash
# Development environment
npm run dev

# Staging environment
npm run deploy:staging

# Production environment
npm run deploy:prod
```

#### 5. Configure Custom Domain (Optional)

1. Go to Cloudflare Dashboard → Workers & Pages
2. Select your worker
3. Go to Triggers → Custom Domains
4. Add your domain (e.g., `api.yourdomain.com`)

### Monitoring & Management

```bash
# View logs
npm run logs

# Tail logs in real-time
wrangler tail --format=pretty

# View worker metrics
# Go to Cloudflare Dashboard → Analytics
```

## 📚 API Documentation

### Base URL
```
Node.js: http://localhost:5000/api
Cloudflare: https://your-worker.workers.dev/api
```

### Endpoints

#### 1. Send SMS
```
POST /send-sms
GET  /send-sms
```

**Request Headers:**
```json
{
  "x-api-key": "encrypted_api_key",
  "Content-Type": "application/json"
}
```

**Request Parameters (for GET) or Body (for POST):**
```json
{
  "Sender_Name": "YourSenderName",
  "SMS_Message": "Your message content",
  "mobile_Number": "1234567890",
  "template_id": "your_template_id"
}
```

**Required Parameters:**

| Parameter | Type | Description | Example | Validation |
|-----------|------|-------------|---------|------------|
| `Sender_Name` | string | Sender name/ID | "MyCompany" | 3-50 chars |
| `SMS_Message` | string | SMS content | "Hello World!" | 1-1600 chars |
| `mobile_Number` | string | Recipient phone number | "+1234567890" | E.164 format |
| `template_id` | string | SMS template ID | "tpl_12345" | Alphanumeric |

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "messageId": "msg_123456789",
    "status": "sent",
    "recipient": "+1234567890"
  },
  "convertedFrom": "GET",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "responseStatus": 200
}
```

**Error Responses:**

| Status | Description | Example |
|--------|-------------|---------|
| 400 | Bad Request | Missing required parameters |
| 401 | Unauthorized | Invalid API key |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | SMS service unavailable |
| 503 | Service Unavailable | SMS API timeout |
| 504 | Gateway Timeout | SMS service took too long |

#### 2. Generate Encryption Key
```
POST /generate-key
```

**Request Body:**
```json
{
  "apiKey": "your_actual_api_key"
}
```

**Response:**
```json
{
  "success": true,
  "encryptedKey": "U2FsdGVkX1/xxxxxxxxxxxxx",
  "originalKey": "your_actual_api_key"
}
```

#### 3. Health Check
```
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "service": "SMS API Middleware",
  "environment": "production"
}
```

## 📝 Usage Examples

### cURL Examples

#### Node.js Deployment

```bash
# 1. Generate encrypted API key
curl -X POST "http://localhost:5000/api/generate-key" \
  -H "Content-Type: application/json" \
  -d '{"apiKey": "your-secret-api-key"}'

# 2. Send SMS via GET
curl -X GET "http://localhost:5000/api/send-sms?Sender_Name=Test&SMS_Message=Hello&mobile_Number=+1234567890&template_id=tpl_123" \
  -H "x-api-key: encrypted-key-here"

# 3. Send SMS via POST
curl -X POST "http://localhost:5000/api/send-sms" \
  -H "x-api-key: encrypted-key-here" \
  -H "Content-Type: application/json" \
  -d '{
    "Sender_Name": "Test",
    "SMS_Message": "Hello World",
    "mobile_Number": "+1234567890",
    "template_id": "tpl_123"
  }'

# 4. Health check
curl "http://localhost:5000/api/health"
```

#### Cloudflare Workers Deployment

```bash
# 1. Generate encrypted API key
curl -X POST "https://your-worker.workers.dev/api/generate-key" \
  -H "Content-Type: application/json" \
  -d '{"apiKey": "your-secret-api-key"}'

# 2. Send SMS via GET
curl -X GET "https://your-worker.workers.dev/api/send-sms?Sender_Name=Test&SMS_Message=Hello&mobile_Number=+1234567890&template_id=tpl_123" \
  -H "x-api-key: encrypted-key-here"

# 3. Send SMS via POST
curl -X POST "https://your-worker.workers.dev/api/send-sms" \
  -H "x-api-key: encrypted-key-here" \
  -H "Content-Type: application/json" \
  -d '{
    "Sender_Name": "Test",
    "SMS_Message": "Hello World",
    "mobile_Number": "+1234567890",
    "template_id": "tpl_123"
  }'
```

### JavaScript/TypeScript Examples

#### Using Fetch API

```javascript
// POST request
async function sendSMS(data) {
  const response = await fetch('https://your-worker.workers.dev/api/send-sms', {
    method: 'POST',
    headers: {
      'x-api-key': 'encrypted-key-here',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  
  return await response.json();
}

// Usage
const result = await sendSMS({
  Sender_Name: 'MyCompany',
  SMS_Message: 'Hello from JavaScript!',
  mobile_Number: '+1234567890',
  template_id: 'tpl_12345'
});
```

#### Using Axios

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://your-worker.workers.dev/api',
  headers: {
    'x-api-key': 'encrypted-key-here'
  }
});

// POST request
const response = await api.post('/send-sms', {
  Sender_Name: 'MyCompany',
  SMS_Message: 'Hello from Axios!',
  mobile_Number: '+1234567890',
  template_id: 'tpl_12345'
});

// GET request
const response = await api.get('/send-sms', {
  params: {
    Sender_Name: 'MyCompany',
    SMS_Message: 'Hello from Axios!',
    mobile_Number: '+1234567890',
    template_id: 'tpl_12345'
  }
});
```

### Python Examples

```python
import requests

# POST request
response = requests.post(
    'https://your-worker.workers.dev/api/send-sms',
    headers={
        'x-api-key': 'encrypted-key-here',
        'Content-Type': 'application/json'
    },
    json={
        'Sender_Name': 'MyCompany',
        'SMS_Message': 'Hello from Python!',
        'mobile_Number': '+1234567890',
        'template_id': 'tpl_12345'
    }
)

# GET request
response = requests.get(
    'https://your-worker.workers.dev/api/send-sms',
    headers={'x-api-key': 'encrypted-key-here'},
    params={
        'Sender_Name': 'MyCompany',
        'SMS_Message': 'Hello from Python!',
        'mobile_Number': '+1234567890',
        'template_id': 'tpl_12345'
    }
)
```

### Mobile SDK Examples

```javascript
// React Native
const sendSMS = async (params) => {
  try {
    const response = await fetch('https://your-worker.workers.dev/api/send-sms', {
      method: 'POST',
      headers: {
        'x-api-key': 'encrypted-key-here',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('SMS Error:', error);
  }
};
```

## 🔒 Security

### Encryption Implementation

The middleware uses AES-256-CBC encryption for API keys:

- **Algorithm**: AES-256-CBC
- **Key Size**: 32 bytes (256 bits)
- **IV Size**: 16 bytes (128 bits)
- **Padding**: PKCS7
- **Mode**: CBC (Cipher Block Chaining)

### Security Best Practices

1. **Key Management**
   - Store encryption keys in environment variables or Cloudflare Secrets
   - Rotate keys regularly (every 90 days recommended)
   - Never commit keys to version control
   - Use different keys for different environments

2. **Rate Limiting**
   - Configure appropriate limits based on your use case
   - Monitor rate limit violations
   - Adjust limits for different endpoints if needed
   - Use Cloudflare's built-in rate limiting for additional protection

3. **Input Validation**
   - All parameters are validated before processing
   - Phone numbers are format-checked (E.164 format)
   - Required parameters are enforced
   - SQL injection and XSS protection

4. **HTTPS**
   - Always use HTTPS in production
   - Configure SSL/TLS certificates
   - Enable HSTS headers
   - Use Cloudflare's SSL/TLS encryption

5. **Cloudflare-Specific Security**
   - Enable WAF (Web Application Firewall)
   - Use Bot Management
   - Enable Rate Limiting at the edge
   - Use API Shield for API protection

### Security Headers

```javascript
// Included via Helmet.js
app.use(helmet());

// Additional security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});
```

### Environment Variables

Always use environment variables or Cloudflare Secrets for sensitive data:

```bash
# Cloudflare Workers
wrangler secret put ENCRYPTION_KEY
wrangler secret put SMS_API_KEY

# Node.js
ENCRYPTION_KEY=your-secret-key
ENCRYPTION_IV=your-iv
SMS_API_KEY=your-api-key
```

## 🚨 Error Handling

### Error Codes

| Status Code | Description | Retry? |
|-------------|-------------|--------|
| 200 | Success | N/A |
| 400 | Bad Request - Invalid parameters | ❌ No |
| 401 | Unauthorized - Invalid API key | ❌ No |
| 429 | Too Many Requests - Rate limit exceeded | ✅ Yes (after cooldown) |
| 500 | Internal Server Error | ✅ Yes |
| 503 | Service Unavailable - SMS API down | ✅ Yes |
| 504 | Gateway Timeout | ✅ Yes |

### Error Response Format

```json
{
  "success": false,
  "error": "Descriptive error message",
  "requiredParams": ["param1", "param2"], // For validation errors
  "originalStatus": 500, // For upstream errors
  "details": "Additional error details", // For debugging
  "retryAfter": 60 // Seconds to wait before retry (rate limiting)
}
```

### Implementing Retry Logic

```javascript
async function sendSMSWithRetry(data, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await sendSMS(data);
      if (response.success) return response;
      
      // Handle rate limiting
      if (response.retryAfter) {
        await new Promise(resolve => setTimeout(resolve, response.retryAfter * 1000));
        continue;
      }
      
      // Handle server errors
      if (response.status >= 500) {
        await new Promise(resolve => setTimeout(resolve, attempt * 1000));
        continue;
      }
      
      // Client errors should not be retried
      return response;
    } catch (error) {
      if (attempt === maxRetries) throw error;
      await new Promise(resolve => setTimeout(resolve, attempt * 1000));
    }
  }
}
```

## 📊 Monitoring & Logging

### Request Logging

```javascript
// Format for logging
{
  "timestamp": "2024-01-01T12:00:00.000Z",
  "method": "GET",
  "url": "/api/send-sms",
  "status": 200,
  "responseTime": "45ms",
  "apiKey": "Present",
  "convertedFrom": "QUERY_PARAMS"
}
```

### Cloudflare Analytics

1. **Dashboard Analytics**
   - Requests count
   - Status codes distribution
   - Response time
   - Traffic spikes
   - Error rates

2. **Custom Analytics**
   ```javascript
   // Add custom analytics
   ctx.waitUntil(
     analytics.writeDataPoint({
       blobs: ["sms_request", request.headers.get('cf-connecting-ip')],
       doubles: [1],
       indexes: ["sms_sent"]
     })
   );
   ```

3. **Third-Party Monitoring**
   - **Datadog**: Use Cloudflare integration
   - **New Relic**: Use Cloudflare logs
   - **Sentry**: For error tracking
   - **Prometheus**: Export metrics

### Health Check Endpoint

```bash
# Check service health
curl https://your-worker.workers.dev/api/health

# Response
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "service": "SMS API Middleware",
  "environment": "production",
  "uptime": 3600,
  "version": "1.0.0"
}
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- src/middleware/encryption.test.js

# Watch mode (development)
npm run test:watch
```

### Test Examples

```javascript
import { describe, it, expect } from 'vitest';
import encryptionMiddleware from '../src/middleware/encryption.js';

describe('Encryption Middleware', () => {
  it('should encrypt and decrypt API key correctly', () => {
    const originalKey = 'test-api-key-123';
    const encrypted = encryptionMiddleware.encryptApiKey(originalKey);
    const decrypted = encryptionMiddleware.decryptApiKey(encrypted);
    expect(decrypted).toBe(originalKey);
  });
  
  it('should handle invalid encryption key gracefully', () => {
    expect(() => {
      encryptionMiddleware.decryptApiKey('invalid-key');
    }).toThrow();
  });
});
```

### Load Testing

```javascript
// Using k6 for load testing
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 }, // Ramp up
    { duration: '1m', target: 20 },  // Stay at 20 users
    { duration: '30s', target: 0 },  // Ramp down
  ],
};

export default function () {
  const response = http.get('https://your-worker.workers.dev/api/health');
  check(response, {
    'status is 200': (r) => r.status === 200,
  });
  sleep(1);
}
```

## 🔧 Troubleshooting

### Common Issues

#### 1. Rate Limit Errors (429)

**Symptoms**: Requests fail with 429 status code

**Solutions**:
- Reduce request frequency
- Implement exponential backoff
- Contact support to increase limits
- Check if limit is per-IP or per-API-key

#### 2. API Key Errors (401)

**Symptoms**: Requests fail with 401 status

**Solutions**:
- Verify encryption key is valid
- Check if API key is expired
- Ensure proper encryption/decryption
- Regenerate API key

#### 3. Timeout Errors (504)

**Symptoms**: Requests timeout frequently

**Solutions**:
- Increase timeout values
- Check SMS API health
- Implement circuit breaker
- Use Cloudflare Workers' WaitUntil

#### 4. Parameter Validation Errors (400)

**Symptoms**: Requests fail with 400 status

**Solutions**:
- Check required parameters
- Validate phone number format
- Ensure proper encoding
- Use correct parameter names

## 🤝 Contributing
We welcome contributions! Please follow these guidelines:

### Development Setup

1. Fork the repository
2. Clone your fork
3. Install dependencies
4. Create a feature branch
5. Make your changes
6. Run tests
7. Submit a pull request

### Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Examples
feat: add support for multiple SMS providers
fix: resolve rate limiting issue with Durable Objects
docs: update Cloudflare deployment documentation
style: format code with Prettier
refactor: optimize parameter extraction logic
test: add tests for rate limiter
chore: update dependencies
```

### Code Style

```bash
# Check code style
npm run lint

# Fix code style issues
npm run lint:fix

# Format code
npm run format
```

### Pull Request Process

1. Update documentation if needed
2. Add tests for new features
3. Ensure all tests pass
4. Request review from maintainers
5. Keep pull requests focused and concise

### Contributors:
1. [ThiruXD](https://github.com/ThiruXD) (Base)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Express.js](https://expressjs.com/) - Web framework for Node.js
- [Cloudflare Workers](https://workers.cloudflare.com/) - Edge computing platform
- [CryptoJS](https://cryptojs.gitbook.io/docs/) - Encryption library
- [Helmet.js](https://helmetjs.github.io/) - Security middleware
- [itty-router](https://itty.dev/) - Router for Cloudflare Workers
- [Wrangler](https://developers.cloudflare.com/workers/wrangler/) - Cloudflare Workers CLI

## 📞 Support & Community

- **GitHub Issues**: [Report bugs or request features](https://github.com/ThiruXD/SMS-API-Middleware/issues)
- **Discussions**: [Ask questions or share ideas](https://github.com/ThiruXD/SMS-API-Middleware/discussions)
- **Security Issues**: Please email privately or open a confidential issue

## 🌟 Show Your Support

If you found this project helpful, please give it a ⭐ on GitHub!

[![GitHub stars](https://img.shields.io/github/stars/ThiruXD/SMS-API-Middleware?style=social)](https://github.com/ThiruXD/SMS-API-Middleware/stargazers)

---

**Built with ❤️ for secure SMS API communication on Node.js and Cloudflare Workers**