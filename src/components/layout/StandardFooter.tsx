import React from 'react';
import { Container, H3, H4, Text } from '@/components/ui';

export const StandardFooter: React.FC = () => {
  return (
    <footer className="standard-footer">
      <Container className="footer-content">
        <Container className="footer-section">
          <H3>Fairfield Airport Cars</H3>
          <Text>Premium airport transportation service</Text>
        </Container>
        
        <Container className="footer-section">
          <H4>Contact</H4>
          <Text>Phone: (203) 555-0123</Text>
          <Text>Email: info@fairfieldairportcar.com</Text>
        </Container>
        
        <Container className="footer-section">
          <H4>Service Areas</H4>
          <Text>Fairfield County, CT</Text>
          <Text>New York Airports</Text>
        </Container>
      </Container>
      
      <Container className="footer-bottom">
        <Text>&copy; 2024 Fairfield Airport Cars. All rights reserved.</Text>
      </Container>
    </footer>
  );
}; 