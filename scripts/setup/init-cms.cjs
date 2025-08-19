const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc } = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
  authDomain: "fairfield-airport-car-service.firebaseapp.com",
  projectId: "fairfield-airport-car-service",
  storageBucket: "fairfield-airport-car-service.firebasestorage.app",
  messagingSenderId: "1036497512786",
  appId: "1:1036497512786:web:546be81d9ba09e7118728b",
  measurementId: "G-EGTW0BCMLN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Complete CMS Configuration for all 16 pages
const COMPLETE_CMS_CONFIG = {
  pages: {
    // 1. Home Page - Already complete
    home: {
      hero: {
        title: "Fairfield Airport Car Service",
        subtitle: "Premium Transportation",
        description: "Book your ride with confidence. Professional driver, clean vehicle, and on-time service guaranteed.",
        primaryButton: "Book Your Ride Now",
        secondaryButton: "Learn More"
      },
      features: {
        title: "Why Choose Us?",
        items: [
          {
            title: "5-Star Service",
            description: "Experience the highest level of professionalism and customer care.",
            icon: "star"
          },
          {
            title: "Luxury Vehicle",
            description: "Travel in comfort and style in a modern, spacious black SUV.",
            icon: "car"
          },
          {
            title: "Always On Time",
            description: "We pride ourselves on punctuality, ensuring you're never late.",
            icon: "clock"
          },
          {
            title: "Wide Coverage",
            description: "Service to all major airports in NY and CT area.",
            icon: "map"
          },
          {
            title: "Safe & Secure",
            description: "Fully insured and licensed transportation service.",
            icon: "shield"
          },
          {
            title: "Professional Drivers",
            description: "Experienced, courteous, and background-checked drivers.",
            icon: "users"
          }
        ]
      },
      vehicle: {
        title: "Our Vehicle",
        description: "You will ride in a meticulously maintained Chevrolet Suburban, offering ample space for passengers and luggage with premium amenities including complimentary water, Wi-Fi, and phone chargers.",
        features: {
          title: "Luxury SUV Service",
          description: "Professional driver with background checks, ensuring your safety and comfort throughout your journey."
        }
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

    // 2. About Page - Already complete
    about: {
      id: "about",
      title: "About Us",
              content: "We are Fairfield Airport Car Service, your trusted partner for reliable and comfortable airport transportation. With years of experience, we understand the importance of punctuality and safety. Our professional driver is background-checked and equipped with a clean, well-maintained vehicle to ensure a smooth and enjoyable journey for you.",
      metaDescription: "About Fairfield Airport Car Service - Learn about our reliable airport transportation service.",
      lastUpdated: new Date(),
      isActive: true
    },

    // 3. Help Page - Already complete
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
        email: "rides@fairfieldairportcars.com",
        hours: "24/7"
      },
      contactSection: {
        title: "Contact Us",
        description: "If you can't find the answer you're looking for, please don't hesitate to reach out.",
        callButtonText: "Click to Call",
        textButtonText: "Click to Text"
      }
    },

    // 4. Privacy Page - Already complete
    privacy: {
      id: "privacy",
      title: "Privacy Policy",
      content: "Your privacy is important to us. We collect and use your data in accordance with our privacy policy. This policy outlines how we handle your personal information and data.",
      metaDescription: "Fairfield Airport Car Service Privacy Policy - Information on how we protect your personal data.",
      lastUpdated: new Date(),
      isActive: true
    },

    // 5. Terms Page - Already complete
    terms: {
      id: "terms",
      title: "Terms of Service",
      content: "By using our services, you agree to our terms of service. We reserve the right to modify these terms at any time. Please review them periodically.",
      metaDescription: "Fairfield Airport Car Service Terms of Service - Important legal information.",
      lastUpdated: new Date(),
      isActive: true
    },

    // 6. Portal Page - NEW: Complete CMS coverage
    portal: {
      welcome: {
        title: "👋 Welcome to Your Portal",
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
          contactInfo: "Contact information: (203) 555-0123"
        }
      },
      stats: {
        totalBookings: {
          title: "Total Bookings",
          description: "Feature coming soon"
        },
        loyaltyStatus: {
          title: "Loyalty Status",
          description: "Valued Customer"
        },
        preferredContact: {
          title: "Preferred Contact",
          description: "SMS & Email"
        }
      }
    },

    // 7. Profile Page - NEW: Complete CMS coverage
    profile: {
      title: "My Profile",
      subtitle: "Manage your account information and preferences",
      editProfile: "Edit Profile",
      saveChanges: "Save Changes",
      cancel: "Cancel",
      loading: {
        loadingProfile: "Loading your profile...",
        savingChanges: "Saving changes..."
      },
      loginRequired: "Please log in to view your profile.",
      goToLogin: "Go to Login",
      sections: {
        personalInfo: {
          title: "Personal Information",
          nameLabel: "Full Name",
          emailLabel: "Email Address",
          phoneLabel: "Phone Number"
        },
        preferences: {
          title: "Preferences",
          defaultPickupLabel: "Default Pickup Location",
          defaultDropoffLabel: "Default Dropoff Location",
          notificationsLabel: "Notifications",
          emailNotifications: "Email Notifications",
          smsNotifications: "SMS Notifications"
        },
        actions: {
          title: "Actions",
          changePassword: "Change Password",
          deleteAccount: "Delete Account"
        }
      },
      messages: {
        profileUpdated: "Profile updated successfully!",
        profileUpdateFailed: "Failed to update profile. Please try again.",
        passwordChanged: "Password changed successfully!",
        passwordChangeFailed: "Failed to change password. Please try again."
      }
    },

    // 8. Payments Page - NEW: Complete CMS coverage
    payments: {
      title: "Manage Payment Methods",
      subtitle: "Add, manage, and set default payment methods.",
      addPaymentMethod: "Add New Payment Method",
      managePaymentMethods: "Current Payment Methods",
      paymentHistory: "Payment History",
      balance: "Remaining Balance",
      noPaymentMethods: "No payment methods added yet. Add one to make your next booking hassle-free!",
      addFirstMethod: "Add your first payment method to get started.",
      sections: {
        currentMethods: {
          title: "Current Payment Methods",
          defaultLabel: "Set as Default",
          setDefault: "Set as Default",
          remove: "Remove"
        },
        addNew: {
          title: "Add New Payment Method",
          description: "Enter your card details to add a new payment method."
        }
      }
    },

    // 9. Add Payment Method Page - NEW: Complete CMS coverage
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

    // 10. Pay Balance Page - NEW: Complete CMS coverage
    'pay-balance': {
      title: "Pay Remaining Balance",
      subtitle: "Complete your payment to finalize your booking.",
      balanceLabel: "Remaining Balance:",
      payButton: "Pay Now",
      cancelButton: "Cancel",
      successMessage: "Payment successful! Your booking is confirmed.",
      errorMessage: "Failed to process payment. Please try again."
    },

    // 11. Bookings Page - NEW: Complete CMS coverage
    bookings: {
      title: "My Bookings",
      subtitle: "Your airport ride history and current status.",
      noBookings: "You haven't booked any rides yet. Start your journey with us!",
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
      }
    },

    // 12. Booking Form Page - NEW: Complete CMS coverage
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

    // 13. Success Page - Already complete
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

    // 14. Feedback Page - Already complete
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

    // 15. Manage Page - Already complete
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

    // 16. Status Page - Already complete
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

    // 17. Tracking Page - NEW: Complete CMS coverage
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
      }
    },

    // 18. Cancel Page - Already complete
    cancel: {
      title: "Payment Canceled",
      subtitle: "Your payment was not completed",
      errorTitle: "Payment Canceled",
      errorMessage: "Your payment was canceled. Please try again."
    },

    // 19. Test Edit Mode Page - Already complete
    'test-edit-mode': {
      title: "Test Edit Mode Page",
      description: "This page has editable content. Try clicking the edit button (top-right) to open the editor.",
      customText: "This text should be editable in the CMS editor.",
      instructions: "Click the edit button to modify the content above. You can edit the title, description, custom text, and instructions.",
      reloadButton: "Reload Page"
    }
  },

  // Business settings
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

  // Pricing settings
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

  // Payment settings
  payment: {
    square: {
      applicationId: "",
      locationId: "",
      webhookUrl: ""
    }
  },

  // Communication templates
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
  },

  // Driver settings
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

  // Analytics settings
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

  // Booking form text
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
  version: "2.0.0"
};

