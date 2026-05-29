'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const FREE_DOMAINS = new Set([
  'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com',
  'aol.com', 'mail.com', 'protonmail.com', 'ymail.com', 'live.com',
  'msn.com', 'yahoo.co.in', 'rediffmail.com', 'zoho.com',
]);

function isWorkEmail(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase();
  return !!domain && !FREE_DOMAINS.has(domain);
}

export default function GetAccessPage() {
  const [email, setEmail]       = useState('');
  const [error, setError]       = useState('');
  const [status, setStatus]     = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please enter your work email.');
      return;
    }
    if (!isWorkEmail(email)) {
      setError('Please use your work email address.');
      return;
    }

    setStatus('loading');
    try {
      const body = new FormData();
      body.append('email', email);
      body.append('brief', 'Get Access request');
      const res = await fetch('/api/get-access', { method: 'POST', body });
      if (!res.ok) throw new Error('Failed');
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  return (
    <main style={{
      minHeight: '100dvh',
      background: 'var(--color-bg)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'clamp(80px, 12vw, 120px) clamp(20px, 5vw, 48px) clamp(40px, 8vw, 80px)',
    }}>

      {/* Logo */}
      <Link href="/" style={{ marginBottom: 'clamp(40px, 8vw, 72px)', display: 'block' }}>
        <Image src="/assets/logo.png" alt="Poiro" width={100} height={32} priority style={{ height: 28, width: 'auto' }} />
      </Link>

      {/* Card */}
      <div style={{
        width: '100%',
        maxWidth: 480,
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 20,
        padding: 'clamp(32px, 6vw, 52px)',
        boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
      }}>
        {status === 'success' ? (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'rgba(255,128,21,0.12)', border: '1.5px solid #ff8015',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 24px',
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M5 12l5 5L19 7" stroke="#ff8015" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2 style={{
              fontFamily: 'var(--font-cormorant), Georgia, serif',
              fontSize: 'clamp(24px, 4vw, 34px)',
              fontWeight: 400,
              color: '#fff',
              marginBottom: 12,
            }}>
              You&apos;re on the list.
            </h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 16, lineHeight: 1.6 }}>
              We&apos;ll be in touch soon.
            </p>
            <Link href="/" style={{
              display: 'inline-flex', marginTop: 32,
              color: 'var(--color-primary)', fontSize: 14,
              textDecoration: 'underline', textUnderlineOffset: 4,
            }}>
              ← Back to home
            </Link>
          </div>
        ) : (
          <>
            {/* Label */}
            <div style={{
              display: 'inline-block',
              background: '#ff8015',
              borderRadius: 999,
              padding: '6px 18px',
              marginBottom: 24,
              boxShadow: '0 4px 14px rgba(255,128,21,0.35)',
            }}>
              <span style={{
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                color: '#fff',
                letterSpacing: '0.15em',
                fontWeight: 600,
                fontFamily: 'var(--font-cormorant), Georgia, serif',
              }}>
                Early Access
              </span>
            </div>

            <h1 style={{
              fontFamily: 'var(--font-cormorant), Georgia, serif',
              fontSize: 'clamp(28px, 5vw, 42px)',
              fontWeight: 400,
              lineHeight: 1.1,
              color: '#fff',
              marginBottom: 12,
              letterSpacing: '-0.02em',
            }}>
              Get access to<br /><em style={{ fontStyle: 'italic' }}>Poiroscope.</em>
            </h1>
            <p style={{
              color: 'var(--color-text-secondary)',
              fontSize: 15,
              lineHeight: 1.65,
              marginBottom: 32,
            }}>
              The AI-native creative OS for ambitious brands. Enter your work email and we&apos;ll reach out.
            </p>

            <form onSubmit={handleSubmit} noValidate>
              <label htmlFor="work-email" style={{
                display: 'block',
                fontSize: 13,
                fontWeight: 500,
                color: 'var(--color-text-secondary)',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                marginBottom: 8,
              }}>
                Work Email
              </label>
              <input
                id="work-email"
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(''); }}
                placeholder="you@company.com"
                autoComplete="email"
                style={{
                  width: '100%',
                  padding: '14px 18px',
                  background: 'var(--color-surface-raised)',
                  border: `1px solid ${error ? '#ff4444' : 'var(--color-border)'}`,
                  borderRadius: 10,
                  color: '#fff',
                  fontSize: 16,
                  fontFamily: 'var(--font-cormorant), Georgia, serif',
                  outline: 'none',
                  transition: 'border-color 0.2s ease',
                  marginBottom: error ? 8 : 0,
                }}
                onFocus={e => { e.target.style.borderColor = '#ff8015'; }}
                onBlur={e => { e.target.style.borderColor = error ? '#ff4444' : 'var(--color-border)'; }}
              />

              {error && (
                <p style={{ color: '#ff5555', fontSize: 13, marginBottom: 0, lineHeight: 1.4 }}>
                  {error}
                </p>
              )}

              {status === 'error' && (
                <p style={{ color: '#ff5555', fontSize: 13, marginTop: 8, lineHeight: 1.4 }}>
                  Something went wrong. Please try again.
                </p>
              )}

              <button
                type="submit"
                disabled={status === 'loading'}
                className="btn-primary"
                style={{
                  width: '100%',
                  marginTop: 20,
                  justifyContent: 'center',
                  opacity: status === 'loading' ? 0.7 : 1,
                  cursor: status === 'loading' ? 'not-allowed' : 'pointer',
                }}
              >
                {status === 'loading' ? 'Submitting…' : 'Request Access'}
              </button>
            </form>

            <p style={{
              marginTop: 20,
              fontSize: 12,
              color: 'var(--color-text-muted)',
              textAlign: 'center',
              lineHeight: 1.6,
            }}>
              No spam. We&apos;ll only reach out when we&apos;re ready for you.
            </p>
          </>
        )}
      </div>
    </main>
  );
}
