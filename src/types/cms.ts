// CMS Types for Fairfield Airport Cars Content Management System

// Page Content Types
export interface PageContent {
  id: string;
  title: string;
  content: string;
  metaDescription?: string;
  lastUpdated: Date;
  isActive: boolean;
}

export interface HomePageContent {
  hero: {
    title: string;
    subtitle: string;
    ctaText: string;
  };
  features: {
    title: string;
    items: Array<{
      title: string;
      description: string;
      icon: string;
    }>;
  };
  fleet?: {
    title: string;
    description: string;
    vehicles: Array<{
      title: string;
      description: string;
    }>;
  };
  faq?: {
    title: string;
    subtitle: string;
    items: Array<{
      question: string;
      answer: string;
    }>;
  };
  finalCta?: {
    title: string;
    description: string;
    buttonText: string;
  };
  about: {
    title: string;
    content: string;
  };
  contact: {
    title: string;
    content: string;
    phone: string;
    email: string;
  };
}

export interface HelpPageContent {
  title?: string;
  subtitle?: string;
  faqTitle?: string;
  sections: Array<{
    title: string;
    content: string;
  }>;
  faq: Array<{
    question: string;
    answer: string;
    category: 'booking' | 'payment' | 'cancellation' | 'general';
  }>;
  contactInfo: {
    phone: string;
    email: string;
    hours: string;
  };
  contactSection?: {
    title: string;
    description: string;
    callButtonText: string;
    textButtonText: string;
  };
}

// Business Configuration Types
export interface BusinessSettings {
  company: {
    name: string;
    tagline: string;
    phone: string;
    email: string;
    address: string;
    hours: string;
    website: string;
  };
  social: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
  branding: {
    primaryColor: string;
    secondaryColor: string;
    logoUrl?: string;
  };
}

export interface PricingSettings {
  baseFare: number;
  perMile: number;
  perMinute: number;
  depositPercent: number;
  bufferMinutes: number;
  cancellation: {
    over24hRefundPercent: number;
    between3And24hRefundPercent: number;
    under3hRefundPercent: number;
  };
  zones: Array<{
    name: string;
    baseFare: number;
    perMile: number;
    perMinute: number;
  }>;
}

export interface PaymentSettings {
  square: {
    applicationId: string;
    locationId: string;
    webhookUrl: string;
  };
  stripe?: {
    publishableKey: string;
    secretKey: string;
  };
}

// Communication Templates
export interface EmailTemplates {
  bookingConfirmation: {
    subject: string;
    body: string;
    includeCalendarInvite: boolean;
  };
  bookingReminder: {
    subject: string;
    body: string;
    sendHoursBefore: number;
  };
  cancellation: {
    subject: string;
    body: string;
  };
  feedback: {
    subject: string;
    body: string;
    sendDaysAfter: number;
  };
}

export interface SMSTemplates {
  bookingConfirmation: string;
  bookingReminder: string;
  driverEnRoute: string;
  driverArrived: string;
}

// Driver Management
export interface DriverSettings {
  requirements: {
    minimumAge: number;
    licenseRequired: boolean;
    backgroundCheckRequired: boolean;
    vehicleRequirements: string[];
  };
  compensation: {
    baseRate: number;
    perMileRate: number;
    bonusStructure: string;
  };
  scheduling: {
    advanceBookingHours: number;
    maxBookingsPerDay: number;
    breakRequirements: string;
  };
}

// Analytics and Reporting
export interface AnalyticsSettings {
  googleAnalytics: {
    trackingId?: string;
    enabled: boolean;
  };
  reporting: {
    dailyReports: boolean;
    weeklyReports: boolean;
    monthlyReports: boolean;
    emailRecipients: string[];
  };
}

export interface BookingFormText {
  fullNameLabel: string;
  emailLabel: string;
  phoneLabel: string;
  pickupLocationLabel: string;
  dropoffLocationLabel: string;
  pickupDateTimeLabel: string;
  passengersLabel: string;
  flightNumberLabel: string;
  notesLabel: string;
  calculateFareButton: string;
  calculatingFareButton: string;
  bookNowButton: string;
  updateBookingButton: string;
  estimatedFareLabel: string;
  errorLoadLocations: string;
  loading: string;
  errorEnterLocations: string;
  errorCalculateFare: string;
  errorCalculateBeforeBooking: string;
  errorTimeConflict: string;
  successBookingUpdated: string;
  successBookingCreated: string;
  errorUpdateBooking: string;
  errorCreateBooking: string;
}

