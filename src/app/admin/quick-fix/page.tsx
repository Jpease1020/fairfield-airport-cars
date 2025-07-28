'use client';

import { useState } from 'react';
import { cmsService } from '@/lib/services/cms-service';
import { 
  AdminPageWrapper,
  Container,
  Card,
  CardBody,
  Button,
  Text,
  Stack,
  StatusMessage,
  EditableText
} from '@/components/ui';
import { ToastProvider, useToast } from '@/components/ui';

function QuickFixPage() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const missingContent = {
    pages: {
      success: {
        title: "Booking Confirmed!",
        subtitle: "Your airport transportation has been booked successfully",
        paymentSuccessTitle: "Payment Successful!",
        paymentSuccessMessage: "Your payment has been processed successfully.",
        noBookingTitle: "Booking Not Found",
        noBookingMessage: "We couldn't find your booking. Please check your email or contact support.",
        currentStatusLabel: "Current Status",
        viewDetailsButton: "View Booking Details",
        loadingMessage: "Processing your booking..."
      },
              help: {
        faq: [
          {
            question: "How far in advance should I book?",
            answer: "We recommend booking at least 24 hours in advance for guaranteed availability.",
            category: "booking" as const
          },
          {
            question: "What payment methods do you accept?",
            answer: "We accept all major credit cards, debit cards, and digital wallets.",
            category: "payment" as const
          },
          {
            question: "Can I cancel my booking?",
            answer: "Yes, you can cancel up to 3 hours before pickup for a full refund.",
            category: "cancellation" as const
          },
          {
            question: "What if my flight is delayed?",
            answer: "We monitor flight status and automatically adjust pickup times for delays.",
            category: "general" as const
          }
        ],
        contactInfo: {
          phone: "(555) 123-4567",
          email: "support@fairfieldairportcars.com",
          hours: "24/7 Support"
        }
      }
    },
    bookingForm: {
      personalInfo: {
        title: "Personal Information",
        description: "Please provide your contact details for the booking"
      },
      fullNameLabel: "Full Name",
      emailLabel: "Email Address",
      phoneLabel: "Phone Number",
      tripDetails: {
        title: "Trip Details",
        description: "Tell us about your journey"
      },
      pickupLocationLabel: "Pickup Location",
      dropoffLocationLabel: "Dropoff Location",
      pickupDateLabel: "Pickup Date",
      pickupTimeLabel: "Pickup Time",
      additionalDetails: {
        title: "Additional Details",
        description: "Any special requirements or notes"
      },
      passengersLabel: "Number of Passengers",
      luggageLabel: "Number of Luggage Pieces",
      specialRequestsLabel: "Special Requests",
      actionButtons: {
        title: "Complete Your Booking",
        description: "Review your details and proceed to payment"
      },
      calculateFareButton: "Calculate Fare",
      bookNowButton: "Book Now",
      estimatedFareLabel: "Estimated Fare"
    }
  };

  const handleAddContent = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const currentConfig = await cmsService.getCMSConfiguration();
      
      if (!currentConfig) {
        throw new Error('No CMS configuration found');
      }

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
      title="Quick Fix - Add Missing Content"
      subtitle="Add missing content to make the app production-ready"
    >
      <Container>
        <Stack spacing="md">
          <EditableText field="admin.quickFix.description" defaultValue="This will add all missing content to the database, making the app ready for real customers:">
            This will add all missing content to the database, making the app ready for real customers:
          </EditableText>
          <Stack spacing="sm">
            <Container>Success page messages and titles</Container>
            <Container>Error page content and messages</Container>
            <Container>Booking form labels and descriptions</Container>
            <Container>Navigation and footer content</Container>
            <Container>Admin dashboard text and labels</Container>
          </Stack>
          
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
            <EditableText field="admin.quickFix.button" defaultValue={loading ? 'Adding Content...' : '🚀 Make App Production-Ready'}>
              {loading ? 'Adding Content...' : '🚀 Make App Production-Ready'}
            </EditableText>
          </Button>
        </Stack>
      </Container>
    </AdminPageWrapper>
  );
}

export default function QuickFixPageWrapper() {
  return (
    <ToastProvider>
      <QuickFixPage />
    </ToastProvider>
  );
} 