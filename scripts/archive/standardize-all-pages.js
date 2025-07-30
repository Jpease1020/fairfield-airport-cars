#!/usr/bin/env node

/**
 * 🔧 Standardize All Pages Script
 * 
 * This script updates all pages to use the new standardized layout system
 * instead of Tailwind CSS and complex component structures.
 */

const fs = require('fs');
const path = require('path');

// Pages to standardize
const PAGES_TO_UPDATE = [
  {
    path: 'src/app/book/page.tsx',
    title: 'Book Your Airport Transfer',
    subtitle: 'Reserve your luxury airport transportation',
    template: 'booking'
  },
  {
    path: 'src/app/help/page.tsx',
    title: 'Help & Support',
    subtitle: 'We\'re here to help',
    template: 'help'
  },
  {
    path: 'src/app/terms/page.tsx',
    title: 'Terms of Service',
    subtitle: 'Our terms and conditions',
    template: 'legal'
  },
  {
    path: 'src/app/privacy/page.tsx',
    title: 'Privacy Policy',
    subtitle: 'How we protect your data',
    template: 'legal'
  },
  {
    path: 'src/app/success/page.tsx',
    title: 'Payment Successful',
    subtitle: 'Your booking has been confirmed',
    template: 'success'
  },
  {
    path: 'src/app/cancel/page.tsx',
    title: 'Booking Cancelled',
    subtitle: 'Your booking has been cancelled',
    template: 'cancel'
  },
  {
    path: 'src/app/portal/page.tsx',
    title: 'Customer Portal',
    subtitle: 'Manage your bookings',
    template: 'portal'
  }
];

