'use client';

import { UniversalLayout } from '@/components/layout/UniversalLayout';
import { LayoutEnforcer } from '@/lib/design-system/LayoutEnforcer';

export default function AboutPage() {
  return (
    <LayoutEnforcer>
      <UniversalLayout 
        layoutType="standard"
        title="About Fairfield Airport Cars"
        subtitle="Professional airport transportation service serving Fairfield County and beyond"
      >
        <section className="content-section">
          <div className="about-content">
            <h2>Our Story</h2>
            <p>
              Fairfield Airport Cars has been providing premium transportation services to the Fairfield County area for years. 
              We understand that getting to and from the airport can be stressful, which is why we're committed to making your 
              journey as smooth and comfortable as possible.
            </p>
            
            <h2>Our Mission</h2>
            <p>
              To provide reliable, professional, and comfortable transportation services that exceed our customers' expectations. 
              We believe in punctuality, safety, and superior customer service.
            </p>
            
            <h2>Why Choose Us?</h2>
            <div className="features-grid">
              <div className="feature-item">
                <h3>Professional Drivers</h3>
                <p>All our drivers are licensed, insured, and professionally trained to provide excellent service.</p>
              </div>
              
              <div className="feature-item">
                <h3>Clean Vehicles</h3>
                <p>Our fleet is regularly maintained and cleaned to ensure a comfortable ride every time.</p>
              </div>
              
              <div className="feature-item">
                <h3>On-Time Service</h3>
                <p>We track flights and traffic to ensure you arrive at your destination on time.</p>
              </div>
              
              <div className="feature-item">
                <h3>24/7 Availability</h3>
                <p>We provide transportation services around the clock to accommodate any schedule.</p>
              </div>
            </div>
            
            <h2>Service Areas</h2>
            <p>
              We proudly serve Fairfield County, CT and surrounding areas, providing transportation to all major airports including:
            </p>
            <ul>
              <li>John F. Kennedy International Airport (JFK)</li>
              <li>LaGuardia Airport (LGA)</li>
              <li>Newark Liberty International Airport (EWR)</li>
              <li>Bradley International Airport (BDL)</li>
              <li>Westchester County Airport (HPN)</li>
            </ul>
          </div>
        </section>
      </UniversalLayout>
    </LayoutEnforcer>
  );
} 