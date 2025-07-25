import * as React from 'react';
import { cn } from '@/lib/utils/utils';
import { Section, Container, H2, Text, Grid, GridItem } from '@/components/ui';

interface ContactMethod {
  type: 'phone' | 'email' | 'text' | 'whatsapp';
  label: string;
  value: string;
  href: string;
}

interface ContactSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  description?: string;
  contactMethods: ContactMethod[];
  variant?: 'default' | 'centered' | 'split';
  showMap?: boolean;
  mapLocation?: {
    lat: number;
    lng: number;
    address: string;
  };
}

const ContactSection = React.forwardRef<HTMLDivElement, ContactSectionProps>(
  ({ 
    className, 
    title, 
    subtitle, 
    description,
    contactMethods,
    variant = 'default',
    showMap = false,
    mapLocation,
    ...props 
  }, ref) => {
    const getContactIcon = (type: ContactMethod['type']) => {
      switch (type) {
        case 'phone':
          return (
            <svg className="" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          );
        case 'email':
          return (
            <svg className="" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          );
        case 'text':
          return (
            <svg className="" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          );
        case 'whatsapp':
          return (
            <svg className="" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
            </svg>
          );
      }
    };

    const getContactButtonVariant = (type: ContactMethod['type']) => {
      switch (type) {
        case 'phone':
          return 'default';
        case 'email':
          return 'outline';
        case 'text':
          return 'outline';
        case 'whatsapp':
          return 'default';
        default:
          return 'outline';
      }
    };

    return (
      <Section className={cn('py-12', className)} {...props}>
        <Container 
          maxWidth="xl" 
          className={cn(
            variant === 'centered' ? 'text-center' : ''
          )}
        >
          {title && (
            <H2 className="">
              {title}
            </H2>
          )}
          
          {subtitle && (
            <Text className="">
              {subtitle}
            </Text>
          )}
          
          {description && (
            <Text 
              className={cn(
                'text-lg text-text-secondary mb-8',
                variant === 'centered' ? 'max-w-3xl mx-auto' : 'max-w-2xl'
              )}
            >
              {description}
            </Text>
          )}
          
          <Grid 
            columns={variant === 'split' ? 2 : 3}
            spacing="md"
            className={cn(
              showMap && variant === 'split' ? 'md:grid-cols-3' : ''
            )}
          >
            {contactMethods.map((method, index) => (
              <GridItem key={index}>
                <a
                  href={method.href}
                  className={cn(
                    'flex items-center p-4 rounded-lg border transition-colors',
                    getContactButtonVariant(method.type) === 'default' 
                      ? 'bg-brand-primary text-text-inverse border-brand-primary hover:bg-brand-primary-hover' 
                      : 'bg-bg-primary text-text-primary border-border-primary hover:bg-bg-secondary'
                  )}
                >
                  <div className={cn(
                    'flex-shrink-0 mr-4',
                    getContactButtonVariant(method.type) === 'default' 
                      ? 'text-text-inverse' 
                      : 'text-brand-primary'
                  )}>
                    {getContactIcon(method.type)}
                  </div>
                  <div>
                    <div className="">{method.label}</div>
                    <div className={cn(
                      'text-sm',
                      getContactButtonVariant(method.type) === 'default' 
                        ? 'text-text-inverse/80' 
                        : 'text-text-secondary'
                    )}>
                      {method.value}
                    </div>
                  </div>
                </a>
              </GridItem>
            ))}
            
            {showMap && mapLocation && (
              <GridItem className={cn(
                'h-64 md:h-auto rounded-lg overflow-hidden',
                variant === 'split' ? 'md:col-span-2' : 'md:col-span-2'
              )}>
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3024.2219901290355!2d-74.00369368400567!3d40.71312937933185!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25a23e28c1191%3A0x49f75d3281df052a!2s150%20Park%20Row%2C%20New%20York%2C%20NY%2010007!5e0!3m2!1sen!2sus!4v1645000000000!5m2!1sen!2sus"
                  className="contact-map"
                  title="Office Location"
                  loading="lazy"
                />
                {mapLocation.address && (
                  <div className="">
                    {mapLocation.address}
                  </div>
                )}
              </GridItem>
            )}
          </Grid>
        </Container>
      </Section>
    );
  }
);
ContactSection.displayName = 'ContactSection';

export { ContactSection }; 