import React from 'react';
import { Container, H3, H4, Text } from '@/components/ui';
import { Grid, Stack } from '@/components/ui/containers';

export const StandardFooter: React.FC = () => {
  return (
    <Container as="footer" variant="section" padding="xl">
      <Stack spacing="xl">
        <Grid columns={3} gap="lg">
          <Stack spacing="sm">
            <H3>Fairfield Airport Cars</H3>
            <Text>Premium airport transportation service</Text>
          </Stack>
          
          <Stack spacing="sm">
            <H4>Contact</H4>
            <Text>Phone: (203) 555-0123</Text>
            <Text>Email: info@fairfieldairportcar.com</Text>
          </Stack>
          
          <Stack spacing="sm">
            <H4>Service Areas</H4>
            <Text>Fairfield County, CT</Text>
            <Text>New York Airports</Text>
          </Stack>
        </Grid>
        
        <Container padding="lg" className="border-t border-gray-200">
          <Text>&copy; 2024 Fairfield Airport Cars. All rights reserved.</Text>
        </Container>
      </Stack>
    </Container>
  );
}; 