const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, getDoc } = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Missing content that needs to be added
const missingContent = {
  pages: {
    success: {
      loading: {
        title: "Processing Your Booking",
        message: "Please wait while we confirm your reservation..."
      },
      error: {
        title: "Booking Error",
        message: "We encountered an issue processing your booking. Please try again or contact support."
      },
      paymentSuccess: {
        title: "Payment Successful!",
        message: "Your payment has been processed successfully."
      },
      bookingCreated: {
        title: "Booking Confirmed!",
        message: "Your airport transportation has been booked successfully."
      },
      tripDetails: {
        title: "Trip Details",
        description: "Here are the details of your upcoming trip:"
      },
      paymentStatus: {
        title: "Payment Status",
        description: "Your payment has been processed and confirmed."
      },
      nextSteps: {
        title: "What Happens Next?",
        description: "Here's what you can expect:",
        items: [
          "You'll receive a confirmation email with all trip details",
          "Your driver will contact you 30 minutes before pickup",
          "We'll send SMS updates about your driver's arrival",
          "Your driver will meet you at the specified pickup location"
        ]
      },
      emergency: {
        title: "Emergency Contact",
        description: "If you need immediate assistance:",
        phone: "(555) 123-4567",
        note: "Available 24/7 for urgent matters"
      }
    },
    help: {
      sections: {
        booking: {
          title: "Booking Process",
          description: "How to book your airport transportation"
        },
        payment: {
          title: "Payment & Pricing",
          description: "Understanding our pricing and payment options"
        },
        service: {
          title: "Service Details",
          description: "What to expect from our service"
        },
        airport: {
          title: "Airport Information",
          description: "Airport pickup and drop-off details"
        },
        app: {
          title: "Using Our App",
          description: "How to use our booking platform"
        },
        emergency: {
          title: "Emergency Support",
          description: "24/7 customer support and emergency contacts"
        }
      },
      faq: {
        title: "Frequently Asked Questions",
        items: [
          {
            question: "How far in advance should I book?",
            answer: "We recommend booking at least 24 hours in advance for guaranteed availability.",
            category: "booking"
          },
          {
            question: "What payment methods do you accept?",
            answer: "We accept all major credit cards, debit cards, and digital wallets.",
            category: "payment"
          },
          {
            question: "Can I cancel my booking?",
            answer: "Yes, you can cancel up to 3 hours before pickup for a full refund.",
            category: "cancellation"
          },
          {
            question: "What if my flight is delayed?",
            answer: "We monitor flight status and automatically adjust pickup times for delays.",
            category: "service"
          }
        ]
      },
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

async function addMissingContent() {
  try {
    console.log('🚀 Adding missing content to CMS...');
    
    // Check environment variables
    if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
      throw new Error('NEXT_PUBLIC_FIREBASE_API_KEY environment variable is required');
    }
    
    const cmsDocRef = doc(db, 'cms', 'configuration');
    const docSnap = await getDoc(cmsDocRef);
    
    if (docSnap.exists()) {
      const existingData = docSnap.data();
      console.log('📄 Found existing CMS configuration');
      
      // Merge with existing data
      const mergedConfig = {
        ...existingData,
        pages: {
          ...existingData.pages,
          ...missingContent.pages
        },
        bookingForm: {
          ...existingData.bookingForm,
          ...missingContent.bookingForm
        }
      };
      
      console.log('💾 Updating CMS configuration...');
      await setDoc(cmsDocRef, mergedConfig);
      console.log('✅ Successfully added missing content to CMS!');
      
      console.log('📋 Added content includes:');
      console.log('  - Success page messages and titles');
      console.log('  - Help page sections and FAQ');
      console.log('  - Booking form descriptions and placeholders');
      console.log('  - Error messages and success messages');
      
    } else {
      console.log('📄 No existing CMS configuration found, creating new one...');
      await setDoc(cmsDocRef, missingContent);
      console.log('✅ Successfully created new CMS configuration!');
    }
    
  } catch (error) {
    console.error('❌ Error adding missing content:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    process.exit(1);
  }
}

addMissingContent(); 