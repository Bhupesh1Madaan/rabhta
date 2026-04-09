'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useCart } from './CartContext';
import { useAuth } from './AuthContext';
import CartSidebar from './CartSidebar';
import styles from './Navbar.module.css';

const navLinks = [
  { label: 'New In', href: '/products?sort=newest' },
  { label: 'Dresses', href: '/products?category=Dresses' },
  { label: 'Tops & Blouses', href: '/products?category=Tops+%26+Blouses' },
  { label: 'Co-ord Sets', href: '/products?category=Co-ord+Sets' },
  { label: 'Sale', href: '/products?sale=true' },
];

export default function Navbar() {
  const { count, setIsOpen } = useCart();
  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <>
      <nav className={`${styles.nav} ${scrolled ? styles.scrolled : ''}`}>
        {/* Announcement Bar */}
        <div className={styles.announcement}>
          <p>Free shipping on orders above ₹1999 &nbsp;|&nbsp; Use code <strong>RABHTA10</strong> for 10% off your first order</p>
        </div>

        <div className={styles.navInner}>
          {/* Mobile Menu Toggle */}
          <button
            className={styles.mobileToggle}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <span className={`${styles.hamburger} ${mobileOpen ? styles.open : ''}`} />
          </button>

          {/* Logo */}
          <Link href="/" className={styles.logo}>
            <span className={styles.logoText}>RABHTA</span>
            <span className={styles.logoTagline}>WOMEN'S FASHION</span>
          </Link>

          {/* Desktop Nav Links */}
          <div className={styles.navLinks}>
            {navLinks.map(link => (
              <Link key={link.href} href={link.href} className={styles.navLink}>
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Icons */}
          <div className={styles.navActions}>
            <Link href="/products?search=true" className={styles.iconBtn} aria-label="Search">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
            </Link>

            {user ? (
              <div className={styles.userMenu} ref={userMenuRef}>
                <button
                  className={styles.iconBtn}
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  aria-label="Account"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </button>
                {userMenuOpen && (
                  <div className={styles.dropdown}>
                    <div className={styles.dropdownHeader}>
                      <p className={styles.dropdownName}>{user.name}</p>
                      <p className={styles.dropdownEmail}>{user.email}</p>
                    </div>
                    <Link href="/account" className={styles.dropdownItem} onClick={() => setUserMenuOpen(false)}>My Account</Link>
                    <Link href="/account/orders" className={styles.dropdownItem} onClick={() => setUserMenuOpen(false)}>My Orders</Link>
                    {user.role === 'admin' && (
                      <Link href="/admin" className={styles.dropdownItem} onClick={() => setUserMenuOpen(false)}>Admin Panel</Link>
                    )}
                    <button
                      className={`${styles.dropdownItem} ${styles.dropdownLogout}`}
                      onClick={() => { logout(); setUserMenuOpen(false); }}
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/auth/login" className={styles.iconBtn} aria-label="Login">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </Link>
            )}

            <button
              className={styles.cartBtn}
              onClick={() => setIsOpen(true)}
              aria-label="Cart"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
              {count > 0 && <span className={styles.cartBadge}>{count}</span>}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className={styles.mobileMenu}>
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={styles.mobileLink}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className={styles.mobileDivider} />
            {user ? (
              <>
                <Link href="/account" className={styles.mobileLink} onClick={() => setMobileOpen(false)}>My Account</Link>
                <Link href="/account/orders" className={styles.mobileLink} onClick={() => setMobileOpen(false)}>My Orders</Link>
                <button className={styles.mobileLink} onClick={() => { logout(); setMobileOpen(false); }}>Sign Out</button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className={styles.mobileLink} onClick={() => setMobileOpen(false)}>Login</Link>
                <Link href="/auth/register" className={styles.mobileLink} onClick={() => setMobileOpen(false)}>Create Account</Link>
              </>
            )}
          </div>
        )}
      </nav>

      <CartSidebar />
    </>
  );
}
