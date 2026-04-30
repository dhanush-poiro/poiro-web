'use client';

import { useEffect, useState, CSSProperties } from 'react';
import Image from 'next/image';

export default function Navbar() {
  const [shrunk, setShrunk] = useState(false);

  useEffect(() => {
    const check = () => setShrunk(window.scrollY > window.innerHeight * 0.6);
    window.addEventListener('scroll', check, { passive: true });
    check();
    return () => window.removeEventListener('scroll', check);
  }, []);

  const bar: CSSProperties = {
    position:        'fixed',
    top:             28,
    left:            '50%',
    transform:       'translateX(-50%)',
    zIndex:          9999,
    display:         'flex',
    alignItems:      'center',
    justifyContent:  'space-between',
    padding:         '10px 20px',
    borderRadius:    12,
    width:           shrunk ? 'min(58vw, 820px)' : 'min(88vw, 1320px)',
    transition:      'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
    whiteSpace:      'nowrap',
    /* ── Frosted glass — opaque enough to not read through, transparent enough to blur ── */
    background:      'rgba(25, 25, 30, 0.75)',
    backdropFilter:  'blur(24px) saturate(160%)',
    WebkitBackdropFilter: 'blur(24px) saturate(160%)',
    border:          '1px solid rgba(255,255,255,0.10)',
    boxShadow:       '0 8px 32px rgba(0,0,0,0.60)',
  };

  const logo: CSSProperties = {
    display:    'flex',
    alignItems: 'center',
    flexShrink: 0,
    opacity:    1,
    transition: 'opacity 0.15s ease',
  };

  const links: CSSProperties = {
    display:        'flex',
    alignItems:     'center',
    gap:            32,
    listStyle:      'none',
    margin:         '0 auto',
    padding:        0,
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

  return (
    <div style={bar} id="navbar">
      <a href="#" aria-label="Poiro home" style={logo}>
        <Image
          src="/assets/logo.png"
          alt="Poiro"
          width={80}
          height={26}
          priority
          style={{ height: 20, width: 'auto', display: 'block' }}
        />
      </a>

      <ul style={links} role="list">
        <li><a href="#os-section" style={link}>Poiroscope OS</a></li>
        <li><a href="#gallery"    style={link}>Featured Work</a></li>
        <li><a href="#send-idea"  style={link}>Upload Brief</a></li>
      </ul>

      <a href="https://calendly.com/sameer-poiro/poiro-introduction-with-founders" target="_blank" rel="noopener noreferrer" style={cta} id="nav-cta">Get in Touch</a>
    </div>
  );
}
