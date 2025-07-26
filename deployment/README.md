# 🚀 Fairfield Airport Cars - Production Deployment Guide

## 📋 **Quick Start Checklist**

### **✅ Pre-Deployment Requirements**
- [ ] Domain name registered (e.g., `fairfieldairportcars.com`)
- [ ] SSL certificate ready (automatic with Vercel/Netlify)
- [ ] Square Payment Account (Production credentials)
- [ ] Google Maps API key configured
- [ ] Email service configured (optional)
- [ ] SMS service configured (optional)

---

## 🎯 **Recommended Deployment Options**

### **Option 1: Vercel (Recommended - Easiest)**
```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Deploy from project root
vercel

# 3. Follow prompts to configure domain
# 4. Set environment variables in Vercel dashboard
```

### **Option 2: Netlify (Alternative)**
```bash
# 1. Build the project
npm run build

# 2. Deploy 'out' folder to Netlify
# 3. Configure environment variables in Netlify dashboard
```

### **Option 3: Traditional VPS/Server**
```bash
# 1. Set up Node.js server (18.x or higher)
# 2. Install PM2 for process management
npm install -g pm2

# 3. Clone repository and install dependencies
git clone <your-repo>
cd fairfield-airport-cars
npm install

# 4. Build the application
npm run build

# 5. Start with PM2
pm2 start npm --name "fairfield-cars" -- start
```

---

## 🔧 **Environment Variables Configuration**

### **Required for Production:**
```bash
# SQUARE PAYMENT (CRITICAL)
SQUARE_ACCESS_TOKEN=<production_access_token>
SQUARE_LOCATION_ID=<your_location_id>
SQUARE_WEBHOOK_SIGNATURE_KEY=<webhook_signature>

# GOOGLE MAPS (CRITICAL)
NEXT_PUBLIC_GOOGLE_API_KEY=<your_google_api_key>

# APPLICATION (CRITICAL)
NEXT_PUBLIC_BASE_URL=https://your-domain.com
NODE_ENV=production
```

### **Optional but Recommended:**
```bash
# TWILIO SMS
TWILIO_ACCOUNT_SID=<your_twilio_sid>
TWILIO_AUTH_TOKEN=<your_twilio_token>
TWILIO_PHONE_NUMBER=<your_twilio_number>

# FIREBASE (for advanced features)
NEXT_PUBLIC_FIREBASE_API_KEY=<firebase_key>
NEXT_PUBLIC_FIREBASE_PROJECT_ID=<firebase_project>
# ... other Firebase variables
```

---

## 🏗️ **Step-by-Step Production Setup**

### **Step 1: Prepare Domain & Hosting**
1. **Purchase domain** (e.g., GoDaddy, Namecheap)
2. **Choose hosting platform** (Vercel recommended)
3. **Point domain to hosting** (DNS configuration)

### **Step 2: Configure Square Payments**
1. **Switch to Square Production**:
   - Go to Square Developer Dashboard
   - Create Production Application
   - Get Production Access Token & Location ID
   - Set up Production Webhook endpoint

2. **Test Square Integration**:
   ```bash
   # Test payment creation
   curl -X POST https://your-domain.com/api/payment/create-checkout-session \
     -H "Content-Type: application/json" \
     -d '{"bookingId":"test","amount":5000,"currency":"USD","description":"Test"}'
   ```

### **Step 3: Set Up Monitoring & Error Tracking**
1. **Add Error Tracking** (Sentry recommended):
   ```bash
   npm install @sentry/nextjs
   ```

2. **Set up Uptime Monitoring** (UptimeRobot, Pingdom)

3. **Configure Performance Monitoring** (Vercel Analytics, Google Analytics)

### **Step 4: Configure Email & SMS (Optional)**
1. **Email Service** (SendGrid, Mailgun):
   - Set up SMTP credentials
   - Configure confirmation emails

2. **SMS Service** (Twilio):
   - Verify phone number
   - Test SMS delivery

### **Step 5: Security Hardening**
1. **Rate Limiting**: Already configured in `next.config.js`
2. **HTTPS**: Automatic with Vercel/Netlify
3. **Environment Security**: Never commit `.env` files
4. **API Security**: Validate all inputs

---

## 🧪 **Testing Production Deployment**

### **Critical Test Scenarios:**
```bash
# 1. Complete booking flow
# Visit: https://your-domain.com/book
# - Fill out booking form
# - Calculate fare
# - Submit booking
# - Complete payment
# - Verify success page

# 2. Admin dashboard access
# Visit: https://your-domain.com/admin
# - Test authentication
# - Check booking management
# - Verify CMS functionality

# 3. Mobile responsiveness
# Test on actual mobile devices
# Verify touch targets and forms
```

### **Performance Testing:**
```bash
# Test Core Web Vitals
npx lighthouse https://your-domain.com --view

# Test mobile performance
npx lighthouse https://your-domain.com --view --preset=mobile
```

---

## 📊 **Launch Day Checklist**

### **Pre-Launch (T-24 hours):**
- [ ] All environment variables configured
- [ ] Payment processing tested with real (small) amounts
- [ ] Domain pointing correctly
- [ ] SSL certificate active
- [ ] Contact forms working
- [ ] Mobile experience tested

### **Launch Day:**
- [ ] Monitor error rates
- [ ] Test booking flow multiple times
- [ ] Check Google Analytics/tracking
- [ ] Monitor payment processing
- [ ] Have customer support ready

### **Post-Launch (T+24 hours):**
- [ ] Review error logs
- [ ] Check conversion rates
- [ ] Monitor Core Web Vitals
- [ ] Gather initial user feedback
- [ ] Plan first optimization iteration

---

## 🆘 **Common Issues & Solutions**

### **Issue: Environment variables not loading**
```bash
# Solution: Restart deployment after setting variables
vercel --prod  # Force redeploy
```

### **Issue: Square payment failing**
```bash
# Check: Are you using Production vs Sandbox?
# Solution: Verify SQUARE_ACCESS_TOKEN environment
```

### **Issue: Google Maps not loading**
```bash
# Check: API key has Places API enabled
# Solution: Enable in Google Cloud Console
```

### **Issue: Build failing on deployment**
```bash
# Check: All TypeScript errors resolved
# Solution: Fix linting errors locally first
npm run build  # Test locally
```

---

## 🎯 **Success Metrics to Monitor**

### **Technical Metrics:**
- **Uptime**: >99.9%
- **Page Load Speed**: <3 seconds
- **Core Web Vitals**: All green
- **Error Rate**: <0.1%

### **Business Metrics:**
- **Booking Conversion Rate**: Track form completions
- **Payment Success Rate**: Track completed payments
- **Customer Support Tickets**: Minimize through good UX
- **Mobile vs Desktop Usage**: Optimize for primary platform

---

## 🚀 **Next Steps After Launch**

1. **Monitor for 48 hours** intensively
2. **Gather user feedback** and iterate
3. **Implement advanced features** (Phase 2)
4. **Scale infrastructure** as needed
5. **Plan marketing launch** with confidence

---

**💡 Pro Tip:** Start with a soft launch to friends/family before public marketing!

**🆘 Need Help?** Keep this deployment guide handy and test everything twice before going live! 