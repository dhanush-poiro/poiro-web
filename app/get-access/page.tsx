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
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes ga-frame {
          from { opacity: 0; transform: perspective(1600px) rotateY(-7deg) translateX(36px); }
          to   { opacity: 1; transform: perspective(1600px) rotateY(-4deg) translateX(0); }
        }

        .ga-page {
          min-height: 100dvh;
          background: #030303;
          display: grid;
          grid-template-columns: minmax(0, 46fr) minmax(0, 54fr);
          position: relative;
          overflow: hidden;
        }

        /* Ambient warmth — kept low so the page reads as near-black */
        .ga-page::before {
          content: '';
          position: absolute;
          right: -12%; bottom: -22%;
          width: 70vw; height: 70vw;
          background: radial-gradient(circle, rgba(255,128,21,0.09) 0%, transparent 62%);
          pointer-events: none;
        }
        .ga-page::after {
          content: '';
          position: absolute;
          left: -18%; top: -28%;
          width: 50vw; height: 50vw;
          background: radial-gradient(circle, rgba(255,128,21,0.04) 0%, transparent 65%);
          pointer-events: none;
        }

        .ga-left {
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: clamp(110px, 12vh, 150px) clamp(28px, 3.5vw, 56px) clamp(72px, 9vh, 110px) clamp(56px, 8.5vw, 130px);
          position: relative;
          z-index: 1;
          animation: ga-rise 0.9s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        .ga-right {
          display: flex;
          align-items: center;
          padding: clamp(100px, 10vh, 140px) clamp(48px, 7vw, 110px) clamp(72px, 9vh, 110px) clamp(20px, 2.5vw, 44px);
          position: relative;
          z-index: 1;
          animation: ga-frame 1.1s 0.2s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        /* Hairline between columns */
        .ga-seam {
          position: absolute;
          left: 46%; top: 12%; bottom: 12%;
          width: 1px;
          background: linear-gradient(to bottom, transparent, rgba(255,255,255,0.07) 30%, rgba(255,255,255,0.07) 70%, transparent);
          pointer-events: none;
        }

        /* Eyebrow */
        .ga-eyebrow {
          display: flex; align-items: center; gap: 14px;
          margin-bottom: clamp(28px, 3.5vh, 40px);
        }
        .ga-eyebrow-rule {
          width: 28px; height: 1px;
          background: linear-gradient(to right, #ff8015, rgba(255,128,21,0.15));
        }
        .ga-eyebrow-text {
          font-family: var(--font-family, 'Helvetica Neue', Arial, sans-serif);
          font-size: 11px; font-weight: 600;
          letter-spacing: 0.22em; text-transform: uppercase;
          color: rgba(255,128,21,0.85);
        }

        /* Form */
        .ga-field {
          display: flex; align-items: center; gap: 6px;
          padding: 6px;
          border-radius: 14px;
          background: rgba(255,255,255,0.035);
          border: 1px solid rgba(255,255,255,0.10);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.04), 0 18px 50px rgba(0,0,0,0.45);
          transition: border-color 0.25s ease, box-shadow 0.25s ease;
          max-width: 480px;
        }
        .ga-field:focus-within {
          border-color: rgba(255,128,21,0.45);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.04), 0 18px 50px rgba(0,0,0,0.45), 0 0 0 4px rgba(255,128,21,0.07);
        }
        .ga-field.err { border-color: rgba(255,99,99,0.55); }

        .ga-input {
          flex: 1; min-width: 0;
          height: 50px;
          padding: 0 16px;
          background: transparent;
          border: none; outline: none;
          color: #fff;
          font-size: 15px;
          font-family: var(--font-family, 'Helvetica Neue', Arial, sans-serif);
        }
        .ga-input::placeholder { color: rgba(255,255,255,0.28); }

        .ga-submit {
          height: 50px;
          padding: 0 clamp(20px, 2.2vw, 30px);
          border: none; border-radius: 10px;
          background: linear-gradient(135deg, rgba(255,255,255,0.96) 0%, rgba(240,234,222,0.94) 100%);
          color: #0c0c0c;
          font-family: var(--font-cormorant), 'Cormorant Garamond', Georgia, serif;
          font-size: 17px; font-weight: 500; font-style: italic;
          letter-spacing: 0.02em;
          cursor: pointer;
          white-space: nowrap;
          flex-shrink: 0;
          box-shadow: 0 2px 18px rgba(255,255,255,0.10), 0 1px 4px rgba(0,0,0,0.4);
          transition: transform 0.35s cubic-bezier(0.16,1,0.3,1), box-shadow 0.35s cubic-bezier(0.16,1,0.3,1);
        }
        .ga-submit:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 30px rgba(255,255,255,0.18), 0 2px 8px rgba(0,0,0,0.5);
        }
        .ga-submit:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }

        /* Secondary link — inline flow so it wraps naturally on narrow screens */
        .ga-alt {
          display: inline;
          color: rgba(255,255,255,0.45);
          font-family: var(--font-family, 'Helvetica Neue', Arial, sans-serif);
          font-size: 13.5px;
          line-height: 1.9;
          text-decoration: none;
          transition: color 0.2s ease;
        }
        .ga-alt em {
          font-family: var(--font-cormorant), 'Cormorant Garamond', Georgia, serif;
          font-style: italic; font-size: 15px;
          color: rgba(240,234,222,0.75);
          transition: color 0.2s ease;
          margin: 0 6px 0 4px;
        }
        .ga-alt:hover em { color: #ff8015; }
        .ga-alt .ga-alt-arrow {
          display: inline-block;
          transition: transform 0.25s ease;
          color: rgba(255,128,21,0.8);
        }
        .ga-alt:hover .ga-alt-arrow { transform: translateX(3px); }

        /* App frame */
        .ga-frame {
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.10);
          box-shadow:
            0 40px 100px rgba(0,0,0,0.8),
            0 0 0 1px rgba(255,128,21,0.05),
            0 0 80px rgba(255,128,21,0.06);
          position: relative;
          background: #0a0a0a;
        }

        .ga-dot-r { background: #ff5f57; }
        .ga-dot-y { background: #ffbd2e; }
        .ga-dot-g { background: #28c840; }

        @media (max-width: 960px) {
          .ga-page { grid-template-columns: 1fr; }
          .ga-seam { display: none; }
          .ga-left {
            padding: clamp(110px, 16vh, 140px) clamp(24px, 6vw, 48px) clamp(56px, 8vh, 80px);
          }
          .ga-right { display: none; }
        }
        @media (max-width: 480px) {
          .ga-field { flex-direction: column; padding: 8px; gap: 8px; }
          .ga-input { width: 100%; height: 46px; text-align: left; }
          .ga-submit { width: 100%; height: 50px; }
        }
      `}</style>

      <main className="ga-page">
        <div className="ga-seam" />

        {/* ── LEFT: form ── */}
        <div className="ga-left">

          {status === 'success' ? (

            /* Success state */
            <div style={{ maxWidth: 480 }}>
              <div style={{
                width: 60, height: 60, borderRadius: '50%',
                background: 'rgba(255,128,21,0.08)', border: '1px solid rgba(255,128,21,0.45)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 36,
              }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12l5 5L19 7" stroke="#ff8015" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h1 style={{
                fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
                fontSize: 'clamp(42px, 5vw, 64px)',
                fontWeight: 400, lineHeight: 1.05, letterSpacing: '-0.025em',
                color: 'rgba(240,234,222,0.95)', marginBottom: 18,
              }}>
                You&apos;re on<br />
                <em style={{ fontStyle: 'italic', color: '#ff8015' }}>the list.</em>
              </h1>
              <p style={{
                color: 'rgba(255,255,255,0.40)', fontSize: 15.5, lineHeight: 1.7,
                fontFamily: "var(--font-family, 'Helvetica Neue', Arial, sans-serif)", marginBottom: 40,
                maxWidth: 360,
              }}>
                We review every request personally and will reach out as soon as we&apos;re ready for you.
              </p>
              <a href="/" className="ga-alt">
                <span style={{ color: 'rgba(255,128,21,0.8)' }}>←</span>
                <em>Back to home</em>
              </a>
            </div>

          ) : (

            /* Form state */
            <div style={{ maxWidth: 520 }}>

              <div className="ga-eyebrow">
                <span className="ga-eyebrow-rule" />
                <span className="ga-eyebrow-text">Early Access</span>
              </div>

              <h1 style={{
                fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
                fontSize: 'clamp(46px, 5.5vw, 78px)',
                fontWeight: 400, lineHeight: 1.02, letterSpacing: '-0.03em',
                color: 'rgba(240,234,222,0.96)', marginBottom: 22,
              }}>
                Get access to<br />
                <em style={{ fontStyle: 'italic', color: '#ff8015' }}>Poiroscope.</em>
              </h1>

              <p style={{
                fontFamily: "var(--font-family, 'Helvetica Neue', Arial, sans-serif)",
                color: 'rgba(255,255,255,0.38)', fontSize: 15, lineHeight: 1.75,
                marginBottom: 'clamp(32px, 4.5vh, 48px)', maxWidth: 400,
              }}>
                The AI-native creative OS for ambitious brands — from brief to final output, all in one place.
              </p>

              <form onSubmit={handleSubmit} noValidate>
                <div className={`ga-field${error ? ' err' : ''}`}>
                  <input
                    id="work-email"
                    type="email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError(''); }}
                    placeholder="you@company.com"
                    autoComplete="email"
                    className="ga-input"
                    aria-label="Work email"
                  />
                  <button type="submit" disabled={status === 'loading'} className="ga-submit">
                    {status === 'loading' ? 'Sending…' : 'Request Access'}
                  </button>
                </div>

                {error && (
                  <p style={{
                    color: '#ff7d7d', fontSize: 12.5, marginTop: 12, marginBottom: 0,
                    fontFamily: "var(--font-family, 'Helvetica Neue', Arial, sans-serif)",
                  }}>
                    {error}
                  </p>
                )}
                {status === 'error' && (
                  <p style={{
                    color: '#ff7d7d', fontSize: 12.5, marginTop: 12, marginBottom: 0,
                    fontFamily: "var(--font-family, 'Helvetica Neue', Arial, sans-serif)",
                  }}>
                    Something went wrong. Please try again.
                  </p>
                )}

                <p style={{
                  fontFamily: "var(--font-family, 'Helvetica Neue', Arial, sans-serif)",
                  color: 'rgba(255,255,255,0.22)', fontSize: 12, lineHeight: 1.6,
                  marginTop: 16, marginBottom: 0,
                }}>
                  We&apos;ll only use your email to reach out about access.
                </p>
              </form>

              {/* Divider + secondary path */}
              <div style={{
                marginTop: 'clamp(36px, 5.5vh, 56px)',
                paddingTop: 'clamp(24px, 3.5vh, 32px)',
                borderTop: '1px solid rgba(255,255,255,0.06)',
                maxWidth: 480,
              }}>
                <a
                  href="https://calendly.com/sameer-poiro/poiro-introduction-with-founders"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ga-alt"
                >
                  Prefer a walkthrough? <em>Book an intro call with the founders</em>
                  <span className="ga-alt-arrow">→</span>
                </a>
              </div>

            </div>
          )}
        </div>

        {/* ── RIGHT: platform screenshot ── */}
        <div className="ga-right">
          <div style={{ width: '100%', position: 'relative' }}>

            {/* Glow under the frame */}
            <div style={{
              position: 'absolute', bottom: -48, left: '8%', right: '8%', height: 90,
              background: 'radial-gradient(ellipse, rgba(255,128,21,0.20) 0%, transparent 70%)',
              filter: 'blur(24px)',
              pointerEvents: 'none',
            }} />

            <div className="ga-frame">
              {/* Window chrome */}
              <div style={{
                height: 38,
                background: 'rgba(16,16,16,0.98)',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                display: 'flex', alignItems: 'center',
                padding: '0 16px', gap: 7, flexShrink: 0,
              }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%' }} className="ga-dot-r" />
                <div style={{ width: 10, height: 10, borderRadius: '50%' }} className="ga-dot-y" />
                <div style={{ width: 10, height: 10, borderRadius: '50%' }} className="ga-dot-g" />
                <div style={{
                  marginLeft: 14, flex: 1,
                  height: 20, borderRadius: 6,
                  background: 'rgba(255,255,255,0.045)',
                  maxWidth: 230,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{
                    fontFamily: "var(--font-family, 'Helvetica Neue', Arial, sans-serif)",
                    fontSize: 10, letterSpacing: '0.04em',
                    color: 'rgba(255,255,255,0.28)',
                  }}>
                    poiroscope.com
                  </span>
                </div>
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
