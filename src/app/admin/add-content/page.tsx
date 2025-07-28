'use client';

import { useState } from 'react';
import { 
  AdminPageWrapper,
  Container,
  Stack,
  EditableText,
  InfoCard,
  GridSection,
  ActionButtonGroup
} from '@/components/ui';
import { ToastProvider, useToast } from '@/components/ui';

function AddContentPage() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);

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
    <AdminPageWrapper
      title="Content Management System"
      subtitle="Edit website content and business information"
    >
      <Container>
        <Stack spacing="lg">
          <InfoCard
            title="📝 Content Editing Guide"
            description="This is where you can edit all the text and content on your website. Choose a section below to get started."
          >
            <Container>
              <EditableText field="admin.cms.guide.description" defaultValue="To edit content on your website:">
                To edit content on your website:
              </EditableText>
              <Stack spacing="sm">
                <Container>1. Choose a section below that you want to edit</Container>
                <Container>2. Click the "Edit Content" button to go to that section</Container>
                <Container>3. Make your changes in the forms provided</Container>
                <Container>4. Click "Save Changes" to update your website</Container>
                <Container>5. Your changes will appear immediately on the live site</Container>
              </Stack>
            </Container>
          </InfoCard>

          <GridSection variant="content" columns={2}>
            {cmsPages.map((page, index) => (
              <InfoCard
                key={index}
                title={`${page.icon} ${page.title}`}
                description={page.description}
              >
                <Container>
                  <ActionButtonGroup
                    buttons={[{
                      label: "Edit Content",
                      onClick: () => handleNavigateToCMS(page.href),
                      variant: 'primary' as const,
                      icon: page.icon
                    }]}
                  />
                </Container>
              </InfoCard>
            ))}
          </GridSection>

          <InfoCard
            title="💡 Pro Tips"
            description="Best practices for content editing"
          >
            <Container>
              <Stack spacing="sm">
                <Container>• Keep content clear and concise for your customers</Container>
                <Container>• Test your changes by visiting the customer-facing pages</Container>
                <Container>• Update content regularly to keep information current</Container>
                <Container>• Use the "Edit Mode" button on customer pages for quick edits</Container>
              </Stack>
            </Container>
          </InfoCard>
        </Stack>
      </Container>
    </AdminPageWrapper>
  );
}

export default function AddContentPageWrapper() {
  return (
    <ToastProvider>
      <AddContentPage />
    </ToastProvider>
  );
} 