// Template content for different page types
const TEMPLATES = {
  booking: `
      <div className="booking-content">
        <section className="booking-section">
          <h2>Book Your Ride</h2>
          <p>Fill out the form below to book your airport transportation.</p>
          
          <div className="booking-form">
            <div className="form-group">
              <label className="form-label">Pickup Location</label>
              <input type="text" className="form-input" placeholder="Enter pickup address" />
            </div>
            
            <div className="form-group">
              <label className="form-label">Dropoff Location</label>
              <input type="text" className="form-input" placeholder="Enter destination" />
            </div>
            
            <div className="form-group">
              <label className="form-label">Pickup Date</label>
              <input type="date" className="form-input" />
            </div>
            
            <div className="form-group">
              <label className="form-label">Pickup Time</label>
              <input type="time" className="form-input" />
            </div>
            
            <div className="form-group">
              <label className="form-label">Number of Passengers</label>
              <select className="form-input">
                <option>1</option>
                <option>2</option>
                <option>3</option>
                <option>4</option>
                <option>5</option>
                <option>6</option>
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label">Special Instructions</label>
              <textarea className="form-input form-textarea" placeholder="Any special requirements..."></textarea>
            </div>
            
            <button className="btn btn-primary">Calculate Fare</button>
          </div>
        </section>
      </div>
  `,
  
  help: `
      <div className="help-content">
        <section className="help-section">
          <h2>Frequently Asked Questions</h2>
          
          <div className="faq-list">
            <div className="faq-item">
              <h3>How far in advance should I book?</h3>
              <p>We recommend booking at least 24 hours in advance, especially for early morning flights.</p>
            </div>
            
            <div className="faq-item">
              <h3>What if my flight is delayed?</h3>
              <p>We monitor flight status and will adjust pickup times accordingly. No additional charges for reasonable delays.</p>
            </div>
            
            <div className="faq-item">
              <h3>Do you provide child seats?</h3>
              <p>Yes, we can provide child seats upon request. Please let us know when booking.</p>
            </div>
            
            <div className="faq-item">
              <h3>What payment methods do you accept?</h3>
              <p>We accept all major credit cards, debit cards, and cash payments.</p>
            </div>
          </div>
        </section>
        
        <section className="help-section">
          <h2>Contact Information</h2>
          <div className="contact-info">
            <div className="contact-item">
              <h3>Phone</h3>
              <p>(203) 555-0123</p>
            </div>
            <div className="contact-item">
              <h3>Email</h3>
              <p>info@fairfieldairportcar.com</p>
            </div>
            <div className="contact-item">
              <h3>Service Hours</h3>
              <p>24/7 Service Available</p>
            </div>
          </div>
        </section>
      </div>
  `,
  
  legal: `
      <div className="legal-content">
        <section className="legal-section">
          <h2>Terms and Conditions</h2>
          <p>By using our service, you agree to the following terms and conditions:</p>
          
          <div className="legal-content">
            <h3>1. Booking and Cancellation</h3>
            <p>Bookings must be made at least 24 hours in advance. Cancellations within 12 hours of pickup time are non-refundable.</p>
            
            <h3>2. Service Standards</h3>
            <p>We strive to provide reliable, professional service. Drivers will arrive on time and maintain clean, well-maintained vehicles.</p>
            
            <h3>3. Payment</h3>
            <p>Payment is due at the time of booking. We accept all major credit cards and cash payments.</p>
            
            <h3>4. Liability</h3>
            <p>We are fully insured and licensed. However, we are not responsible for delays due to weather, traffic, or other circumstances beyond our control.</p>
          </div>
        </section>
      </div>
  `,
  
  success: `
      <div className="success-content">
        <section className="success-section">
          <div className="success-message">
            <h2>🎉 Payment Successful!</h2>
            <p>Your booking has been confirmed and payment processed successfully.</p>
            
            <div className="success-details">
              <h3>What happens next?</h3>
              <ul>
                <li>You'll receive a confirmation email with booking details</li>
                <li>We'll send you an SMS reminder 24 hours before pickup</li>
                <li>Your driver will contact you 30 minutes before pickup</li>
              </ul>
            </div>
            
            <div className="success-actions">
              <a href="/portal" className="btn btn-primary">View Booking Details</a>
              <a href="/" className="btn btn-outline">Return to Home</a>
            </div>
          </div>
        </section>
      </div>
  `,
  
  cancel: `
      <div className="cancel-content">
        <section className="cancel-section">
          <div className="cancel-message">
            <h2>Booking Cancelled</h2>
            <p>Your booking has been successfully cancelled.</p>
            
            <div className="cancel-details">
              <h3>Cancellation Details</h3>
              <ul>
                <li>Your payment has been refunded (if applicable)</li>
                <li>You'll receive a confirmation email</li>
                <li>No further charges will be made</li>
              </ul>
            </div>
            
            <div className="cancel-actions">
              <a href="/book" className="btn btn-primary">Book a New Ride</a>
              <a href="/" className="btn btn-outline">Return to Home</a>
            </div>
          </div>
        </section>
      </div>
  `,
  
  portal: `
      <div className="portal-content">
        <section className="portal-section">
          <h2>Welcome to Your Portal</h2>
          <p>Manage your bookings and account information here.</p>
          
          <div className="portal-grid">
            <div className="portal-card">
              <h3>Current Bookings</h3>
              <p>View and manage your upcoming rides</p>
              <a href="#" className="btn btn-primary">View Bookings</a>
            </div>
            
            <div className="portal-card">
              <h3>Past Trips</h3>
              <p>Review your previous rides and receipts</p>
              <a href="#" className="btn btn-outline">View History</a>
            </div>
            
            <div className="portal-card">
              <h3>Account Settings</h3>
              <p>Update your contact information and preferences</p>
              <a href="#" className="btn btn-outline">Settings</a>
            </div>
            
            <div className="portal-card">
              <h3>Support</h3>
              <p>Get help with your bookings</p>
              <a href="/help" className="btn btn-outline">Get Help</a>
            </div>
          </div>
        </section>
      </div>
  `
};

function updatePage(pageConfig) {
  const filePath = pageConfig.path;
  const template = TEMPLATES[pageConfig.template];
  
  const newContent = `import { StandardLayout } from '@/components/layout/StandardLayout';

export default function ${getPageName(filePath)}() {
  return (
    <StandardLayout 
      title="${pageConfig.title}"
      subtitle="${pageConfig.subtitle}"
    >
${template}
    </StandardLayout>
  );
}
`;

  try {
    fs.writeFileSync(filePath, newContent);
    console.log(`✅ Updated ${filePath}`);
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
  }
}

function getPageName(filePath) {
  const fileName = path.basename(filePath, '.tsx');
  const dirName = path.dirname(filePath).split('/').pop();
  
  if (fileName === 'page') {
    return dirName.charAt(0).toUpperCase() + dirName.slice(1) + 'Page';
  }
  
  return fileName.charAt(0).toUpperCase() + fileName.slice(1) + 'Page';
}

function main() {
  console.log('🔧 Standardizing all pages...\n');
  
  PAGES_TO_UPDATE.forEach(updatePage);
  
  console.log('\n✅ All pages have been standardized!');
  console.log('📝 Pages now use the consistent StandardLayout component');
  console.log('🎨 No more Tailwind CSS complexity');
  console.log('🔧 Simple, maintainable structure');
}

main(); 