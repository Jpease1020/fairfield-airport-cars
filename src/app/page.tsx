'use client';

import React from 'react';
import { 
  HeroSection,
  TestimonialItem
} from '@/design/components/templates/MarketingTemplates';
import { 
  Container,
  Stack,
  H1,
  H2,
  H3,
  Text,
  Button,
  Grid,
  GridItem,
  ContentBox,
  Span,
  CustomerPageTemplate
} from '@/design/ui';
import { EditableText } from '@/design/ui';
import Link from 'next/link';

function HomePageContent() {
  // Features data
  const features = [
    {
      icon: () => <Span size="xl">⏰</Span>,
      title: "On-Time Service",
      description: "Reliable pickup times with flight tracking and real-time updates"
    },
    {
      icon: () => <Span size="xl">🚙</Span>,
      title: "Clean Vehicles",
      description: "Well-maintained, professional fleet with luxury options"
    },
    {
      icon: () => <Span size="xl">💳</Span>,
      title: "Easy Booking",
      description: "Secure online booking and payment with instant confirmation"
    },
    {
      icon: () => <Span size="xl">👨‍💼</Span>,
      title: "Professional Drivers",
      description: "Licensed, experienced drivers with background checks"
    },
    {
      icon: () => <Span size="xl">📱</Span>,
      title: "Real-Time Updates",
      description: "Track your ride with live GPS updates and driver contact"
    },
    {
      icon: () => <Span size="xl">💰</Span>,
      title: "Transparent Pricing",
      description: "No hidden fees, clear pricing with upfront quotes"
    }
  ];

  // Testimonials data
  const testimonials: TestimonialItem[] = [
    {
      name: "Sarah Johnson",
      role: "Business Traveler",
      company: "Tech Startup",
      content: "Fairfield Airport Cars has been my go-to for airport transportation. Their drivers are always on time and the service is consistently excellent.",
      rating: 5,
      avatar: "👩‍💼"
    },
    {
      name: "Michael Chen",
      role: "Frequent Flyer",
      company: "Consulting Firm",
      content: "I've used their service dozens of times and never had a bad experience. Clean cars, professional drivers, and reliable service.",
      rating: 5,
      avatar: "👨‍💼"
    },
    {
      name: "Emily Rodriguez",
      role: "Family Traveler",
      company: "Local Resident",
      content: "Perfect for family trips to the airport. The drivers are patient with kids and luggage, and the booking process is so easy.",
      rating: 5,
      avatar: "👩‍👧‍👦"
    }
  ];

  // Contact methods
  const contactMethods = [
    {
      type: 'phone' as const,
      label: 'Call Us',
      value: '(203) 555-0123',
      href: 'tel:+12035550123'
    },
    {
      type: 'email' as const,
      label: 'Email Us',
      value: 'info@fairfieldairportcars.com',
      href: 'mailto:info@fairfieldairportcars.com'
    },
    {
      type: 'text' as const,
      label: 'Text Us',
      value: '(203) 555-0123',
      href: 'sms:+12035550123'
    }
  ];

  return (
    <CustomerPageTemplate showNavigation={true} showFooter={true} maxWidth="full">
      {/* Hero Section */}
      <Container maxWidth="full" variant="main">
        <Container maxWidth="xl" padding="xl">
          <Stack spacing="xl" align="center">
            <Stack spacing="md" align="center">
              <H1 align="center">
                <EditableText field="home.hero.title" defaultValue="Premium Airport Transportation">
                  Premium Airport Transportation
                </EditableText>
              </H1>
              <Text variant="lead" align="center" size="lg">
                <EditableText field="home.hero.subtitle" defaultValue="Reliable rides to and from Fairfield County airports">
                  Reliable rides to and from Fairfield County airports
                </EditableText>
              </Text>
              <Text align="center">
                <EditableText field="home.hero.description" defaultValue="Professional drivers, clean vehicles, and on-time service for all your airport transportation needs.">
                  Professional drivers, clean vehicles, and on-time service for all your airport transportation needs.
                </EditableText>
              </Text>
            </Stack>
            
            <Stack direction="horizontal" spacing="md">
              <Button 
                variant="primary" 
                size="lg" 
                href="/book"
                icon="🚗"
                iconPosition="left"
                shape="rounded"
              >
                <EditableText field="home.hero.primaryButton" defaultValue="Book Now">
                  Book Now
                </EditableText>
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                href="/about"
                shape="rounded"
              >
                <EditableText field="home.hero.secondaryButton" defaultValue="Learn More">
                  Learn More
                </EditableText>
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Container>

      {/* Features Section */}
      <Container maxWidth="xl" padding="xl">
        <Stack spacing="xl">
          <Stack spacing="md" align="center">
            <H2 align="center">
              <EditableText field="home.features.title" defaultValue="Why Choose Fairfield Airport Cars">
                Why Choose Fairfield Airport Cars
              </EditableText>
            </H2>
            <Text variant="lead" align="center">
              <EditableText field="home.features.subtitle" defaultValue="Professional service you can count on">
                Professional service you can count on
              </EditableText>
            </Text>
          </Stack>
          
          <Grid cols={12} gap="lg">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <GridItem key={index} span={4}>
                  <ContentBox variant="elevated" padding="lg">
                    <Stack spacing="md" align="center">
                      <IconComponent />
                      <H3 align="center">{feature.title}</H3>
                      <Text align="center">{feature.description}</Text>
                    </Stack>
                  </ContentBox>
                </GridItem>
              );
            })}
          </Grid>
        </Stack>
      </Container>

      {/* Testimonials Section */}
      <Container maxWidth="xl" padding="xl">
        <Stack spacing="xl">
          <Stack spacing="md" align="center">
            <H2 align="center">
              <EditableText field="home.testimonials.title" defaultValue="What Our Customers Say">
                What Our Customers Say
              </EditableText>
            </H2>
            <Text variant="lead" align="center">
              <EditableText field="home.testimonials.subtitle" defaultValue="Join thousands of satisfied customers">
                Join thousands of satisfied customers
              </EditableText>
            </Text>
          </Stack>
          
          <Grid cols={12} gap="lg">
            {testimonials.map((testimonial, index) => (
              <GridItem key={index} span={4}>
                <ContentBox variant="elevated" padding="lg">
                  <Stack spacing="md">
                    <Stack spacing="sm" align="center">
                      <Span size="xl">{testimonial.avatar}</Span>
                      <Text weight="semibold">{testimonial.name}</Text>
                      <Text variant="muted" size="sm">
                        {testimonial.role}{testimonial.company && ` at ${testimonial.company}`}
                      </Text>
                    </Stack>
                    <Text align="center">"{testimonial.content}"</Text>
                    {testimonial.rating && (
                      <Stack direction="horizontal" spacing="xs" align="center">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Span key={i} size="sm">⭐</Span>
                        ))}
                      </Stack>
                    )}
                  </Stack>
                </ContentBox>
              </GridItem>
            ))}
          </Grid>
        </Stack>
      </Container>

      {/* CTA Section */}
      <Container maxWidth="full" variant="main">
        <Container maxWidth="xl" padding="xl">
          <Stack spacing="xl" align="center">
            <Stack spacing="md" align="center">
              <H2 align="center">
                <EditableText field="home.cta.title" defaultValue="Ready to Book Your Ride?">
                  Ready to Book Your Ride?
                </EditableText>
              </H2>
              <Text variant="lead" align="center" size="lg">
                <EditableText field="home.cta.subtitle" defaultValue="Get reliable airport transportation today">
                  Get reliable airport transportation today
                </EditableText>
              </Text>
            </Stack>
            
            <Stack direction="horizontal" spacing="md">
              <Button 
                variant="primary" 
                size="lg" 
                href="/book"
                icon="📅"
                iconPosition="left"
                shape="rounded"
              >
                <EditableText field="home.cta.primaryButton" defaultValue="Book Now">
                  Book Now
                </EditableText>
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                href="/about"
                shape="rounded"
              >
                <EditableText field="home.cta.secondaryButton" defaultValue="Learn More">
                  Learn More
                </EditableText>
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Container>

      {/* Contact Section */}
      <Container maxWidth="xl" padding="xl">
        <Stack spacing="xl" align="center">
          <Stack spacing="md" align="center">
            <H2 align="center">
              <EditableText field="home.contact.title" defaultValue="Get in Touch">
                Get in Touch
              </EditableText>
            </H2>
            <Text variant="lead" align="center">
              <EditableText field="home.contact.subtitle" defaultValue="We're here to help">
                We're here to help
              </EditableText>
            </Text>
            <Text align="center">
              <EditableText field="home.contact.description" defaultValue="Contact us for booking assistance or any questions about our services.">
                Contact us for booking assistance or any questions about our services.
              </EditableText>
            </Text>
          </Stack>
          
          <Grid cols={3} gap="lg" responsive>
            {contactMethods.map((method, index) => (
              <GridItem key={index}>
                <ContentBox variant="elevated" padding="lg">
                  <Stack spacing="md" align="center">
                    <Span size="xl">
                      {method.type === 'phone' ? '📞' : method.type === 'email' ? '✉️' : '💬'}
                    </Span>
                    <Stack spacing="sm" align="center">
                      <Text weight="semibold">{method.label}</Text>
                      <Text variant="muted">{method.value}</Text>
                    </Stack>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => window.open(method.href)}
                      fullWidth
                    >
                      {method.label}
                    </Button>
                  </Stack>
                </ContentBox>
              </GridItem>
            ))}
          </Grid>
        </Stack>
      </Container>

      {/* Quick Info Section */}
      <Container maxWidth="full" variant="section">
        <Container maxWidth="xl" padding="xl">
          <Grid cols={2} gap="xl" responsive>
            <GridItem>
              <ContentBox variant="elevated" padding="lg">
                <Stack spacing="md">
                  <H3>
                    <EditableText field="home.info.airports.title" defaultValue="Serving Major Airports">
                      Serving Major Airports
                    </EditableText>
                  </H3>
                  <Stack spacing="sm">
                    <Text>✈️ JFK International Airport</Text>
                    <Text>✈️ LaGuardia Airport</Text>
                    <Text>✈️ Newark Liberty International</Text>
                    <Text>✈️ Westchester County Airport</Text>
                  </Stack>
                </Stack>
              </ContentBox>
            </GridItem>
            
            <GridItem>
              <ContentBox variant="elevated" padding="lg">
                <Stack spacing="md">
                  <H3>
                    <EditableText field="home.info.service.title" defaultValue="Service Areas">
                      Service Areas
                    </EditableText>
                  </H3>
                  <Stack spacing="sm">
                    <Text>📍 Fairfield County</Text>
                    <Text>📍 Westchester County</Text>
                    <Text>📍 New Haven County</Text>
                    <Text>📍 Surrounding Areas</Text>
                  </Stack>
                </Stack>
              </ContentBox>
            </GridItem>
          </Grid>
        </Container>
      </Container>
    </CustomerPageTemplate>
  );
}

export default function HomePage() {
  return <HomePageContent />;
} 