'use client';

import { useCart } from './CartContext';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';
import styles from './CartSidebar.module.css';

export default function CartSidebar() {
  const { items, isOpen, setIsOpen, removeFromCart, updateQty, total, count } = useCart();

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className={styles.overlay}
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
        <div className={styles.header}>
          <div>
            <h3 className={styles.title}>Shopping Bag</h3>
            {count > 0 && <p className={styles.count}>{count} {count === 1 ? 'item' : 'items'}</p>}
          </div>
          <button className={styles.close} onClick={() => setIsOpen(false)} aria-label="Close cart">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className={styles.body}>
          {items.length === 0 ? (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 01-8 0" />
                </svg>
              </div>
              <p className={styles.emptyTitle}>Your bag is empty</p>
              <p className={styles.emptyText}>Add your favourite pieces to get started</p>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setIsOpen(false)}
              >
                <Link href="/products" style={{ color: 'inherit' }}>Shop Now</Link>
              </button>
            </div>
          ) : (
            <div className={styles.items}>
              {items.map(item => (
                <div
                  key={`${item.id}-${item.selectedSize}-${item.selectedColor}`}
                  className={styles.item}
                >
                  <div className={styles.itemImage}>
                    {item.image ? (
                      <img src={item.image} alt={item.name} />
                    ) : (
                      <div className={styles.imagePlaceholder} />
                    )}
                  </div>
                  <div className={styles.itemInfo}>
                    <p className={styles.itemName}>{item.name}</p>
                    <p className={styles.itemVariant}>{item.selectedSize} · {item.selectedColor}</p>
                    <p className={styles.itemPrice}>{formatPrice(item.price)}</p>
                    <div className={styles.itemQty}>
                      <button
                        className={styles.qtyBtn}
                        onClick={() => updateQty(item.id, item.selectedSize, item.selectedColor, item.qty - 1)}
                      >−</button>
                      <span className={styles.qtyValue}>{item.qty}</span>
                      <button
                        className={styles.qtyBtn}
                        onClick={() => updateQty(item.id, item.selectedSize, item.selectedColor, item.qty + 1)}
                      >+</button>
                    </div>
                  </div>
                  <button
                    className={styles.removeBtn}
                    onClick={() => removeFromCart(item.id, item.selectedSize, item.selectedColor)}
                    aria-label="Remove"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className={styles.footer}>
            <div className={styles.subtotal}>
              <span>Subtotal</span>
              <span className={styles.subtotalAmount}>{formatPrice(total)}</span>
            </div>
            <p className={styles.footerNote}>Shipping & taxes calculated at checkout</p>
            <Link href="/checkout" onClick={() => setIsOpen(false)}>
              <button className="btn btn-gold btn-full">
                Proceed to Checkout
              </button>
            </Link>
            <button
              className="btn btn-ghost btn-full btn-sm"
              style={{ marginTop: '8px' }}
              onClick={() => setIsOpen(false)}
            >
              <Link href="/products" style={{ color: 'inherit', width: '100%', textAlign: 'center' }}>
                Continue Shopping
              </Link>
            </button>
          </div>
        )}
      </div>
    </>
  );
}
