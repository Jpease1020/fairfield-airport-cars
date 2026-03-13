'use client';

export const dynamic = 'force-dynamic';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { Alert, Box, Button, Container, H1, LoadingSpinner, Stack, Text } from '@/design/ui';
import { authFetch } from '@/lib/utils/auth-fetch';

interface Recipient {
  name: string;
  phone: string;
  lastBookingDate: string | null;
}

interface Preflight {
  scannedBookings: number;
  uniqueContacts: number;
  optedInContacts: number;
  invalidPhoneContacts: number;
  excludedNoPhone: number;
  excludedOptedOut: number;
  recipients: Recipient[];
}

interface SendResult {
  total: number;
  successful: number;
  failed: number;
}

type Step = 'compose' | 'preview' | 'sending' | 'done';

// --- Styled components ---

const TextArea = styled.textarea`
  width: 100%;
  min-height: 120px;
  padding: 12px;
  border: 1px solid var(--border-color, #d1d5db);
  border-radius: 8px;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.5;
  resize: vertical;
  background: var(--surface-elevated, #fff);

  &:focus {
    outline: none;
    border-color: var(--color-primary, #2563eb);
    box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.15);
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border-color, #d1d5db);
  border-radius: 8px;
  font-family: inherit;
  font-size: 14px;
  background: var(--surface-elevated, #fff);

  &:focus {
    outline: none;
    border-color: var(--color-primary, #2563eb);
    box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.15);
  }
`;

const Select = styled.select`
  padding: 8px 12px;
  border: 1px solid var(--border-color, #d1d5db);
  border-radius: 8px;
  font-family: inherit;
  font-size: 14px;
  background: var(--surface-elevated, #fff);
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: var(--color-primary, #2563eb);
  }
`;

const CharCount = styled(Text)<{ $over: boolean }>`
  color: ${({ $over }) => ($over ? 'var(--color-error, #dc2626)' : 'var(--color-secondary, #6b7280)')};
`;

const StatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
`;

const StatBox = styled(Box)`
  text-align: center;
  padding: 14px;
  border-radius: 12px;
  border: 1px solid var(--border-color, #d1d5db);
`;

const FilterBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
`;

const RecipientList = styled.div`
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid var(--border-color, #d1d5db);
  border-radius: 8px;
`;

const RecipientRow = styled.label`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-bottom: 1px solid var(--border-color, #d1d5db);
  cursor: pointer;
  transition: background 0.1s;

  &:hover {
    background: rgba(37, 99, 235, 0.04);
  }

  &:last-child {
    border-bottom: none;
  }
`;

const Checkbox = styled.input`
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  cursor: pointer;
  accent-color: var(--color-primary, #2563eb);
`;

const RecipientInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const RecipientMeta = styled.div`
  flex-shrink: 0;
  text-align: right;
`;

const PreviewBubble = styled(Box)`
  background: var(--color-primary, #2563eb);
  color: white;
  padding: 14px 18px;
  border-radius: 18px 18px 4px 18px;
  max-width: 360px;
  font-size: 14px;
  line-height: 1.5;
  white-space: pre-wrap;
`;

const SelectAllBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 14px;
  background: var(--surface-elevated, #f9fafb);
  border: 1px solid var(--border-color, #d1d5db);
  border-radius: 8px 8px 0 0;
  border-bottom: none;
`;

const MAX_SMS_LENGTH = 160;

const RECENCY_OPTIONS = [
  { label: 'All time', value: 0 },
  { label: 'Last 30 days', value: 30 },
  { label: 'Last 60 days', value: 60 },
  { label: 'Last 90 days', value: 90 },
  { label: 'Last 6 months', value: 180 },
  { label: 'Last year', value: 365 },
];

const MIN_RIDES_OPTIONS = [
  { label: 'Any rides', value: 0 },
  { label: '2+ rides', value: 2 },
  { label: '3+ rides', value: 3 },
  { label: '5+ rides', value: 5 },
];

function daysSince(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  return Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
}

export default function AdminCampaignsPage() {
  const [step, setStep] = useState<Step>('compose');
  const [message, setMessage] = useState('');
  const [preflight, setPreflight] = useState<Preflight | null>(null);
  const [sendResult, setSendResult] = useState<SendResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [recencyDays, setRecencyDays] = useState(0);
  const [search, setSearch] = useState('');

  // Selection
  const [selectedPhones, setSelectedPhones] = useState<Set<string>>(new Set());

  const loadPreflight = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await authFetch('/api/admin/sms-campaign');
      if (!res.ok) throw new Error('Failed to load campaign data');
      const data = await res.json();
      setPreflight(data.preflight);
      // Select all by default
      setSelectedPhones(new Set((data.preflight.recipients as Recipient[]).map((r) => r.phone)));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load campaign data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPreflight();
  }, [loadPreflight]);

  // Apply filters to recipients
  const filteredRecipients = useMemo(() => {
    if (!preflight) return [];
    let list = preflight.recipients;

    // Recency filter
    if (recencyDays > 0) {
      list = list.filter((r) => {
        const days = daysSince(r.lastBookingDate);
        return days !== null && days <= recencyDays;
      });
    }

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.phone.includes(q)
      );
    }

    return list;
  }, [preflight, recencyDays, search]);

  // Selection helpers
  const allFilteredSelected = filteredRecipients.length > 0 && filteredRecipients.every((r) => selectedPhones.has(r.phone));
  const someFilteredSelected = filteredRecipients.some((r) => selectedPhones.has(r.phone));
  const selectedCount = filteredRecipients.filter((r) => selectedPhones.has(r.phone)).length;

  function toggleAll() {
    const next = new Set(selectedPhones);
    if (allFilteredSelected) {
      filteredRecipients.forEach((r) => next.delete(r.phone));
    } else {
      filteredRecipients.forEach((r) => next.add(r.phone));
    }
    setSelectedPhones(next);
  }

  function toggleOne(phone: string) {
    const next = new Set(selectedPhones);
    if (next.has(phone)) {
      next.delete(phone);
    } else {
      next.add(phone);
    }
    setSelectedPhones(next);
  }

  const previewMessage = (name: string) =>
    message.replace(/\{\{name\}\}/g, name);

  const charCount = previewMessage('Customer').length;
  const isOverLimit = charCount > MAX_SMS_LENGTH;
  const canSend = message.trim().length > 0 && selectedCount > 0;

  // Get the final list of selected recipients for sending
  const selectedRecipients = filteredRecipients.filter((r) => selectedPhones.has(r.phone));

  async function handleSend() {
    setStep('sending');
    setError(null);
    try {
      const res = await authFetch('/api/admin/sms-campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageTemplate: message,
          selectedPhones: selectedRecipients.map((r) => r.phone),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to send campaign');
      }
      const data = await res.json();
      setSendResult(data.sendResult);
      setStep('done');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to send campaign');
      setStep('preview');
    }
  }

  if (loading) {
    return (
      <Container maxWidth="md" padding="xl">
        <Stack spacing="lg" align="center" style={{ padding: '60px 0' }}>
          <LoadingSpinner />
          <Text>Loading campaign data...</Text>
        </Stack>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" padding="xl">
      <Stack spacing="lg">
        <Stack spacing="sm">
          <H1>SMS Campaign</H1>
          <Text color="secondary">
            Send a text message to opted-in customers. Messages include an automatic opt-out notice.
          </Text>
        </Stack>

        {error && <Alert variant="error">{error}</Alert>}

        {/* Audience stats */}
        {preflight && (
          <StatGrid>
            <StatBox>
              <Text size="xl" weight="bold">{selectedCount}</Text>
              <Text size="sm" color="secondary">Selected</Text>
            </StatBox>
            <StatBox>
              <Text size="xl" weight="bold">{preflight.optedInContacts}</Text>
              <Text size="sm" color="secondary">Opted In</Text>
            </StatBox>
            <StatBox>
              <Text size="xl" weight="bold">{preflight.excludedOptedOut}</Text>
              <Text size="sm" color="secondary">Opted Out</Text>
            </StatBox>
            <StatBox>
              <Text size="xl" weight="bold">{preflight.uniqueContacts}</Text>
              <Text size="sm" color="secondary">Total</Text>
            </StatBox>
          </StatGrid>
        )}

        {/* Step: Compose */}
        {step === 'compose' && (
          <Stack spacing="md">
            {/* Message composer */}
            <Stack spacing="xs">
              <Text weight="bold">Message</Text>
              <Text size="sm" color="secondary">
                Use {'{{name}}'} to personalize with the customer&apos;s name.
              </Text>
            </Stack>
            <TextArea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Hi {{name}}, we'd love to drive you again! Book your next airport ride at fairfieldairportcars.com"
            />
            <Stack direction="horizontal" justify="space-between" align="center">
              <CharCount size="sm" $over={isOverLimit}>
                {charCount}/{MAX_SMS_LENGTH} characters
                {isOverLimit && ' — will be split into multiple texts'}
              </CharCount>
            </Stack>

            {message.trim() && (
              <Stack spacing="xs">
                <Text size="sm" weight="bold">Preview:</Text>
                <PreviewBubble>
                  {previewMessage(selectedRecipients[0]?.name || preflight?.recipients[0]?.name || 'John')}
                </PreviewBubble>
              </Stack>
            )}

            {/* Filters */}
            <Stack spacing="sm">
              <Text weight="bold">Audience</Text>
              <FilterBar>
                <Select value={recencyDays} onChange={(e) => setRecencyDays(Number(e.target.value))}>
                  {RECENCY_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </Select>
                <Input
                  type="text"
                  placeholder="Search by name or phone..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ maxWidth: 280 }}
                />
              </FilterBar>
            </Stack>

            {/* Recipient list with checkboxes */}
            <Stack spacing="none">
              <SelectAllBar>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <Checkbox
                    type="checkbox"
                    checked={allFilteredSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = someFilteredSelected && !allFilteredSelected;
                    }}
                    onChange={toggleAll}
                  />
                  <Text size="sm" weight="bold">
                    {allFilteredSelected ? 'Deselect all' : 'Select all'} ({filteredRecipients.length})
                  </Text>
                </label>
                <Text size="sm" color="secondary">
                  {selectedCount} selected
                </Text>
              </SelectAllBar>
              <RecipientList>
                {filteredRecipients.length === 0 ? (
                  <div style={{ padding: '24px', textAlign: 'center' }}>
                    <Text color="secondary">No customers match your filters</Text>
                  </div>
                ) : (
                  filteredRecipients.map((r) => (
                    <RecipientRow key={r.phone}>
                      <Checkbox
                        type="checkbox"
                        checked={selectedPhones.has(r.phone)}
                        onChange={() => toggleOne(r.phone)}
                      />
                      <RecipientInfo>
                        <Text weight="bold">{r.name}</Text>
                        <Text size="sm" color="secondary">{r.phone}</Text>
                      </RecipientInfo>
                      <RecipientMeta>
                        <Text size="sm" color="secondary">
                          {r.lastBookingDate
                            ? `Last ride: ${new Date(r.lastBookingDate).toLocaleDateString()}`
                            : 'No rides yet'}
                        </Text>
                      </RecipientMeta>
                    </RecipientRow>
                  ))
                )}
              </RecipientList>
            </Stack>

            <Button
              variant="primary"
              text={`Review before sending to ${selectedCount} customer${selectedCount !== 1 ? 's' : ''}`}
              onClick={() => setStep('preview')}
              disabled={!canSend}
            />
          </Stack>
        )}

        {/* Step: Preview / Confirm */}
        {step === 'preview' && (
          <Stack spacing="md">
            <Alert variant="info">
              <Text weight="bold">Ready to send to {selectedCount} customer{selectedCount !== 1 ? 's' : ''}</Text>
            </Alert>

            <Stack spacing="xs">
              <Text weight="bold">Message preview:</Text>
              <PreviewBubble>
                {previewMessage(selectedRecipients[0]?.name || 'Customer')}
              </PreviewBubble>
            </Stack>

            <Stack spacing="xs">
              <Text weight="bold">Recipients ({selectedCount}):</Text>
              <RecipientList>
                {selectedRecipients.map((r) => (
                  <RecipientRow key={r.phone} as="div" style={{ cursor: 'default' }}>
                    <RecipientInfo>
                      <Text weight="bold">{r.name}</Text>
                      <Text size="sm" color="secondary">{r.phone}</Text>
                    </RecipientInfo>
                    <RecipientMeta>
                      <Text size="sm" color="secondary">
                        {r.lastBookingDate
                          ? `Last ride: ${new Date(r.lastBookingDate).toLocaleDateString()}`
                          : 'No rides yet'}
                      </Text>
                    </RecipientMeta>
                  </RecipientRow>
                ))}
              </RecipientList>
            </Stack>

            <Stack direction="horizontal" spacing="md">
              <Button
                variant="outline"
                text="Back to edit"
                onClick={() => setStep('compose')}
              />
              <Button
                variant="primary"
                text={`Send to ${selectedCount} customer${selectedCount !== 1 ? 's' : ''}`}
                onClick={handleSend}
              />
            </Stack>
          </Stack>
        )}

        {/* Step: Sending */}
        {step === 'sending' && (
          <Stack spacing="md" align="center" style={{ padding: '40px 0' }}>
            <LoadingSpinner />
            <Text>Sending messages...</Text>
          </Stack>
        )}

        {/* Step: Done */}
        {step === 'done' && sendResult && (
          <Stack spacing="md">
            <Alert variant="success">
              <Text weight="bold">Campaign sent!</Text>
            </Alert>

            <StatGrid>
              <StatBox>
                <Text size="xl" weight="bold">{sendResult.successful}</Text>
                <Text size="sm" color="secondary">Delivered</Text>
              </StatBox>
              <StatBox>
                <Text size="xl" weight="bold">{sendResult.failed}</Text>
                <Text size="sm" color="secondary">Failed</Text>
              </StatBox>
              <StatBox>
                <Text size="xl" weight="bold">{sendResult.total}</Text>
                <Text size="sm" color="secondary">Total</Text>
              </StatBox>
            </StatGrid>

            <Button
              variant="outline"
              text="Send another campaign"
              onClick={() => {
                setMessage('');
                setSendResult(null);
                setStep('compose');
                loadPreflight();
              }}
            />
          </Stack>
        )}
      </Stack>
    </Container>
  );
}
