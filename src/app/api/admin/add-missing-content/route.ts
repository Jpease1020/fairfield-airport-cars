import { NextResponse } from 'next/server';
import { cmsService } from '@/lib/services/cms-service';
import { CMSConfiguration } from '../../../../types/cms';

export async function POST() {
  try {
    console.log('🚀 Adding missing content to CMS via API...');
    
    // Get current CMS configuration
    const currentConfig = await cmsService.getCMSConfiguration();
    
    if (!currentConfig) {
      return NextResponse.json({ 
        success: false, 
        error: 'No CMS configuration found. Please run npm run init-cms first.' 
      });
    }
    
    // Missing content that needs to be added
    const missingContent = {
      pages: {
        ...currentConfig.pages,
        success: {
          title: "🎉 Booking Confirmed!",
          subtitle: "Your booking is confirmed",
          paymentSuccessTitle: "✅ Payment Successful!",
          paymentSuccessMessage: "Your deposit has been processed and your ride is confirmed",
          noBookingTitle: "⚠️ Error Loading Booking",
          noBookingMessage: "Please try refreshing the page or contact support if the problem persists.",
          currentStatusLabel: "Current Status",
          viewDetailsButton: "View My Booking",
          loadingMessage: "Loading your booking details..."
        },
        home: {
          ...currentConfig.pages?.home,
          hero: {
            title: "🎯 Ready to Experience Premium Transportation?",
            subtitle: "Join thousands of satisfied customers who trust us for reliable airport transportation. Professional drivers, clean vehicles, and on-time service for all your airport travel needs.",
            ctaText: "Book Your Ride Now"
          },
          features: {
            title: "✨ Why Choose Us?",
            description: "Professional service, reliable transportation, and peace of mind for your airport journey",
            items: [
              {
                title: "Professional Service",
                description: "Experienced drivers with clean, well-maintained vehicles for your comfort and safety",
                icon: "👨‍💼"
              },
              {
                title: "Reliable & On Time",
                description: "We understand the importance of punctuality for airport travel and never let you down",
                icon: "⏰"
              },
              {
                title: "Easy Booking",
                description: "Simple online booking with secure payment processing and instant confirmation",
                icon: "💳"
              }
            ]
          },
          finalCta: {
            title: "🎯 Ready to Book Your Ride?",
            description: "Experience the difference that professional service makes. Get started with your reliable airport transportation today.",
            buttonText: "Book Now"
          }
        }
      },
      bookingForm: {
        ...currentConfig.bookingForm,
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
    
    // Update the CMS configuration
    const result = await cmsService.updateCMSConfiguration(missingContent as unknown as Partial<CMSConfiguration>);
    
    if (result.success) {
      console.log('✅ Successfully added missing content to CMS!');
      return NextResponse.json({ 
        success: true, 
        message: 'Successfully added missing content to CMS',
        addedContent: [
          'Success page messages and titles',
          'Additional booking form labels and descriptions', 
          'Updated homepage hero and features',
          'Form placeholders and error messages'
        ]
      });
    } else {
      console.error('❌ Failed to add missing content:', result.errors);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to add missing content',
        errors: result.errors 
      });
    }
    
  } catch (error) {
    console.error('❌ Error adding missing content:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to add missing content',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 