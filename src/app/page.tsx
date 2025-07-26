'use client';

import { UnifiedLayout } from '@/components/layout';
import { ActionButtonGroup, ToastProvider, useToast } from '@/components/ui';

function HomePageContent() {
  const { addToast } = useToast();

  const heroActions = [
    {
      label: 'Book Your Ride',
      onClick: () => window.location.href = '/book',
      variant: 'primary' as const,
      icon: '🚗'
    },
    {
      label: 'Learn More',
      onClick: () => window.location.href = '/about',
      variant: 'outline' as const,
      icon: 'ℹ️'
    }
  ];

  return (
    <UnifiedLayout 
      layoutType="marketing"
      showNavigation={true}
      showFooter={true}
      maxWidth="xl"
      padding="lg"
      variant="default"
      centerContent={false}
    >
      {/* 🎯 HERO SECTION - Clean, Professional, Focused */}
      <section style={{
        textAlign: 'center',
        padding: 'var(--spacing-4xl) 0 var(--spacing-3xl) 0',
        background: 'linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-secondary) 100%)',
        borderRadius: 'var(--border-radius-lg)',
        margin: 'var(--spacing-xl) 0',
        color: 'white'
      }}>
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          padding: '0 var(--spacing-lg)'
        }}>
          <h1 style={{
            fontSize: 'var(--font-size-4xl)',
            fontWeight: '800',
            lineHeight: '1.1',
            marginBottom: 'var(--spacing-md)',
            textShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            🚗 Premium Airport Transportation
          </h1>
          
          <p style={{
            fontSize: 'var(--font-size-xl)',
            lineHeight: '1.6',
            marginBottom: 'var(--spacing-2xl)',
            opacity: '0.95',
            maxWidth: '600px',
            margin: '0 auto var(--spacing-2xl) auto'
          }}>
            Reliable, comfortable rides to and from Fairfield Airport with professional drivers.
            Experience luxury, reliability, and professional service.
          </p>
          
          <ActionButtonGroup buttons={heroActions} />
        </div>
      </section>

      {/* 🌟 FEATURES SECTION - Clean Grid, Professional Icons */}
      <section style={{
        padding: 'var(--spacing-3xl) 0',
        background: 'var(--bg-primary)'
      }}>
        <div style={{
          textAlign: 'center',
          marginBottom: 'var(--spacing-2xl)'
        }}>
          <h2 style={{
            fontSize: 'var(--font-size-3xl)',
            fontWeight: '700',
            color: 'var(--text-primary)',
            marginBottom: 'var(--spacing-md)'
          }}>
            ✨ Why Choose Us?
          </h2>
          <p style={{
            fontSize: 'var(--font-size-lg)',
            color: 'var(--text-secondary)',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Professional service, reliable transportation, and peace of mind for your airport journey
          </p>
        </div>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 'var(--spacing-xl)',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          {[
            {
              icon: "🚗",
              title: "Professional Service",
              description: "Experienced drivers with clean, well-maintained vehicles for your comfort and safety"
            },
            {
              icon: "⏰",
              title: "Reliable & On Time",
              description: "We understand the importance of punctuality for airport travel and never let you down"
            },
            {
              icon: "💳",
              title: "Easy Booking",
              description: "Simple online booking with secure payment processing and instant confirmation"
            }
          ].map((feature, index) => (
            <div key={index} style={{
              background: 'white',
              padding: 'var(--spacing-xl)',
              borderRadius: 'var(--border-radius-lg)',
              textAlign: 'center',
              border: '1px solid var(--border-primary)',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease'
            }}>
              <div style={{
                fontSize: '3rem',
                marginBottom: 'var(--spacing-lg)'
              }}>
                {feature.icon}
              </div>
              <h3 style={{
                fontSize: 'var(--font-size-xl)',
                fontWeight: '600',
                color: 'var(--text-primary)',
                marginBottom: 'var(--spacing-md)'
              }}>
                {feature.title}
              </h3>
              <p style={{
                fontSize: 'var(--font-size-base)',
                color: 'var(--text-secondary)',
                lineHeight: '1.6'
              }}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 🚀 FINAL CTA SECTION - Strong, Clear Call to Action */}
      <section style={{
        textAlign: 'center',
        padding: 'var(--spacing-4xl) 0',
        background: 'var(--bg-secondary)',
        borderRadius: 'var(--border-radius-lg)',
        margin: 'var(--spacing-xl) 0'
      }}>
        <div style={{
          maxWidth: '600px',
          margin: '0 auto',
          padding: '0 var(--spacing-lg)'
        }}>
          <h2 style={{
            fontSize: 'var(--font-size-3xl)',
            fontWeight: '700',
            color: 'var(--text-primary)',
            marginBottom: 'var(--spacing-md)'
          }}>
            🎯 Ready to Book Your Ride?
          </h2>
          
          <p style={{
            fontSize: 'var(--font-size-lg)',
            color: 'var(--text-secondary)',
            marginBottom: 'var(--spacing-xl)',
            lineHeight: '1.6'
          }}>
            Join thousands of satisfied customers who trust us for reliable airport transportation.
            Professional, reliable, and always on time.
          </p>
          
          <ActionButtonGroup buttons={[{
            label: 'Book Now',
            onClick: () => window.location.href = '/book',
            variant: 'primary' as const,
            icon: '🚀'
          }]} />
        </div>
      </section>
    </UnifiedLayout>
  );
}

export default function HomePage() {
  return (
    <ToastProvider>
      <HomePageContent />
    </ToastProvider>
  );
}