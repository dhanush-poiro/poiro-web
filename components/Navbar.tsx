'use client';

import { useEffect, useState, CSSProperties } from 'react';
import Image from 'next/image';

const NAV_LINKS = [
  { href: '#os-section', label: 'Poiroscope OS' },
  { href: '#gallery',    label: 'Featured Work' },
  { href: '#send-idea',  label: 'Upload Brief' },
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

  const link: CSSProperties = {
    fontSize:      13,
    fontWeight:    500,
    color:         'rgba(255,255,255,0.72)',
    letterSpacing: '0.015em',
    textDecoration: 'none',
    transition:    'color 0.15s ease',
  };

  const cta: CSSProperties = {
    flexShrink:    0,
    display:       'inline-flex',
    alignItems:    'center',
    padding:       '8px 18px',
    borderRadius:  8,
    background:    '#ececec',
    border:        '1px solid rgba(255,255,255,0.18)',
    color:         '#0c0c0c',
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
      <div style={bar} id="navbar">
        {/* Logo */}
        <a href="#" aria-label="Poiro home" style={logoStyle} onClick={closeMenu}>
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

        {/* Desktop: CTA button */}
        {!isMobile && (
          <a href={CALENDLY} target="_blank" rel="noopener noreferrer" style={cta} id="nav-cta">
            Get in Touch
          </a>
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
                  fontSize:       'clamp(26px, 7.5vw, 40px)',
                  fontWeight:     500,
                  color:          'rgba(255,255,255,0.82)',
                  textDecoration: 'none',
                  padding:        '18px 0',
                  letterSpacing:  '-0.01em',
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

          {/* Mobile CTA */}
          <a
            href={CALENDLY}
            target="_blank"
            rel="noopener noreferrer"
            onClick={closeMenu}
            style={{
              marginTop:      44,
              display:        'inline-flex',
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
