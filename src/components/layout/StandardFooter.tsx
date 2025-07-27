import React from 'react';
import { Container, H3, H4, Text } from '@/components/ui';

export const StandardFooter: React.FC = () => {
  return (
    <Container as="footer" variant="section" padding="xl">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <H3>Fairfield Airport Cars</H3>
          <Text>Premium airport transportation service</Text>
        </div>
        
        <div>
          <H4>Contact</H4>
          <Text>Phone: (203) 555-0123</Text>
          <Text>Email: info@fairfieldairportcar.com</Text>
        </div>
        
        <div>
          <H4>Service Areas</H4>
          <Text>Fairfield County, CT</Text>
          <Text>New York Airports</Text>
        </div>
      </div>
      
      <div className="mt-8 pt-8 border-t border-gray-200">
        <Text>&copy; 2024 Fairfield Airport Cars. All rights reserved.</Text>
      </div>
    </Container>
  );
}; 