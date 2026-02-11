'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Stack,
  Text,
  Button,
  Box,
  Badge,
  DataTable,
  Alert,
  LoadingSpinner,
  Container,
} from '@/design/ui';
import { Modal } from '@/design/components/base-components/Modal';
import { Textarea } from '@/design/components/base-components/forms/Textarea';
import { useCMSData } from '@/design/providers/CMSDataProvider';

interface MarketingCustomer {
  id: string;
  name: string;
  phone: string;
  email: string;
  bookingCount: number;
  lastBookingDate: string | null;
  totalSpent: number;
  isActive: boolean;
}

interface CampaignResult {
  total: number;
  successful: number;
  failed: number;
  details: Array<{
    phone: string;
    name: string;
    success: boolean;
    messageId?: string;
    error?: string;
  }>;
}

// Pre-built message templates
const MESSAGE_TEMPLATES = {
  promotional: "Hi {{name}}! Get 10% off your next ride with Fairfield Airport Cars. Book now at fairfieldairportcars.com - Your trusted airport car service!",
  reengagement: "Hi {{name}}, we miss you! It's been a while since your last ride with us. Ready to book your next trip? Visit fairfieldairportcars.com",
  seasonal: "Hi {{name}}! Planning holiday travel? Book your airport ride early with Fairfield Airport Cars. Visit fairfieldairportcars.com to reserve your spot!",
};

