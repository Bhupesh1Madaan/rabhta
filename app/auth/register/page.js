'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from '../auth.module.css';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (data.success) {
        router.push(`/auth/verify?email=${encodeURIComponent(form.email)}`);
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const strength = () => {
    const p = form.password;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  };

  const strengthColors = ['', '#e74c3c', '#e67e22', '#f39c12', '#27ae60'];

  return (
    <div className={styles.authPage}>
      <div className={styles.authCard}>
        <div className={styles.authHeader}>
          <Link href="/" className={styles.brandName}>RABHTA</Link>
          <h1 className={styles.authTitle}>Create an account</h1>
          <p className={styles.authSubtitle}>Join the Rabhta circle for exclusive access</p>
        </div>

        <form className={styles.authForm} onSubmit={handleSubmit}>
          {error && <div className={styles.errorAlert}>{error}</div>}

          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="Your full name"
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              placeholder="your@email.com"
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="At least 8 characters"
              value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              required
            />
            {form.password && (
              <div className={styles.strengthBar}>
                {[1,2,3,4].map(i => (
                  <div
                    key={i}
                    className={styles.strengthSegment}
                    style={{ background: i <= strength() ? strengthColors[strength()] : '#e0e0e0' }}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="Repeat your password"
              value={form.confirmPassword}
              onChange={e => setForm(p => ({ ...p, confirmPassword: e.target.value }))}
              required
            />
          </div>

          <p className={styles.termsNote}>
            By creating an account, you agree to our{' '}
            <Link href="/terms" className={styles.authLink}>Terms of Service</Link>{' '}
            and{' '}
            <Link href="/privacy" className={styles.authLink}>Privacy Policy</Link>
          </p>

          <button
            type="submit"
            className={`btn btn-gold btn-full btn-lg ${loading ? 'btn-loading' : ''}`}
            disabled={loading}
          >
            {loading ? '' : 'Create Account'}
          </button>
        </form>

        <div className={styles.authDivider}><span>already have an account?</span></div>

        <p className={styles.authFooter}>
          <Link href="/auth/login" className={styles.authLink}>Sign in instead</Link>
        </p>
      </div>

      <div className={styles.authDecor}>
        <img
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800"
          alt="Fashion"
        />
        <div className={styles.authDecorOverlay}>
          <blockquote className={styles.authQuote}>
            "Fashion is the armor to survive the reality of everyday life."
            <cite>— Bill Cunningham</cite>
          </blockquote>
        </div>
      </div>
    </div>
  );
}
