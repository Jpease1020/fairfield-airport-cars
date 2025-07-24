'use client';

import Link from 'next/link';
import { StandardLayout } from '@/components/layout/StandardLayout';

export default function HomePage() {
  return (
    <StandardLayout 
      title="Premium Airport Transportation"
      subtitle="Reliable, professional, and luxurious transportation to and from all major airports in the NY and CT area"
    >
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Premium Airport Transportation</h1>
          <p className="hero-subtitle">
            Reliable, comfortable rides to and from Fairfield Airport
          </p>
          <div className="hero-cta">
            <Link href="/book" className="btn btn-primary">
              Book Your Ride
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="section-header">
          <h2>Why Choose Us?</h2>
          <p>Professional service, reliable transportation, and peace of mind for your airport journey.</p>
        </div>
        
        <div className="grid grid-3">
          <div className="feature-card">
            <div className="feature-icon">🚗</div>
            <h3>Professional Service</h3>
            <p>Experienced drivers with clean, well-maintained vehicles</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">⏰</div>
            <h3>Reliable & On Time</h3>
            <p>We understand the importance of punctuality for airport travel</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">💳</div>
            <h3>Easy Booking</h3>
            <p>Simple online booking with secure payment processing</p>
          </div>
        </div>
      </section>

      {/* Fleet Section */}
      <section className="fleet-section">
        <div className="section-header">
          <h2>Our Fleet</h2>
          <p>Clean, comfortable vehicles for every occasion</p>
        </div>
        
        <div className="grid grid-2">
          <div className="fleet-card">
            <h3>Sedan</h3>
            <p>Perfect for 1-3 passengers with luggage</p>
            <ul>
              <li>Comfortable seating for up to 3 passengers</li>
              <li>Ample trunk space for luggage</li>
              <li>Professional driver</li>
            </ul>
          </div>
          
          <div className="fleet-card">
            <h3>SUV</h3>
            <p>Ideal for groups or extra luggage</p>
            <ul>
              <li>Spacious seating for up to 6 passengers</li>
              <li>Large cargo area for multiple bags</li>
              <li>Perfect for families or groups</li>
            </ul>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-section">
        <div className="section-header">
          <h2>Frequently Asked Questions</h2>
        </div>
        
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

      {/* Contact Section */}
      <section className="contact-section">
        <div className="section-header">
          <h2>Contact Us</h2>
          <p>Ready to book your ride? Get in touch with us</p>
        </div>
        
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

      {/* Final CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready for a Stress-Free Ride?</h2>
          <p>Book your airport transportation today and experience the difference of premium service.</p>
          <Link href="/book" className="btn btn-outline">
            Book Now
          </Link>
        </div>
      </section>
    </StandardLayout>
  );
}