'use client';

import React from 'react';
import { UnifiedLayout } from '@/components/layout';
import { 
  GridSection,
  InfoCard,
  FeatureGrid,
  ActionButtonGroup,
  ToastProvider,
  Text
} from '@/components/ui';

function AboutPageContent() {
  const ctaActions = [
    {
      label: 'Book Your Ride',
      onClick: () => window.location.href = '/book',
      variant: 'primary' as const,
      icon: '🚗'
    },
    {
      label: 'Contact Us',
      onClick: () => window.location.href = '/help',
      variant: 'secondary' as const,
      icon: '📞'
    }
  ];

  return (
    <UnifiedLayout 
      layoutType="content"
      title="About Fairfield Airport Cars"
      subtitle="Professional airport transportation services"
      description="Learn about our commitment to providing reliable, comfortable, and professional transportation services to Fairfield County and surrounding areas."
    >
      {/* Our Story Section */}
      <GridSection variant="content" columns={1}>
        <InfoCard
          title="📖 Our Story"
          description="Providing premium transportation services to the Fairfield County area"
        >
          <Text>
            Fairfield Airport Cars has been providing premium transportation services to the Fairfield County area for years.
            We understand that getting to and from the airport can be stressful, which is why we&apos;re committed to making your
            journey as smooth and comfortable as possible.
          </Text>
          
          <blockquote>
            &quot;To provide reliable, professional, and comfortable transportation services that exceed our customers&apos; expectations.
            We believe in punctuality, safety, and superior customer service.&quot;
          </blockquote>
        </InfoCard>
      </GridSection>

      {/* Why Choose Us Section */}
      <GridSection variant="content" columns={1}>
        <InfoCard
          title="✨ Why Choose Us?"
          description="Experience the difference that professional service makes"
        >
          <FeatureGrid 
            features={[
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
            ]} 
            columns={4} 
          />
        </InfoCard>
      </GridSection>

      {/* Service Areas Section */}
      <GridSection variant="content" columns={2}>
        <InfoCard
          title="🌍 Coverage Area"
          description="We provide professional transportation services throughout Fairfield County, CT and surrounding areas, connecting you to all major airports in the region."
        >
          <Text>Professional transportation services throughout Fairfield County, CT and surrounding areas.</Text>
        </InfoCard>
        
        <InfoCard
          title="✈️ Airport Destinations"
          description="We serve all major airports in the region:"
        >
          <ul>
            <li>John F. Kennedy International Airport (JFK)</li>
            <li>LaGuardia Airport (LGA)</li>
            <li>Newark Liberty International Airport (EWR)</li>
            <li>Bradley International Airport (BDL)</li>
            <li>Westchester County Airport (HPN)</li>
          </ul>
        </InfoCard>
      </GridSection>

      {/* Contact CTA Section */}
      <GridSection variant="content" columns={1}>
        <InfoCard
          title="📞 Ready to Experience Premium Service?"
          description="Contact us today to book your reliable airport transportation. Available 24/7 for your convenience."
        >
          <FeatureGrid 
            features={[
              {
                icon: "📞",
                title: "Phone",
                description: "(203) 555-0123"
              },
              {
                icon: "🕐",
                title: "Availability", 
                description: "24/7 Service"
              },
              {
                icon: "🚗",
                title: "Booking",
                description: "Book online anytime"
              }
            ]} 
            columns={3} 
          />
          
          <ActionButtonGroup buttons={ctaActions} />
        </InfoCard>
      </GridSection>
    </UnifiedLayout>
  );
}

export default function AboutPage() {
  return (
    <ToastProvider>
      <AboutPageContent />
    </ToastProvider>
  );
} 