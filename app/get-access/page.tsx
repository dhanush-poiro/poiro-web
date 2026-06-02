'use client';

import { useState } from 'react';

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
  const [email, setEmail]   = useState('');
  const [error, setError]   = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email) { setError('Please enter your work email.'); return; }
    if (!isWorkEmail(email)) { setError('Please use your work email address.'); return; }
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
    <>
      <style>{`
        @keyframes ga-rise {
          from { opacity: 0; transform: translateY(32px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes ga-slide {
          from { opacity: 0; transform: translateX(40px); }
          to   { opacity: 1; transform: translateX(0); }
        }

        .ga-page {
          min-height: 100dvh;
          background: #000;
          display: grid;
          grid-template-columns: 1fr 1fr;
          position: relative;
          overflow: hidden;
        }

        /* Ambient glow — bottom-right */
        .ga-page::after {
          content: '';
          position: absolute;
          right: -5%;
          bottom: -15%;
          width: 65vw;
          height: 65vw;
          background: radial-gradient(circle, rgba(255,128,21,0.13) 0%, transparent 60%);
          pointer-events: none;
          z-index: 0;
        }

        .ga-left {
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: clamp(100px, 10vh, 140px) clamp(32px, 4vw, 60px) clamp(60px, 8vh, 100px) clamp(60px, 9vw, 140px);
          position: relative;
          z-index: 1;
          animation: ga-rise 0.9s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        .ga-right {
          display: flex;
          align-items: center;
          padding: clamp(90px, 9vh, 130px) clamp(60px, 9vw, 140px) clamp(60px, 8vh, 100px) clamp(32px, 4vw, 60px);
          position: relative;
          z-index: 1;
          animation: ga-slide 1s 0.15s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        .ga-input {
          flex: 1;
          height: 52px;
          padding: 0 18px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.14);
          border-radius: 10px;
          color: #fff;
          font-size: 15px;
          font-family: "'Helvetica Neue', Arial, sans-serif";
          outline: none;
          transition: border-color 0.2s ease, background 0.2s ease;
          min-width: 0;
        }
        .ga-input::placeholder { color: rgba(255,255,255,0.3); }
        .ga-input:focus {
          border-color: #ff8015;
          background: rgba(255,128,21,0.06);
        }
        .ga-input.err { border-color: #ff4444; }

        .ga-submit {
          height: 52px;
          padding: 0 clamp(18px, 2vw, 28px);
          background: linear-gradient(135deg, #ff8015 0%, #ff4500 100%);
          color: #fff;
          font-family: "'Helvetica Neue', Arial, sans-serif";
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 0.04em;
          border-radius: 10px;
          border: none;
          cursor: pointer;
          white-space: nowrap;
          flex-shrink: 0;
          transition: all 0.2s ease;
          box-shadow: 0 0 24px rgba(255,128,21,0.35);
        }
        .ga-submit:hover {
          transform: translateY(-1px);
          box-shadow: 0 0 36px rgba(255,128,21,0.55);
        }
        .ga-submit:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

        /* Window chrome dot colours */
        .ga-dot-r { background: #ff5f57; }
        .ga-dot-y { background: #ffbd2e; }
        .ga-dot-g { background: #28c840; }

        @media (max-width: 960px) {
          .ga-page { grid-template-columns: 1fr; }
          .ga-left {
            padding: clamp(96px, 14vh, 130px) clamp(24px, 5vw, 48px) clamp(48px, 8vh, 72px);
          }
          .ga-right { display: none; }
        }
        @media (max-width: 480px) {
          .ga-form-row { flex-direction: column !important; }
          .ga-submit { width: 100%; height: 48px; }
          .ga-input { height: 48px; }
        }
      `}</style>

      <main className="ga-page">

        {/* Dot grid — SHOW_DOT_GRID: set to true to re-enable */}
        {false && (
          <div style={{
            position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
            backgroundImage: 'radial-gradient(rgba(255,255,255,0.055) 1.5px, transparent 1.5px)',
            backgroundSize: '44px 44px',
          }} />
        )}

        {/* ── LEFT: form ── */}
        <div className="ga-left">

          {status === 'success' ? (

            /* Success state */
            <div style={{ maxWidth: 480 }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: 'rgba(255,128,21,0.10)', border: '1.5px solid rgba(255,128,21,0.5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 32,
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12l5 5L19 7" stroke="#ff8015" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h1 style={{
                fontFamily: 'var(--font-cormorant), Georgia, serif',
                fontSize: 'clamp(42px, 5vw, 64px)',
                fontWeight: 400, lineHeight: 1.05, letterSpacing: '-0.025em',
                color: '#fff', marginBottom: 16,
              }}>
                You&apos;re on<br />
                <em style={{ fontStyle: 'italic', color: '#ff8015' }}>the list.</em>
              </h1>
              <p style={{
                color: 'rgba(255,255,255,0.42)', fontSize: 16, lineHeight: 1.65,
                fontFamily: "'Helvetica Neue', Arial, sans-serif", marginBottom: 36,
              }}>
                We&apos;ll reach out as soon as we&apos;re ready for you.
              </p>
              <a href="/" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                color: 'rgba(255,255,255,0.55)', fontSize: 14,
                fontFamily: "'Helvetica Neue', Arial, sans-serif",
                textDecoration: 'none', transition: 'color 0.2s ease',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = '#ff8015')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.55)')}
              >
                ← Back to home
              </a>
            </div>

          ) : (

            /* Form state */
            <div style={{ maxWidth: 520 }}>

              {/* Badge */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                marginBottom: 32,
              }}>
                <div style={{
                  width: 6, height: 6, borderRadius: '50%', background: '#ff8015',
                  boxShadow: '0 0 8px #ff8015',
                }} />
                <span style={{
                  fontFamily: "'Helvetica Neue', Arial, sans-serif",
                  fontSize: 11, fontWeight: 600, letterSpacing: '0.14em',
                  textTransform: 'uppercase', color: '#ff8015',
                }}>
                  Early Access
                </span>
              </div>

              {/* Headline */}
              <h1 style={{
                fontFamily: 'var(--font-cormorant), Georgia, serif',
                fontSize: 'clamp(46px, 5.5vw, 76px)',
                fontWeight: 400, lineHeight: 1.0, letterSpacing: '-0.03em',
                color: '#fff', marginBottom: 20,
              }}>
                Get access to<br />
                <em style={{ fontStyle: 'italic', color: '#ff8015' }}>Poiroscope.</em>
              </h1>

              {/* Subtitle */}
              <p style={{
                fontFamily: "'Helvetica Neue', Arial, sans-serif",
                color: 'rgba(255,255,255,0.38)', fontSize: 15, lineHeight: 1.7,
                marginBottom: 36, maxWidth: 400,
              }}>
                The AI-native creative OS for ambitious brands — from brief to final output, all in one place.
              </p>

              {/* Form row */}
              <form onSubmit={handleSubmit} noValidate>
                <div
                  className="ga-form-row"
                  style={{ display: 'flex', gap: 10, marginBottom: error ? 10 : 20 }}
                >
                  <input
                    id="work-email"
                    type="email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError(''); }}
                    placeholder="you@company.com"
                    autoComplete="email"
                    className={`ga-input${error ? ' err' : ''}`}
                    aria-label="Work email"
                  />
                  <button type="submit" disabled={status === 'loading'} className="ga-submit">
                    {status === 'loading' ? 'Sending…' : 'Request Access →'}
                  </button>
                </div>

                {error && (
                  <p style={{
                    color: '#ff6b6b', fontSize: 12, marginBottom: 16,
                    fontFamily: "'Helvetica Neue', Arial, sans-serif",
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                    <span>⚠</span> {error}
                  </p>
                )}
                {status === 'error' && (
                  <p style={{
                    color: '#ff6b6b', fontSize: 12, marginBottom: 16,
                    fontFamily: "'Helvetica Neue', Arial, sans-serif",
                  }}>
                    Something went wrong. Please try again.
                  </p>
                )}
              </form>


            </div>
          )}
        </div>

        {/* ── RIGHT: platform screenshot ── */}
        <div className="ga-right">
          <div style={{ width: '100%', position: 'relative' }}>

            {/* Glow under the frame */}
            <div style={{
              position: 'absolute', bottom: -40, left: '10%', right: '10%', height: 80,
              background: 'radial-gradient(ellipse, rgba(255,128,21,0.25) 0%, transparent 70%)',
              filter: 'blur(20px)',
              pointerEvents: 'none',
            }} />

            {/* Browser / app frame */}
            <div style={{
              borderRadius: 14,
              overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.12)',
              boxShadow: '0 32px 80px rgba(0,0,0,0.75), 0 0 0 1px rgba(255,128,21,0.08)',
              position: 'relative',
            }}>
              {/* Window chrome */}
              <div style={{
                height: 36,
                background: 'rgba(18,18,18,0.98)',
                borderBottom: '1px solid rgba(255,255,255,0.07)',
                display: 'flex', alignItems: 'center',
                padding: '0 14px', gap: 7, flexShrink: 0,
              }}>
                <div style={{ width: 11, height: 11, borderRadius: '50%' }} className="ga-dot-r" />
                <div style={{ width: 11, height: 11, borderRadius: '50%' }} className="ga-dot-y" />
                <div style={{ width: 11, height: 11, borderRadius: '50%' }} className="ga-dot-g" />
                <div style={{
                  marginLeft: 12, flex: 1,
                  height: 20, borderRadius: 5,
                  background: 'rgba(255,255,255,0.05)',
                  maxWidth: 240,
                }} />
              </div>

              {/* Screenshot */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/homepage.png"
                alt="Poiroscope platform"
                style={{ width: '100%', display: 'block', objectFit: 'contain' }}
                onError={e => {
                  (e.currentTarget.closest('.ga-right') as HTMLElement | null)!.style.display = 'none';
                }}
              />
            </div>
          </div>
        </div>

      </main>
    </>
  );
}
