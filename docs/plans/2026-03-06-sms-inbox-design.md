# SMS Business Inbox — Design Doc

Date: 2026-03-06
Status: Approved

## Problem

The current system forwards customer SMS to Gregg's personal phone one-way only. When Gregg replies, there is no routing context — the system cannot determine which customer should receive the reply. Gregg also cannot distinguish business texts from personal ones.

## Solution

Build a threaded SMS inbox in the existing admin dashboard. Twilio remains pure transport. The backend owns thread state. Gregg replies from a mobile-friendly admin UI, giving the backend the context it needs to route replies to the correct customer.

## Scope

### Must-Have
- `smsThreads` Firestore collection (one thread per customer phone)
- `smsMessages` updated with `threadId` + `senderType` fields
- `/admin/messages` upgraded from flat log to threaded inbox
- `/admin/messages/[threadId]` — thread detail with reply box
- `POST /api/admin/messages/send` — reply endpoint
- Inbound webhook updated to thread messages
- Notification SMS to Gregg with deep link to specific thread
- Firebase Auth LOCAL persistence (stay logged in on phone)

### Nice-to-Have (post-launch)
- Canned replies
- Unread badges
- Read receipts / delivery status

### Explicitly Out of Scope
- Twilio Conversations
- AI auto-responder
- Separate mobile app
- Multiple drivers

---

## Data Model

### `smsThreads` (new collection)

```typescript
interface SmsThread {
  id: string;                    // auto-generated
  customerPhone: string;         // E.164, e.g. "+12035551234" — used for matching
  customerName?: string | null;  // populated from booking data if available
  status: 'open' | 'closed';
  lastMessageAt: Timestamp;
  lastMessagePreview: string;    // first 80 chars of last message
  unreadCount: number;           // incremented on inbound, reset on Gregg opening thread
  lastInboundAt?: Timestamp;
  lastOutboundAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**Thread matching:** one thread per customer phone number. Find by `customerPhone` on inbound. Create if none exists.

### `smsMessages` (existing collection, two new fields)

```typescript
// Add to existing schema:
threadId: string;                          // references smsThreads doc
senderType: 'customer' | 'admin' | 'system'; // replaces ambiguity of direction alone
```

Old messages without `threadId` remain as historical flat log. No migration needed.

---

## API Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/twilio/incoming-sms` | **Update** — thread routing + notification |
| GET | `/api/admin/messages/threads` | **New** — inbox thread list |
| GET | `/api/admin/messages/threads/[threadId]` | **New** — thread message history |
| POST | `/api/admin/messages/send` | **New** — Gregg's reply |
| POST | `/api/admin/messages/threads/[threadId]/read` | **New** — mark thread read |
| GET | `/api/admin/sms-messages` | **Keep** — existing flat log for debugging |

### Inbound webhook updated flow
1. Validate Twilio signature (existing)
2. Find `smsThread` by `customerPhone` or create one
3. Save message to `smsMessages` with `threadId`, `senderType: 'customer'`
4. Update thread metadata (`lastMessageAt`, `lastMessagePreview`, `unreadCount += 1`)
5. Send notification SMS to Gregg: `"New message from [phone]: '[preview]' Reply: [domain]/admin/messages/[threadId]"`
6. Return TwiML `<Response></Response>`

### Reply endpoint
```
POST /api/admin/messages/send
Body: { threadId: string, body: string }

1. Load thread → get customerPhone
2. sendSms({ to: customerPhone, body }) via existing Twilio service
3. Save to smsMessages with threadId, senderType: 'admin', direction: 'outbound'
4. Update thread lastMessageAt, lastOutboundAt
5. Return { success: true, messageSid }
```

---

## UI

### Screen 1: `/admin/messages` — Inbox

Upgraded from flat log to thread list:
- Sorted by `lastMessageAt` DESC
- Each row: phone number (+ name if known), message preview, timestamp, unread count badge
- Unread threads visually distinct (bold or colored)
- Tap row → navigate to thread detail
- Mobile-first: large tap targets, minimal chrome

### Screen 2: `/admin/messages/[threadId]` — Thread Detail

- Header: customer phone / name, Back button
- Message bubbles: customer left (gray), Gregg/admin right (blue)
- Timestamps on each message
- Text input pinned to bottom of screen
- Send button
- 4 canned reply chips above input:
  - "Yes, I'm available"
  - "What time is your flight?"
  - "I'm on my way"
  - "Please confirm your address"
- Marks thread as read on mount (`/read` endpoint)

---

## Auth

### Firebase Auth Persistence

Set `browserLocalPersistence` on the admin login page. This keeps Gregg's session in `localStorage` — survives browser restarts, tab closes, phone sleeps. Auto-refreshes silently.

```typescript
import { setPersistence, browserLocalPersistence } from 'firebase/auth';
await setPersistence(auth, browserLocalPersistence);
```

One-time login on his phone. Link from notification SMS lands directly on the thread.

---

## Notification SMS

Sent to `GREGG_SMS_FORWARD_NUMBER` (existing env var) on every inbound customer message:

```
New message from (203) 555-1234: "Hey, can you pick me up at..."
Reply here: https://fairfieldairportcar.com/admin/messages/abc123
```

Gregg taps the link → opens thread detail → types reply → sends. Done.

---

## What Stays the Same

- All outbound booking confirmations still use `sendSms()` directly — untouched
- Flat log at `/api/admin/sms-messages` stays for debugging
- All existing Twilio env vars unchanged
- Twilio webhook URL unchanged (`/api/twilio/incoming-sms`)

---

## Risks

| Risk | Mitigation |
|------|-----------|
| Gregg ignores inbox, texts back natively | Notification SMS makes inbox the obvious path; keep UI extremely simple |
| Safari/iPhone clears localStorage | Test on Gregg's actual device before launch; magic-link fallback if needed |
| Two customers text simultaneously | Each gets their own thread by phone number — no collision |
| Old flat-log habits | Keep flat log as debug view only; inbox is primary nav item |
