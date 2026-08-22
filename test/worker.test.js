import { describe, it, expect, beforeAll } from 'vitest';
import { SELF } from 'cloudflare:test';

describe('SMS API Middleware Worker', () => {
  beforeAll(async () => {
    // Setup test environment
  });

  it('should handle health check', async () => {
    const response = await SELF.fetch('http://localhost/api/health');
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.status).toBe('healthy');
  });

  it('should reject requests without API key', async () => {
    const response = await SELF.fetch('http://localhost/api/send-sms?Sender_Name=Test&SMS_Message=Hello&mobile_Number=123&template_id=123');
    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error).toBe('API key is required');
  });

  it('should handle GET request with valid parameters', async () => {
    // First generate an encrypted key
    const keyResponse = await SELF.fetch('http://localhost/api/generate-key', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey: 'test-api-key' })
    });
    const keyData = await keyResponse.json();
    const encryptedKey = keyData.encryptedKey;

    const response = await SELF.fetch(
      `http://localhost/api/send-sms?Sender_Name=TestSender&SMS_Message=Hello%20World&mobile_Number=%2B1234567890&template_id=tpl_12345`,
      {
        headers: { 'x-api-key': encryptedKey }
      }
    );
    expect(response.status).toBe(200);
  });
});