// Main CMS Configuration
export interface CMSConfiguration {
  pages: {
    home: HomePageContent;
    help: HelpPageContent;
    booking?: {
      title: string;
      subtitle: string;
      description?: string;
    };
    success?: {
      title: string;
      subtitle: string;
      paymentSuccessTitle: string;
      paymentSuccessMessage: string;
      noBookingTitle: string;
      noBookingMessage: string;
      currentStatusLabel: string;
      viewDetailsButton: string;
      loadingMessage: string;
    };
    bookingDetails?: {
      title: string;
      subtitle: string;
      successMessage: string;
      payDepositButton: string;
      editBookingButton: string;
      cancelBookingButton: string;
      cancelConfirmMessage: string;
      cancelSuccessMessage: string;
      paymentError: string;
      notFoundMessage: string;
      loadingMessage: string;
    };
    feedback?: {
      title: string;
      subtitle?: string;
      rateExperienceTitle: string;
      rateExperienceDescription: string;
      commentsTitle: string;
      commentsLabel: string;
      commentsPlaceholder: string;
      submitButton: string;
      successTitle: string;
      successMessage: string;
      errorNoRating: string;
      errorSubmission: string;
    };
    cancel?: {
      title: string;
      subtitle?: string;
      errorTitle: string;
      errorMessage: string;
    };
    manage?: {
      title: string;
      subtitle?: string;
      resendButton: string;
      cancelButton: string;
      payBalanceButton: string;
      viewStatusButton: string;
      cancelConfirmMessage: string;
      cancelSuccessMessage: string;
      resendSuccessMessage: string;
      resendErrorMessage: string;
      payBalanceErrorMessage: string;
      notFoundMessage: string;
      loadingMessage: string;
    };
    status?: {
      title: string;
      subtitleLabel: string;
      stepPending: string;
      stepConfirmed: string;
      stepCompleted: string;
      statusPending: string;
      statusConfirmed: string;
      statusCompleted: string;
      statusCancelled: string;
      alertCancelledTitle: string;
      alertCancelledMessage: string;
      alertNotFoundTitle: string;
      alertNotFoundMessage: string;
      alertErrorTitle: string;
      alertErrorMessage: string;
      loadingMessage: string;
      liveDriverHeader: string;
    };
    about?: PageContent;
    terms?: PageContent;
    privacy?: PageContent;
  };
  business: BusinessSettings;
  pricing: PricingSettings;
  payment: PaymentSettings;
  communication: {
    email: EmailTemplates;
    sms: SMSTemplates;
  };
  driver: DriverSettings;
  analytics: AnalyticsSettings;
  bookingForm: BookingFormText;
  lastUpdated: Date;
  version: string;
  themeColors?: Record<string, string>; // <-- add this line
}

