import { PageTemplate } from '@/types/page-templates';

// Marketing page templates
export const marketingTemplates: PageTemplate[] = [
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
      }
    ]
  },
  {
    id: 'features-showcase',
    name: 'Features Showcase',
    description: 'Highlight key features and benefits',
    category: 'marketing',
    layout: 'grid',
    responsive: true,
    seo: {
      title: 'Why Choose Fairfield Airport Cars',
      description: 'Discover the benefits of our professional airport transportation service',
      keywords: ['benefits', 'features', 'professional', 'service']
    },
    icon: '⭐',
    sections: [
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
          margin: 'lg'
        },
        components: [
          {
            id: 'features-heading',
            type: 'Heading',
            props: {
              level: 2,
              size: 'lg',
              align: 'center'
            },
            content: [
              {
                id: 'features-title',
                type: 'heading',
                content: 'Why Choose Us',
                databaseKey: 'features.title',
                editable: true
              }
            ],
            position: {
              row: 0,
              col: 0,
              span: 3
            }
          }
        ]
      }
    ]
  }
];

export const getMarketingTemplates = () => marketingTemplates;
export const getMarketingTemplateById = (id: string) => 
  marketingTemplates.find(template => template.id === id); 