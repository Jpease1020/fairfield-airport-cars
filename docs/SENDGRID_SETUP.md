# SendGrid Email Setup Guide

## Quick Setup for Production

### Step 1: Get Your SendGrid API Key

1. Go to [SendGrid Dashboard](https://app.sendgrid.com/settings/api_keys)
2. Click **"Create API Key"**
3. Name it: `Production Email Service`
4. Permissions: **"Full Access"** or **"Mail Send"**
5. **Copy the API key immediately** (you won't see it again!)

### Step 2: Set Vercel Environment Variables

Go to your Vercel project → Settings → Environment Variables and add:

```
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=SG.your_actual_api_key_here
```

**Important Notes:**
- `EMAIL_USER` must be exactly `apikey` (lowercase, no quotes)
- `EMAIL_PASS` is your SendGrid API key (starts with `SG.`)
- `EMAIL_PORT` should be `587` (TLS) or `465` (SSL)

### Step 3: Verify Domain (Optional but Recommended)

1. Go to [SendGrid Sender Authentication](https://app.sendgrid.com/settings/sender_auth)
2. Click **"Authenticate Your Domain"**
3. Follow the DNS setup instructions
4. This improves deliverability and prevents emails from going to spam

### Step 4: Test the Configuration

After setting environment variables, test with:

```bash
# Check configuration
curl https://fairfield-airport-cars.vercel.app/api/email/verify-config

# Test sending an email
curl -X POST https://fairfield-airport-cars.vercel.app/api/email/test-booking-verification \
  -H "Content-Type: application/json" \
  -d '{"to": "your-email@example.com"}'
```

### Step 5: Redeploy

After updating environment variables:
1. Go to Vercel Dashboard → Deployments
2. Click "Redeploy" on the latest deployment
3. Or push a new commit to trigger auto-deploy

## Troubleshooting

### "Invalid login" Error

- **Check `EMAIL_USER`**: Must be exactly `apikey` (lowercase)
- **Check `EMAIL_PASS`**: Must be your full SendGrid API key (starts with `SG.`)
- **Verify API Key**: Make sure the key has "Mail Send" permissions
- **Check SendGrid Dashboard**: Look for any account restrictions or warnings

### Emails Not Arriving

- **Check Spam Folder**: SendGrid emails sometimes go to spam initially
- **Check SendGrid Activity**: Go to [Email Activity](https://app.sendgrid.com/email_activity) to see delivery status
- **Verify Domain**: If you haven't authenticated your domain, emails may be blocked
- **Check Rate Limits**: Free tier has limits (100 emails/day)

### Connection Timeout

- **Check `EMAIL_PORT`**: Should be `587` for TLS or `465` for SSL
- **Check `EMAIL_HOST`**: Must be exactly `smtp.sendgrid.net`
- **Firewall**: Ensure Vercel can reach SendGrid's SMTP servers

## SendGrid Free Tier Limits

- **100 emails/day** (free tier)
- **Unlimited** (paid plans start at $19.95/month)

## Monitoring

- **Email Activity**: https://app.sendgrid.com/email_activity
- **Email Logs**: https://app.sendgrid.com/email_logs
- **Stats**: https://app.sendgrid.com/stats

## Best Practices

1. **Authenticate Your Domain**: Improves deliverability significantly
2. **Monitor Bounce Rates**: Keep bounce rate below 5%
3. **Use Templates**: SendGrid templates improve deliverability
4. **Warm Up Your Domain**: Start with low volume and gradually increase
5. **Set Up Webhooks**: Monitor delivery, bounces, and spam reports

