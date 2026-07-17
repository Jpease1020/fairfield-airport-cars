'use client';

import React, { useState, useEffect } from 'react';
import { Container, Stack, Text, Box, Button, Input, Label, LoadingSpinner, Alert, H1, H2 } from '@/design/ui';
import { LocationInput } from '@/design/components/base-components/forms/LocationInput';
import { authFetch } from '@/lib/utils/auth-fetch';
import { formatDateTimeNoSeconds } from '@/utils/formatting';

interface PricingForm {
  baseFare: number;
  perMile: number;
  perMinute: number;
  airportReturnMultiplier: number;
  personalDiscountPercent: number;
  minimumFare: number;
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
    minimumFare: number;
    minimumFareApplied: boolean;
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
  minimumFare: 100,
};

interface CommonPickup {
  label: string;
  address: string;
  coords: { lat: number; lng: number };
}

interface CommonAirport {
  label: string;
  address: string;
  coords: { lat: number; lng: number };
}

// The pickup points and airports Gregg's customers actually book most often — real addresses so
// each one resolves cleanly through Google's Distance Matrix, and real coordinates (matching the
// service-area/airport-detection logic's own reference points where they overlap) so every route
// classifies as a normal in-service-area trip rather than tripping the soft/hard-block checks.
const COMMON_PICKUPS: CommonPickup[] = [
  { label: 'Fairfield (train station)', address: 'Fairfield, CT', coords: { lat: 41.1408, lng: -73.2633 } },
  { label: 'Westport (downtown)', address: 'Westport, CT', coords: { lat: 41.1415, lng: -73.3579 } },
  { label: 'Stamford (train station)', address: 'Stamford, CT', coords: { lat: 41.0534, lng: -73.5387 } },
  { label: 'Trumbull (town center)', address: 'Trumbull, CT', coords: { lat: 41.2429, lng: -73.2007 } },
];

const COMMON_AIRPORTS: CommonAirport[] = [
  { label: 'JFK', address: 'John F. Kennedy International Airport, Queens, NY', coords: { lat: 40.6413111, lng: -73.7781391 } },
  { label: 'LGA', address: 'LaGuardia Airport, Queens, NY 11371', coords: { lat: 40.7769271, lng: -73.8739659 } },
  { label: 'EWR', address: 'Newark Liberty International Airport, Newark, NJ', coords: { lat: 40.6895314, lng: -74.1744624 } },
  { label: 'BDL', address: 'Bradley International Airport, Windsor Locks, CT', coords: { lat: 41.938889, lng: -72.683056 } },
  { label: 'HVN', address: 'Tweed New Haven Airport, New Haven, CT', coords: { lat: 41.263889, lng: -72.886667 } },
  { label: 'HPN', address: 'Westchester County Airport, White Plains, NY', coords: { lat: 41.067005, lng: -73.707574 } },
];

interface BatchRouteResult {
  pickupLabel: string;
  airportLabel: string;
  fareType: 'personal' | 'business';
  status: 'pending' | 'done' | 'error';
  result?: TestQuoteResult;
  error?: string;
}

// How many test-quote requests (each a real Google Distance Matrix call) run at once — a full
// batch is 24 routes; capping concurrency avoids bursting the Maps API all at once.
const BATCH_CONCURRENCY = 6;

