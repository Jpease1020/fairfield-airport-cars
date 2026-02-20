'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { Container, Stack, Text, Box, Button, Input, Label, LoadingSpinner, Alert, H1 } from '@/design/ui';

interface BusinessRulesForm {
  serviceArea: { normalRadiusMiles: number; extendedRadiusMiles: number };
  bookingBufferMinutes: number;
  cancellationFeeTiers: {
    over24hFeePercent: number;
    under24hFeePercent: number;
    under12hFeePercent: number;
    under6hFeePercent: number;
  };
  deposit: { required: boolean; mode: 'percent' | 'fixed'; value: number };
  features: { trackingEnabled: boolean; reviewsEnabled: boolean };
  updatedAt?: string;
  version?: number;
}

const defaultForm: BusinessRulesForm = {
  serviceArea: { normalRadiusMiles: 25, extendedRadiusMiles: 40 },
  bookingBufferMinutes: 60,
  cancellationFeeTiers: {
    over24hFeePercent: 0,
    under24hFeePercent: 25,
    under12hFeePercent: 50,
    under6hFeePercent: 75,
  },
  deposit: { required: false, mode: 'percent', value: 0 },
  features: { trackingEnabled: true, reviewsEnabled: true },
};

export default function AdminSettingsPage() {
  const [form, setForm] = useState<BusinessRulesForm>(defaultForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch('/api/admin/business-rules')
      .then((res) => res.ok ? res.json() : Promise.reject(new Error('Failed to load')))
      .then((data) => {
        setForm({
          serviceArea: data.serviceArea ?? defaultForm.serviceArea,
          bookingBufferMinutes: data.bookingBufferMinutes ?? defaultForm.bookingBufferMinutes,
          cancellationFeeTiers: data.cancellationFeeTiers ?? defaultForm.cancellationFeeTiers,
          deposit: data.deposit ?? defaultForm.deposit,
          features: data.features ?? defaultForm.features,
          updatedAt: data.updatedAt,
          version: data.version,
        });
      })
      .catch(() => setError('Failed to load business rules'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = () => {
    setSaving(true);
    setError(null);
    setSuccess(false);
    fetch('/api/admin/business-rules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
      .then((res) => res.ok ? undefined : res.json().then((e) => Promise.reject(new Error(e.error || 'Save failed'))))
      .then(() => setSuccess(true))
      .catch((e) => setError(e.message ?? 'Failed to save'))
      .finally(() => setSaving(false));
  };

  const handleRestore = () => {
    if (!confirm('Restore all business rules to defaults?')) return;
    setSaving(true);
    setError(null);
    fetch('/api/admin/business-rules/restore', { method: 'POST' })
      .then((res) => res.ok ? undefined : Promise.reject(new Error('Restore failed')))
      .then(() => {
        setForm(defaultForm);
        setSuccess(true);
      })
      .catch((e) => setError(e.message ?? 'Restore failed'))
      .finally(() => setSaving(false));
  };

  const update = (path: string, value: unknown) => {
    setForm((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      const parts = path.split('.');
      let cur: any = next;
      for (let i = 0; i < parts.length - 1; i++) {
        cur = cur[parts[i]];
      }
      cur[parts[parts.length - 1]] = value;
      return next;
    });
  };

  if (loading) return <Container><LoadingSpinner /></Container>;
  return (
    <Container>
      <Stack spacing="lg">
        <H1>Business Rules</H1>
        {form.updatedAt && (
          <Text size="sm" color="secondary">Last updated: {new Date(form.updatedAt).toLocaleString()} {form.version != null && `(v${form.version})`}</Text>
        )}
        {error && <Alert variant="error">{error}</Alert>}
        {success && <Alert variant="success">Saved.</Alert>}

        <Box variant="outlined" padding="lg">
          <Text weight="bold" marginBottom="md">Service area</Text>
          <Stack spacing="md" direction="horizontal">
            <Box>
              <Label>Normal radius (miles)</Label>
              <Input
                type="number"
                min={1}
                max={100}
                value={String(form.serviceArea.normalRadiusMiles)}
                onChange={(e) => update('serviceArea.normalRadiusMiles', Number(e.target.value) || 0)}
              />
            </Box>
            <Box>
              <Label>Extended radius (miles)</Label>
              <Input
                type="number"
                min={1}
                max={150}
                value={String(form.serviceArea.extendedRadiusMiles)}
                onChange={(e) => update('serviceArea.extendedRadiusMiles', Number(e.target.value) || 0)}
              />
            </Box>
          </Stack>
        </Box>

        <Box variant="outlined" padding="lg">
          <Text weight="bold" marginBottom="md">Scheduling</Text>
          <Box>
            <Label>Booking buffer (minutes)</Label>
            <Input
              type="number"
              min={0}
              max={240}
              value={String(form.bookingBufferMinutes)}
              onChange={(e) => update('bookingBufferMinutes', Number(e.target.value) || 0)}
            />
          </Box>
        </Box>

        <Box variant="outlined" padding="lg">
          <Text weight="bold" marginBottom="md">Cancellation fee (%)</Text>
          <Stack spacing="md" direction="horizontal">
            {(['over24hFeePercent', 'under24hFeePercent', 'under12hFeePercent', 'under6hFeePercent'] as const).map((key) => (
              <Box key={key}>
                <Label>{key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={String(form.cancellationFeeTiers[key])}
                  onChange={(e) => update(`cancellationFeeTiers.${key}`, Number(e.target.value) || 0)}
                />
              </Box>
            ))}
          </Stack>
        </Box>

        <Box variant="outlined" padding="lg">
          <Text weight="bold" marginBottom="md">Deposit</Text>
          <Stack spacing="md">
            <label>
              <input
                type="checkbox"
                checked={form.deposit.required}
                onChange={(e) => update('deposit.required', e.target.checked)}
              />
              <Text as="span" marginLeft="sm">Required</Text>
            </label>
            <Box>
              <Label>Value ({form.deposit.mode})</Label>
              <Input
                type="number"
                min={0}
                value={String(form.deposit.value)}
                onChange={(e) => update('deposit.value', Number(e.target.value) || 0)}
              />
            </Box>
          </Stack>
        </Box>

        <Box variant="outlined" padding="lg">
          <Text weight="bold" marginBottom="md">Features</Text>
          <Stack spacing="sm">
            <label>
              <input
                type="checkbox"
                checked={form.features.trackingEnabled}
                onChange={(e) => update('features.trackingEnabled', e.target.checked)}
              />
              <Text as="span" marginLeft="sm">Tracking enabled</Text>
            </label>
            <label>
              <input
                type="checkbox"
                checked={form.features.reviewsEnabled}
                onChange={(e) => update('features.reviewsEnabled', e.target.checked)}
              />
              <Text as="span" marginLeft="sm">Reviews enabled</Text>
            </label>
          </Stack>
        </Box>

        <Stack spacing="md" direction="horizontal">
          <Button variant="primary" onClick={handleSave} disabled={saving} text={saving ? 'Saving…' : 'Save'} />
          <Button variant="outline" onClick={handleRestore} disabled={saving} text="Restore defaults" />
        </Stack>
      </Stack>
    </Container>
  );
}