// Default configurations
export const DEFAULT_CMS_CONFIG: CMSConfiguration = {
  pages: {
    home: {
      hero: {
        title: 'Fairfield Airport Car Service',
        subtitle: "Reliable, comfortable rides to and from Fairfield Airport",
        ctaText: "Book Your Ride"
      },
      features: {
        title: "Why Choose Us",
        items: [
          {
            title: "Reliable Service",
            description: "On-time pickups and professional drivers",
            icon: "clock"
          },
          {
            title: "Comfortable Rides",
            description: "Clean, well-maintained vehicles",
            icon: "car"
          },
          {
            title: "Easy Booking",
            description: "Simple online booking with instant confirmation",
            icon: "smartphone"
          }
        ]
      },
      fleet: {
        title: "Our Fleet",
        description: "You will ride in a meticulously maintained Chevrolet Suburban or a similar full-size luxury SUV, offering ample space for passengers and luggage.",
        vehicles: [
          {
            title: "Luxury SUV",
            description: "Spacious Chevrolet Suburban with premium amenities including complimentary water, Wi-Fi, and phone chargers."
          },
          {
            title: "Professional Service",
            description: "Experienced drivers with background checks, ensuring your safety and comfort throughout your journey."
          }
        ]
      },
      faq: {
        title: "Frequently Asked Questions",
        subtitle: "Everything you need to know about our service",
        items: [
          {
            question: "Which airports do you serve?",
            answer: "We provide service to and from all major airports in the New York and Connecticut area, including JFK, LaGuardia (LGA), Newark (EWR), Westchester (HPN), and Bradley (BDL)."
          },
          {
            question: "How far in advance should I book my ride?",
            answer: "We recommend booking at least 24 hours in advance to ensure availability. However, we will always do our best to accommodate last-minute requests."
          },
          {
            question: "What is your cancellation policy?",
            answer: "You can cancel for a full refund up to 12 hours before your scheduled pickup time. Cancellations within 12 hours of pickup are non-refundable."
          },
          {
            question: "What kind of vehicle will I be riding in?",
            answer: "You will be riding in a modern, clean, and comfortable black SUV, typically a Chevrolet Suburban or similar, equipped with complimentary water, Wi-Fi, and phone chargers."
          }
        ]
      },
      finalCta: {
        title: "Ready for a Stress-Free Ride?",
        description: "Book your airport transportation today and experience the difference of premium service.",
        buttonText: "Book Now"
      },
      about: {
        title: "About Our Service",
        content: "We provide reliable airport transportation services in the Fairfield area. Our professional drivers ensure you arrive at your destination safely and on time."
      },
      contact: {
        title: "Contact Us",
        content: "Ready to book your ride? Get in touch with us today.",
        phone: "(555) 123-4567",
        email: "info@fairfieldairportcars.com"
      }
    },
    help: {
      title: "Help & FAQs",
      subtitle: "Find answers to common questions about our service",
      faqTitle: "Frequently Asked Questions",
      sections: [
        {
          title: "Booking Information",
          content: "Learn about our booking process and policies."
        },
        {
          title: "Service Areas",
          content: "Find out which airports and areas we serve."
        }
      ],
      faq: [
        {
          question: "How far in advance should I book?",
          answer: "We recommend booking at least 24 hours in advance for airport rides.",
          category: "booking"
        },
        {
          question: "What is your cancellation policy?",
          answer: "Cancellations made more than 24 hours before pickup receive a full refund. Cancellations 3-24 hours before receive 50% refund.",
          category: "cancellation"
        }
      ],
      contactInfo: {
        phone: "(555) 123-4567",
        email: "support@fairfieldairportcars.com",
        hours: "24/7"
      },
      contactSection: {
        title: "Contact Us",
        description: "If you can't find the answer you're looking for, please don't hesitate to reach out.",
        callButtonText: "Click to Call",
        textButtonText: "Click to Text"
      }
    },
    booking: {
      title: "Book Your Ride",
      subtitle: "Premium airport transportation service",
      description: "Reserve your luxury airport transportation with our professional drivers. We serve all major airports in the NY and CT area."
    },
    success: {
      title: "Payment Successful!",
      subtitle: "Your booking has been confirmed",
      paymentSuccessTitle: "Payment Processed",
      paymentSuccessMessage: "Your payment has been successfully processed.",
      noBookingTitle: "Payment Successful",
      noBookingMessage: "No booking reference found, but your payment was processed.",
      currentStatusLabel: "Current Status:",
      viewDetailsButton: "View Detailed Status",
      loadingMessage: "Loading your booking..."
    },
    bookingDetails: {
      title: "Booking Confirmed!",
      subtitle: "Your ride is booked successfully",
      successMessage: "You will receive an SMS confirmation shortly. We will contact you if there are any issues.",
      payDepositButton: "Pay Deposit",
      editBookingButton: "Edit Booking",
      cancelBookingButton: "Cancel Booking",
      cancelConfirmMessage: "Are you sure you want to cancel this booking?",
      cancelSuccessMessage: "Booking cancelled successfully.",
      paymentError: "Failed to create payment link.",
      notFoundMessage: "No booking found with the provided ID.",
      loadingMessage: "Loading booking details..."
    },
    feedback: {
      title: "Leave Feedback",
      subtitle: "Help us improve our service",
      rateExperienceTitle: "Rate Your Experience",
      rateExperienceDescription: "How was your ride?",
      commentsTitle: "Additional Comments",
      commentsLabel: "Comments",
      commentsPlaceholder: "Tell us about your experience...",
      submitButton: "Submit Feedback",
      successTitle: "Thank You!",
      successMessage: "Your feedback is greatly appreciated and helps us improve our service.",
      errorNoRating: "Please select a star rating.",
      errorSubmission: "Sorry, there was an issue submitting your feedback. Please try again later."
    },
    cancel: {
      title: "Payment Canceled",
      subtitle: "Your payment was not completed",
      errorTitle: "Payment Canceled",
      errorMessage: "Your payment was canceled. Please try again."
    },
    manage: {
      title: "Manage Your Booking",
      subtitle: "Reference: {bookingId}",
      resendButton: "Re-send Confirmation Email/SMS",
      cancelButton: "Cancel Ride",
      payBalanceButton: "Pay Remaining Balance",
      viewStatusButton: "View Status Page",
      cancelConfirmMessage: "Are you sure you want to cancel this ride? A cancellation fee may apply.",
      cancelSuccessMessage: "Ride cancelled. You will receive a confirmation shortly.",
      resendSuccessMessage: "Confirmation sent!",
      resendErrorMessage: "Failed to send confirmation",
      payBalanceErrorMessage: "Failed to create balance payment link",
      notFoundMessage: "Booking not found",
      loadingMessage: "Loading booking details..."
    },
    status: {
      title: "Your Ride Status",
      subtitleLabel: "Pickup Time:",
      stepPending: "Pending",
      stepConfirmed: "Confirmed",
      stepCompleted: "Completed",
      statusPending: "We've received your booking and will confirm it shortly.",
      statusConfirmed: "Your ride is confirmed! We'll notify you when your driver is on the way.",
      statusCompleted: "Your ride is complete. Thank you for choosing us!",
      statusCancelled: "This booking has been cancelled.",
      alertCancelledTitle: "Booking Cancelled",
      alertCancelledMessage: "This booking has been cancelled.",
      alertNotFoundTitle: "Booking Not Found",
      alertNotFoundMessage: "No booking found with the provided ID.",
      alertErrorTitle: "Error",
      alertErrorMessage: "Failed to load booking status.",
      loadingMessage: "Loading ride status...",
      liveDriverHeader: "Live Driver Location"
    }
  },
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
  payment: {
    square: {
      applicationId: "",
      locationId: "",
      webhookUrl: ""
    }
  },
  communication: {
    email: {
      bookingConfirmation: {
        subject: `Your Fairfield Airport Car Service Booking Confirmation`,
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
  },
  driver: {
    requirements: {
      minimumAge: 21,
      licenseRequired: true,
      backgroundCheckRequired: true,
      vehicleRequirements: ["Valid registration", "Insurance", "Clean interior"]
    },
    compensation: {
      baseRate: 15,
      perMileRate: 2.5,
      bonusStructure: "Performance-based bonuses for high ratings"
    },
    scheduling: {
      advanceBookingHours: 24,
      maxBookingsPerDay: 8,
      breakRequirements: "30-minute break every 4 hours"
    }
  },
  analytics: {
    googleAnalytics: {
      enabled: false
    },
    reporting: {
      dailyReports: true,
      weeklyReports: true,
      monthlyReports: true,
      emailRecipients: ["admin@fairfieldairportcars.com"]
    }
  },
  bookingForm: {
    fullNameLabel: "Full Name",
    emailLabel: "Email Address",
    phoneLabel: "Phone Number",
    pickupLocationLabel: "Pickup Location",
    dropoffLocationLabel: "Dropoff Location",
    pickupDateTimeLabel: "Pickup Date and Time",
    passengersLabel: "Passengers",
    flightNumberLabel: "Flight Number (Optional)",
    notesLabel: "Notes (Optional)",
    calculateFareButton: "Calculate Fare",
    calculatingFareButton: "Calculating...",
    bookNowButton: "Book Now",
    updateBookingButton: "Update Booking",
    estimatedFareLabel: "Estimated Fare:",
    errorLoadLocations: "Could not load locations. Please try again later.",
    loading: "Loading...",
    errorEnterLocations: "Please enter both pickup and drop-off locations.",
    errorCalculateFare: "Could not calculate fare. Please check the addresses.",
    errorCalculateBeforeBooking: "Please calculate the fare before booking.",
    errorTimeConflict: "Selected time conflicts with another booking. Please choose a different time.",
    successBookingUpdated: "Booking updated successfully!",
    successBookingCreated: "Booking created successfully! Sending confirmation...",
    errorUpdateBooking: "Failed to update booking.",
    errorCreateBooking: "Failed to create booking."
  },
  lastUpdated: new Date(),
  version: "1.0.0"
}; 