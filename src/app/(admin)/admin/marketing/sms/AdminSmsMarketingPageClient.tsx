'use client';

import { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { Alert, Badge, Box, Button, Container, H1, LoadingSpinner, Stack, Text, Textarea } from '@/design/ui';
import { authFetch } from '@/lib/utils/auth-fetch';
import { formatDateTimeNoSeconds } from '@/utils/formatting';

interface SmsContact {
  name: string;
  phone: string;
  optedIn: boolean;
  lastBookingDate: string | null;
}

interface ManualRecipient {
  name: string;
  phone: string;
}

interface SendResult {
  total: number;
  successful: number;
  failed: number;
  results: Array<{ phone: string; name: string; success: boolean; error?: string }>;
}

const ContactRow = styled.label`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  cursor: pointer;

  &:hover {
    border-color: var(--color-primary, #2563eb);
  }
`;

const ContactList = styled(Box)`
  max-height: 360px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

// Loose local key for client-side dedup/merge display only — the server independently
// validates/normalizes every phone number before sending, this just avoids double-counting.
const dedupeKey = (phone: string): string => phone.replace(/[^\d]/g, '').slice(-10);

const parseManualEntries = (raw: string): ManualRecipient[] => {
  return raw
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const commaIndex = line.lastIndexOf(',');
      if (commaIndex === -1) return { name: 'there', phone: line.trim() };
      return {
        name: line.slice(0, commaIndex).trim() || 'there',
        phone: line.slice(commaIndex + 1).trim(),
      };
    })
    .filter((r) => r.phone.replace(/[^\d]/g, '').length >= 10);
};

export default function AdminSmsMarketingPageClient() {
  const [contacts, setContacts] = useState<SmsContact[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [contactsError, setContactsError] = useState<string | null>(null);
  const [selectedPhones, setSelectedPhones] = useState<Set<string>>(new Set());
  const [manualEntriesText, setManualEntriesText] = useState('');
  const [messageTemplate, setMessageTemplate] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [sendResult, setSendResult] = useState<SendResult | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadContacts() {
      try {
        setLoadingContacts(true);
        setContactsError(null);
        const res = await authFetch('/api/admin/sms-campaign/contacts');
        if (!res.ok) throw new Error('Failed to load contacts');
        const data = await res.json();
        if (!cancelled) setContacts(data.contacts ?? []);
      } catch (err) {
        if (!cancelled) setContactsError(err instanceof Error ? err.message : 'Failed to load contacts');
      } finally {
        if (!cancelled) setLoadingContacts(false);
      }
    }
    loadContacts();
    return () => {
      cancelled = true;
    };
  }, []);

  const manualRecipients = useMemo(() => parseManualEntries(manualEntriesText), [manualEntriesText]);

  const selectedContacts = useMemo(
    () => contacts.filter((c) => selectedPhones.has(c.phone)),
    [contacts, selectedPhones]
  );

  const finalRecipients = useMemo(() => {
    const merged = new Map<string, { name: string; phone: string; optedIn: boolean | null }>();
    for (const c of selectedContacts) {
      merged.set(dedupeKey(c.phone), { name: c.name, phone: c.phone, optedIn: c.optedIn });
    }
    for (const m of manualRecipients) {
      const key = dedupeKey(m.phone);
      if (!merged.has(key)) {
        merged.set(key, { name: m.name, phone: m.phone, optedIn: null });
      }
    }
    return Array.from(merged.values());
  }, [selectedContacts, manualRecipients]);

  const notOptedInCount = finalRecipients.filter((r) => r.optedIn !== true).length;

  function toggleContact(phone: string) {
    setSelectedPhones((prev) => {
      const next = new Set(prev);
      if (next.has(phone)) next.delete(phone);
      else next.add(phone);
      return next;
    });
  }

  function selectAllOptedIn() {
    setSelectedPhones(new Set(contacts.filter((c) => c.optedIn).map((c) => c.phone)));
  }

  function selectAll() {
    setSelectedPhones(new Set(contacts.map((c) => c.phone)));
  }

  function clearSelection() {
    setSelectedPhones(new Set());
  }

  async function handleSend() {
    setSendError(null);
    setSendResult(null);

    if (!messageTemplate.trim()) {
      setSendError('Message is required.');
      return;
    }
    if (finalRecipients.length === 0) {
      setSendError('Select at least one recipient.');
      return;
    }

    const confirmed = window.confirm(
      notOptedInCount > 0
        ? `Send to ${finalRecipients.length} recipient(s)? ${notOptedInCount} of them have not opted in to SMS marketing.`
        : `Send to ${finalRecipients.length} recipient(s)?`
    );
    if (!confirmed) return;

    try {
      setSending(true);
      const res = await authFetch('/api/admin/sms-campaign/send-to-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipients: finalRecipients.map((r) => ({ phone: r.phone, name: r.name })),
          messageTemplate: messageTemplate.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Failed to send campaign');
      setSendResult(data.sendResult);
    } catch (err) {
      setSendError(err instanceof Error ? err.message : 'Failed to send campaign');
    } finally {
      setSending(false);
    }
  }

  return (
    <Container maxWidth="lg" padding="xl">
      <Stack spacing="lg">
        <Stack spacing="sm">
          <H1>SMS Marketing</H1>
          <Text color="secondary">
            Send a bulk text from the business number. Sends from the SMS/MMS messaging service configured in Twilio, with a
            rate-limited send and an automatic opt-out notice.
          </Text>
        </Stack>

        <Box variant="outlined" padding="md">
          <Stack spacing="md">
            <Stack direction="horizontal" justify="space-between" align="center">
              <Text weight="bold">Known contacts ({contacts.length})</Text>
              <Stack direction="horizontal" spacing="sm">
                <Button size="sm" variant="outline" text="Select opted-in" onClick={selectAllOptedIn} />
                <Button size="sm" variant="outline" text="Select all" onClick={selectAll} />
                <Button size="sm" variant="outline" text="Clear" onClick={clearSelection} />
              </Stack>
            </Stack>

            {contactsError && <Alert variant="error">{contactsError}</Alert>}

            {loadingContacts ? (
              <LoadingSpinner />
            ) : contacts.length === 0 ? (
              <Text color="secondary">No customer contacts found from past bookings.</Text>
            ) : (
              <ContactList>
                {contacts.map((contact) => (
                  <ContactRow key={contact.phone}>
                    <input
                      type="checkbox"
                      checked={selectedPhones.has(contact.phone)}
                      onChange={() => toggleContact(contact.phone)}
                    />
                    <Stack spacing="xs" style={{ flex: 1 }}>
                      <Stack direction="horizontal" spacing="sm" align="center">
                        <Text weight="medium">{contact.name}</Text>
                        <Badge variant={contact.optedIn ? 'success' : 'warning'}>
                          {contact.optedIn ? 'Opted in' : 'Not opted in'}
                        </Badge>
                      </Stack>
                      <Text size="sm" color="secondary">
                        {contact.phone}
                        {contact.lastBookingDate ? ` • last booking ${formatDateTimeNoSeconds(contact.lastBookingDate)}` : ''}
                      </Text>
                    </Stack>
                  </ContactRow>
                ))}
              </ContactList>
            )}
          </Stack>
        </Box>

        <Box variant="outlined" padding="md">
          <Stack spacing="sm">
            <Text weight="bold">Add numbers manually (optional)</Text>
            <Text size="sm" color="secondary">
              One per line. Format: <code>Name, (203) 555-1234</code> or just the phone number. These bypass the opt-in list
              above, so use judgment on who you message.
            </Text>
            <Textarea
              value={manualEntriesText}
              onChange={(e) => setManualEntriesText(e.target.value)}
              placeholder={'Jane Doe, (203) 555-1234\n(203) 555-9999'}
              rows={4}
            />
          </Stack>
        </Box>

        <Box variant="outlined" padding="md">
          <Stack spacing="sm">
            <Text weight="bold">Message</Text>
            <Text size="sm" color="secondary">
              Use <code>{'{{name}}'}</code> to insert each recipient&apos;s first name.
            </Text>
            <Textarea
              value={messageTemplate}
              onChange={(e) => setMessageTemplate(e.target.value)}
              placeholder="Hey {{name}}, it's Gregg from Fairfield Airport Car Service..."
              rows={4}
            />
          </Stack>
        </Box>

        <Box variant="filled" padding="md">
          <Stack spacing="sm">
            <Text weight="bold">
              {finalRecipients.length} recipient{finalRecipients.length === 1 ? '' : 's'} selected
            </Text>
            {notOptedInCount > 0 && (
              <Alert variant="warning">
                {notOptedInCount} of {finalRecipients.length} selected recipients have not opted in to SMS marketing.
                Sending to them anyway is your call to make, not a technical restriction.
              </Alert>
            )}
            {sendError && <Alert variant="error">{sendError}</Alert>}
            {sendResult && (
              <Alert variant={sendResult.failed > 0 ? 'warning' : 'success'}>
                Sent {sendResult.successful}/{sendResult.total}
                {sendResult.failed > 0 ? ` (${sendResult.failed} failed)` : ''}.
              </Alert>
            )}
            <Button
              variant="primary"
              onClick={() => handleSend()}
              disabled={sending || finalRecipients.length === 0 || !messageTemplate.trim()}
              text={sending ? 'Sending…' : `Send to ${finalRecipients.length}`}
            />
          </Stack>
        </Box>
      </Stack>
    </Container>
  );
}
