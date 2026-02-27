'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { Container, Stack, Text, Box, Button, Input, Label, LoadingSpinner, Alert, H1 } from '@/design/ui';
import { authFetch } from '@/lib/utils/auth-fetch';

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

const defaultProfile = { businessName: '', primaryPhone: '', primaryEmail: '', websiteUrl: '' };
const defaultNotifications = {
  adminPhones: [] as string[],
  adminEmails: [] as string[],
  channels: { sms: true, email: true, tracking: true, feedback: true },
};

export default function AdminSettingsPage() {
  const [form, setForm] = useState<BusinessRulesForm>(defaultForm);
  const [profile, setProfile] = useState(defaultProfile);
  const [notifications, setNotifications] = useState(defaultNotifications);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    Promise.all([
      authFetch('/api/admin/business-rules').then((res) => res.ok ? res.json() : Promise.reject(new Error('Failed to load rules'))),
      authFetch('/api/admin/settings/profile').then((res) => res.ok ? res.json() : Promise.resolve(null)),
      authFetch('/api/admin/settings/notifications').then((res) => res.ok ? res.json() : Promise.resolve(null)),
    ])
      .then(([data, profileData, notifData]: [Record<string, unknown>, Record<string, unknown> | null, Record<string, unknown> | null]) => {
        const d = data as Partial<BusinessRulesForm>;
        setForm({
          serviceArea: (d.serviceArea as BusinessRulesForm['serviceArea']) ?? defaultForm.serviceArea,
          bookingBufferMinutes: (d.bookingBufferMinutes as number) ?? defaultForm.bookingBufferMinutes,
          cancellationFeeTiers: (d.cancellationFeeTiers as BusinessRulesForm['cancellationFeeTiers']) ?? defaultForm.cancellationFeeTiers,
          deposit: (d.deposit as BusinessRulesForm['deposit']) ?? defaultForm.deposit,
          features: (d.features as BusinessRulesForm['features']) ?? defaultForm.features,
          updatedAt: d.updatedAt as string | undefined,
          version: d.version as number | undefined,
        });
        const p = profileData ?? {};
        setProfile({
          businessName: (p.businessName as string) ?? defaultProfile.businessName,
          primaryPhone: (p.primaryPhone as string) ?? defaultProfile.primaryPhone,
          primaryEmail: (p.primaryEmail as string) ?? defaultProfile.primaryEmail,
          websiteUrl: (p.websiteUrl as string) ?? defaultProfile.websiteUrl,
        });
        const n = notifData ?? {};
        setNotifications({
          adminPhones: Array.isArray(n.adminPhones) ? n.adminPhones : defaultNotifications.adminPhones,
          adminEmails: Array.isArray(n.adminEmails) ? n.adminEmails : defaultNotifications.adminEmails,
          channels: { ...defaultNotifications.channels, ...(n.channels as object) },
        });
      })
      .catch(() => setError('Failed to load settings'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = () => {
    setSaving(true);
    setError(null);
    setSuccess(false);
    authFetch('/api/admin/business-rules', {
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
    authFetch('/api/admin/business-rules/restore', { method: 'POST' })
      .then((res) => res.ok ? undefined : Promise.reject(new Error('Restore failed')))
      .then(() => {
        setForm(defaultForm);
        setSuccess(true);
      })
      .catch((e) => setError(e.message ?? 'Restore failed'))
      .finally(() => setSaving(false));
  };

  const handleSaveProfile = () => {
    setSaving(true);
    setError(null);
    setSuccess(false);
    authFetch('/api/admin/settings/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    })
      .then((res) => res.ok ? undefined : res.json().then((e) => Promise.reject(new Error(e.error || 'Save failed'))))
      .then(() => setSuccess(true))
      .catch((e) => setError(e.message ?? 'Failed to save profile'))
      .finally(() => setSaving(false));
  };

  const handleSaveNotifications = () => {
    setSaving(true);
    setError(null);
    setSuccess(false);
    authFetch('/api/admin/settings/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(notifications),
    })
      .then((res) => res.ok ? undefined : res.json().then((e) => Promise.reject(new Error(e.error || 'Save failed'))))
      .then(() => setSuccess(true))
      .catch((e) => setError(e.message ?? 'Failed to save notifications'))
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
        <H1>Settings</H1>
        {form.updatedAt && (
          <Text size="sm" color="secondary">Last updated: {new Date(form.updatedAt).toLocaleString()} {form.version != null && `(v${form.version})`}</Text>
        )}
        {error && <Alert variant="error">{error}</Alert>}
        {success && <Alert variant="success">Saved.</Alert>}

        <Box variant="outlined" padding="lg">
          <Text weight="bold" marginBottom="md">Business profile</Text>
          <Stack spacing="md">
            <Box>
              <Label>Business name</Label>
              <Input value={profile.businessName} onChange={(e) => setProfile((p) => ({ ...p, businessName: e.target.value }))} placeholder="Fairfield Airport Cars" />
            </Box>
            <Box>
              <Label>Primary phone</Label>
              <Input type="tel" value={profile.primaryPhone} onChange={(e) => setProfile((p) => ({ ...p, primaryPhone: e.target.value }))} placeholder="+1..." />
            </Box>
            <Box>
              <Label>Primary email</Label>
              <Input type="email" value={profile.primaryEmail} onChange={(e) => setProfile((p) => ({ ...p, primaryEmail: e.target.value }))} placeholder="gregg@..." />
            </Box>
            <Box>
              <Label>Website URL</Label>
              <Input type="url" value={profile.websiteUrl} onChange={(e) => setProfile((p) => ({ ...p, websiteUrl: e.target.value }))} placeholder="https://..." />
            </Box>
            <Button variant="primary" size="sm" onClick={handleSaveProfile} disabled={saving} text="Save profile" />
          </Stack>
        </Box>

        <Box variant="outlined" padding="lg">
          <Text weight="bold" marginBottom="md">Notification preferences</Text>
          <Text size="sm" color="secondary" style={{ marginBottom: 12 }}>Admin alert phones/emails (comma-separated). Channel toggles for customer-facing features.</Text>
          <Stack spacing="md">
            <Box>
              <Label>Admin phones (comma-separated)</Label>
              <Input value={(notifications.adminPhones ?? []).join(', ')} onChange={(e) => setNotifications((n) => ({ ...n, adminPhones: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) }))} placeholder="+1234567890" />
            </Box>
            <Box>
              <Label>Admin emails (comma-separated)</Label>
              <Input type="text" value={(notifications.adminEmails ?? []).join(', ')} onChange={(e) => setNotifications((n) => ({ ...n, adminEmails: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) }))} placeholder="you@example.com" />
            </Box>
            <Stack spacing="sm">
              <label><input type="checkbox" checked={notifications.channels?.sms ?? true} onChange={(e) => setNotifications((n) => ({ ...n, channels: { ...n.channels, sms: e.target.checked } }))} /> <Text as="span">SMS confirmations</Text></label>
              <label><input type="checkbox" checked={notifications.channels?.email ?? true} onChange={(e) => setNotifications((n) => ({ ...n, channels: { ...n.channels, email: e.target.checked } }))} /> <Text as="span">Email confirmations</Text></label>
              <label><input type="checkbox" checked={notifications.channels?.tracking ?? true} onChange={(e) => setNotifications((n) => ({ ...n, channels: { ...n.channels, tracking: e.target.checked } }))} /> <Text as="span">Tracking links</Text></label>
              <label><input type="checkbox" checked={notifications.channels?.feedback ?? true} onChange={(e) => setNotifications((n) => ({ ...n, channels: { ...n.channels, feedback: e.target.checked } }))} /> <Text as="span">Feedback requests</Text></label>
            </Stack>
            <Button variant="primary" size="sm" onClick={handleSaveNotifications} disabled={saving} text="Save notifications" />
          </Stack>
        </Box>

        <Box variant="outlined" padding="lg">
          <Text weight="bold" marginBottom="md">Business rules — Service area</Text>
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
          <Button variant="primary" onClick={handleSave} disabled={saving} text={saving ? 'Saving…' : 'Save business rules'} />
          <Button variant="outline" onClick={handleRestore} disabled={saving} text="Restore rules to defaults" />
        </Stack>
      </Stack>
    </Container>
  );
}
