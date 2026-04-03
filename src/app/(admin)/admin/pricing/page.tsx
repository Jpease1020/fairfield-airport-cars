'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { Container, Stack, Text, Box, Button, Input, Label, LoadingSpinner, Alert, H1, H2 } from '@/design/ui';
import { authFetch } from '@/lib/utils/auth-fetch';
import { formatDateTimeNoSeconds } from '@/utils/formatting';

interface PricingForm {
  baseFare: number;
  perMile: number;
  perMinute: number;
  airportReturnMultiplier: number;
  personalDiscountPercent: number;
  updatedAt?: string;
  version?: number;
}

interface TestQuoteResult {
  fare: number;
  distanceMiles: number;
  durationMinutes: number;
  durationTrafficMinutes: number;
  breakdown: {
    baseFare: number;
    mileageCharge: number;
    timeCharge: number;
    subtotalBeforeModifiers: number;
    personalDiscount: number | null;
    returnMultiplier: number | null;
    preMultiplierFare: number | null;
  };
  isAirportPickup: boolean;
  isAirportDropoff: boolean;
  fareType: string;
}

const DEFAULT_FORM: PricingForm = {
  baseFare: 15,
  perMile: 1.80,
  perMinute: 0.20,
  airportReturnMultiplier: 1.15,
  personalDiscountPercent: 10,
};

