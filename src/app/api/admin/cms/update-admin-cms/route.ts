import { NextRequest, NextResponse } from 'next/server';
import { cmsService } from '@/lib/services/cms-service';

export const dynamic = 'force-dynamic';

// Admin CMS data structure - matches exactly what admin pages are using
const adminCMSData = {
  admin: {
    // Overview Page
    overview: {
      title: 'Admin Overview',
      subtitle: 'Quick access for Gregg: customer vs admin pages.',
      sections: {
        list: {
          title: 'Available Pages & Features'
        },
        customer: {
          title: 'Customer Pages & Features'
        },
        admin: {
          title: 'Admin Pages & Features'
        }
      }
    },

    // Dashboard Page
    dashboard: {
      loading: {
        message: 'Loading dashboard data...'
      },
      error: {
        message: 'Error loading dashboard data',
        loadFailed: 'Failed to load dashboard data. Please try again.'
      },
      sections: {
        stats: {
          title: '📊 Business Overview',
          description: 'Key metrics and performance indicators'
        },
        quickActions: {
          title: '⚡ Quick Actions',
          description: 'Common administrative tasks'
        },
        recentActivity: {
          title: '📈 Recent Activity',
          description: 'Latest bookings and system updates',
          noActivity: 'No recent activity to display'
        }
      },
      stats: {
        totalBookings: {
          title: 'Total Bookings',
          noBookings: 'No bookings yet',
          allTime: 'All time bookings'
        },
        activeDriver: {
          title: 'Active Driver',
          noDriver: 'Add driver to get started',
          available: 'Available now'
        },
        revenue: {
          title: 'Revenue This Month',
          noRevenue: 'No revenue yet',
          completed: 'Completed payments'
        },
        customerRating: {
          title: 'Customer Rating',
          average: 'Average rating'
        }
      },
      quickActions: {
        viewBookings: {
          title: 'View Bookings',
          description: 'See all current and past bookings'
        },
        manageDriver: {
          title: 'Manage Driver',
          description: 'Add, edit, or remove driver'
        },
        editContent: {
          title: 'Edit Content',
          description: 'Update website content and settings'
        },
        viewCalendar: {
          title: 'View Calendar',
          description: 'See upcoming bookings and availability'
        }
      },
      activity: {
        bookingTemplate: 'New booking from {name} - {location}',
        paymentTemplate: 'Payment received: {amount}'
      }
    },

    // Bookings Page
    bookings: {
      loading: {
        loadingBookings: 'Loading bookings from database...'
      },
      error: {
        loadBookingsFailed: 'Failed to load bookings from database',
        updateStatusFailed: 'Failed to update booking status',
        deleteBookingFailed: 'Failed to delete booking',
        assignDriverFailed: 'Failed to assign driver'
      },
      sections: {
        filter: {
          title: 'Filter by Status',
          allBookings: 'All Bookings',
          pending: 'Pending',
          confirmed: 'Confirmed',
          completed: 'Completed',
          cancelled: 'Cancelled'
        },
        stats: {
          totalBookings: 'Total Bookings',
          confirmed: 'Confirmed',
          inProgress: 'In Progress',
          totalRevenue: 'Total Revenue'
        },
        table: {
          noBookings: {
            title: 'No Bookings Found',
            description: 'No bookings match your current filter criteria.'
          },
          columns: {
            customer: 'Customer',
            route: 'Route',
            dateTime: 'Date & Time',
            status: 'Status',
            fare: 'Fare',
            actions: 'Actions'
          },
          actions: {
            confirm: 'Confirm',
            assignDriver: 'Assign Driver',
            delete: 'Delete'
          }
        }
      }
    },

    // Comments Page
    comments: {
      access: {
        accessDenied: 'Access Denied',
        description: 'You must be an admin to view this page.'
      },
      loading: {
        title: 'Loading Comments...'
      },
      header: {
        title: 'Comment Management',
        description: 'Manage all comments across the site'
      },
      filters: {
        title: 'Filters',
        search: {
          label: 'Search:',
          placeholder: 'Search comments, elements, or pages...'
        },
        status: {
          label: 'Status:',
          allStatuses: 'All Statuses',
          open: 'Open',
          inProgress: 'In Progress',
          resolved: 'Resolved'
        },
        page: {
          label: 'Page:',
          allPages: 'All Pages'
        }
      },
      export: {
        format: {
          label: 'Export Format:',
          csv: 'CSV',
          json: 'JSON'
        },
        exportButton: 'Export Comments',
        generateAnalytics: 'Generate Analytics'
      },
      list: {
        title: 'Comments',
        noComments: 'No comments found matching your filters.',
        comment: {
          pageTitle: 'Page:',
          element: 'Element:',
          elementLabel: 'Element:'
        }
      },
      confirmations: {
        deleteComment: 'Are you sure you want to delete this comment?'
      }
    },

    // Analytics Page
    analytics: {
      loading: {
        message: '🔄 Loading analytics...'
      },
      title: 'Analytics Dashboard',
      userInteractions: {
        description: 'User interactions, errors, and performance metrics'
      },
      refreshButton: 'Refresh',
      lastUpdated: 'Last updated: {timestamp}',
      noData: {
        title: 'No Analytics Data',
        message: 'Analytics data will appear here once users start interacting with the app.'
      },
      sections: {
        overview: {
          totalInteractions: {
            title: '📊 Total Interactions',
            description: 'All user interactions tracked'
          },
          totalErrors: {
            title: '⚠️ Total Errors',
            description: 'Errors detected and tracked'
          },
          errorRate: {
            title: '📉 Error Rate',
            description: 'Percentage of interactions with errors'
          },
          activeElements: {
            title: '🖱️ Active Elements',
            description: 'Different element types tracked'
          }
        },
        detailed: {
          topInteractionTypes: {
            title: 'Top Interaction Types'
          },
          topErrorTypes: {
            title: 'Top Error Types'
          },
          topElementTypes: {
            title: 'Most Interacted Elements'
          },
          recentActivity: {
            title: 'Recent Activity'
          },
          recentErrors: {
            title: 'Recent Errors',
            details: 'Type: {type} • Page: {page}'
          }
        }
      }
    },

    // Help Page
    help: {
      sections: {
        header: {
          printGuide: 'Print Guide',
          documentation: 'Documentation',
          contactSupport: 'Contact Support'
        },
        additionalResources: {
          title: '📞 Need More Help?',
          description: 'If you can\'t find the answer you\'re looking for, here are additional resources',
          technicalSupport: 'Contact your developer for technical support',
          businessDocs: 'Check the business documentation in your project files',
          cmsSettings: 'Review your CMS settings for configuration options',
          adminDashboard: 'Use the Admin Dashboard to monitor your business metrics'
        }
      },
      messages: {
        contactDeveloper: 'Contact your developer for technical support'
      }
    },

    // Costs Page
    costs: {
      sections: {
        stats: {
          totalMonthlyCost: {
            title: '💰 Total Monthly Cost',
            description: 'Current month\'s actual costs',
            tracking: 'Tracked across all services'
          },
          projectedMonthly: {
            title: '📈 Projected Monthly',
            categories: 'Based on current usage patterns',
            description: 'Estimated costs for next month'
          },
          overBudgetItems: {
            title: '⚠️ Over Budget Items',
            pending: 'Items requiring attention',
            description: 'Services exceeding budget limits'
          },
          apiConnected: {
            title: '🔌 API Connected',
            providers: 'Connected service providers',
            description: 'Real-time cost tracking enabled'
          }
        },
        table: {
          title: '📊 Cost Breakdown',
          description: 'Detailed cost analysis by service'
        },
        optimizationPanel: {
          title: '🚀 Cost Optimization',
          description: 'AI-powered cost reduction suggestions'
        },
        serviceProviders: {
          title: '🏢 Service Providers',
          description: 'Manage API connections and billing'
        },
        quickActions: {
          quickActionsTitle: '⚡ Quick Actions',
          quickActionsDescription: 'Common cost management tasks'
        }
      }
    },

    // Payments Page
    payments: {
      loading: {
        loadingPayments: 'Loading payments from database...'
      },
      error: {
        title: 'Error Loading Payments',
        fetchFailed: 'Failed to fetch payments',
        tryAgain: 'Try Again'
      },
      title: 'Payment Management',
      subtitle: 'Track all payment transactions and manage refunds',
      sections: {
        filter: {
          title: 'Filter by Status',
          allPayments: 'All Payments',
          completed: 'Completed',
          pending: 'Pending',
          failed: 'Failed',
          refunded: 'Refunded'
        },
        table: {
          actions: {
            refund: 'Refund'
          }
        }
      }
    },

    // Driver Location Page
    driverLocation: {
      location: {
        loading: {
          message: 'Requesting location permission...'
        },
        unauthorized: {
          title: 'Access Denied',
          description: 'You need the correct key to access this page.'
        },
        title: 'Driver Location Tracking',
        status: {
          label: 'Status:'
        },
        coordinates: {
          label: 'Coordinates:'
        },
        coords: 'Lat: {lat}, Lng: {lng}'
      }
    },

    // Driver Page
    driver: {
      error: {
        loadDriverFailed: 'Failed to load driver from database. Please try again.',
        updateStatusFailed: 'Failed to update driver status'
      }
    },

    // Version Control Page
    versionControl: {
      sections: {
        loading: {
          message: 'Loading...'
        },
        header: {
          title: 'Version Control',
          refresh: 'Refresh'
        },
        history: {
          title: 'Version History',
          noVersions: 'No versions available',
          version: {
            title: 'Version',
            details: 'Details',
            comment: 'Comment'
          }
        },
        changes: {
          added: 'Added',
          removed: 'Removed',
          modified: 'Modified'
        }
      },
      approve: 'Approve',
      reject: 'Reject',
      revert: 'Revert',
      view: 'View',
      details: 'Version Details',
      pageType: 'Page Type:',
      field: 'Field:',
      oldValue: 'Old Value:',
      newValue: 'New Value:',
      author: 'Author:',
      timestamp: 'Timestamp:',
      comment: 'Comment:',
      close: 'Close',
      status: 'Last updated:'
    },

    // Error Monitoring Page
    errorMonitoring: {
      sections: {
        loading: {
          message: 'Loading...'
        },
        header: {
          title: 'Error Monitoring',
          refresh: 'Refresh',
          clearAll: 'Clear All'
        },
        summary: {
          title: 'Error Summary',
          total: 'Total Errors:',
          high: 'High Severity:',
          medium: 'Medium Severity:'
        },
        list: {
          title: 'Recent Errors',
          noErrors: 'No errors recorded'
        }
      },
      view: 'View',
      delete: 'Delete',
      details: 'Error Details',
      message: 'Message:',
      url: 'URL:',
      timestamp: 'Timestamp:',
      userAgent: 'User Agent:',
      context: 'Context:',
      stack: 'Stack Trace:',
      close: 'Close',
      status: 'Last updated:',
      noStackTrace: 'No stack trace available'
    },

    // Security Monitoring Page
    securityMonitoring: {
      loading: {
        message: 'Loading...'
      },
      actions: {
        title: 'Security Monitoring',
        refresh: 'Refresh',
        clearAll: 'Clear All'
      },
      stats: {
        title: 'Security Statistics',
        total: 'Total Events:',
        threats: 'Threats:',
        failures: 'Failures:',
        successful: 'Successful:'
      },
      events: {
        title: 'Security Events',
        noEvents: 'No security events recorded',
        action: 'Action',
        details: 'Details',
        status: 'Status',
        viewButton: 'View',
        success: 'Success',
        failed: 'Failed',
        severity: 'severity',
        unknownUser: 'Unknown'
      },
      details: {
        title: 'Event Details',
        type: 'Type:',
        action: 'Action:',
        severity: 'Severity:',
        timestamp: 'Timestamp:',
        userId: 'User ID:',
        sessionId: 'Session ID:',
        ipAddress: 'IP Address:',
        resource: 'Resource:',
        success: 'Success:',
        error: 'Error:',
        details: 'Details:',
        closeButton: 'Close'
      },
      confirmations: {
        clearEvents: 'Are you sure you want to clear all security events?'
      },
      messages: {
        eventsCleared: 'Security events cleared successfully',
        clearFailed: 'Failed to clear events'
      },
      ipAddress: {
        unknown: 'Unknown'
      }
    },

    // Backup Management Page
    backup: {
      sections: {
        actions: {
          title: 'Backup Actions',
          createBackup: 'Create Backup',
          refresh: 'Refresh'
        },
        configuration: {
          title: 'Backup Configuration',
          frequency: 'Frequency:',
          retention: {
            label: 'Retention:',
            days: 'days'
          },
          compression: {
            label: 'Compression:',
            enabled: 'Enabled',
            disabled: 'Disabled'
          }
        },
        list: {
          title: 'Available Backups',
          noBackups: 'No backups available',
          backup: {
            title: 'Backup',
            details: 'Details',
            restore: 'Restore',
            delete: 'Delete'
          }
        },
        status: 'Last updated:',
        fileSize: {
          zeroBytes: '0 Bytes',
          bytes: 'Bytes',
          kb: 'KB',
          mb: 'MB',
          gb: 'GB'
        }
      }
    },

    // AI Assistant Page
    aiAssistant: {
      sections: {
        quickQuestions: {
          title: 'Quick Questions'
        },
        chat: {
          title: 'Chat with AI Assistant',
          welcome: 'Ask me anything about bookings, business information, or customer service!',
          inputPlaceholder: 'Ask a question...',
          voiceButton: 'Voice Input',
          sendButton: 'Send'
        },
        capabilities: {
          title: 'What I can help with',
          bookingInfo: '📋 Booking Information - Query booking details, status, and history',
          businessInfo: '💼 Business Information - Access pricing, policies, and company details',
          customerService: '🎧 Customer Service - Help with common questions and issues',
          troubleshooting: '🔧 Troubleshooting - Assist with technical problems'
        }
      }
    },

    // Feedback Page
    feedback: {
      ratingStars: '★',
      ratingScore: '{rating}/5',
      sections: {
        table: {
          title: '💬 Customer Reviews',
          description: 'Search, sort, and manage customer feedback and ratings',
          searchPlaceholder: 'Search by customer name, email, or feedback text...',
          emptyMessage: 'No customer feedback available yet. Reviews will appear here once customers submit them.',
          columns: {
            customer: {
              label: 'Customer',
              name: 'Name',
              email: 'Email',
              bookingId: 'Booking ID'
            },
            rating: {
              label: 'Rating'
            },
            comment: {
              label: 'Feedback',
              text: 'Comment'
            },
            date: {
              label: 'Date',
              date: 'Date',
              time: 'Time'
            }
          },
          actions: {
            viewDetails: 'View Details',
            reply: 'Reply',
            flag: 'Flag'
          }
        },
        ratingDistribution: {
          title: '📊 Rating Distribution',
          description: 'Breakdown of customer ratings',
          stars: 'Stars',
          count: 'Count',
          percentage: 'Percentage'
        }
      },
      stats: {
        totalReviews: {
          title: 'Total Reviews',
          description: 'Customer reviews collected',
          details: '{count} total reviews'
        },
        averageRating: {
          title: 'Average Rating',
          description: 'Out of 5 stars'
        },
        fiveStar: {
          title: '5-Star Reviews',
          description: 'of total'
        },
        positive: {
          title: 'Positive Reviews',
          description: '4+ star ratings'
        }
      }
    },

    // Promos Page
    promos: {
      messages: {
        fillRequiredFields: 'Please fill in required fields',
        promoCreated: 'Promo code created successfully!',
        createFailed: 'Failed to create promo code. Please try again.',
        promoDeleted: 'Promo code deleted successfully!',
        deleteFailed: 'Failed to delete promo code. Please try again.',
        codeCopied: 'Promo code',
        copiedToClipboard: 'copied to clipboard!',
        usageStats: 'Usage statistics for',
        comingSoon: 'coming soon',
        editFunctionality: 'Edit functionality for'
      },
      confirmations: {
        deletePromo: 'Are you sure you want to delete this promo code?'
      },
      sections: {
        header: {
          refresh: 'Refresh',
          exportReport: 'Export Report',
          analytics: 'Analytics'
        },
        table: {
          columns: {
            code: {
              label: 'Promo Code'
            },
            type: {
              label: 'Type',
              percentage: 'Percentage',
              fixedAmount: 'Fixed Amount'
            },
            discount: {
              label: 'Discount'
            },
            expiry: {
              label: 'Expiry',
              noExpiry: 'No expiry'
            },
            usage: {
              label: 'Usage',
              unlimited: '∞'
            },
            status: {
              label: 'Status'
            }
          },
          actions: {
            copyCode: 'Copy Code',
            viewUsage: 'View Usage',
            edit: 'Edit',
            delete: 'Delete'
          }
        }
      },
      status: {
        expired: 'Expired',
        limitReached: 'Limit Reached',
        expiringSoon: 'Expiring Soon',
        active: 'Active'
      },
      stats: {
        totalPromos: {
          title: 'Total Promos',
          description: 'Created codes'
        },
        activePromos: {
          title: 'Active Promos',
          description: 'Currently usable'
        },
        totalUsage: {
          title: 'Total Usage',
          description: 'Times used'
        },
        expiringSoon: {
          title: 'Expiring Soon',
          description: 'Within 7 days'
        }
      },
      createPromoTitle: '🎟️ Create New Promo Code',
      createPromoDesc: 'Add a new promotional discount code for your customers',
      form: {
        code: 'Code (uppercase) *',
        type: 'Type *',
        typeOptions: {
          percentage: 'Percentage %',
          fixedAmount: 'Fixed Amount $'
        },
        value: 'Value *',
        expiresAt: 'Expires At',
        usageLimit: 'Usage Limit'
      },
      createPromoButton: {
        submitting: 'Creating...',
        label: 'Create Promo Code'
      },
      allPromosTitle: '🎟️ All Promo Codes',
      allPromosDesc: 'Search, sort, and manage your promotional discount codes'
    },

    // Quick Fix Page
    quickFix: {
      sections: {
        description: 'This will add all missing content to the database, making the app ready for real customers:',
        content: {
          successPage: 'Success page messages and titles',
          errorPage: 'Error page content and messages',
          bookingForm: 'Booking form labels and descriptions',
          navigation: 'Navigation and footer content',
          adminDashboard: 'Admin dashboard text and labels'
        },
        addContentButton: '🚀 Make App Production-Ready'
      },
      missingContent: {
        pages: {
          success: {
            title: 'Booking Confirmed!',
            subtitle: 'Your airport transfer is confirmed',
            message: 'We\'ll send you a confirmation email with all the details. Your driver will contact you 30 minutes before pickup.',
            nextSteps: 'What happens next?',
            driverContact: 'Driver will contact you 30 minutes before pickup',
            emailConfirmation: 'Check your email for confirmation details',
            calendarInvite: 'Calendar invite added to your schedule',
            backToHome: 'Back to Home'
          },
          error: {
            title: 'Something went wrong',
            subtitle: 'We couldn\'t process your request',
            message: 'Please try again or contact support if the problem persists.',
            tryAgain: 'Try Again',
            contactSupport: 'Contact Support',
            backToHome: 'Back to Home'
          }
        },
        bookingForm: {
          title: 'Book Your Airport Transfer',
          subtitle: 'Reliable transportation to and from the airport',
          pickupLocationLabel: 'Pickup Location',
          pickupLocationPlaceholder: 'Enter pickup address or location',
          dropoffLocationLabel: 'Dropoff Location',
          dropoffLocationPlaceholder: 'Enter destination address',
          pickupDateLabel: 'Pickup Date',
          pickupTimeLabel: 'Pickup Time',
          additionalDetails: {
            title: 'Additional Details',
            description: 'Any special requirements or notes'
          },
          passengersLabel: 'Number of Passengers',
          luggageLabel: 'Number of Luggage Pieces',
          specialRequestsLabel: 'Special Requests',
          actionButtons: {
            title: 'Complete Your Booking',
            description: 'Review your details and proceed to payment'
          },
          calculateFareButton: 'Calculate Fare',
          bookNowButton: 'Book Now',
          estimatedFareLabel: 'Estimated Fare'
        }
      },
      errors: {
        noConfigFound: 'No CMS configuration found',
        saveFailed: 'Failed to save content',
        addContentFailed: 'Failed to add content'
      },
      messages: {
        contentAddedSuccess: 'Successfully added missing content to the database!',
        contentAddedToast: 'Content added successfully'
      }
    },

    // Setup Page
    setup: {
      title: 'Admin Setup',
      sections: {
        loggedIn: {
          email: 'Logged in as:',
          description: 'Click the button below to create your admin user role in the database.',
          setupButton: 'Setup Admin User',
          settingUp: 'Setting up...'
        },
        notLoggedIn: {
          message: 'Please log in first to set up your admin account.',
          goToLogin: 'Go to Login'
        }
      },
      error: {
        pleaseLogin: 'Please log in first',
        creationFailed: '❌ Error creating admin user. Check console for details.'
      },
      success: {
        adminCreated: '✅ Admin user created successfully! You can now access admin features.'
      }
    },

    // Add Content Page
    addContent: {
      sections: {
        homepage: {
          title: '🏠 Homepage Content',
          description: 'Edit hero section, features, and main messaging'
        },
        bookingForm: {
          title: '📅 Booking Form Content',
          description: 'Edit form labels, descriptions, and error messages'
        },
        help: {
          title: '❓ Help & FAQ Content',
          description: 'Edit FAQ items, contact information, and support content'
        },
        success: {
          title: '✅ Success Page Content',
          description: 'Edit confirmation messages and next steps'
        },
        business: {
          title: '💼 Business Information',
          description: 'Edit company details, contact info, and policies'
        },
        pricing: {
          title: '💰 Pricing & Services',
          description: 'Edit pricing, service areas, and fare calculations'
        }
      }
    },

    // Calendar Page
    calendar: {
      title: 'Calendar',
      sections: {
        header: {
          title: 'Booking Calendar'
        },
        days: {
          sun: 'Sun',
          mon: 'Mon',
          tue: 'Tue',
          wed: 'Wed',
          thu: 'Thu',
          fri: 'Fri',
          sat: 'Sat'
        }
      }
    }
  }
};

export async function POST(_request: NextRequest) {
  try {
    console.log('🔄 Starting admin CMS update...');
    
    // Get current CMS configuration
    const currentConfig = await cmsService.getCMSConfiguration();
    
    // Merge admin data with existing data
    const updatedConfig = {
      ...currentConfig,
      admin: adminCMSData.admin,
      lastUpdated: new Date()
    } as any;
    
    // Update via service
    await cmsService.updateCMSConfiguration(updatedConfig);
    
    console.log('✅ Admin CMS data updated successfully!');
    
    return NextResponse.json({
      success: true,
      message: 'Admin CMS data updated successfully',
      updatedSections: Object.keys(adminCMSData.admin).length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error updating admin CMS data:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function GET(_request: NextRequest) {
  return NextResponse.json({
    message: 'Admin CMS update endpoint',
    usage: 'POST to update Firebase with admin CMS data',
    adminSections: Object.keys(adminCMSData.admin),
    totalFields: JSON.stringify(adminCMSData).split('"').length / 2 // Rough estimate
  });
}
