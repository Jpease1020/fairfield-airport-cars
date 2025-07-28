import React from 'react';
import { Container, H2, H3, EditableText } from '@/components/ui';
import { Link } from '@/components/ui/text';
import { Section, Stack } from '@/components/ui/containers';
import { Text } from '@/components/ui/text';
import { CMSLayout } from './CMSLayout';
import { PageHeader } from '../structure/PageHeader';
import { CMSConfiguration } from '@/types/cms';

interface CMSContentPageProps {
  cmsConfig: CMSConfiguration;
  pageType: keyof CMSConfiguration['pages'];
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  description?: string;
  showTableOfContents?: boolean;
  showRelatedLinks?: boolean;
  containerMaxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

export const CMSContentPage: React.FC<CMSContentPageProps> = ({
  cmsConfig,
  pageType,
  children,
  title,
  subtitle,
  description,
  showTableOfContents = false,
  showRelatedLinks = false,
  containerMaxWidth = 'xl'
}) => {
  const pageContent = cmsConfig.pages[pageType];

  // Get page-specific content
  const pageTitle = title || (pageContent && 'title' in pageContent ? pageContent.title : '');
  const pageSubtitle = subtitle || (pageContent && 'subtitle' in pageContent ? pageContent.subtitle : '');
  const pageDescription = description || (pageContent && 'description' in pageContent ? pageContent.description : '');
  
  return (
          <CMSLayout 
        cmsConfig={cmsConfig} 
        pageType={pageType} 
        variant="content"
      >
      {/* Header Section */}
      <Section variant="default" padding="xl">
        <Container maxWidth={containerMaxWidth}>
          <PageHeader title={pageTitle || "Page Header"}>
            {pageSubtitle && (
              <Text>
                <EditableText field="cmsContentPage.pageSubtitle" defaultValue={pageSubtitle}>
                  {pageSubtitle}
                </EditableText>
              </Text>
            )}
            {pageDescription && (
              <Text>
                <EditableText field="cmsContentPage.pageDescription" defaultValue={pageDescription}>
                  {pageDescription}
                </EditableText>
              </Text>
            )}
          </PageHeader>
        </Container>
      </Section>

      {/* Main Content */}
      <Section padding="xl">
        <Container maxWidth={containerMaxWidth}>
          <Stack direction="horizontal" spacing="xl">
            {/* Table of Contents */}
            {showTableOfContents && (
              <Container>
                <H3>
                  <EditableText field="cmsContentPage.onThisPage" defaultValue="On This Page">
                    On This Page
                  </EditableText>
                </H3>
                <Stack spacing="sm" direction="vertical">
                  <Link href="#overview">
                    <EditableText field="cmsContentPage.overview" defaultValue="Overview">
                      Overview
                    </EditableText>
                  </Link>
                  <Link href="#details">
                    <EditableText field="cmsContentPage.details" defaultValue="Details">
                      Details
                    </EditableText>
                  </Link>
                  <Link href="#contact">
                    <EditableText field="cmsContentPage.contact" defaultValue="Contact">
                      Contact
                    </EditableText>
                  </Link>
                </Stack>
              </Container>
            )}

            {/* Main Content */}
            <Container>
              {children}
            </Container>
          </Stack>
        </Container>
      </Section>

      {/* Related Links Section */}
      {showRelatedLinks && (
        <Section variant="muted" padding="xl">
          <Container maxWidth={containerMaxWidth} spacing="lg">
              <H2>
                <EditableText field="cmsContentPage.relatedInformation" defaultValue="Related Information">
                  Related Information
                </EditableText>
              </H2>
              <Text>
                <EditableText field="cmsContentPage.relatedInformationDescription" defaultValue="Find more helpful resources and information">
                  Find more helpful resources and information
                </EditableText>
              </Text>
              
              <Stack direction="horizontal" spacing="lg">
                <Container>
                  <H3>
                    <EditableText field="cmsContentPage.bookingInformation" defaultValue="Booking Information">
                      Booking Information
                    </EditableText>
                  </H3>
                  <Text>
                    <EditableText field="cmsContentPage.bookingInformationDescription" defaultValue="Learn about our booking process, policies, and what to expect.">
                      Learn about our booking process, policies, and what to expect.
                    </EditableText>
                  </Text>
                  <Link href="/book">
                    <EditableText field="cmsContentPage.bookYourRide" defaultValue="Book Your Ride →">
                      Book Your Ride →
                    </EditableText>
                  </Link>
                </Container>
                
                <Container>
                  <H3>
                    <EditableText field="cmsContentPage.serviceAreas" defaultValue="Service Areas">
                      Service Areas
                    </EditableText>
                  </H3>
                  <Text>
                    <EditableText field="cmsContentPage.serviceAreasDescription" defaultValue="See all the airports and areas we serve in the region.">
                      See all the airports and areas we serve in the region.
                    </EditableText>
                  </Text>
                  <Link href="/about">
                    <EditableText field="cmsContentPage.viewServiceAreas" defaultValue="View Service Areas →">
                      View Service Areas →
                    </EditableText>
                  </Link>
                </Container>
                
                <Container>
                  <H3>
                    <EditableText field="cmsContentPage.contactSupport" defaultValue="Contact Support">
                      Contact Support
                    </EditableText>
                  </H3>
                  <Text>
                    <EditableText field="cmsContentPage.contactSupportDescription" defaultValue="Need help? Our support team is available 24/7.">
                      Need help? Our support team is available 24/7.
                    </EditableText>
                  </Text>
                  <Link href="/help">
                    <EditableText field="cmsContentPage.getHelp" defaultValue="Get Help →">
                      Get Help →
                    </EditableText>
                  </Link>
                </Container>
              </Stack>
            </Container>
        </Section>
      )}
    </CMSLayout>
  );
};

CMSContentPage.displayName = 'CMSContentPage'; 