'use client';

import { CartProvider } from '@/components/CartContext';
import { AuthProvider } from '@/components/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import styles from './layout.module.css';

export default function PublicLayout({ children }) {
  return (
    <AuthProvider>
      <CartProvider>
        <div className={styles.layout}>
          <Navbar />
          <main className={styles.main}>
            {children}
          </main>
          <Footer />
        </div>
      </CartProvider>
    </AuthProvider>
  );
}
