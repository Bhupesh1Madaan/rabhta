'use client';

import { useState, useEffect, useCallback } from 'react';
import { CATEGORIES, SIZES, formatPrice } from '@/lib/utils';
import styles from '../admin.module.css';

const defaultProduct = {
  name: '', description: '', category: '', price: '', salePrice: '',
  images: [''], tags: '', isFeatured: false, isActive: true,
  sizes: [], colors: [], stock: {},
};

const colorOptions = [
  { name: 'Black', hex: '#1a1a1a' }, { name: 'White', hex: '#FFFFFF' },
  { name: 'Ivory', hex: '#FFFFF0' }, { name: 'Cream', hex: '#FFFDD0' },
  { name: 'Blush', hex: '#FFB6C1' }, { name: 'Dusty Rose', hex: '#DCAE96' },
  { name: 'Champagne', hex: '#F7E7CE' }, { name: 'Gold', hex: '#D4AF37' },
  { name: 'Camel', hex: '#C19A6B' }, { name: 'Mocha', hex: '#967259' },
  { name: 'Terracotta', hex: '#C66B3D' }, { name: 'Rust', hex: '#B7410E' },
  { name: 'Burgundy', hex: '#800020' }, { name: 'Wine', hex: '#722F37' },
  { name: 'Emerald', hex: '#50C878' }, { name: 'Sage', hex: '#B2C9AD' },
  { name: 'Navy', hex: '#1C2951' }, { name: 'Cobalt', hex: '#0047AB' },
  { name: 'Mustard', hex: '#E1C16E' }, { name: 'Charcoal', hex: '#36454F' },
];

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState(defaultProduct);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  const fetchProducts = useCallback(async () => {
    const res = await fetch('/api/products?limit=100');
    const data = await res.json();
    setProducts(data.products || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const openCreate = () => {
    setEditProduct(null);
    setForm(defaultProduct);
    setShowModal(true);
  };

  const openEdit = (p) => {
    setEditProduct(p);
    setForm({
      name: p.name,
      description: p.description,
      category: p.category,
      price: p.price,
      salePrice: p.salePrice || '',
      images: JSON.parse(p.images || '[""]'),
      tags: p.tags || '',
      isFeatured: p.isFeatured,
      isActive: p.isActive,
      sizes: JSON.parse(p.sizes || '[]'),
      colors: JSON.parse(p.colors || '[]'),
      stock: JSON.parse(p.stock || '{}'),
    });
    setShowModal(true);
  };

  const toggleSize = (size) => {
    setForm(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter(s => s !== size)
        : [...prev.sizes, size],
    }));
  };

  const toggleColor = (color) => {
    setForm(prev => {
      const exists = prev.colors.find(c => c.name === color.name);
      return {
        ...prev,
        colors: exists
          ? prev.colors.filter(c => c.name !== color.name)
          : [...prev.colors, color],
      };
    });
  };

  const updateImageUrl = (idx, val) => {
    setForm(prev => {
      const imgs = [...prev.images];
      imgs[idx] = val;
      return { ...prev, images: imgs };
    });
  };

  const addImageField = () => setForm(prev => ({ ...prev, images: [...prev.images, ''] }));

  const removeImage = (idx) => setForm(prev => ({
    ...prev,
    images: prev.images.filter((_, i) => i !== idx),
  }));

  const handleSave = async () => {
    if (!form.name || !form.category || !form.price) {
      alert('Please fill in all required fields'); return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        images: form.images.filter(Boolean),
        price: parseFloat(form.price),
        salePrice: form.salePrice ? parseFloat(form.salePrice) : null,
      };
      const url = editProduct ? `/api/products/${editProduct.id}` : '/api/products';
      const method = editProduct ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        fetchProducts();
      } else {
        alert(data.error || 'Failed to save');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Deactivate this product?')) return;
    await fetch(`/api/products/${id}`, { method: 'DELETE' });
    fetchProducts();
  };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className={styles.adminHeader}>
        <div>
          <h1 className={styles.adminTitle}>Products</h1>
          <p className={styles.adminSubtitle}>{products.length} products in your catalog</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ Add Product</button>
      </div>

      <div className={styles.adminContent}>
        <div className={styles.adminCard}>
          <div className={styles.adminCardHeader}>
            <h2 className={styles.adminCardTitle}>All Products</h2>
            <input
              className="form-input"
              style={{ width: '240px' }}
              placeholder="Search products..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="table-wrapper">
            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center' }}>
                <div className="spinner" style={{ margin: '0 auto' }} />
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Sizes</th>
                    <th>Colors</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(p => {
                    const images = JSON.parse(p.images || '[]');
                    const colors = JSON.parse(p.colors || '[]');
                    const sizes = JSON.parse(p.sizes || '[]');
                    return (
                      <tr key={p.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {images[0] ? (
                              <img src={images[0]} alt={p.name} className={styles.productThumb} />
                            ) : (
                              <div className={styles.productThumb} style={{ background: 'var(--color-surface)' }} />
                            )}
                            <div>
                              <p style={{ fontWeight: 500, fontSize: '0.875rem' }}>{p.name}</p>
                              {p.isFeatured && <span className="badge badge-primary">Featured</span>}
                            </div>
                          </div>
                        </td>
                        <td style={{ fontSize: '0.85rem' }}>{p.category}</td>
                        <td>
                          <div>
                            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{formatPrice(p.salePrice || p.price)}</span>
                            {p.salePrice && <span style={{ textDecoration: 'line-through', color: 'var(--color-text-xlight)', fontSize: '0.8rem', marginLeft: '6px' }}>{formatPrice(p.price)}</span>}
                          </div>
                        </td>
                        <td>
                          <div className={styles.sizeChips}>
                            {sizes.slice(0, 4).map(s => <span key={s} className={styles.sizeChip}>{s}</span>)}
                            {sizes.length > 4 && <span className={styles.sizeChip}>+{sizes.length - 4}</span>}
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            {colors.map(c => (
                              <div
                                key={c.name}
                                title={c.name}
                                style={{ width: '14px', height: '14px', borderRadius: '50%', background: c.hex, border: '1px solid rgba(0,0,0,0.15)' }}
                              />
                            ))}
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${p.isActive ? 'badge-success' : 'badge-error'}`}>
                            {p.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button className="btn btn-ghost btn-sm" onClick={() => openEdit(p)}>Edit</button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id)}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Product Modal */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className={styles.modal} style={{ maxWidth: '800px' }}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>{editProduct ? 'Edit Product' : 'Add New Product'}</h2>
              <button className={styles.modalClose} onClick={() => setShowModal(false)}>✕</button>
            </div>

            <div className={styles.modalForm}>
              <div className={styles.formGrid}>
                <div className="form-group">
                  <label className="form-label">Product Name *</label>
                  <input className="form-input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Ivory Lace Midi Dress" />
                </div>
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select className="form-input" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                    <option value="">Select category</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Price (₹) *</label>
                  <input className="form-input" type="number" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} placeholder="2999" />
                </div>
                <div className="form-group">
                  <label className="form-label">Sale Price (₹)</label>
                  <input className="form-input" type="number" value={form.salePrice} onChange={e => setForm(p => ({ ...p, salePrice: e.target.value }))} placeholder="Leave empty if no sale" />
                </div>
                <div className={`form-group ${styles.formGridFull}`}>
                  <label className="form-label">Description *</label>
                  <textarea className="form-input" rows={3} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Describe this product..." />
                </div>

                {/* Images */}
                <div className={`form-group ${styles.formGridFull}`}>
                  <label className="form-label">Image URLs</label>
                  {form.images.map((img, i) => (
                    <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                      <input className="form-input" value={img} onChange={e => updateImageUrl(i, e.target.value)} placeholder="https://..." />
                      {form.images.length > 1 && (
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => removeImage(i)}>✕</button>
                      )}
                    </div>
                  ))}
                  <button type="button" className="btn btn-ghost btn-sm" onClick={addImageField}>+ Add Image URL</button>
                </div>

                {/* Sizes */}
                <div className={`form-group ${styles.formGridFull}`}>
                  <label className="form-label">Available Sizes</label>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {SIZES.map(size => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => toggleSize(size)}
                        style={{
                          padding: '6px 16px',
                          border: `1px solid ${form.sizes.includes(size) ? 'var(--color-primary)' : 'var(--color-border)'}`,
                          borderRadius: 'var(--radius-sm)',
                          background: form.sizes.includes(size) ? 'rgba(201, 169, 110, 0.15)' : 'white',
                          color: form.sizes.includes(size) ? 'var(--color-primary-dark)' : 'var(--color-text-muted)',
                          fontFamily: 'var(--font-sans)',
                          fontWeight: 500,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Colors */}
                <div className={`form-group ${styles.formGridFull}`}>
                  <label className="form-label">Available Colors</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {colorOptions.map(color => {
                      const selected = form.colors.find(c => c.name === color.name);
                      return (
                        <button
                          key={color.name}
                          type="button"
                          onClick={() => toggleColor(color)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '5px 12px',
                            border: `1px solid ${selected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                            borderRadius: 'var(--radius-pill)',
                            background: selected ? 'rgba(201, 169, 110, 0.1)' : 'white',
                            cursor: 'pointer',
                            fontSize: '0.78rem',
                            fontFamily: 'var(--font-sans)',
                          }}
                        >
                          <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: color.hex, border: '1px solid rgba(0,0,0,0.15)', flexShrink: 0 }} />
                          {color.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Tags & Options */}
                <div className="form-group">
                  <label className="form-label">Tags (comma separated)</label>
                  <input className="form-input" value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} placeholder="dress,summer,floral" />
                </div>
                <div className="form-group" style={{ display: 'flex', gap: '20px', alignItems: 'center', marginTop: '20px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={form.isFeatured} onChange={e => setForm(p => ({ ...p, isFeatured: e.target.checked }))} />
                    <span className="form-label" style={{ margin: 0 }}>Featured Product</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={form.isActive} onChange={e => setForm(p => ({ ...p, isActive: e.target.checked }))} />
                    <span className="form-label" style={{ margin: 0 }}>Active (visible on site)</span>
                  </label>
                </div>
              </div>

              <div className={styles.modalActions}>
                <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button className={`btn btn-primary ${saving ? 'btn-loading' : ''}`} onClick={handleSave} disabled={saving}>
                  {saving ? '' : editProduct ? 'Save Changes' : 'Add Product'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
