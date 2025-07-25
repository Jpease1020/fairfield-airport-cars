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