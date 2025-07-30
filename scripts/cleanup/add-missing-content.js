const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc, updateDoc } = require('firebase/firestore');

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

// Missing content that needs to be added to the database
const MISSING_CONTENT = {
  // Success page content
  "pages.success": {
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

  // Additional booking form content
  "bookingForm": {
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
  },

  // Homepage content updates
  "pages.home": {
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
  }
};

async function addMissingContent() {
  try {
    console.log('🚀 Adding missing content to CMS...');
    
    // Check if we have the required environment variable
    if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
      console.error('❌ NEXT_PUBLIC_FIREBASE_API_KEY environment variable is required');
      console.log('💡 Please set it in your .env.local file');
      process.exit(1);
    }
    
    console.log('📝 Reading existing CMS configuration...');
    
    // Get the current CMS configuration
    const cmsDocRef = doc(db, 'cms', 'configuration');
    const docSnap = await getDoc(cmsDocRef);
    
    if (!docSnap.exists()) {
      console.log('❌ No CMS configuration found. Please run npm run init-cms first.');
      process.exit(1);
    }
    
    const currentConfig = docSnap.data();
    console.log('✅ Found existing CMS configuration');
    
    // Prepare updates
    const updates = {};
    
    // Add missing content
    for (const [path, content] of Object.entries(MISSING_CONTENT)) {
      const keys = path.split('.');
      let current = updates;
      
      // Build nested structure
      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (!current[key]) {
          current[key] = {};
        }
        current = current[key];
      }
      
      // Set the content
      const lastKey = keys[keys.length - 1];
      current[lastKey] = content;
      
      console.log(`📝 Adding content for: ${path}`);
    }
    
    console.log('📝 Updating CMS with missing content...');
    
    // Update the database
    await updateDoc(cmsDocRef, updates);
    
    console.log('✅ Successfully added missing content to CMS!');
    console.log('');
    console.log('📋 Content that was added:');
    console.log('   • Success page messages and titles');
    console.log('   • Additional booking form labels and descriptions');
    console.log('   • Updated homepage hero and features');
    console.log('   • Form placeholders and error messages');
    console.log('');
    console.log('🎉 All existing content is now preserved and editable!');
    
  } catch (error) {
    console.error('❌ Error adding missing content:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    process.exit(1);
  }
}

addMissingContent(); 