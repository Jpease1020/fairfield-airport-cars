'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Stack,
  Text,
  Box,
  Button,
  Input,
  Alert,
  LoadingSpinner,
  H1,
} from '@/design/ui';
import { authFetch } from '@/lib/utils/auth-fetch';
import {
  COST_PROVIDERS,
  COST_CATEGORIES,
  type CostEntry,
} from '@/lib/business/cost-entries-schema';

const MONTHS: string[] = (() => {
  const out: string[] = [];
  const now = new Date();
  for (let i = 0; i < 24; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }
  return out;
})();

export default function AdminCostsPage() {
  const [entries, setEntries] = useState<CostEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [month, setMonth] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const [form, setForm] = useState(() => {
    const d = new Date();
    const m = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    return {
      month: m,
      provider: 'other' as CostEntry['provider'],
      category: 'other' as CostEntry['category'],
      amount: '',
      notes: '',
      invoiceUrl: '',
    };
  });
  const [saving, setSaving] = useState(false);

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await authFetch(`/api/admin/costs?month=${encodeURIComponent(month)}`);
      if (!res.ok) throw new Error('Failed to load');
      const data = await res.json();
      setEntries(data.entries ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load cost entries');
    } finally {
      setLoading(false);
    }
  }, [month]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(form.amount);
    if (!form.month || !Number.isFinite(amount) || amount <= 0) {
      setError('Month and a positive amount are required.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await authFetch('/api/admin/costs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          month: form.month,
          provider: form.provider,
          category: form.category,
          amount,
          notes: form.notes || undefined,
          invoiceUrl: form.invoiceUrl || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error ?? 'Save failed');
      }
      setForm({ ...form, amount: '', notes: '', invoiceUrl: '' });
      fetchEntries();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to add entry');
    } finally {
      setSaving(false);
    }
  };

  const total = entries.reduce((sum, e) => sum + e.amount, 0);
  const byProvider: Record<string, number> = {};
  entries.forEach((e) => {
    byProvider[e.provider] = (byProvider[e.provider] ?? 0) + e.amount;
  });

  return (
    <Container>
      <Stack spacing="lg">
        <H1>Costs</H1>
        <Text size="sm" color="secondary">
          Manual cost tracking by month. Add entries from invoices (Twilio, Square, Firebase, etc.).
        </Text>

        <Stack direction="horizontal" spacing="md" align="center">
          <Text as="span" weight="medium">Month</Text>
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e5e7eb' }}
          >
            {MONTHS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </Stack>

        {error && <Alert variant="error">{error}</Alert>}
        {loading && <LoadingSpinner />}

        {!loading && (
          <>
            <Box variant="outlined" padding="md">
              <Stack spacing="sm">
                <Text weight="bold">Summary for {month}</Text>
                <Text size="lg">Total: ${total.toFixed(2)}</Text>
                {Object.keys(byProvider).length > 0 && (
                  <Stack spacing="xs">
                    {Object.entries(byProvider).map(([p, amt]) => (
                      <Text key={p} size="sm">{p}: ${amt.toFixed(2)}</Text>
                    ))}
                  </Stack>
                )}
              </Stack>
            </Box>

            <Box variant="outlined" padding="lg">
              <Text weight="bold" marginBottom="md">Add entry</Text>
              <form onSubmit={handleAdd}>
                <Stack spacing="md">
                  <Stack direction="horizontal" spacing="md" wrap="wrap">
                  <Box>
                    <span style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Month (YYYY-MM)</span>
                      <Input
                        type="text"
                        placeholder="2025-02"
                        value={form.month}
                        onChange={(e) => setForm((f) => ({ ...f, month: e.target.value }))}
                        style={{ width: 120 }}
                      />
                    </Box>
                    <Box>
                      <span style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Provider</span>
                      <select
                        value={form.provider}
                        onChange={(e) => setForm((f) => ({ ...f, provider: e.target.value as CostEntry['provider'] }))}
                        style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e5e7eb', minWidth: 140 }}
                      >
                        {COST_PROVIDERS.map((p) => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </Box>
                    <Box>
                      <span style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Category</span>
                      <select
                        value={form.category}
                        onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as CostEntry['category'] }))}
                        style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e5e7eb', minWidth: 140 }}
                      >
                        {COST_CATEGORIES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </Box>
                    <Box>
                      <span style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Amount ($)</span>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={form.amount}
                        onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                        style={{ width: 100 }}
                      />
                    </Box>
                  </Stack>
                  <Box>
                    <span style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Notes</span>
                    <Input
                      type="text"
                      placeholder="Optional"
                      value={form.notes}
                      onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                      style={{ maxWidth: 320 }}
                    />
                  </Box>
                  <Box>
                    <span style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Invoice URL</span>
                    <Input
                      type="url"
                      placeholder="Optional"
                      value={form.invoiceUrl}
                      onChange={(e) => setForm((f) => ({ ...f, invoiceUrl: e.target.value }))}
                      style={{ maxWidth: 320 }}
                    />
                  </Box>
                  <Button type="submit" variant="primary" disabled={saving} text={saving ? 'Adding…' : 'Add entry'} />
                </Stack>
              </form>
            </Box>

            <Box variant="outlined" padding="md">
              <Text weight="bold" marginBottom="md">Entries</Text>
              {entries.length === 0 ? (
                <Text color="secondary">No entries for this month.</Text>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e5e7eb', textAlign: 'left' }}>
                      <th style={{ padding: '8px 12px' }}>Provider</th>
                      <th style={{ padding: '8px 12px' }}>Category</th>
                      <th style={{ padding: '8px 12px' }}>Amount</th>
                      <th style={{ padding: '8px 12px' }}>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map((e) => (
                      <tr key={e.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <td style={{ padding: '8px 12px' }}>{e.provider}</td>
                        <td style={{ padding: '8px 12px' }}>{e.category}</td>
                        <td style={{ padding: '8px 12px' }}>${Number(e.amount).toFixed(2)}</td>
                        <td style={{ padding: '8px 12px' }}>{e.notes ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Box>
          </>
        )}
      </Stack>
    </Container>
  );
}