export default function AdminPricingPageClient() {
  const [form, setForm] = useState<PricingForm>(DEFAULT_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Quote tester state
  const [testOrigin, setTestOrigin] = useState('');
  const [testDestination, setTestDestination] = useState('');
  const [testOriginCoords, setTestOriginCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [testDestinationCoords, setTestDestinationCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [testFareType, setTestFareType] = useState<'personal' | 'business'>('personal');
  const [testLoading, setTestLoading] = useState(false);
  const [testError, setTestError] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<TestQuoteResult | null>(null);

  // Batch route tester state
  const [batchFareType, setBatchFareType] = useState<'personal' | 'business'>('personal');
  const [batchRows, setBatchRows] = useState<BatchRouteResult[] | null>(null);
  const [batchRunning, setBatchRunning] = useState(false);

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
          minimumFare: data.minimumFare ?? DEFAULT_FORM.minimumFare,
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
        minimumFare: form.minimumFare,
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
        pickupCoords: testOriginCoords,
        dropoffCoords: testDestinationCoords,
        fareType: testFareType,
        pricingOverrides: {
          baseFare: form.baseFare,
          perMile: form.perMile,
          perMinute: form.perMinute,
          airportReturnMultiplier: form.airportReturnMultiplier,
          personalDiscountPercent: form.personalDiscountPercent,
          minimumFare: form.minimumFare,
        },
      }),
    })
      .then((res) => res.ok ? res.json() : res.json().then((e) => Promise.reject(new Error(e.error || 'Quote failed'))))
      .then((data: TestQuoteResult) => setTestResult(data))
      .catch((e) => setTestError(e.message ?? 'Failed to get test quote'))
      .finally(() => setTestLoading(false));
  };

  const runBatchTest = async () => {
    setBatchRunning(true);
    const rows: BatchRouteResult[] = [];
    for (const pickup of COMMON_PICKUPS) {
      for (const airport of COMMON_AIRPORTS) {
        rows.push({ pickupLabel: pickup.label, airportLabel: airport.label, fareType: batchFareType, status: 'pending' });
      }
    }
    setBatchRows(rows);

    const pricingOverrides = {
      baseFare: form.baseFare,
      perMile: form.perMile,
      perMinute: form.perMinute,
      airportReturnMultiplier: form.airportReturnMultiplier,
      personalDiscountPercent: form.personalDiscountPercent,
      minimumFare: form.minimumFare,
    };

    let nextIndex = 0;
    const runNext = async (): Promise<void> => {
      const index = nextIndex++;
      if (index >= rows.length) return;
      const pickup = COMMON_PICKUPS[Math.floor(index / COMMON_AIRPORTS.length)];
      const airport = COMMON_AIRPORTS[index % COMMON_AIRPORTS.length];

      try {
        const res = await authFetch('/api/admin/pricing/test-quote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            origin: pickup.address,
            destination: airport.address,
            pickupCoords: pickup.coords,
            dropoffCoords: airport.coords,
            fareType: batchFareType,
            pricingOverrides,
          }),
        });
        if (!res.ok) {
          const e = await res.json().catch(() => ({}));
          throw new Error(e.error || `Request failed (${res.status})`);
        }
        const data: TestQuoteResult = await res.json();
        setBatchRows((prev) =>
          prev ? prev.map((r, i) => (i === index ? { ...r, status: 'done', result: data } : r)) : prev
        );
      } catch (e: any) {
        setBatchRows((prev) =>
          prev ? prev.map((r, i) => (i === index ? { ...r, status: 'error', error: e.message ?? 'Failed' } : r)) : prev
        );
      }

      await runNext();
    };

    await Promise.all(Array.from({ length: Math.min(BATCH_CONCURRENCY, rows.length) }, () => runNext()));
    setBatchRunning(false);
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
              <Text size="sm">
                <Text as="span" weight="bold">Minimum fare:</Text> ${form.minimumFare.toFixed(2)} — applied last, after any discount or multiplier above. No ride is ever charged less than this.
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
              <div style={{ flex: 1 }}>
                <Label>Minimum fare ($)</Label>
                <Input
                  type="number"
                  min={0}
                  max={500}
                  step={5}
                  value={String(form.minimumFare)}
                  onChange={(e) => updateField('minimumFare', Number(e.target.value) || 0)}
                />
              </div>
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
                <LocationInput
                  value={testOrigin}
                  onChange={(value) => { setTestOrigin(value); setTestOriginCoords(null); }}
                  onLocationSelect={(address, coordinates) => { setTestOrigin(address); setTestOriginCoords(coordinates); }}
                  placeholder="e.g. 123 Main St, Fairfield, CT"
                  fullWidth
                />
              </div>
              <div style={{ flex: 1 }}>
                <Label>To</Label>
                <LocationInput
                  value={testDestination}
                  onChange={(value) => { setTestDestination(value); setTestDestinationCoords(null); }}
                  onLocationSelect={(address, coordinates) => { setTestDestination(address); setTestDestinationCoords(coordinates); }}
                  placeholder="e.g. LaGuardia Airport"
                  fullWidth
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
                      {testResult.breakdown.minimumFareApplied && (
                        <Text size="sm" style={{ fontFamily: 'monospace', color: '#d97706' }}>
                          Minimum fare (${testResult.breakdown.minimumFare.toFixed(2)}) applied — calculated fare was below the floor
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

        {/* Batch Route Tester */}
        <Box variant="outlined" padding="lg">
          <Stack spacing="md">
            <div>
              <H2>Test common routes</H2>
              <Text size="sm" color="secondary">
                Runs {COMMON_PICKUPS.length * COMMON_AIRPORTS.length} real routes ({COMMON_PICKUPS.map((p) => p.label).join(', ')} × {COMMON_AIRPORTS.map((a) => a.label).join(', ')}) against the rates above (even if unsaved) — change a rate, run it again, and see every route's fare shift before saving.
              </Text>
            </div>
            <Stack spacing="md" direction="horizontal" style={{ alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="batchFareType"
                  checked={batchFareType === 'personal'}
                  onChange={() => setBatchFareType('personal')}
                />
                <Text as="span">Personal</Text>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="batchFareType"
                  checked={batchFareType === 'business'}
                  onChange={() => setBatchFareType('business')}
                />
                <Text as="span">Business</Text>
              </label>
              <Button
                variant="primary"
                size="sm"
                onClick={runBatchTest}
                disabled={batchRunning}
                text={batchRunning ? 'Running…' : 'Run all routes'}
              />
              {batchRunning && batchRows && (
                <Text size="sm" color="secondary">
                  {batchRows.filter((r) => r.status !== 'pending').length} / {batchRows.length}
                </Text>
              )}
            </Stack>

            {batchRows && (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                  <thead>
                    <tr style={{ textAlign: 'left', borderBottom: '2px solid #e5e5e5' }}>
                      <th style={{ padding: '6px 8px' }}>Pickup</th>
                      <th style={{ padding: '6px 8px' }}>Airport</th>
                      <th style={{ padding: '6px 8px', textAlign: 'right' }}>Miles</th>
                      <th style={{ padding: '6px 8px', textAlign: 'right' }}>Min</th>
                      <th style={{ padding: '6px 8px', textAlign: 'right' }}>Fare</th>
                      <th style={{ padding: '6px 8px' }}>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {batchRows.map((row, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #f0f0f0' }}>
                        <td style={{ padding: '6px 8px' }}>{row.pickupLabel}</td>
                        <td style={{ padding: '6px 8px' }}>{row.airportLabel}</td>
                        {row.status === 'pending' && (
                          <td colSpan={4} style={{ padding: '6px 8px', color: '#999' }}>Calculating…</td>
                        )}
                        {row.status === 'error' && (
                          <td colSpan={4} style={{ padding: '6px 8px', color: '#dc2626' }}>{row.error}</td>
                        )}
                        {row.status === 'done' && row.result && (
                          <>
                            <td style={{ padding: '6px 8px', textAlign: 'right', fontFamily: 'monospace' }}>{row.result.distanceMiles}</td>
                            <td style={{ padding: '6px 8px', textAlign: 'right', fontFamily: 'monospace' }}>{row.result.durationTrafficMinutes}</td>
                            <td style={{ padding: '6px 8px', textAlign: 'right', fontFamily: 'monospace', fontWeight: 600 }}>${row.result.fare}</td>
                            <td style={{ padding: '6px 8px', color: '#d97706' }}>
                              {row.result.breakdown.minimumFareApplied && 'floor applied'}
                              {row.result.breakdown.returnMultiplier != null && ' return multiplier'}
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Stack>
        </Box>
      </Stack>
    </Container>
  );
}
