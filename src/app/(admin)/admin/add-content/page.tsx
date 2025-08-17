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

function AddContentPage() {
  const { cmsData } = useCMSData();
  const cmsPages = [
    {
      title: "🏠 Homepage Content",
      description: "Edit hero section, features, and main messaging",
      href: "/admin/cms/pages",
      icon: "🏠"
    },
    {
      title: "📅 Booking Form Content", 
      description: "Edit form labels, descriptions, and error messages",
      href: "/admin/cms/pages",
      icon: "📅"
    },
    {
      title: "❓ Help & FAQ Content",
      description: "Edit FAQ items, contact information, and support content",
      href: "/admin/cms/pages", 
      icon: "❓"
    },
    {
      title: "✅ Success Page Content",
      description: "Edit confirmation messages and next steps",
      href: "/admin/cms/pages",
      icon: "✅"
    },
    {
      title: "💼 Business Information",
      description: "Edit company details, contact info, and policies",
      href: "/admin/cms/business",
      icon: "💼"
    },
    {
      title: "💰 Pricing & Services",
      description: "Edit pricing, service areas, and fare calculations",
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
                <Text size="lg" weight="bold">📝 Content Editing Guide</Text>
                <Text variant="muted">This is where you can edit all the text and content on your website. Choose a section below to get started.</Text>
                {getCMSField(cmsData, 'admin.cms.guide.description', 'To edit content on your website:')}
                <Stack spacing="sm">
                  <Container>1. Choose a section below that you want to edit</Container>
                  <Container>2. Click the "Edit Content" button to go to that section</Container>
                  <Container>3. Make your changes in the forms provided</Container>
                  <Container>4. Click "Save Changes" to update your website</Container>
                  <Container>5. Your changes will appear immediately on the live site</Container>
                </Stack>
              </Stack>
            </Container>
          </Box>

          <GridSection variant="content" columns={2}>
            {cmsPages.map((page, index) => (
              <Box key={index}>
                <Container>
                  <Stack spacing="md">
                    <Text size="lg" weight="bold">{page.icon} {page.title}</Text>
                    <Text variant="muted">{page.description}</Text>
                    <Stack direction="horizontal" spacing="md" align="center">
                      <Button
                        variant="primary"
                        onClick={() => handleNavigateToCMS(page.href)}
                      >
                        {page.icon} Edit Content
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
                <Text size="lg" weight="bold">💡 Pro Tips</Text>
                <Text variant="muted">Best practices for content editing</Text>
                <Stack spacing="sm">
                  <Container>• Keep content clear and concise for your customers</Container>
                  <Container>• Test your changes by visiting the customer-facing pages</Container>
                  <Container>• Update content regularly to keep information current</Container>
                  <Container>• Use the "Edit Mode" button on customer pages for quick edits</Container>
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