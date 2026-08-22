# SMS API Middleware

A secure, production-ready API middleware that acts as a gateway for SMS services with built-in encryption, rate limiting, and parameter-to-body conversion support for both GET and POST requests.

## 📋 Table of Contents

- [Features](#-features)
- [Architecture](#-architecture)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [API Documentation](#-api-documentation)
- [Usage Examples](#-usage-examples)
- [Security](#-security)
- [Error Handling](#-error-handling)
- [Monitoring & Logging](#-monitoring--logging)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

## 🚀 Features

- **🔐 Encryption/Decryption**: AES-256-CBC encryption for secure API key transmission
- **⏱️ Rate Limiting**: Configurable rate limiting per IP and API key
- **🔄 Parameter Conversion**: Automatically converts GET parameters or POST body to the required format
- **📡 Dual Method Support**: Handles both GET and POST requests, converting to POST internally
- **🛡️ Security**: Helmet.js integration, CORS configuration, and request validation
- **📝 Logging**: Comprehensive request/response logging for debugging
- **⚡ Performance**: Optimized middleware with minimal overhead
- **🔍 Validation**: Input validation with meaningful error messages
- **📊 Monitoring**: Health check endpoint for service monitoring

## 🏗️ Architecture

```
┌─────────────┐      ┌──────────────┐      ┌─────────────────┐      ┌────────────┐
│   Client    │────▶│  Encryption  │────▶│  Rate Limiter   │────▶│   Param    │
│  (GET/POST) │      │  Middleware  │      │   Middleware    │      │  to Body   │
└─────────────┘      └──────────────┘      └─────────────────┘      └────────────┘
                                                                       │
                                                                       ▼
┌─────────────┐      ┌──────────────┐      ┌─────────────────┐
│   Client    │◀────│  Response    │◀────│    SMS API      │
│  Response   │      │  Middleware  │      │   (POST)        │
└─────────────┘      └──────────────┘      └─────────────────┘
```

## 📋 Prerequisites

- **Node.js**: v14.0.0 or higher
- **npm**: v6.0.0 or higher
- **Environment**: Linux, macOS, or Windows

## 💻 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/ThiruXD/sms-api-middleware.git
cd sms-api-middleware
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

### 4. Start the Server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | Server port | `5000` | No |
| `ENCRYPTION_KEY` | AES-256 encryption key (32 chars) | - | Yes |
| `ENCRYPTION_IV` | Initialization vector (16 chars) | - | Yes |
| `SMS_API_URL` | Target SMS API URL | - | Yes |
| `SMS_API_KEY` | Default API key | - | No |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window in milliseconds | `900000` | No |
| `RATE_LIMIT_MAX_REQUESTS` | Maximum requests per window | `100` | No |

### Configuration File (`config/config.js`)

```javascript
module.exports = {
  // Server Configuration
  PORT: process.env.PORT || 5000,
  
  // Encryption Configuration
  ENCRYPTION_KEY: process.env.ENCRYPTION_KEY,
  ENCRYPTION_IV: process.env.ENCRYPTION_IV,
  
  // Rate Limiting Configuration
  RATE_LIMIT_WINDOW_MS: process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000,
  RATE_LIMIT_MAX_REQUESTS: process.env.RATE_LIMIT_MAX_REQUESTS || 100,
  
  // SMS API Configuration
  SMS_API_URL: process.env.SMS_API_URL,
  SMS_API_KEY: process.env.SMS_API_KEY,
};
```

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
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

**Request Body (POST) or Query Parameters (GET):**
```json
{
  "Sender_Name": "YourSenderName",
  "SMS_Message": "Your message content",
  "mobile_Number": "1234567890",
  "template_id": "your_template_id"
}
```

**Required Parameters:**
| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `Sender_Name` | string | Sender name/ID | "MyCompany" |
| `SMS_Message` | string | SMS content | "Hello World!" |
| `mobile_Number` | string | Recipient phone number | "+1234567890" |
| `template_id` | string | SMS template ID | "tpl_12345" |

**Success Response:**
```json
{
  "success": true,
  "data": {
    // SMS API response
  },
  "convertedFrom": "GET",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Missing required parameters: Sender_Name, SMS_Message",
  "requiredParams": ["Sender_Name", "SMS_Message", "mobile_Number", "template_id"]
}
```

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
  "service": "SMS API Middleware"
}
```

## 📝 Usage Examples

### cURL Examples

#### 1. Send SMS via POST
```bash
curl -X POST "http://localhost:5000/api/send-sms" \
  -H "x-api-key: U2FsdGVkX1/xxxxxxxxxxxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "Sender_Name": "TestSender",
    "SMS_Message": "Hello World from POST!",
    "mobile_Number": "+1234567890",
    "template_id": "tpl_12345"
  }'
```

#### 2. Send SMS via GET
```bash
curl -X GET "http://localhost:5000/api/send-sms?Sender_Name=TestSender&SMS_Message=Hello%20World%20from%20GET!&mobile_Number=+1234567890&template_id=tpl_12345" \
  -H "x-api-key: U2FsdGVkX1/xxxxxxxxxxxxx"
```

#### 3. Generate Encrypted API Key
```bash
curl -X POST "http://localhost:5000/api/generate-key" \
  -H "Content-Type: application/json" \
  -d '{"apiKey": "your-secret-api-key-12345"}'
```

#### 4. Health Check
```bash
curl "http://localhost:5000/api/health"
```

### JavaScript Examples

#### Using Fetch API
```javascript
// POST request
async function sendSMS(data) {
  const response = await fetch('http://localhost:5000/api/send-sms', {
    method: 'POST',
    headers: {
      'x-api-key': 'U2FsdGVkX1/xxxxxxxxxxxxx',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      Sender_Name: 'TestSender',
      SMS_Message: 'Hello from JavaScript!',
      mobile_Number: '+1234567890',
      template_id: 'tpl_12345'
    })
  });
  
  return await response.json();
}

// GET request
async function sendSMSGet(params) {
  const queryString = new URLSearchParams(params).toString();
  const response = await fetch(`http://localhost:5000/api/send-sms?${queryString}`, {
    method: 'GET',
    headers: {
      'x-api-key': 'U2FsdGVkX1/xxxxxxxxxxxxx'
    }
  });
  
  return await response.json();
}
```

#### Using Axios
```javascript
const axios = require('axios');

// POST request
const response = await axios.post('http://localhost:5000/api/send-sms', {
  Sender_Name: 'TestSender',
  SMS_Message: 'Hello from Axios!',
  mobile_Number: '+1234567890',
  template_id: 'tpl_12345'
}, {
  headers: {
    'x-api-key': 'U2FsdGVkX1/xxxxxxxxxxxxx'
  }
});

// GET request
const response = await axios.get('http://localhost:5000/api/send-sms', {
  params: {
    Sender_Name: 'TestSender',
    SMS_Message: 'Hello from Axios!',
    mobile_Number: '+1234567890',
    template_id: 'tpl_12345'
  },
  headers: {
    'x-api-key': 'U2FsdGVkX1/xxxxxxxxxxxxx'
  }
});
```

### Python Examples

```python
import requests

# POST request
response = requests.post(
    'http://localhost:5000/api/send-sms',
    headers={
        'x-api-key': 'U2FsdGVkX1/xxxxxxxxxxxxx',
        'Content-Type': 'application/json'
    },
    json={
        'Sender_Name': 'TestSender',
        'SMS_Message': 'Hello from Python!',
        'mobile_Number': '+1234567890',
        'template_id': 'tpl_12345'
    }
)

# GET request
response = requests.get(
    'http://localhost:5000/api/send-sms',
    headers={'x-api-key': 'U2FsdGVkX1/xxxxxxxxxxxxx'},
    params={
        'Sender_Name': 'TestSender',
        'SMS_Message': 'Hello from Python!',
        'mobile_Number': '+1234567890',
        'template_id': 'tpl_12345'
    }
)
```

## 🔒 Security

### Encryption Implementation

The middleware uses AES-256-CBC encryption for API keys:

- **Algorithm**: AES-256-CBC
- **Key Size**: 32 bytes (256 bits)
- **IV Size**: 16 bytes (128 bits)
- **Padding**: PKCS7

### Best Practices

1. **Key Management**:
   - Store encryption keys in environment variables
   - Rotate keys regularly
   - Never commit keys to version control

2. **Rate Limiting**:
   - Configure appropriate limits based on your use case
   - Monitor rate limit violations
   - Adjust limits for different endpoints if needed

3. **Input Validation**:
   - All parameters are validated
   - Phone numbers are format-checked
   - Required parameters are enforced

4. **HTTPS**:
   - Always use HTTPS in production
   - Configure SSL/TLS certificates
   - Enable HSTS headers

### Recommended Security Headers

```javascript
// Included via Helmet.js
app.use(helmet());

// Additional security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});
```

## 🚨 Error Handling

### Error Codes

| Status Code | Description | Example Message |
|-------------|-------------|-----------------|
| 200 | Success | Request processed successfully |
| 400 | Bad Request | Missing required parameters |
| 401 | Unauthorized | Invalid API key |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | SMS service unavailable |
| 503 | Service Unavailable | SMS API timeout |

### Error Response Format

```json
{
  "success": false,
  "error": "Descriptive error message",
  "requiredParams": ["param1", "param2"], // For validation errors
  "originalStatus": 500, // For upstream errors
  "details": "Additional error details" // For debugging
}
```

## 📊 Monitoring & Logging

### Request Logging

The middleware logs all requests with the following format:
```
[2024-01-01T12:00:00.000Z] GET /api/send-sms
[2024-01-01T12:00:01.000Z] POST /api/send-sms
```

### Conversion Logging

Detailed parameter conversion logs:
```
[2024-01-01T12:00:00.000Z] Conversion: {
  method: 'GET',
  originalQuery: { Sender_Name: 'Test', ... },
  convertedBody: { Sender_Name: 'Test', ... },
  apiKey: 'Present'
}
```

### Health Check Endpoint

Use the health check endpoint for monitoring:
```bash
curl http://localhost:5000/api/health
```

### Integration with Monitoring Tools

```javascript
// Example: Integrating with Prometheus
const client = require('prom-client');
const counter = new client.Counter({
  name: 'sms_requests_total',
  help: 'Total SMS requests'
});

app.use((req, res, next) => {
  counter.inc();
  next();
});
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run specific test suite
npm test -- --grep "SMS API"

# Run tests with coverage
npm run test:coverage
```

### Test Examples

```javascript
const request = require('supertest');
const app = require('../server');

describe('SMS API Middleware', () => {
  it('should handle POST request with valid data', async () => {
    const response = await request(app)
      .post('/api/send-sms')
      .set('x-api-key', 'valid-encrypted-key')
      .send({
        Sender_Name: 'TestSender',
        SMS_Message: 'Test Message',
        mobile_Number: '+1234567890',
        template_id: 'tpl_12345'
      });
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it('should handle GET request with query parameters', async () => {
    const response = await request(app)
      .get('/api/send-sms')
      .set('x-api-key', 'valid-encrypted-key')
      .query({
        Sender_Name: 'TestSender',
        SMS_Message: 'Test Message',
        mobile_Number: '+1234567890',
        template_id: 'tpl_12345'
      });
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it('should return 400 for missing parameters', async () => {
    const response = await request(app)
      .post('/api/send-sms')
      .set('x-api-key', 'valid-encrypted-key')
      .send({
        Sender_Name: 'TestSender'
      });
    
    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });
});
```

## 🚢 Deployment

### Docker Deployment

Create a `Dockerfile`:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

ENV NODE_ENV=production

EXPOSE 5000

CMD ["node", "server.js"]
```

Build and run:
```bash
# Build the image
docker build -t sms-middleware .

# Run the container
docker run -p 5000:5000 --env-file .env sms-middleware
```

### Docker Compose

Create `docker-compose.yml`:
```yaml
version: '3.8'

services:
  sms-middleware:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
    env_file:
      - .env
    restart: unless-stopped
```

Run with Docker Compose:
```bash
docker-compose up -d
```

### Kubernetes Deployment

Create a deployment.yaml:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: sms-middleware
spec:
  replicas: 3
  selector:
    matchLabels:
      app: sms-middleware
  template:
    metadata:
      labels:
        app: sms-middleware
    spec:
      containers:
      - name: sms-middleware
        image: sms-middleware:latest
        ports:
        - containerPort: 5000
        envFrom:
        - secretRef:
            name: sms-middleware-secrets
```

### Nginx Reverse Proxy Configuration

```nginx
server {
    listen 80;
    server_name api.example.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 🤝 Contributing

### Development Setup

1. Fork the repository
2. Clone your fork
3. Install dependencies
4. Create a feature branch
5. Make your changes
6. Run tests
7. Submit a pull request

### Commit Convention

We follow conventional commits:
```
type(scope): subject

body

footer
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style
- `refactor`: Code refactoring
- `test`: Testing
- `chore`: Maintenance

### Code Style

We use ESLint and Prettier:
```bash
# Check code style
npm run lint

# Fix code style issues
npm run lint:fix

# Format code
npm run format
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Support

- **Documentation**: [Wiki](https://github.com/ThiruXD/sms-api-middleware/wiki)
- **Issues**: [GitHub Issues](https://github.com/ThiruXD/sms-api-middleware/issues)
- **Discussions**: [GitHub Discussions](https://github.com/ThiruXD/sms-api-middleware/discussions)

## 🙏 Acknowledgments

- [Express.js](https://expressjs.com/) - Web framework
- [CryptoJS](https://cryptojs.gitbook.io/docs/) - Encryption library
- [Helmet.js](https://helmetjs.github.io/) - Security middleware
- [Express Rate Limit](https://github.com/express-rate-limit/express-rate-limit) - Rate limiting middleware

---

**Built with ❤️ for secure SMS API communication**