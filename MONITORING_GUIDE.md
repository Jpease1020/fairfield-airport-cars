# Monitoring & Analytics Guide

## Overview

The Fairfield Airport Cars app now includes comprehensive monitoring and analytics to track every user interaction, detect broken functionality, and alert administrators when issues occur.

## 🔍 What's Being Monitored

### User Interactions
- **Every click** on buttons, links, and interactive elements
- **All form inputs** and submissions
- **Focus/blur events** on form fields
- **Page navigation** and load times
- **API calls** and their success/failure rates
- **Error events** (JavaScript errors, network failures, validation errors)

### Critical Functionality
- **Booking form** - All steps from location input to payment
- **Admin dashboard** - Login, booking management, CMS
- **Payment processing** - Square integration
- **Communication** - SMS/email sending
- **AI Assistant** - Chat functionality and responses

### Performance Metrics
- **Response times** for all API endpoints
- **Page load times** and performance
- **Error rates** and failure patterns
- **User session data** and behavior patterns

## 📊 Analytics Dashboard

### Access
Navigate to **Admin → Analytics** to view the comprehensive analytics dashboard.

### What You'll See
- **Total Interactions** - All user actions tracked
- **Total Errors** - All errors detected and categorized
- **Error Rate** - Percentage of interactions that resulted in errors
- **Active Elements** - Different types of elements users interact with
- **Top Interaction Types** - Most common user actions
- **Top Error Types** - Most frequent error categories
- **Recent Activity** - Latest user interactions
- **Recent Errors** - Latest errors with details

### Key Metrics to Watch
- **Error Rate > 5%** - Indicates potential issues
- **Critical Endpoints Down** - Immediate attention required
- **High Response Times** - Performance issues
- **Frequent JavaScript Errors** - Code problems

## 🚨 Alert System

### Automatic Notifications
The system automatically sends alerts when:

1. **Critical endpoints fail** (booking form, payment, admin)
2. **Error rate exceeds 5%** of total interactions
3. **JavaScript errors occur** frequently
4. **API endpoints are down** or slow
5. **Payment processing fails**

### Notification Channels
- **Email** - Sent to admin@fairfieldairportcars.com
- **SMS** - Text messages to configured numbers
- **Slack** - Messages to configured channels
- **Webhook** - Custom integrations

### Alert Types
- **Critical** - Immediate attention required (red)
- **High** - Important issues (orange)
- **Medium** - Performance concerns (yellow)
- **Low** - Informational (green)

## 🔧 Monitoring Script

### Manual Monitoring
Run the comprehensive monitoring script:

```bash
npm run monitor
```

This script:
- Tests all critical endpoints
- Runs booking flow scenarios
- Checks API functionality
- Validates admin access
- Analyzes error rates
- Generates detailed reports

### Automated Monitoring
Set up automated monitoring with cron:

```bash
# Add to crontab for hourly monitoring
0 * * * * cd /path/to/app && npm run monitor
```

## 📈 Data Collection

### What's Tracked
Every user interaction includes:
- **Element type** (button, input, form, etc.)
- **Page URL** where interaction occurred
- **Timestamp** of the interaction
- **User agent** and device info
- **Viewport size** and screen dimensions
- **Context** (form data, error messages, etc.)
- **Success/failure** status
- **Response time** for API calls

### Privacy & Security
- **No sensitive data** is logged (passwords, tokens)
- **Form data** is sanitized and limited
- **User identification** is optional and anonymized
- **Data retention** is limited to recent events

## 🛠️ Configuration

### Environment Variables
```env
# Notification settings
NOTIFICATION_WEBHOOK_URL=https://hooks.slack.com/...
SLACK_WEBHOOK_URL=https://hooks.slack.com/...
ERROR_WEBHOOK_URL=https://your-webhook.com/...

# Monitoring settings
APP_URL=https://your-app.com
MONITORING_ENABLED=true
```

### Customization
Edit `src/lib/interaction-tracker.ts` to:
- Adjust tracking sensitivity
- Add custom event types
- Modify data collection
- Change notification thresholds

## 📋 Monitoring Checklist

### Daily Checks
- [ ] Review analytics dashboard
- [ ] Check error rates
- [ ] Monitor critical endpoints
- [ ] Review recent errors
- [ ] Test booking flow

### Weekly Checks
- [ ] Run comprehensive monitoring script
- [ ] Review performance trends
- [ ] Check notification settings
- [ ] Update monitoring thresholds
- [ ] Review user interaction patterns

### Monthly Checks
- [ ] Analyze error patterns
- [ ] Review notification effectiveness
- [ ] Update monitoring configuration
- [ ] Check data retention policies
- [ ] Review privacy compliance

## 🚀 Quick Start

### 1. Enable Monitoring
The monitoring system is automatically active. Check the analytics dashboard at `/admin/analytics`.

### 2. Set Up Notifications
Configure notification channels in your environment variables.

### 3. Test the System
```bash
# Run manual monitoring
npm run monitor

# Check analytics
curl http://localhost:3000/api/analytics/summary
```

### 4. Monitor Key Metrics
- **Error Rate**: Should be < 5%
- **Response Times**: Should be < 5 seconds
- **Critical Endpoints**: Should all be accessible
- **User Interactions**: Should show normal patterns

## 🔍 Troubleshooting

### Common Issues

**High Error Rate**
- Check JavaScript console for errors
- Review recent error logs
- Test critical user flows
- Check API endpoint status

**Missing Analytics Data**
- Verify tracking is enabled
- Check browser console for errors
- Ensure Firestore is accessible
- Review API endpoint logs

**Notification Not Working**
- Check environment variables
- Verify webhook URLs
- Test notification channels
- Review API endpoint status

### Debug Mode
Enable debug logging:
```javascript
// In browser console
localStorage.setItem('debug_analytics', 'true');
```

## 📊 Understanding the Data

### Interaction Types
- **click** - Button and link clicks
- **input** - Form field interactions
- **submit** - Form submissions
- **focus/blur** - Field focus events
- **load** - Page and API loads
- **navigation** - Page transitions

### Error Types
- **javascript** - JavaScript runtime errors
- **network** - API call failures
- **validation** - Form validation errors
- **api** - Backend API errors
- **user** - User-generated errors

### Element Types
- **button** - All button clicks
- **input** - Form input fields
- **form** - Form submissions
- **link** - Navigation links
- **api** - API endpoint calls
- **page** - Page load events

## 🎯 Best Practices

### For Administrators
1. **Check analytics daily** - Review the dashboard regularly
2. **Set up notifications** - Configure alerts for critical issues
3. **Monitor error rates** - Keep error rate below 5%
4. **Test critical flows** - Regularly test booking and admin functions
5. **Review user patterns** - Understand how users interact with the app

### For Developers
1. **Add error boundaries** - Wrap critical components
2. **Test user flows** - Ensure all interactions work
3. **Monitor performance** - Keep response times low
4. **Handle errors gracefully** - Provide helpful error messages
5. **Log meaningful data** - Include context in error reports

## 📞 Support

If you encounter issues with the monitoring system:

1. **Check the analytics dashboard** for current status
2. **Run the monitoring script** to test all functionality
3. **Review error logs** in the browser console
4. **Contact the developer** for technical support

The monitoring system is designed to help you maintain a high-quality user experience and quickly identify and resolve any issues that arise. 