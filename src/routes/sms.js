import config from '../config/config.js';

// Handle SMS request
export async function handleSMSRequest(request, env) {
  try {
    const smsData = request.convertedBody;
    const apiKey = request.decryptedApiKey;
    const smsApiUrl = env.SMS_API_URL || config.SMS_API_URL;

    // Prepare request to actual SMS API
    const fetchOptions = {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
        'User-Agent': request.headers.get('user-agent') || 'SMS-Middleware-Cloudflare',
        'X-Forwarded-For': request.headers.get('cf-connecting-ip') || 
                          request.headers.get('x-forwarded-for') || 
                          'unknown'
      },
      body: JSON.stringify(smsData)
    };

    // Make the actual request to SMS API
    const response = await fetch(smsApiUrl, fetchOptions);
    const responseData = await response.json();

    // Return the response from SMS API
    return new Response(
      JSON.stringify({
        success: true,
        data: responseData,
        convertedFrom: request.method,
        timestamp: new Date().toISOString(),
        responseStatus: response.status
      }),
      {
        status: response.status,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error) {
    console.error('SMS API Error:', error);
    
    // Handle different types of errors
    if (error.message.includes('timeout')) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'SMS service timeout',
          details: 'The SMS API took too long to respond'
        }),
        {
          status: 504,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'SMS service unavailable',
        details: error.message
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}