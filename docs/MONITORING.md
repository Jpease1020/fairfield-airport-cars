# Production Monitoring & Alerting

## Health Check Endpoints

### Basic Health Check
**Endpoint:** `GET /api/health`

Lightweight check for uptime monitoring. Returns 200 if healthy, 503 if unhealthy.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "environment": "production",
  "uptime": 3600,
  "responseTime": 45,
  "services": {
    "database": "operational",
    "payments": "configured",
    "maps": "configured",
    "sms": "configured",
    "calendar": "configured"
  }
}
```

### Comprehensive Booking Flow Health Check
**Endpoint:** `GET /api/health/booking-flow`

Deep check of all services required for booking functionality. Tests:
- Firebase Admin SDK connection
- Environment variables
- Booking service functions
- Payment service
- Email service
- SMS service
- Google Calendar service
- Database collections

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "checks": {
    "firebase": { "status": "pass", "message": "...", "duration": 12 },
    "environment": { "status": "pass", "message": "..." },
    "bookingService": { "status": "pass", "message": "...", "duration": 5 },
    ...
  },
  "summary": {
    "total": 8,
    "passed": 8,
    "warnings": 0,
    "failed": 0
  },
  "totalDuration": 150
}
```

## Monitoring Setup

### 1. Uptime Monitoring (Recommended: UptimeRobot, Pingdom, or Better Uptime)

**Basic Health Check:**
- URL: `https://your-domain.com/api/health`
- Interval: 1-5 minutes
- Alert on: HTTP status != 200
- Expected response time: < 500ms

**Booking Flow Health Check:**
- URL: `https://your-domain.com/api/health/booking-flow`
- Interval: 5-15 minutes (more expensive)
- Alert on: `status != "healthy"` OR `failed > 0`
- Expected response time: < 2 seconds

### 2. Vercel Monitoring (Built-in)

Vercel provides:
- Function execution logs
- Error tracking
- Performance metrics
- Real-time logs

**Access:** Vercel Dashboard → Your Project → Logs

**Set up alerts:**
1. Go to Project Settings → Notifications
2. Enable email/Slack alerts for:
   - Function errors
   - Build failures
   - Deployment failures

### 3. Error Tracking (Recommended: Sentry)

**Setup:**
1. Create account at sentry.io
2. Add Sentry to your project:
   ```bash
   npm install @sentry/nextjs
   ```
3. Initialize in `sentry.client.config.ts` and `sentry.server.config.ts`
4. Set `SENTRY_DSN` environment variable

**Benefits:**
- Real-time error notifications
- Stack traces
- User context
- Performance monitoring

### 4. Custom Alerts via Webhook

Create a webhook endpoint that receives health check failures:

**Example Slack Webhook:**
```typescript
// src/app/api/webhooks/health-alert/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const healthData = await request.json();
  
  if (healthData.status === 'unhealthy' || healthData.summary?.failed > 0) {
    // Send to Slack, email, SMS, etc.
    await fetch(process.env.SLACK_WEBHOOK_URL!, {
      method: 'POST',
      body: JSON.stringify({
        text: `🚨 Health Check Failed: ${healthData.status}`,
        blocks: [/* formatted message */]
      })
    });
  }
  
  return NextResponse.json({ received: true });
}
```

## Monitoring Checklist

### Critical Alerts (Immediate Notification)
- [ ] `/api/health` returns 503
- [ ] `/api/health/booking-flow` has `failed > 0`
- [ ] Firebase connection fails
- [ ] Payment processing errors (check Vercel logs)
- [ ] Booking creation failures (check Vercel logs)

### Warning Alerts (Monitor, but not critical)
- [ ] `/api/health/booking-flow` has `warnings > 2`
- [ ] Response time > 1 second
- [ ] Missing optional environment variables (calendar, SMS)

### Daily Checks
- [ ] Review error logs in Vercel
- [ ] Check booking success rate
- [ ] Verify email/SMS delivery rates
- [ ] Review payment processing success rate

## Testing Production Booking Flow

### Manual Test
1. Visit production site
2. Complete a booking form
3. Verify:
   - Quote calculation works
   - Payment processing works
   - Booking confirmation email sent
   - Booking appears in admin dashboard

### Automated Smoke Test
Run the production smoke test:
```bash
SMOKE_TEST_MODE=true npm run test:e2e -- tests/e2e/production-smoke.test.ts
```

This test:
- Creates a test booking (marked with `_smokeTest: true`)
- Processes payment (mocked)
- Creates calendar event (mocked)
- Logs in as user
- Cancels booking
- Verifies calendar cleanup
- Cleans up test data

### Health Check Monitoring Script

Create a cron job or scheduled function to check health:

```bash
#!/bin/bash
# check-health.sh

HEALTH_URL="https://your-domain.com/api/health"
BOOKING_FLOW_URL="https://your-domain.com/api/health/booking-flow"

# Basic health check
BASIC_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$HEALTH_URL")
if [ "$BASIC_STATUS" != "200" ]; then
  echo "ALERT: Basic health check failed (HTTP $BASIC_STATUS)"
  # Send alert (email, SMS, Slack, etc.)
fi

# Booking flow health check (every 15 minutes)
BOOKING_STATUS=$(curl -s "$BOOKING_FLOW_URL" | jq -r '.status')
if [ "$BOOKING_STATUS" != "healthy" ]; then
  echo "ALERT: Booking flow health check failed (Status: $BOOKING_STATUS)"
  # Send alert
fi
```

## Recommended Monitoring Services

### Free Tier Options
1. **UptimeRobot** - 50 monitors free, 5-minute intervals
2. **Better Uptime** - Open source, self-hosted
3. **Vercel Analytics** - Built-in, free tier available

### Paid Options
1. **Pingdom** - Advanced monitoring, $10/month
2. **Datadog** - Full observability, $15/month
3. **New Relic** - APM + monitoring, $25/month

## Alert Channels

### Email
- Set up in Vercel project settings
- Configure in monitoring service

### SMS (via Twilio)
- Use your existing Twilio account
- Send alerts to your phone number

### Slack
- Create Slack webhook
- Send alerts to dedicated channel

### PagerDuty (for critical alerts)
- Escalation policies
- On-call rotation
- Mobile app notifications

## Response Time Targets

- `/api/health`: < 500ms
- `/api/health/booking-flow`: < 2 seconds
- `/api/booking/quote`: < 1 second
- `/api/booking/submit`: < 2 seconds
- `/api/payment/process-payment`: < 3 seconds

## Next Steps

1. **Set up UptimeRobot** monitoring for `/api/health`
2. **Configure Vercel** email alerts for function errors
3. **Add Sentry** for error tracking (optional but recommended)
4. **Create Slack webhook** for custom alerts (optional)
5. **Schedule daily health check** review
6. **Document runbook** for common issues

