import { Container, Stack, Box, H1, H2, Text, Grid, GridItem, Button, Input, Label, Textarea } from '@/ui';
import { cmsService } from '@/lib/services/cms-service';

// Load CMS data at build time for instant page loads
export async function generateStaticParams() {
  return [{ page: 'contact' }];
}

export async function generateMetadata() {
  const cmsData = await cmsService.getCMSConfiguration();
  const contactData = (cmsData?.pages as any)?.contact;
  
  return {
    title: contactData?.title || 'Contact Us - Fairfield Airport Cars',
    description: contactData?.subtitle || 'Get in touch with Fairfield Airport Car Service for questions, support, or to book your ride.',
    keywords: 'contact, support, airport transportation, Fairfield, customer service, booking',
  };
}

export default async function ContactPage() {
  const cmsData = await cmsService.getCMSConfiguration();
  const contactData = (cmsData?.pages as any)?.contact;

  return (
    <Container>
      <Stack spacing="xl">
        {/* Page Header */}
        <Box variant="elevated" padding="xl">
          <Stack spacing="lg" align="center">
            <H1 align="center">
              {contactData?.title || 'Contact Us'}
            </H1>
            <Text align="center" size="lg">
              {contactData?.subtitle || 'Get in touch with our team for any questions or support'}
            </Text>
          </Stack>
        </Box>

        {/* Contact Information */}
        <Box variant="elevated" padding="lg">
          <Stack spacing="lg">
            <H2 align="center">
              {contactData?.info?.title || 'Contact Information'}
            </H2>
            
            <Grid cols={2} gap="lg" responsive>
              <GridItem>
                <Stack spacing="md">
                  <Box variant="outlined" padding="md">
                    <Stack spacing="sm">
                      <Text weight="bold">
                        {contactData?.phone?.label || 'Phone'}
                      </Text>
                      <Text>
                        {contactData?.phone?.value || '(203) 555-0123'}
                      </Text>
                    </Stack>
                  </Box>
                </Stack>
              </GridItem>
              
              <GridItem>
                <Stack spacing="md">
                  <Box variant="outlined" padding="md">
                    <Stack spacing="sm">
                      <Text weight="bold">
                        {contactData?.email?.label || 'Email'}
                      </Text>
                      <Text>
                        {contactData?.email?.value || 'rides@fairfieldairportcars.com'}
                      </Text>
                    </Stack>
                  </Box>
                </Stack>
              </GridItem>
            </Grid>
          </Stack>
        </Box>

        {/* Business Hours */}
        <Box variant="elevated" padding="lg">
          <Stack spacing="lg">
            <H2 align="center">
              {contactData?.hours?.title || 'Business Hours'}
            </H2>
            
            <Box variant="outlined" padding="md">
              <Stack spacing="sm">
                <Stack direction="horizontal" justify="space-between">
                  <Text>
                    {contactData?.hours?.monday || 'Monday - Friday'}
                  </Text>
                  <Text weight="medium">
                    {contactData?.hours?.mondayTime || '6:00 AM - 10:00 PM'}
                  </Text>
                </Stack>
                <Stack direction="horizontal" justify="space-between">
                  <Text>
                    {contactData?.hours?.saturday || 'Saturday'}
                  </Text>
                  <Text weight="medium">
                    {contactData?.hours?.saturdayTime || '7:00 AM - 9:00 PM'}
                  </Text>
                </Stack>
                <Stack direction="horizontal" justify="space-between">
                  <Text>
                    {contactData?.hours?.sunday || 'Sunday'}
                  </Text>
                  <Text weight="medium">
                    {contactData?.hours?.sundayTime || '8:00 AM - 8:00 PM'}
                  </Text>
                </Stack>
              </Stack>
            </Box>
          </Stack>
        </Box>

        {/* Contact Form */}
        <Box variant="elevated" padding="lg">
          <Stack spacing="lg">
            <H2 align="center">
              {contactData?.form?.title || 'Send Us a Message'}
            </H2>
            
            <form>
              <Stack spacing="md">
                <Grid cols={2} gap="md" responsive>
                  <GridItem>
                    <Stack spacing="sm">
                      <Label htmlFor="name">
                        {contactData?.form?.name?.label || 'Full Name'}
                      </Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder={contactData?.form?.name?.placeholder || 'Enter your full name'}
                        fullWidth
                      />
                    </Stack>
                  </GridItem>
                  
                  <GridItem>
                    <Stack spacing="sm">
                      <Label htmlFor="email">
                        {contactData?.form?.email?.label || 'Email Address'}
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder={contactData?.form?.email?.placeholder || 'Enter your email'}
                        fullWidth
                      />
                    </Stack>
                  </GridItem>
                </Grid>
                
                <Stack spacing="sm">
                  <Label htmlFor="subject">
                    {contactData?.form?.subject?.label || 'Subject'}
                  </Label>
                  <Input
                    id="subject"
                    type="text"
                    placeholder={contactData?.form?.subject?.placeholder || 'What is this about?'}
                    fullWidth
                  />
                </Stack>
                
                <Stack spacing="sm">
                  <Label htmlFor="message">
                    {contactData?.form?.message?.label || 'Message'}
                  </Label>
                  <Textarea
                    id="message"
                    rows={5}
                    placeholder={contactData?.form?.message?.placeholder || 'Tell us how we can help you...'}
                    fullWidth
                  />
                </Stack>
                
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  size="lg"
                >
                  {contactData?.form?.submit || 'Send Message'}
                </Button>
              </Stack>
            </form>
          </Stack>
        </Box>

        {/* Emergency Contact */}
        <Box variant="elevated" padding="lg">
          <Stack spacing="lg">
            <H2 align="center">
              {contactData?.emergency?.title || '🆘 Emergency Contact'}
            </H2>
            
            <Box variant="outlined" padding="md">
              <Stack spacing="md" align="center">
                <Text align="center">
                  {contactData?.emergency?.description || 'For urgent matters or after-hours assistance'}
                </Text>
                <Text size="xl" weight="bold">
                  {contactData?.emergency?.phone || '📞 (203) 555-0123'}
                </Text>
                <Text size="sm" color="secondary">
                  {contactData?.emergency?.note || 'Available 24/7 for urgent transportation needs'}
                </Text>
              </Stack>
            </Box>
          </Stack>
        </Box>
      </Stack>
    </Container>
  );
}
