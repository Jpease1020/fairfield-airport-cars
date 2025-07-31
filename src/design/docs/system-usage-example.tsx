'use client';

import React from 'react';
import styled from 'styled-components';
import { Row, Col, Container, Stack } from '../components/grid';
import { Button, Card, Text, Badge, H1, H2, H3, H4, H5, Alert } from '../ui';
import { StandardPage } from '../components/page-templates/StandardPage';

// Example: Building a complete page in seconds using our system
export const SystemUsageExample: React.FC = () => {
  return (
    <StandardPage
      maxWidth="2xl"
      padding="lg"
      navigation={{
        variant: 'default',
        sticky: true,
        links: [
          { label: 'Home', href: '/', active: true },
          { label: 'Book Now', href: '/book' },
          { label: 'Services', href: '/services' },
          { label: 'About', href: '/about' },
        ],
      }}
      footer={{
        variant: 'default',
        compact: false,
        copyright: '© 2024 Fairfield Airport Cars. All rights reserved.',
      }}
    >
      {/* Hero Section */}
      <Stack direction="vertical" spacing="2xl" margin="none">
        <Row gap="xl">
          <Col span={{ xs: 12, lg: 6 }}>
            <Stack direction="vertical" spacing="lg">
              <H1>Welcome to Fairfield Airport Cars</H1>
              <Text variant="body">
                Professional airport transportation service with reliable drivers and comfortable vehicles.
              </Text>
              <Row gap="md">
                <Button variant="primary" size="lg">
                  Book Now
                </Button>
                <Button variant="outline" size="lg">
                  Learn More
                </Button>
              </Row>
            </Stack>
          </Col>
          <Col span={{ xs: 12, lg: 6 }}>
            <Card variant="elevated" size="lg">
              <Stack direction="vertical" spacing="md">
                <H3>Quick Booking</H3>
                <Text variant="small">
                  Get your ride in minutes with our streamlined booking process.
                </Text>
                <Badge variant="success">Available 24/7</Badge>
              </Stack>
            </Card>
          </Col>
        </Row>

        {/* Services Grid */}
        <Stack direction="vertical" spacing="xl">
          <H2 textAlign="center">Our Services</H2>
          <Row gap="lg">
            <Col span={{ xs: 12, md: 4 }}>
              <Card variant="action" size="md">
                <Stack direction="vertical" spacing="md">
                  <H4>Airport Pickup</H4>
                  <Text variant="small">
                    Reliable pickup service from all major airports.
                  </Text>
                  <Button variant="primary" size="sm">
                    Book Pickup
                  </Button>
                </Stack>
              </Card>
            </Col>
            <Col span={{ xs: 12, md: 4 }}>
              <Card variant="action" size="md">
                <Stack direction="vertical" spacing="md">
                  <H4>Airport Dropoff</H4>
                  <Text variant="small">
                    On-time dropoff service to all major airports.
                  </Text>
                  <Button variant="primary" size="sm">
                    Book Dropoff
                  </Button>
                </Stack>
              </Card>
            </Col>
            <Col span={{ xs: 12, md: 4 }}>
              <Card variant="action" size="md">
                <Stack direction="vertical" spacing="md">
                  <H4>Corporate Travel</H4>
                  <Text variant="small">
                    Professional service for business travelers.
                  </Text>
                  <Button variant="primary" size="sm">
                    Corporate Booking
                  </Button>
                </Stack>
              </Card>
            </Col>
          </Row>
        </Stack>

        {/* Features Section */}
        <Row gap="xl">
          <Col span={{ xs: 12, lg: 8 }}>
            <Stack direction="vertical" spacing="lg">
              <H2>Why Choose Us?</H2>
              <Row gap="md">
                <Col span={{ xs: 12, sm: 6 }}>
                  <Stack direction="vertical" spacing="sm">
                    <Badge variant="default">Professional Drivers</Badge>
                    <Text variant="small">
                      All our drivers are licensed, insured, and background-checked.
                    </Text>
                  </Stack>
                </Col>
                <Col span={{ xs: 12, sm: 6 }}>
                  <Stack direction="vertical" spacing="sm">
                    <Badge variant="success">On-Time Guarantee</Badge>
                    <Text variant="small">
                      We guarantee on-time arrival or your money back.
                    </Text>
                  </Stack>
                </Col>
                <Col span={{ xs: 12, sm: 6 }}>
                  <Stack direction="vertical" spacing="sm">
                    <Badge variant="info">Clean Vehicles</Badge>
                    <Text variant="small">
                      All vehicles are regularly cleaned and maintained.
                    </Text>
                  </Stack>
                </Col>
                <Col span={{ xs: 12, sm: 6 }}>
                  <Stack direction="vertical" spacing="sm">
                    <Badge variant="warning">24/7 Service</Badge>
                    <Text variant="small">
                      Available around the clock for your convenience.
                    </Text>
                  </Stack>
                </Col>
              </Row>
            </Stack>
          </Col>
          <Col span={{ xs: 12, lg: 4 }}>
            <Alert variant="info">
              <Stack direction="vertical" spacing="sm">
                <H5>Special Offer</H5>
                <Text variant="small">
                  Book your first ride and get 10% off your next booking!
                </Text>
                <Button variant="primary" size="sm">
                  Claim Offer
                </Button>
              </Stack>
            </Alert>
          </Col>
        </Row>

        {/* Contact Section */}
        <Card variant="light" size="lg">
          <Row gap="lg">
            <Col span={{ xs: 12, md: 6 }}>
              <Stack direction="vertical" spacing="md">
                <H3>Get in Touch</H3>
                <Text variant="body">
                  Have questions? Our customer service team is here to help.
                </Text>
                <Row gap="md">
                  <Button variant="primary">
                    Contact Us
                  </Button>
                  <Button variant="outline">
                    View FAQ
                  </Button>
                </Row>
              </Stack>
            </Col>
            <Col span={{ xs: 12, md: 6 }}>
              <Stack direction="vertical" spacing="sm">
                <H5>Contact Information</H5>
                <Text variant="small">📞 (555) 123-4567</Text>
                <Text variant="small">📧 info@fairfieldairportcars.com</Text>
                <Text variant="small">📍 123 Airport Road, Fairfield, CT</Text>
              </Stack>
            </Col>
          </Row>
        </Card>
      </Stack>
    </StandardPage>
  );
};

export default SystemUsageExample; 