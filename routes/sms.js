const express = require('express');
const router = express.Router();
const axios = require('axios');
const config = require('../config/config');
const encryptionMiddleware = require('../middleware/encryption');
const rateLimiter = require('../middleware/rateLimiter');
const paramToBodyMiddleware = require('../middleware/paramToBody');

// Apply global middleware
router.use(encryptionMiddleware.decryptApiKeyMiddleware());
router.use(rateLimiter.getLimiter());

// Route for sending SMS (supports both GET and POST)
router.all('/send-sms', 
  paramToBodyMiddleware.convertToBodyMiddleware(),
  async (req, res) => {
    try {
      // Log conversion for debugging
      paramToBodyMiddleware.logConversion(req);

      // Get the converted body
      const smsData = req.convertedBody;
      
      // Get the decrypted API key
      const apiKey = req.decryptedApiKey;

      // Prepare request to actual SMS API
      const smsApiUrl = config.SMS_API_URL;
      
      // Make the actual POST request to SMS API
      const response = await axios.post(smsApiUrl, smsData, {
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json',
          // Forward any other relevant headers
          ...(req.headers['user-agent'] && { 'User-Agent': req.headers['user-agent'] }),
          ...(req.headers['x-forwarded-for'] && { 'X-Forwarded-For': req.headers['x-forwarded-for'] })
        },
        timeout: 30000 // 30 seconds timeout
      });

      // Return the response from SMS API
      res.status(response.status).json({
        success: true,
        data: response.data,
        convertedFrom: req.method,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('SMS API Error:', error);
      
      // Handle different types of errors
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        return res.status(error.response.status).json({
          success: false,
          error: error.response.data || 'SMS API error',
          originalStatus: error.response.status
        });
      } else if (error.request) {
        // The request was made but no response was received
        return res.status(503).json({
          success: false,
          error: 'SMS service unavailable',
          details: 'No response received from SMS API'
        });
      } else {
        // Something happened in setting up the request that triggered an Error
        return res.status(500).json({
          success: false,
          error: 'Internal server error',
          details: error.message
        });
      }
    }
  }
);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'SMS API Middleware'
  });
});

// Generate encrypted API key for testing
router.post('/generate-key', (req, res) => {
  try {
    const { apiKey } = req.body;
    if (!apiKey) {
      return res.status(400).json({
        success: false,
        error: 'API key is required'
      });
    }
    
    const encryptedKey = encryptionMiddleware.generateEncryptedKey(apiKey);
    res.json({
      success: true,
      encryptedKey: encryptedKey,
      originalKey: apiKey
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to generate encrypted key'
    });
  }
});

module.exports = router;