import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';

const sendMail = vi.fn().mockResolvedValue(undefined);
const createTransport = vi.fn(() => ({ sendMail }));

vi.mock('nodemailer', () => ({
  default: { createTransport },
}));

vi.mock('@/utils/constants', () => ({
  EMAIL_CONFIG: { fromName: 'Fairfield Airport Cars', verifiedSender: 'no-reply@fairfieldairportcar.com' },
  BUSINESS_CONTACT: { ridesEmail: 'rides@fairfieldairportcar.com', phone: '(203) 990-1815' },
}));

let POST: typeof import('@/app/api/contact/route').POST;

beforeAll(async () => {
  process.env.EMAIL_HOST = 'smtp.example.com';
  process.env.EMAIL_PORT = '587';
  process.env.EMAIL_USER = 'user';
  process.env.EMAIL_PASS = 'pass';
  ({ POST } = await import('@/app/api/contact/route'));
});

const buildRequest = (body: Record<string, unknown>) =>
  new Request('http://localhost/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }) as any;

describe('POST /api/contact', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('escapes HTML in name/message so a submission cannot inject markup into the sent emails (regression)', async () => {
    const maliciousName = '<img src=x onerror=alert(1)>';
    const maliciousMessage = '<script>alert("xss")</script>Please call me back';

    const response = await POST(
      buildRequest({
        name: maliciousName,
        email: 'attacker@example.com',
        phone: '2035551234',
        message: maliciousMessage,
      })
    );

    expect(response.status).toBe(200);
    expect(sendMail).toHaveBeenCalledTimes(2);

    for (const call of sendMail.mock.calls) {
      const [{ html }] = call;
      expect(html).not.toContain('<img src=x onerror=alert(1)>');
      expect(html).not.toContain('<script>alert("xss")</script>');
      // The escaped, harmless version should still be present so the content isn't dropped
      expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;');
      expect(html).toContain('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
    }
  });

  it('sends a normal submission through unescaped in the plain-text body', async () => {
    await POST(
      buildRequest({
        name: 'Jane Doe',
        email: 'jane@example.com',
        phone: '2035551234',
        message: 'Hello, I have a question about pricing.',
      })
    );

    const [{ text }] = sendMail.mock.calls[0];
    expect(text).toContain('Jane Doe');
    expect(text).toContain('Hello, I have a question about pricing.');
  });
});
