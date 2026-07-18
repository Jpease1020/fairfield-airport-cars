'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Container, Stack, Text, Box, Button, Input, Label, LoadingSpinner, Alert, H1, H2 } from '@/design/ui';
import { LocationInput } from '@/design/components/base-components/forms/LocationInput';
import { authFetch } from '@/lib/utils/auth-fetch';
import { formatDateTimeNoSeconds } from '@/utils/formatting';
import { KNOWN_AIRPORTS } from '@/utils/constants';

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

interface CommonLocation {
  label: string;
  address: string;
  coords: { lat: number; lng: number };
}

// The pickup points Gregg's customers actually book most often. Label and address intentionally
// match (both plain town names) — Google resolves these to the town centroid, so a label implying
// a specific landmark (e.g. "train station") would overstate precision the query doesn't have.
const COMMON_PICKUPS: CommonLocation[] = [
  { label: 'Fairfield, CT', address: 'Fairfield, CT', coords: { lat: 41.1408, lng: -73.2633 } },
  { label: 'Westport, CT', address: 'Westport, CT', coords: { lat: 41.1415, lng: -73.3579 } },
  { label: 'Stamford, CT', address: 'Stamford, CT', coords: { lat: 41.0534, lng: -73.5387 } },
  { label: 'Trumbull, CT', address: 'Trumbull, CT', coords: { lat: 41.2429, lng: -73.2007 } },
];

// City/state suffix per airport for a reliably-geocodable full address — the airport NAME itself
// is derived from KNOWN_AIRPORTS.name (not re-typed) so it can't drift from the airport-detection
// logic's own reference data; only this small suffix map is curated locally.
const COMMON_AIRPORT_ADDRESS_SUFFIXES: Record<string, string> = {
  JFK: 'Queens, NY',
  LGA: 'Queens, NY 11371',
  EWR: 'Newark, NJ',
  BDL: 'Windsor Locks, CT',
  HVN: 'New Haven, CT',
  HPN: 'White Plains, NY',
};

const COMMON_AIRPORTS: CommonLocation[] = KNOWN_AIRPORTS.filter((a) => a.code in COMMON_AIRPORT_ADDRESS_SUFFIXES).map(
  (a) => ({ label: a.code, address: `${a.name}, ${COMMON_AIRPORT_ADDRESS_SUFFIXES[a.code]}`, coords: a.coordinates })
);

interface BatchRoutePlan {
  originLabel: string;
  originAddress: string;
  originCoords: { lat: number; lng: number };
  destinationLabel: string;
  destinationAddress: string;
  destinationCoords: { lat: number; lng: number };
}

// Every outbound (town -> airport) combination, plus one return (airport -> home) leg per airport.
// The return legs matter: the airport-return-multiplier only applies when the AIRPORT is the
// pickup (see test-quote/route.ts's isAirportPickup && !isAirportDropoff check) — without them,
// this tool could never actually show what changing that multiplier does to a real fare.
function buildBatchRoutePlans(): BatchRoutePlan[] {
  const plans: BatchRoutePlan[] = [];
  for (const pickup of COMMON_PICKUPS) {
    for (const airport of COMMON_AIRPORTS) {
      plans.push({
        originLabel: pickup.label,
        originAddress: pickup.address,
        originCoords: pickup.coords,
        destinationLabel: airport.label,
        destinationAddress: airport.address,
        destinationCoords: airport.coords,
      });
    }
  }
  const homeBase = COMMON_PICKUPS[0];
  for (const airport of COMMON_AIRPORTS) {
    plans.push({
      originLabel: airport.label,
      originAddress: airport.address,
      originCoords: airport.coords,
      destinationLabel: homeBase.label,
      destinationAddress: homeBase.address,
      destinationCoords: homeBase.coords,
    });
  }
  return plans;
}

const BATCH_ROUTE_PLANS: BatchRoutePlan[] = buildBatchRoutePlans();

interface BatchRouteResult extends BatchRoutePlan {
  fareType: 'personal' | 'business';
  status: 'pending' | 'done' | 'error';
  result?: TestQuoteResult;
  error?: string;
}

function patchBatchRow(rows: BatchRouteResult[], index: number, patch: Partial<BatchRouteResult>): BatchRouteResult[] {
  return rows.map((r, i) => (i === index ? { ...r, ...patch } : r));
}

