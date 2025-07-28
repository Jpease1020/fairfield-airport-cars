import React from 'react';
import { Container, H3, H4, Text } from '@/components/ui';
import { Grid, Stack } from '@/components/ui/containers';
import { EditableText, EditableHeading } from '@/components/ui';

export const StandardFooter: React.FC = () => {
  return (
    <Container as="footer" variant="section" padding="xl">
      <Stack spacing="xl">
        <Grid cols={3} gap="lg">
          <Container>
            <Stack spacing="md">
              <EditableHeading field="footer.company.name" defaultValue="Fairfield Airport Cars">
                Fairfield Airport Cars
              </EditableHeading>
              <EditableText field="footer.company.description" defaultValue="Premium airport transportation service">
                Premium airport transportation service
              </EditableText>
            </Stack>
          </Container>
          
          <Container>
            <Stack spacing="md">
              <EditableHeading field="footer.contact.title" defaultValue="Contact">
                Contact
              </EditableHeading>
              <EditableText field="footer.contact.phone" defaultValue="Phone: (203) 555-0123">
                Phone: (203) 555-0123
              </EditableText>
              <EditableText field="footer.contact.email" defaultValue="Email: info@fairfieldairportcar.com">
                Email: info@fairfieldairportcar.com
              </EditableText>
            </Stack>
          </Container>
          
          <Container>
            <Stack spacing="md">
              <EditableHeading field="footer.service_areas.title" defaultValue="Service Areas">
                Service Areas
              </EditableHeading>
              <EditableText field="footer.service_areas.fairfield" defaultValue="Fairfield County, CT">
                Fairfield County, CT
              </EditableText>
              <EditableText field="footer.service_areas.ny_airports" defaultValue="New York Airports">
                New York Airports
              </EditableText>
            </Stack>
          </Container>
        </Grid>
        
        <Container padding="lg" variant="elevated">
          <EditableText field="footer.copyright" defaultValue="&copy; 2024 Fairfield Airport Cars. All rights reserved.">
            &copy; 2024 Fairfield Airport Cars. All rights reserved.
          </EditableText>
        </Container>
      </Stack>
    </Container>
  );
}; 