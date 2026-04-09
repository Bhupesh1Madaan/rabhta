'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/components/CartContext';
import { useAuth } from '@/components/AuthContext';
import { formatPrice } from '@/lib/utils';
import styles from './checkout.module.css';

export default function CheckoutPage() {
  const router = useRouter();
  const { items: cart, total: totalAmount, clearCart } = useCart();
  const { user } = useAuth();
  
  const [form, setForm] = useState({
    line1: '', city: '', state: '', pincode: '', phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const mapRef = useRef(null);
  const inputRef = useRef(null);
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);

  // Initialize map and autocomplete
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY) return;
    
    const initMap = async () => {
      if (!window.google) {
        await new Promise((resolve) => {
          const script = document.createElement('script');
          script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}&libraries=places&v=weekly`;
          script.async = true;
          script.onload = resolve;
          document.head.appendChild(script);
        });
      }

      try {
        const maps = window.google.maps;
        const defaultLocation = { lat: 28.6139, lng: 77.2090 }; // New Delhi

        const newMap = new maps.Map(mapRef.current, {
          center: defaultLocation,
          zoom: 12,
          disableDefaultUI: true,
          zoomControl: true,
        });

        const newMarker = new maps.Marker({
          map: newMap,
          position: defaultLocation,
        });

        setMap(newMap);
        setMarker(newMarker);

        const autocomplete = new maps.places.Autocomplete(inputRef.current, {
          fields: ["geometry", "name", "address_components", "formatted_address"],
          componentRestrictions: { country: "in" }
        });

        autocomplete.addListener("place_changed", () => {
          const place = autocomplete.getPlace();
          if (!place.geometry || !place.geometry.location) return;

          newMap.setCenter(place.geometry.location);
          newMap.setZoom(17);
          newMarker.position = place.geometry.location;

          // Parse address components
          let street = '';
          let city = '';
          let state = '';
          let zip = '';

          for (const component of place.address_components) {
            const types = component.types;
            if (types.includes('route') || types.includes('street_number')) {
              street += component.long_name + ' ';
            }
            if (types.includes('locality')) {
              city = component.long_name;
            }
            if (types.includes('administrative_area_level_1')) {
              state = component.long_name;
            }
            if (types.includes('postal_code')) {
              zip = component.long_name;
            }
          }

          setForm(prev => ({
            ...prev,
            line1: place.name !== city ? `${place.name}, ${street}`.trim() : street.trim(),
            city: city || prev.city,
            state: state || prev.state,
            pincode: zip || prev.pincode
          }));
        });

      } catch (e) {
        console.error("Error loading Maps API:", e);
      }
    };

    initMap();
  }, []);

  // Sync auth context
  useEffect(() => {
    if (!user) {
      router.push('/auth/login?redirect=/checkout');
    }
  }, [user, router]);

  // If map clicked, reverse geocode
  useEffect(() => {
    if (!map || !marker) return;
    const listener = map.addListener('click', async (e) => {
      marker.position = e.latLng;
      
      const geocoder = new window.google.maps.Geocoder();
      try {
        const res = await geocoder.geocode({ location: e.latLng });
        if (res.results[0]) {
          const place = res.results[0];
          // Similar component parsing...
          let street = '';
          let city = '';
          let state = '';
          let zip = '';

          for (const component of place.address_components) {
            const types = component.types;
            if (types.includes('route') || types.includes('premise') || types.includes('sublocality')) {
              street += component.long_name + ', ';
            }
            if (types.includes('locality')) {
              city = component.long_name;
            }
            if (types.includes('administrative_area_level_1')) {
              state = component.long_name;
            }
            if (types.includes('postal_code')) {
              zip = component.long_name;
            }
          }

          setForm(prev => ({
            ...prev,
            line1: street.replace(/,\s*$/, ''),
            city: city || prev.city,
            state: state || prev.state,
            pincode: zip || prev.pincode
          }));
        }
      } catch (err) {
        console.error("Geocoding failed:", err);
      }
    });

    return () => window.google.maps.event.removeListener(listener);
  }, [map, marker]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.line1 || !form.city || !form.state || !form.pincode || !form.phone) {
      setError('Please fill in all address details');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map(i => ({ productId: i.id, size: i.selectedSize, color: i.selectedColor, qty: i.qty, price: i.price })),
          address: form,
          subtotal: totalAmount,
          deliveryFee: totalAmount > 1999 ? 0 : 150,
          total: totalAmount + (totalAmount > 1999 ? 0 : 150),
          paymentMethod: 'card'
        })
      });
      const data = await res.json();
      
      if (data.success && data.url) {
        clearCart();
        window.location.href = data.url; // redirect to Stripe
      } else {
        setError(data.error || 'Checkout failed');
        setLoading(false);
      }
    } catch {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="section" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', marginBottom: '16px' }}>Your Cart is Empty</h2>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '24px' }}>Add some elegant pieces to proceed.</p>
        <Link href="/products" className="btn btn-primary">Start Shopping</Link>
      </div>
    );
  }

  if (!user) return <div className="spinner" style={{ margin: '100px auto' }} />;

  return (
    <div className="section" style={{ background: '#F9F9FB', minHeight: '100vh', paddingTop: '40px' }}>
      <div className="container">
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', marginBottom: '32px' }}>Secure Checkout</h1>

        <div className={styles.checkoutLayout}>
          {/* Left Column: Address */}
          <div>
            <div className={styles.checkoutCard}>
              <h2 className={styles.cardTitle}>Shipping Details</h2>
              <p className={styles.cardSubtitle}>Search your location or drag the map</p>

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <input
                  ref={inputRef}
                  className="form-input"
                  style={{ fontSize: '1rem', padding: '12px', background: 'white' }}
                  placeholder="Search your area..."
                />
              </div>

              <div ref={mapRef} className={styles.mapContainer} />

              {error && <div className="alert-error" style={{ marginBottom: '16px', color: 'var(--color-error)' }}>{error}</div>}

              <form className={styles.addressForm}>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Flat / House No. / Building / Street *</label>
                  <input
                    className="form-input"
                    value={form.line1}
                    onChange={e => setForm(p => ({ ...p, line1: e.target.value }))}
                    placeholder="Enter your exact address"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">City *</label>
                  <input
                    className="form-input"
                    value={form.city}
                    onChange={e => setForm(p => ({ ...p, city: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">State *</label>
                  <input
                    className="form-input"
                    value={form.state}
                    onChange={e => setForm(p => ({ ...p, state: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Pincode *</label>
                  <input
                    className="form-input"
                    value={form.pincode}
                    onChange={e => setForm(p => ({ ...p, pincode: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Contact Phone *</label>
                  <input
                    className="form-input"
                    value={form.phone}
                    onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                    placeholder="+91"
                    required
                  />
                </div>
              </form>
            </div>
          </div>

          {/* Right Column: Summary */}
          <div>
            <div className={styles.checkoutCard} style={{ position: 'sticky', top: '100px' }}>
              <h2 className={styles.cardTitle}>Order Summary</h2>
              
              <div className={styles.summaryItems}>
                {cart.map((item, i) => (
                  <div key={i} className={styles.summaryItem}>
                    <div className={styles.itemImageWrap}>
                      <img src={item.image} alt={item.name} />
                      <span className={styles.itemQty}>{item.qty}</span>
                    </div>
                    <div className={styles.itemMeta}>
                      <p className={styles.itemName}>{item.name}</p>
                      <p className={styles.itemVariants}>{item.selectedSize} · {item.selectedColor}</p>
                    </div>
                    <div className={styles.itemPrice}>
                      {formatPrice(item.price * item.qty)}
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles.summaryTotals}>
                <div className={styles.totalRow}>
                  <span>Subtotal</span>
                  <span>{formatPrice(totalAmount)}</span>
                </div>
                <div className={styles.totalRow}>
                  <span>Shipping</span>
                  <span>{totalAmount > 1999 ? 'Free' : formatPrice(150)}</span>
                </div>
                <div className={styles.totalRow} style={{ borderTop: '1px solid var(--color-border)', paddingTop: '16px', marginTop: '16px' }}>
                  <span style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--color-text)' }}>Total</span>
                  <span style={{ fontSize: '1.4rem', fontWeight: 600, color: 'var(--color-primary-dark)' }}>
                    {formatPrice(totalAmount + (totalAmount > 1999 ? 0 : 150))}
                  </span>
                </div>
              </div>

              <button
                className={`btn btn-gold btn-full btn-lg ${loading ? 'btn-loading' : ''}`}
                onClick={handleSubmit}
                disabled={loading}
                style={{ marginTop: '24px' }}
              >
                {loading ? '' : 'Proceed to Payment  →'}
              </button>

              <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                🔒 Payments are securely processed by Stripe.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
