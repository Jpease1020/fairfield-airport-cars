'use client';

import { useEffect, useState } from 'react';
import withAuth from '../withAuth';
import { PromoCode } from '@/types/promo';
import { 
  PageHeader, 
  GridSection, 
  InfoCard
} from '@/components/ui';
import { EmptyState } from '@/components/data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

  const headerActions = [
    { 
      label: 'Refresh', 
      onClick: fetchPromos, 
      variant: 'outline' as const 
    },
    { 
      label: 'Promo Analytics', 
      onClick: () => alert('Analytics coming soon'), 
      variant: 'primary' as const 
    }
  ];

  return (
    <div className="admin-dashboard">
      <PageHeader
        title="Promo Codes"
        subtitle="Create and manage promotional discount codes"
        actions={headerActions}
      />

      <GridSection variant="content" columns={1}>
        <InfoCard
          title="🎟️ Add New Promo Code"
          description="Create discount codes for your customers"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">Code (uppercase)</Label>
              <Input
                id="code"
                type="text"
                value={form.code}
                onChange={(e) => setForm({...form, code: e.target.value.toUpperCase()})}
                placeholder="SAVE20"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select value={form.type} onValueChange={(value) => setForm({...form, type: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percent">Percent %</SelectItem>
                  <SelectItem value="flat">Flat $</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="value">Value</Label>
              <Input
                id="value"
                type="number"
                value={form.value}
                onChange={(e) => setForm({...form, value: e.target.value})}
                placeholder="20"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="expires">Expires At (optional)</Label>
              <Input
                id="expires"
                type="date"
                value={form.expiresAt}
                onChange={(e) => setForm({...form, expiresAt: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="limit">Usage Limit (optional)</Label>
              <Input
                id="limit"
                type="number"
                value={form.usageLimit}
                onChange={(e) => setForm({...form, usageLimit: e.target.value})}
                placeholder="100"
              />
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <Button 
              onClick={addPromo}
              disabled={!form.code || loading}
            >
              {loading ? 'Adding...' : 'Add Promo Code'}
            </Button>
          </div>
        </InfoCard>
      </GridSection>

      <GridSection variant="content" columns={1}>
        <InfoCard
          title="Active Promo Codes"
          description={`Showing ${promos.length} promo codes`}
        >
          {promos.length === 0 ? (
            <EmptyState
              icon="🎟️"
              title="No promo codes found"
              description="Create your first promotional discount code above"
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium">Code</th>
                    <th className="text-left p-3 font-medium">Type</th>
                    <th className="text-left p-3 font-medium">Value</th>
                    <th className="text-left p-3 font-medium">Expiry</th>
                    <th className="text-left p-3 font-medium">Uses</th>
                    <th className="text-left p-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {promos.map((promo) => (
                    <tr key={promo.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <span className="font-mono font-semibold bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {promo.code}
                        </span>
                      </td>
                      <td className="p-3 capitalize">{promo.type}</td>
                      <td className="p-3">
                        {promo.type === 'percent' ? `${promo.value}%` : `$${promo.value}`}
                      </td>
                      <td className="p-3">
                        {promo.expiresAt ? new Date(promo.expiresAt).toLocaleDateString() : '∞'}
                      </td>
                      <td className="p-3">
                        <span className="text-sm">
                          {promo.usageCount}/{promo.usageLimit ?? '∞'}
                        </span>
                      </td>
                      <td className="p-3">
                        <Button 
                          variant="destructive"
                          size="sm"
                          onClick={() => promo.id && del(promo.id)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </InfoCard>
      </GridSection>
    </div>
  );
};

export default withAuth(PromosPage); 