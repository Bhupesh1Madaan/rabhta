'use client';

import { useState, useEffect } from 'react';
import { ORDER_STATUSES, formatPrice } from '@/lib/utils';
import styles from '../admin.module.css';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusNote, setStatusNote] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [updating, setUpdating] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');

  const fetchOrders = async () => {
    const url = filterStatus ? `/api/admin/orders?status=${filterStatus}` : '/api/admin/orders';
    const res = await fetch(url);
    const data = await res.json();
    setOrders(data.orders || []);
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, [filterStatus]);

  const handleUpdateStatus = async () => {
    if (!newStatus) return;
    setUpdating(true);
    const res = await fetch(`/api/orders/${selectedOrder.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus, note: statusNote }),
    });
    const data = await res.json();
    if (data.success) {
      setSelectedOrder(data.order);
      setStatusNote('');
      fetchOrders();
    }
    setUpdating(false);
  };

  const statusLabel = (s) => ORDER_STATUSES.find(x => x.key === s)?.label || s;
  const statusIcon = (s) => ORDER_STATUSES.find(x => x.key === s)?.icon || '📦';

  const statusColors = {
    placed: 'badge-neutral',
    confirmed: 'badge-info',
    shipped: 'badge-warning',
    out_for_delivery: 'badge-warning',
    delivered: 'badge-success',
    cancelled: 'badge-error',
  };

  return (
    <div>
      <div className={styles.adminHeader}>
        <div>
          <h1 className={styles.adminTitle}>Orders</h1>
          <p className={styles.adminSubtitle}>{orders.length} orders found</p>
        </div>
        <select className="form-input" style={{ width: '180px' }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All Orders</option>
          {ORDER_STATUSES.map(s => <option key={s.key} value={s.key}>{s.icon} {s.label}</option>)}
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className={styles.adminContent} style={{ display: 'grid', gridTemplateColumns: selectedOrder ? '1fr 380px' : '1fr', gap: '20px' }}>
        {/* Orders Table */}
        <div className={styles.adminCard}>
          <div className="table-wrapper">
            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Total</th>
                    <th>Payment</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o.id} style={{ cursor: 'pointer' }} onClick={() => { setSelectedOrder(o); setNewStatus(o.status); }}>
                      <td><code style={{ fontSize: '0.8rem', color: 'var(--color-primary-dark)' }}>#{o.id.slice(-8).toUpperCase()}</code></td>
                      <td>
                        <p style={{ fontWeight: 500, fontSize: '0.875rem' }}>{o.user?.name}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{o.user?.email}</p>
                      </td>
                      <td style={{ fontSize: '0.8rem' }}>{new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
                      <td style={{ fontWeight: 600 }}>{formatPrice(o.total)}</td>
                      <td>
                        <span className={`badge ${o.paymentStatus === 'paid' ? 'badge-success' : 'badge-warning'}`}>
                          {o.paymentStatus}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${statusColors[o.status] || 'badge-neutral'}`}>
                          {statusIcon(o.status)} {statusLabel(o.status)}
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-ghost btn-sm" onClick={e => { e.stopPropagation(); setSelectedOrder(o); setNewStatus(o.status); }}>
                          Manage
                        </button>
                      </td>
                    </tr>
                  ))}
                  {orders.length === 0 && (
                    <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)' }}>No orders found</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Order Detail Panel */}
        {selectedOrder && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className={styles.adminCard}>
              <div className={styles.adminCardHeader}>
                <h3 className={styles.adminCardTitle}>Order #{selectedOrder.id.slice(-8).toUpperCase()}</h3>
                <button onClick={() => setSelectedOrder(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem' }}>✕</button>
              </div>
              <div className={styles.adminCardBody}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--color-text-muted)' }}>Customer</p>
                    <p style={{ fontWeight: 500 }}>{selectedOrder.user?.name}</p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{selectedOrder.user?.email}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--color-text-muted)' }}>Ship To</p>
                    <p style={{ fontSize: '0.875rem' }}>
                      {selectedOrder.address?.line1}, {selectedOrder.address?.city}, {selectedOrder.address?.state} — {selectedOrder.address?.pincode}
                    </p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--color-text-muted)' }}>Order Total</p>
                    <p style={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--color-primary-dark)' }}>{formatPrice(selectedOrder.total)}</p>
                  </div>

                  {/* Items */}
                  <div>
                    <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--color-text-muted)', marginBottom: '8px' }}>Items</p>
                    {JSON.parse(selectedOrder.items || '[]').map((item, i) => (
                      <div key={i} style={{ display: 'flex', gap: '10px', padding: '8px 0', borderBottom: '1px solid var(--color-border-light)', fontSize: '0.85rem' }}>
                        {item.image && <img src={item.image} style={{ width: '40px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} />}
                        <div>
                          <p style={{ fontWeight: 500 }}>{item.name}</p>
                          <p style={{ color: 'var(--color-text-muted)' }}>{item.size} · {item.color} · Qty {item.qty}</p>
                          <p style={{ color: 'var(--color-primary-dark)', fontWeight: 600 }}>{formatPrice(item.price)}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Update Status */}
                  <div style={{ background: 'var(--color-bg-warm)', borderRadius: '8px', padding: '16px' }}>
                    <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--color-text-muted)', marginBottom: '10px' }}>Update Status</p>
                    <select className="form-input" value={newStatus} onChange={e => setNewStatus(e.target.value)} style={{ marginBottom: '10px' }}>
                      {ORDER_STATUSES.map(s => <option key={s.key} value={s.key}>{s.icon} {s.label}</option>)}
                      <option value="cancelled">❌ Cancelled</option>
                    </select>
                    <input className="form-input" placeholder="Add a note (optional)..." value={statusNote} onChange={e => setStatusNote(e.target.value)} style={{ marginBottom: '10px' }} />
                    <button
                      className={`btn btn-primary btn-full ${updating ? 'btn-loading' : ''}`}
                      onClick={handleUpdateStatus}
                      disabled={updating || newStatus === selectedOrder.status}
                    >
                      {updating ? '' : 'Update Order Status'}
                    </button>
                  </div>

                  {/* Tracking Timeline */}
                  <div>
                    <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--color-text-muted)', marginBottom: '10px' }}>Tracking Timeline</p>
                    {JSON.parse(selectedOrder.trackingNotes || '[]').reverse().map((t, i) => (
                      <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '10px', fontSize: '0.82rem' }}>
                        <span style={{ fontSize: '1rem' }}>{statusIcon(t.status)}</span>
                        <div>
                          <p style={{ fontWeight: 600 }}>{statusLabel(t.status)}</p>
                          {t.note && <p style={{ color: 'var(--color-text-muted)' }}>{t.note}</p>}
                          <p style={{ color: 'var(--color-text-xlight)', fontSize: '0.75rem' }}>{new Date(t.timestamp).toLocaleString('en-IN')}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
