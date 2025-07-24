import { NextResponse } from 'next/server';
import { cmsService } from '@/lib/services/cms-service';

export async function POST() {
  try {
    // Check if CMS is already initialized
    const existingConfig = await cmsService.getCMSConfiguration();
    
    // If CMS already has content, return success
    if (existingConfig && existingConfig.pages?.home?.hero?.title) {
      return NextResponse.json({ 
        success: true, 
        message: 'CMS already initialized',
        initialized: true 
      });
    }

    // Get business settings or use defaults
    const businessSettings = await cmsService.getBusinessSettings();
    
    // Initialize CMS with default configuration
    await cmsService.updateCMSConfiguration({
      pages: {
        home: {
          hero: {
            title: businessSettings?.company?.name || 'Fairfield Airport Car Service',
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
            subject: `Your ${businessSettings?.company?.name || 'Fairfield Airport Car Service'} Booking Confirmation`,
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
            body: "We hope you enjoyed your ride with ${businessSettings?.company?.name || 'Fairfield Airport Car Service'}. Please share your feedback!",
            sendDaysAfter: 1
          }
        },
        sms: {
          bookingConfirmation: "Your ${businessSettings?.company?.name || 'Fairfield Airport Car Service'} booking is confirmed for {pickupDateTime}. Driver details will be sent 30 minutes before pickup.",
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
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'CMS initialized successfully',
      initialized: true 
    });

  } catch (error) {
    console.error('Error initializing CMS:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to initialize CMS',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 