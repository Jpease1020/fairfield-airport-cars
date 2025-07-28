"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { cmsService } from "@/lib/services/cms-service";
import { CMSConfiguration, HomePageContent, HelpPageContent, PageContent } from "@/types/cms";
import { 
  AdminPageWrapper,
  StatusMessage,
  ToastProvider,
  useToast,
  GridSection,
  InfoCard,
  Container,
  EditableText
} from "@/components/ui";
import { 
  GenericPageEditor,
  HomePageEditor,
  BookingPageEditor,
  HelpPageEditor
} from "@/components/cms/PageEditors";


const PAGE_KEYS = [
  { key: "home", label: "Homepage", icon: "🏠" },
  { key: "help", label: "Help Page", icon: "❓" },
  { key: "booking", label: "Booking Page", icon: "📅" },
  { key: "success", label: "Success Page", icon: "✅" },
  { key: "bookingDetails", label: "Booking Details Page", icon: "📋" },
  { key: "feedback", label: "Feedback Page", icon: "💬" },
  { key: "cancel", label: "Cancel Page", icon: "❌" },
  { key: "manage", label: "Manage Booking Page", icon: "⚙️" },
  { key: "status", label: "Status Page", icon: "📊" },
  { key: "about", label: "About Page", icon: "🏢" },
  { key: "terms", label: "Terms of Service", icon: "📜" },
  { key: "privacy", label: "Privacy Policy", icon: "🔒" },
];

type EditablePage = keyof CMSConfiguration["pages"];

function PagesCMSContent() {
  const { addToast } = useToast();
  const [config, setConfig] = useState<CMSConfiguration | null>(null);
  const [pages, setPages] = useState<CMSConfiguration["pages"]>({} as CMSConfiguration["pages"]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPages = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const cmsConfig = await cmsService.getCMSConfiguration();
      
      if (!cmsConfig) {
        setError("Failed to load CMS configuration.");
        return;
      }
      
      setConfig(cmsConfig);
      setPages(cmsConfig.pages);
      addToast('success', 'Pages loaded successfully');
    } catch {
      const errorMsg = "Failed to load CMS content.";
      setError(errorMsg);
      addToast('error', errorMsg);
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadPages();
  }, [loadPages]);

  const handlePageFieldChange = (page: EditablePage, field: string, value: any, subfield?: string) => {
    setPages((prev) => {
      const updated = { ...prev };
      
      if (!updated[page]) {
        updated[page] = {} as any;
      }
      
      if (subfield) {
        (updated[page] as any)[field] = {
          ...(updated[page] as any)[field],
          [subfield]: value
        };
      } else {
        (updated[page] as any)[field] = value;
      }
      
      return updated;
    });
  };

  const handleHomeSectionChange = (section: string, field: string, value: any) => {
    setPages((prev) => {
      const updated = { ...prev };
      if (!updated.home) updated.home = {} as HomePageContent;
      
      (updated.home as any)[section] = {
        ...(updated.home as any)[section],
        [field]: value
      };
      
      return updated;
    });
  };

  const handleHelpSectionChange = (section: string, value: any) => {
    setPages((prev) => {
      const updated = { ...prev };
      if (!updated.help) updated.help = {} as HelpPageContent;
      
      (updated.help as any)[section] = value;
      
      return updated;
    });
  };

  const handleSavePage = async (page: EditablePage) => {
    setSaving(true);
    setError(null);
    
    try {
      await cmsService.updateCMSConfiguration({
        pages: {
          ...(config?.pages || {}),
          [page]: pages[page],
        } as CMSConfiguration["pages"],
      });
      
      addToast('success', `${PAGE_KEYS.find(p => p.key === page)?.label} saved successfully!`);
    } catch {
      const errorMsg = "Failed to save changes.";
      setError(errorMsg);
      addToast('error', errorMsg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminPageWrapper
        title="Manage Page Content"
        subtitle="Loading page configurations..."
        loading={true}
        loadingMessage="Loading CMS page content..."
      >
        <Container>
          <EditableText field="admin.cms.pages.loading" defaultValue="Loading...">
            Loading...
          </EditableText>
        </Container>
      </AdminPageWrapper>
    );
  }

  return (
    <AdminPageWrapper
      title="Manage Page Content"
      subtitle="Edit website content and page configurations"
      loading={false}
      error={error}
      errorTitle="CMS Load Error"
    >
      {/* Error Message */}
      {error && (
        <StatusMessage 
          type="error" 
          message={error} 
          onDismiss={() => setError(null)} 
        />
      )}

      <GridSection variant="content" columns={1}>
        <Container>
          {PAGE_KEYS.map(({ key, label, icon }) => {
            const pageData = pages[key as keyof typeof pages];
            if (!pageData) return null;

            // Special handling for different page types
            if (key === "home") {
              return (
                <HomePageEditor
                  key={key}
                  pageData={pageData as HomePageContent}
                  onFieldChange={handleHomeSectionChange}
                  onSave={() => handleSavePage("home")}
                  saving={saving}
                />
              );
            }

            if (key === "help") {
              return (
                <HelpPageEditor
                  key={key}
                  pageData={pageData as HelpPageContent}
                  onFieldChange={handleHelpSectionChange}
                  onSave={() => handleSavePage("help")}
                  saving={saving}
                />
              );
            }

            if (key === "booking") {
              return (
                <BookingPageEditor
                  key={key}
                  pageData={pageData as { title: string; subtitle: string; description?: string }}
                  onFieldChange={(field, value) => handlePageFieldChange("booking", field, value)}
                  onSave={() => handleSavePage("booking")}
                  saving={saving}
                />
              );
            }

            // Generic pages (about, terms, privacy, etc.)
            if (['about', 'terms', 'privacy'].includes(key)) {
              return (
                <GenericPageEditor
                  key={key}
                  pageData={pageData as PageContent}
                  onFieldChange={(field, value) => handlePageFieldChange(key as EditablePage, field, value)}
                  onSave={() => handleSavePage(key as EditablePage)}
                  saving={saving}
                  pageTitle={label}
                />
              );
            }

            // For complex pages that need custom editors, show a placeholder for now
            return (
              <InfoCard
                key={key}
                title={`${icon} ${label}`}
                description="Custom editor for this page type coming soon..."
              >
                <Container>
                  <EditableText field="admin.cms.pages.customEditor" defaultValue="Custom editor for this page type coming soon...">
                    Custom editor for this page type coming soon...
                  </EditableText>
                </Container>
              </InfoCard>
            );
          })}
        </Container>
      </GridSection>
    </AdminPageWrapper>
  );
}

export default function PagesCMS() {
  return (
    <ToastProvider>
      <PagesCMSContent />
    </ToastProvider>
  );
}
