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

  // Convert query parameters or body to POST body (Cloudflare version)
  async convertToBody(request) {
    try {
      let bodyData = {};
      const url = new URL(request.url);
      
      // Check if it's a GET request with query parameters
      if (request.method === 'GET') {
        const params = Object.fromEntries(url.searchParams);
        bodyData = this.extractParams(params);
      } 
      // Check if it's a POST request with body
      else if (request.method === 'POST') {
        try {
          const body = await request.json();
          bodyData = this.extractParams(body);
        } catch (e) {
          // If body parsing fails, try query params as fallback
          const params = Object.fromEntries(url.searchParams);
          bodyData = this.extractParams(params);
        }
      }

      // Validate required parameters
      const validationResult = this.validateParams(bodyData);
      if (!validationResult.isValid) {
        return {
          success: false,
          response: new Response(
            JSON.stringify({
              success: false,
              error: validationResult.error,
              requiredParams: this.requiredParams
            }),
            {
              status: 400,
              headers: { 'Content-Type': 'application/json' }
            }
          )
        };
      }

      // Log conversion for debugging
      this.logConversion(request, bodyData);

      return {
        success: true,
        body: bodyData
      };

    } catch (error) {
      console.error('Parameter conversion error:', error);
      return {
        success: false,
        response: new Response(
          JSON.stringify({
            success: false,
            error: 'Failed to convert parameters to body'
          }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          }
        )
      };
    }
  }

  // Extract parameters from source
  extractParams(source) {
    const extracted = {};
    
    // Try to match required parameters (case-insensitive)
    this.requiredParams.forEach(param => {
      // Check for exact match
      if (source[param] !== undefined && source[param] !== null && source[param] !== '') {
        extracted[param] = source[param];
        return;
      }
      
      // Check for case-insensitive match
      const lowerParam = param.toLowerCase();
      for (const [key, value] of Object.entries(source)) {
        if (key.toLowerCase() === lowerParam && value !== undefined && value !== null && value !== '') {
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
          if (source[variant] !== undefined && source[variant] !== null && source[variant] !== '') {
            extracted[param] = source[variant];
            break;
          }
        }
      }
    });

    return this.normalizeParams(extracted);
  }

  normalizeParams(params) {
    const normalized = { ...params };

    // Trim all string values to avoid accidental whitespace from query parsing.
    Object.keys(normalized).forEach(key => {
      const value = normalized[key];
      if (typeof value === 'string') {
        normalized[key] = value.trim();
      }
    });

    // If '+' was not URL-encoded in query string, it may arrive as leading space.
    // Convert that specific form back to E.164-like format.
    const mobile = params.mobile_Number;
    if (typeof mobile === 'string' && /^\s+[0-9]{10,15}$/.test(mobile)) {
      normalized.mobile_Number = `+${mobile.trim()}`;
    }

    return normalized;
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
  logConversion(request, bodyData) {
    console.log(`[${new Date().toISOString()}] Conversion:`, {
      method: request.method,
      url: request.url,
      convertedBody: bodyData,
      apiKey: request.decryptedApiKey ? 'Present' : 'Missing'
    });
  }
}

export default new ParamToBodyMiddleware();