export default function SMSMarketingPage() {
  const { cmsData: _cmsData } = useCMSData();

  const [customers, setCustomers] = useState<MarketingCustomer[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Modal states
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [resultsModalOpen, setResultsModalOpen] = useState(false);
  const [campaignResult, setCampaignResult] = useState<CampaignResult | null>(null);

  const fetchCustomers = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);

      const response = await fetch('/api/admin/marketing/sms');
      if (!response.ok) {
        throw new Error('Failed to fetch customers');
      }

      const data = await response.json();
      setCustomers(data.customers || []);
    } catch (err) {
      console.error('Error fetching customers:', err);
      setError('Failed to load customers. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Filter customers based on active status
  const filteredCustomers = customers.filter(c => {
    if (filter === 'active') return c.isActive;
    if (filter === 'inactive') return !c.isActive;
    return true;
  });

  // Selection handlers
  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedIds(filteredCustomers.map(c => c.id));
  };

  const deselectAll = () => {
    setSelectedIds([]);
  };

  // Template handlers
  const applyTemplate = (template: keyof typeof MESSAGE_TEMPLATES) => {
    setMessage(MESSAGE_TEMPLATES[template]);
  };

  // Preview message with sample name
  const previewMessage = message.replace(/\{\{name\}\}/gi, 'John');

  // Character count and cost estimate
  const charCount = message.length;
  const isMultiPart = charCount > 160;
  const estimatedCost = selectedIds.length * 0.0079 * (isMultiPart ? Math.ceil(charCount / 153) : 1);

  // Send campaign
  const sendCampaign = async () => {
    try {
      setSending(true);
      setError(null);
      setConfirmModalOpen(false);

      const response = await fetch('/api/admin/marketing/sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerIds: selectedIds,
          message,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send campaign');
      }

      setCampaignResult(data.results);
      setResultsModalOpen(true);

      // Clear selection after successful send
      setSelectedIds([]);
      setMessage('');
    } catch (err) {
      console.error('Error sending campaign:', err);
      setError(err instanceof Error ? err.message : 'Failed to send campaign');
    } finally {
      setSending(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  // Stats
  const stats = {
    total: customers.length,
    active: customers.filter(c => c.isActive).length,
    inactive: customers.filter(c => !c.isActive).length,
    selected: selectedIds.length,
  };

  if (loading) {
    return (
      <Container>
        <Stack spacing="lg" align="center">
          <LoadingSpinner />
          <Text>Loading customers...</Text>
        </Stack>
      </Container>
    );
  }

  // Build table data
  const tableData = filteredCustomers.map(customer => ({
    id: customer.id,
    select: (
      <input
        type="checkbox"
        checked={selectedIds.includes(customer.id)}
        onChange={() => toggleSelect(customer.id)}
        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
      />
    ),
    name: customer.name,
    phone: customer.phone,
    bookings: customer.bookingCount,
    lastBooking: formatDate(customer.lastBookingDate),
    spent: formatCurrency(customer.totalSpent),
    status: (
      <Badge variant={customer.isActive ? 'success' : 'default'}>
        {customer.isActive ? 'Active' : 'Inactive'}
      </Badge>
    ),
  }));

  return (
    <Container>
      <Stack spacing="xl">
        {/* Header */}
        <Stack spacing="sm">
          <Text size="2xl" weight="bold">SMS Marketing</Text>
          <Text color="secondary">Send promotional messages to your customers via SMS</Text>
        </Stack>

        {/* Error Alert */}
        {error && (
          <Alert variant="error">
            <Text>{error}</Text>
          </Alert>
        )}

        {/* Stats Cards */}
        <Stack direction="horizontal" spacing="md" wrap="wrap">
          <Box variant="elevated" padding="lg">
            <Stack spacing="xs" align="center">
              <Text size="xl">📱</Text>
              <Text size="2xl" weight="bold">{stats.total}</Text>
              <Text variant="small" color="secondary">Total Customers</Text>
            </Stack>
          </Box>
          <Box variant="elevated" padding="lg">
            <Stack spacing="xs" align="center">
              <Text size="xl">✅</Text>
              <Text size="2xl" weight="bold">{stats.active}</Text>
              <Text variant="small" color="secondary">Active (90 days)</Text>
            </Stack>
          </Box>
          <Box variant="elevated" padding="lg">
            <Stack spacing="xs" align="center">
              <Text size="xl">😴</Text>
              <Text size="2xl" weight="bold">{stats.inactive}</Text>
              <Text variant="small" color="secondary">Inactive</Text>
            </Stack>
          </Box>
          <Box variant="elevated" padding="lg">
            <Stack spacing="xs" align="center">
              <Text size="xl">✉️</Text>
              <Text size="2xl" weight="bold">{stats.selected}</Text>
              <Text variant="small" color="secondary">Selected</Text>
            </Stack>
          </Box>
        </Stack>

        {/* Message Composer */}
        <Box variant="elevated" padding="lg">
          <Stack spacing="md">
            <Text size="lg" weight="bold">Compose Message</Text>

            {/* Templates */}
            <Stack spacing="sm">
              <Text variant="small" weight="medium">Quick Templates:</Text>
              <Stack direction="horizontal" spacing="sm" wrap="wrap">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => applyTemplate('promotional')}
                  text="🎁 Promotional"
                />
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => applyTemplate('reengagement')}
                  text="👋 Re-engagement"
                />
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => applyTemplate('seasonal')}
                  text="🎄 Seasonal"
                />
              </Stack>
            </Stack>

            {/* Message Input */}
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message here... Use {{name}} to personalize with customer's first name."
              rows={4}
            />

            {/* Character Count */}
            <Stack direction="horizontal" spacing="md" justify="space-between">
              <Text variant="small" color={charCount > 160 ? 'warning' : 'secondary'}>
                {charCount}/160 characters {isMultiPart && `(${Math.ceil(charCount / 153)} SMS parts)`}
              </Text>
              <Text variant="small" color="secondary">
                Tip: Use {'{{name}}'} to personalize
              </Text>
            </Stack>

            {/* Preview */}
            {message && (
              <Box variant="filled" padding="md">
                <Stack spacing="xs">
                  <Text variant="small" weight="medium">Preview:</Text>
                  <Text variant="body">&quot;{previewMessage}&quot;</Text>
                </Stack>
              </Box>
            )}
          </Stack>
        </Box>

        {/* Customer Selection */}
        <Box variant="elevated" padding="lg">
          <Stack spacing="md">
            <Stack direction="horizontal" spacing="md" justify="space-between" align="center">
              <Text size="lg" weight="bold">Select Recipients</Text>
              <Stack direction="horizontal" spacing="sm">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as 'all' | 'active' | 'inactive')}
                  style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                >
                  <option value="all">All Customers</option>
                  <option value="active">Active (90 days)</option>
                  <option value="inactive">Inactive</option>
                </select>
              </Stack>
            </Stack>

            {/* Selection Controls */}
            <Stack direction="horizontal" spacing="sm">
              <Button size="sm" variant="secondary" onClick={selectAll} text="Select All" />
              <Button size="sm" variant="secondary" onClick={deselectAll} text="Deselect All" />
              {selectedIds.length > 0 && (
                <Text variant="body" weight="medium">
                  {selectedIds.length} customer{selectedIds.length !== 1 ? 's' : ''} selected
                </Text>
              )}
            </Stack>

            {/* Customer Table */}
            {filteredCustomers.length === 0 ? (
              <Box variant="filled" padding="lg">
                <Stack spacing="sm" align="center">
                  <Text size="xl">📭</Text>
                  <Text weight="medium">No customers found</Text>
                  <Text variant="small" color="secondary">
                    Customers will appear here after they make bookings.
                  </Text>
                </Stack>
              </Box>
            ) : (
              <DataTable
                data={tableData}
                columns={[
                  { key: 'select', label: '', width: '40px' },
                  { key: 'name', label: 'Name' },
                  { key: 'phone', label: 'Phone' },
                  { key: 'bookings', label: 'Bookings' },
                  { key: 'lastBooking', label: 'Last Booking' },
                  { key: 'spent', label: 'Total Spent' },
                  { key: 'status', label: 'Status' },
                ]}
              />
            )}
          </Stack>
        </Box>

        {/* Send Section */}
        {selectedIds.length > 0 && message.trim() && (
          <Box variant="elevated" padding="lg">
            <Stack spacing="md">
              <Text size="lg" weight="bold">Ready to Send</Text>
              <Stack spacing="xs">
                <Text>• {selectedIds.length} recipient{selectedIds.length !== 1 ? 's' : ''} selected</Text>
                <Text>• Estimated cost: {formatCurrency(estimatedCost)}</Text>
                {isMultiPart && (
                  <Text color="warning">
                    • Message will be split into {Math.ceil(charCount / 153)} parts
                  </Text>
                )}
              </Stack>
              <Button
                variant="primary"
                onClick={() => setConfirmModalOpen(true)}
                disabled={sending}
                text={sending ? 'Sending...' : '📤 Preview & Send'}
              />
            </Stack>
          </Box>
        )}

        {/* Confirmation Modal */}
        <Modal
          isOpen={confirmModalOpen}
          onClose={() => setConfirmModalOpen(false)}
          title="Confirm SMS Campaign"
          size="md"
          footer={
            <Stack direction="horizontal" spacing="sm" justify="flex-end">
              <Button
                variant="secondary"
                onClick={() => setConfirmModalOpen(false)}
                text="Cancel"
              />
              <Button
                variant="primary"
                onClick={sendCampaign}
                disabled={sending}
                text={sending ? 'Sending...' : 'Send Now'}
              />
            </Stack>
          }
        >
          <Stack spacing="md">
            <Alert variant="warning">
              <Text>This will send SMS messages to {selectedIds.length} customer{selectedIds.length !== 1 ? 's' : ''}.</Text>
            </Alert>

            <Stack spacing="xs">
              <Text weight="medium">Message Preview:</Text>
              <Box variant="filled" padding="md">
                <Text>&quot;{previewMessage}&quot;</Text>
              </Box>
            </Stack>

            <Stack spacing="xs">
              <Text weight="medium">Summary:</Text>
              <Text>• Recipients: {selectedIds.length}</Text>
              <Text>• Estimated cost: {formatCurrency(estimatedCost)}</Text>
            </Stack>
          </Stack>
        </Modal>

        {/* Results Modal */}
        <Modal
          isOpen={resultsModalOpen}
          onClose={() => setResultsModalOpen(false)}
          title="Campaign Results"
          size="md"
          footer={
            <Stack direction="horizontal" spacing="sm" justify="flex-end">
              <Button
                variant="primary"
                onClick={() => setResultsModalOpen(false)}
                text="Done"
              />
            </Stack>
          }
        >
          {campaignResult && (
            <Stack spacing="md">
              <Stack direction="horizontal" spacing="lg">
                <Stack spacing="xs" align="center">
                  <Text size="2xl" weight="bold" color="success">{campaignResult.successful}</Text>
                  <Text variant="small">Sent</Text>
                </Stack>
                <Stack spacing="xs" align="center">
                  <Text size="2xl" weight="bold" color="error">{campaignResult.failed}</Text>
                  <Text variant="small">Failed</Text>
                </Stack>
                <Stack spacing="xs" align="center">
                  <Text size="2xl" weight="bold">{campaignResult.total}</Text>
                  <Text variant="small">Total</Text>
                </Stack>
              </Stack>

              {campaignResult.failed > 0 && (
                <Stack spacing="sm">
                  <Text weight="medium" color="error">Failed Recipients:</Text>
                  {campaignResult.details
                    .filter(d => !d.success)
                    .map((d, i) => (
                      <Text key={i} variant="small">
                        • {d.name} ({d.phone}): {d.error}
                      </Text>
                    ))}
                </Stack>
              )}

              <Alert variant="success">
                <Text>Campaign completed! Messages are being delivered.</Text>
              </Alert>
            </Stack>
          )}
        </Modal>
      </Stack>
    </Container>
  );
}
