'use client';

import { 
  Container,
  Stack,
  Box,
  GridSection,
  Text,
  Button,
  ToastProvider,
} from '@/ui';
import { useCMSData, getCMSField } from '@/design/hooks/useCMSData';
import { useInteractionMode } from '@/design/providers/InteractionModeProvider';

function AddContentPage() {
  const { cmsData } = useCMSData();
  const { mode } = useInteractionMode();
  
  const cmsPages = [
    {
      title: getCMSField(cmsData, 'admin.addContent.sections.homepage.title', '🏠 Homepage Content'),
      description: getCMSField(cmsData, 'admin.addContent.sections.homepage.description', 'Edit hero section, features, and main messaging'),
      href: "/admin/cms/pages",
      icon: "🏠"
    },
    {
      title: getCMSField(cmsData, 'admin.addContent.sections.bookingForm.title', '📅 Booking Form Content'), 
      description: getCMSField(cmsData, 'admin.addContent.sections.bookingForm.description', 'Edit form labels, descriptions, and error messages'),
      href: "/admin/cms/pages", 
      icon: "📅"
    },
    {
      title: getCMSField(cmsData, 'admin.addContent.sections.help.title', '❓ Help & FAQ Content'),
      description: getCMSField(cmsData, 'admin.addContent.sections.help.description', 'Edit FAQ items, contact information, and support content'),
      href: "/admin/cms/pages", 
      icon: "❓"
    },
    {
      title: getCMSField(cmsData, 'admin.addContent.sections.success.title', '✅ Success Page Content'),
      description: getCMSField(cmsData, 'admin.addContent.sections.success.description', 'Edit confirmation messages and next steps'),
      href: "/admin/cms/pages",
      icon: "✅"
    },
    {
      title: getCMSField(cmsData, 'admin.addContent.sections.business.title', '💼 Business Information'),
      description: getCMSField(cmsData, 'admin.addContent.sections.business.description', 'Edit company details, contact info, and policies'),
      href: "/admin/cms/business",
      icon: "💼"
    },
    {
      title: getCMSField(cmsData, 'admin.addContent.sections.pricing.title', '💰 Pricing & Services'),
      description: getCMSField(cmsData, 'admin.addContent.sections.pricing.description', 'Edit pricing, service areas, and fare calculations'),
      href: "/admin/cms/pricing",
      icon: "💰"
    }
  ];

  const handleNavigateToCMS = (href: string) => {
    window.location.href = href;
  };

  return (
    <Container>
      <Stack spacing="lg">
        <Box>
          <Container>
            <Stack spacing="md">
              <Text size="lg" weight="bold" data-cms-id="admin.addContent.sections.guide.title" mode={mode}>
                {getCMSField(cmsData, 'admin.addContent.sections.guide.title', '📝 Content Editing Guide')}
              </Text>
              <Text variant="muted" data-cms-id="admin.addContent.sections.guide.description" mode={mode}>
                {getCMSField(cmsData, 'admin.addContent.sections.guide.description', 'This is where you can edit all the text and content on your website. Choose a section below to get started.')}
              </Text>
              <Text data-cms-id="admin.addContent.sections.guide.instructions" mode={mode}>
                {getCMSField(cmsData, 'admin.addContent.sections.guide.instructions', 'To edit content on your website:')}
              </Text>
              <Stack spacing="sm">
                <Container>
                  <Text data-cms-id="admin.addContent.sections.guide.step1" mode={mode}>
                    {getCMSField(cmsData, 'admin.addContent.sections.guide.step1', '1. Choose a section below that you want to edit')}
                  </Text>
                </Container>
                <Container>
                  <Text data-cms-id="admin.addContent.sections.guide.step2" mode={mode}>
                    {getCMSField(cmsData, 'admin.addContent.sections.guide.step2', '2. Click the "Edit Content" button to go to that section')}
                  </Text>
                </Container>
                <Container>
                  <Text data-cms-id="admin.addContent.sections.guide.step3" mode={mode}>
                    {getCMSField(cmsData, 'admin.addContent.sections.guide.step3', '3. Make your changes in the forms provided')}
                  </Text>
                </Container>
                <Container>
                  <Text data-cms-id="admin.addContent.sections.guide.step4" mode={mode}>
                    {getCMSField(cmsData, 'admin.addContent.sections.guide.step4', '4. Click "Save Changes" to update your website')}
                  </Text>
                </Container>
                <Container>
                  <Text data-cms-id="admin.addContent.sections.guide.step5" mode={mode}>
                    {getCMSField(cmsData, 'admin.addContent.sections.guide.step5', '5. Your changes will appear immediately on the live site')}
                  </Text>
                </Container>
              </Stack>
            </Stack>
          </Container>
        </Box>

        <GridSection variant="content" columns={2}>
          {cmsPages.map((page, index) => (
            <Box key={index}>
              <Container>
                <Stack spacing="md">
                  <Text size="lg" weight="bold" data-cms-id={`admin.addContent.sections.cmsPages.${index}.title`} mode={mode}>
                    {page.icon} {page.title}
                  </Text>
                  <Text variant="muted" data-cms-id={`admin.addContent.sections.cmsPages.${index}.description`} mode={mode}>
                    {page.description}
                  </Text>
                  <Stack direction="horizontal" spacing="md" align="center">
                    <Button
                      variant="primary"
                      onClick={() => handleNavigateToCMS(page.href)}
                      data-cms-id={`admin.addContent.sections.cmsPages.${index}.editButton`}
                      interactionMode={mode}
                    >
                      {page.icon} {getCMSField(cmsData, 'admin.addContent.sections.cmsPages.editButton', 'Edit Content')}
                    </Button>
                  </Stack>
                </Stack>
              </Container>
            </Box>
          ))}
        </GridSection>

        <Box>
          <Container>
            <Stack spacing="md">
              <Text size="lg" weight="bold" data-cms-id="admin.addContent.sections.proTips.title" mode={mode}>
                {getCMSField(cmsData, 'admin.addContent.sections.proTips.title', '💡 Pro Tips')}
              </Text>
              <Text variant="muted" data-cms-id="admin.addContent.sections.proTips.description" mode={mode}>
                {getCMSField(cmsData, 'admin.addContent.sections.proTips.description', 'Best practices for content editing')}
              </Text>
              <Stack spacing="sm">
                <Container>
                  <Text data-cms-id="admin.addContent.sections.proTips.tip1" mode={mode}>
                    {getCMSField(cmsData, 'admin.addContent.sections.proTips.tip1', '• Keep content clear and concise for your customers')}
                  </Text>
                </Container>
                <Container>
                  <Text data-cms-id="admin.addContent.sections.proTips.tip2" mode={mode}>
                    {getCMSField(cmsData, 'admin.addContent.sections.proTips.tip2', '• Test your changes by visiting the customer-facing pages')}
                  </Text>
                </Container>
                <Container>
                  <Text data-cms-id="admin.addContent.sections.proTips.tip3" mode={mode}>
                    {getCMSField(cmsData, 'admin.addContent.sections.proTips.tip3', '• Update content regularly to keep information current')}
                  </Text>
                </Container>
                <Container>
                  <Text data-cms-id="admin.addContent.sections.proTips.tip4" mode={mode}>
                    {getCMSField(cmsData, 'admin.addContent.sections.proTips.tip4', '• Use the "Edit Mode" button on customer pages for quick edits')}
                  </Text>
                </Container>
              </Stack>
            </Stack>
          </Container>
        </Box>
      </Stack>
    </Container>
  );
}

export default function AddContentPageWrapper() {
  return (
    <ToastProvider>
      <AddContentPage />
    </ToastProvider>
  );
} 