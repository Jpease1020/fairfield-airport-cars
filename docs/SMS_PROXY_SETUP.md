# SMS Proxy Setup Guide

This document explains how to set up the SMS proxy system that allows Gregg to receive and reply to customer text messages through the business Twilio number.

## Overview

**Flow:**
1. Customer texts the business Twilio number
2. Gregg receives an SMS with the message and a reply link
3. Gregg taps the link, opens a mobile web page, types a reply
4. Customer receives the reply from the business number (not Gregg's personal number)

## Architecture

```
Customer Phone  →  Twilio Number  →  /api/twilio/sms/inbound  →  Firestore Thread
                                                               →  Forward SMS to Gregg

Gregg (Reply UI) →  /api/twilio/sms/send  →  Twilio  →  Customer Phone
```

## Environment Variables

Add these to your `.env.local` and Vercel environment:

```bash
# Twilio Configuration (existing)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890          # Your Twilio business number
TWILIO_MESSAGING_SERVICE_SID=MGxxxxxxx   # Messaging service (preferred over phone number)

# SMS Proxy Configuration (new)
GREGG_PHONE_NUMBER=+1234567890           # Gregg's personal phone (receives forwarded messages)
SMS_REPLY_SECRET=your_secret_here        # Optional: Protects the reply endpoint from abuse
NEXT_PUBLIC_SMS_REPLY_SECRET=same_secret # Client-side (if using secret validation)

# App URL (for reply links)
NEXT_PUBLIC_APP_URL=https://fairfieldairportcars.com
APP_BASE_URL=https://fairfieldairportcars.com
```

## Twilio Console Setup

1. **Go to Phone Numbers** → Manage → Active Numbers
2. **Click your business number**
3. **Under "Messaging":**
   - Configure with: `Webhook`
   - A MESSAGE COMES IN: `https://yourdomain.com/api/twilio/sms/inbound`
   - HTTP Method: `POST`
4. **Save**

## Firestore Schema

The system creates an `smsThreads` collection with this structure:

```
smsThreads/
  {threadId}/                    # Thread ID = last 10 digits of customer phone
    customerPhone: "+12035551234"
    customerName: "John Doe"     # Optional, from booking data
    lastMessagePreview: "Hi, I need..."
    lastMessageAt: Timestamp
    messageCount: 5
    createdAt: Timestamp
    updatedAt: Timestamp

    messages/                    # Subcollection
      {messageId}/
        direction: "inbound" | "outbound"
        body: "Message text"
        timestamp: Timestamp
        twilioSid: "SMxxx..."   # Twilio message ID
```

## Testing

### 1. Test Inbound (Customer → Gregg)
1. Text your Twilio business number from any phone
2. Gregg should receive an SMS with:
   - The customer's phone number
   - The message content
   - A reply link

### 2. Test Outbound (Gregg → Customer)
1. Open the reply link on Gregg's phone
2. Type a message and tap Send
3. The customer should receive the reply from the business number

### 3. Verify Thread Storage
Check Firestore console:
- `smsThreads` collection should have a document
- `messages` subcollection should have the conversation

## Common Issues

### "Service not configured" Error
- Check that `GREGG_PHONE_NUMBER` is set
- Check that either `TWILIO_MESSAGING_SERVICE_SID` or `TWILIO_PHONE_NUMBER` is set

### Messages Not Forwarding
- Verify Twilio webhook URL is correct
- Check Twilio console for webhook errors
- Ensure webhook URL is HTTPS in production

### Reply Link Not Working
- Verify `NEXT_PUBLIC_APP_URL` is set correctly
- Check that the thread exists in Firestore

### 403 Invalid Signature Error
- Only happens in production (signature validation is skipped in dev)
- Verify `TWILIO_AUTH_TOKEN` matches your Twilio account
- Ensure the webhook URL in Twilio console exactly matches your domain

## A2P 10DLC Registration

**Important:** US carriers require A2P 10DLC registration for business texting.

1. Go to Twilio Console → Messaging → Regulatory Compliance
2. Register your brand
3. Register a campaign (type: "Low Volume Mixed" or "Customer Care")
4. Link your Twilio number to the campaign

Without registration, messages may be filtered or blocked by carriers.

## Security Notes

1. **Signature Validation**: In production, all inbound webhooks validate Twilio's signature
2. **Reply Secret**: Optional `SMS_REPLY_SECRET` prevents unauthorized use of the send endpoint
3. **Thread IDs**: Based on phone numbers, not guessable but not secret either
4. **No PII in URLs**: Thread IDs are normalized phone digits only

## Files

- `src/lib/services/sms-thread-service.ts` - Thread/message storage
- `src/app/api/twilio/sms/inbound/route.ts` - Inbound webhook
- `src/app/api/twilio/sms/send/route.ts` - Outbound send endpoint
- `src/app/api/twilio/sms/thread/[threadId]/route.ts` - Thread data API
- `src/app/reply/[threadId]/page.tsx` - Reply UI (mobile-optimized)
