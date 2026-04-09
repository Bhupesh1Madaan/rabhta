'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import styles from '../auth.module.css';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await login(form.email, form.password);
      if (res.success) {
        router.push(res.user?.role === 'admin' ? '/admin' : '/account');
      } else {
        setError(res.error || 'Login failed');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.authCard}>
        <div className={styles.authHeader}>
          <Link href="/" className={styles.brandName}>RABHTA</Link>
          <h1 className={styles.authTitle}>Welcome back</h1>
          <p className={styles.authSubtitle}>Sign in to your account</p>
        </div>

        <form className={styles.authForm} onSubmit={handleSubmit}>
          {error && <div className={styles.errorAlert}>{error}</div>}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              placeholder="your@email.com"
              value={form.email}
              onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
              required
            />
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label">Password</label>
              <Link href="/auth/forgot-password" className={styles.forgotLink}>Forgot password?</Link>
            </div>
            <input
              type="password"
              className="form-input"
              placeholder="Enter your password"
              value={form.password}
              onChange={e => setForm(prev => ({ ...prev, password: e.target.value }))}
              required
            />
          </div>

          <button
            type="submit"
            className={`btn btn-gold btn-full btn-lg ${loading ? 'btn-loading' : ''}`}
            disabled={loading}
          >
            {loading ? '' : 'Sign In'}
          </button>
        </form>

        <div className={styles.authDivider}><span>or</span></div>

        <p className={styles.authFooter}>
          Don't have an account?{' '}
          <Link href="/auth/register" className={styles.authLink}>Create one</Link>
        </p>
      </div>

      <div className={styles.authDecor}>
        <img
          src="https://images.unsplash.com/photo-1558171813-76b16c9b5d53?w=800"
          alt="Fashion"
        />
        <div className={styles.authDecorOverlay}>
          <blockquote className={styles.authQuote}>
            "Style is a way to say who you are without having to speak."
            <cite>— Rachel Zoe</cite>
          </blockquote>
        </div>
      </div>
    </div>
  );
}
