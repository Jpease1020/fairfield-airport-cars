"use client";
import React from 'react';
import { CustomerNavigation } from '@/components/app/CustomerNavigation';
import { Container } from '@/design/layout/containers/Container';
import { Footer } from '@/design/page-sections/Footer';
import { 
  Stack,
  H4,
  Text,
  Button,
  Span,
  H2
} from '@/ui';
import { StaticHeroSection } from '@/ui';
import { usePageData } from '@/hooks/usePageData';

function HomePageContent() {
  const { data: cmsData, loading, error } = usePageData('home');
  // Features data
  const features = [
    {
      icon: "⏰",
      title: "On-Time Service",
      description: "Reliable pickup times with flight tracking and real-time updates"
    },
    {
      icon: "🚙",
      title: "Clean Vehicles", 
      description: "Well-maintained, professional fleet with luxury options"
    },
    {
      icon: "💳",
      title: "Easy Booking",
      description: "Secure online booking and payment with instant confirmation"
    }
  ];

  // Testimonials data
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Business Traveler",
      company: "Tech Corp",
      content: "Fairfield Airport Cars made my business trips stress-free. Always on time and professional service.",
      rating: 5
    },
    {
      name: "Mike Chen",
      role: "Frequent Flyer",
      content: "The best airport transportation service I've used. Clean cars and friendly drivers.",
      rating: 5
    },
    {
      name: "Lisa Rodriguez",
      role: "Travel Consultant",
      content: "I recommend Fairfield Airport Cars to all my clients. Reliable and professional.",
      rating: 5
    }
  ];

  return (
    <>
      {/* Hero Section */}
      <StaticHeroSection
        title={cmsData?.pages?.home?.hero?.title || 'Professional Airport Transportation'}
        subtitle={cmsData?.pages?.home?.hero?.subtitle || 'Reliable rides to and from Fairfield Airport'}
        description={cmsData?.pages?.home?.hero?.description || 'Book your ride with confidence. Professional drivers, clean vehicles, and on-time service guaranteed.'}
        primaryAction={{
          label: cmsData?.pages?.home?.hero?.primaryButton || 'Book Now',
          href: "/book"
        }}
        secondaryAction={{
          label: cmsData?.pages?.home?.hero?.secondaryButton || 'Learn More',
          href: "/about"
        }}
      />

      {/* Features Section */}
      <Container maxWidth="xl" padding="xl" variant="section" marginTop="xl" data-testid="home-features-section">
        <Stack spacing="xl" align="center">
          <Stack spacing="md" align="center">
            <H2 align="center">
              {cmsData?.pages?.home?.features?.title || 'Why Choose Fairfield Airport Cars'}
            </H2>
            <Text variant="lead" align="center">
              {cmsData?.pages?.home?.features?.subtitle || 'Professional service you can count on'}
            </Text>
          </Stack>
          <Stack 
            direction={{ xs: 'vertical', lg: 'horizontal' }}
            spacing={{ xs: 'md', lg: 'lg' }}
            align="stretch"
            data-testid="features-stack"
          >
          {features.map((feature, index) => (
            <Container key={index} variant="elevated" padding="lg">
              <Stack direction="vertical" spacing="md" align="center">
                <Container>
                  <Text size="xl">{feature.icon}</Text>
                </Container>
                <Container>
                  <H4>
                    {cmsData?.pages?.home?.features?.items?.[index]?.title || feature.title}
                  </H4>
                </Container>
                <Container>
                  <Text variant="muted">
                    {cmsData?.pages?.home?.features?.items?.[index]?.description || feature.description}
                  </Text>
                </Container>
              </Stack>
            </Container>
          ))}
          </Stack>
        </Stack>
      </Container>

      {/* Testimonials Section */}
      <Container maxWidth="xl" padding="xl" variant="section" marginTop="xl" data-testid="home-testimonials-section">
        <Stack spacing="xl" align="center">
          <Stack spacing="md" align="center">
            <H2 align="center">
              {cmsData?.pages?.home?.testimonials?.title || 'What Our Customers Say'}
            </H2>
            <Text variant="lead" align="center">
              {cmsData?.pages?.home?.testimonials?.subtitle || 'Trusted by travelers and businesses'}
            </Text>
          </Stack>
          <Stack 
            direction={{ xs: 'vertical', lg: 'horizontal' }}
            spacing={{ xs: 'md', lg: 'lg' }}
            align="stretch"
            data-testid="testimonials-stack"
          >
          {testimonials.map((testimonial, index) => (
            <Container key={index} variant="elevated" padding="lg">
              <Stack direction="vertical" spacing="md">
                    <Container>
                      <Text variant="muted" size="sm">
                        {cmsData?.pages?.home?.testimonials?.items?.[index]?.content || testimonial.content}
                      </Text>
                    </Container>
                <Container>
                  <Stack direction="horizontal" spacing="sm" align="center">
                        <Container>
                          <Text weight="semibold">
                            {cmsData?.pages?.home?.testimonials?.items?.[index]?.name || testimonial.name}
                          </Text>
                        </Container>
                        <Container>
                          <Text variant="muted" size="sm">
                            {cmsData?.pages?.home?.testimonials?.items?.[index]?.role || testimonial.role}
                          </Text>
                        </Container>
                        {testimonial.company && (
                        <Container>
                          <Text variant="muted" size="sm">
                            • {cmsData?.pages?.home?.testimonials?.items?.[index]?.company || testimonial.company}
                          </Text>
                        </Container>
                      )}
                  </Stack>
                </Container>
                <Container>
                  <Stack direction="horizontal" spacing="xs">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Span key={i}>⭐</Span>
                    ))}
                  </Stack>
                </Container>
              </Stack>
            </Container>
          ))}
          </Stack>
        </Stack>
      </Container>

      {/* CTA Section */}
      <Container maxWidth="xl" padding="xl" variant="section" marginTop="xl" data-testid="home-cta-section">
        <Stack spacing="xl" align="center">
          <Stack spacing="md" align="center">
            <H2 align="center">
              {cmsData?.pages?.home?.cta?.title || 'Ready to Book Your Ride?'}
            </H2>
            <Text variant="lead" align="center">
              {cmsData?.pages?.home?.cta?.subtitle || 'Get started with your airport transportation today'}
            </Text>
          </Stack>
          <Stack direction={{ xs: 'vertical', sm: 'horizontal' }} spacing="md">
            <Button as="a" href="/book">
              {cmsData?.pages?.home?.cta?.primaryButton || 'Book Now'}
            </Button>
            <Button variant="outline" as="a" href="/about">
              {cmsData?.pages?.home?.cta?.secondaryButton || 'Learn More'}
            </Button>
          </Stack>
        </Stack>
      </Container>
    </>
  );
}

export default function RootPage() {
  return (
    <>
      <Container variant="navigation" as="header" maxWidth="full" margin="none" data-testid="layout-navigation">
        <CustomerNavigation />
      </Container>
      
      <Container as="main" maxWidth="full" data-testid="layout-main-content">
        <HomePageContent />
      </Container>
      
      <Footer data-testid="layout-footer"/>
    </>
  );
} 