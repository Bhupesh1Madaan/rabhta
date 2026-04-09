'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from '../auth.module.css';

function VerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputs = useRef([]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const t = setTimeout(() => setResendCooldown(prev => prev - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [resendCooldown]);

  const handleInput = (val, idx) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[idx] = val;
    setOtp(next);
    if (val && idx < 5) inputs.current[idx + 1]?.focus();
    if (!val && idx > 0) inputs.current[idx - 1]?.focus();
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      inputs.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (paste.length === 6) {
      setOtp(paste.split(''));
      inputs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) { setError('Please enter the complete 6-digit code'); return; }
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: code }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setTimeout(() => router.push('/auth/login'), 2000);
      } else {
        setError(data.error || 'Invalid code');
      }
    } catch {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendCooldown(60);
    await fetch('/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
  };

  return (
    <div className={styles.authPage} style={{ justifyContent: 'center' }}>
      <div className={`${styles.authCard} ${styles.authCardCenter}`}>
        <div className={styles.authHeader}>
          <Link href="/" className={styles.brandName}>RABHTA</Link>
          <div className={styles.emailIcon}>✉️</div>
          <h1 className={styles.authTitle}>Verify your email</h1>
          <p className={styles.authSubtitle}>
            We sent a 6-digit code to<br />
            <strong>{email}</strong>
          </p>
        </div>

        {success ? (
          <div className={styles.successBox}>
            <span style={{ fontSize: '2rem' }}>✅</span>
            <p>Email verified! Redirecting to login...</p>
          </div>
        ) : (
          <form className={styles.authForm} onSubmit={handleSubmit}>
            {error && <div className={styles.errorAlert}>{error}</div>}

            <div className={styles.otpContainer} onPaste={handlePaste}>
              {otp.map((val, i) => (
                <input
                  key={i}
                  ref={el => inputs.current[i] = el}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={val}
                  onChange={e => handleInput(e.target.value, i)}
                  onKeyDown={e => handleKeyDown(e, i)}
                  className={styles.otpInput}
                />
              ))}
            </div>

            <button
              type="submit"
              className={`btn btn-gold btn-full btn-lg ${loading ? 'btn-loading' : ''}`}
              disabled={loading}
            >
              {loading ? '' : 'Verify Email'}
            </button>

            <p className={styles.resendText}>
              Didn't receive the code?{' '}
              {resendCooldown > 0 ? (
                <span style={{ color: 'var(--color-text-muted)' }}>Resend in {resendCooldown}s</span>
              ) : (
                <button type="button" onClick={handleResend} className={styles.authLink}>
                  Resend
                </button>
              )}
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className={styles.authPage}><div className={styles.authCard}><div className="spinner" /></div></div>}>
      <VerifyForm />
    </Suspense>
  );
}
