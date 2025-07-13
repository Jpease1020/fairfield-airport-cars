'use client';

import { useEffect, useState } from 'react';
import withAuth from '../withAuth';
import { PromoCode } from '@/types/promo';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
    <div className="min-h-screen p-8 bg-background">
      <h1 className="text-2xl font-bold mb-4">Promo Codes</h1>
      <div className="grid gap-4 max-w-xl mb-8 border p-4 rounded">
        <div>
          <Label>Code (uppercase)</Label>
          <Input value={form.code} onChange={e=>setForm({...form, code:e.target.value.toUpperCase()})} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Type</Label>
            <select className="w-full border rounded px-2 py-1" value={form.type} onChange={e=>setForm({...form, type:e.target.value})}>
              <option value="percent">Percent %</option>
              <option value="flat">Flat $</option>
            </select>
          </div>
          <div>
            <Label>Value</Label>
            <Input type="number" value={form.value} onChange={e=>setForm({...form, value:e.target.value})} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Expires At (optional)</Label>
            <Input type="date" value={form.expiresAt} onChange={e=>setForm({...form, expiresAt:e.target.value})} />
          </div>
          <div>
            <Label>Usage Limit (optional)</Label>
            <Input type="number" value={form.usageLimit} onChange={e=>setForm({...form, usageLimit:e.target.value})} />
          </div>
        </div>
        <Button onClick={addPromo} disabled={loading || !form.code}>Add Promo</Button>
      </div>

      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-gray-100"><th>Code</th><th>Type</th><th>Value</th><th>Expiry</th><th>Uses</th><th></th></tr>
        </thead>
        <tbody>
          {promos.map(p=> (
            <tr key={p.id} className="border-b">
              <td>{p.code}</td>
              <td>{p.type}</td>
              <td>{p.value}</td>
              <td>{p.expiresAt ? new Date(p.expiresAt).toLocaleDateString(): '-'}</td>
              <td>{p.usageCount}/{p.usageLimit ?? '∞'}</td>
              <td><Button variant="destructive" size="sm" onClick={()=>p.id && del(p.id)}>Delete</Button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default withAuth(PromosPage); 