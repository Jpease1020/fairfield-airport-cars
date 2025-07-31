'use client';

import React from 'react';
import styled from 'styled-components';
import { Row, Col, Container, Stack } from '../components/grid';
import { Button } from '../ui';

/**
 * Grid System Example Page
 * 
 * Demonstrates the new flexbox-based grid system with various layout patterns
 * commonly used in the Fairfield Airport Cars application.
 */
export const GridSystemExample: React.FC = () => {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* Header Section */}
      <Container maxWidth="2xl" padding="lg">
        <Row align="center" justify="space-between">
          <Col span={6}>
            <h1 style={{ margin: 0, color: '#333' }}>Fairfield Airport Cars</h1>
          </Col>
          <Col span={6}>
            <Stack direction="horizontal" spacing="md" justify="end">
              <Button >
                Book Now
              </Button>
              <button style={{ padding: '8px 16px', border: '1px solid #ddd', borderRadius: '4px' }}>
                Contact
              </button>
            </Stack>
          </Col>
        </Row>
      </Container>

      {/* Hero Section */}
      <Container maxWidth="2xl" padding="xl">
        <Row gap="xl" align="center">
          <Col span={{ xs: 12, md: 6 }}>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#333' }}>
              Reliable Airport Transportation
            </h2>
            <p style={{ fontSize: '1.1rem', lineHeight: '1.6', color: '#666', marginBottom: '2rem' }}>
              Professional, on-time airport transfers with luxury vehicles and experienced drivers.
            </p>
            <button style={{ 
              padding: '12px 24px', 
              backgroundColor: '#2563eb', 
              color: 'white', 
              border: 'none', 
              borderRadius: '6px',
              fontSize: '1rem',
              cursor: 'pointer'
            }}>
              Book Your Ride
            </button>
          </Col>
          <Col span={{ xs: 12, md: 6 }}>
            <div style={{ 
              height: '300px', 
              backgroundColor: '#e5e7eb', 
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#666'
            }}>
              Hero Image Placeholder
            </div>
          </Col>
        </Row>
      </Container>

      {/* Features Section */}
      <Container maxWidth="2xl" padding="xl">
        <Stack direction="vertical" spacing="xl" align="center">
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#333' }}>
              Why Choose Us
            </h3>
            <p style={{ fontSize: '1.1rem', color: '#666', maxWidth: '600px' }}>
              Professional service with luxury vehicles and experienced drivers
            </p>
          </div>
          
          <Row gap="lg" responsive>
            <Col span={{ xs: 12, md: 6, lg: 4 }}>
              <div style={{ 
                padding: '2rem', 
                backgroundColor: 'white', 
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                textAlign: 'center'
              }}>
                <div style={{ 
                  width: '60px', 
                  height: '60px', 
                  backgroundColor: '#2563eb', 
                  borderRadius: '50%',
                  margin: '0 auto 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '1.5rem'
                }}>
                  ⏰
                </div>
                <h4 style={{ marginBottom: '0.5rem', color: '#333' }}>On-Time Service</h4>
                <p style={{ color: '#666', lineHeight: '1.5' }}>
                  We guarantee on-time pickup and drop-off for all airport transfers.
                </p>
              </div>
            </Col>
            
            <Col span={{ xs: 12, md: 6, lg: 4 }}>
              <div style={{ 
                padding: '2rem', 
                backgroundColor: 'white', 
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                textAlign: 'center'
              }}>
                <div style={{ 
                  width: '60px', 
                  height: '60px', 
                  backgroundColor: '#2563eb', 
                  borderRadius: '50%',
                  margin: '0 auto 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '1.5rem'
                }}>
                  🚗
                </div>
                <h4 style={{ marginBottom: '0.5rem', color: '#333' }}>Luxury Vehicles</h4>
                <p style={{ color: '#666', lineHeight: '1.5' }}>
                  Travel in comfort with our fleet of luxury vehicles and SUVs.
                </p>
              </div>
            </Col>
            
            <Col span={{ xs: 12, md: 6, lg: 4 }}>
              <div style={{ 
                padding: '2rem', 
                backgroundColor: 'white', 
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                textAlign: 'center'
              }}>
                <div style={{ 
                  width: '60px', 
                  height: '60px', 
                  backgroundColor: '#2563eb', 
                  borderRadius: '50%',
                  margin: '0 auto 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '1.5rem'
                }}>
                  👨‍💼
                </div>
                <h4 style={{ marginBottom: '0.5rem', color: '#333' }}>Professional Drivers</h4>
                <p style={{ color: '#666', lineHeight: '1.5' }}>
                  Experienced, licensed drivers with excellent safety records.
                </p>
              </div>
            </Col>
          </Row>
        </Stack>
      </Container>

      {/* Booking Form Section */}
      <Container maxWidth="lg" padding="xl">
        <Stack direction="vertical" spacing="lg">
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#333' }}>
              Book Your Airport Transfer
            </h3>
            <p style={{ fontSize: '1.1rem', color: '#666' }}>
              Quick and easy booking for reliable airport transportation
            </p>
          </div>
          
          <div style={{ 
            padding: '2rem', 
            backgroundColor: 'white', 
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <Stack direction="vertical" spacing="lg">
              <Row gap="md">
                <Col span={6}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#333', fontWeight: '500' }}>
                    Pickup Location
                  </label>
                  <input 
                    type="text" 
                    placeholder="Airport or Address"
                    style={{ 
                      width: '100%', 
                      padding: '12px', 
                      border: '1px solid #ddd', 
                      borderRadius: '4px',
                      fontSize: '1rem'
                    }}
                  />
                </Col>
                <Col span={6}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#333', fontWeight: '500' }}>
                    Drop-off Location
                  </label>
                  <input 
                    type="text" 
                    placeholder="Destination Address"
                    style={{ 
                      width: '100%', 
                      padding: '12px', 
                      border: '1px solid #ddd', 
                      borderRadius: '4px',
                      fontSize: '1rem'
                    }}
                  />
                </Col>
              </Row>
              
              <Row gap="md">
                <Col span={6}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#333', fontWeight: '500' }}>
                    Date
                  </label>
                  <input 
                    type="date"
                    style={{ 
                      width: '100%', 
                      padding: '12px', 
                      border: '1px solid #ddd', 
                      borderRadius: '4px',
                      fontSize: '1rem'
                    }}
                  />
                </Col>
                <Col span={6}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#333', fontWeight: '500' }}>
                    Time
                  </label>
                  <input 
                    type="time"
                    style={{ 
                      width: '100%', 
                      padding: '12px', 
                      border: '1px solid #ddd', 
                      borderRadius: '4px',
                      fontSize: '1rem'
                    }}
                  />
                </Col>
              </Row>
              
              <Row>
                <Col span={12}>
                  <button style={{ 
                    width: '100%',
                    padding: '16px', 
                    backgroundColor: '#2563eb', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '6px',
                    fontSize: '1.1rem',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}>
                    Get Quote & Book
                  </button>
                </Col>
              </Row>
            </Stack>
          </div>
        </Stack>
      </Container>

      {/* Footer */}
      <Container maxWidth="2xl" padding="lg">
        <Row align="center" justify="space-between">
          <Col span={6}>
            <p style={{ color: '#666', margin: 0 }}>© 2024 Fairfield Airport Cars</p>
          </Col>
          <Col span={6}>
            <Stack direction="horizontal" spacing="md" justify="end">
              <a href="#" style={{ color: '#2563eb', textDecoration: 'none' }}>Privacy</a>
              <a href="#" style={{ color: '#2563eb', textDecoration: 'none' }}>Terms</a>
              <a href="#" style={{ color: '#2563eb', textDecoration: 'none' }}>Contact</a>
            </Stack>
          </Col>
        </Row>
      </Container>
    </div>
  );
}; 