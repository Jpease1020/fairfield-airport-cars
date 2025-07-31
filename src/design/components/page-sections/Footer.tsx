'use client';

import React from 'react';
import Link from 'next/link';
import { Container, Text, EditableText, Box, Stack } from '@/design/ui';

export const CustomerFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    { name: 'About', href: '/about' },
    { name: 'Help', href: '/help' },
    { name: 'Privacy', href: '/privacy' },
    { name: 'Terms', href: '/terms' },
    { name: 'Contact', href: '/help' },
  ];

  return (
    <Box variant="filled" padding="lg" marginTop="lg" as="footer">
      <Container maxWidth="full" padding="md">
        {/* Main Footer Content */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          gap: '2rem',
          marginBottom: '1.5rem'
        }}>
          {/* Desktop: Side by side, Mobile: Stacked */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'row',
            justifyContent: 'space-between', 
            alignItems: 'flex-start',
            gap: '2rem',
            flexWrap: 'wrap'
          }}>
            {/* Company Info */}
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '0.5rem',
              minWidth: '250px',
              flex: '1 1 300px'
            }}>
              <EditableText 
                field="footer.companyName"
                variant="lead" 
                weight="semibold" 
                color="primary"
              >
                Fairfield Airport Cars
              </EditableText>
              <EditableText 
                field="footer.tagline"
                size="sm" 
                color="secondary"
              >
                Professional airport transportation services
              </EditableText>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <EditableText 
                  field="footer.phone"
                  size="sm" 
                  color="secondary"
                >
                  📞 (203) 555-0123
                </EditableText>
                <EditableText 
                  field="footer.email"
                  size="sm" 
                  color="secondary"
                >
                  ✉️ info@fairfieldairportcars.com
                </EditableText>
              </div>
            </div>

            {/* Quick Links */}
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '0.5rem',
              minWidth: '200px',
              flex: '1 1 250px'
            }}>
              <Text weight="semibold" size="sm" color="primary">Quick Links</Text>
              <div style={{ 
                display: 'flex', 
                flexDirection: 'row',
                gap: '1rem',
                flexWrap: 'wrap'
              }}>
                {footerLinks.map((link) => (
                  <Link key={link.name} href={link.href}>
                    <Text size="sm" color="secondary" style={{ textDecoration: 'none' }}>
                      {link.name}
                    </Text>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar - Improved Design */}
        
          <Stack spacing="md" align="center">
            {/* Copyright */}
            <Text 
              size="sm" 
              color="secondary" 
              weight="medium"
              align="center"
            >
              © {currentYear} Fairfield Airport Cars. All rights reserved.
            </Text>
            
            {/* Additional Info - Responsive Layout */}
            <div style={{ 
              display: 'flex', 
              flexDirection: 'row',
              gap: '1.5rem',
              flexWrap: 'wrap',
              justifyContent: 'center',
              alignItems: 'center'
            }}> 
              <Text 
                size="sm" 
                color="secondary"
                weight="medium"
              >
                ✅ Licensed & Insured
              </Text>
            </div>
          </Stack>
        
      </Container>
    </Box>
  );
}; 