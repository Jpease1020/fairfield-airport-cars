'use client';

import { UnifiedLayout } from '@/components/layout';
import { ActionButtonGroup, ToastProvider, useToast } from '@/components/ui';

function AboutPageContent() {
  const { addToast } = useToast();

  return (
    <UnifiedLayout 
      layoutType="content"
      showNavigation={true}
      showFooter={true}
      maxWidth="xl"
      padding="lg"
      variant="default"
      centerContent={false}
    >
      {/* 🎯 HERO SECTION - About Our Company */}
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
            📖 About Fairfield Airport Cars
          </h1>
          
          <p style={{
            fontSize: 'var(--font-size-xl)',
            lineHeight: '1.6',
            marginBottom: 'var(--spacing-2xl)',
            opacity: '0.95',
            maxWidth: '600px',
            margin: '0 auto var(--spacing-2xl) auto'
          }}>
            Professional airport transportation service serving Fairfield County and beyond.
            Your trusted partner for reliable, comfortable, and punctual travel.
          </p>
          
          <ActionButtonGroup buttons={[{
            label: 'Book Your Ride',
            onClick: () => window.location.href = '/book',
            variant: 'primary' as const,
            icon: '🚗'
          }]} />
        </div>
      </section>

      {/* 🏢 OUR STORY SECTION */}
      <section style={{
        padding: 'var(--spacing-3xl) 0',
        background: 'var(--bg-primary)'
      }}>
        <div style={{
          maxWidth: '1000px',
          margin: '0 auto',
          padding: '0 var(--spacing-lg)'
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
              📖 Our Story
            </h2>
            <p style={{
              fontSize: 'var(--font-size-lg)',
              color: 'var(--text-secondary)',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              Providing premium transportation services to the Fairfield County area
            </p>
          </div>
          
          <div style={{
            background: 'white',
            padding: 'var(--spacing-2xl)',
            borderRadius: 'var(--border-radius-lg)',
            border: '1px solid var(--border-primary)',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            <p style={{
              fontSize: 'var(--font-size-lg)',
              lineHeight: '1.8',
              color: 'var(--text-primary)',
              marginBottom: 'var(--spacing-lg)',
              textAlign: 'center'
            }}>
              Fairfield Airport Cars has been providing premium transportation services to the Fairfield County area for years.
              We understand that getting to and from the airport can be stressful, which is why we're committed to making your
              journey as smooth and comfortable as possible.
            </p>
            
            <div style={{
              textAlign: 'center',
              padding: 'var(--spacing-lg)',
              background: 'var(--bg-secondary)',
              borderRadius: 'var(--border-radius)',
              border: '2px solid var(--brand-primary)'
            }}>
              <p style={{
                fontSize: 'var(--font-size-xl)',
                fontWeight: '600',
                color: 'var(--brand-primary)',
                fontStyle: 'italic',
                margin: 0,
                lineHeight: '1.6'
              }}>
                "To provide reliable, professional, and comfortable transportation services that exceed our customers' expectations.
                We believe in punctuality, safety, and superior customer service."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 🌟 WHY CHOOSE US SECTION */}
      <section style={{
        padding: 'var(--spacing-3xl) 0',
        background: 'var(--bg-secondary)'
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
            Experience the difference that professional service makes
          </p>
        </div>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 'var(--spacing-xl)',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          {[
            {
              icon: "👨‍💼",
              title: "Professional Drivers",
              description: "All our drivers are licensed, insured, and professionally trained to provide excellent service"
            },
            {
              icon: "🚙",
              title: "Clean Vehicles",
              description: "Our fleet is regularly maintained and cleaned to ensure a comfortable ride every time"
            },
            {
              icon: "⏱️",
              title: "On-Time Service",
              description: "We track flights and traffic to ensure you arrive at your destination on time"
            },
            {
              icon: "🕐",
              title: "24/7 Availability",
              description: "We provide transportation services around the clock to accommodate any schedule"
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

      {/* 🗺️ SERVICE AREAS SECTION */}
      <section style={{
        padding: 'var(--spacing-3xl) 0',
        background: 'var(--bg-primary)'
      }}>
        <div style={{
          maxWidth: '1000px',
          margin: '0 auto',
          padding: '0 var(--spacing-lg)'
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
              🗺️ Service Areas
            </h2>
            <p style={{
              fontSize: 'var(--font-size-lg)',
              color: 'var(--text-secondary)',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              We proudly serve Fairfield County, CT and surrounding areas
            </p>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: 'var(--spacing-xl)'
          }}>
            <div style={{
              background: 'white',
              padding: 'var(--spacing-xl)',
              borderRadius: 'var(--border-radius-lg)',
              border: '1px solid var(--border-primary)',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}>
              <h3 style={{
                fontSize: 'var(--font-size-xl)',
                fontWeight: '600',
                color: 'var(--text-primary)',
                marginBottom: 'var(--spacing-md)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-sm)'
              }}>
                🌍 Coverage Area
              </h3>
              <p style={{
                fontSize: 'var(--font-size-base)',
                lineHeight: '1.6',
                color: 'var(--text-secondary)'
              }}>
                We provide professional transportation services throughout Fairfield County, CT and surrounding areas,
                connecting you to all major airports in the region.
              </p>
            </div>
            
            <div style={{
              background: 'white',
              padding: 'var(--spacing-xl)',
              borderRadius: 'var(--border-radius-lg)',
              border: '1px solid var(--border-primary)',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}>
              <h3 style={{
                fontSize: 'var(--font-size-xl)',
                fontWeight: '600',
                color: 'var(--text-primary)',
                marginBottom: 'var(--spacing-md)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-sm)'
              }}>
                ✈️ Airport Destinations
              </h3>
              <ul style={{
                margin: 0,
                padding: '0 0 0 var(--spacing-lg)',
                fontSize: 'var(--font-size-base)',
                lineHeight: '1.8',
                color: 'var(--text-secondary)'
              }}>
                {[
                  "John F. Kennedy International Airport (JFK)",
                  "LaGuardia Airport (LGA)",
                  "Newark Liberty International Airport (EWR)",
                  "Bradley International Airport (BDL)",
                  "Westchester County Airport (HPN)"
                ].map((airport, index) => (
                  <li key={index} style={{ marginBottom: 'var(--spacing-xs)' }}>
                    {airport}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 🚀 CONTACT CTA SECTION */}
      <section style={{
        textAlign: 'center',
        padding: 'var(--spacing-4xl) 0',
        background: 'var(--bg-secondary)',
        borderRadius: 'var(--border-radius-lg)',
        margin: 'var(--spacing-xl) 0'
      }}>
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          padding: '0 var(--spacing-lg)'
        }}>
          <h2 style={{
            fontSize: 'var(--font-size-3xl)',
            fontWeight: '700',
            color: 'var(--text-primary)',
            marginBottom: 'var(--spacing-md)'
          }}>
            📞 Ready to Experience Premium Service?
          </h2>
          
          <p style={{
            fontSize: 'var(--font-size-lg)',
            color: 'var(--text-secondary)',
            marginBottom: 'var(--spacing-xl)',
            lineHeight: '1.6'
          }}>
            Contact us today to book your reliable airport transportation. Available 24/7 for your convenience.
          </p>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 'var(--spacing-lg)',
            marginBottom: 'var(--spacing-xl)',
            maxWidth: '600px',
            margin: '0 auto var(--spacing-xl) auto'
          }}>
            <div style={{
              background: 'white',
              padding: 'var(--spacing-lg)',
              borderRadius: 'var(--border-radius)',
              border: '1px solid var(--border-primary)'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: 'var(--spacing-sm)' }}>📞</div>
              <h4 style={{ 
                margin: '0 0 var(--spacing-xs) 0',
                fontSize: 'var(--font-size-base)',
                fontWeight: '600'
              }}>
                Phone
              </h4>
              <p style={{
                margin: 0,
                fontSize: 'var(--font-size-lg)',
                fontWeight: '600',
                color: 'var(--brand-primary)'
              }}>
                (203) 555-0123
              </p>
            </div>
            
            <div style={{
              background: 'white',
              padding: 'var(--spacing-lg)',
              borderRadius: 'var(--border-radius)',
              border: '1px solid var(--border-primary)'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: 'var(--spacing-sm)' }}>🕐</div>
              <h4 style={{ 
                margin: '0 0 var(--spacing-xs) 0',
                fontSize: 'var(--font-size-base)',
                fontWeight: '600'
              }}>
                Availability
              </h4>
              <p style={{
                margin: 0,
                fontSize: 'var(--font-size-base)',
                color: 'var(--text-primary)'
              }}>
                24/7 Service
              </p>
            </div>
            
            <div style={{
              background: 'white',
              padding: 'var(--spacing-lg)',
              borderRadius: 'var(--border-radius)',
              border: '1px solid var(--border-primary)'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: 'var(--spacing-sm)' }}>🚗</div>
              <h4 style={{ 
                margin: '0 0 var(--spacing-xs) 0',
                fontSize: 'var(--font-size-base)',
                fontWeight: '600'
              }}>
                Booking
              </h4>
              <p style={{
                margin: 0,
                fontSize: 'var(--font-size-base)',
                color: 'var(--text-primary)'
              }}>
                Online & Phone
              </p>
            </div>
          </div>
          
          <ActionButtonGroup buttons={[{
            label: 'Book Your Ride Today',
            onClick: () => window.location.href = '/book',
            variant: 'primary' as const,
            icon: '🚀'
          }]} />
        </div>
      </section>
    </UnifiedLayout>
  );
}

export default function AboutPage() {
  return (
    <ToastProvider>
      <AboutPageContent />
    </ToastProvider>
  );
} 