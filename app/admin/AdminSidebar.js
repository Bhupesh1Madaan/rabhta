'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import styles from './admin.module.css';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: '📊' },
  { href: '/admin/products', label: 'Products', icon: '👗' },
  { href: '/admin/banners', label: 'Banners', icon: '🖼️' },
  { href: '/admin/offers', label: 'Offers', icon: '🏷️' },
  { href: '/admin/orders', label: 'Orders', icon: '📦' },
  { href: '/admin/customers', label: 'Customers', icon: '👥' },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarLogo}>
        <span className={styles.sidebarBrand}>RABHTA</span>
        <span className={styles.sidebarRole}>Admin Panel</span>
      </div>

      <nav className={styles.sidebarNav}>
        {navItems.map(item => {
          const active = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navItem} ${active ? styles.navItemActive : ''}`}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className={styles.sidebarFooter}>
        <div className={styles.adminUser}>
          <div className={styles.adminAvatar}>{user?.name?.[0] || 'A'}</div>
          <div>
            <p className={styles.adminName}>{user?.name || 'Admin'}</p>
            <p className={styles.adminEmail}>{user?.email || ''}</p>
          </div>
        </div>
        <div className={styles.sidebarActions}>
          <Link href="/" className={styles.sidebarAction}>View Site</Link>
          <button onClick={logout} className={styles.sidebarAction}>Sign Out</button>
        </div>
      </div>
    </aside>
  );
}
