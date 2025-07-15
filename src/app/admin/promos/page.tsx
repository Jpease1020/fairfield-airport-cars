'use client';

import { useEffect, useState } from 'react';
import withAuth from '../withAuth';
import { PromoCode } from '@/types/promo';
import { PageContainer, PageHeader, PageContent } from '@/components/layout';
import { FormField, FormSection, FormActions, SelectField } from '@/components/forms';
import { DataTable } from '@/components/data';
import { Button } from '@/components/ui/button';

const PromosPage = () => {
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [form, setForm] = useState({ code:'', type:'percent', value:'', expiresAt:'', usageLimit:'' });
  const [loading, setLoading] = useState(false);

  const fetchPromos = async ()=>{
    const res = await fetch('/api/promos');
    if(res.ok) setPromos(await res.json());
  };
  useEffect(()=>{ fetchPromos(); },[]);

  const addPromo = async ()=>{
    setLoading(true);
    const body = { ...form, value: Number(form.value), usageLimit: form.usageLimit? Number(form.usageLimit): undefined };
    await fetch('/api/promos', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body)});
    setForm({ code:'', type:'percent', value:'', expiresAt:'', usageLimit:'' });
    await fetchPromos();
    setLoading(false);
  };

  const del = async(id:string)=>{
    await fetch(`/api/promos/${id}`, { method:'DELETE' });
    await fetchPromos();
  };

  return (
    <PageContainer>
      <PageHeader title="Promo Codes" />
      <PageContent>
        <FormSection title="Add New Promo Code" columns={2}>
          <FormField
            label="Code (uppercase)"
            value={form.code}
            onChange={(e) => setForm({...form, code: e.target.value.toUpperCase()})}
            required
          />
          <SelectField
            label="Type"
            value={form.type}
            onChange={(e) => setForm({...form, type: e.target.value})}
            options={[
              { value: 'percent', label: 'Percent %' },
              { value: 'flat', label: 'Flat $' }
            ]}
            required
          />
          <FormField
            label="Value"
            type="number"
            value={form.value}
            onChange={(e) => setForm({...form, value: e.target.value})}
            required
          />
          <FormField
            label="Expires At (optional)"
            type="date"
            value={form.expiresAt}
            onChange={(e) => setForm({...form, expiresAt: e.target.value})}
          />
          <FormField
            label="Usage Limit (optional)"
            type="number"
            value={form.usageLimit}
            onChange={(e) => setForm({...form, usageLimit: e.target.value})}
          />
        </FormSection>
        
        <FormActions>
          <Button 
            onClick={addPromo}
            disabled={!form.code || loading}
            className="w-full sm:w-auto"
          >
            {loading ? 'Adding...' : 'Add Promo'}
          </Button>
        </FormActions>

        <DataTable
          data={promos}
          columns={[
            { key: 'code', label: 'Code' },
            { key: 'type', label: 'Type' },
            { key: 'value', label: 'Value' },
            { 
              key: 'expiresAt', 
              label: 'Expiry',
              render: (item) => item.expiresAt ? new Date(item.expiresAt).toLocaleDateString() : '-'
            },
            { 
              key: 'usageCount', 
              label: 'Uses',
              render: (item) => `${item.usageCount}/${item.usageLimit ?? '∞'}`
            },
            {
              key: 'actions',
              label: '',
              render: (item) => (
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={() => item.id && del(item.id)}
                >
                  Delete
                </Button>
              )
            }
          ]}
        />
      </PageContent>
    </PageContainer>
  );
};

export default withAuth(PromosPage); 