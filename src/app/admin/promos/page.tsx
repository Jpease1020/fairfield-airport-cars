'use client';

import { useEffect, useState } from 'react';
import withAuth from '../withAuth';
import { PromoCode } from '@/types/promo';

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
    <div className="admin-dashboard">
      <div className="section-header">
        <h1 className="page-title">Promo Codes</h1>
        <p className="page-subtitle">Create and manage promotional discount codes</p>
      </div>

      <div className="standard-content">
        {/* Add New Promo Section */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Add New Promo Code</h2>
          </div>
          <div className="card-body">
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Code (uppercase)</label>
                <input
                  type="text"
                  className="form-input"
                  value={form.code}
                  onChange={(e) => setForm({...form, code: e.target.value.toUpperCase()})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Type</label>
                <select
                  className="form-input"
                  value={form.type}
                  onChange={(e) => setForm({...form, type: e.target.value})}
                  required
                >
                  <option value="percent">Percent %</option>
                  <option value="flat">Flat $</option>
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label">Value</label>
                <input
                  type="number"
                  className="form-input"
                  value={form.value}
                  onChange={(e) => setForm({...form, value: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Expires At (optional)</label>
                <input
                  type="date"
                  className="form-input"
                  value={form.expiresAt}
                  onChange={(e) => setForm({...form, expiresAt: e.target.value})}
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Usage Limit (optional)</label>
                <input
                  type="number"
                  className="form-input"
                  value={form.usageLimit}
                  onChange={(e) => setForm({...form, usageLimit: e.target.value})}
                />
              </div>
            </div>
            
            <div className="form-actions">
              <button 
                className="btn btn-primary"
                onClick={addPromo}
                disabled={!form.code || loading}
              >
                {loading ? 'Adding...' : 'Add Promo'}
              </button>
            </div>
          </div>
        </div>

        {/* Promos Table */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Active Promo Codes</h2>
          </div>
          <div className="card-body">
            {promos.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">🎟️</div>
                <p>No promo codes found.</p>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Type</th>
                    <th>Value</th>
                    <th>Expiry</th>
                    <th>Uses</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {promos.map((promo) => (
                    <tr key={promo.id}>
                      <td className="promo-code">{promo.code}</td>
                      <td className="promo-type">{promo.type}</td>
                      <td className="promo-value">{promo.value}</td>
                      <td className="promo-expiry">
                        {promo.expiresAt ? new Date(promo.expiresAt).toLocaleDateString() : '-'}
                      </td>
                      <td className="promo-usage">
                        {promo.usageCount}/{promo.usageLimit ?? '∞'}
                      </td>
                      <td className="promo-actions">
                        <button 
                          className="btn btn-destructive btn-sm"
                          onClick={() => promo.id && del(promo.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default withAuth(PromosPage); 