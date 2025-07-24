# 🚗 Fairfield Airport Car Service - Business Guide

*Your complete guide to managing your car service business*

---

## 📋 **Quick Start Guide**

### **First Time Setup**
1. **Login to Admin**: Go to `/admin/login` and use your credentials
2. **Initialize CMS**: If content is missing, go to Admin → CMS and click "Initialize CMS"
3. **Configure Business Info**: Go to Admin → CMS → Business Settings
4. **Set Up Payments**: Configure Square credentials in Admin → CMS → Payment
5. **Test Booking Flow**: Try booking a test ride to ensure everything works

---

## 🎯 **Daily Operations**

### **Managing Bookings**
- **View Bookings**: Admin → Bookings (see all current and upcoming rides)
- **Update Status**: Click any booking → change status (pending → confirmed → completed)
- **Send Messages**: Use the "Send Message" feature to contact customers directly
- **Handle Cancellations**: Customers can cancel online, or you can cancel manually

### **Customer Communication**
- **Automatic Messages**: SMS/email sent automatically for:
  - Booking confirmations
  - 24-hour reminders
  - Cancellation confirmations
  - Feedback requests (post-ride)
- **Custom Messages**: Send personalized SMS through the admin dashboard

### **Content Management**
- **Update Website**: Admin → CMS → Pages to edit homepage, help content
- **Business Info**: Admin → CMS → Business Settings for contact details
- **Pricing**: Admin → CMS → Pricing to adjust rates and policies
- **Messages**: Admin → CMS → Communication to customize email/SMS templates

---

## 💰 **Payment & Billing**

### **How Payments Work**
1. **Customer books** → pays 50% deposit via Square
2. **You confirm** → customer gets confirmation
3. **After ride** → collect remaining balance (cash/card)
4. **Tips** → handled through Square checkout

### **Refund Policy**
- **>24 hours**: Full refund
- **3-24 hours**: 50% refund
- **<3 hours**: No refund

### **Payment History**
- Check your **Square Dashboard** for detailed payment reports
- All transactions are automatically tracked

---

## 📱 **Customer Experience**

### **What Customers See**
1. **Homepage** (`/`) - Your business info and booking form
2. **Booking Form** (`/book`) - Easy ride booking with address autocomplete
3. **Status Page** (`/status/[id]`) - Real-time booking status
4. **Help Page** (`/help`) - FAQ and contact information

### **Customer Communications**
- **Booking Confirmation**: Email + SMS with calendar invite
- **24h Reminder**: SMS reminder day before ride
- **On My Way**: SMS when you're en route (optional)
- **Feedback Request**: SMS after completed ride

---

## ⚙️ **Technical Setup**

### **Required Environment Variables**
```
GOOGLE_MAPS_API_KEY=your_google_maps_key
SQUARE_ACCESS_TOKEN=your_square_token
SQUARE_LOCATION_ID=your_square_location
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_phone
EMAIL_HOST=your_smtp_host
EMAIL_PORT=587
EMAIL_USER=your_email_user
EMAIL_PASS=your_email_password
EMAIL_FROM=no-reply@yourdomain.com
```

### **Third-Party Services**
- **Google Maps**: Address autocomplete and fare calculation
- **Square**: Payment processing
- **Twilio**: SMS messaging
- **Firebase**: Database and authentication
- **Vercel**: Hosting and deployment

---

## 🔧 **Troubleshooting**

### **Common Issues**

**Booking form not working?**
- Check Google Maps API key is configured
- Ensure environment variables are set in Vercel

**SMS/email not sending?**
- Verify Twilio credentials are correct
- Check email SMTP settings
- Contact developer for setup assistance

**Payments not processing?**
- Verify Square credentials
- Check Square webhook configuration
- Ensure Square location ID is correct

**Admin login issues?**
- Contact developer to reset Firebase authentication
- Check admin credentials are properly configured

### **Getting Help**
1. **Check this guide** first
2. **Use Admin Help**: Go to Admin → Help for detailed FAQ
3. **Contact Developer**: For technical issues and setup
4. **Review Documentation**: Check project files for technical details

---

## 📊 **Business Analytics**

### **What You Can Track**
- **Bookings**: Number, status, revenue
- **Customer Data**: Contact info, preferences
- **Payment History**: Through Square dashboard
- **Communication**: SMS/email delivery status

### **Future Analytics** (Coming Soon)
- **Revenue Reports**: Daily/weekly/monthly summaries
- **Customer Insights**: Popular routes, peak times
- **Performance Metrics**: On-time rate, customer satisfaction

---

## 🚀 **Scaling Your Business**

### **Current Features**
- ✅ Single driver operation
- ✅ Automated booking system
- ✅ Payment processing
- ✅ Customer communication
- ✅ Content management

### **Future Enhancements**
- 🔄 Multiple drivers
- 🔄 Real-time driver tracking
- 🔄 Advanced analytics dashboard
- 🔄 Customer accounts
- 🔄 Loyalty program
- 🔄 Mobile app

---

## 📞 **Support Contacts**

- **Technical Support**: Contact your developer
- **Square Support**: [Square Support](https://squareup.com/help)
- **Twilio Support**: [Twilio Support](https://support.twilio.com)
- **Google Maps**: [Google Cloud Support](https://cloud.google.com/support)

---

*Last updated: [Current Date]*

**Need immediate help?** Go to Admin → Help in your app for quick answers! 