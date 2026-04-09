'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from '../admin.module.css';

export default function AdminBannersPage() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editBanner, setEditBanner] = useState(null);
  const [form, setForm] = useState({ title: '', subtitle: '', imageUrl: '', linkUrl: '', buttonText: '', order: 0, isActive: true });
  const [saving, setSaving] = useState(false);

  const fetchBanners = useCallback(async () => {
    const res = await fetch('/api/banners');
    const data = await res.json();
    setBanners(data.banners || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchBanners(); }, [fetchBanners]);

  const openCreate = () => {
    setEditBanner(null);
    setForm({ title: '', subtitle: '', imageUrl: '', linkUrl: '', buttonText: '', order: banners.length, isActive: true });
    setShowModal(true);
  };

  const openEdit = (b) => {
    setEditBanner(b);
    setForm({ title: b.title, subtitle: b.subtitle || '', imageUrl: b.imageUrl, linkUrl: b.linkUrl || '', buttonText: b.buttonText || '', order: b.order, isActive: b.isActive });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.imageUrl) { alert('Title and image URL are required'); return; }
    setSaving(true);
    try {
      const url = editBanner ? `/api/banners/${editBanner.id}` : '/api/banners';
      const method = editBanner ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) { setShowModal(false); fetchBanners(); }
      else alert(data.error || 'Failed to save');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this banner?')) return;
    await fetch(`/api/banners/${id}`, { method: 'DELETE' });
    fetchBanners();
  };

  return (
    <div>
      <div className={styles.adminHeader}>
        <div>
          <h1 className={styles.adminTitle}>Banners</h1>
          <p className={styles.adminSubtitle}>Manage hero banners shown on the homepage</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ Add Banner</button>
      </div>

      <div className={styles.adminContent}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {banners.map((b, idx) => (
              <div key={b.id} className={styles.adminCard} style={{ overflow: 'visible' }}>
                <div style={{ display: 'flex', gap: '20px', padding: '16px 20px', alignItems: 'center' }}>
                  <div style={{ fontSize: '1.2rem', color: 'var(--color-text-muted)', width: '24px', textAlign: 'center' }}>#{idx + 1}</div>
                  <div style={{ width: '160px', height: '90px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
                    <img src={b.imageUrl} alt={b.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', marginBottom: '4px' }}>{b.title}</h3>
                    {b.subtitle && <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '6px' }}>{b.subtitle}</p>}
                    {b.linkUrl && <p style={{ fontSize: '0.78rem', color: 'var(--color-primary)' }}>→ {b.linkUrl}</p>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span className={`badge ${b.isActive ? 'badge-success' : 'badge-neutral'}`}>{b.isActive ? 'Active' : 'Hidden'}</span>
                    <button className="btn btn-ghost btn-sm" onClick={() => openEdit(b)}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(b.id)}>Delete</button>
                  </div>
                </div>
              </div>
            ))}
            {banners.length === 0 && (
              <div style={{ textAlign: 'center', padding: '60px', color: 'var(--color-text-muted)' }}>
                <p style={{ fontSize: '1.1rem', marginBottom: '16px' }}>No banners yet</p>
                <button className="btn btn-primary" onClick={openCreate}>Add Your First Banner</button>
              </div>
            )}
          </div>
        )}
      </div>

      {showModal && (
        <div className={styles.modalOverlay} onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>{editBanner ? 'Edit Banner' : 'Add New Banner'}</h2>
              <button className={styles.modalClose} onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className={styles.modalForm}>
              {form.imageUrl && (
                <div style={{ borderRadius: '8px', overflow: 'hidden', height: '160px', marginBottom: '8px' }}>
                  <img src={form.imageUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
              <div className="form-group">
                <label className="form-label">Image URL *</label>
                <input className="form-input" value={form.imageUrl} onChange={e => setForm(p => ({ ...p, imageUrl: e.target.value }))} placeholder="https://..." />
              </div>
              <div className={styles.formGrid}>
                <div className="form-group">
                  <label className="form-label">Title *</label>
                  <input className="form-input" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="New Season Arrivals" />
                </div>
                <div className="form-group">
                  <label className="form-label">Button Text</label>
                  <input className="form-input" value={form.buttonText} onChange={e => setForm(p => ({ ...p, buttonText: e.target.value }))} placeholder="Shop Now" />
                </div>
                <div className={`form-group ${styles.formGridFull}`}>
                  <label className="form-label">Subtitle</label>
                  <input className="form-input" value={form.subtitle} onChange={e => setForm(p => ({ ...p, subtitle: e.target.value }))} placeholder="Short description..." />
                </div>
                <div className="form-group">
                  <label className="form-label">Link URL</label>
                  <input className="form-input" value={form.linkUrl} onChange={e => setForm(p => ({ ...p, linkUrl: e.target.value }))} placeholder="/products?category=..." />
                </div>
                <div className="form-group">
                  <label className="form-label">Display Order</label>
                  <input className="form-input" type="number" value={form.order} onChange={e => setForm(p => ({ ...p, order: parseInt(e.target.value) || 0 }))} />
                </div>
                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '20px' }}>
                  <input type="checkbox" id="isActive" checked={form.isActive} onChange={e => setForm(p => ({ ...p, isActive: e.target.checked }))} />
                  <label htmlFor="isActive" className="form-label" style={{ margin: 0, cursor: 'pointer' }}>Show on homepage</label>
                </div>
              </div>
              <div className={styles.modalActions}>
                <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button className={`btn btn-primary ${saving ? 'btn-loading' : ''}`} onClick={handleSave} disabled={saving}>
                  {saving ? '' : editBanner ? 'Save Changes' : 'Add Banner'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
