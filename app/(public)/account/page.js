'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import { ORDER_STATUSES, formatPrice } from '@/lib/utils';
import styles from './account.module.css';

export default function AccountPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user === null) {
      router.push('/auth/login');
      return;
    }
    
    if (user) {
      fetch('/api/orders')
        .then(r => r.json())
        .then(data => {
          setOrders(data.orders || []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [user, router]);

  if (!user || loading) return <div className="spinner" style={{ margin: '100px auto' }} />;

  const statusLabel = (s) => ORDER_STATUSES.find(x => x.key === s)?.label || s;

  return (
    <div className="section" style={{ minHeight: '80vh', paddingTop: '40px' }}>
      <div className="container">
        <div className={styles.accountLayout}>
          
          {/* Sidebar */}
          <aside className={styles.sidebar}>
            <div className={styles.userProfile}>
              <div className={styles.avatar}>{user.name[0]}</div>
              <div>
                <h2 className={styles.userName}>{user.name}</h2>
                <p className={styles.userEmail}>{user.email}</p>
              </div>
            </div>
            
            <nav className={styles.nav}>
              <a href="#" className={styles.navItemActive}>My Orders</a>
              <a href="#" className={styles.navItem}>Account Settings</a>
              <a href="#" className={styles.navItem}>Addresses</a>
              <button className={styles.logoutBtn} onClick={logout}>Sign Out</button>
            </nav>
          </aside>

          {/* Main Content */}
          <main>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', marginBottom: '24px' }}>Order History</h1>
            
            {orders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0', border: '1px dashed var(--color-border)', borderRadius: '8px' }}>
                <p style={{ color: 'var(--color-text-muted)', marginBottom: '16px' }}>You haven't placed any orders yet.</p>
                <button className="btn btn-primary" onClick={() => router.push('/products')}>Start Shopping</button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {orders.map(order => (
                  <div key={order.id} className={styles.orderCard}>
                    <div className={styles.orderHeader}>
                      <div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Order Placed</p>
                        <p style={{ fontWeight: 500 }}>{new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
                      </div>
                      <div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Total</p>
                        <p style={{ fontWeight: 500 }}>{formatPrice(order.total)}</p>
                      </div>
                      <div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Ship To</p>
                        <p style={{ fontWeight: 500 }}>{user.name}</p>
                      </div>
                      <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Order #</p>
                        <code style={{ color: 'var(--color-primary-dark)' }}>{order.id.slice(-8).toUpperCase()}</code>
                      </div>
                    </div>

                    <div className={styles.orderBody}>
                      <h3 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>
                        Status: <span style={{ color: 'var(--color-primary-dark)' }}>{statusLabel(order.status)}</span>
                      </h3>
                      
                      <div className={styles.orderItems}>
                        {JSON.parse(order.items || '[]').map((item, i) => (
                          <div key={i} className={styles.orderItem}>
                            {item.image && 
                              <div style={{ width: '60px', height: '80px', borderRadius: '4px', overflow: 'hidden', background: '#f5f5f5' }}>
                                <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              </div>
                            }
                            <div>
                              <p style={{ fontWeight: 500, fontSize: '0.95rem' }}>{item.name}</p>
                              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', margin: '4px 0' }}>{item.size} · {item.color}</p>
                              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', fontSize: '0.85rem' }}>
                                <span>Qty: {item.qty}</span>
                                <span>Price: {formatPrice(item.price)}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {order.trackingNotes && JSON.parse(order.trackingNotes).length > 0 && (
                        <div className={styles.tracking}>
                          <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '12px', color: 'var(--color-text-muted)' }}>Tracking History</h4>
                          {JSON.parse(order.trackingNotes).reverse().map((note, i) => (
                            <div key={i} style={{ display: 'flex', gap: '12px', marginBottom: '8px', fontSize: '0.85rem' }}>
                              <div style={{ color: 'var(--color-primary)' }}>•</div>
                              <div>
                                <p style={{ fontWeight: 500 }}>{statusLabel(note.status)} {note.note ? `- ${note.note}` : ''}</p>
                                <p style={{ color: 'var(--color-text-xlight)', fontSize: '0.75rem' }}>{new Date(note.timestamp).toLocaleString('en-IN')}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
