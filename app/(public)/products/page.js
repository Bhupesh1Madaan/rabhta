'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CATEGORIES, SIZES, formatPrice } from '@/lib/utils';
import { useCart } from '@/components/CartContext';
import styles from '../page.module.css';

function ProductCard({ product }) {
// ... omitting unchanged content isn't allowed, I'll need to specify exactly what to replace carefully.
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

function ProductsList() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');
  const sortParam = searchParams.get('sort');
  const saleParam = searchParams.get('sale');

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    category: categoryParam || '',
    size: '',
    minPrice: '',
    maxPrice: '',
    sale: saleParam === 'true',
  });
  const [sort, setSort] = useState(sortParam || 'newest');

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    let url = `/api/products?limit=100`;
    if (filters.category) url += `&category=${encodeURIComponent(filters.category)}`;
    if (filters.sale) url += `&sale=true`;
    if (sort) url += `&sort=${sort}`;
    
    try {
      const res = await fetch(url);
      const data = await res.json();
      let results = data.products || [];

      // Client-side filtering for size and price
      if (filters.size) {
        results = results.filter(p => {
          const sizes = JSON.parse(p.sizes || '[]');
          return sizes.includes(filters.size);
        });
      }
      if (filters.minPrice) {
        results = results.filter(p => (p.salePrice || p.price) >= parseInt(filters.minPrice));
      }
      if (filters.maxPrice) {
        results = results.filter(p => (p.salePrice || p.price) <= parseInt(filters.maxPrice));
      }

      setProducts(results);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [filters, sort]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <div className="section" style={{ paddingTop: '40px' }}>
      <div className="container" style={{ display: 'flex', gap: '40px' }}>
        {/* Filters Sidebar */}
        <aside style={{ width: '260px', flexShrink: 0, display: 'none' }} className="d-lg-block">
          <div style={{ position: 'sticky', top: '100px' }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', marginBottom: '24px' }}>Filter By</h3>

            <div style={{ marginBottom: '32px' }}>
              <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', color: 'var(--color-text-muted)' }}>Category</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="radio" name="cat" checked={filters.category === ''} onChange={() => setFilters(p => ({...p, category: ''}))} />
                  <span style={{ fontSize: '0.9rem' }}>All Categories</span>
                </label>
                {CATEGORIES.map(cat => (
                  <label key={cat} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input type="radio" name="cat" checked={filters.category === cat} onChange={() => setFilters(p => ({...p, category: cat}))} />
                    <span style={{ fontSize: '0.9rem' }}>{cat}</span>
                  </label>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '32px' }}>
              <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', color: 'var(--color-text-muted)' }}>Sizes</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {SIZES.map(size => (
                  <button
                    key={size}
                    onClick={() => setFilters(p => ({...p, size: p.size === size ? '' : size}))}
                    style={{
                      padding: '6px 12px',
                      border: `1px solid ${filters.size === size ? 'var(--color-primary)' : 'var(--color-border)'}`,
                      borderRadius: 'var(--radius-sm)',
                      background: filters.size === size ? 'var(--color-primary)' : 'white',
                      color: filters.size === size ? 'white' : 'var(--color-text)',
                      cursor: 'pointer',
                      fontSize: '0.8rem'
                    }}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '32px' }}>
              <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', color: 'var(--color-text-muted)' }}>Price Range</h4>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <input className="form-input" type="number" placeholder="Min" value={filters.minPrice} onChange={e => setFilters(p => ({...p, minPrice: e.target.value}))} style={{ padding: '8px' }} />
                <span>-</span>
                <input className="form-input" type="number" placeholder="Max" value={filters.maxPrice} onChange={e => setFilters(p => ({...p, maxPrice: e.target.value}))} style={{ padding: '8px' }} />
              </div>
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input type="checkbox" checked={filters.sale} onChange={e => setFilters(p => ({...p, sale: e.target.checked}))} />
                <span style={{ fontSize: '0.9rem', color: 'var(--color-primary-dark)', fontWeight: 600 }}>On Sale Only</span>
              </label>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px', borderBottom: '1px solid var(--color-border)', paddingBottom: '16px' }}>
            <div>
              <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', fontWeight: 300 }}>
                {filters.category || (filters.sale ? 'Sale Events' : 'All Products')}
              </h1>
              <p style={{ color: 'var(--color-text-muted)', marginTop: '8px' }}>Showing {products.length} product{products.length !== 1 ? 's' : ''}</p>
            </div>
            <div style={{ width: '200px' }}>
              <select className="form-input" value={sort} onChange={e => setSort(e.target.value)}>
                <option value="newest">Newest Arrivals</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
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
          ) : products.length > 0 ? (
            <div className={styles.productsGrid}>
              {products.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--color-text-muted)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>👗</div>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: 'var(--color-text)', marginBottom: '8px' }}>No products found</h3>
              <p>Try adjusting your filters or browse exploring all categories.</p>
              <button className="btn btn-outline" style={{ marginTop: '24px' }} onClick={() => setFilters({category: '', size: '', minPrice: '', maxPrice: '', sale: false})}>
                Clear All Filters
              </button>
            </div>
          )}
        </main>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @media (min-width: 992px) { .d-lg-block { display: block !important; } }
      `}} />
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="spinner" style={{ margin: '100px auto' }} />}>
      <ProductsList />
    </Suspense>
  );
}
