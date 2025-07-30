import React from 'react';
import { Section, Container, H2, Text, Link } from '@/components/ui';
import { EditableText } from '@/design/components/core/layout/EditableSystem';
import { Grid } from '@/components/ui/layout/grid';
import { PhoneIcon, EmailIcon, MessageIcon, WhatsAppIcon } from '@/components/ui/icons';

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

export const ContactSection: React.FC<ContactSectionProps> = ({
  title,
  subtitle,
  description,
  contactMethods,
  variant = 'default',
  showMap = false,
  mapLocation,
  ...props
}) => {
  const getContactIcon = (type: ContactMethod['type']) => {
    switch (type) {
      case 'phone':
        return <PhoneIcon size="md" />;
      case 'email':
        return <EmailIcon size="md" />;
      case 'text':
        return <MessageIcon size="md" />;
      case 'whatsapp':
        return <WhatsAppIcon size="md" />;
    }
  };

  return (
    <Section {...props}>
      <Container maxWidth="xl">
        {title && (
          <H2>
            <EditableText field="contact.title" defaultValue={title}>
              {title}
            </EditableText>
          </H2>
        )}
        
        {subtitle && (
          <Text>
            <EditableText field="contact.subtitle" defaultValue={subtitle}>
              {subtitle}
            </EditableText>
          </Text>
        )}
        
        {description && (
          <Text>
            <EditableText field="contact.description" defaultValue={description}>
              {description}
            </EditableText>
          </Text>
        )}
        
        <Grid cols={variant === 'split' ? 2 : 3} gap="md">
          {contactMethods.map((method, index) => (
            <Container key={index}>
              <Link href={method.href}>
                <Container>
                  {getContactIcon(method.type)}
                </Container>
                <Container>
                  <Text>
                    <EditableText field={`contact.method${index}.label`} defaultValue={method.label}>
                      {method.label}
                    </EditableText>
                  </Text>
                  <Text>
                    <EditableText field={`contact.method${index}.value`} defaultValue={method.value}>
                      {method.value}
                    </EditableText>
                  </Text>
                </Container>
              </Link>
            </Container>
          ))}
          
          {showMap && mapLocation && (
            <Container>
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3024.2219901290355!2d-74.00369368400567!3d40.71312937933185!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25a23e28c1191%3A0x49f75d3281df052a!2s150%20Park%20Row%2C%20New%20York%2C%20NY%2010007!5e0!3m2!1sen!2sus!4v1645000000000!5m2!1sen!2sus"
                title="Office Location"
                loading="lazy"
              />
              {mapLocation.address && (
                <Container>
                  <Text size="sm">
                    <EditableText field="contact.map.address" defaultValue={mapLocation.address}>
                      {mapLocation.address}
                    </EditableText>
                  </Text>
                </Container>
              )}
            </Container>
          )}
        </Grid>
      </Container>
    </Section>
  );
};

ContactSection.displayName = 'ContactSection'; 