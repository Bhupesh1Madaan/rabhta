'use client';

import { useState, useEffect, useCallback } from 'react';
import { formatPrice } from '@/lib/utils';
import styles from '../admin.module.css';

export default function AdminOffersPage() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    code: '', description: '', discountType: 'percentage',
    discountValue: '', minOrderAmount: '', maxUses: '', expiresAt: '',
  });
  const [saving, setSaving] = useState(false);

  const fetchOffers = useCallback(async () => {
    const res = await fetch('/api/offers');
    const data = await res.json();
    setOffers(data.offers || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchOffers(); }, [fetchOffers]);

  const handleSave = async () => {
    if (!form.code || !form.discountType || !form.discountValue) {
      alert('Code, type, and value are required'); return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) { setShowModal(false); fetchOffers(); }
      else alert(data.error || 'Failed to save');
    } finally { setSaving(false); }
  };

  const handleToggle = async (id, isActive) => {
    await fetch(`/api/offers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !isActive }),
    });
    fetchOffers();
  };

  return (
    <div>
      <div className={styles.adminHeader}>
        <div>
          <h1 className={styles.adminTitle}>Offers & Coupons</h1>
          <p className={styles.adminSubtitle}>Create discount codes for your customers</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setForm({ code: '', description: '', discountType: 'percentage', discountValue: '', minOrderAmount: '', maxUses: '', expiresAt: '' }); setShowModal(true); }}>+ Add Offer</button>
      </div>

      <div className={styles.adminContent}>
        <div className={styles.adminCard}>
          <div className="table-wrapper">
            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Description</th>
                    <th>Discount</th>
                    <th>Min Order</th>
                    <th>Usage</th>
                    <th>Expires</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {offers.map(o => (
                    <tr key={o.id}>
                      <td><code style={{ background: 'var(--color-surface)', padding: '3px 8px', borderRadius: '4px', fontSize: '0.875rem', fontWeight: 600 }}>{o.code}</code></td>
                      <td style={{ fontSize: '0.85rem' }}>{o.description}</td>
                      <td style={{ fontWeight: 600 }}>
                        {o.discountType === 'percentage' ? `${o.discountValue}%` : formatPrice(o.discountValue)} off
                      </td>
                      <td>{o.minOrderAmount ? formatPrice(o.minOrderAmount) : '—'}</td>
                      <td style={{ fontSize: '0.85rem' }}>{o.usedCount}{o.maxUses ? ` / ${o.maxUses}` : ''}</td>
                      <td style={{ fontSize: '0.85rem' }}>{o.expiresAt ? new Date(o.expiresAt).toLocaleDateString('en-IN') : 'Never'}</td>
                      <td>
                        <span className={`badge ${o.isActive ? 'badge-success' : 'badge-neutral'}`}>
                          {o.isActive ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-ghost btn-sm" onClick={() => handleToggle(o.id, o.isActive)}>
                          {o.isActive ? 'Disable' : 'Enable'}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {offers.length === 0 && (
                    <tr><td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)' }}>No offers yet. Create your first coupon!</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <div className={styles.modalOverlay} onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Create Offer</h2>
              <button className={styles.modalClose} onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className={styles.modalForm}>
              <div className={styles.formGrid}>
                <div className="form-group">
                  <label className="form-label">Coupon Code *</label>
                  <input className="form-input" value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value.toUpperCase() }))} placeholder="SUMMER20" style={{ textTransform: 'uppercase' }} />
                </div>
                <div className="form-group">
                  <label className="form-label">Discount Type *</label>
                  <select className="form-input" value={form.discountType} onChange={e => setForm(p => ({ ...p, discountType: e.target.value }))}>
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat Amount (₹)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Discount Value * {form.discountType === 'percentage' ? '(%)' : '(₹)'}</label>
                  <input className="form-input" type="number" value={form.discountValue} onChange={e => setForm(p => ({ ...p, discountValue: e.target.value }))} placeholder={form.discountType === 'percentage' ? '10' : '500'} />
                </div>
                <div className="form-group">
                  <label className="form-label">Min Order Amount (₹)</label>
                  <input className="form-input" type="number" value={form.minOrderAmount} onChange={e => setForm(p => ({ ...p, minOrderAmount: e.target.value }))} placeholder="1999" />
                </div>
                <div className="form-group">
                  <label className="form-label">Max Uses</label>
                  <input className="form-input" type="number" value={form.maxUses} onChange={e => setForm(p => ({ ...p, maxUses: e.target.value }))} placeholder="Unlimited" />
                </div>
                <div className="form-group">
                  <label className="form-label">Expiry Date</label>
                  <input className="form-input" type="date" value={form.expiresAt} onChange={e => setForm(p => ({ ...p, expiresAt: e.target.value }))} />
                </div>
                <div className={`form-group ${styles.formGridFull}`}>
                  <label className="form-label">Description</label>
                  <input className="form-input" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="e.g. 10% off for first-time customers" />
                </div>
              </div>
              <div className={styles.modalActions}>
                <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button className={`btn btn-primary ${saving ? 'btn-loading' : ''}`} onClick={handleSave} disabled={saving}>
                  {saving ? '' : 'Create Offer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
