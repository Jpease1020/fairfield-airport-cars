'use client';

import React, { useState, useEffect } from 'react';
import { cmsService } from '@/lib/services/cms-service';
import { EmailTemplates, SMSTemplates, DEFAULT_CMS_CONFIG } from '@/types/cms';

import { 
  GridSection, 
  Box, 
  ToastProvider,
  useToast,
  Text,
  Stack,
  Input,
  Textarea,
  SettingToggle,
} from '@/ui';
import { useCMSData, getCMSField } from '@/design/providers/CMSDesignProvider';

function CommunicationPageContent() {
  const { addToast } = useToast();
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplates | null>(null);
  const [smsTemplates, setSmsTemplates] = useState<SMSTemplates | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { cmsData } = useCMSData();
  
  const ensureEmailTemplates = (t: EmailTemplates | null): EmailTemplates => t ?? DEFAULT_CMS_CONFIG.communication.email;
  const ensureSMSTemplates = (t: SMSTemplates | null): SMSTemplates => t ?? DEFAULT_CMS_CONFIG.communication.sms;
  useEffect(() => {
    loadCommunicationSettings();
  }, []);

  const loadCommunicationSettings = async () => {
    try {
      setError(null);
      setLoading(true);
      
      const config = await cmsService.getCMSConfiguration();
      if (config?.communication) {
        setEmailTemplates(config.communication.email);
        setSmsTemplates(config.communication.sms);
      }
    } catch (err) {
      console.error('Error loading communication settings:', err);
      setError('Failed to load communication settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const result = await cmsService.updateCMSConfiguration({
        communication: {
          email: emailTemplates!,
          sms: smsTemplates!
        }
      });

      if (result.success) {
        addToast('success', 'Communication settings saved successfully!');
      } else {
        throw new Error(result.errors?.join(', ') || 'Failed to save');
      }
    } catch (err) {
      console.error('Error saving communication settings:', err);
      addToast('error', 'Failed to save communication settings: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  const headerActions = [
    { 
      label: 'Refresh', 
      onClick: loadCommunicationSettings, 
      variant: 'outline' as const,
      disabled: loading
    },
    { 
      label: 'Save Changes', 
      onClick: handleSave, 
      variant: 'primary' as const,
      disabled: saving || loading
    }
  ];

  const emailTemplateSections = [
    {
      id: 'bookingConfirmation',
      title: 'Booking Confirmation Email',
      description: 'Sent when a booking is confirmed',
      fields: [
        { key: 'subject', label: 'Subject Line', type: 'input' },
        { key: 'body', label: 'Email Body', type: 'textarea' },
        { key: 'includeCalendarInvite', label: 'Include Calendar Invite', type: 'switch' }
      ]
    },
    {
      id: 'bookingReminder',
      title: 'Booking Reminder Email',
      description: 'Sent before the scheduled ride',
      fields: [
        { key: 'subject', label: 'Subject Line', type: 'input' },
        { key: 'body', label: 'Email Body', type: 'textarea' },
        { key: 'sendHoursBefore', label: 'Send Hours Before', type: 'input', inputType: 'number' }
      ]
    },
    {
      id: 'cancellation',
      title: 'Cancellation Email',
      description: 'Sent when a booking is cancelled',
      fields: [
        { key: 'subject', label: 'Subject Line', type: 'input' },
        { key: 'body', label: 'Email Body', type: 'textarea' }
      ]
    },
    {
      id: 'feedback',
      title: 'Feedback Request Email',
      description: 'Sent after ride completion',
      fields: [
        { key: 'subject', label: 'Subject Line', type: 'input' },
        { key: 'body', label: 'Email Body', type: 'textarea' },
        { key: 'sendDaysAfter', label: 'Send Days After', type: 'input', inputType: 'number' }
      ]
    }
  ];

  const smsTemplateSections = [
    {
      id: 'bookingConfirmation',
      title: 'Booking Confirmation SMS',
      description: 'Sent when a booking is confirmed',
      field: 'bookingConfirmation'
    },
    {
      id: 'bookingReminder',
      title: 'Booking Reminder SMS',
      description: 'Sent before the scheduled ride',
      field: 'bookingReminder'
    },
    {
      id: 'driverEnRoute',
      title: 'Driver En Route SMS',
      description: 'Sent when driver is on the way',
      field: 'driverEnRoute'
    },
    {
      id: 'driverArrived',
      title: 'Driver Arrived SMS',
      description: 'Sent when driver arrives',
      field: 'driverArrived'
    }
  ];

  if (loading) {
    return (
      
        <Box variant="elevated" padding="lg">
          <Text>Loading communication settings...</Text>
        </Box>
      
    );
  }

  return (
    <>
      {/* Email Templates */}
      <GridSection variant="content" columns={1}>
        <Box variant="elevated" padding="lg">
          <Stack spacing="lg">
            <Text variant="lead" size="lg" weight="semibold">
              📧 Email Templates
            </Text>
            <Text variant="muted" size="sm">
              Customize email templates for different booking events
            </Text>
            
            {emailTemplateSections.map((section) => (
              <Box key={section.id} variant="outlined" padding="md">
                <Stack spacing="md">
                  <Stack spacing="sm">
                    <Text variant="lead" size="md" weight="semibold">
                      {section.title}
                    </Text>
                    <Text variant="muted" size="sm">
                      {section.description}
                    </Text>
                  </Stack>
                  
                  {section.fields.map((field) => (
                    <Stack key={field.key} spacing="sm">
                      <Text variant="body" size="sm" weight="medium">
                        {field.label}
                      </Text>
                      
                      {field.type === 'input' && (
                        <Input
                          value={String(((emailTemplates?.[section.id as keyof EmailTemplates] as any)?.[field.key]) ?? '')}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            const nextValue = field.inputType === 'number' ? Number(e.target.value) : e.target.value;
                            setEmailTemplates((prev) => {
                              const base = ensureEmailTemplates(prev);
                              const sectionId = section.id as keyof EmailTemplates;
                              const updatedSection = { ...(base[sectionId] as any), [field.key]: nextValue };
                              return { ...base, [sectionId]: updatedSection } as EmailTemplates;
                            });
                          }}
                          type={field.inputType === 'number' ? 'number' : 'text'}
                          placeholder={`Enter ${field.label.toLowerCase()}`}
                        />
                      )}
                      
                      {field.type === 'textarea' && (
                        <Textarea
                          value={String(((emailTemplates?.[section.id as keyof EmailTemplates] as any)?.[field.key]) ?? '')}
                          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                            setEmailTemplates((prev) => {
                              const base = ensureEmailTemplates(prev);
                              const sectionId = section.id as keyof EmailTemplates;
                              const updatedSection = { ...(base[sectionId] as any), [field.key]: e.target.value };
                              return { ...base, [sectionId]: updatedSection } as EmailTemplates;
                            });
                          }}
                          placeholder={`Enter ${field.label.toLowerCase()}`}
                          rows={4}
                        />
                      )}
                      
                      {field.type === 'switch' && (
                        <SettingToggle
                          id={`${section.id}-${field.key}`}
                          label={field.label}
                          description=""
                          checked={Boolean(((emailTemplates?.[section.id as keyof EmailTemplates] as any)?.[field.key]) ?? false)}
                          onChange={(checked: boolean) => {
                            setEmailTemplates((prev) => {
                              const base = ensureEmailTemplates(prev);
                              const sectionId = section.id as keyof EmailTemplates;
                              const updatedSection = { ...(base[sectionId] as any), [field.key]: checked };
                              return { ...base, [sectionId]: updatedSection } as EmailTemplates;
                            });
                          }}
                        />
                      )}
                    </Stack>
                  ))}
                </Stack>
              </Box>
            ))}
          </Stack>
        </Box>
      </GridSection>

      {/* SMS Templates */}
      <GridSection variant="content" columns={1}>
        <Box variant="elevated" padding="lg">
          <Stack spacing="lg">
            <Text variant="lead" size="lg" weight="semibold">
              📱 SMS Templates
            </Text>
            <Text variant="muted" size="sm">
              Customize SMS messages for different booking events
            </Text>
            
            {smsTemplateSections.map((section) => (
              <Box key={section.id} variant="outlined" padding="md">
                <Stack spacing="md">
                  <Stack spacing="sm">
                    <Text variant="lead" size="md" weight="semibold">
                      {section.title}
                    </Text>
                    <Text variant="muted" size="sm">
                      {section.description}
                    </Text>
                  </Stack>
                  
                  <Stack spacing="sm">
                    <Text variant="body" size="sm" weight="medium">
                      Message Content
                    </Text>
                    <Textarea
                      value={smsTemplates?.[section.field as keyof SMSTemplates] || ''}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                        setSmsTemplates((prev) => {
                          const base = ensureSMSTemplates(prev);
                          const fieldKey = section.field as keyof SMSTemplates;
                          return { ...base, [fieldKey]: e.target.value } as SMSTemplates;
                        });
                      }}
                      placeholder="Enter SMS message content"
                      rows={3}
                    />
                  </Stack>
                </Stack>
              </Box>
            ))}
          </Stack>
        </Box>
      </GridSection>

      {/* Template Variables Help */}
      <GridSection variant="content" columns={1}>
        <Box variant="elevated" padding="lg">
          <Stack spacing="md">
            <Text variant="lead" size="md" weight="semibold">
              🔧 Template Variables
            </Text>
            <Text variant="muted" size="sm">
              Use these variables in your templates to insert dynamic content
            </Text>
            
            <Stack spacing="sm">
              <Text variant="body" size="sm">
                <strong>Booking Variables:</strong> {'{pickupDateTime}'}, {'{pickupLocation}'}, {'{dropoffLocation}'}, {'{passengers}'}, {'{fare}'}
              </Text>
              <Text variant="body" size="sm">
                <strong>Driver Variables:</strong> {'{driverName}'}, {'{driverPhone}'}, {'{eta}'}
              </Text>
              <Text variant="body" size="sm">
                <strong>Customer Variables:</strong> {'{customerName}'}, {'{customerPhone}'}, {'{customerEmail}'}
              </Text>
              <Text variant="body" size="sm">
                <strong>Flight Variables:</strong> {'{flightNumber}'}, {'{airline}'}, {'{terminal}'}
              </Text>
            </Stack>
          </Stack>
        </Box>
      </GridSection>
    </>
  );
}

const CommunicationPage = () => {
  return (
    <ToastProvider>
      <CommunicationPageContent />
    </ToastProvider>
  );
};

export default CommunicationPage; 