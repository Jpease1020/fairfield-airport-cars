'use client';

import { useState } from 'react';
import { cmsService } from '@/lib/services/cms-service';
import {
  Container,
  Button,
  Stack,
  StatusMessage,
  ToastProvider,
  useToast,
  Text,
} from '@/ui';  
import { useCMSData, getCMSField } from '@/design/hooks/useCMSData';
import { useInteractionMode } from '@/design/providers/InteractionModeProvider';

function QuickFixPage() {
  const { cmsData } = useCMSData();
  const { mode } = useInteractionMode();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const missingContent = {
    pages: {
      success: {
        title: getCMSField(cmsData, 'admin.quickFix.missingContent.pages.success.title', 'Booking Confirmed!'),
        subtitle: getCMSField(cmsData, 'admin.quickFix.missingContent.pages.success.subtitle', 'Your airport transfer is confirmed'),
        message: getCMSField(cmsData, 'admin.quickFix.missingContent.pages.success.message', 'We\'ll send you a confirmation email with all the details. Your driver will contact you 30 minutes before pickup.'),
        nextSteps: getCMSField(cmsData, 'admin.quickFix.missingContent.pages.success.nextSteps', 'What happens next?'),
        driverContact: getCMSField(cmsData, 'admin.quickFix.missingContent.pages.success.driverContact', 'Driver will contact you 30 minutes before pickup'),
        emailConfirmation: getCMSField(cmsData, 'admin.quickFix.missingContent.pages.success.emailConfirmation', 'Check your email for confirmation details'),
        calendarInvite: getCMSField(cmsData, 'admin.quickFix.missingContent.pages.success.calendarInvite', 'Calendar invite added to your schedule'),
        backToHome: getCMSField(cmsData, 'admin.quickFix.missingContent.pages.success.backToHome', 'Back to Home')
      },
      error: {
        title: getCMSField(cmsData, 'admin.quickFix.missingContent.pages.error.title', 'Something went wrong'),
        subtitle: getCMSField(cmsData, 'admin.quickFix.missingContent.pages.error.subtitle', 'We couldn\'t process your request'),
        message: getCMSField(cmsData, 'admin.quickFix.missingContent.pages.error.message', 'Please try again or contact support if the problem persists.'),
        tryAgain: getCMSField(cmsData, 'admin.quickFix.missingContent.pages.error.tryAgain', 'Try Again'),
        contactSupport: getCMSField(cmsData, 'admin.quickFix.missingContent.pages.error.contactSupport', 'Contact Support'),
        backToHome: getCMSField(cmsData, 'admin.quickFix.missingContent.pages.error.backToHome', 'Back to Home')
      }
    },
    bookingForm: {
      title: getCMSField(cmsData, 'admin.quickFix.missingContent.bookingForm.title', 'Book Your Airport Transfer'),
      subtitle: getCMSField(cmsData, 'admin.quickFix.missingContent.bookingForm.subtitle', 'Reliable transportation to and from the airport'),
      pickupLocationLabel: getCMSField(cmsData, 'admin.quickFix.missingContent.bookingForm.pickupLocationLabel', 'Pickup Location'),
      pickupLocationPlaceholder: getCMSField(cmsData, 'admin.quickFix.missingContent.bookingForm.pickupLocationPlaceholder', 'Enter pickup address or location'),
      dropoffLocationLabel: getCMSField(cmsData, 'admin.quickFix.missingContent.bookingForm.dropoffLocationLabel', 'Dropoff Location'),
      dropoffLocationPlaceholder: getCMSField(cmsData, 'admin.quickFix.missingContent.bookingForm.dropoffLocationPlaceholder', 'Enter destination address'),
      pickupDateLabel: getCMSField(cmsData, 'admin.quickFix.missingContent.bookingForm.pickupDateLabel', 'Pickup Date'),
      pickupTimeLabel: getCMSField(cmsData, 'admin.quickFix.missingContent.bookingForm.pickupTimeLabel', 'Pickup Time'),
      additionalDetails: {
        title: getCMSField(cmsData, 'admin.quickFix.missingContent.bookingForm.additionalDetails.title', 'Additional Details'),
        description: getCMSField(cmsData, 'admin.quickFix.missingContent.bookingForm.additionalDetails.description', 'Any special requirements or notes')
      },
      passengersLabel: getCMSField(cmsData, 'admin.quickFix.missingContent.bookingForm.passengersLabel', 'Number of Passengers'),
      luggageLabel: getCMSField(cmsData, 'admin.quickFix.missingContent.bookingForm.luggageLabel', 'Number of Luggage Pieces'),
      specialRequestsLabel: getCMSField(cmsData, 'admin.quickFix.missingContent.bookingForm.specialRequestsLabel', 'Special Requests'),
      actionButtons: {
        title: getCMSField(cmsData, 'admin.quickFix.missingContent.bookingForm.actionButtons.title', 'Complete Your Booking'),
        description: getCMSField(cmsData, 'admin.quickFix.missingContent.bookingForm.actionButtons.description', 'Review your details and proceed to payment')
      },
      calculateFareButton: getCMSField(cmsData, 'admin.quickFix.missingContent.bookingForm.calculateFareButton', 'Calculate Fare'),
      bookNowButton: getCMSField(cmsData, 'admin.quickFix.missingContent.bookingForm.bookNowButton', 'Book Now'),
      estimatedFareLabel: getCMSField(cmsData, 'admin.quickFix.missingContent.bookingForm.estimatedFareLabel', 'Estimated Fare')
    }
  };

  const handleAddContent = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const currentConfig = await cmsService.getCMSConfiguration();
      
      if (!currentConfig) {
        throw new Error(getCMSField(cmsData, 'admin.quickFix.errors.noConfigFound', 'No CMS configuration found'));
      }

      const updatedConfig = {
        ...currentConfig,
        admin: {
          ...currentConfig.admin,
          quickFix: {
            ...currentConfig.admin?.quickFix,
            missingContent
          }
        } as any
      };

      const result = await cmsService.updateCMSConfiguration(updatedConfig);
      
      if (result.success) {
        setSuccess(getCMSField(cmsData, 'admin.quickFix.messages.contentAddedSuccess', 'Successfully added missing content to the database!'));
        addToast('success', getCMSField(cmsData, 'admin.quickFix.messages.contentAddedToast', 'Content added successfully'));
      } else {
        throw new Error(result.errors?.join(', ') || getCMSField(cmsData, 'admin.quickFix.errors.saveFailed', 'Failed to save content'));
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : getCMSField(cmsData, 'admin.quickFix.errors.addContentFailed', 'Failed to add content');
      setError(errorMessage);
      addToast('error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Container>
        <Stack spacing="md">
          <Text data-cms-id="admin.quickFix.sections.description" mode={mode}>
            {getCMSField(cmsData, 'admin.quickFix.sections.description', 'This will add all missing content to the database, making the app ready for real customers:')}
          </Text>
          <Stack spacing="sm">
            <Container>
              <Text data-cms-id="admin.quickFix.sections.content.successPage" mode={mode}>
                {getCMSField(cmsData, 'admin.quickFix.sections.content.successPage', 'Success page messages and titles')}
              </Text>
            </Container>
            <Container>
              <Text data-cms-id="admin.quickFix.sections.content.errorPage" mode={mode}>
                {getCMSField(cmsData, 'admin.quickFix.sections.content.errorPage', 'Error page content and messages')}
              </Text>
            </Container>
            <Container>
              <Text data-cms-id="admin.quickFix.sections.content.bookingForm" mode={mode}>
                {getCMSField(cmsData, 'admin.quickFix.sections.content.bookingForm', 'Booking form labels and descriptions')}
              </Text>
            </Container>
            <Container>
              <Text data-cms-id="admin.quickFix.sections.content.navigation" mode={mode}>
                {getCMSField(cmsData, 'admin.quickFix.sections.content.navigation', 'Navigation and footer content')}
              </Text>
            </Container>
            <Container>
              <Text data-cms-id="admin.quickFix.sections.content.adminDashboard" mode={mode}>
                {getCMSField(cmsData, 'admin.quickFix.sections.content.adminDashboard', 'Admin dashboard text and labels')}
              </Text>
            </Container>
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
            data-cms-id="admin.quickFix.sections.addContentButton"
            interactionMode={mode}
          >
            {getCMSField(cmsData, 'admin.quickFix.sections.addContentButton', loading ? 'Adding Content...' : '🚀 Make App Production-Ready')}
          </Button>
        </Stack>
      </Container>
    </>
  );
}

export default function QuickFixPageWrapper() {
  return (
    <ToastProvider>
      <QuickFixPage />
    </ToastProvider>
  );
} 