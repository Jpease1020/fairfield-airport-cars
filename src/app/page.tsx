'use client';

import React from 'react';
import { 
  Container,
  Stack,
  H4,
  Text,
  Button,
  Span,
  HeroSection,
  H2
} from '@/ui';
import { EditableText } from '@/ui';
import Link from 'next/link';

function HomePageContent() {
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
      <HeroSection
        title="Professional Airport Transportation"
        subtitle="Reliable rides to and from Fairfield Airport"
        description="Book your ride with confidence. Professional drivers, clean vehicles, and on-time service guaranteed."
        primaryAction={{
          label: "Book Now",
          href: "/book"
        }}
        secondaryAction={{
          label: "Learn More",
          href: "/about"
        }}
        data-testid="home-hero-section"
      />

      {/* Features Section */}
      <Container maxWidth="xl" padding="xl" variant="section" marginTop="xl" data-testid="home-features-section">
        <Stack spacing="xl" align="center">
          <Stack spacing="md" align="center">
            <H2 align="center">Why Choose Fairfield Airport Cars</H2>
            <Text variant="lead" align="center">Professional service you can count on</Text>
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
                  <H4>{feature.title}</H4>
                </Container>
                <Container>
                  <Text variant="muted">{feature.description}</Text>
                </Container>
              </Stack>
            </Container>
          ))}
        </Stack>
      </Stack>
    </Container>

      {/* Testimonials Section */}
      <Container maxWidth="xl" padding="xl" data-testid="home-testimonials-section">
        <Stack spacing="xl" align="center">
          <Stack spacing="md" align="center">
            <H2 align="center">What Our Customers Say</H2>
            <Text variant="lead" align="center">Real experiences from satisfied travelers</Text>
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
                    <H4>{testimonial.name}</H4>
                    <Text variant="muted" size="sm">{testimonial.role}</Text>
                  </Container>
                  <Container>
                    <Stack direction="vertical" spacing="md">
                      <Text variant="lead" data-testid={`testimonial-content-${index + 1}`}>"{testimonial.content}"</Text>
                      <Stack direction="horizontal" spacing="xs" data-testid={`testimonial-rating-${index + 1}`}>
                        {[...Array(5)].map((_, i) => (
                          <Span key={i} color={i < testimonial.rating ? 'primary' : 'muted'}>
                            ★
                          </Span>
                        ))}
                      </Stack>
                    </Stack>
                  </Container>
                </Stack>
              </Container>
            ))}
          </Stack>
        </Stack>
      </Container>

      {/* CTA Section */}
      <Container maxWidth="xl" padding="xl" data-testid="home-cta-section">
        <Stack spacing="xl" align="center">
          <Stack spacing="md" align="center">
            <H2 align="center">Ready to Book Your Ride?</H2>
            <Text variant="lead" align="center">Get started in minutes</Text>
          </Stack>
          <Stack spacing="lg" align="center" data-testid="cta-content">
            <Text variant="lead" align="center" data-testid="cta-description">
              Join thousands of satisfied customers who trust Fairfield Airport Cars
            </Text>
            <Stack 
              direction={{ xs: 'vertical', sm: 'horizontal' }}
              spacing={{ xs: 'sm', md: 'md' }} 
              align="center"
              justify="center"
              wrap="wrap"
              data-testid="cta-buttons"
            >
              <Link href="/book" data-testid="cta-book-button">
                <Button variant="primary" size="lg">
                  Book Your Ride
                </Button>
              </Link>
              <Link href="/contact" data-testid="cta-contact-button">
                <Button variant="outline" size="lg">
                  Contact Us
                </Button>
              </Link>
            </Stack>
          </Stack>
        </Stack>
      </Container>
    </>
  );
}

export default HomePageContent; 