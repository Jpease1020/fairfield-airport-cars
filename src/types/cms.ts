import { colors } from '@/design/system/tokens/tokens';

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
    description: string;
    primaryButton: string;
    secondaryButton: string;
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
    'test-edit-mode'?: {
      title: string;
      description: string;
      customText: string;
      instructions: string;
      reloadButton: string;
    };
    booking: {
      title: string;
      subtitle: string;
      description: string;
      hero: {
        title: string;
        subtitle: string;
      };
      personalInfo: {
        title: string;
      };
      tripDetails: {
        title: string;
      };
      specialRequests: {
        title: string;
      };
      notes: {
        title: string;
      };
      fare: {
        title: string;
        breakdown: {
          title: string;
          base: {
            label: string;
            value: string;
          };
          vehicle: {
            label: string;
            value: string;
          };
          service: {
            label: string;
            value: string;
          };
          total: {
            label: string;
            value: string;
          };
        };
      };
      form: {
        name: {
          label: string;
          placeholder: string;
          input: string;
        };
        email: {
          label: string;
          placeholder: string;
          input: string;
        };
        phone: {
          label: string;
          placeholder: string;
          input: string;
        };
        pickupLocation: {
          label: string;
          placeholder: string;
          input: string;
        };
        dropoffLocation: {
          label: string;
          placeholder: string;
          input: string;
        };
        pickupDateTime: {
          label: string;
          input: string;
        };
        passengers: {
          label: string;
          select: string;
        };
        childSeat: {
          label: string;
          checkbox: string;
        };
        wheelchair: {
          label: string;
          checkbox: string;
        };
        extraLuggage: {
          label: string;
          checkbox: string;
        };
        meetAndGreet: {
          label: string;
          checkbox: string;
        };
        flightTracking: {
          label: string;
          checkbox: string;
        };
        airline: {
          label: string;
          placeholder: string;
          input: string;
        };
        flightNumber: {
          label: string;
          placeholder: string;
          input: string;
        };
        arrivalTime: {
          label: string;
          placeholder: string;
          input: string;
        };
        terminal: {
          label: string;
          placeholder: string;
          input: string;
        };
        notes: {
          label: string;
          placeholder: string;
          textarea: string;
        };
        calculating: string;
        calculate_fare: string;
        submit: string;
      };
      flightInfo: {
        title: string;
      };
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
    // NEW: Complete CMS coverage for all 16 pages
    portal?: {
      welcome: {
        title: string;
        subtitle: string;
        description: string;
      };
      actions: {
        myBookings: {
          label: string;
          description: string;
        };
        bookingStatus: {
          label: string;
          description: string;
        };
        accountSettings: {
          label: string;
          description: string;
        };
        support: {
          label: string;
          description: string;
        };
        bookNewRide: {
          label: string;
          description: string;
        };
        contactUs: {
          label: string;
          description: string;
          contactInfo: string;
        };
      };
      stats: {
        totalBookings: {
          title: string;
          description: string;
        };
        loyaltyStatus: {
          title: string;
          description: string;
        };
        preferredContact: {
          title: string;
          description: string;
        };
      };
    };
    profile: {
      title: string;
      subtitle: string;
      editProfile: string;
      saveChanges: string;
      cancel: string;
      loading: {
        initializing: string;
        loadingProfile: string;
        savingChanges: string;
      };
      loginRequired: string;
      goToLogin: string;
      sections: {
        personal: string;
        booking: string;
        notifications: string;
        account: string;
      };
      name_label: string;
      name_placeholder: string;
      email_label: string;
      phone_label: string;
      phone_placeholder: string;
      default_pickup_label: string;
      default_pickup_placeholder: string;
      default_pickup_input: string;
      default_pickup_value: string;
      default_pickup_not_set: string;
      default_dropoff_label: string;
      default_dropoff_placeholder: string;
      default_dropoff_input: string;
      default_dropoff_value: string;
      default_dropoff_not_set: string;
      notifications_label: string;
      email_notifications_label: string;
      email_notifications_text: string;
      email_notifications_checkbox: string;
      sms_notifications_label: string;
      sms_notifications_text: string;
      sms_notifications_checkbox: string;
      save_button: string;
      cancel_button: string;
      email: {
        note: string;
      };
      account: {
        memberSinceLabel: string;
        lastLoginLabel: string;
        totalBookingsLabel: string;
        totalSpentLabel: string;
      };
    };
    payments: {
      title: string;
      subtitle: string;
      addPaymentMethod: string;
      managePaymentMethods: string;
      paymentHistory: string;
      balance: string;
      noPaymentMethods: string;
      addFirstMethod: string;
      sections: {
        methods: string;
        history: string;
      };
      noMethods: {
        message: string;
      };
      noHistory: {
        message: string;
      };
      method: {
        [key: string]: {
          type: string;
          details: string;
          icon: string;
          status: string;
        };
      };
      history: {
        [key: string]: {
          icon: string;
          description: string;
          date: string;
          amount: string;
          status: string;
        };
      };
    };
    'add-payment-method'?: {
      title: string;
      subtitle: string;
      cardNumberLabel: string;
      expiryLabel: string;
      cvvLabel: string;
      nameLabel: string;
      saveButton: string;
      cancelButton: string;
      successMessage: string;
      errorMessage: string;
    };
    'pay-balance'?: {
      title: string;
      subtitle: string;
      balanceLabel: string;
      payButton: string;
      cancelButton: string;
      successMessage: string;
      errorMessage: string;
    };
    bookings: {
      title: string;
      subtitle: string;
      bookNewRide: string;
      noBookings: string;
      noBookingsTitle: string;
      bookFirstRide: string;
      createFirst: string;
      filters: {
        all: string;
        upcoming: string;
        completed: string;
        cancelled: string;
      };
      actions: {
        viewDetails: string;
        edit: string;
        cancel: string;
        track: string;
      };
      status: {
        pending: string;
        confirmed: string;
        inProgress: string;
        completed: string;
        cancelled: string;
      };
      loading: {
        initializing: string;
        loadingBookings: string;
      };
      loginRequired: string;
      goToLogin: string;
      booking: {
        [key: string]: {
          title: string;
          statusText: string;
          viewStatus: string;
          manage: string;
          feedback: string;
          payBalance: string;
        };
      };
    };
    'booking-form'?: {
      title: string;
      subtitle: string;
      description: string;
      formLabels: {
        fullName: string;
        email: string;
        phone: string;
        pickupLocation: string;
        dropoffLocation: string;
        pickupDateTime: string;
        passengers: string;
        flightNumber: string;
        notes: string;
      };
      buttons: {
        calculateFare: string;
        bookNow: string;
        update: string;
      };
      messages: {
        calculating: string;
        fareCalculated: string;
        bookingSuccess: string;
        bookingError: string;
      };
    };
    tracking?: {
      title: string;
      subtitle: string;
      liveTracking: string;
      driverLocation: string;
      eta: string;
      lastUpdate: string;
      refresh: string;
      errors: {
        bookingNotFound: string;
        loadFailed: string;
        trackingFailed: string;
      };
      status: {
        driverEnRoute: string;
        driverArrived: string;
        pickupComplete: string;
        inTransit: string;
        completed: string;
      };
      // Additional fields that the page actually uses
      loading?: {
        message: string;
        subtitle: string;
      };
      error?: {
        goBack: string;
      };
      refreshETA?: string;
      lastUpdateDetails?: {
        label: string;
        live: string;
      };
      map?: {
        loading: string;
        error: string;
      };
    };
  };
  business: BusinessSettings;
  pricing: PricingSettings;
  payment: PaymentSettings;
  communication?: {
    email?: EmailTemplates;
    sms?: SMSTemplates;
  };
  themeColors?: Record<string, string>;
  driver: DriverSettings;
  analytics?: AnalyticsSettings;
  bookingForm: BookingFormText;
  admin?: {
    // Overview Page
    overview: {
      title: string;
      subtitle: string;
      sections: {
        list: { title: string };
        customer: { title: string };
        admin: { title: string };
      };
    };
    // Dashboard Page
    dashboard: {
      loading: { message: string };
      error: { message: string; loadFailed: string };
      stats: {
        totalBookings: { title: string; noBookings: string };
      };
      activity: {
        bookingTemplate: string;
        paymentTemplate: string;
      };
    };
    // Analytics Page
    analytics: {
      loading: { message: string };
      title: string;
      userInteractions: { description: string };
      refreshButton: string;
      lastUpdated: string;
      noData: { title: string; message: string };
      sections: {
        overview: {
          totalInteractions: { title: string; description: string };
          totalErrors: { title: string; description: string };
          errorRate: { title: string; description: string };
          activeElements: { title: string; description: string };
        };
        detailed: {
          topInteractionTypes: { title: string; item: string };
          topErrorTypes: { title: string; item: string };
          topElementTypes: { title: string; item: string };
          recentActivity: { title: string; item: string };
          recentErrors: { title: string; item: string; details: string };
        };
      };
    };
    // Bookings Page
    bookings: {
      error: {
        loadBookingsFailed: string;
        updateStatusFailed: string;
        deleteBookingFailed: string;
        assignDriverFailed: string;
      };
      loading: { loadingBookings: string };
      sections: {
        filter: {
          title: string;
          allBookings: string;
          pending: string;
          confirmed: string;
          completed: string;
          cancelled: string;
        };
        stats: {
          totalBookings: string;
          confirmed: string;
          inProgress: string;
          totalRevenue: string;
        };
        table: {
          noBookings: { title: string; description: string };
          columns: {
            customer: string;
            route: string;
            dateTime: string;
            status: string;
            fare: string;
            actions: string;
          };
          actions: {
            confirm: string;
            assignDriver: string;
            delete: string;
          };
        };
      };
    };
    // Comments Page
    comments: {
      confirmations: { deleteComment: string };
      access: { accessDenied: string; description: string };
      loading: { title: string };
      header: { title: string; description: string };
      filters: {
        title: string;
        search: { label: string; placeholder: string };
        status: {
          label: string;
          allStatuses: string;
          open: string;
          inProgress: string;
          resolved: string;
        };
        page: { label: string; allPages: string };
      };
      export: {
        format: { label: string; csv: string; json: string };
        exportButton: string;
        generateAnalytics: string;
      };
      list: {
        title: string;
        noComments: string;
        comment: { pageTitle: string; elementLabel: string };
      };
    };
    // Calendar Page
    calendar: {
      title: string;
      sections: {
        header: { title: string };
        days: {
          sun: string; mon: string; tue: string; wed: string;
          thu: string; fri: string; sat: string;
        };
      };
    };
    // Quick Fix Page
    quickFix: {
      sections: {
        description: string;
        content: {
          successPage: string;
          errorPage: string;
          bookingForm: string;
          navigation: string;
          adminDashboard: string;
        };
        addContentButton: string;
      };
      missingContent: {
        pages: {
          success: {
            title: string; subtitle: string; message: string;
            nextSteps: string; driverContact: string;
            emailConfirmation: string; calendarInvite: string;
            backToHome: string;
          };
          error: {
            title: string; subtitle: string; message: string;
            tryAgain: string; contactSupport: string;
            backToHome: string;
          };
        };
        bookingForm: {
          title: string; subtitle: string;
          pickupLocationLabel: string; pickupLocationPlaceholder: string;
          dropoffLocationLabel: string; dropoffLocationPlaceholder: string;
          pickupDateLabel: string; pickupTimeLabel: string;
          additionalDetails: { title: string; description: string };
          passengersLabel: string; luggageLabel: string;
          specialRequestsLabel: string;
          actionButtons: { title: string; description: string };
          calculateFareButton: string; bookNowButton: string;
          estimatedFareLabel: string;
        };
      };
      messages: {
        contentAddedSuccess: string;
        contentAddedToast: string;
      };
      errors: {
        noConfigFound: string;
        saveFailed: string;
        addContentFailed: string;
      };
    };
    // Other admin pages...
    [key: string]: any;
  };
  lastUpdated?: Date;
  version?: string;
}

