import { NextRequest, NextResponse } from 'next/server';
import { cmsService } from '@/lib/services/cms-service';

function sliceConfigByPage(fullConfig: any, page: string | null) {
  if (!page) return fullConfig;
  const pages = fullConfig?.pages || {};
  const sliced: any = { pages: {} };
  if (pages[page]) {
    sliced.pages[page] = pages[page];
  }
  // include common sections used globally
  if (fullConfig.footer) sliced.footer = fullConfig.footer;
  if (fullConfig.business) sliced.business = fullConfig.business;
  return sliced;
}

// Ensure this route runs in the Node.js runtime (not Edge) to avoid firebase-admin issues
export const runtime = 'nodejs';
// Disable ISR/caching for CMS API
export const revalidate = 0;
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page');
    
    console.log('Fetching CMS configuration from Firebase...');
    
    // Get real data from Firebase
    let cmsConfig: any = await cmsService.getCMSConfiguration();
    
    // If no data exists in Firebase, create it with default data
    if (!cmsConfig) {
      console.log('No CMS configuration found in Firebase, creating with default data...');
      cmsConfig = {
        pages: {},
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
            primaryColor: 'var(--primary-color)',
            secondaryColor: 'var(--secondary-color)',
            logoUrl: '/NewLogoNoBackground.svg'
          }
        },
        pricing: {
          baseFare: 50,
          perMile: 2.5,
          perMinute: 0.5,
          depositPercent: 25,
          bufferMinutes: 60,
          cancellation: {
            over24hRefundPercent: 100,
            between3And24hRefundPercent: 50,
            under3hRefundPercent: 0
          },
          zones: []
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
          errorLoadLocations: 'Could not load locations. Please try again later.',
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
    }
    
    // Ensure the requested page exists in the configuration
    if (page && (!cmsConfig.pages || !cmsConfig.pages[page])) {
      console.log(`Page '${page}' not found in CMS data, adding default content...`);
      
      // Add default content for the missing page
      if (!cmsConfig.pages) cmsConfig.pages = {};
      
      // Create default content for any page
      const defaultPageContent: any = {
        title: `${page.charAt(0).toUpperCase() + page.slice(1)} Page`,
        subtitle: `Welcome to the ${page} page`,
        description: `This is the ${page} page content. You can edit this content using the CMS.`,
        hero: {
          title: `${page.charAt(0).toUpperCase() + page.slice(1)}`,
          subtitle: `Welcome to ${page}`,
          description: `This is the ${page} page. You can customize this content.`,
          primaryButton: 'Get Started',
          secondaryButton: 'Learn More'
        },
        content: {
          title: 'Page Content',
          description: 'This content can be edited through the CMS.',
          sections: [
            {
              title: 'Section 1',
              description: 'This is the first section of content.'
            },
            {
              title: 'Section 2', 
              description: 'This is the second section of content.'
            }
          ]
        }
      };
      
      // Add specific content for known pages
      if (page === 'test-edit-mode') {
        defaultPageContent.title = 'Test Edit Mode Page';
        defaultPageContent.description = 'This page has editable content. Try clicking the edit button (top-right) to open the editor.';
        defaultPageContent.customText = 'This text should be editable in the CMS editor.';
        defaultPageContent.instructions = 'Click the edit button to modify the content above. You can edit the title, description, custom text, and instructions.';
        defaultPageContent.reloadButton = 'Reload Page';
      } else if (page === 'home') {
        defaultPageContent.title = 'Fairfield Airport Cars';
        defaultPageContent.subtitle = 'Premium Airport Transportation';
        defaultPageContent.description = 'Reliable, professional, and luxurious transportation to and from all major airports in the NY and CT area.';
        defaultPageContent.hero.title = 'Professional Airport Transportation';
        defaultPageContent.hero.subtitle = 'Reliable rides to and from Fairfield Airport';
        defaultPageContent.hero.description = 'Book your ride with confidence. Professional drivers, clean vehicles, and on-time service guaranteed.';
        defaultPageContent.hero.primaryButton = 'Book Now';
        defaultPageContent.hero.secondaryButton = 'Learn More';
      } else if (page === 'booking') {
        defaultPageContent.hero = {
          title: 'Complete Your Booking',
          subtitle: 'Fill in your details below',
          description: 'Provide trip details to proceed',
          primaryButton: 'Book Now',
          secondaryButton: 'Learn More'
        };
        // Nested defaults for edit page strings
        (defaultPageContent as any).edit = {
          title: 'Edit Booking',
          loading: { message: 'Please wait while we fetch your booking details...' },
          error: { description: 'This could be due to an invalid booking ID or a temporary system issue.' },
          not_found: {
            title: '❌ Booking Not Found',
            description: 'No booking found with the provided ID'
          }
        };
        // Form labels and placeholders used in booking form
        (defaultPageContent as any).form = {
          full_name: 'Full Name',
          full_name_placeholder: 'Enter your full name',
          email: 'Email Address',
          email_placeholder: 'Enter your email',
          phone: 'Phone Number',
          phone_placeholder: '(123) 456-7890',
          pickup: 'Pickup Location',
          pickup_placeholder: 'Enter pickup address',
          dropoff: 'Dropoff Location',
          dropoff_placeholder: 'Enter dropoff address',
          pickup_time: 'Pickup Date & Time',
          passengers: 'Number of Passengers',
          calculate_fare: 'Calculate Fare',
          calculating: 'Calculating...'
        };
        (defaultPageContent as any).fare = {
          vehicle_upgrade: 'Vehicle Upgrade:',
          service_level: 'Service Level:',
          total: 'Total:',
        };
      } else if (page === 'bookings') {
        defaultPageContent.title = 'My Bookings';
        defaultPageContent.subtitle = 'View and manage your airport rides';
        (defaultPageContent as any).no_bookings = "You haven't made any bookings yet. Book your first ride!";
        (defaultPageContent as any).book_first_ride = 'Book Your First Ride';
        (defaultPageContent as any).book_new_ride = 'Book New Ride';
        (defaultPageContent as any).view_details = 'View Details';
        (defaultPageContent as any).track_ride = 'Track Ride';
        // Loading and auth prompts
        (defaultPageContent as any).loading = {
          initializing: 'Initializing bookings...',
          loading_bookings: 'Loading your bookings...'
        };
        (defaultPageContent as any).login_required = 'Please log in to view your bookings.';
        (defaultPageContent as any).go_to_login = 'Go to Login';
        (defaultPageContent as any).no_bookings_title = 'No Bookings Yet';
      } else if (page === 'payments') {
        defaultPageContent.title = 'My Payments';
        defaultPageContent.subtitle = 'Manage your payment methods and view transaction history';
        (defaultPageContent as any).add_payment_method = 'Add Payment Method';
        (defaultPageContent as any).no_payment_methods = 'No payment methods saved yet.';
        (defaultPageContent as any).add_first_method = 'Add Payment Method';
        (defaultPageContent as any).edit_method = 'Edit';
        (defaultPageContent as any).set_default = 'Set Default';
        (defaultPageContent as any).no_payments = 'No payment history yet.';
        (defaultPageContent as any).payment_method = 'Payment Method:';
        (defaultPageContent as any).transaction_id = 'Transaction ID:';
        (defaultPageContent as any).view_booking = 'View Booking';
        (defaultPageContent as any).pay_balance = 'Pay Balance';
        (defaultPageContent as any).section_methods = 'Payment Methods';
        (defaultPageContent as any).section_history = 'Payment History';
        (defaultPageContent as any).loading = {
          initializing: 'Initializing payments...',
          loading_info: 'Loading your payment information...'
        };
        (defaultPageContent as any).login_required = 'Please log in to view your payments.';
        (defaultPageContent as any).go_to_login = 'Go to Login';
        (defaultPageContent as any).add_method = {
          title: 'Add Payment Method',
          subtitle: 'Securely add a new payment method to your account',
          card_number: 'Card Number',
          cardholder_name: 'Cardholder Name',
          expiry_month: 'Expiry Month',
          expiry_year: 'Expiry Year',
          cvv: 'CVV',
          set_default: 'Set as default payment method',
          save_button: 'Add Payment Method',
          cancel_button: 'Cancel',
          security_notice: 'Your payment information is encrypted and securely processed by Square. We do not store your full card details on our servers.',
          ssl_notice: '256-bit SSL encryption',
          initializing: 'Initializing...',
          loading: 'Loading...',
          login_required: 'Please log in to add payment methods.',
          go_to_login: 'Go to Login'
        };
        (defaultPageContent as any).balance = {
          title: 'Pay Remaining Balance',
          subtitle: 'Complete your payment for booking #',
          booking_summary: 'Booking Summary',
          passenger: 'Passenger',
          status: 'Status',
          pickup: 'Pickup',
          dropoff: 'Dropoff',
          driver: 'Driver',
          vehicle: 'Vehicle',
          payment_summary: 'Payment Summary',
          remaining_balance: 'Remaining Balance',
          payment_amount: 'Payment Amount',
          payment_amount_help: 'You can pay the full balance or a partial amount',
          pay_full: 'Pay Full Balance',
          pay_half: 'Pay Half',
          back: 'Back to Payments',
          pay_now: 'Pay Now',
          loading: 'Loading booking details...',
          not_found: 'Booking not found',
          paid: 'This booking is fully paid!',
          total_fare: 'Total Fare:',
          deposit_paid: 'Deposit Paid:',
          tip: 'Tip'
        };
      } else if (page === 'about') {
        defaultPageContent.title = 'About Fairfield Airport Cars';
        defaultPageContent.subtitle = 'Professional airport transportation services';
        defaultPageContent.description = 'We provide reliable, professional airport transportation throughout Fairfield County.';
        (defaultPageContent as any).hero = {
          title: 'About Fairfield Airport Cars',
          subtitle: 'Professional airport transportation services'
        };
        (defaultPageContent as any).cta = {
          subtitle: 'Ready to book your ride?',
          primaryButton: 'Book Your Ride',
          secondaryButton: 'Contact Us'
        };
      } else if (page === 'help') {
        defaultPageContent.title = 'Help & Support';
        defaultPageContent.subtitle = 'Quick answers and support';
        defaultPageContent.description = 'Find answers to common questions and get support when you need it.';
        (defaultPageContent as any).hero = {
          title: 'Help & Support',
          subtitle: 'Quick answers and support'
        };
        (defaultPageContent as any).quickAnswers = {
          title: 'Quick Answers',
          0: { question: 'How far in advance should I book?', answer: 'Book at least 24 hours in advance, especially during peak travel seasons.' },
          1: { question: 'Can I cancel my booking?', answer: 'Yes, cancel up to 4 hours before pickup for a full refund.' },
          2: { question: 'Do you track flights?', answer: 'Yes, we monitor flight schedules and adjust pickup times accordingly.' },
          3: { question: 'What payment methods do you accept?', answer: 'All major credit cards, debit cards, and cash payments.' }
        } as any;
        (defaultPageContent as any).contact = {
          title: 'Need More Help?',
          subtitle: 'Contact our support team',
          primaryButton: 'Call Support',
          secondaryButton: 'Email Support',
          tertiaryButton: 'Book a Ride'
        };
      } else if (page === 'privacy') {
        defaultPageContent.title = '🔒 Privacy Policy';
        defaultPageContent.effectiveDate = 'Effective Date: January 1, 2024 | Last Updated: January 1, 2024';
        defaultPageContent.description = 'Your privacy is important to us. This policy describes how we collect, use, and protect your information.';
        (defaultPageContent as any).sections = {
          0: {
            title: '1. Information We Collect',
            content: 'We collect information you provide directly to us when you book our services, including:',
            items: [
              'Name and contact information (phone, email, address)',
              'Pickup and destination locations',
              'Travel dates and times',
              'Flight information (when applicable)',
              'Payment information',
              'Special requests or preferences'
            ]
          },
          1: {
            title: '2. How We Use Information',
            content: 'We use the information we collect to:',
            items: [
              'Provide and coordinate transportation services',
              'Process payments and send confirmations',
              'Communicate with you about your bookings',
              'Send service updates and notifications',
              'Improve our services and customer experience',
              'Comply with legal obligations'
            ]
          },
          2: {
            title: '3. Information Sharing',
            content: 'We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:',
            items: [
              'With our drivers to coordinate your transportation',
              'With payment processors to handle transactions',
              'When required by law or legal process',
              'To protect our rights, property, or safety',
              'With your explicit consent'
            ]
          }
        } as any;
      } else if (page === 'terms') {
        defaultPageContent.title = '📋 Terms of Service';
        defaultPageContent.lastUpdated = 'Effective Date: January 1, 2024 | Last updated: January 2024';
        defaultPageContent.intro = 'Welcome to Fairfield Airport Cars. By using our service, you agree to these terms and conditions.';
        defaultPageContent.serviceDescription = 'We provide airport transportation services in the Fairfield area, including pickup and drop-off at local airports.';
        (defaultPageContent as any).sections = {
          0: { title: 'Booking', content: 'All bookings must be made through our website or by phone. We require at least 24 hours notice for all reservations.' },
          1: { title: 'Payment', content: 'Payment is processed through Square. We accept all major credit cards and digital payments.' },
          2: { title: 'Cancellation Policy', content: 'Cancellations made more than 24 hours before pickup receive a full refund. Cancellations within 24 hours receive a 50% refund. No refunds for cancellations within 3 hours of pickup.' },
          3: { title: 'Liability', content: 'We are not responsible for delays due to weather, traffic, or other circumstances beyond our control. We recommend allowing extra time for airport arrivals.' },
          4: { title: 'Contact', content: 'For questions about these terms, please contact us at the information provided on our website.' }
        } as any;
      } else if (page === 'portal') {
        (defaultPageContent as any).welcome = {
          title: '👋 Welcome to Your Portal',
          description: 'Manage your Fairfield Airport Cars account, bookings, and preferences from this central hub. Your reliable transportation partner is just a click away.'
        };
        (defaultPageContent as any).features = {
          title: '🎯 Portal Features',
          description: 'Access all available services and account management tools'
        };
        (defaultPageContent as any).stats = {
          title: '📊 Account Overview',
          description: 'Your account activity and statistics'
        };
      } else if (page === 'profile') {
        defaultPageContent.title = 'My Profile';
        defaultPageContent.subtitle = 'Manage your account';
        defaultPageContent.description = 'Update your personal information, preferences, and account settings.';
        (defaultPageContent as any).name_label = 'Full Name';
        (defaultPageContent as any).email_label = 'Email Address';
        (defaultPageContent as any).email_note = 'Email cannot be changed';
        (defaultPageContent as any).phone_label = 'Phone Number';
        (defaultPageContent as any).edit_profile = 'Edit Profile';
        (defaultPageContent as any).save_button = 'Save Changes';
        (defaultPageContent as any).cancel_button = 'Cancel';
        (defaultPageContent as any).default_pickup_label = 'Default Pickup Location';
        (defaultPageContent as any).default_dropoff_label = 'Default Dropoff Location';
        (defaultPageContent as any).notifications_label = 'Notification Settings';
        (defaultPageContent as any).email_notifications = 'Email Notifications';
        (defaultPageContent as any).sms_notifications = 'SMS Notifications';
        (defaultPageContent as any).section_personal = 'Personal Information';
        (defaultPageContent as any).section_booking = 'Booking Preferences';
        (defaultPageContent as any).section_notifications = 'Notification Preferences';
        (defaultPageContent as any).section_account = 'Account Information';
        (defaultPageContent as any).name_placeholder = 'Enter your full name';
        (defaultPageContent as any).phone_placeholder = 'Enter your phone number';
        (defaultPageContent as any).default_pickup_placeholder = 'e.g., Fairfield Airport';
        (defaultPageContent as any).default_dropoff_placeholder = 'e.g., Downtown Fairfield';
        (defaultPageContent as any).loading = {
          initializing: 'Initializing profile...',
          loading_profile: 'Loading your profile...'
        };
        (defaultPageContent as any).login_required = 'Please log in to view your profile.';
        (defaultPageContent as any).go_to_login = 'Go to Login';
      } else if (page === 'feedback') {
        (defaultPageContent as any).loading = { message: 'Please wait while we fetch your booking details...' };
        (defaultPageContent as any).error = { description: 'This could be due to an invalid booking ID or a temporary system issue.' };
        (defaultPageContent as any).success = {
          title: 'Thank you for your feedback!',
          description: 'Your feedback helps us improve our service'
        };
        defaultPageContent.title = "We'd love to hear about your experience";
        defaultPageContent.description = 'Please share your feedback about your recent ride';
        (defaultPageContent as any).rating = { label: 'Rating' };
        (defaultPageContent as any).comment = { label: 'Comments', placeholder: 'Tell us about your experience...' };
        (defaultPageContent as any).submit = { button: 'Submit Feedback' };
        (defaultPageContent as any).actions = {
          try_again: '🔄 Try Again',
          contact_support: '📞 Contact Support'
        };
      } else if (page === 'status') {
        (defaultPageContent as any).loading = { message: 'Please wait while we fetch your booking details...' };
        (defaultPageContent as any).error = { description: 'This could be due to an invalid booking ID or a temporary system issue.' };
        (defaultPageContent as any).confirmed = { description: 'Your ride is confirmed and driver assigned' };
        (defaultPageContent as any).enRoute = { description: 'Your driver is on the way to pick you up' };
        (defaultPageContent as any).arrived = { description: 'Your driver has arrived at the pickup location' };
        (defaultPageContent as any).completed = { description: 'Your ride has been completed successfully' };
        (defaultPageContent as any).cancelled = { description: 'This booking has been cancelled' };
        (defaultPageContent as any).unknown = { description: 'We are processing your booking request' };
        (defaultPageContent as any).estimatedArrival = { label: '⏰ Estimated Arrival:' };
        (defaultPageContent as any).actions = { tryAgain: 'Try Again', contactSupport: 'Contact Support' };
        (defaultPageContent as any).labels = {
          bookingId: 'Booking ID:',
          pickup: 'Pickup:',
          dropoff: 'Dropoff:',
          date: 'Date:',
          time: 'Time:',
          fare: 'Fare:'
        };
      } else if (page === 'bookingDetails') {
        // Ensure booking details page also has fare_info helper strings
        (defaultPageContent as any).fare_info = {
          includes_fees: 'Includes all fees and taxes'
        };
      } else if (page === 'manage') {
        (defaultPageContent as any).labels = {
          bookingId: 'Booking ID:',
          status: 'Status:',
          passenger: 'Passenger:',
          route: 'Route:',
          pickupTime: 'Pickup Time:',
          totalFare: 'Total Fare:',
          balanceDue: 'Balance Due:'
        };
        (defaultPageContent as any).actionMessage = '';
      }
      
      cmsConfig.pages[page] = defaultPageContent;
      
      // Save just the new page content to Firebase using the page-specific method
      try {
        const result = await cmsService.updatePageContent(page, cmsConfig.pages[page]);
        if (result.success) {
          console.log(`Default content for page '${page}' saved to Firebase`);
        } else {
          console.error('Failed to save page content to Firebase:', result.errors);
          // Continue with in-memory data even if save fails
        }
      } catch (error) {
        console.warn('Error saving page content to Firebase, but continuing with in-memory data:', error);
      }
    }
    
    console.log('CMS configuration loaded:', cmsConfig);
    return NextResponse.json(sliceConfigByPage(cmsConfig, page));
    
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
    const { fieldPath, value } = body;
    
    if (!fieldPath || value === undefined) {
      return NextResponse.json(
        { error: 'Missing fieldPath or value' },
        { status: 400 }
      );
    }
    
    console.log('Updating field:', fieldPath, '=', value);
    
    // Use the page-specific update method instead of the full config update
    const pathParts = fieldPath.split('.');
    if (pathParts[0] === 'pages' && pathParts.length >= 3) {
      const pageType = pathParts[1];
      const fieldName = pathParts[2];
      
      // Get current page data
      const currentData = await cmsService.getCMSConfiguration();
      const currentPageData = currentData?.pages?.[pageType as keyof typeof currentData.pages] || {};
      
      // Update only the specific field
      const updatedPageData = {
        ...currentPageData,
        [fieldName]: value
      };
      
      // Use the page-specific update method
      const result = await cmsService.updatePageContent(pageType, updatedPageData);
      
      if (result.success) {
        console.log('CMS field updated successfully');
        return NextResponse.json({ success: true });
      } else {
        console.error('Failed to update CMS field:', result.errors);
        return NextResponse.json(
          { error: result.errors?.join(', ') || 'Failed to save' },
          { status: 500 }
        );
      }
    } else {
      // Fallback to full config update for non-page fields
      const pathParts = fieldPath.split('.');
      const nested: any = {};
      let cursor: any = nested;
      for (let i = 0; i < pathParts.length - 1; i++) {
        cursor[pathParts[i]] = {};
        cursor = cursor[pathParts[i]];
      }
      cursor[pathParts[pathParts.length - 1]] = value;
      
      const result = await cmsService.updateCMSConfiguration(nested);
      
      if (result.success) {
        console.log('CMS field updated successfully');
        return NextResponse.json({ success: true });
      } else {
        console.error('Failed to update CMS field:', result.errors);
        return NextResponse.json(
          { error: result.errors?.join(', ') || 'Failed to save' },
          { status: 500 }
        );
      }
    }
  } catch (error) {
    console.error('CMS update error:', error);
    return NextResponse.json(
      { error: 'Failed to update CMS configuration' },
      { status: 500 }
    );
  }
}