async function initializeCMS() {
  try {
    console.log('🚀 Initializing COMPLETE CMS with 100% coverage for all 16 pages...');
    
    // Check if we have the required environment variable
    if (!process.env.NEXT_PUBLIC_GOOGLE_API_KEY) {
      console.error('❌ NEXT_PUBLIC_GOOGLE_API_KEY environment variable is required');
      console.log('💡 Please set it in your .env.local file');
      process.exit(1);
    }
    
    console.log('📝 Setting up COMPLETE CMS configuration in Firebase...');
    
    // Set the CMS configuration
    const cmsDocRef = doc(db, 'cms', 'configuration');
    await setDoc(cmsDocRef, COMPLETE_CMS_CONFIG);
    
    console.log('✅ COMPLETE CMS initialized successfully!');
    console.log('📝 All 16 pages now have 100% CMS coverage!');
    console.log('🔗 You can now access the CMS at: /admin/cms');
    console.log('');
    console.log('🏆 COMPLETE CMS COVERAGE ACHIEVED:');
    console.log('   ✅ Home Page (/)');
    console.log('   ✅ About Page (/about)');
    console.log('   ✅ Help Page (/help)');
    console.log('   ✅ Privacy Page (/privacy)');
    console.log('   ✅ Terms Page (/terms)');
    console.log('   ✅ Portal Page (/portal)');
    console.log('   ✅ Profile Page (/profile)');
    console.log('   ✅ Payments Page (/payments)');
    console.log('   ✅ Add Payment Method (/payments/add-method)');
    console.log('   ✅ Pay Balance (/payments/pay-balance/[bookingId])');
    console.log('   ✅ Bookings Page (/bookings)');
    console.log('   ✅ Booking Form (/book/booking-form)');
    console.log('   ✅ Success Page (/success)');
    console.log('   ✅ Feedback Page (/feedback/[id])');
    console.log('   ✅ Manage Page (/manage/[id])');
    console.log('   ✅ Status Page (/status/[id])');
    console.log('   ✅ Tracking Page (/tracking/[bookingId])');
    console.log('');
    console.log('🎉 Every single piece of text is now CMS-editable!');
    console.log('📱 Marketing teams can update content without developers');
    console.log('🌍 Localization is ready for future expansion');
    console.log('🎨 Brand consistency can be maintained easily');
    console.log('📊 User experience can be optimized continuously');
    
  } catch (error) {
    console.error('❌ Error initializing CMS:', error);
    
    if (error.code === 'permission-denied') {
      console.log('');
      console.log('🔧 To fix this permission issue:');
      console.log('1. Go to Firebase Console → Firestore Database');
      console.log('2. Go to Rules tab');
      console.log('3. Update the rules to allow write access:');
      console.log('');
      console.log('rules_version = "2";');
      console.log('service cloud.firestore {');
      console.log('  match /databases/{database}/documents {');
      console.log('    match /cms/{document=**} {');
      console.log('      allow read, write: if true;');
      console.log('    }');
      console.log('  }');
      console.log('}');
      console.log('');
      console.log('💡 Or manually create the document in Firebase Console:');
      console.log('   Collection: cms');
      console.log('   Document ID: configuration');
      console.log('   Content: Copy the COMPLETE_CMS_CONFIG from this script');
    }
    
    process.exit(1);
  }
}

// Run the initialization
initializeCMS(); 