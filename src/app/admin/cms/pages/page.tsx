"use client";

import { useEffect, useState } from "react";
import { cmsService } from "@/lib/cms-service";
import { CMSConfiguration, HomePageContent, HelpPageContent, PageContent } from "@/types/cms";
import { PageContainer, PageHeader, PageContent as LayoutPageContent } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import withAuth from "../../withAuth";

const PAGE_KEYS = [
  { key: "home", label: "Homepage" },
  { key: "help", label: "Help Page" },
  { key: "about", label: "About Page" },
  { key: "terms", label: "Terms of Service" },
  { key: "privacy", label: "Privacy Policy" },
];

type EditablePage = keyof CMSConfiguration["pages"];

type PageState = {
  [K in EditablePage]?: any;
};

const PagesCMS = () => {
  const [config, setConfig] = useState<CMSConfiguration | null>(null);
  const [pages, setPages] = useState<CMSConfiguration["pages"]>({
    home: {
      hero: { title: '', subtitle: '', ctaText: '' },
      features: { title: '', items: [] },
      about: { title: '', content: '' },
      contact: { title: '', content: '', phone: '', email: '' },
    },
    help: {
      faq: [],
      contactInfo: { phone: '', email: '', hours: '' },
    },
    about: { id: 'about', title: '', content: '', lastUpdated: new Date(), isActive: true },
    terms: { id: 'terms', title: '', content: '', lastUpdated: new Date(), isActive: true },
    privacy: { id: 'privacy', title: '', content: '', lastUpdated: new Date(), isActive: true },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadPages();
  }, []);

  const loadPages = async () => {
    setLoading(true);
    setError(null);
    try {
      const cmsConfig = await cmsService.getCMSConfiguration();
      // Ensure required pages are always present
      setConfig(cmsConfig);
      setPages({
        home: cmsConfig.pages.home || {
          hero: { title: '', subtitle: '', ctaText: '' },
          features: { title: '', items: [] },
          about: { title: '', content: '' },
          contact: { title: '', content: '', phone: '', email: '' },
        },
        help: cmsConfig.pages.help || {
          faq: [],
          contactInfo: { phone: '', email: '', hours: '' },
        },
        about: cmsConfig.pages.about || { id: 'about', title: '', content: '', lastUpdated: new Date(), isActive: true },
        terms: cmsConfig.pages.terms || { id: 'terms', title: '', content: '', lastUpdated: new Date(), isActive: true },
        privacy: cmsConfig.pages.privacy || { id: 'privacy', title: '', content: '', lastUpdated: new Date(), isActive: true },
      });
    } catch (e) {
      setError("Failed to load CMS content.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (page: EditablePage, field: string, value: any, subfield?: string) => {
    setPages((prev) => {
      const updated = { ...prev };
      if (!updated[page]) updated[page] = {};
      if (subfield) {
        updated[page][field][subfield] = value;
      } else {
        updated[page][field] = value;
      }
      return updated;
    });
  };

  const handleSave = async (page: EditablePage) => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await cmsService.updateCMSConfiguration({
        pages: {
          ...config?.pages,
          [page]: pages[page],
        },
      });
      setSuccess("Saved successfully!");
      setTimeout(() => setSuccess(null), 2000);
    } catch (e) {
      setError("Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <PageHeader title="Manage Page Content" />
        <LayoutPageContent>
          <div className="flex items-center justify-center h-64">Loading...</div>
        </LayoutPageContent>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader title="Manage Page Content" />
      <LayoutPageContent>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        {success && <div className="text-green-600 mb-4">{success}</div>}
        {PAGE_KEYS.map(({ key, label }) => {
          const page = pages[key as keyof typeof pages];
          if (!page) return null;
          // Type assertions for each page type
          if (key === "home") {
            const homePage = page as HomePageContent;
            return (
              <Card key={key} className="mb-8">
                <CardHeader>
                  <CardTitle>{label}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Label>Hero Title</Label>
                  <Input
                    value={homePage.hero.title}
                    onChange={(e) => handleChange("home", "hero", { ...homePage.hero, title: e.target.value })}
                  />
                  <Label>Hero Subtitle</Label>
                  <Input
                    value={homePage.hero.subtitle}
                    onChange={(e) => handleChange("home", "hero", { ...homePage.hero, subtitle: e.target.value })}
                  />
                  <Label>Hero CTA Text</Label>
                  <Input
                    value={homePage.hero.ctaText}
                    onChange={(e) => handleChange("home", "hero", { ...homePage.hero, ctaText: e.target.value })}
                  />
                  <Label>Features Title</Label>
                  <Input
                    value={homePage.features.title}
                    onChange={(e) => handleChange("home", "features", { ...homePage.features, title: e.target.value })}
                  />
                  {/* Features Items */}
                  {homePage.features.items.map((item: any, idx: number) => (
                    <div key={idx} className="border rounded p-2 mb-2">
                      <Label>Feature {idx + 1} Title</Label>
                      <Input
                        value={item.title}
                        onChange={(e) => {
                          const items = [...homePage.features.items];
                          items[idx] = { ...items[idx], title: e.target.value };
                          handleChange("home", "features", { ...homePage.features, items });
                        }}
                      />
                      <Label>Feature {idx + 1} Description</Label>
                      <Input
                        value={item.description}
                        onChange={(e) => {
                          const items = [...homePage.features.items];
                          items[idx] = { ...items[idx], description: e.target.value };
                          handleChange("home", "features", { ...homePage.features, items });
                        }}
                      />
                      <Label>Feature {idx + 1} Icon</Label>
                      <Input
                        value={item.icon}
                        onChange={(e) => {
                          const items = [...homePage.features.items];
                          items[idx] = { ...items[idx], icon: e.target.value };
                          handleChange("home", "features", { ...homePage.features, items });
                        }}
                      />
                    </div>
                  ))}
                  <Label>About Title</Label>
                  <Input
                    value={homePage.about.title}
                    onChange={(e) => handleChange("home", "about", { ...homePage.about, title: e.target.value })}
                  />
                  <Label>About Content</Label>
                  <Textarea
                    value={homePage.about.content}
                    onChange={(e) => handleChange("home", "about", { ...homePage.about, content: e.target.value })}
                  />
                  <Label>Contact Title</Label>
                  <Input
                    value={homePage.contact.title}
                    onChange={(e) => handleChange("home", "contact", { ...homePage.contact, title: e.target.value })}
                  />
                  <Label>Contact Content</Label>
                  <Textarea
                    value={homePage.contact.content}
                    onChange={(e) => handleChange("home", "contact", { ...homePage.contact, content: e.target.value })}
                  />
                  <Label>Contact Phone</Label>
                  <Input
                    value={homePage.contact.phone}
                    onChange={(e) => handleChange("home", "contact", { ...homePage.contact, phone: e.target.value })}
                  />
                  <Label>Contact Email</Label>
                  <Input
                    value={homePage.contact.email}
                    onChange={(e) => handleChange("home", "contact", { ...homePage.contact, email: e.target.value })}
                  />
                  <Button onClick={() => handleSave("home") } disabled={saving} className="mt-4">
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </CardContent>
              </Card>
            );
          }
          if (key === "help") {
            const helpPage = page as HelpPageContent;
            return (
              <Card key={key} className="mb-8">
                <CardHeader>
                  <CardTitle>{label}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Label>FAQ</Label>
                  {helpPage.faq.map((faq: any, idx: number) => (
                    <div key={idx} className="border rounded p-2 mb-2">
                      <Label>Question</Label>
                      <Input
                        value={faq.question}
                        onChange={(e) => {
                          const faqs = [...helpPage.faq];
                          faqs[idx] = { ...faqs[idx], question: e.target.value };
                          handleChange("help", "faq", faqs);
                        }}
                      />
                      <Label>Answer</Label>
                      <Textarea
                        value={faq.answer}
                        onChange={(e) => {
                          const faqs = [...helpPage.faq];
                          faqs[idx] = { ...faqs[idx], answer: e.target.value };
                          handleChange("help", "faq", faqs);
                        }}
                      />
                      <Label>Category</Label>
                      <Input
                        value={faq.category}
                        onChange={(e) => {
                          const faqs = [...helpPage.faq];
                          faqs[idx] = { ...faqs[idx], category: e.target.value };
                          handleChange("help", "faq", faqs);
                        }}
                      />
                    </div>
                  ))}
                  <Label>Contact Phone</Label>
                  <Input
                    value={helpPage.contactInfo.phone}
                    onChange={(e) => handleChange("help", "contactInfo", { ...helpPage.contactInfo, phone: e.target.value })}
                  />
                  <Label>Contact Email</Label>
                  <Input
                    value={helpPage.contactInfo.email}
                    onChange={(e) => handleChange("help", "contactInfo", { ...helpPage.contactInfo, email: e.target.value })}
                  />
                  <Label>Contact Hours</Label>
                  <Input
                    value={helpPage.contactInfo.hours}
                    onChange={(e) => handleChange("help", "contactInfo", { ...helpPage.contactInfo, hours: e.target.value })}
                  />
                  <Button onClick={() => handleSave("help") } disabled={saving} className="mt-4">
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </CardContent>
              </Card>
            );
          }
          // Generic PageContent fields
          const genericPage = page as PageContent;
          return (
            <Card key={key} className="mb-8">
              <CardHeader>
                <CardTitle>{label}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Label>Title</Label>
                <Input
                  value={genericPage.title || ""}
                  onChange={(e) => handleChange(key as EditablePage, "title", e.target.value)}
                />
                <Label>Content</Label>
                <Textarea
                  value={genericPage.content || ""}
                  onChange={(e) => handleChange(key as EditablePage, "content", e.target.value)}
                />
                <Label>Meta Description</Label>
                <Input
                  value={genericPage.metaDescription || ""}
                  onChange={(e) => handleChange(key as EditablePage, "metaDescription", e.target.value)}
                />
                <Button onClick={() => handleSave(key as EditablePage)} disabled={saving} className="mt-4">
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </LayoutPageContent>
    </PageContainer>
  );
};

export default withAuth(PagesCMS); 