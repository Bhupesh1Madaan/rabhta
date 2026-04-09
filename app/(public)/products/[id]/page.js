'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/components/CartContext';
import styles from './product.module.css';

export default function ProductDetailPage(props) {
  const params = use(props.params);
  const { id } = params;
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [activeImage, setActiveImage] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  
  const { addToCart, isOpen, setIsOpen } = useCart();

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => {
        if (!data.product) { notFound(); return; }
        setProduct(data.product);
        const imgs = JSON.parse(data.product.images || '[]');
        if (imgs.length) setActiveImage(imgs[0]);
        
        const sizes = JSON.parse(data.product.sizes || '[]');
        if (sizes.length) setSelectedSize(sizes[0]);
        
        const colors = JSON.parse(data.product.colors || '[]');
        if (colors.length) setSelectedColor(colors[0].name);

        // Fetch related products
        return fetch(`/api/products?category=${encodeURIComponent(data.product.category)}&limit=5`);
      })
      .then(r => r.json())
      .then(data => {
        if (data?.products) {
          setRelated(data.products.filter(p => p.id !== id).slice(0, 4));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="section" style={{ padding: '80px 0', textAlign: 'center' }}>
      <div className="spinner" style={{ margin: '0 auto' }} />
    </div>
  );
  
  if (!product) return (
    <div className="section" style={{ padding: '80px 0', textAlign: 'center' }}>
      <h2>Product not found</h2>
      <Link href="/products" className="btn btn-primary" style={{ marginTop: '20px' }}>Back to Shop</Link>
    </div>
  );

  const images = JSON.parse(product.images || '[]');
  const sizes = JSON.parse(product.sizes || '[]');
  const colors = JSON.parse(product.colors || '[]');

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) {
      alert('Please select size and color'); return;
    }
    addToCart(product, selectedSize, selectedColor);
    setIsOpen(true);
  };

  return (
    <div className="page-wrap">
      {/* Breadcrumb */}
      <div className="container" style={{ padding: '20px 24px', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
        <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>Home</Link>
        <span style={{ margin: '0 8px' }}>/</span>
        <Link href={`/products?category=${encodeURIComponent(product.category)}`} style={{ color: 'inherit', textDecoration: 'none' }}>{product.category}</Link>
        <span style={{ margin: '0 8px' }}>/</span>
        <span style={{ color: 'var(--color-text)' }}>{product.name}</span>
      </div>

      <div className="container" style={{ paddingBottom: '60px' }}>
        <div className={styles.productLayout}>
          {/* Gallery */}
          <div className={styles.gallery}>
            <div className={styles.thumbnails}>
              {images.map((img, i) => (
                <button
                  key={i}
                  className={`${styles.thumbBtn} ${activeImage === img ? styles.thumbActive : ''}`}
                  onClick={() => setActiveImage(img)}
                >
                  <img src={img} alt={`Thumbnail ${i}`} className={styles.thumbImg} />
                </button>
              ))}
            </div>
            <div className={styles.mainImageWrap}>
              {product.salePrice && <span className={`badge badge-error ${styles.badgeAbsolute}`}>Sale</span>}
              <img src={activeImage} alt={product.name} className={styles.mainImage} />
            </div>
          </div>

          {/* Info */}
          <div className={styles.info}>
            <div style={{ marginBottom: '24px' }}>
              <p className={styles.category}>{product.category}</p>
              <h1 className={styles.title}>{product.name}</h1>
              <div className={styles.pricing}>
                {product.salePrice ? (
                  <>
                    <span className={styles.priceSale}>{formatPrice(product.salePrice)}</span>
                    <span className={styles.priceOriginal}>{formatPrice(product.price)}</span>
                  </>
                ) : (
                  <span className={styles.price}>{formatPrice(product.price)}</span>
                )}
              </div>
            </div>

            <div className={styles.description}>
              <p>{product.description}</p>
            </div>

            {/* Colors */}
            {colors.length > 0 && (
              <div className={styles.optionsGroup}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span className={styles.optionLabel}>Color: <span style={{ color: 'var(--color-text)' }}>{selectedColor}</span></span>
                </div>
                <div className={styles.colorOptions}>
                  {colors.map(c => (
                    <button
                      key={c.name}
                      onClick={() => setSelectedColor(c.name)}
                      className={`${styles.colorBtn} ${selectedColor === c.name ? styles.colorActive : ''}`}
                      title={c.name}
                    >
                      <span className={styles.colorSwatch} style={{ background: c.hex }} />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {sizes.length > 0 && (
              <div className={styles.optionsGroup}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span className={styles.optionLabel}>Size</span>
                  <button className={styles.sizeGuideBtn}>Size Guide</button>
                </div>
                <div className={styles.sizeOptions}>
                  {sizes.map(s => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={`${styles.sizeBtn} ${selectedSize === s ? styles.sizeActive : ''}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              className="btn btn-gold btn-full btn-lg"
              style={{ marginTop: '32px' }}
              onClick={handleAddToCart}
            >
              Add to Cart
            </button>

            {/* Accordions (dummy content for realism) */}
            <div className={styles.accordions}>
              <div className={styles.accordion}>
                <h4 className={styles.accordionTitle}>Details & Care</h4>
                <div className={styles.accordionContent}>
                  <ul style={{ paddingLeft: '20px', fontSize: '0.9rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                    <li>Premium imported fabric</li>
                    <li>Designed in-house</li>
                    <li>Dry clean only</li>
                    <li>Do not bleach or tumble dry</li>
                    <li>Cool iron on reverse</li>
                  </ul>
                </div>
              </div>
              <div className={styles.accordion}>
                <h4 className={styles.accordionTitle}>Delivery & Returns</h4>
                <div className={styles.accordionContent}>
                  <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                    Express delivery available. Free shipping on orders over ₹1999.<br/>
                    Returns are accepted within 15 days of delivery.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div style={{ marginTop: '80px', borderTop: '1px solid var(--color-border)', paddingTop: '60px' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', textAlign: 'center', marginBottom: '40px' }}>You May Also Like</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '24px' }}>
              {related.map(r => {
                const rImgs = JSON.parse(r.images || '[]');
                return (
                  <Link key={r.id} href={`/products/${r.id}`} style={{ textDecoration: 'none' }}>
                    <div style={{ aspectRatio: '3/4', borderRadius: '8px', overflow: 'hidden', marginBottom: '16px', background: 'var(--color-surface)' }}>
                      <img src={rImgs[0]} alt={r.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <p style={{ fontSize: '0.75rem', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '4px' }}>{r.category}</p>
                    <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', color: 'var(--color-text)', marginBottom: '4px' }}>{r.name}</p>
                    <p style={{ fontWeight: 600, color: 'var(--color-text)' }}>{formatPrice(r.salePrice || r.price)}</p>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