// How many test-quote requests (each a real Google Distance Matrix call) run at once — a full
// batch is BATCH_ROUTE_PLANS.length routes; capping concurrency avoids bursting the Maps API all
// at once.
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
  const isMountedRef = useRef(true);
  useEffect(() => {
    // StrictMode (on by default in this app's dev builds) mounts every component twice: the
    // first mount's cleanup runs immediately, then the effect setup runs again for the "real"
    // mount. Without resetting the ref back to true here, that first cleanup would permanently
    // leave isMountedRef false — every applyPatch and the final setBatchRunning(false) would
    // silently no-op forever, well before the component actually unmounts.
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

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
    if (batchRunning) return; // guards against a double-click firing two overlapping runs
    setBatchRunning(true);

    const activeFareType = batchFareType;
    const rows: BatchRouteResult[] = BATCH_ROUTE_PLANS.map((plan) => ({ ...plan, fareType: activeFareType, status: 'pending' }));
    setBatchRows(rows);

    const pricingOverrides = {
      baseFare: form.baseFare,
      perMile: form.perMile,
      perMinute: form.perMinute,
      airportReturnMultiplier: form.airportReturnMultiplier,
      personalDiscountPercent: form.personalDiscountPercent,
      minimumFare: form.minimumFare,
    };

    const applyPatch = (index: number, patch: Partial<BatchRouteResult>) => {
      if (!isMountedRef.current) return;
      setBatchRows((prev) => (prev ? patchBatchRow(prev, index, patch) : prev));
    };

    let nextIndex = 0;
    const runNext = async (): Promise<void> => {
      const index = nextIndex++;
      if (index >= rows.length) return;
      const row = rows[index];

      try {
        const res = await authFetch('/api/admin/pricing/test-quote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            origin: row.originAddress,
            destination: row.destinationAddress,
            pickupCoords: row.originCoords,
            dropoffCoords: row.destinationCoords,
            fareType: activeFareType,
            pricingOverrides,
          }),
        });
        if (!res.ok) {
          const e = await res.json().catch(() => ({}));
          throw new Error(e.error || `Request failed (${res.status})`);
        }
        const data: TestQuoteResult = await res.json();
        applyPatch(index, { status: 'done', result: data });
      } catch (e: any) {
        applyPatch(index, { status: 'error', error: e.message ?? 'Failed' });
      }

      await runNext();
    };

    try {
      await Promise.all(Array.from({ length: Math.min(BATCH_CONCURRENCY, rows.length) }, () => runNext()));
    } finally {
      if (isMountedRef.current) setBatchRunning(false);
    }
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
                Runs {BATCH_ROUTE_PLANS.length} real routes — {COMMON_PICKUPS.map((p) => p.label).join(', ')} to each of {COMMON_AIRPORTS.map((a) => a.label).join(', ')}, plus a return leg from each airport back to {COMMON_PICKUPS[0].label} — against the rates above (even if unsaved). Change a rate, run it again, and see every route's fare shift before saving.
              </Text>
            </div>
            <Stack spacing="md" direction="horizontal" style={{ alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: batchRunning ? 'not-allowed' : 'pointer' }}>
                <input
                  type="radio"
                  name="batchFareType"
                  checked={batchFareType === 'personal'}
                  onChange={() => setBatchFareType('personal')}
                  disabled={batchRunning}
                />
                <Text as="span">Personal</Text>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: batchRunning ? 'not-allowed' : 'pointer' }}>
                <input
                  type="radio"
                  name="batchFareType"
                  checked={batchFareType === 'business'}
                  onChange={() => setBatchFareType('business')}
                  disabled={batchRunning}
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
                      <th style={{ padding: '6px 8px' }}>Origin</th>
                      <th style={{ padding: '6px 8px' }}>Destination</th>
                      <th style={{ padding: '6px 8px', textAlign: 'right' }}>Miles</th>
                      <th style={{ padding: '6px 8px', textAlign: 'right' }}>Min</th>
                      <th style={{ padding: '6px 8px', textAlign: 'right' }}>Fare</th>
                      <th style={{ padding: '6px 8px' }}>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {batchRows.map((row, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #f0f0f0' }}>
                        <td style={{ padding: '6px 8px' }}>{row.originLabel}</td>
                        <td style={{ padding: '6px 8px' }}>{row.destinationLabel}</td>
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