// Default configurations
export const DEFAULT_CMS_CONFIG: CMSConfiguration = {
  pages: {
    home: {
      hero: {
        title: 'Fairfield Airport Car Service',
        subtitle: "Reliable, comfortable rides to and from Fairfield Airport",
        description: "Book your ride with confidence. Professional drivers, clean vehicles, and on-time service guaranteed.",
        primaryButton: "Book Your Ride",
        secondaryButton: "Learn More"
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
      description: "Reserve your luxury airport transportation with our professional drivers. We serve all major airports in the NY and CT area.",
      hero: {
        title: "Complete Your Booking",
        subtitle: "Fill in your details below"
      },
      personalInfo: {
        title: "Contact Information"
      },
      tripDetails: {
        title: "Trip Details"
      },
      specialRequests: {
        title: "Special Requests"
      },
      notes: {
        title: "Additional Notes"
      },
      fare: {
        title: "Fare & Booking",
        breakdown: {
          title: "Estimated Fare Breakdown",
          base: {
            label: "Base Fare:",
            value: "$0.00"
          },
          vehicle: {
            label: "Vehicle Upgrade:",
            value: "+$0.00"
          },
          service: {
            label: "Service Level:",
            value: "+$0.00"
          },
          total: {
            label: "Total:",
            value: "$0.00"
          }
        }
      },
      form: {
        name: {
          label: "Full Name",
          placeholder: "Enter your full name",
          input: "name-input"
        },
        email: {
          label: "Email Address",
          placeholder: "Enter your email",
          input: "email-input"
        },
        phone: {
          label: "Phone Number",
          placeholder: "(123) 456-7890",
          input: "phone-input"
        },
        pickupLocation: {
          label: "Pickup Location",
          placeholder: "Enter pickup address",
          input: "pickup-input"
        },
        dropoffLocation: {
          label: "Dropoff Location",
          placeholder: "Enter dropoff address",
          input: "dropoff-input"
        },
        pickupDateTime: {
          label: "Pickup Date & Time",
          input: "datetime-input"
        },
        passengers: {
          label: "Number of Passengers",
          select: "passengers-select"
        },
        childSeat: {
          label: "Child Seat Required",
          checkbox: "child-seat-checkbox"
        },
        wheelchair: {
          label: "Wheelchair Accessible",
          checkbox: "wheelchair-checkbox"
        },
        extraLuggage: {
          label: "Extra Luggage Space",
          checkbox: "luggage-checkbox"
        },
        meetAndGreet: {
          label: "Meet & Greet Service",
          checkbox: "meet-greet-checkbox"
        },
        flightTracking: {
          label: "Flight Tracking",
          checkbox: "flight-tracking-checkbox"
        },
        airline: {
          label: "Airline",
          placeholder: "e.g., Delta Airlines",
          input: "airline-input"
        },
        flightNumber: {
          label: "Flight Number",
          placeholder: "e.g., DL1234",
          input: "flight-number-input"
        },
        arrivalTime: {
          label: "Arrival Time",
          placeholder: "HH:MM",
          input: "arrival-time-input"
        },
        terminal: {
          label: "Terminal",
          placeholder: "e.g., Terminal 1",
          input: "terminal-input"
        },
        notes: {
          label: "Special Instructions",
          placeholder: "Any special instructions or requests...",
          textarea: "notes-textarea"
        },
        calculating: "Calculating...",
        calculate_fare: "Calculate Fare",
        submit: "Book Now"
      },
      flightInfo: {
        title: "Flight Information"
      }
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
    },
    about: {
      id: "about",
      title: "About Us",
      content: "We are Fairfield Airport Car Service, your trusted partner for reliable and comfortable airport transportation. With years of experience, we understand the importance of punctuality and safety. Our professional drivers are background-checked and equipped with clean, well-maintained vehicles to ensure a smooth and enjoyable journey for you.",
      metaDescription: "About Fairfield Airport Car Service - Learn about our reliable airport transportation service.",
      lastUpdated: new Date(),
      isActive: true
    },
    terms: {
      id: "terms",
      title: "Terms of Service",
      content: "By using our services, you agree to our terms of service. We reserve the right to modify these terms at any time. Please review them periodically.",
      metaDescription: "Fairfield Airport Car Service Terms of Service - Important legal information.",
      lastUpdated: new Date(),
      isActive: true
    },
    privacy: {
      id: "privacy",
      title: "Privacy Policy",
      content: "Your privacy is important to us. We collect and use your data in accordance with our privacy policy. This policy outlines how we handle your personal information and data.",
      metaDescription: "Fairfield Airport Car Service Privacy Policy - Information on how we protect your personal data.",
      lastUpdated: new Date(),
      isActive: true
    },
    portal: {
      welcome: {
        title: "Welcome to Your Airport Car Service Portal",
        subtitle: "Your one-stop for all your airport transportation needs.",
        description: "Manage your bookings, track your rides, and update your preferences from the comfort of your device."
      },
      actions: {
        myBookings: {
          label: "My Bookings",
          description: "View and manage your current and past airport rides."
        },
        bookingStatus: {
          label: "Booking Status",
          description: "Check the current status of your active or upcoming rides."
        },
        accountSettings: {
          label: "Account Settings",
          description: "Update your personal information and preferences."
        },
        support: {
          label: "Support",
          description: "Get help with any issues or questions you might have."
        },
        bookNewRide: {
          label: "Book New Ride",
          description: "Reserve your next airport transportation with ease."
        },
        contactUs: {
          label: "Contact Us",
          description: "Have a question or need assistance? Reach out to us.",
          contactInfo: "info@fairfieldairportcars.com"
        }
      },
      stats: {
        totalBookings: {
          title: "Total Bookings",
          description: "Track your overall booking history."
        },
        loyaltyStatus: {
          title: "Loyalty Status",
          description: "View your current loyalty status and benefits."
        },
        preferredContact: {
          title: "Preferred Contact",
          description: "Select your preferred method for communication."
        }
      }
    },
    'add-payment-method': {
      title: "Add New Payment Method",
      subtitle: "Securely add your payment details.",
      cardNumberLabel: "Card Number",
      expiryLabel: "Expiry Date (MM/YY)",
      cvvLabel: "CVV",
      nameLabel: "Name on Card",
      saveButton: "Save Payment Method",
      cancelButton: "Cancel",
      successMessage: "Payment method added successfully!",
      errorMessage: "Failed to add payment method. Please check your details and try again."
    },
    'pay-balance': {
      title: "Pay Remaining Balance",
      subtitle: "Complete your payment to finalize your booking.",
      balanceLabel: "Remaining Balance:",
      payButton: "Pay Now",
      cancelButton: "Cancel",
      successMessage: "Payment successful! Your booking is confirmed.",
      errorMessage: "Failed to process payment. Please try again."
    },
    bookings: {
      title: "My Bookings",
      subtitle: "Your airport ride history and current status.",
      bookNewRide: "Book New Ride",
      noBookings: "You haven't booked any rides yet. Start your journey with us!",
      noBookingsTitle: "No Bookings Found",
      bookFirstRide: "Book Your First Ride",
      createFirst: "Create your first booking now.",
      filters: {
        all: "All Bookings",
        upcoming: "Upcoming",
        completed: "Completed",
        cancelled: "Cancelled"
      },
      actions: {
        viewDetails: "View Details",
        edit: "Edit",
        cancel: "Cancel",
        track: "Track Ride"
      },
      status: {
        pending: "Pending",
        confirmed: "Confirmed",
        inProgress: "In Progress",
        completed: "Completed",
        cancelled: "Cancelled"
      },
      loading: {
        initializing: "Initializing...",
        loadingBookings: "Loading your bookings..."
      },
      loginRequired: "Please log in to view your bookings.",
      goToLogin: "Go to Login",
      booking: {
        pending: {
          title: "Pending",
          statusText: "Awaiting confirmation",
          viewStatus: "View Status",
          manage: "Manage",
          feedback: "Feedback",
          payBalance: "Pay Balance"
        },
        confirmed: {
          title: "Confirmed",
          statusText: "Ride confirmed",
          viewStatus: "View Status",
          manage: "Manage",
          feedback: "Feedback",
          payBalance: "Pay Balance"
        }
      }
    },
    'booking-form': {
      title: "Book Your Ride",
      subtitle: "Premium airport transportation service",
      description: "Reserve your luxury airport transportation with our professional drivers. We serve all major airports in the NY and CT area.",
      formLabels: {
        fullName: "Full Name",
        email: "Email Address",
        phone: "Phone Number",
        pickupLocation: "Pickup Location",
        dropoffLocation: "Dropoff Location",
        pickupDateTime: "Pickup Date and Time",
        passengers: "Passengers",
        flightNumber: "Flight Number (Optional)",
        notes: "Notes (Optional)"
      },
      buttons: {
        calculateFare: "Calculate Fare",
        bookNow: "Book Now",
        update: "Update Booking"
      },
      messages: {
        calculating: "Calculating...",
        fareCalculated: "Estimated Fare: {estimatedFare}",
        bookingSuccess: "Booking created successfully! Sending confirmation...",
        bookingError: "Failed to create booking. Please try again."
      }
    },
    tracking: {
      title: "Live Ride Tracking",
      subtitle: "Track your ride in real-time.",
      liveTracking: "Live Tracking",
      driverLocation: "Current Driver Location:",
      eta: "Estimated Time of Arrival:",
      lastUpdate: "Last Update:",
      refresh: "Refresh",
      errors: {
        bookingNotFound: "Booking not found with the provided ID.",
        loadFailed: "Failed to load tracking data. Please try again later.",
        trackingFailed: "Failed to load tracking data. Please try again later."
      },
      status: {
        driverEnRoute: "Your driver {driverName} is en route and will arrive in approximately {eta} minutes.",
        driverArrived: "Your driver {driverName} has arrived at {pickupLocation}. Safe travels!",
        pickupComplete: "Your ride is complete. Thank you for choosing us!",
        inTransit: "Your driver is on the way to your destination.",
        completed: "Your ride is complete. Thank you for choosing us!"
      },
      // Additional fields that the page actually uses
      loading: {
        message: "Loading tracking data...",
        subtitle: "Please wait a moment."
      },
      error: {
        goBack: "Go back to bookings"
      },
      refreshETA: "Refresh ETA",
      lastUpdateDetails: {
        label: "Last Update:",
        live: "Live"
      },
      map: {
        loading: "Loading map...",
        error: "Failed to load map"
      }
    },
    profile: {} as any,
    payments: {} as any
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
      primaryColor: colors.primary[600],
      secondaryColor: colors.secondary[600]
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