'use client';

import { useEffect, useState, CSSProperties } from 'react';
import Image from 'next/image';

const NAV_LINKS = [
  { href: '#os-section', label: 'Poiroscope OS' },
  { href: '#gallery',    label: 'Featured Work' },
  { href: '/upload',     label: 'Upload Brief' },
];

const CALENDLY = 'https://calendly.com/sameer-poiro/poiro-introduction-with-founders';

export default function Navbar() {
  const [shrunk,   setShrunk]   = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const checkScroll = () => setShrunk(window.scrollY > window.innerHeight * 0.6);
    const checkSize   = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkSize,   { passive: true });
    checkScroll();
    checkSize();
    return () => {
      window.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkSize);
    };
  }, []);

  /* Lock body scroll while mobile menu is open */
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  /* ── Desktop bar ── */
  const bar: CSSProperties = {
    position:       'fixed',
    top:            isMobile ? 16 : 28,
    left:           '50%',
    transform:      'translateX(-50%)',
    zIndex:         9999,
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'space-between',
    padding:        isMobile ? '9px 14px' : '10px 20px',
    borderRadius:   12,
    width:          isMobile
      ? 'min(92vw, 480px)'
      : shrunk ? 'min(62vw, 820px)' : 'min(90vw, 1260px)',
    transition:     'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
    whiteSpace:     'nowrap',
    background:     'rgba(25, 25, 30, 0.78)',
    backdropFilter: 'blur(24px) saturate(160%)',
    WebkitBackdropFilter: 'blur(24px) saturate(160%)',
    border:         '1px solid rgba(255,255,255,0.10)',
    boxShadow:      '0 8px 32px rgba(0,0,0,0.60)',
  };

  const logoStyle: CSSProperties = {
    display:    'flex',
    alignItems: 'center',
    flexShrink: 0,
  };

  const links: CSSProperties = {
    display:    'flex',
    alignItems: 'center',
    gap:        32,
    listStyle:  'none',
    margin:     '0 auto',
    padding:    0,
  };

  const NAV_FONT = "'Helvetica Neue', Arial, sans-serif";

  const link: CSSProperties = {
    fontFamily:    NAV_FONT,
    fontSize:      14,
    fontWeight:    500,
    color:         'rgba(255,255,255,0.78)',
    letterSpacing: '0.02em',
    textDecoration: 'none',
    transition:    'color 0.15s ease',
  };

  const cta: CSSProperties = {
    flexShrink:    0,
    display:       'inline-flex',
    alignItems:    'center',
    padding:       '8px 16px',
    borderRadius:  8,
    background:    '#ececec',
    border:        '1px solid rgba(255,255,255,0.18)',
    color:         '#0c0c0c',
    fontFamily:    NAV_FONT,
    fontSize:      13,
    fontWeight:    600,
    letterSpacing: '0.01em',
    textDecoration: 'none',
    transition:    'background 0.15s ease',
    cursor:        'pointer',
  };

  /* Hamburger line helper */
  const line = (transform: string, opacity: number = 1): CSSProperties => ({
    width:        22,
    height:       1.5,
    background:   '#fff',
    borderRadius: 2,
    display:      'block',
    transition:   'transform 0.25s ease, opacity 0.2s ease',
    transform,
    opacity,
  });

  return (
    <>
      <style>{`
        @keyframes nav-shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes nav-border-pulse {
          0%, 100% { border-color: rgba(255,255,255,0.22); box-shadow: none; }
          50%       { border-color: rgba(255,255,255,0.52); box-shadow: 0 0 8px rgba(255,255,255,0.1); }
        }
        #nav-cta {
          background: linear-gradient(105deg, #e8e8e8 35%, #fff 50%, #e8e8e8 65%) !important;
          background-size: 250% 100% !important;
          animation: nav-shimmer 3.5s linear infinite !important;
        }
        #nav-access-btn {
          animation: nav-border-pulse 2.5s ease-in-out infinite;
        }
      `}</style>
      <div style={bar} id="navbar">
        {/* Logo */}
        <a
          href="/"
          aria-label="Poiro home"
          style={logoStyle}
          onClick={e => {
            closeMenu();
            if (window.location.pathname === '/') {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
        >
          <Image
            src="/assets/logo.png"
            alt="Poiro"
            width={80}
            height={26}
            priority
            style={{ height: 20, width: 'auto', display: 'block' }}
          />
        </a>

        {/* Desktop: centre links */}
        {!isMobile && (
          <ul style={links} role="list">
            {NAV_LINKS.map(({ href, label }) => (
              <li key={href}><a href={href} style={link}>{label}</a></li>
            ))}
          </ul>
        )}

        {/* Desktop: CTA buttons */}
        {!isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <a href="/get-access" id="nav-access-btn" style={{ ...cta, background: 'transparent', color: 'rgba(255,255,255,0.85)', border: '1px solid rgba(255,255,255,0.22)' }}>
              Get Access
            </a>
            <a href={CALENDLY} target="_blank" rel="noopener noreferrer" style={cta} id="nav-cta">
              Get in Touch
            </a>
          </div>
        )}

        {/* Mobile: hamburger → X */}
        {isMobile && (
          <button
            type="button"
            onClick={() => setMenuOpen(prev => !prev)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            style={{
              display:        'flex',
              flexDirection:  'column',
              gap:            5,
              cursor:         'pointer',
              padding:        '5px 3px',
              background:     'none',
              border:         'none',
              flexShrink:     0,
            }}
          >
            <span style={line(menuOpen ? 'rotate(45deg) translateY(6.5px)'  : 'none')} />
            <span style={line('none', menuOpen ? 0 : 1)} />
            <span style={line(menuOpen ? 'rotate(-45deg) translateY(-6.5px)' : 'none')} />
          </button>
        )}
      </div>

      {/* ── Mobile full-screen overlay ── */}
      {isMobile && (
        <div
          style={{
            position:       'fixed',
            inset:          0,
            zIndex:         9997,
            background:     'rgba(6, 6, 8, 0.97)',
            backdropFilter: 'blur(28px)',
            WebkitBackdropFilter: 'blur(28px)',
            display:        'flex',
            flexDirection:  'column',
            alignItems:     'center',
            justifyContent: 'center',
            pointerEvents:  menuOpen ? 'auto' : 'none',
            opacity:        menuOpen ? 1 : 0,
            transform:      menuOpen ? 'translateY(0)' : 'translateY(-8px)',
            transition:     'opacity 0.28s ease, transform 0.28s ease',
          }}
        >
          {/* Nav links */}
          <nav style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
            {NAV_LINKS.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                onClick={closeMenu}
                style={{
                  fontFamily:     NAV_FONT,
                  fontSize:       'clamp(22px, 6vw, 34px)',
                  fontWeight:     500,
                  color:          'rgba(255,255,255,0.82)',
                  textDecoration: 'none',
                  padding:        '18px 0',
                  letterSpacing:  '0.01em',
                  width:          '100%',
                  textAlign:      'center',
                  borderBottom:   '1px solid rgba(255,255,255,0.06)',
                  transition:     'color 0.15s ease',
                }}
              >
                {label}
              </a>
            ))}
          </nav>

          {/* Mobile CTAs */}
          <div style={{ marginTop: 44, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <a
              href="/get-access"
              onClick={closeMenu}
              style={{
                fontFamily:     NAV_FONT,
                display:        'inline-flex',
                alignItems:     'center',
                padding:        '14px 44px',
                borderRadius:   10,
                background:     'linear-gradient(135deg, #ff8015, #ff4500)',
                color:          '#fff',
                fontSize:       15,
                fontWeight:     600,
                letterSpacing:  '0.01em',
                textDecoration: 'none',
              }}
            >
              Get Access
            </a>
            <a
              href={CALENDLY}
              target="_blank"
              rel="noopener noreferrer"
              onClick={closeMenu}
              style={{
                display:        'inline-flex',
                fontFamily:     NAV_FONT,
                alignItems:     'center',
                padding:        '14px 44px',
                borderRadius:   10,
                background:     '#ececec',
                color:          '#0c0c0c',
                fontSize:       15,
                fontWeight:     600,
                letterSpacing:  '0.01em',
                textDecoration: 'none',
              }}
            >
              Get in Touch
            </a>
          </div>

          {/* Small copyright at bottom */}
          <p style={{
            position:      'absolute',
            bottom:        32,
            fontSize:      11,
            letterSpacing: '0.06em',
            color:         'rgba(255,255,255,0.2)',
            textTransform: 'uppercase',
          }}>
            © 2026 Poiro
          </p>
        </div>
      )}
    </>
  );
}
