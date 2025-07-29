'use client';

import { useEffect } from 'react';
import Head from 'next/head';
import { UnifiedLayout } from '@/components/layout';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import {
  Section,
  Container,
  Stack,
  H1,
  H2,
  Text,
  Span,
  Card,
  Button,
  Grid,
  GridItem,
  EditableText
} from '@/components/ui';
import styled from 'styled-components';
import { spacing, fontSize, fontWeight } from '@/lib/design-system/tokens';



const TestimonialAvatar = styled.div`
  width: ${spacing.xl};
  height: ${spacing.xl};
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary-color-400, #87a1c0) 0%, var(--primary-color, #0B1F3A) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: ${fontWeight.bold};
  font-size: ${fontSize.xl};
  transition: transform 0.2s ease-in-out;
  
  &:hover {
    transform: scale(1.05);
  }
`;

const PriceDisplay = styled.div`
  font-size: ${fontSize['4xl']};
  font-weight: ${fontWeight.bold};
  color: var(--primary-color, #0B1F3A);
  text-align: center;
`;

const FeatureList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  text-align: left;
  width: 100%;
`;

const FeatureItem = styled.li`
  padding: ${spacing.sm} 0;
  color: var(--text-secondary, #6b7280);
`;

const CheckmarkSpan = styled.span`
  color: var(--primary-color, #0B1F3A);
  font-weight: ${fontWeight.bold};
  margin-right: ${spacing.sm};
`;

const FeatureIconContainer = styled.div`
  font-size: ${fontSize['3xl']};
  text-align: center;
`;

function HomePageContent() {
  const features = [
    {
      icon: "👨‍💼",
      title: "Professional Service",
      description: "Experienced drivers with clean, well-maintained vehicles for your comfort and safety"
    },
    {
      icon: "⏰",
      title: "Reliable & On Time",
      description: "We understand the importance of punctuality for airport travel and never let you down"
    },
    {
      icon: "💳",
      title: "Easy Booking",
      description: "Simple online booking with secure payment processing and instant confirmation"
    },
    {
      icon: "🛡️",
      title: "Fully Insured",
      description: "Comprehensive insurance coverage for your peace of mind during travel"
    },
    {
      icon: "📱",
      title: "Real-Time Updates",
      description: "Track your ride in real-time with SMS notifications and driver updates"
    },
    {
      icon: "🌟",
      title: "Premium Experience",
      description: "Luxury vehicles with professional drivers for a first-class transportation experience"
    }
  ];

  const testimonials = [
    {
      text: "Excellent service! The driver was professional and on time. Highly recommend for airport transportation.",
      author: "Sarah M.",
      location: "Fairfield, CT",
      avatar: "SM"
    },
    {
      text: "Reliable and comfortable ride to JFK. The booking process was seamless and the driver was courteous.",
      author: "Michael R.",
      location: "Stamford, CT",
      avatar: "MR"
    },
    {
      text: "Best airport car service in the area. Clean vehicles, professional drivers, and fair pricing.",
      author: "Jennifer L.",
      location: "Norwalk, CT",
      avatar: "JL"
    }
  ];

  const pricingPlans = [
    {
      title: "Airport Transfer",
      price: "$85",
      description: "Reliable transportation to and from Fairfield Airport",
      features: [
        "Professional driver",
        "Clean vehicle",
        "Flight monitoring",
        "Meet & greet service",
        "Luggage assistance"
      ]
    },
    {
      title: "Premium Service",
      price: "$120",
      description: "Luxury vehicle with premium amenities",
      features: [
        "Luxury vehicle",
        "Professional driver",
        "Flight monitoring",
        "Meet & greet service",
        "Luggage assistance",
        "Bottled water",
        "WiFi on board"
      ]
    },
    {
      title: "Group Transfer",
      price: "$150",
      description: "Spacious vehicle for groups up to 6 passengers",
      features: [
        "Spacious vehicle",
        "Professional driver",
        "Flight monitoring",
        "Meet & greet service",
        "Luggage assistance",
        "Group discounts available"
      ]
    }
  ];

  return (
    <>
      {/* Hero Section */}
      <Section id="hero-section" variant="brand" padding="xl">
        <Container maxWidth="2xl">
          <Stack spacing="2xl" align="center" gap="md">
            <H1 id="hero-title" align="center">
              <EditableText field="hero.title" defaultValue="Premium Airport Transportation">
                Premium Airport Transportation
              </EditableText>
            </H1>
            <Text id="hero-subtitle" variant="lead" align="center">
              <EditableText field="hero.subtitle" defaultValue="Reliable, comfortable rides to and from Fairfield Airport with professional drivers">
                Reliable, comfortable rides to and from Fairfield Airport with professional drivers
              </EditableText>
            </Text>
            <Text id="hero-description" align="center">
              <EditableText field="hero.description" defaultValue="Experience luxury, reliability, and professional service for all your airport transportation needs.">
                Experience luxury, reliability, and professional service for all your airport transportation needs.
              </EditableText>
            </Text>
            <div id="hero-actions">
              <Button 
                variant="primary"
                size="lg"
                onClick={() => window.location.href = '/book'}
              >
                <EditableText field="hero.primaryButton.label" defaultValue="Book Your Ride">
                  Book Your Ride
                </EditableText>
              </Button>
            </div>
          </Stack>
        </Container>
      </Section>

      {/* Features Section */}
      <Section id="features-section" variant="default" padding="xl">
        <Container maxWidth="2xl">
          <Stack spacing="lg" align="center" marginBottom="xl">
            <H2 id="features-title">
              <EditableText field="features.title" defaultValue="Why Choose Fairfield Airport Cars?">
                Why Choose Fairfield Airport Cars?
              </EditableText>
            </H2>
            <Text id="features-subtitle" variant="lead" align="center">
              <EditableText field="features.subtitle" defaultValue="We provide exceptional service that sets us apart from the competition">
                We provide exceptional service that sets us apart from the competition
              </EditableText>
            </Text>
          </Stack>
          
          <Grid cols={3} gap="lg" responsive>
            {features.map((feature, index) => (
              <GridItem key={index}>
                <Card id={`features-card-${index + 1}`} variant="elevated" padding="lg" hover>
                  <Stack spacing="md">
                    <Stack direction="horizontal" gap="md" align="center" justify="center">
                      <FeatureIconContainer id={`features-icon-${index + 1}`}>
                        <EditableText field={`features.items.${index}.icon`} defaultValue={feature.icon}>
                          {feature.icon}
                        </EditableText>
                      </FeatureIconContainer>
                      <H2 id={`features-card-title-${index + 1}`} size="lg">
                        <EditableText field={`features.items.${index}.title`} defaultValue={feature.title}>
                          {feature.title}
                        </EditableText>
                      </H2>
                    </Stack>
                    <Text id={`features-card-description-${index + 1}`} align="center">
                      <EditableText field={`features.items.${index}.description`} defaultValue={feature.description}>
                        {feature.description}
                      </EditableText>
                    </Text>
                  </Stack>
                </Card>
              </GridItem>
            ))}
          </Grid>
        </Container>
      </Section>

      {/* Testimonials Section */}
      <Section id="testimonials-section" variant="alternate" padding="xl">
        <Container maxWidth="2xl">
          <Stack spacing="lg" align="center" marginBottom="xl">
            <H2 id="testimonials-title">
              <EditableText field="testimonials.title" defaultValue="What Our Customers Say">
                What Our Customers Say
              </EditableText>
            </H2>
            <Text id="testimonials-subtitle" variant="lead" align="center">
              <EditableText field="testimonials.subtitle" defaultValue="Don&apos;t just take our word for it - hear from our satisfied customers">
                Don&apos;t just take our word for it - hear from our satisfied customers
              </EditableText>
            </Text>
          </Stack>
          
          <Grid cols={3} gap="lg" responsive>
            {testimonials.map((testimonial, index) => (
              <GridItem key={index}>
                <Card id={`testimonials-card-${index + 1}`} variant="elevated" padding="lg">
                  <Stack spacing="md">
                    <Span id={`testimonials-quote-${index + 1}`} variant="italic">
                      <EditableText field={`testimonials.items.${index}.text`} defaultValue={testimonial.text}>
                        &quot;{testimonial.text}&quot;
                      </EditableText>
                    </Span>
                    <Stack direction="horizontal" spacing="sm" align="center">
                                             <TestimonialAvatar id={`testimonials-avatar-${index + 1}`}>
                         <EditableText field={`testimonials.items.${index}.avatar`} defaultValue={testimonial.avatar}>
                           {testimonial.avatar}
                         </EditableText>
                       </TestimonialAvatar>
                      <Stack spacing="xs">
                        <Text id={`testimonials-author-${index + 1}`} weight="semibold">
                          <EditableText field={`testimonials.items.${index}.author`} defaultValue={testimonial.author}>
                            {testimonial.author}
                          </EditableText>
                        </Text>
                        <Text id={`testimonials-location-${index + 1}`} size="sm" color="secondary">
                          <EditableText field={`testimonials.items.${index}.location`} defaultValue={testimonial.location}>
                            {testimonial.location}
                          </EditableText>
                        </Text>
                      </Stack>
                    </Stack>
                  </Stack>
                </Card>
              </GridItem>
            ))}
          </Grid>
        </Container>
      </Section>

      {/* Pricing Section */}
      <Section id="pricing-section" variant="default" padding="xl">
        <Container maxWidth="2xl">
          <Stack spacing="lg" align="center" marginBottom="xl">
            <H2 id="pricing-title">
              <EditableText field="pricing.title" defaultValue="Transparent Pricing">
                Transparent Pricing
              </EditableText>
            </H2>
            <Text id="pricing-subtitle" variant="lead" align="center">
              <EditableText field="pricing.subtitle" defaultValue="Fair, competitive rates with no hidden fees">
                Fair, competitive rates with no hidden fees
              </EditableText>
            </Text>
          </Stack>
          
          <Grid cols={3} gap="lg" responsive>
            {pricingPlans.map((plan, index) => (
              <GridItem key={index}>
                <Card id={`pricing-card-${index + 1}`} variant="elevated" padding="lg" hover>
                  <Stack spacing="md" align="center">
                    <H2 id={`pricing-plan-title-${index + 1}`} size="lg" color="primary">
                      <EditableText field={`pricing.plans.${index}.title`} defaultValue={plan.title}>
                        {plan.title}
                      </EditableText>
                    </H2>
                    <PriceDisplay id={`pricing-plan-price-${index + 1}`}>
                      <EditableText field={`pricing.plans.${index}.price`} defaultValue={plan.price}>
                        {plan.price}
                      </EditableText>
                    </PriceDisplay>
                    <Text id={`pricing-plan-description-${index + 1}`} align="center">
                      <EditableText field={`pricing.plans.${index}.description`} defaultValue={plan.description}>
                        {plan.description}
                      </EditableText>
                    </Text>
                    <FeatureList id={`pricing-plan-features-${index + 1}`}>
                      {plan.features.map((feature, featureIndex) => (
                        <FeatureItem key={featureIndex} id={`pricing-feature-${index + 1}-${featureIndex + 1}`}>
                          <CheckmarkSpan>
                            <EditableText field={`pricing.plans.${index}.checkmark`} defaultValue="✓">
                              ✓
                            </EditableText>
                          </CheckmarkSpan>
                          <EditableText field={`pricing.plans.${index}.features.${featureIndex}`} defaultValue={feature}>
                            {feature}
                          </EditableText>
                        </FeatureItem>
                      ))}
                    </FeatureList>
                    <div id={`pricing-plan-button-${index + 1}`}>
                      <Button 
                        variant="primary" 
                        size="md"
                        onClick={() => window.location.href = '/book'}
                      >
                        <EditableText field={`pricing.plans.${index}.ctaButton`} defaultValue="Book Now">
                          Book Now
                        </EditableText>
                      </Button>
                    </div>
                  </Stack>
                </Card>
              </GridItem>
            ))}
          </Grid>
        </Container>
      </Section>

      {/* Final CTA Section */}
      <Section id="final-cta-section" variant="alternate" padding="xl">
        <Container maxWidth="2xl">
          <Stack spacing="lg" align="center" gap="xl">
            <H2 id="final-cta-title">
              <EditableText field="finalCta.title" defaultValue="🚀 Ready to Book Your Ride?">
                🚀 Ready to Book Your Ride?
              </EditableText>
            </H2>
            <Text id="final-cta-description" variant="lead" align="center">
              <EditableText field="finalCta.description" defaultValue="Experience the difference that professional service makes. Get started with your reliable airport transportation today.">
                Experience the difference that professional service makes. Get started with your reliable airport transportation today.
              </EditableText>
            </Text>
            <div id="final-cta-button">
              <Button 
                variant="primary" 
                size="lg"
                onClick={() => window.location.href = '/book'}
              >
                <EditableText field="finalCta.buttonText" defaultValue="🚀 Book Your Ride Today">
                  🚀 Book Your Ride Today
                </EditableText>
              </Button>
            </div>
          </Stack>
        </Container>
      </Section>
    </>
  );
}

export default function HomePage() {
  // Performance optimization: Preload critical resources
  useEffect(() => {
    // Preload booking page for faster navigation
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = '/book';
    link.as = 'document';
    document.head.appendChild(link);
    
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  return (
    <>
      <Head>
        <title>Fairfield Airport Cars - Premium Airport Transportation Service</title>
        <meta name="description" content="Reliable, comfortable rides to and from Fairfield Airport with professional drivers. Book your airport transfer today with transparent pricing and premium service." />
        <meta name="keywords" content="airport transportation, Fairfield airport, airport shuttle, airport car service, airport transfer, professional drivers" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://fairfieldairportcars.com/" />
        <meta property="og:title" content="Fairfield Airport Cars - Premium Airport Transportation" />
        <meta property="og:description" content="Reliable, comfortable rides to and from Fairfield Airport with professional drivers." />
        <meta property="og:image" content="/fairfield_logo.png" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://fairfieldairportcars.com/" />
        <meta property="twitter:title" content="Fairfield Airport Cars - Premium Airport Transportation" />
        <meta property="twitter:description" content="Reliable, comfortable rides to and from Fairfield Airport with professional drivers." />
        <meta property="twitter:image" content="/fairfield_logo.png" />

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              "name": "Fairfield Airport Cars",
              "description": "Premium airport transportation service",
              "url": "https://fairfieldairportcars.com",
              "telephone": "+1-203-555-0123",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Fairfield",
                "addressRegion": "CT",
                "addressCountry": "US"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": 41.1412,
                "longitude": -73.2637
              },
              "openingHours": "Mo-Su 00:00-23:59",
              "priceRange": "$$",
              "serviceType": "Airport Transportation"
            })
          }}
        />
      </Head>
      <UnifiedLayout layoutType="marketing">
        <ErrorBoundary>
          <HomePageContent />
        </ErrorBoundary>
      </UnifiedLayout>
    </>
  );
}