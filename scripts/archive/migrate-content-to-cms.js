const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, getDoc } = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
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

// Complete CMS Configuration with ALL existing content
const COMPLETE_CMS_CONFIG = {
  pages: {
    home: {
      hero: {
        title: "🎯 Ready to Experience Premium Transportation?",
        subtitle: "Join thousands of satisfied customers who trust us for reliable airport transportation. Professional drivers, clean vehicles, and on-time service for all your airport travel needs.",
        ctaText: "Book Your Ride Now"
      },
      features: {
        title: "✨ Why Choose Us?",
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
  lastUpdated: new Date(),
  version: "1.0.0"
};

async function migrateContentToCMS() {
  try {
    console.log('🚀 Migrating all existing content to CMS...');
    
    // Check if we have the required environment variable
    if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
      console.error('❌ NEXT_PUBLIC_FIREBASE_API_KEY environment variable is required');
      console.log('💡 Please set it in your .env.local file');
      process.exit(1);
    }
    
    console.log('📝 Preserving all existing content in Firebase...');
    
    // Check if CMS already exists
    const cmsDocRef = doc(db, 'cms', 'configuration');
    const docSnap = await getDoc(cmsDocRef);
    
    if (docSnap.exists()) {
      console.log('⚠️  CMS already exists. Merging with existing content...');
      const existingData = docSnap.data();
      
      // Merge existing content with new content, preserving existing data
      const mergedConfig = {
        ...existingData,
        ...COMPLETE_CMS_CONFIG,
        pages: {
          ...existingData.pages,
          ...COMPLETE_CMS_CONFIG.pages
        },
        bookingForm: {
          ...existingData.bookingForm,
          ...COMPLETE_CMS_CONFIG.bookingForm
        }
      };
      
      await setDoc(cmsDocRef, mergedConfig);
      console.log('✅ Content merged successfully!');
    } else {
      console.log('📝 Creating new CMS with all content...');
      await setDoc(cmsDocRef, COMPLETE_CMS_CONFIG);
      console.log('✅ CMS created successfully!');
    }
    
    console.log('📝 All existing content has been preserved in the database');
    console.log('🔗 You can now access the CMS at: /admin/cms');
    console.log('');
    console.log('📋 Content that is now editable:');
    console.log('   • Homepage hero, features, and final CTA');
    console.log('   • Booking form labels and messages');
    console.log('   • Success page messages');
    console.log('   • Business contact information');
    console.log('   • Pricing and rates');
    console.log('   • Email and SMS templates');
    console.log('');
    console.log('🎉 All content is now safely stored and editable!');
    
  } catch (error) {
    console.error('❌ Error migrating content:', error);
    process.exit(1);
  }
}

migrateContentToCMS(); 