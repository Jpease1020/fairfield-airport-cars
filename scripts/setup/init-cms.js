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

// Default CMS Configuration
const DEFAULT_CMS_CONFIG = {
  pages: {
    home: {
      hero: {
        title: "Fairfield Airport Car Service",
        subtitle: "Premium Transportation",
        ctaText: "Book Your Ride Now"
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
            title: "Luxury Vehicles",
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
      about: {
        title: "About Our Service",
        content: "We provide reliable airport transportation services in the Fairfield area. Our professional drivers ensure you arrive at your destination safely and on time."
      },
      contact: {
        title: "Get in Touch",
        content: "Contact us for any questions or to make your reservation. We're here to help ensure your journey is smooth and stress-free.",
        phone: "(555) 123-4567",
        email: "info@fairfieldairportcars.com"
      }
    },
    help: {
      faq: [
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
      ],
      contactInfo: {
        phone: "(555) 123-4567",
        email: "support@fairfieldairportcars.com",
        hours: "24/7"
      }
    },
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
    dropoffLocationLabel: "Destination",
    pickupDateTimeLabel: "Pickup Date and Time",
    passengersLabel: "Passengers",
    flightNumberLabel: "Flight Number (Optional)",
    notesLabel: "Special Instructions (Optional)",
    calculateFareButton: "Calculate Fare",
    calculatingFareButton: "Calculating...",
    bookNowButton: "Book Now",
    updateBookingButton: "Update Booking",
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
    errorCreateBooking: "Failed to create booking. Please try again."
  },
  lastUpdated: new Date(),
  version: "1.0.0"
};

async function initializeCMS() {
  try {
    console.log('🚀 Initializing CMS with default content...');
    
    // Check if we have the required environment variable
    if (!process.env.NEXT_PUBLIC_GOOGLE_API_KEY) {
      console.error('❌ NEXT_PUBLIC_GOOGLE_API_KEY environment variable is required');
      console.log('💡 Please set it in your .env.local file');
      process.exit(1);
    }
    
    console.log('📝 Setting up CMS configuration in Firebase...');
    
    // Set the CMS configuration
    const cmsDocRef = doc(db, 'cms', 'configuration');
    await setDoc(cmsDocRef, DEFAULT_CMS_CONFIG);
    
    console.log('✅ CMS initialized successfully!');
    console.log('📝 Default content has been loaded into Firebase');
    console.log('🔗 You can now access the CMS at: /admin/cms');
    console.log('');
    console.log('📋 What Gregg can now edit:');
    console.log('   • Homepage hero section and features');
    console.log('   • Business contact information');
    console.log('   • Pricing and rates');
    console.log('   • FAQ and help content');
    console.log('   • Email and SMS templates');
    console.log('');
    console.log('🎉 The entire app is now content-editable!');
    
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
      console.log('   Content: Copy the DEFAULT_CMS_CONFIG from src/types/cms.ts');
    }
    
    process.exit(1);
  }
}

// Run the initialization
initializeCMS(); 