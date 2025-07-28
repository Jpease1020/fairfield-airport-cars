'use client';

import React from 'react';
import { UnifiedLayout } from '@/components/layout';
import { 
  GridSection,
  InfoCard,
  FeatureGrid,
  ActionButtonGroup,
  ToastProvider,
  Container,
  EditableText
} from '@/components/ui';
import { Stack } from '@/components/ui/layout/containers';

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
      title={<EditableText field="about.layout.title" defaultValue="About Fairfield Airport Cars">About Fairfield Airport Cars</EditableText>}
      subtitle={<EditableText field="about.layout.subtitle" defaultValue="Professional airport transportation services">Professional airport transportation services</EditableText>}
      description={<EditableText field="about.layout.description" defaultValue="Learn about our commitment to providing reliable, comfortable, and professional transportation services to Fairfield County and surrounding areas.">Learn about our commitment to providing reliable, comfortable, and professional transportation services to Fairfield County and surrounding areas.</EditableText>}
    >
      {/* Our Story Section */}
      <GridSection variant="content" columns={1}>
        <InfoCard
          title="📖 Our Story"
          description="Providing premium transportation services to the Fairfield County area"
        >
          <EditableText field="about.description" defaultValue="Fairfield Airport Cars has been providing premium transportation services to the Fairfield County area for years. We understand that getting to and from the airport can be stressful, which is why we're committed to making your journey as smooth and comfortable as possible.">
            Fairfield Airport Cars has been providing premium transportation services to the Fairfield County area for years.
            We understand that getting to and from the airport can be stressful, which is why we&apos;re committed to making your
            journey as smooth and comfortable as possible.
          </EditableText>
          
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
          <EditableText field="about.coverageArea" defaultValue="Professional transportation services throughout Fairfield County, CT and surrounding areas.">
            Professional transportation services throughout Fairfield County, CT and surrounding areas.
          </EditableText>
        </InfoCard>
        
        <InfoCard
          title="✈️ Airport Destinations"
          description="We serve all major airports in the region:"
        >
          <Stack spacing="sm">
            <Container>• John F. Kennedy International Airport (JFK)</Container>
            <Container>• LaGuardia Airport (LGA)</Container>
            <Container>• Newark Liberty International Airport (EWR)</Container>
            <Container>• Bradley International Airport (BDL)</Container>
            <Container>• Westchester County Airport (HPN)</Container>
          </Stack>
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