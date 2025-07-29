import { PageTemplate } from '@/types/page-templates';

// Example page templates that demonstrate the system
export const exampleTemplates: PageTemplate[] = [
  {
    id: 'hero-landing',
    name: 'Hero Landing Page',
    description: 'A landing page with a prominent hero section',
    category: 'marketing',
    layout: 'hero',
    responsive: true,
    seo: {
      title: 'Welcome to Fairfield Airport Cars',
      description: 'Reliable airport transportation in Fairfield',
      keywords: ['airport', 'transportation', 'Fairfield', 'car service']
    },
    icon: '🚙',
    sections: [
      {
        id: 'hero-section',
        type: 'hero',
        layout: {
          cols: 1,
          gap: 'lg',
          responsive: true
        },
        spacing: {
          padding: 'xl',
          margin: 'none'
        },
        components: [
          {
            id: 'hero-heading',
            type: 'Heading',
            props: {
              level: 1,
              size: 'xl',
              align: 'center'
            },
            content: [
              {
                id: 'hero-title',
                type: 'heading',
                content: 'Reliable Airport Transportation',
                databaseKey: 'hero.title',
                editable: true
              }
            ],
            position: {
              row: 0,
              col: 0
            }
          },
          {
            id: 'hero-description',
            type: 'Text',
            props: {
              variant: 'body',
              size: 'lg',
              align: 'center',
              color: 'secondary'
            },
            content: [
              {
                id: 'hero-subtitle',
                type: 'text',
                content: 'Professional car service to and from Fairfield Airport',
                databaseKey: 'hero.subtitle',
                editable: true
              }
            ],
            position: {
              row: 1,
              col: 0
            }
          },
          {
            id: 'hero-cta',
            type: 'Button',
            props: {
              variant: 'primary',
              size: 'lg',
              fullWidth: false
            },
            content: [
              {
                id: 'hero-button-text',
                type: 'button',
                content: 'Book Now',
                databaseKey: 'hero.ctaText',
                editable: true
              }
            ],
            position: {
              row: 2,
              col: 0
            }
          }
        ]
      },
      {
        id: 'features-section',
        type: 'content',
        layout: {
          cols: 3,
          gap: 'lg',
          responsive: true
        },
        spacing: {
          padding: 'xl',
          margin: 'none'
        },
        components: [
          {
            id: 'feature-1',
            type: 'InfoCard',
            props: {
              variant: 'default',
              theme: 'light'
            },
            content: [
              {
                id: 'feature-1-title',
                type: 'heading',
                content: '24/7 Service',
                databaseKey: 'features.service24.title',
                editable: true
              },
              {
                id: 'feature-1-description',
                type: 'text',
                content: 'Available around the clock for your convenience',
                databaseKey: 'features.service24.description',
                editable: true
              }
            ],
            position: {
              row: 0,
              col: 0
            }
          },
          {
            id: 'feature-2',
            type: 'InfoCard',
            props: {
              variant: 'default',
              theme: 'light'
            },
            content: [
              {
                id: 'feature-2-title',
                type: 'heading',
                content: 'Professional Drivers',
                databaseKey: 'features.drivers.title',
                editable: true
              },
              {
                id: 'feature-2-description',
                type: 'text',
                content: 'Licensed and insured drivers for your safety',
                databaseKey: 'features.drivers.description',
                editable: true
              }
            ],
            position: {
              row: 0,
              col: 1
            }
          },
          {
            id: 'feature-3',
            type: 'InfoCard',
            props: {
              variant: 'default',
              theme: 'light'
            },
            content: [
              {
                id: 'feature-3-title',
                type: 'heading',
                content: 'Fixed Pricing',
                databaseKey: 'features.pricing.title',
                editable: true
              },
              {
                id: 'feature-3-description',
                type: 'text',
                content: 'Transparent pricing with no hidden fees',
                databaseKey: 'features.pricing.description',
                editable: true
              }
            ],
            position: {
              row: 0,
              col: 2
            }
          }
        ]
      }
    ]
  },
  {
    id: 'admin-dashboard',
    name: 'Admin Dashboard',
    description: 'Administrative dashboard with key metrics',
    category: 'admin',
    layout: 'dashboard',
    responsive: true,
    seo: {
      title: 'Admin Dashboard - Fairfield Airport Cars',
      description: 'Manage your airport car service business',
      keywords: ['admin', 'dashboard', 'management', 'airport cars']
    },
    icon: '📊',
    sections: [
      {
        id: 'dashboard-header',
        type: 'content',
        layout: {
          cols: 1,
          gap: 'md',
          responsive: true
        },
        spacing: {
          padding: 'lg',
          margin: 'none'
        },
        components: [
          {
            id: 'dashboard-title',
            type: 'Heading',
            props: {
              level: 1,
              size: 'xl'
            },
            content: [
              {
                id: 'dashboard-title-text',
                type: 'heading',
                content: 'Dashboard',
                databaseKey: 'dashboard.title',
                editable: true
              }
            ],
            position: {
              row: 0,
              col: 0
            }
          }
        ]
      },
      {
        id: 'stats-grid',
        type: 'grid',
        layout: {
          cols: 4,
          gap: 'md',
          responsive: true
        },
        spacing: {
          padding: 'lg',
          margin: 'none'
        },
        components: [
          {
            id: 'stat-bookings',
            type: 'StatCard',
            props: {
              variant: 'default',
              size: 'md'
            },
            content: [
              {
                id: 'stat-bookings-title',
                type: 'text',
                content: 'Total Bookings',
                databaseKey: 'stats.bookings.title',
                editable: true
              },
              {
                id: 'stat-bookings-value',
                type: 'text',
                content: '1,234',
                databaseKey: 'stats.bookings.value',
                editable: true
              }
            ],
            position: {
              row: 0,
              col: 0
            }
          },
          {
            id: 'stat-revenue',
            type: 'StatCard',
            props: {
              variant: 'default',
              size: 'md'
            },
            content: [
              {
                id: 'stat-revenue-title',
                type: 'text',
                content: 'Revenue',
                databaseKey: 'stats.revenue.title',
                editable: true
              },
              {
                id: 'stat-revenue-value',
                type: 'text',
                content: '$45,678',
                databaseKey: 'stats.revenue.value',
                editable: true
              }
            ],
            position: {
              row: 0,
              col: 1
            }
          },
          {
            id: 'stat-drivers',
            type: 'StatCard',
            props: {
              variant: 'default',
              size: 'md'
            },
            content: [
              {
                id: 'stat-drivers-title',
                type: 'text',
                content: 'Active Drivers',
                databaseKey: 'stats.drivers.title',
                editable: true
              },
              {
                id: 'stat-drivers-value',
                type: 'text',
                content: '12',
                databaseKey: 'stats.drivers.value',
                editable: true
              }
            ],
            position: {
              row: 0,
              col: 2
            }
          },
          {
            id: 'stat-satisfaction',
            type: 'StatCard',
            props: {
              variant: 'default',
              size: 'md'
            },
            content: [
              {
                id: 'stat-satisfaction-title',
                type: 'text',
                content: 'Customer Satisfaction',
                databaseKey: 'stats.satisfaction.title',
                editable: true
              },
              {
                id: 'stat-satisfaction-value',
                type: 'text',
                content: '4.8/5',
                databaseKey: 'stats.satisfaction.value',
                editable: true
              }
            ],
            position: {
              row: 0,
              col: 3
            }
          }
        ]
      }
    ]
  },
  {
    id: 'booking-form',
    name: 'Booking Form',
    description: 'Customer booking form with all necessary fields',
    category: 'booking',
    layout: 'form',
    responsive: true,
    seo: {
      title: 'Book Your Airport Transfer - Fairfield Airport Cars',
      description: 'Book reliable airport transportation in Fairfield',
      keywords: ['book', 'airport', 'transfer', 'Fairfield', 'transportation']
    },
    icon: '📝',
    sections: [
      {
        id: 'form-header',
        type: 'content',
        layout: {
          cols: 1,
          gap: 'md',
          responsive: true
        },
        spacing: {
          padding: 'lg',
          margin: 'none'
        },
        components: [
          {
            id: 'form-title',
            type: 'Heading',
            props: {
              level: 1,
              size: 'xl',
              align: 'center'
            },
            content: [
              {
                id: 'form-title-text',
                type: 'heading',
                content: 'Book Your Airport Transfer',
                databaseKey: 'booking.title',
                editable: true
              }
            ],
            position: {
              row: 0,
              col: 0
            }
          },
          {
            id: 'form-description',
            type: 'Text',
            props: {
              variant: 'body',
              size: 'md',
              align: 'center',
              color: 'secondary'
            },
            content: [
              {
                id: 'form-description-text',
                type: 'text',
                content: 'Fill out the form below to book your airport transportation',
                databaseKey: 'booking.description',
                editable: true
              }
            ],
            position: {
              row: 1,
              col: 0
            }
          }
        ]
      },
      {
        id: 'booking-form',
        type: 'form',
        layout: {
          cols: 2,
          gap: 'md',
          responsive: true
        },
        spacing: {
          padding: 'lg',
          margin: 'none'
        },
        components: [
          {
            id: 'name-input',
            type: 'Input',
            props: {
              size: 'md',
              variant: 'default',
              placeholder: 'Full Name'
            },
            content: [
              {
                id: 'name-label',
                type: 'text',
                content: 'Full Name',
                databaseKey: 'booking.form.name.label',
                editable: true
              }
            ],
            position: {
              row: 0,
              col: 0
            }
          },
          {
            id: 'email-input',
            type: 'Input',
            props: {
              size: 'md',
              variant: 'default',
              placeholder: 'Email Address'
            },
            content: [
              {
                id: 'email-label',
                type: 'text',
                content: 'Email Address',
                databaseKey: 'booking.form.email.label',
                editable: true
              }
            ],
            position: {
              row: 0,
              col: 1
            }
          },
          {
            id: 'phone-input',
            type: 'Input',
            props: {
              size: 'md',
              variant: 'default',
              placeholder: 'Phone Number'
            },
            content: [
              {
                id: 'phone-label',
                type: 'text',
                content: 'Phone Number',
                databaseKey: 'booking.form.phone.label',
                editable: true
              }
            ],
            position: {
              row: 1,
              col: 0
            }
          },
          {
            id: 'date-input',
            type: 'Input',
            props: {
              size: 'md',
              variant: 'default',
              placeholder: 'Pickup Date'
            },
            content: [
              {
                id: 'date-label',
                type: 'text',
                content: 'Pickup Date',
                databaseKey: 'booking.form.date.label',
                editable: true
              }
            ],
            position: {
              row: 1,
              col: 1
            }
          },
          {
            id: 'submit-button',
            type: 'Button',
            props: {
              variant: 'primary',
              size: 'lg',
              fullWidth: true
            },
            content: [
              {
                id: 'submit-button-text',
                type: 'button',
                content: 'Book Now',
                databaseKey: 'booking.form.submit.text',
                editable: true
              }
            ],
            position: {
              row: 2,
              col: 0,
              span: 2
            }
          }
        ]
      }
    ]
  }
];

// Helper function to get template by ID
export const getTemplateById = (id: string): PageTemplate | undefined => {
  return exampleTemplates.find(template => template.id === id);
};

// Helper function to get templates by category
export const getTemplatesByCategory = (category: string): PageTemplate[] => {
  return exampleTemplates.filter(template => template.category === category);
};

// Helper function to get all template categories
export const getAllTemplateCategories = (): string[] => {
  return [...new Set(exampleTemplates.map(template => template.category))];
}; 