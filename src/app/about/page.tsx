'use client';

import { UniversalLayout } from '@/components/layout/UniversalLayout';
import { LayoutEnforcer } from '@/lib/design-system/LayoutEnforcer';
import { 
  GridSection,
  InfoCard,
  ToastProvider,
  useToast,
  FeatureGrid
} from '@/components/ui';

function AboutPageContent() {
  const { addToast } = useToast();

  // REFACTORED: Using structured feature data for FeatureGrid
  const features = [
    {
      icon: "👨‍💼",
      title: "Professional Drivers",
      description: "All our drivers are licensed, insured, and professionally trained to provide excellent service"
    },
    {
      icon: "🚙",
      title: "Clean Vehicles",
      description: "Our fleet is regularly maintained and cleaned to ensure a comfortable ride every time"
    },
    {
      icon: "⏱️",
      title: "On-Time Service",
      description: "We track flights and traffic to ensure you arrive at your destination on time"
    },
    {
      icon: "🕐",
      title: "24/7 Availability",
      description: "We provide transportation services around the clock to accommodate any schedule"
    }
  ];

  const serviceAreas = [
    "John F. Kennedy International Airport (JFK)",
    "LaGuardia Airport (LGA)",
    "Newark Liberty International Airport (EWR)",
    "Bradley International Airport (BDL)",
    "Westchester County Airport (HPN)"
  ];

  return (
    <LayoutEnforcer>
      <UniversalLayout 
        layoutType="standard"
        title="About Fairfield Airport Cars"
        subtitle="Professional airport transportation service serving Fairfield County and beyond"
      >
        {/* Our Story Section */}
        <GridSection variant="content" columns={1}>
          <InfoCard
            title="📖 Our Story"
            description="Providing premium transportation services to the Fairfield County area"
          >
            <div style={{
              fontSize: 'var(--font-size-base)',
              lineHeight: '1.6',
              color: 'var(--text-primary)'
            }}>
              <p style={{ marginBottom: 'var(--spacing-md)' }}>
                Fairfield Airport Cars has been providing premium transportation services to the Fairfield County area for years. 
                We understand that getting to and from the airport can be stressful, which is why we're committed to making your 
                journey as smooth and comfortable as possible.
              </p>
              
              <p style={{ margin: 0 }}>
                Our commitment to excellence has made us the trusted choice for thousands of customers who rely on us for their 
                airport transportation needs.
              </p>
            </div>
          </InfoCard>
        </GridSection>

        {/* Our Mission Section */}
        <GridSection variant="content" columns={1}>
          <InfoCard
            title="🎯 Our Mission"
            description="Exceeding expectations through professional service and reliability"
          >
            <div style={{
              fontSize: 'var(--font-size-base)',
              lineHeight: '1.6',
              color: 'var(--text-primary)',
              textAlign: 'center',
              padding: 'var(--spacing-lg)'
            }}>
              <p style={{
                fontStyle: 'italic',
                fontSize: 'var(--font-size-lg)',
                color: 'var(--brand-primary)',
                margin: 0
              }}>
                "To provide reliable, professional, and comfortable transportation services that exceed our customers' expectations. 
                We believe in punctuality, safety, and superior customer service."
              </p>
            </div>
          </InfoCard>
        </GridSection>

        {/* Why Choose Us Section */}
        <GridSection variant="content" columns={1}>
          <InfoCard
            title="✨ Why Choose Us?"
            description="Experience the difference that professional service makes"
          >
            {/* REFACTORED: Using FeatureGrid instead of manual CSS grid */}
            <FeatureGrid features={features} columns={2} />
          </InfoCard>
        </GridSection>

        {/* Service Areas Section */}
        <GridSection variant="content" columns={1}>
          <InfoCard
            title="🗺️ Service Areas"
            description="We proudly serve Fairfield County, CT and surrounding areas"
          >
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: 'var(--spacing-lg)',
              padding: 'var(--spacing-lg) 0'
            }}>
              <div>
                <h4 style={{ 
                  margin: '0 0 var(--spacing-md) 0',
                  color: 'var(--text-primary)'
                }}>
                  🌍 Coverage Area
                </h4>
                <p style={{
                  fontSize: 'var(--font-size-base)',
                  lineHeight: '1.6',
                  color: 'var(--text-primary)',
                  margin: 0
                }}>
                  We provide professional transportation services throughout Fairfield County, CT and surrounding areas, 
                  connecting you to all major airports in the region.
                </p>
              </div>
              
              <div>
                <h4 style={{ 
                  margin: '0 0 var(--spacing-md) 0',
                  color: 'var(--text-primary)'
                }}>
                  ✈️ Airport Destinations
                </h4>
                <ul style={{ 
                  margin: 0,
                  padding: '0 0 0 var(--spacing-lg)',
                  fontSize: 'var(--font-size-sm)',
                  lineHeight: '1.8',
                  color: 'var(--text-primary)'
                }}>
                  {serviceAreas.map((airport, index) => (
                    <li key={index} style={{ marginBottom: 'var(--spacing-xs)' }}>
                      {airport}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </InfoCard>
        </GridSection>

        {/* Contact Information */}
        <GridSection variant="content" columns={1}>
          <InfoCard
            title="📞 Get In Touch"
            description="Ready to experience premium airport transportation?"
          >
            <div style={{
              textAlign: 'center',
              padding: 'var(--spacing-lg)'
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 'var(--spacing-lg)',
                marginBottom: 'var(--spacing-lg)'
              }}>
                <div>
                  <h4 style={{ margin: '0 0 var(--spacing-sm) 0' }}>📞 Phone</h4>
                  <p style={{ 
                    margin: 0,
                    fontSize: 'var(--font-size-lg)',
                    fontWeight: '600',
                    color: 'var(--brand-primary)'
                  }}>
                    (203) 555-0123
                  </p>
                </div>
                
                <div>
                  <h4 style={{ margin: '0 0 var(--spacing-sm) 0' }}>🕐 Availability</h4>
                  <p style={{ 
                    margin: 0,
                    fontSize: 'var(--font-size-base)',
                    color: 'var(--text-primary)'
                  }}>
                    24/7 Service
                  </p>
                </div>
                
                <div>
                  <h4 style={{ margin: '0 0 var(--spacing-sm) 0' }}>🚗 Booking</h4>
                  <p style={{ 
                    margin: 0,
                    fontSize: 'var(--font-size-base)',
                    color: 'var(--text-primary)'
                  }}>
                    Online & Phone
                  </p>
                </div>
              </div>
              
              <button 
                className="w-full h-16 bg-gradient-to-r from-brand-primary to-brand-secondary text-white rounded-lg font-bold text-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                onClick={() => window.location.href = '/book'}
              >
                🚗 Book Your Ride Today
              </button>
            </div>
          </InfoCard>
        </GridSection>
      </UniversalLayout>
    </LayoutEnforcer>
  );
}

export default function AboutPage() {
  return (
    <ToastProvider>
      <AboutPageContent />
    </ToastProvider>
  );
} 