# SMS Marketing Admin Page - Implementation Plan

## Overview
Build an SMS marketing page in the admin portal that allows Gregg to send promotional, re-engagement, and seasonal campaigns to past customers via Twilio.

## Feature Requirements
- View all customers with phone numbers from past bookings
- Select individual customers or all customers
- Compose SMS messages with templates
- Preview messages before sending
- Send bulk SMS campaigns via Twilio
- Track campaign history

---

## Implementation Steps

### Step 1: Database Service - Get Unique Customers
**File:** `src/lib/services/database-service.ts`

Add function to extract unique customers from bookings:
```typescript
export interface MarketingCustomer {
  id: string;
  name: string;
  phone: string;
  email: string;
  bookingCount: number;
  lastBookingDate: Date | null;
  totalSpent: number;
}

export async function getMarketingCustomers(): Promise<MarketingCustomer[]>
```

Logic:
- Fetch all bookings
- Group by phone number (deduplicate)
- Calculate: booking count, last booking date, total spent
- Filter out invalid/empty phone numbers
- Sort by last booking date (most recent first)

---

### Step 2: Twilio Service - Bulk SMS Function
**File:** `src/lib/services/twilio-service.ts`

Add bulk SMS function:
```typescript
export interface BulkSmsResult {
  total: number;
  successful: number;
  failed: number;
  results: Array<{
    phone: string;
    success: boolean;
    messageId?: string;
    error?: string;
  }>;
}

export async function sendBulkSms(
  recipients: Array<{ phone: string; name: string }>,
  messageTemplate: string
): Promise<BulkSmsResult>
```

Features:
- Replace `{{name}}` placeholder with customer name
- Track success/failure for each recipient
- Rate limit to avoid Twilio throttling (100ms delay between sends)
- Return detailed results

---

### Step 3: Campaign Storage (Optional - Phase 2)
**File:** `src/lib/services/database-service.ts`

Add campaign tracking:
```typescript
export interface SmsCampaign {
  id: string;
  name: string;
  message: string;
  recipientCount: number;
  sentCount: number;
  failedCount: number;
  status: 'draft' | 'sending' | 'completed' | 'failed';
  createdAt: Date;
  sentAt?: Date;
}
```

For MVP, we'll skip this and just send immediately.

---

### Step 4: API Route for Sending Campaigns
**File:** `src/app/api/admin/marketing/sms/route.ts`

```typescript
POST /api/admin/marketing/sms
Body: {
  recipientIds: string[],  // Customer IDs to send to
  message: string          // Message text (with {{name}} placeholder)
}

Response: {
  success: boolean,
  total: number,
  successful: number,
  failed: number,
  results: Array<{ phone, success, error? }>
}
```

---

### Step 5: Admin Page - SMS Marketing
**File:** `src/app/(admin)/admin/marketing/sms/page.tsx`

Page sections:

#### A. Header
- Title: "SMS Marketing"
- Subtitle: "Send promotional messages to your customers"

#### B. Stats Cards
- Total Customers (with phone)
- Active Customers (booked in last 90 days)
- Total Messages Sent Today
- Campaign Success Rate

#### C. Message Composer
- Textarea for message (max 160 chars for single SMS)
- Character counter
- Template buttons:
  - "Promotional" → "Hi {{name}}! Get 10% off your next ride with Fairfield Airport Cars. Book at fairfieldairportcar.com"
  - "Re-engagement" → "Hi {{name}}, we miss you! It's been a while since your last ride. Ready to book? fairfieldairportcar.com"
  - "Seasonal" → "Hi {{name}}! Holiday travel? Book your airport ride early. fairfieldairportcar.com"
- Preview with sample customer name

#### D. Customer Selection
- DataTable with columns:
  - Checkbox (select)
  - Customer Name
  - Phone Number
  - Bookings Count
  - Last Booking
  - Total Spent
- "Select All" / "Deselect All" buttons
- Filter: All / Active (90 days) / Inactive

#### E. Send Section
- Selected count display
- Estimated cost (Twilio ~$0.0079/SMS)
- "Preview & Send" button → Opens confirmation modal
- Confirmation modal shows:
  - Message preview
  - Recipient count
  - Estimated cost
  - "Send Now" / "Cancel" buttons

#### F. Results Display (after sending)
- Success count
- Failed count (with phone numbers)
- Option to retry failed

---

### Step 6: Tests
**Files:**
- `tests/unit/sms-marketing.test.ts` - Unit tests for bulk SMS logic
- `tests/integration/admin/sms-marketing.test.tsx` - Integration tests for admin page

---

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `src/lib/services/database-service.ts` | MODIFY | Add `getMarketingCustomers()` |
| `src/lib/services/twilio-service.ts` | MODIFY | Add `sendBulkSms()` |
| `src/app/api/admin/marketing/sms/route.ts` | CREATE | API endpoint for sending campaigns |
| `src/app/(admin)/admin/marketing/sms/page.tsx` | CREATE | Admin SMS marketing page |
| `tests/unit/sms-marketing.test.ts` | CREATE | Unit tests |

---

## UI Mockup (ASCII)

```
┌─────────────────────────────────────────────────────────────────┐
│  SMS Marketing                                                   │
│  Send promotional messages to your customers                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │    📱    │  │    ✅    │  │    📨    │  │    📊    │        │
│  │   127    │  │    89    │  │    0     │  │   98%    │        │
│  │Customers │  │  Active  │  │Sent Today│  │ Success  │        │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│  Compose Message                                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Hi {{name}}! Get 10% off your next ride...                  ││
│  │                                                              ││
│  └─────────────────────────────────────────────────────────────┘│
│  Characters: 67/160                                              │
│                                                                  │
│  Templates: [Promotional] [Re-engagement] [Seasonal]             │
│                                                                  │
│  Preview: "Hi John! Get 10% off your next ride..."              │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│  Select Recipients                    Filter: [All ▼]            │
│  [Select All] [Deselect All]         Selected: 15 customers     │
│                                                                  │
│  ┌────┬──────────────┬───────────────┬────────┬─────────┬──────┐│
│  │ ☑  │ Name         │ Phone         │Bookings│ Last    │ Spent││
│  ├────┼──────────────┼───────────────┼────────┼─────────┼──────┤│
│  │ ☑  │ John Smith   │ (203) 555-123 │   5    │ Jan 15  │ $750 ││
│  │ ☑  │ Jane Doe     │ (203) 555-456 │   3    │ Feb 2   │ $450 ││
│  │ ☐  │ Bob Wilson   │ (203) 555-789 │   1    │ Dec 10  │ $150 ││
│  └────┴──────────────┴───────────────┴────────┴─────────┴──────┘│
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│  Ready to Send                                                   │
│  • 15 recipients selected                                        │
│  • Estimated cost: $0.12                                         │
│                                                                  │
│  [Preview & Send]                                                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Permissions & Safety

1. **No auto-send** - Always require confirmation modal
2. **Rate limiting** - 100ms delay between SMS to avoid Twilio throttling
3. **Phone validation** - Only send to valid E.164 format numbers
4. **Character limit** - Warn if message exceeds 160 chars (multi-part SMS costs more)
5. **Admin only** - Page only accessible in admin section

---

## Future Enhancements (Phase 2)
- Campaign history tracking
- Scheduled campaigns
- A/B testing
- Opt-out management
- Analytics dashboard
- Email marketing integration

---

## Dependencies
- Twilio SDK (already installed)
- Existing design system components
- Existing database service patterns
