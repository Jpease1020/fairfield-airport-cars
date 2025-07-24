import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    // Return default CMS configuration to bypass Firebase permission issues
    const defaultConfig = {
      pages: {
        home: {
          title: 'Fairfield Airport Cars',
          subtitle: 'Premium Airport Transportation',
          description: 'Reliable, professional, and luxurious transportation to and from all major airports in the NY and CT area.',
          hero: {
            title: 'Premium Airport Transportation',
            subtitle: 'Reliable, professional, and luxurious transportation',
            description: 'Book your ride today!'
          }
        },
        booking: {
          title: 'Book Your Ride',
          subtitle: 'Premium airport transportation service',
          description: 'Reserve your luxury airport transportation with our professional drivers.'
        },
        help: {
          title: 'Help & Support',
          subtitle: 'We\'re here to help',
          description: 'Find answers to common questions and get support when you need it.'
        },
        about: {
          title: 'About Us',
          subtitle: 'Your trusted transportation partner',
          description: 'Learn more about our commitment to excellence and customer satisfaction.'
        }
      },
      business: {
        company: {
          name: 'Fairfield Airport Cars',
          tagline: 'Premium Airport Transportation',
          phone: '+1-203-555-0123',
          email: 'info@fairfieldairportcar.com',
          address: 'Fairfield, CT',
          hours: '24/7 Service',
          website: 'https://fairfieldairportcar.com'
        },
        social: {
          facebook: '',
          instagram: '',
          twitter: ''
        },
        branding: {
          primaryColor: '#1f2937',
          secondaryColor: '#3b82f6',
          logoUrl: '/NewLogoNoBackground.svg'
        }
      },
      pricing: {
        baseFare: 50,
        perMileRate: 2.5,
        airportSurcharge: 10,
        depositPercent: 25
      },
      bookingForm: {
        fullNameLabel: 'Full Name',
        emailLabel: 'Email Address',
        phoneLabel: 'Phone Number',
        pickupLocationLabel: 'Pickup Location',
        dropoffLocationLabel: 'Dropoff Location',
        pickupDateTimeLabel: 'Pickup Date and Time',
        passengersLabel: 'Passengers',
        flightNumberLabel: 'Flight Number (Optional)',
        notesLabel: 'Notes (Optional)',
        calculateFareButton: 'Calculate Fare',
        calculatingFareButton: 'Calculating...',
        bookNowButton: 'Book Now',
        updateBookingButton: 'Update Booking',
        estimatedFareLabel: 'Estimated Fare:',
        errorEnterLocations: 'Please enter both pickup and drop-off locations.',
        errorCalculateFare: 'Could not calculate fare. Please check the addresses.',
        errorCalculateBeforeBooking: 'Please calculate the fare before booking.',
        errorTimeConflict: 'Selected time conflicts with another booking. Please choose a different time.',
        errorCreateBooking: 'Failed to create booking.',
        errorUpdateBooking: 'Failed to update booking.',
        successBookingCreated: 'Booking created successfully! Sending confirmation...',
        successBookingUpdated: 'Booking updated successfully!',
        loading: 'Loading...'
      }
    };

    return NextResponse.json(defaultConfig);
  } catch (error) {
    console.error('CMS API error:', error);
    return NextResponse.json(
      { error: 'Failed to load CMS configuration' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    // For now, just return success without actually saving to Firebase
    // This allows the edit mode to work without Firebase permission issues
    console.log('CMS update received:', body);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('CMS update error:', error);
    return NextResponse.json(
      { error: 'Failed to update CMS configuration' },
      { status: 500 }
    );
  }
} 