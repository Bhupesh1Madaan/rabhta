'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/components/CartContext';
import styles from './page.module.css';

function HeroBanner({ banners }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  if (!banners.length) {
    return (
      <div className={styles.heroFallback}>
        <div className={styles.heroContent}>
          <p className={styles.heroEyebrow}>New Season 2024</p>
          <h1 className={styles.heroTitle}>Elegance<br /><em>Redefined</em></h1>
          <p className={styles.heroSubtitle}>Curated women's western fashion for the modern woman</p>
          <div className={styles.heroCtas}>
            <Link href="/products?sort=newest" className="btn btn-gold btn-lg">Shop New In</Link>
            <Link href="/products" className="btn btn-outline btn-lg">Explore All</Link>
          </div>
        </div>
      </div>
    );
  }

  const banner = banners[current];

  return (
    <div className={styles.hero}>
      {banners.map((b, i) => (
        <div
          key={b.id}
          className={`${styles.heroSlide} ${i === current ? styles.active : ''}`}
          style={{ backgroundImage: `url(${b.imageUrl})` }}
        />
      ))}
      <div className={styles.heroOverlay} />
      <div className={`${styles.heroContent} ${styles.heroContentDark}`}>
        <p className={styles.heroEyebrow}>RABHTA — 2024</p>
        <h1 className={styles.heroTitle} key={current}>
          {banner.title.split(' ').map((word, i) => (
            <span key={i} style={{ animationDelay: `${i * 0.1}s` }}>{word}{' '}</span>
          ))}
        </h1>
        {banner.subtitle && <p className={styles.heroSubtitle}>{banner.subtitle}</p>}
        <div className={styles.heroCtas}>
          {banner.linkUrl && (
            <Link href={banner.linkUrl} className="btn btn-gold btn-lg">
              {banner.buttonText || 'Shop Now'}
            </Link>
          )}
          <Link href="/products" className={`btn btn-lg ${styles.heroBtnOutline}`}>Explore All</Link>
        </div>
      </div>
      {banners.length > 1 && (
        <div className={styles.heroDots}>
          {banners.map((_, i) => (
            <button
              key={i}
              className={`${styles.dot} ${i === current ? styles.dotActive : ''}`}
              onClick={() => setCurrent(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ProductCard({ product }) {
  const { addToCart } = useCart();
  const images = JSON.parse(product.images || '[]');
  const colors = JSON.parse(product.colors || '[]');
  const sizes = JSON.parse(product.sizes || '[]');
  const [hovered, setHovered] = useState(false);
  const [added, setAdded] = useState(false);

  const handleQuickAdd = useCallback((e) => {
    e.preventDefault();
    if (sizes.length > 0 && colors.length > 0) {
      addToCart(product, sizes[0], colors[0].name);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  }, [product, sizes, colors, addToCart]);

  const discount = product.salePrice
    ? Math.round((1 - product.salePrice / product.price) * 100)
    : 0;

  return (
    <Link href={`/products/${product.id}`} className={styles.productCard}>
      <div
        className={styles.productImageWrap}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <img
          src={hovered && images[1] ? images[1] : images[0]}
          alt={product.name}
          className={styles.productImage}
        />
        {discount > 0 && (
          <span className={`badge badge-error ${styles.discountBadge}`}>-{discount}%</span>
        )}
        {product.isFeatured && !product.salePrice && (
          <span className={`badge badge-primary ${styles.featuredBadge}`}>Featured</span>
        )}
        <button
          className={`${styles.quickAdd} ${added ? styles.quickAdded : ''}`}
          onClick={handleQuickAdd}
        >
          {added ? '✓ Added' : 'Quick Add'}
        </button>
      </div>
      <div className={styles.productInfo}>
        <p className={styles.productCategory}>{product.category}</p>
        <h3 className={styles.productName}>{product.name}</h3>
        <div className={styles.productColors}>
          {colors.slice(0, 4).map(c => (
            <span
              key={c.name}
              className={styles.colorDot}
              style={{ background: c.hex }}
              title={c.name}
            />
          ))}
          {colors.length > 4 && <span className={styles.moreColors}>+{colors.length - 4}</span>}
        </div>
        <div className={styles.productPricing}>
          {product.salePrice ? (
            <>
              <span className={styles.salePrice}>{formatPrice(product.salePrice)}</span>
              <span className={styles.originalPrice}>{formatPrice(product.price)}</span>
            </>
          ) : (
            <span className={styles.price}>{formatPrice(product.price)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function HomePage() {
  const [banners, setBanners] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [newIn, setNewIn] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/banners').then(r => r.json()),
      fetch('/api/products?featured=true&limit=6').then(r => r.json()),
      fetch('/api/products?sort=newest&limit=8').then(r => r.json()),
    ]).then(([b, f, n]) => {
      setBanners(b.banners || []);
      setFeatured(f.products || []);
      setNewIn(n.products || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const categories = [
    { name: 'Dresses', img: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600', href: '/products?category=Dresses' },
    { name: 'Tops & Blouses', img: 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=600', href: '/products?category=Tops+%26+Blouses' },
    { name: 'Co-ord Sets', img: 'https://images.unsplash.com/photo-1554568218-0f1715e72254?w=600', href: '/products?category=Co-ord+Sets' },
    { name: 'Outerwear', img: 'https://images.unsplash.com/photo-1548624313-0396c75e4b1a?w=600', href: '/products?category=Outerwear+%26+Jackets' },
    { name: 'Skirts', img: 'https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?w=600', href: '/products?category=Skirts' },
    { name: 'Jeans & Trousers', img: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600', href: '/products?category=Jeans+%26+Trousers' },
  ];

  return (
    <div className={styles.page}>
      <HeroBanner banners={banners} />

      {/* Values Strip */}
      <div className={styles.valuesStrip}>
        <div className="container">
          <div className={styles.values}>
            {[
              { icon: '🚚', label: 'Free Shipping', sub: 'On orders above ₹1999' },
              { icon: '↩️', label: 'Easy Returns', sub: '15-day return policy' },
              { icon: '✨', label: 'Premium Quality', sub: 'Curated with care' },
              { icon: '🔒', label: 'Secure Payments', sub: 'Encrypted checkout' },
            ].map(v => (
              <div key={v.label} className={styles.valueItem}>
                <span className={styles.valueIcon}>{v.icon}</span>
                <div>
                  <p className={styles.valueName}>{v.label}</p>
                  <p className={styles.valueSub}>{v.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Products */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <span className="section-label">Hand-Picked For You</span>
            <h2 className="section-title">Featured Pieces</h2>
            <p className="section-subtitle">Expertly curated styles that define the Rabhta woman</p>
          </div>
          {loading ? (
            <div className={styles.productsGrid}>
              {[...Array(6)].map((_, i) => (
                <div key={i} className={styles.productSkeleton}>
                  <div className={`skeleton ${styles.skeletonImg}`} />
                  <div className={`skeleton ${styles.skeletonLine}`} />
                  <div className={`skeleton ${styles.skeletonLineShort}`} />
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.productsGrid}>
              {featured.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
          <div className={styles.viewAll}>
            <Link href="/products" className="btn btn-outline btn-lg">View All Products</Link>
          </div>
        </div>
      </section>



      {/* Categories */}
      <section className={`section ${styles.categoriesSection}`}>
        <div className="container">
          <div className="section-header">
            <span className="section-label">Browse By</span>
            <h2 className="section-title">Shop By Category</h2>
          </div>
          <div className={styles.categoriesGrid}>
            {categories.map(cat => (
              <Link key={cat.name} href={cat.href} className={styles.categoryCard}>
                <div className={styles.categoryImageWrap}>
                  <img src={cat.img} alt={cat.name} className={styles.categoryImage} />
                  <div className={styles.categoryOverlay} />
                </div>
                <div className={styles.categoryInfo}>
                  <h3 className={styles.categoryName}>{cat.name}</h3>
                  <span className={styles.categoryArrow}>→</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Offer Banner */}
      <section className={styles.offerBanner}>
        <div className="container">
          <div className={styles.offerContent}>
            <p className={styles.offerEyebrow}>EXCLUSIVE OFFER</p>
            <h2 className={styles.offerTitle}>10% Off Your First Order</h2>
            <p className={styles.offerText}>Use code <strong>RABHTA10</strong> at checkout</p>
            <Link href="/auth/register" className="btn btn-gold btn-lg">Create Account & Save</Link>
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <span className="section-label">Just Arrived</span>
            <h2 className="section-title">New In This Week</h2>
          </div>
          {loading ? (
            <div className={styles.productsGrid4}>
              {[...Array(4)].map((_, i) => (
                <div key={i} className={styles.productSkeleton}>
                  <div className={`skeleton ${styles.skeletonImg}`} />
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.productsGrid4}>
              {newIn.slice(0, 4).map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* Instagram-style UGC Section */}
      <section className={styles.ugcSection}>
        <div className="container">
          <div className="section-header">
            <span className="section-label">@rabhta</span>
            <h2 className="section-title">Style Inspiration</h2>
            <p className="section-subtitle">Tag us in your looks for a chance to be featured</p>
          </div>
          <div className={styles.ugcGrid}>
            {[
              'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=500',
              'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500',
              'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=500',
              'https://images.unsplash.com/photo-1573496799652-408c2ac9fe98?w=500',
              'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=500',
              'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=500',
            ].map((img, i) => (
              <div key={i} className={styles.ugcItem}>
                <img src={img} alt="Style inspiration" />
                <div className={styles.ugcHover}>
                  <span>♥</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
