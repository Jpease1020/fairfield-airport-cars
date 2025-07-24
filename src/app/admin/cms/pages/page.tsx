"use client";

import { useEffect, useState } from "react";
import { cmsService } from "@/lib/services/cms-service";
import { CMSConfiguration, HomePageContent, HelpPageContent, PageContent } from "@/types/cms";
import { PageContainer, PageHeader, PageContent as LayoutPageContent } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import withAuth from "../../withAuth";

const PAGE_KEYS = [
  { key: "home", label: "Homepage" },
  { key: "help", label: "Help Page" },
  { key: "booking", label: "Booking Page" },
  { key: "success", label: "Success Page" },
  { key: "bookingDetails", label: "Booking Details Page" },
  { key: "feedback", label: "Feedback Page" },
  { key: "cancel", label: "Cancel Page" },
  { key: "manage", label: "Manage Booking Page" },
  { key: "status", label: "Status Page" },
  { key: "about", label: "About Page" },
  { key: "terms", label: "Terms of Service" },
  { key: "privacy", label: "Privacy Policy" },
];

type EditablePage = keyof CMSConfiguration["pages"];

// Removed unused PageState type

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
    booking: {
      title: 'Book Your Ride',
      subtitle: 'Premium airport transportation service',
      description: 'Reserve your luxury airport transportation with our professional drivers.'
    },
    success: {
      title: 'Payment Successful!',
      subtitle: 'Your booking has been confirmed',
      paymentSuccessTitle: 'Payment Processed',
      paymentSuccessMessage: 'Your payment has been successfully processed.',
      noBookingTitle: 'Payment Successful',
      noBookingMessage: 'No booking reference found, but your payment was processed.',
      currentStatusLabel: 'Current Status:',
      viewDetailsButton: 'View Detailed Status',
      loadingMessage: 'Loading your booking...'
    },
            bookingDetails: {
          title: 'Booking Confirmed!',
          subtitle: 'Your ride is booked successfully',
          successMessage: 'You will receive an SMS confirmation shortly. We will contact you if there are any issues.',
          payDepositButton: 'Pay Deposit',
          editBookingButton: 'Edit Booking',
          cancelBookingButton: 'Cancel Booking',
          cancelConfirmMessage: 'Are you sure you want to cancel this booking?',
          cancelSuccessMessage: 'Booking cancelled successfully.',
          paymentError: 'Failed to create payment link.',
          notFoundMessage: 'No booking found with the provided ID.',
          loadingMessage: 'Loading booking details...'
        },
        feedback: {
          title: 'Leave Feedback',
          subtitle: 'Help us improve our service',
          rateExperienceTitle: 'Rate Your Experience',
          rateExperienceDescription: 'How was your ride?',
          commentsTitle: 'Additional Comments',
          commentsLabel: 'Comments',
          commentsPlaceholder: 'Tell us about your experience...',
          submitButton: 'Submit Feedback',
          successTitle: 'Thank You!',
          successMessage: 'Your feedback is greatly appreciated and helps us improve our service.',
          errorNoRating: 'Please select a star rating.',
          errorSubmission: 'Sorry, there was an issue submitting your feedback. Please try again later.'
        },
                cancel: {
          title: 'Payment Canceled',
          subtitle: 'Your payment was not completed',
          errorTitle: 'Payment Canceled',
          errorMessage: 'Your payment was canceled. Please try again.'
        },
        manage: {
          title: 'Manage Your Booking',
          subtitle: 'Reference: {bookingId}',
          resendButton: 'Re-send Confirmation Email/SMS',
          cancelButton: 'Cancel Ride',
          payBalanceButton: 'Pay Remaining Balance',
          viewStatusButton: 'View Status Page',
          cancelConfirmMessage: 'Are you sure you want to cancel this ride? A cancellation fee may apply.',
          cancelSuccessMessage: 'Ride cancelled. You will receive a confirmation shortly.',
          resendSuccessMessage: 'Confirmation sent!',
          resendErrorMessage: 'Failed to send confirmation',
          payBalanceErrorMessage: 'Failed to create balance payment link',
          notFoundMessage: 'Booking not found',
          loadingMessage: 'Loading booking details...'
        },
        status: {
          title: 'Your Ride Status',
          subtitleLabel: 'Pickup Time:',
          stepPending: 'Pending',
          stepConfirmed: 'Confirmed',
          stepCompleted: 'Completed',
          statusPending: "We've received your booking and will confirm it shortly.",
          statusConfirmed: "Your ride is confirmed! We'll notify you when your driver is on the way.",
          statusCompleted: 'Your ride is complete. Thank you for choosing us!',
          statusCancelled: 'This booking has been cancelled.',
          alertCancelledTitle: 'Booking Cancelled',
          alertCancelledMessage: 'This booking has been cancelled.',
          alertNotFoundTitle: 'Booking Not Found',
          alertNotFoundMessage: 'No booking found with the provided ID.',
          alertErrorTitle: 'Error',
          alertErrorMessage: 'Failed to load booking status.',
          loadingMessage: 'Loading ride status...',
          liveDriverHeader: 'Live Driver Location'
        },
        about: { id: 'about', title: '', content: '', lastUpdated: new Date(), isActive: true },
        terms: { id: 'terms', title: '', content: '', lastUpdated: new Date(), isActive: true },
        privacy: { id: 'privacy', title: '', content: '', lastUpdated: new Date(), isActive: true },
  } as CMSConfiguration["pages"]);
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
      
      if (!cmsConfig) {
        setError("Failed to load CMS configuration.");
        return;
      }
      
      // Ensure required pages are always present
      setConfig(cmsConfig);
      
      setPages({
        home: cmsConfig.pages.home ?? {
          hero: { title: '', subtitle: '', ctaText: '' },
          features: { title: '', items: [] },
          about: { title: '', content: '' },
          contact: { title: '', content: '', phone: '', email: '' },
        },
        help: cmsConfig.pages.help ?? {
          faq: [],
          contactInfo: { phone: '', email: '', hours: '' },
        },
        booking: cmsConfig.pages.booking ?? {
          title: 'Book Your Ride',
          subtitle: 'Premium airport transportation service',
          description: 'Reserve your luxury airport transportation with our professional drivers.'
        },
        success: cmsConfig.pages.success ?? {
          title: 'Payment Successful!',
          subtitle: 'Your booking has been confirmed',
          paymentSuccessTitle: 'Payment Processed',
          paymentSuccessMessage: 'Your payment has been successfully processed.',
          noBookingTitle: 'Payment Successful',
          noBookingMessage: 'No booking reference found, but your payment was processed.',
          currentStatusLabel: 'Current Status:',
          viewDetailsButton: 'View Detailed Status',
          loadingMessage: 'Loading your booking...'
        },
        bookingDetails: cmsConfig.pages.bookingDetails ?? {
          title: 'Booking Confirmed!',
          subtitle: 'Your ride is booked successfully',
          successMessage: 'You will receive an SMS confirmation shortly. We will contact you if there are any issues.',
          payDepositButton: 'Pay Deposit',
          editBookingButton: 'Edit Booking',
          cancelBookingButton: 'Cancel Booking',
          cancelConfirmMessage: 'Are you sure you want to cancel this booking?',
          cancelSuccessMessage: 'Booking cancelled successfully.',
          paymentError: 'Failed to create payment link.',
          notFoundMessage: 'No booking found with the provided ID.',
          loadingMessage: 'Loading booking details...'
        },
        feedback: cmsConfig.pages.feedback ?? {
          title: 'Leave Feedback',
          subtitle: 'Help us improve our service',
          rateExperienceTitle: 'Rate Your Experience',
          rateExperienceDescription: 'How was your ride?',
          commentsTitle: 'Additional Comments',
          commentsLabel: 'Comments',
          commentsPlaceholder: 'Tell us about your experience...',
          submitButton: 'Submit Feedback',
          successTitle: 'Thank You!',
          successMessage: 'Your feedback is greatly appreciated and helps us improve our service.',
          errorNoRating: 'Please select a star rating.',
          errorSubmission: 'Sorry, there was an issue submitting your feedback. Please try again later.'
        },
        cancel: cmsConfig.pages.cancel ?? {
          title: 'Payment Canceled',
          subtitle: 'Your payment was not completed',
          errorTitle: 'Payment Canceled',
          errorMessage: 'Your payment was canceled. Please try again.'
        },
        manage: cmsConfig.pages.manage ?? {
          title: 'Manage Your Booking',
          subtitle: 'Reference: {bookingId}',
          resendButton: 'Re-send Confirmation Email/SMS',
          cancelButton: 'Cancel Ride',
          payBalanceButton: 'Pay Remaining Balance',
          viewStatusButton: 'View Status Page',
          cancelConfirmMessage: 'Are you sure you want to cancel this ride? A cancellation fee may apply.',
          cancelSuccessMessage: 'Ride cancelled. You will receive a confirmation shortly.',
          resendSuccessMessage: 'Confirmation sent!',
          resendErrorMessage: 'Failed to send confirmation',
          payBalanceErrorMessage: 'Failed to create balance payment link',
          notFoundMessage: 'Booking not found',
          loadingMessage: 'Loading booking details...'
        },
        status: cmsConfig.pages.status ?? {
          title: 'Your Ride Status',
          subtitleLabel: 'Pickup Time:',
          stepPending: 'Pending',
          stepConfirmed: 'Confirmed',
          stepCompleted: 'Completed',
          statusPending: "We've received your booking and will confirm it shortly.",
          statusConfirmed: "Your ride is confirmed! We'll notify you when your driver is on the way.",
          statusCompleted: 'Your ride is complete. Thank you for choosing us!',
          statusCancelled: 'This booking has been cancelled.',
          alertCancelledTitle: 'Booking Cancelled',
          alertCancelledMessage: 'This booking has been cancelled.',
          alertNotFoundTitle: 'Booking Not Found',
          alertNotFoundMessage: 'No booking found with the provided ID.',
          alertErrorTitle: 'Error',
          alertErrorMessage: 'Failed to load booking status.',
          loadingMessage: 'Loading ride status...',
          liveDriverHeader: 'Live Driver Location'
        },
        about: cmsConfig.pages.about ?? { id: 'about', title: '', content: '', lastUpdated: new Date(), isActive: true },
        terms: cmsConfig.pages.terms ?? { id: 'terms', title: '', content: '', lastUpdated: new Date(), isActive: true },
        privacy: cmsConfig.pages.privacy ?? { id: 'privacy', title: '', content: '', lastUpdated: new Date(), isActive: true },
      });
    } catch {
      setError("Failed to load CMS content.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (page: EditablePage, field: string, value: unknown, subfield?: string) => {
    setPages((prev) => {
      const updated = { ...prev };
      
      // Initialize page with proper defaults based on page type
      if (!updated[page]) {
        if (page === 'home') {
          updated[page] = {
            hero: { title: '', subtitle: '', ctaText: '' },
            features: { title: '', items: [] },
            about: { title: '', content: '' },
            contact: { title: '', content: '', phone: '', email: '' },
          };
        } else if (page === 'help') {
          updated[page] = {
            faq: [],
            contactInfo: { phone: '', email: '', hours: '' },
          };
        } else if (page === 'booking') {
          updated[page] = {
            title: 'Book Your Ride',
            subtitle: 'Premium airport transportation service',
            description: 'Reserve your luxury airport transportation with our professional drivers.'
          };
        } else if (page === 'success') {
          updated[page] = {
            title: 'Payment Successful!',
            subtitle: 'Your booking has been confirmed',
            paymentSuccessTitle: 'Payment Processed',
            paymentSuccessMessage: 'Your payment has been successfully processed.',
            noBookingTitle: 'Payment Successful',
            noBookingMessage: 'No booking reference found, but your payment was processed.',
            currentStatusLabel: 'Current Status:',
            viewDetailsButton: 'View Detailed Status',
            loadingMessage: 'Loading your booking...'
          };
        } else if (page === 'bookingDetails') {
          updated[page] = {
            title: 'Booking Confirmed!',
            subtitle: 'Your ride is booked successfully',
            successMessage: 'You will receive an SMS confirmation shortly. We will contact you if there are any issues.',
            payDepositButton: 'Pay Deposit',
            editBookingButton: 'Edit Booking',
            cancelBookingButton: 'Cancel Booking',
            cancelConfirmMessage: 'Are you sure you want to cancel this booking?',
            cancelSuccessMessage: 'Booking cancelled successfully.',
            paymentError: 'Failed to create payment link.',
            notFoundMessage: 'No booking found with the provided ID.',
            loadingMessage: 'Loading booking details...'
          };
        } else if (page === 'feedback') {
          updated[page] = {
            title: 'Leave Feedback',
            subtitle: 'Help us improve our service',
            rateExperienceTitle: 'Rate Your Experience',
            rateExperienceDescription: 'How was your ride?',
            commentsTitle: 'Additional Comments',
            commentsLabel: 'Comments',
            commentsPlaceholder: 'Tell us about your experience...',
            submitButton: 'Submit Feedback',
            successTitle: 'Thank You!',
            successMessage: 'Your feedback is greatly appreciated and helps us improve our service.',
            errorNoRating: 'Please select a star rating.',
            errorSubmission: 'Sorry, there was an issue submitting your feedback. Please try again later.'
          };
        } else if (page === 'cancel') {
          updated[page] = {
            title: 'Payment Canceled',
            subtitle: 'Your payment was not completed',
            errorTitle: 'Payment Canceled',
            errorMessage: 'Your payment was canceled. Please try again.'
          };
        } else if (page === 'manage') {
          updated[page] = {
            title: 'Manage Your Booking',
            subtitle: 'Reference: {bookingId}',
            resendButton: 'Re-send Confirmation Email/SMS',
            cancelButton: 'Cancel Ride',
            payBalanceButton: 'Pay Remaining Balance',
            viewStatusButton: 'View Status Page',
            cancelConfirmMessage: 'Are you sure you want to cancel this ride? A cancellation fee may apply.',
            cancelSuccessMessage: 'Ride cancelled. You will receive a confirmation shortly.',
            resendSuccessMessage: 'Confirmation sent!',
            resendErrorMessage: 'Failed to send confirmation',
            payBalanceErrorMessage: 'Failed to create balance payment link',
            notFoundMessage: 'Booking not found',
            loadingMessage: 'Loading booking details...'
          };
        } else if (page === 'status') {
          updated[page] = {
            title: 'Your Ride Status',
            subtitleLabel: 'Pickup Time:',
            stepPending: 'Pending',
            stepConfirmed: 'Confirmed',
            stepCompleted: 'Completed',
            statusPending: "We've received your booking and will confirm it shortly.",
            statusConfirmed: "Your ride is confirmed! We'll notify you when your driver is on the way.",
            statusCompleted: 'Your ride is complete. Thank you for choosing us!',
            statusCancelled: 'This booking has been cancelled.',
            alertCancelledTitle: 'Booking Cancelled',
            alertCancelledMessage: 'This booking has been cancelled.',
            alertNotFoundTitle: 'Booking Not Found',
            alertNotFoundMessage: 'No booking found with the provided ID.',
            alertErrorTitle: 'Error',
            alertErrorMessage: 'Failed to load booking status.',
            loadingMessage: 'Loading ride status...',
            liveDriverHeader: 'Live Driver Location'
          };
        } else {
          // For generic pages (about, terms, privacy)
          updated[page] = {
            id: page,
            title: '',
            content: '',
            lastUpdated: new Date(),
            isActive: true,
          };
        }
      }
      
      if (subfield) {
        (updated[page] as any)[field][subfield] = value;
      } else {
        (updated[page] as any)[field] = value;
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
          ...(config?.pages || {}),
          [page]: pages[page],
        } as CMSConfiguration["pages"],
      });
      setSuccess("Saved successfully!");
      setTimeout(() => setSuccess(null), 2000);
    } catch {
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
    <PageContainer className="bg-bg-secondary">
      <PageHeader title="Manage Page Content" />
      <LayoutPageContent>
        {error && <div className="text-error mb-4">{error}</div>}
        {success && <div className="text-success mb-4">{success}</div>}
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
                  
                  {/* Fleet Section */}
                  <div className="border-t pt-4 mt-4">
                    <h3 className="text-lg font-semibold mb-2">Fleet Section</h3>
                    <Label>Fleet Title</Label>
                    <Input
                      value={homePage.fleet?.title || ''}
                      onChange={(e) => handleChange("home", "fleet", { ...homePage.fleet, title: e.target.value })}
                    />
                    <Label>Fleet Description</Label>
                    <Textarea
                      value={homePage.fleet?.description || ''}
                      onChange={(e) => handleChange("home", "fleet", { ...homePage.fleet, description: e.target.value })}
                    />
                    {homePage.fleet?.vehicles?.map((vehicle: any, idx: number) => (
                      <div key={idx} className="border rounded p-2 mb-2">
                        <Label>Vehicle {idx + 1} Title</Label>
                        <Input
                          value={vehicle.title}
                          onChange={(e) => {
                            const vehicles = [...(homePage.fleet?.vehicles || [])];
                            vehicles[idx] = { ...vehicles[idx], title: e.target.value };
                            handleChange("home", "fleet", { ...homePage.fleet, vehicles });
                          }}
                        />
                        <Label>Vehicle {idx + 1} Description</Label>
                        <Textarea
                          value={vehicle.description}
                          onChange={(e) => {
                            const vehicles = [...(homePage.fleet?.vehicles || [])];
                            vehicles[idx] = { ...vehicles[idx], description: e.target.value };
                            handleChange("home", "fleet", { ...homePage.fleet, vehicles });
                          }}
                        />
                      </div>
                    ))}
                  </div>

                  {/* FAQ Section */}
                  <div className="border-t pt-4 mt-4">
                    <h3 className="text-lg font-semibold mb-2">FAQ Section</h3>
                    <Label>FAQ Title</Label>
                    <Input
                      value={homePage.faq?.title || ''}
                      onChange={(e) => handleChange("home", "faq", { ...homePage.faq, title: e.target.value })}
                    />
                    <Label>FAQ Subtitle</Label>
                    <Input
                      value={homePage.faq?.subtitle || ''}
                      onChange={(e) => handleChange("home", "faq", { ...homePage.faq, subtitle: e.target.value })}
                    />
                    {homePage.faq?.items?.map((item: any, idx: number) => (
                      <div key={idx} className="border rounded p-2 mb-2">
                        <Label>FAQ {idx + 1} Question</Label>
                        <Input
                          value={item.question}
                          onChange={(e) => {
                            const items = [...(homePage.faq?.items || [])];
                            items[idx] = { ...items[idx], question: e.target.value };
                            handleChange("home", "faq", { ...homePage.faq, items });
                          }}
                        />
                        <Label>FAQ {idx + 1} Answer</Label>
                        <Textarea
                          value={item.answer}
                          onChange={(e) => {
                            const items = [...(homePage.faq?.items || [])];
                            items[idx] = { ...items[idx], answer: e.target.value };
                            handleChange("home", "faq", { ...homePage.faq, items });
                          }}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Final CTA Section */}
                  <div className="border-t pt-4 mt-4">
                    <h3 className="text-lg font-semibold mb-2">Final CTA Section</h3>
                    <Label>CTA Title</Label>
                    <Input
                      value={homePage.finalCta?.title || ''}
                      onChange={(e) => handleChange("home", "finalCta", { ...homePage.finalCta, title: e.target.value })}
                    />
                    <Label>CTA Description</Label>
                    <Textarea
                      value={homePage.finalCta?.description || ''}
                      onChange={(e) => handleChange("home", "finalCta", { ...homePage.finalCta, description: e.target.value })}
                    />
                    <Label>CTA Button Text</Label>
                    <Input
                      value={homePage.finalCta?.buttonText || ''}
                      onChange={(e) => handleChange("home", "finalCta", { ...homePage.finalCta, buttonText: e.target.value })}
                    />
                  </div>

                  <Button onClick={() => handleSave("home") } disabled={saving} className="mt-4">
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </CardContent>
              </Card>
            );
          }
          
          if (key === "booking") {
            const bookingPage = page as { title: string; subtitle: string; description?: string };
            return (
              <Card key={key} className="mb-8">
                <CardHeader>
                  <CardTitle>{label}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Label>Page Title</Label>
                  <Input
                    value={bookingPage.title}
                    onChange={(e) => handleChange("booking", "title", e.target.value)}
                  />
                  <Label>Page Subtitle</Label>
                  <Input
                    value={bookingPage.subtitle}
                    onChange={(e) => handleChange("booking", "subtitle", e.target.value)}
                  />
                  <Label>Page Description</Label>
                  <Textarea
                    value={bookingPage.description || ''}
                    onChange={(e) => handleChange("booking", "description", e.target.value)}
                  />
                  <Button onClick={() => handleSave("booking") } disabled={saving} className="mt-4">
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
                      <Select
                        value={faq.category}
                        onValueChange={(value) => {
                          const faqs = [...helpPage.faq];
                          faqs[idx] = { ...faqs[idx], category: value as 'booking' | 'payment' | 'cancellation' | 'general' };
                          handleChange("help", "faq", faqs);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="booking">Booking</SelectItem>
                          <SelectItem value="payment">Payment</SelectItem>
                          <SelectItem value="cancellation">Cancellation</SelectItem>
                          <SelectItem value="general">General</SelectItem>
                        </SelectContent>
                      </Select>
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
          
          if (key === "success") {
            const successPage = page as any;
            return (
              <Card key={key} className="mb-8">
                <CardHeader>
                  <CardTitle>{label}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Label>Page Title</Label>
                  <Input
                    value={successPage.title || ''}
                    onChange={(e) => handleChange("success", "title", e.target.value)}
                  />
                  <Label>Page Subtitle</Label>
                  <Input
                    value={successPage.subtitle || ''}
                    onChange={(e) => handleChange("success", "subtitle", e.target.value)}
                  />
                  <Label>Payment Success Title</Label>
                  <Input
                    value={successPage.paymentSuccessTitle || ''}
                    onChange={(e) => handleChange("success", "paymentSuccessTitle", e.target.value)}
                  />
                  <Label>Payment Success Message</Label>
                  <Textarea
                    value={successPage.paymentSuccessMessage || ''}
                    onChange={(e) => handleChange("success", "paymentSuccessMessage", e.target.value)}
                  />
                  <Label>No Booking Title</Label>
                  <Input
                    value={successPage.noBookingTitle || ''}
                    onChange={(e) => handleChange("success", "noBookingTitle", e.target.value)}
                  />
                  <Label>No Booking Message</Label>
                  <Textarea
                    value={successPage.noBookingMessage || ''}
                    onChange={(e) => handleChange("success", "noBookingMessage", e.target.value)}
                  />
                  <Label>Current Status Label</Label>
                  <Input
                    value={successPage.currentStatusLabel || ''}
                    onChange={(e) => handleChange("success", "currentStatusLabel", e.target.value)}
                  />
                  <Label>View Details Button</Label>
                  <Input
                    value={successPage.viewDetailsButton || ''}
                    onChange={(e) => handleChange("success", "viewDetailsButton", e.target.value)}
                  />
                  <Label>Loading Message</Label>
                  <Input
                    value={successPage.loadingMessage || ''}
                    onChange={(e) => handleChange("success", "loadingMessage", e.target.value)}
                  />
                  <Button onClick={() => handleSave("success")} disabled={saving} className="mt-4">
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </CardContent>
              </Card>
            );
          }
          
          if (key === "bookingDetails") {
            const bookingDetailsPage = page as any;
            return (
              <Card key={key} className="mb-8">
                <CardHeader>
                  <CardTitle>{label}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Label>Page Title</Label>
                  <Input
                    value={bookingDetailsPage.title || ''}
                    onChange={(e) => handleChange("bookingDetails", "title", e.target.value)}
                  />
                  <Label>Page Subtitle</Label>
                  <Input
                    value={bookingDetailsPage.subtitle || ''}
                    onChange={(e) => handleChange("bookingDetails", "subtitle", e.target.value)}
                  />
                  <Label>Success Message</Label>
                  <Textarea
                    value={bookingDetailsPage.successMessage || ''}
                    onChange={(e) => handleChange("bookingDetails", "successMessage", e.target.value)}
                  />
                  <Label>Pay Deposit Button Text</Label>
                  <Input
                    value={bookingDetailsPage.payDepositButton || ''}
                    onChange={(e) => handleChange("bookingDetails", "payDepositButton", e.target.value)}
                  />
                  <Label>Edit Booking Button Text</Label>
                  <Input
                    value={bookingDetailsPage.editBookingButton || ''}
                    onChange={(e) => handleChange("bookingDetails", "editBookingButton", e.target.value)}
                  />
                  <Label>Cancel Booking Button Text</Label>
                  <Input
                    value={bookingDetailsPage.cancelBookingButton || ''}
                    onChange={(e) => handleChange("bookingDetails", "cancelBookingButton", e.target.value)}
                  />
                  <Label>Cancel Confirm Message</Label>
                  <Input
                    value={bookingDetailsPage.cancelConfirmMessage || ''}
                    onChange={(e) => handleChange("bookingDetails", "cancelConfirmMessage", e.target.value)}
                  />
                  <Label>Cancel Success Message</Label>
                  <Input
                    value={bookingDetailsPage.cancelSuccessMessage || ''}
                    onChange={(e) => handleChange("bookingDetails", "cancelSuccessMessage", e.target.value)}
                  />
                  <Label>Payment Error Message</Label>
                  <Input
                    value={bookingDetailsPage.paymentError || ''}
                    onChange={(e) => handleChange("bookingDetails", "paymentError", e.target.value)}
                  />
                  <Label>Not Found Message</Label>
                  <Input
                    value={bookingDetailsPage.notFoundMessage || ''}
                    onChange={(e) => handleChange("bookingDetails", "notFoundMessage", e.target.value)}
                  />
                  <Label>Loading Message</Label>
                  <Input
                    value={bookingDetailsPage.loadingMessage || ''}
                    onChange={(e) => handleChange("bookingDetails", "loadingMessage", e.target.value)}
                  />
                  <Button onClick={() => handleSave("bookingDetails")} disabled={saving} className="mt-4">
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </CardContent>
              </Card>
            );
          }
          
          if (key === "feedback") {
            const feedbackPage = page as any;
            return (
              <Card key={key} className="mb-8">
                <CardHeader>
                  <CardTitle>{label}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Label>Page Title</Label>
                  <Input
                    value={feedbackPage.title || ''}
                    onChange={(e) => handleChange("feedback", "title", e.target.value)}
                  />
                  <Label>Page Subtitle</Label>
                  <Input
                    value={feedbackPage.subtitle || ''}
                    onChange={(e) => handleChange("feedback", "subtitle", e.target.value)}
                  />
                  <Label>Rate Experience Title</Label>
                  <Input
                    value={feedbackPage.rateExperienceTitle || ''}
                    onChange={(e) => handleChange("feedback", "rateExperienceTitle", e.target.value)}
                  />
                  <Label>Rate Experience Description</Label>
                  <Input
                    value={feedbackPage.rateExperienceDescription || ''}
                    onChange={(e) => handleChange("feedback", "rateExperienceDescription", e.target.value)}
                  />
                  <Label>Comments Title</Label>
                  <Input
                    value={feedbackPage.commentsTitle || ''}
                    onChange={(e) => handleChange("feedback", "commentsTitle", e.target.value)}
                  />
                  <Label>Comments Label</Label>
                  <Input
                    value={feedbackPage.commentsLabel || ''}
                    onChange={(e) => handleChange("feedback", "commentsLabel", e.target.value)}
                  />
                  <Label>Comments Placeholder</Label>
                  <Input
                    value={feedbackPage.commentsPlaceholder || ''}
                    onChange={(e) => handleChange("feedback", "commentsPlaceholder", e.target.value)}
                  />
                  <Label>Submit Button Text</Label>
                  <Input
                    value={feedbackPage.submitButton || ''}
                    onChange={(e) => handleChange("feedback", "submitButton", e.target.value)}
                  />
                  <Label>Success Title</Label>
                  <Input
                    value={feedbackPage.successTitle || ''}
                    onChange={(e) => handleChange("feedback", "successTitle", e.target.value)}
                  />
                  <Label>Success Message</Label>
                  <Textarea
                    value={feedbackPage.successMessage || ''}
                    onChange={(e) => handleChange("feedback", "successMessage", e.target.value)}
                  />
                  <Label>Error - No Rating</Label>
                  <Input
                    value={feedbackPage.errorNoRating || ''}
                    onChange={(e) => handleChange("feedback", "errorNoRating", e.target.value)}
                  />
                  <Label>Error - Submission Failed</Label>
                  <Input
                    value={feedbackPage.errorSubmission || ''}
                    onChange={(e) => handleChange("feedback", "errorSubmission", e.target.value)}
                  />
                  <Button onClick={() => handleSave("feedback")} disabled={saving} className="mt-4">
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </CardContent>
              </Card>
            );
          }
          
          if (key === "cancel") {
            const cancelPage = page as any;
            return (
              <Card key={key} className="mb-8">
                <CardHeader>
                  <CardTitle>{label}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Label>Page Title</Label>
                  <Input
                    value={cancelPage.title || ''}
                    onChange={(e) => handleChange("cancel", "title", e.target.value)}
                  />
                  <Label>Page Subtitle</Label>
                  <Input
                    value={cancelPage.subtitle || ''}
                    onChange={(e) => handleChange("cancel", "subtitle", e.target.value)}
                  />
                  <Label>Error Title</Label>
                  <Input
                    value={cancelPage.errorTitle || ''}
                    onChange={(e) => handleChange("cancel", "errorTitle", e.target.value)}
                  />
                  <Label>Error Message</Label>
                  <Textarea
                    value={cancelPage.errorMessage || ''}
                    onChange={(e) => handleChange("cancel", "errorMessage", e.target.value)}
                  />
                  <Button onClick={() => handleSave("cancel")} disabled={saving} className="mt-4">
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </CardContent>
              </Card>
            );
          }
          
          if (key === "manage") {
            const managePage = page as any;
            return (
              <Card key={key} className="mb-8">
                <CardHeader>
                  <CardTitle>{label}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Label>Page Title</Label>
                  <Input
                    value={managePage.title || ''}
                    onChange={(e) => handleChange("manage", "title", e.target.value)}
                  />
                  <Label>Page Subtitle</Label>
                  <Input
                    value={managePage.subtitle || ''}
                    onChange={(e) => handleChange("manage", "subtitle", e.target.value)}
                  />
                  <Label>Re-send Button Text</Label>
                  <Input
                    value={managePage.resendButton || ''}
                    onChange={(e) => handleChange("manage", "resendButton", e.target.value)}
                  />
                  <Label>Cancel Button Text</Label>
                  <Input
                    value={managePage.cancelButton || ''}
                    onChange={(e) => handleChange("manage", "cancelButton", e.target.value)}
                  />
                  <Label>Pay Balance Button Text</Label>
                  <Input
                    value={managePage.payBalanceButton || ''}
                    onChange={(e) => handleChange("manage", "payBalanceButton", e.target.value)}
                  />
                  <Label>View Status Button Text</Label>
                  <Input
                    value={managePage.viewStatusButton || ''}
                    onChange={(e) => handleChange("manage", "viewStatusButton", e.target.value)}
                  />
                  <Label>Cancel Confirm Message</Label>
                  <Textarea
                    value={managePage.cancelConfirmMessage || ''}
                    onChange={(e) => handleChange("manage", "cancelConfirmMessage", e.target.value)}
                  />
                  <Label>Cancel Success Message</Label>
                  <Input
                    value={managePage.cancelSuccessMessage || ''}
                    onChange={(e) => handleChange("manage", "cancelSuccessMessage", e.target.value)}
                  />
                  <Label>Re-send Success Message</Label>
                  <Input
                    value={managePage.resendSuccessMessage || ''}
                    onChange={(e) => handleChange("manage", "resendSuccessMessage", e.target.value)}
                  />
                  <Label>Re-send Error Message</Label>
                  <Input
                    value={managePage.resendErrorMessage || ''}
                    onChange={(e) => handleChange("manage", "resendErrorMessage", e.target.value)}
                  />
                  <Label>Pay Balance Error Message</Label>
                  <Input
                    value={managePage.payBalanceErrorMessage || ''}
                    onChange={(e) => handleChange("manage", "payBalanceErrorMessage", e.target.value)}
                  />
                  <Label>Not Found Message</Label>
                  <Input
                    value={managePage.notFoundMessage || ''}
                    onChange={(e) => handleChange("manage", "notFoundMessage", e.target.value)}
                  />
                  <Label>Loading Message</Label>
                  <Input
                    value={managePage.loadingMessage || ''}
                    onChange={(e) => handleChange("manage", "loadingMessage", e.target.value)}
                  />
                  <Button onClick={() => handleSave("manage")} disabled={saving} className="mt-4">
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </CardContent>
              </Card>
            );
          }
          
          if (key === "status") {
            const statusPage = page as any;
            return (
              <Card key={key} className="mb-8">
                <CardHeader>
                  <CardTitle>{label}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Label>Page Title</Label>
                  <Input
                    value={statusPage.title || ''}
                    onChange={(e) => handleChange("status", "title", e.target.value)}
                  />
                  <Label>Subtitle Label</Label>
                  <Input
                    value={statusPage.subtitleLabel || ''}
                    onChange={(e) => handleChange("status", "subtitleLabel", e.target.value)}
                  />
                  <Label>Step: Pending</Label>
                  <Input
                    value={statusPage.stepPending || ''}
                    onChange={(e) => handleChange("status", "stepPending", e.target.value)}
                  />
                  <Label>Step: Confirmed</Label>
                  <Input
                    value={statusPage.stepConfirmed || ''}
                    onChange={(e) => handleChange("status", "stepConfirmed", e.target.value)}
                  />
                  <Label>Step: Completed</Label>
                  <Input
                    value={statusPage.stepCompleted || ''}
                    onChange={(e) => handleChange("status", "stepCompleted", e.target.value)}
                  />
                  <Label>Status Description: Pending</Label>
                  <Textarea
                    value={statusPage.statusPending || ''}
                    onChange={(e) => handleChange("status", "statusPending", e.target.value)}
                  />
                  <Label>Status Description: Confirmed</Label>
                  <Textarea
                    value={statusPage.statusConfirmed || ''}
                    onChange={(e) => handleChange("status", "statusConfirmed", e.target.value)}
                  />
                  <Label>Status Description: Completed</Label>
                  <Textarea
                    value={statusPage.statusCompleted || ''}
                    onChange={(e) => handleChange("status", "statusCompleted", e.target.value)}
                  />
                  <Label>Status Description: Cancelled</Label>
                  <Textarea
                    value={statusPage.statusCancelled || ''}
                    onChange={(e) => handleChange("status", "statusCancelled", e.target.value)}
                  />
                  <Label>Alert: Cancelled Title</Label>
                  <Input
                    value={statusPage.alertCancelledTitle || ''}
                    onChange={(e) => handleChange("status", "alertCancelledTitle", e.target.value)}
                  />
                  <Label>Alert: Cancelled Message</Label>
                  <Textarea
                    value={statusPage.alertCancelledMessage || ''}
                    onChange={(e) => handleChange("status", "alertCancelledMessage", e.target.value)}
                  />
                  <Label>Alert: Not Found Title</Label>
                  <Input
                    value={statusPage.alertNotFoundTitle || ''}
                    onChange={(e) => handleChange("status", "alertNotFoundTitle", e.target.value)}
                  />
                  <Label>Alert: Not Found Message</Label>
                  <Textarea
                    value={statusPage.alertNotFoundMessage || ''}
                    onChange={(e) => handleChange("status", "alertNotFoundMessage", e.target.value)}
                  />
                  <Label>Alert: Error Title</Label>
                  <Input
                    value={statusPage.alertErrorTitle || ''}
                    onChange={(e) => handleChange("status", "alertErrorTitle", e.target.value)}
                  />
                  <Label>Alert: Error Message</Label>
                  <Textarea
                    value={statusPage.alertErrorMessage || ''}
                    onChange={(e) => handleChange("status", "alertErrorMessage", e.target.value)}
                  />
                  <Label>Loading Message</Label>
                  <Input
                    value={statusPage.loadingMessage || ''}
                    onChange={(e) => handleChange("status", "loadingMessage", e.target.value)}
                  />
                  <Label>Live Driver Header</Label>
                  <Input
                    value={statusPage.liveDriverHeader || ''}
                    onChange={(e) => handleChange("status", "liveDriverHeader", e.target.value)}
                  />
                  <Button onClick={() => handleSave("status")} disabled={saving} className="mt-4">
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