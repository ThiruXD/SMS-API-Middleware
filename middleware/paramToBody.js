class ParamToBodyMiddleware {
  constructor() {
    // Required parameters for SMS API
    this.requiredParams = [
      'Sender_Name',
      'SMS_Message',
      'mobile_Number',
      'template_id'
    ];
  }

  // Convert query parameters or body to POST body
  convertToBodyMiddleware() {
    return (req, res, next) => {
      try {
        let bodyData = {};

        // Check if it's a GET request with query parameters
        if (req.method === 'GET' && req.query) {
          bodyData = this.extractParams(req.query);
        } 
        // Check if it's a POST request with body
        else if (req.method === 'POST' && req.body) {
          bodyData = this.extractParams(req.body);
        } 
        // Check if it's a GET with body (unusual but we support it)
        else if (req.method === 'GET' && req.body) {
          bodyData = this.extractParams(req.body);
        }

        // Validate required parameters
        const validationResult = this.validateParams(bodyData);
        if (!validationResult.isValid) {
          return res.status(400).json({
            success: false,
            error: validationResult.error,
            requiredParams: this.requiredParams
          });
        }

        // Store converted body in request
        req.convertedBody = bodyData;
        req.isConverted = true;
        
        // Set content type to JSON
        req.headers['content-type'] = 'application/json';
        
        next();
      } catch (error) {
        console.error('Parameter conversion error:', error);
        return res.status(400).json({
          success: false,
          error: 'Failed to convert parameters to body'
        });
      }
    };
  }

  // Extract parameters from source
  extractParams(source) {
    const extracted = {};
    
    // Try to match required parameters (case-insensitive)
    this.requiredParams.forEach(param => {
      // Check for exact match
      if (source[param] !== undefined) {
        extracted[param] = source[param];
        return;
      }
      
      // Check for case-insensitive match
      const lowerParam = param.toLowerCase();
      for (const [key, value] of Object.entries(source)) {
        if (key.toLowerCase() === lowerParam) {
          extracted[param] = value;
          return;
        }
      }
      
      // Check for common variations
      const variations = {
        'Sender_Name': ['sender_name', 'sender', 'from'],
        'SMS_Message': ['sms_message', 'message', 'text', 'body'],
        'mobile_Number': ['mobile_number', 'mobilenumber', 'phone', 'number', 'to'],
        'template_id': ['template_id', 'templateid', 'template', 'tid']
      };
      
      if (variations[param]) {
        for (const variant of variations[param]) {
          if (source[variant] !== undefined) {
            extracted[param] = source[variant];
            break;
          }
        }
      }
    });
    
    return extracted;
  }

  // Validate required parameters
  validateParams(params) {
    const missingParams = [];
    
    this.requiredParams.forEach(param => {
      if (!params[param] || params[param].toString().trim() === '') {
        missingParams.push(param);
      }
    });
    
    if (missingParams.length > 0) {
      return {
        isValid: false,
        error: `Missing required parameters: ${missingParams.join(', ')}`
      };
    }
    
    // Additional validation
    if (params.mobile_Number && !this.validatePhoneNumber(params.mobile_Number)) {
      return {
        isValid: false,
        error: 'Invalid mobile number format'
      };
    }
    
    return { isValid: true };
  }

  // Validate phone number (basic validation)
  validatePhoneNumber(phone) {
    // Remove any spaces, dashes, or special characters
    const cleaned = phone.toString().replace(/[\s\-\(\)]/g, '');
    // Check if it's a valid phone number (adjust regex as needed)
    return /^\+?[0-9]{10,15}$/.test(cleaned);
  }

  // Log conversion details for debugging
  logConversion(req) {
    console.log(`[${new Date().toISOString()}] Conversion:`, {
      method: req.method,
      originalQuery: req.query,
      originalBody: req.body,
      convertedBody: req.convertedBody,
      apiKey: req.decryptedApiKey ? 'Present' : 'Missing'
    });
  }
}

module.exports = new ParamToBodyMiddleware();