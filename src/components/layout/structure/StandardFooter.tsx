import React from 'react';
import styled from 'styled-components';
import { Container, H3, H4, Text } from '@/components/ui';
import { Stack } from '@/components/ui/layout/containers';
import { EditableText, EditableHeading } from '@/components/ui';
import { spacing, breakpoints } from '@/lib/design-system/tokens';

// Responsive Footer Container
const FooterContainer = styled.footer`
  background: linear-gradient(135deg, var(--background-secondary, #f9fafb) 0%, var(--background-primary, #ffffff) 100%);
  border-top: 1px solid var(--border-default, #d1d5db);
  padding: ${spacing.xl} 0 ${spacing.md};
  
  @media (max-width: ${breakpoints.md}) {
    padding: ${spacing.xl} 0 ${spacing.lg};
  }
`;

const FooterContent = styled.div`
  max-width: var(--container-max-width, 1200px);
  margin: 0 auto;
  padding: 0 4rem;
  
  @media (max-width: ${breakpoints.md}) {
    padding: 0 ${spacing['2xl']};
  }
`;

// Responsive Footer Grid
const FooterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${spacing.lg};
  margin-bottom: ${spacing.lg};
  
  @media (max-width: ${breakpoints.md}) {
    grid-template-columns: 1fr;
    gap: ${spacing.xl};
    margin-bottom: ${spacing.xl};
  }
`;

// Footer Section
const FooterSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.md};
`;

const FooterTitle = styled.div`
  color: var(--primary-color, #2563eb);
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: ${spacing.sm};
  
  @media (max-width: ${breakpoints.md}) {
    font-size: 1rem;
  }
`;

const FooterText = styled(Text)`
  color: var(--text-secondary, #6b7280);
  font-size: 0.875rem;
  line-height: 1.5;
  
  @media (max-width: 768px) {
    font-size: 0.875rem;
  }
`;

const FooterLink = styled.a`
  color: var(--text-secondary, #6b7280);
  text-decoration: none;
  font-size: 0.875rem;
  line-height: 1.5;
  transition: color 0.2s ease-in-out;
  
  &:hover {
    color: var(--primary-color, #2563eb);
  }
`;

// Company Brand Section
const CompanySection = styled(FooterSection)`
  @media (max-width: 768px) {
    text-align: center;
  }
`;

const CompanyName = styled.div`
  color: var(--primary-color, #2563eb);
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: ${spacing.sm};
  
  @media (max-width: ${breakpoints.md}) {
    font-size: 1.25rem;
  }
`;

const CompanyDescription = styled(FooterText)`
  font-size: 1rem;
  line-height: 1.6;
  
  @media (max-width: 768px) {
    font-size: 0.875rem;
  }
`;

// Contact Section
const ContactSection = styled(FooterSection)`
  @media (max-width: 768px) {
    text-align: center;
  }
`;

const ContactItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  
  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const ContactIcon = styled.span`
  font-size: 1rem;
  color: var(--primary-color, #2563eb);
`;

// Service Areas Section
const ServiceAreasSection = styled(FooterSection)`
  @media (max-width: 768px) {
    text-align: center;
  }
`;

const ServiceAreaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  
  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const ServiceAreaIcon = styled.span`
  font-size: 1rem;
  color: var(--primary-color, #2563eb);
`;

// Copyright Section
const CopyrightSection = styled.div`
  border-top: 1px solid var(--border-default, #d1d5db);
  padding-top: 1.5rem;
  text-align: center;
  
  @media (max-width: 768px) {
    padding-top: ${spacing.lg};
  }
`;

const CopyrightText = styled(FooterText)`
  font-size: 0.875rem;
  color: var(--text-secondary, #6b7280);
`;

export const StandardFooter: React.FC = () => {
  return (
    <FooterContainer>
      <FooterContent>
        <FooterGrid>
          {/* Company Section */}
          <CompanySection>
            <CompanyName>
              <EditableHeading field="footer.company.name" defaultValue="Fairfield Airport Cars">
                Fairfield Airport Cars
              </EditableHeading>
            </CompanyName>
            <CompanyDescription>
              <EditableText field="footer.company.description" defaultValue="Premium airport transportation service">
                Premium airport transportation service providing reliable, comfortable rides to and from Fairfield Airport with professional drivers.
              </EditableText>
            </CompanyDescription>
          </CompanySection>
          
          {/* Contact Section */}
          <ContactSection>
            <FooterTitle>
              <EditableHeading field="footer.contact.title" defaultValue="Contact">
                📞 Contact Us
              </EditableHeading>
            </FooterTitle>
            <ContactItem>
              <ContactIcon>📱</ContactIcon>
              <FooterLink href="tel:+12035550123">
                <EditableText field="footer.contact.phone" defaultValue="(203) 555-0123">
                  (203) 555-0123
                </EditableText>
              </FooterLink>
            </ContactItem>
            <ContactItem>
              <ContactIcon>✉️</ContactIcon>
              <FooterLink href="mailto:info@fairfieldairportcar.com">
                <EditableText field="footer.contact.email" defaultValue="info@fairfieldairportcar.com">
                  info@fairfieldairportcar.com
                </EditableText>
              </FooterLink>
            </ContactItem>
            <ContactItem>
              <ContactIcon>🕒</ContactIcon>
              <FooterText>
                <EditableText field="footer.contact.hours" defaultValue="24/7 Service">
                  24/7 Service Available
                </EditableText>
              </FooterText>
            </ContactItem>
          </ContactSection>
          
          {/* Service Areas Section */}
          <ServiceAreasSection>
            <FooterTitle>
              <EditableHeading field="footer.service_areas.title" defaultValue="Service Areas">
                🗺️ Service Areas
              </EditableHeading>
            </FooterTitle>
            <ServiceAreaItem>
              <ServiceAreaIcon>📍</ServiceAreaIcon>
              <FooterText>
                <EditableText field="footer.service_areas.fairfield" defaultValue="Fairfield County, CT">
                  Fairfield County, CT
                </EditableText>
              </FooterText>
            </ServiceAreaItem>
            <ServiceAreaItem>
              <ServiceAreaIcon>✈️</ServiceAreaIcon>
              <FooterText>
                <EditableText field="footer.service_areas.ny_airports" defaultValue="New York Airports">
                  New York Airports (JFK, LGA, EWR)
                </EditableText>
              </FooterText>
            </ServiceAreaItem>
            <ServiceAreaItem>
              <ServiceAreaIcon></ServiceAreaIcon>
              <FooterText>
                <EditableText field="footer.service_areas.ct_airports" defaultValue="Connecticut Airports">
                  Connecticut Airports (BDL, HVN)
                </EditableText>
              </FooterText>
            </ServiceAreaItem>
          </ServiceAreasSection>
        </FooterGrid>
        
        {/* Copyright Section */}
        <CopyrightSection>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1rem', color: 'var(--primary-color-400, #87a1c0)' }}>♿</span>
            <CopyrightText>
              <EditableText field="footer.copyright" defaultValue="© 2024 Fairfield Airport Cars. All rights reserved.">
                © 2024 Fairfield Airport Cars. All rights reserved. | Professional airport transportation service.
              </EditableText>
            </CopyrightText>
          </div>
        </CopyrightSection>
      </FooterContent>
    </FooterContainer>
  );
}; 