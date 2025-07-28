// Comprehensive content mapping for all hardcoded text in the application
// This ensures all existing content is preserved and can be made editable

export const CONTENT_MAPPING = {
  // Homepage Content
  home: {
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
          icon: "🚗"
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
  },

  // Booking Form Content
  bookingForm: {
    // Section titles
    personalInfo: {
      title: "Personal Information",
      description: "Please provide your contact details for the booking"
    },
    tripDetails: {
      title: "Trip Details", 
      description: "Tell us where you need to go and when"
    },
    additionalDetails: {
      title: "Additional Details",
      description: "Help us provide the best service for your trip"
    },
    actionButtons: {
      title: "Book Your Ride",
      description: "Calculate your fare and complete your booking"
    },

    // Form labels
    fullNameLabel: "Full Name",
    emailLabel: "Email Address", 
    phoneLabel: "Phone Number",
    pickupLocationLabel: "Pickup Location",
    dropoffLocationLabel: "Destination",
    pickupDateTimeLabel: "Pickup Date and Time",
    passengersLabel: "Passengers",
    flightNumberLabel: "Flight Number (Optional)",
    notesLabel: "Special Instructions (Optional)",

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

    // Buttons
    calculateFareButton: "Calculate Fare",
    calculatingFareButton: "Calculating...",
    bookNowButton: "Book Now",
    updateBookingButton: "Update Booking",

    // Messages
    estimatedFareLabel: "Estimated Fare",
    errorLoadLocations: "Location autocomplete temporarily unavailable",
    loading: "Loading your booking details...",
    errorEnterLocations: "Please enter both pickup and destination locations",
    errorCalculateFare: "Failed to calculate fare. Please try again.",
    errorCalculateBeforeBooking: "Please calculate the fare before booking",
    errorTimeConflict: "This time slot is not available. Please select a different time.",
    successBookingUpdated: "Booking updated successfully!",
    successBookingCreated: "Booking created successfully!",
    errorUpdateBooking: "Failed to update booking. Please try again.",
    errorCreateBooking: "Failed to create booking. Please try again.",

    // Passenger options
    passengerOptions: [
      "1 passenger",
      "2 passengers", 
      "3 passengers",
      "4 passengers",
      "5 passengers",
      "6 passengers",
      "7 passengers",
      "8 passengers"
    ]
  },

  // Success Page Content
  success: {
    // Loading state
    loading: {
      title: "Loading...",
      subtitle: "Please wait while we load your booking details",
      cardTitle: "Loading...",
      cardDescription: "Loading your booking details..."
    },

    // Error state
    error: {
      title: "⚠️ Error Loading Booking",
      description: "Please try refreshing the page or contact support if the problem persists."
    },

    // Success state
    title: "🎉 Booking Confirmed!",
    subtitle: "Your booking is confirmed",
    paymentSuccessTitle: "✅ Payment Successful!",
    paymentSuccessMessage: "Your deposit has been processed and your ride is confirmed",
    noBookingTitle: "⚠️ Error Loading Booking",
    noBookingMessage: "Please try refreshing the page or contact support if the problem persists.",
    currentStatusLabel: "Current Status",
    viewDetailsButton: "View My Booking",
    loadingMessage: "Loading your booking details...",

    // Success message variations
    bookingCreated: {
      title: "📝 Booking Created!",
      description: "Your booking has been created. Payment can be completed before your ride"
    },

    // Booking details
    tripDetails: {
      title: "🚗 Trip Details",
      description: "Your journey information"
    },

    paymentStatus: {
      title: "💰 Payment Status", 
      description: "Your payment information"
    },

    // Next steps
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

    // Emergency contact
    emergencyContact: {
      title: "🆘 Need Help?",
      description: "Contact us anytime if you have questions or need to make changes",
      phone: "📞 (203) 555-0123",
      message: "Save this number! Our drivers are available to assist you."
    },

    // Action buttons
    actions: [
      {
        label: "Book Another Ride",
        variant: "primary",
        icon: "🚗"
      },
      {
        label: "View My Booking", 
        variant: "secondary",
        icon: "📋"
      },
      {
        label: "Contact Support",
        variant: "outline", 
        icon: "💬"
      }
    ]
  },

  // Help/FAQ Page Content
  help: {
    title: "Help & Support",
    subtitle: "We're here to help",
    description: "Find answers to common questions and get support when you need it.",
    
    faq: {
      title: "Frequently Asked Questions",
      items: [
        {
          question: "Which airports do you serve?",
          answer: "We provide service to and from all major airports in the New York and Connecticut area, including JFK, LaGuardia (LGA), Newark (EWR), Westchester (HPN), and Bradley (BDL).",
          category: "booking"
        },
        {
          question: "How far in advance should I book my ride?",
          answer: "We recommend booking at least 24 hours in advance to ensure availability. However, we will always do our best to accommodate last-minute requests.",
          category: "booking"
        },
        {
          question: "What is your cancellation policy?",
          answer: "You can cancel for a full refund up to 12 hours before your scheduled pickup time. Cancellations within 12 hours of pickup are non-refundable.",
          category: "cancellation"
        },
        {
          question: "What kind of vehicle will I be riding in?",
          answer: "You will be riding in a modern, clean, and comfortable black SUV, typically a Chevrolet Suburban or similar, equipped with complimentary water, Wi-Fi, and phone chargers.",
          category: "general"
        }
      ]
    },

    contactInfo: {
      phone: "(555) 123-4567",
      email: "support@fairfieldairportcars.com", 
      hours: "24/7"
    },

    contactSection: {
      title: "Still Need Help?",
      description: "Our support team is available 24/7 to assist you with any questions or concerns.",
      callButtonText: "Call Support",
      textButtonText: "Send Message"
    }
  },

  // About Page Content
  about: {
    title: "About Us",
    subtitle: "Your trusted transportation partner",
    description: "Learn more about our commitment to excellence and customer satisfaction.",
    
    content: "We provide reliable airport transportation services in the Fairfield area. Our professional drivers ensure you arrive at your destination safely and on time.",
    
    sections: [
      {
        title: "Our Mission",
        content: "To provide safe, reliable, and comfortable airport transportation with exceptional customer service."
      },
      {
        title: "Our Commitment", 
        content: "We are committed to punctuality, safety, and customer satisfaction in every ride."
      },
      {
        title: "Our Drivers",
        content: "All our drivers are experienced, background-checked, and trained to provide the highest level of service."
      }
    ]
  },

  // Business Information
  business: {
    company: {
      name: "Fairfield Airport Car Service",
      tagline: "Your reliable airport transportation partner",
      phone: "(555) 123-4567",
      email: "info@fairfieldairportcars.com",
      address: "Fairfield, CT",
      hours: "24/7",
      website: "https://fairfieldairportcars.com"
    },
    social: {},
    branding: {
      primaryColor: "#1f2937",
      secondaryColor: "#3b82f6"
    }
  },

  // Pricing Information
  pricing: {
    baseFare: 10,
    perMile: 3.5,
    perMinute: 0.5,
    depositPercent: 50,
    bufferMinutes: 60,
    cancellation: {
      over24hRefundPercent: 100,
      between3And24hRefundPercent: 50,
      under3hRefundPercent: 0
    },
    zones: []
  },

  // Communication Templates
  communication: {
    email: {
      bookingConfirmation: {
        subject: "Your Fairfield Airport Car Service Booking Confirmation",
        body: "Thank you for booking with us! Your ride is confirmed for {pickupDateTime}.",
        includeCalendarInvite: true
      },
      bookingReminder: {
        subject: "Reminder: Your Airport Ride Tomorrow",
        body: "Don't forget about your airport ride tomorrow at {pickupDateTime}.",
        sendHoursBefore: 24
      },
      cancellation: {
        subject: "Booking Cancellation Confirmation",
        body: "Your booking has been cancelled. Refund details will be sent separately."
      },
      feedback: {
        subject: "How was your ride?",
        body: "We hope you enjoyed your ride with Fairfield Airport Car Service. Please share your feedback!",
        sendDaysAfter: 1
      }
    },
    sms: {
      bookingConfirmation: "Your Fairfield Airport Car Service booking is confirmed for {pickupDateTime}. Driver details will be sent 30 minutes before pickup.",
      bookingReminder: "Reminder: Your airport ride is tomorrow at {pickupDateTime}. Safe travels!",
      driverEnRoute: "Your driver {driverName} is en route and will arrive in approximately {eta} minutes.",
      driverArrived: "Your driver {driverName} has arrived at {pickupLocation}. Safe travels!"
    }
  }
};

// Helper function to get content by path
export const getContent = (path: string): string => {
  const keys = path.split('.');
  let current: any = CONTENT_MAPPING;
  
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key];
    } else {
      return '';
    }
  }
  
  return typeof current === 'string' ? current : '';
};

// Helper function to get nested content
export const getNestedContent = (path: string): any => {
  const keys = path.split('.');
  let current: any = CONTENT_MAPPING;
  
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key];
    } else {
      return null;
    }
  }
  
  return current;
}; 