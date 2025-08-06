'use client';

import { useState } from 'react';
import { cmsService } from '@/lib/services/cms-service';
import { 
  Container,
  Button,
  Stack,
  StatusMessage,
  Box,
  Text,
  ToastProvider,
  useToast,
  EditableText
} from '@/ui';
import { AdminPageWrapper } from '@/components/app';

function AddContentUtilityPage() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const missingContent = {
    pages: {
      success: {
        title: "🎉 Booking Confirmed!",
        subtitle: "Your booking is confirmed",
        paymentSuccessTitle: "✅ Payment Successful!",
        paymentSuccessMessage: "Your deposit has been processed and your ride is confirmed",
        paymentSuccessSubtitle: "Payment successful - You're all set!",
        bookingCreatedTitle: "📝 Booking Created!",
        bookingCreatedMessage: "Your booking has been created. Payment can be completed before your ride",
        noBookingTitle: "⚠️ Error Loading Booking",
        noBookingMessage: "Please try refreshing the page or contact support if the problem persists.",
        currentStatusLabel: "Current Status",
        viewDetailsButton: "View My Booking",
        loadingMessage: "Loading your booking details...",
        loadingTitle: "Loading...",
        loadingSubtitle: "Please wait while we load your booking details",
        errorTitle: "⚠️ Error Loading Booking",
        errorMessage: "Please try refreshing the page or contact support if the problem persists.",
        tripDetailsTitle: "Trip Details",
        tripDetailsDescription: "Your journey information",
        paymentStatusTitle: "💰 Payment Status",
        paymentStatusDescription: "Your payment information",
        nextStepsTitle: "📋 What Happens Next?",
        nextStepsDescription: "Here's what you can expect from us",
        nextSteps: {
          title: "📋 What Happens Next?",
          description: "Here's what you can expect from us",
          items: [
            "📧 You'll receive a confirmation email with all booking details",
            "📱 We'll send you SMS updates about your driver and pickup time",
            "👨‍💼 Your driver will contact you 30 minutes before pickup",
            "✈️ We monitor your flight for any delays or changes"
          ]
        },
        emergencyContact: {
          title: "🆘 Need Help?",
          description: "Contact us anytime if you have questions or need to make changes",
          phone: "📞 (203) 555-0123",
          message: "Save this number! Our drivers are available to assist you."
        }
      },
      help: {
        title: "Help & Support",
        subtitle: "We're here to help",
        description: "Find answers to common questions and get support when you need it.",
        sections: [
          {
            title: "Booking Help",
            content: "Learn how to book, modify, or cancel your ride"
          },
          {
            title: "Payment Support",
            content: "Get help with payments, refunds, and billing"
          },
          {
            title: "Service Information",
            content: "Learn about our vehicles, drivers, and service areas"
          },
          {
            title: "Airport Transportation",
            content: "Specialized airport pickup and drop-off services"
          },
          {
            title: "App Support",
            content: "Help with our mobile app and online booking"
          },
          {
            title: "Emergency Support",
            content: "24/7 emergency assistance and urgent changes"
          }
        ],
        faq: [
          {
            question: "How far in advance should I book?",
            answer: "We recommend booking at least 24 hours in advance, especially during peak travel seasons.",
            category: "booking" as const
          },
          {
            question: "What payment methods do you accept?",
            answer: "We accept all major credit cards, debit cards, and cash payments.",
            category: "payment" as const
          },
          {
            question: "Can I cancel my booking?",
            answer: "Yes, you can cancel up to 4 hours before your scheduled pickup time for a full refund.",
            category: "cancellation" as const
          },
          {
            question: "Do you track flights?",
            answer: "Yes, we monitor flight schedules and adjust pickup times accordingly for airport departures.",
            category: "general" as const
          }
        ],
        contactInfo: {
          phone: "(203) 555-0123",
          email: "support@fairfieldairportcars.com",
          hours: "24/7"
        },
        contactSection: {
          title: "📞 Still Need Help?",
          description: "Contact our support team for personalized assistance",
          callButtonText: "Call Support",
          textButtonText: "Send Message"
        }
      }
    },
    bookingForm: {
      // Section descriptions
      personalInfoDescription: "Please provide your contact details for the booking",
      tripDetailsDescription: "Tell us where you need to go and when",
      additionalDetailsDescription: "Help us provide the best service for your trip",
      actionButtonsDescription: "Calculate your fare and complete your booking",

      // Form descriptions
      fullNameDescription: "Your complete name as it appears on ID",
      emailDescription: "We'll send your booking confirmation here",
      phoneDescription: "Your driver will contact you on this number",
      pickupLocationDescription: "Where should we pick you up?",
      dropoffLocationDescription: "Where are you going?",
      pickupDateTimeDescription: "When do you need to be picked up?",
      passengersDescription: "Number of people traveling",
      flightNumberDescription: "We'll track your flight for delays",
      notesDescription: "Let us know about any special requirements",

      // Placeholders
      fullNamePlaceholder: "Enter your full name",
      emailPlaceholder: "Enter your email",
      phonePlaceholder: "(123) 456-7890",
      pickupLocationPlaceholder: "Enter pickup address",
      dropoffLocationPlaceholder: "Enter destination address",
      notesPlaceholder: "Any special instructions or requests?",
      flightNumberPlaceholder: "AA1234",

      // Additional error messages
      errorLoadLocations: "Location autocomplete temporarily unavailable",
      errorEnterLocations: "Please enter both pickup and destination locations",
      errorCalculateFare: "Failed to calculate fare. Please try again.",
      errorCalculateBeforeBooking: "Please calculate the fare before booking",
      errorTimeConflict: "This time slot is not available. Please select a different time.",
      errorUpdateBooking: "Failed to update booking. Please try again.",
      errorCreateBooking: "Failed to create booking. Please try again.",
      successBookingUpdated: "Booking updated successfully!",
      successBookingCreated: "Booking created successfully!"
    }
  };

  const handleAddContent = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Get current CMS configuration
      const currentConfig = await cmsService.getCMSConfiguration();
      
      if (!currentConfig) {
        throw new Error('No CMS configuration found');
      }

      // Merge the missing content with existing content
      const updatedConfig = {
        ...currentConfig,
        pages: {
          ...currentConfig.pages,
          ...missingContent.pages
        },
        bookingForm: {
          ...currentConfig.bookingForm,
          ...missingContent.bookingForm
        }
      };

      // Save to database
      const result = await cmsService.updateCMSConfiguration(updatedConfig);
      
      if (result.success) {
        setSuccess('Successfully added missing content to the database!');
        addToast('success', 'Content added successfully');
      } else {
        throw new Error(result.errors?.join(', ') || 'Failed to save content');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add content';
      setError(errorMessage);
      addToast('error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminPageWrapper
      title="Add Missing Content (Utility)"
      subtitle="Add missing content to the database - Use this only when needed"
    >
      <Container>
        <Stack spacing="lg">
          <Box>
            <Container>
              <Stack spacing="md">
                <Text size="lg" weight="bold">⚠️ Utility Tool</Text>
                <Text variant="muted">This is a utility tool to add missing content. For regular content editing, use the main CMS interface.</Text>
                <EditableText field="admin.addContent.utility.description" defaultValue="This tool will add missing content to the database, including:">
                  This tool will add missing content to the database, including:
                </EditableText>
                <Stack spacing="sm">
                  <Container>• Success page messages and titles</Container>
                  <Container>• Help page sections and FAQ</Container>
                  <Container>• Booking form descriptions and placeholders</Container>
                  <Container>• Error messages and success messages</Container>
                </Stack>
              </Stack>
            </Container>
          </Box>
          
          {error && (
            <StatusMessage 
              type="error" 
              message={error} 
              onDismiss={() => setError(null)} 
            />
          )}
          
          {success && (
            <StatusMessage 
              type="success" 
              message={success} 
              onDismiss={() => setSuccess(null)} 
            />
          )}
          
          <Button
            onClick={handleAddContent}
            disabled={loading}
            variant="primary"
          >
            <EditableText field="admin.addContent.utility.button" defaultValue={loading ? 'Adding Content...' : 'Add Missing Content'}>
              {loading ? 'Adding Content...' : 'Add Missing Content'}
            </EditableText>
          </Button>
        </Stack>
      </Container>
    </AdminPageWrapper>
  );
}

export default function AddContentUtilityPageWrapper() {
  return (
    <ToastProvider>
      <AddContentUtilityPage />
    </ToastProvider>
  );
} 