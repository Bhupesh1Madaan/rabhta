'use client';

import { useState, useEffect } from 'react';
import { formatPrice } from '@/lib/utils';
import styles from './admin.module.css';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ orders: 0, revenue: 0, products: 0, customers: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/orders?limit=5').then(r => r.json()),
      fetch('/api/products?limit=1').then(r => r.json()),
    ]).then(([ordersData, productsData]) => {
      const orders = ordersData.orders || [];
      const revenue = orders.reduce((sum, o) => sum + o.total, 0);
      setStats({
        orders: ordersData.total || 0,
        revenue,
        products: productsData.total || 0,
        customers: 0,
      });
      setRecentOrders(orders.slice(0, 5));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const statCards = [
    { icon: '📦', label: 'Total Orders', value: stats.orders, color: '#C9A96E' },
    { icon: '💰', label: 'Revenue', value: formatPrice(stats.revenue), color: '#4A7C59' },
    { icon: '👗', label: 'Products', value: stats.products, color: '#3A6B9B' },
    { icon: '👥', label: 'Customers', value: stats.customers, color: '#9B5A3A' },
  ];

  const statusColors = {
    placed: 'badge-neutral', confirmed: 'badge-primary', shipped: 'badge-warning',
    out_for_delivery: 'badge-warning', delivered: 'badge-success', cancelled: 'badge-error',
  };

  return (
    <div>
      <div className={styles.adminHeader}>
        <div>
          <h1 className={styles.adminTitle}>Dashboard</h1>
          <p className={styles.adminSubtitle}>Welcome back! Here's your store overview</p>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <div className={styles.adminContent}>
        {/* Stats */}
        <div className={styles.statsGrid}>
          {statCards.map(card => (
            <div key={card.label} className={styles.statCard} style={{ '--stat-color': card.color }}>
              <div className={styles.statIcon}>{card.icon}</div>
              <div className={styles.statValue}>{loading ? '—' : card.value}</div>
              <div className={styles.statLabel}>{card.label}</div>
            </div>
          ))}
        </div>

        {/* Quick Links */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
          {[
            { href: '/admin/products', label: 'Manage Products', desc: 'Add, edit or remove products', icon: '👗' },
            { href: '/admin/banners', label: 'Update Banners', desc: 'Change homepage hero images', icon: '🖼️' },
            { href: '/admin/offers', label: 'Create Offers', desc: 'Add discount codes', icon: '🏷️' },
          ].map(link => (
            <a key={link.href} href={link.href} style={{ textDecoration: 'none' }}>
              <div className={styles.adminCard} style={{ padding: '20px', cursor: 'pointer', transition: 'box-shadow 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
              >
                <div style={{ fontSize: '1.6rem', marginBottom: '10px' }}>{link.icon}</div>
                <p style={{ fontWeight: 600, color: 'var(--color-text)' }}>{link.label}</p>
                <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>{link.desc}</p>
              </div>
            </a>
          ))}
        </div>

        {/* Recent Orders */}
        <div className={styles.adminCard}>
          <div className={styles.adminCardHeader}>
            <h2 className={styles.adminCardTitle}>Recent Orders</h2>
            <a href="/admin/orders" style={{ fontSize: '0.85rem', color: 'var(--color-primary)', textDecoration: 'none' }}>View all →</a>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(o => (
                  <tr key={o.id}>
                    <td><code style={{ fontSize: '0.8rem', color: 'var(--color-primary-dark)' }}>#{o.id.slice(-8).toUpperCase()}</code></td>
                    <td style={{ fontSize: '0.875rem' }}>{o.user?.name}</td>
                    <td style={{ fontSize: '0.8rem' }}>{new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
                    <td style={{ fontWeight: 600 }}>{formatPrice(o.total)}</td>
                    <td><span className={`badge ${statusColors[o.status] || 'badge-neutral'}`}>{o.status}</span></td>
                  </tr>
                ))}
                {recentOrders.length === 0 && !loading && (
                  <tr><td colSpan={5} style={{ textAlign: 'center', padding: '32px', color: 'var(--color-text-muted)' }}>No orders yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
