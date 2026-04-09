import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.topBar}>
        <div className="container">
          <div className={styles.newsletter}>
            <div>
              <p className={styles.newsletterLabel}>JOIN THE RABHTA CIRCLE</p>
              <h3 className={styles.newsletterTitle}>Be the first to know</h3>
              <p className={styles.newsletterText}>New arrivals, exclusive offers and style inspiration</p>
            </div>
            <form className={styles.newsletterForm} onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Your email address"
                className={styles.newsletterInput}
              />
              <button type="submit" className="btn btn-primary">Subscribe</button>
            </form>
          </div>
        </div>
      </div>

      <div className={styles.main}>
        <div className="container">
          <div className={styles.grid}>
            {/* Brand */}
            <div className={styles.brandCol}>
              <h2 className={styles.logo}>RABHTA</h2>
              <p className={styles.tagline}>WOMEN'S WESTERN FASHION</p>
              <p className={styles.brandDesc}>
                Curated elegance for the modern woman. Each piece crafted with intention, designed to make you feel effortlessly confident.
              </p>
              <div className={styles.socials}>
                <a href="#" aria-label="Instagram" className={styles.socialLink}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <circle cx="12" cy="12" r="4" />
                    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                  </svg>
                </a>
                <a href="#" aria-label="Facebook" className={styles.socialLink}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                  </svg>
                </a>
                <a href="#" aria-label="Pinterest" className={styles.socialLink}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M12 2C6.48 2 2 6.48 2 12c0 4.24 2.65 7.86 6.39 9.29-.09-.78-.17-1.98.04-2.83.18-.77 1.22-5.17 1.22-5.17s-.31-.63-.31-1.56c0-1.46.85-2.55 1.9-2.55.9 0 1.33.67 1.33 1.48 0 .9-.58 2.26-.87 3.51-.25 1.05.52 1.9 1.54 1.9 1.84 0 3.08-2.37 3.08-5.16 0-2.13-1.42-3.62-3.46-3.62-2.36 0-3.74 1.77-3.74 3.59 0 .71.27 1.47.61 1.89.07.08.08.15.06.24-.06.26-.2.83-.23.95-.03.15-.12.18-.27.11-1-.46-1.62-1.9-1.62-3.07 0-2.49 1.81-4.78 5.22-4.78 2.74 0 4.87 1.95 4.87 4.55 0 2.71-1.71 4.89-4.09 4.89-.8 0-1.55-.42-1.8-.91l-.49 1.83c-.18.68-.66 1.53-.98 2.05.74.23 1.53.35 2.34.35 5.52 0 10-4.48 10-10S17.52 2 12 2z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Shop */}
            <div className={styles.linkCol}>
              <h4 className={styles.colTitle}>Shop</h4>
              <ul className={styles.linkList}>
                <li><Link href="/products?sort=newest">New Arrivals</Link></li>
                <li><Link href="/products?category=Dresses">Dresses</Link></li>
                <li><Link href="/products?category=Tops+%26+Blouses">Tops & Blouses</Link></li>
                <li><Link href="/products?category=Co-ord+Sets">Co-ord Sets</Link></li>
                <li><Link href="/products?category=Outerwear+%26+Jackets">Jackets</Link></li>
                <li><Link href="/products?sale=true">Sale</Link></li>
              </ul>
            </div>

            {/* Help */}
            <div className={styles.linkCol}>
              <h4 className={styles.colTitle}>Help</h4>
              <ul className={styles.linkList}>
                <li><Link href="/account/orders">Track Order</Link></li>
                <li><Link href="/help/shipping">Shipping Policy</Link></li>
                <li><Link href="/help/returns">Returns & Exchanges</Link></li>
                <li><Link href="/help/size-guide">Size Guide</Link></li>
                <li><Link href="/help/faq">FAQs</Link></li>
                <li><Link href="/help/contact">Contact Us</Link></li>
              </ul>
            </div>

            {/* Info */}
            <div className={styles.linkCol}>
              <h4 className={styles.colTitle}>Company</h4>
              <ul className={styles.linkList}>
                <li><Link href="/about">About Rabhta</Link></li>
                <li><Link href="/sustainability">Sustainability</Link></li>
                <li><Link href="/careers">Careers</Link></li>
                <li><Link href="/privacy">Privacy Policy</Link></li>
                <li><Link href="/terms">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.bottom}>
        <div className="container">
          <div className={styles.bottomInner}>
            <p className={styles.copyright}>© 2024 Rabhta. All rights reserved.</p>
            <div className={styles.payments}>
              <span className={styles.paymentBadge}>Visa</span>
              <span className={styles.paymentBadge}>Mastercard</span>
              <span className={styles.paymentBadge}>UPI</span>
              <span className={styles.paymentBadge}>GPay</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
