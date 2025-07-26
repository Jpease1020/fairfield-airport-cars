'use client';

import Link from 'next/link';
import { UniversalLayout } from '@/components/layout/UniversalLayout';
import { LayoutEnforcer } from '@/lib/design-system/LayoutEnforcer';

export default function HomePage() {
  return (
    <LayoutEnforcer>
      <UniversalLayout 
        layoutType="standard"
        title="Premium Airport Transportation"
        subtitle="Reliable, professional, and luxurious transportation to and from all major airports in the NY and CT area"
      >
        {/* Hero Section */}
        <section className="content-section">
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
        <section className="content-section">
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
        <section className="content-section">
          <div className="cta-section">
            <h2>Ready to Book Your Ride?</h2>
            <p>Get started with your airport transportation booking today</p>
            <Link href="/book" className="btn btn-primary btn-lg">
              Book Now
            </Link>
          </div>
        </section>
      </UniversalLayout>
    </LayoutEnforcer>
  );
}