import { Container, Stack, Box, H1, H2, Text, Grid, GridItem, Button, Input, Label, Textarea } from '@/ui';
import { getCMSField, useCMSData } from '@/design/hooks/useCMSData';
import { useInteractionMode } from '@/design/providers/InteractionModeProvider';

export default function ContactPage() {
  const { cmsData } = useCMSData();
  const { mode } = useInteractionMode();

  return (
    <Container>
      <Stack spacing="xl">
        {/* Page Header */}
        <Box variant="elevated" padding="xl">
          <Stack spacing="lg" align="center">
            <H1 
              align="center"
              data-cms-id="pages.contact.title"
              mode={mode}
            >
              {getCMSField(cmsData, 'pages.contact.title', 'Contact Us')}
            </H1>
            <Text 
              align="center" 
              size="lg"
              data-cms-id="pages.contact.subtitle"
              mode={mode}
            >
              {getCMSField(cmsData, 'pages.contact.subtitle', 'Get in touch with our team for any questions or assistance')}
            </Text>
          </Stack>
        </Box>

        {/* Contact Information */}
        <Box variant="elevated" padding="lg">
          <Stack spacing="lg">
            <H2 
              align="center"
              data-cms-id="pages.contact.info.title"
              mode={mode}
            >
              {getCMSField(cmsData, 'pages.contact.info.title', 'Contact Information')}
            </H2>
            
            <Grid cols={2} gap="lg" responsive>
              <GridItem>
                <Stack spacing="md">
                  <Box variant="outlined" padding="md">
                    <Stack spacing="sm">
                      <Text weight="bold" data-cms-id="pages.contact.phone.label" mode={mode}>
                        {getCMSField(cmsData, 'pages.contact.phone.label', 'Phone')}
                      </Text>
                      <Text data-cms-id="pages.contact.phone.value" mode={mode}>
                        {getCMSField(cmsData, 'pages.contact.phone.value', '(203) 555-0123')}
                      </Text>
                    </Stack>
                  </Box>
                </Stack>
              </GridItem>
              
              <GridItem>
                <Stack spacing="md">
                  <Box variant="outlined" padding="md">
                    <Stack spacing="sm">
                      <Text weight="bold" data-cms-id="pages.contact.email.label" mode={mode}>
                        {getCMSField(cmsData, 'pages.contact.email.label', 'Email')}
                      </Text>
                      <Text data-cms-id="pages.contact.email.value" mode={mode}>
                        {getCMSField(cmsData, 'pages.contact.email.value', 'info@fairfieldairportcars.com')}
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
            <H2 
              align="center"
              data-cms-id="pages.contact.hours.title"
              mode={mode}
            >
              {getCMSField(cmsData, 'pages.contact.hours.title', 'Business Hours')}
            </H2>
            
            <Box variant="outlined" padding="md">
              <Stack spacing="sm">
                <Stack direction="horizontal" justify="space-between">
                  <Text data-cms-id="pages.contact.hours.monday" mode={mode}>
                    {getCMSField(cmsData, 'pages.contact.hours.monday', 'Monday - Friday')}
                  </Text>
                  <Text weight="medium" data-cms-id="pages.contact.hours.mondayTime" mode={mode}>
                    {getCMSField(cmsData, 'pages.contact.hours.mondayTime', '6:00 AM - 11:00 PM')}
                  </Text>
                </Stack>
                <Stack direction="horizontal" justify="space-between">
                  <Text data-cms-id="pages.contact.hours.saturday" mode={mode}>
                    {getCMSField(cmsData, 'pages.contact.hours.saturday', 'Saturday')}
                  </Text>
                  <Text weight="medium" data-cms-id="pages.contact.hours.saturdayTime" mode={mode}>
                    {getCMSField(cmsData, 'pages.contact.hours.saturdayTime', '7:00 AM - 10:00 PM')}
                  </Text>
                </Stack>
                <Stack direction="horizontal" justify="space-between">
                  <Text data-cms-id="pages.contact.hours.sunday" mode={mode}>
                    {getCMSField(cmsData, 'pages.contact.hours.sunday', 'Sunday')}
                  </Text>
                  <Text weight="medium" data-cms-id="pages.contact.hours.sundayTime" mode={mode}>
                    {getCMSField(cmsData, 'pages.contact.hours.sundayTime', '8:00 AM - 9:00 PM')}
                  </Text>
                </Stack>
              </Stack>
            </Box>
          </Stack>
        </Box>

        {/* Contact Form */}
        <Box variant="elevated" padding="lg">
          <Stack spacing="lg">
            <H2 
              align="center"
              data-cms-id="pages.contact.form.title"
              mode={mode}
            >
              {getCMSField(cmsData, 'pages.contact.form.title', 'Send Us a Message')}
            </H2>
            
            <form>
              <Stack spacing="md">
                <Grid cols={2} gap="md" responsive>
                  <GridItem>
                    <Stack spacing="sm">
                      <Label htmlFor="name" data-cms-id="pages.contact.form.name.label" mode={mode}>
                        {getCMSField(cmsData, 'pages.contact.form.name.label', 'Full Name')}
                      </Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder={getCMSField(cmsData, 'pages.contact.form.name.placeholder', 'Enter your full name')}
                        data-cms-id="pages.contact.form.name.input"
                        fullWidth
                      />
                    </Stack>
                  </GridItem>
                  
                  <GridItem>
                    <Stack spacing="sm">
                      <Label htmlFor="email" data-cms-id="pages.contact.form.email.label" mode={mode}>
                        {getCMSField(cmsData, 'pages.contact.form.email.label', 'Email Address')}
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder={getCMSField(cmsData, 'pages.contact.form.email.placeholder', 'Enter your email')}
                        data-cms-id="pages.contact.form.email.input"
                        fullWidth
                      />
                    </Stack>
                  </GridItem>
                </Grid>
                
                <Stack spacing="sm">
                  <Label htmlFor="subject" data-cms-id="pages.contact.form.subject.label" mode={mode}>
                    {getCMSField(cmsData, 'pages.contact.form.subject.label', 'Subject')}
                  </Label>
                  <Input
                    id="subject"
                    type="text"
                    placeholder={getCMSField(cmsData, 'pages.contact.form.subject.placeholder', 'What is this about?')}
                    data-cms-id="pages.contact.form.subject.input"
                    fullWidth
                  />
                </Stack>
                
                <Stack spacing="sm">
                  <Label htmlFor="message" data-cms-id="pages.contact.form.message.label" mode={mode}>
                    {getCMSField(cmsData, 'pages.contact.form.message.label', 'Message')}
                  </Label>
                  <Textarea
                    id="message"
                    rows={5}
                    placeholder={getCMSField(cmsData, 'pages.contact.form.message.placeholder', 'Tell us how we can help you...')}
                    data-cms-id="pages.contact.form.message.textarea"
                    fullWidth
                  />
                </Stack>
                
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  size="lg"
                  data-cms-id="pages.contact.form.submit"
                >
                  {getCMSField(cmsData, 'pages.contact.form.submit', 'Send Message')}
                </Button>
              </Stack>
            </form>
          </Stack>
        </Box>

        {/* Emergency Contact */}
        <Box variant="elevated" padding="lg">
          <Stack spacing="lg">
            <H2 
              align="center"
              data-cms-id="pages.contact.emergency.title"
              mode={mode}
            >
              {getCMSField(cmsData, 'pages.contact.emergency.title', '🆘 Emergency Contact')}
            </H2>
            
            <Box variant="outlined" padding="md">
              <Stack spacing="md" align="center">
                <Text 
                  align="center"
                  data-cms-id="pages.contact.emergency.description"
                  mode={mode}
                >
                  {getCMSField(cmsData, 'pages.contact.emergency.description', 'For urgent matters or after-hours assistance')}
                </Text>
                <Text 
                  size="xl" 
                  weight="bold"
                  data-cms-id="pages.contact.emergency.phone"
                  mode={mode}
                >
                  {getCMSField(cmsData, 'pages.contact.emergency.phone', '📞 (203) 555-0123')}
                </Text>
                <Text 
                  size="sm" 
                  color="secondary"
                  data-cms-id="pages.contact.emergency.note"
                  mode={mode}
                >
                  {getCMSField(cmsData, 'pages.contact.emergency.note', 'Available 24/7 for urgent transportation needs')}
                </Text>
              </Stack>
            </Box>
          </Stack>
        </Box>
      </Stack>
    </Container>
  );
}
