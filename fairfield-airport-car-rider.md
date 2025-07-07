# Fairfield Airport Car Service – Rider App Context

## 🛠 Overview
This is a **mobile-first web app** for a premium private driving service in Fairfield County, CT. It replaces Uber/Lyft for airport rides so Gregg (the driver) can keep more of his earnings while giving customers a **dependable, luxury experience.**

Gregg is the **only driver** for now.

The MVP goal:  
✅ Let riders book and pay easily.  
✅ Provide a premium, stress-free ride experience.  
✅ Send SMS/email confirmations and updates.  

---

## 🌟 Rider Features (MVP)

### 1️⃣ Booking Flow
- **Book a ride**
  - Pickup location (Google Places API Autocomplete)
  - Dropoff location
  - Pickup date & time
  - Contact details (name, phone, email)
- **Edit or cancel booking**
- Confirmation page after booking

---

### 2️⃣ Ride Status
- SMS updates:
  - Booking confirmed
  - Ride on the way
  - Driver arrived
- **Optional status page**: show ride progress (e.g., “On The Way” → “Arrived”).

---

### 3️⃣ Payments
- Pay securely online (Stripe Checkout)
- Tip during checkout (preset % + custom)
- Option to send post-ride thank you page with “Add Tip” button

---

### 4️⃣ Help Section
- FAQ page (common airport questions)
- Contact Gregg (click-to-call or click-to-text)

---

### 5️⃣ Feedback & Reviews
- Simple feedback form (1–5 stars + text)
- Follow-up SMS encouraging Google reviews
- Future: Voice feedback (Twilio transcribe)

---

## 🗺️ Pages
| Path                | Purpose                                     |
|---------------------|----------------------------------------------|
| `/`                 | Homepage                                    |
| `/book`             | Start booking flow                          |
| `/booking/:id`      | View, edit, or cancel booking                |
| `/booking/:id/edit` | Edit an existing booking                     |
| `/status/:id`       | See ride status (confirmed/on the way/etc.) |
| `/feedback/:id`     | Leave review after ride                     |
| `/help`             | FAQ + contact options                       |
| `/cancel`           | Page shown after a cancelled payment        |
| `/success`          | Page shown after a successful payment       |
| `/admin/login`      | Admin login page                            |
| `/admin/bookings`   | Admin dashboard to view all bookings        |

---

## ⚙️ Tech Stack
- **Frontend:** Next.js (mobile-first, React components)
- **Backend:** Firebase Firestore
- **Payments:** Stripe
- **SMS:** Twilio
- **Maps:** Google Places API
- **Hosting:** Firebase Hosting

---

## 📝 MVP Guidelines
- Keep it **fast, mobile-friendly, and minimal.**
- No account login required for riders.
- All rider actions should feel seamless, premium, and modern.