export default function AdminPricingPage() {
  const [form, setForm] = useState<PricingForm>(DEFAULT_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Quote tester state
  const [testOrigin, setTestOrigin] = useState('');
  const [testDestination, setTestDestination] = useState('');
  const [testFareType, setTestFareType] = useState<'personal' | 'business'>('personal');
  const [testLoading, setTestLoading] = useState(false);
  const [testError, setTestError] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<TestQuoteResult | null>(null);

  useEffect(() => {
    authFetch('/api/admin/pricing')
      .then((res) => res.ok ? res.json() : Promise.reject(new Error('Failed to load pricing')))
      .then((data: Partial<PricingForm>) => {
        setForm({
          baseFare: data.baseFare ?? DEFAULT_FORM.baseFare,
          perMile: data.perMile ?? DEFAULT_FORM.perMile,
          perMinute: data.perMinute ?? DEFAULT_FORM.perMinute,
          airportReturnMultiplier: data.airportReturnMultiplier ?? DEFAULT_FORM.airportReturnMultiplier,
          personalDiscountPercent: data.personalDiscountPercent ?? DEFAULT_FORM.personalDiscountPercent,
          updatedAt: data.updatedAt as string | undefined,
          version: data.version as number | undefined,
        });
      })
      .catch(() => setError('Failed to load pricing config'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = () => {
    setSaving(true);
    setError(null);
    setSuccess(false);
    authFetch('/api/admin/pricing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        baseFare: form.baseFare,
        perMile: form.perMile,
        perMinute: form.perMinute,
        airportReturnMultiplier: form.airportReturnMultiplier,
        personalDiscountPercent: form.personalDiscountPercent,
      }),
    })
      .then((res) => res.ok ? undefined : res.json().then((e) => Promise.reject(new Error(e.error || 'Save failed'))))
      .then(() => setSuccess(true))
      .catch((e) => setError(e.message ?? 'Failed to save'))
      .finally(() => setSaving(false));
  };

  const handleRestore = () => {
    if (!confirm('Restore pricing to defaults?')) return;
    setForm(DEFAULT_FORM);
    setSuccess(false);
  };

  const handleTestQuote = () => {
    if (!testOrigin || !testDestination) {
      setTestError('Enter both origin and destination');
      return;
    }
    setTestLoading(true);
    setTestError(null);
    setTestResult(null);
    authFetch('/api/admin/pricing/test-quote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        origin: testOrigin,
        destination: testDestination,
        fareType: testFareType,
        pricingOverrides: {
          baseFare: form.baseFare,
          perMile: form.perMile,
          perMinute: form.perMinute,
          airportReturnMultiplier: form.airportReturnMultiplier,
          personalDiscountPercent: form.personalDiscountPercent,
        },
      }),
    })
      .then((res) => res.ok ? res.json() : res.json().then((e) => Promise.reject(new Error(e.error || 'Quote failed'))))
      .then((data: TestQuoteResult) => setTestResult(data))
      .catch((e) => setTestError(e.message ?? 'Failed to get test quote'))
      .finally(() => setTestLoading(false));
  };

  const updateField = (field: keyof PricingForm, value: number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSuccess(false);
  };

  if (loading) return <Container><LoadingSpinner /></Container>;

  return (
    <Container>
      <Stack spacing="lg">
        <H1>Pricing</H1>
        {form.updatedAt && (
          <Text size="sm" color="secondary">
            Last updated: {formatDateTimeNoSeconds(form.updatedAt)} {form.version != null && `(v${form.version})`}
          </Text>
        )}
        {error && <Alert variant="error">{error}</Alert>}
        {success && <Alert variant="success">Pricing saved.</Alert>}

        {/* Formula Display */}
        <Box variant="outlined" padding="lg">
          <Stack spacing="md">
            <H2>How pricing works</H2>
            <Box variant="filled" padding="md">
              <Text weight="bold" style={{ fontFamily: 'monospace', marginBottom: 8, fontSize: 15 }}>
                fare = baseFare + (miles x perMile) + (trafficMinutes x perMinute)
              </Text>
              <Text color="secondary" style={{ fontFamily: 'monospace', fontSize: 15 }}>
                fare = ${form.baseFare.toFixed(2)} + (miles x ${form.perMile.toFixed(2)}) + (min x ${form.perMinute.toFixed(2)})
              </Text>
            </Box>
            <Stack spacing="sm">
              <Text size="sm">
                <Text as="span" weight="bold">Personal rides:</Text> {form.personalDiscountPercent}% discount applied after base calculation
              </Text>
              <Text size="sm">
                <Text as="span" weight="bold">Return trips</Text> (airport pickup to home): fare multiplied by x{form.airportReturnMultiplier.toFixed(2)}
              </Text>
            </Stack>
          </Stack>
        </Box>

        {/* Rate Editor */}
        <Box variant="outlined" padding="lg">
          <Stack spacing="md">
            <H2>Rate settings</H2>
            <Stack spacing="md" direction="horizontal">
              <div style={{ flex: 1 }}>
                <Label>Base fare ($)</Label>
                <Input
                  type="number"
                  min={0}
                  max={200}
                  step={1}
                  value={String(form.baseFare)}
                  onChange={(e) => updateField('baseFare', Number(e.target.value) || 0)}
                />
              </div>
              <div style={{ flex: 1 }}>
                <Label>Per mile ($)</Label>
                <Input
                  type="number"
                  min={0}
                  max={50}
                  step={0.05}
                  value={String(form.perMile)}
                  onChange={(e) => updateField('perMile', Number(e.target.value) || 0)}
                />
              </div>
              <div style={{ flex: 1 }}>
                <Label>Per minute ($)</Label>
                <Input
                  type="number"
                  min={0}
                  max={10}
                  step={0.05}
                  value={String(form.perMinute)}
                  onChange={(e) => updateField('perMinute', Number(e.target.value) || 0)}
                />
              </div>
            </Stack>
            <Stack spacing="md" direction="horizontal">
              <div style={{ flex: 1 }}>
                <Label>Airport return multiplier (x)</Label>
                <Input
                  type="number"
                  min={1}
                  max={5}
                  step={0.05}
                  value={String(form.airportReturnMultiplier)}
                  onChange={(e) => updateField('airportReturnMultiplier', Number(e.target.value) || 1)}
                />
              </div>
              <div style={{ flex: 1 }}>
                <Label>Personal discount (%)</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  step={1}
                  value={String(form.personalDiscountPercent)}
                  onChange={(e) => updateField('personalDiscountPercent', Number(e.target.value) || 0)}
                />
              </div>
              <div style={{ flex: 1 }} />
            </Stack>
            <Stack spacing="md" direction="horizontal">
              <Button variant="primary" onClick={handleSave} disabled={saving} text={saving ? 'Saving...' : 'Save pricing'} />
              <Button variant="outline" onClick={handleRestore} disabled={saving} text="Restore defaults" />
            </Stack>
          </Stack>
        </Box>

        {/* Quote Tester */}
        <Box variant="outlined" padding="lg">
          <Stack spacing="md">
            <div>
              <H2>Test a quote</H2>
              <Text size="sm" color="secondary">
                Uses the rates above (even if unsaved) to calculate what a trip would cost.
              </Text>
            </div>
            <Stack spacing="md" direction="horizontal">
              <div style={{ flex: 1 }}>
                <Label>From</Label>
                <Input
                  value={testOrigin}
                  onChange={(e) => setTestOrigin(e.target.value)}
                  placeholder="e.g. 123 Main St, Fairfield, CT"
                />
              </div>
              <div style={{ flex: 1 }}>
                <Label>To</Label>
                <Input
                  value={testDestination}
                  onChange={(e) => setTestDestination(e.target.value)}
                  placeholder="e.g. LaGuardia Airport"
                />
              </div>
            </Stack>
            <Stack spacing="md" direction="horizontal" style={{ alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="fareType"
                  checked={testFareType === 'personal'}
                  onChange={() => setTestFareType('personal')}
                />
                <Text as="span">Personal</Text>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="fareType"
                  checked={testFareType === 'business'}
                  onChange={() => setTestFareType('business')}
                />
                <Text as="span">Business</Text>
              </label>
              <Button
                variant="primary"
                size="sm"
                onClick={handleTestQuote}
                disabled={testLoading}
                text={testLoading ? 'Calculating...' : 'Calculate'}
              />
            </Stack>

            {testError && <Alert variant="error">{testError}</Alert>}

            {testResult && (
              <Box variant="filled" padding="md">
                <Stack spacing="sm">
                  <Text size="sm" color="secondary">
                    {testResult.distanceMiles} miles | {testResult.durationMinutes} min (est. {testResult.durationTrafficMinutes} min in traffic)
                    {testResult.isAirportPickup && ' | Airport pickup detected'}
                    {testResult.isAirportDropoff && ' | Airport dropoff detected'}
                  </Text>
                  <div style={{ borderTop: '1px solid #e5e5e5', paddingTop: 8, marginTop: 4 }}>
                    <Stack spacing="xs">
                      <Text size="sm" style={{ fontFamily: 'monospace' }}>
                        Base fare: ${testResult.breakdown.baseFare.toFixed(2)}
                      </Text>
                      <Text size="sm" style={{ fontFamily: 'monospace' }}>
                        Mileage ({testResult.distanceMiles} mi x ${form.perMile.toFixed(2)}): ${testResult.breakdown.mileageCharge.toFixed(2)}
                      </Text>
                      <Text size="sm" style={{ fontFamily: 'monospace' }}>
                        Time ({testResult.durationTrafficMinutes} min x ${form.perMinute.toFixed(2)}): ${testResult.breakdown.timeCharge.toFixed(2)}
                      </Text>
                      <Text size="sm" weight="bold" style={{ fontFamily: 'monospace', borderTop: '1px solid #ccc', paddingTop: 4 }}>
                        Subtotal: ${testResult.breakdown.subtotalBeforeModifiers.toFixed(2)}
                      </Text>
                      {testResult.breakdown.personalDiscount != null && (
                        <Text size="sm" style={{ fontFamily: 'monospace', color: '#16a34a' }}>
                          Personal discount (-{form.personalDiscountPercent}%): -${testResult.breakdown.personalDiscount.toFixed(2)}
                        </Text>
                      )}
                      {testResult.breakdown.returnMultiplier != null && (
                        <Text size="sm" style={{ fontFamily: 'monospace', color: '#d97706' }}>
                          Return trip (x{testResult.breakdown.returnMultiplier}): ${testResult.breakdown.preMultiplierFare?.toFixed(2)} → ${testResult.fare.toFixed(2)}
                        </Text>
                      )}
                    </Stack>
                  </div>
                  <Text size="lg" weight="bold" style={{ marginTop: 4 }}>
                    Total: ${testResult.fare}
                  </Text>
                </Stack>
              </Box>
            )}
          </Stack>
        </Box>
      </Stack>
    </Container>
  );
}
