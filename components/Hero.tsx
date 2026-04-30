'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Cormorant_Garamond } from 'next/font/google';
import styles from './Hero.module.css';

gsap.registerPlugin(ScrollTrigger);

/* ── 🛠️ HAND ANIMATION VARIABLES ── */
// Adjust these to tweak how far and from where the hands slide in.
const HANDS_START_POS = {
  left: { x: -80, y: -60 }, // Starts 80px left and 60px up
  right: { x: 80, y: 60 },  // Starts 80px right and 60px down
};
/* ──────────────────────────────── */

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
});

export default function Hero() {
  const sectionRef   = useRef<HTMLElement>(null);
  const cardRef      = useRef<HTMLDivElement>(null);
  const textRef      = useRef<HTMLDivElement>(null);
  const leftHandRef  = useRef<HTMLDivElement>(null);
  const rightHandRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLCanvasElement>(null);

  /* ── Entrance + scroll-back animations ── */
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const card      = cardRef.current;
    const text      = textRef.current;
    const leftHand  = leftHandRef.current;
    const rightHand = rightHandRef.current;
    if (!card || !text || !leftHand || !rightHand) return;

    if (prefersReducedMotion) return;

    /* Card entrance */
    gsap.fromTo(card,
      { scale: 0.96, opacity: 0 },
      { scale: 1, opacity: 1, duration: 1.0, ease: 'power3.out' }
    );

    /* Hands + text stagger in (using fromTo to fix Hot Reload "0 opacity" bugs) */
    const tl = gsap.timeline({ delay: 0.25 });
    
    tl.fromTo(leftHand,
        { x: HANDS_START_POS.left.x, y: HANDS_START_POS.left.y, opacity: 0 },
        { x: 0, y: 0, opacity: 1, duration: 1.3, ease: 'power3.out' }
      )
      .fromTo(rightHand,
        { x: HANDS_START_POS.right.x, y: HANDS_START_POS.right.y, opacity: 0 },
        { x: 0, y: 0, opacity: 1, duration: 1.3, ease: 'power3.out' }, '<0.08'
      )
      .fromTo(Array.from(text.children),
        { y: 48, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, stagger: 0.14, ease: 'power3.out' }, '<0.4'
      );

    /* Scroll-driven scale-back — card shrinks as About slides over it */
    const onScroll = () => {
      const progress = Math.min(1, window.scrollY / window.innerHeight);
      // Fade card out completely once sections have scrolled past it
      const cardOpacity = Math.max(0, 1 - Math.max(0, (progress - 0.55) * 2.5));
      gsap.set(card, {
        scale:        1 - progress * 0.055,
        borderRadius: `${16 + progress * 12}px`,
        opacity:      cardOpacity,
        pointerEvents: cardOpacity < 0.05 ? 'none' : 'auto',
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener('scroll', onScroll);
      tl.kill();
    };
  }, []);

  /* ── Particle effect ── */
  useEffect(() => {
    const canvas = particlesRef.current;
    if (!canvas) return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    type Particle = {
      x: number; y: number;
      vx: number; vy: number;
      size: number; opacity: number;
      life: number; maxLife: number;
    };
    const particles: Particle[] = [];

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const mkParticle = (): Particle => ({
      x:       Math.random() * canvas.width,
      y:       canvas.height * 0.3 + Math.random() * canvas.height * 0.4,
      vx:      (Math.random() - 0.5) * 0.3,
      vy:      -Math.random() * 0.8 - 0.2,
      size:    Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.6 + 0.1,
      life:    0,
      maxLife: Math.random() * 150 + 80,
    });

    for (let i = 0; i < 60; i++) {
      const p = mkParticle();
      p.life = Math.random() * p.maxLife;
      particles.push(p);
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx; p.y += p.vy; p.life++;
        const op = p.opacity * (1 - p.life / p.maxLife);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,128,21,${op})`;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,128,21,${op * 0.15})`;
        ctx.fill();
        if (p.life >= p.maxLife) particles[i] = mkParticle();
      }
      animId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
    };
  }, []);

  return (
    <section ref={sectionRef} className={`${styles.hero} ${cormorant.variable}`} id="hero">
      <div ref={cardRef} className={styles.card}>

        {/* Background image fills the card */}
        <div className={styles.bgWrap}>
          <Image
            src="/assets/hero.png"
            alt=""
            fill
            priority
            quality={100}
            unoptimized
            sizes="100vw"
            className={styles.bgImage}
          />
          <div className={styles.bgOverlay} />
        </div>

        {/* Particles */}
        <canvas ref={particlesRef} className={styles.particles} aria-hidden="true" />

        {/* Hands */}
        <div ref={leftHandRef} className={styles.leftHand}>
          <Image
            src="/assets/leftHand.png"
            alt=""
            width={1200}
            height={896}
            priority
            quality={100}
            unoptimized
            className={styles.handImage}
          />
        </div>
        <div ref={rightHandRef} className={styles.rightHand}>
          <Image
            src="/assets/rightHand.png"
            alt=""
            width={1200}
            height={896}
            priority
            quality={100}
            unoptimized
            className={styles.handImage}
          />
        </div>

        {/* Text */}
        <div ref={textRef} className={styles.content}>
          <h1 className={styles.heading}>
            Engineering Creativity.
          </h1>
          <a href="https://calendly.com/sameer-poiro/poiro-introduction-with-founders" className={styles.ctaBtn} id="hero-cta" target="_blank" rel="noopener noreferrer">
            Book Demo
          </a>
        </div>

        {/* Scroll indicator */}
        <div className={styles.scrollIndicator} aria-hidden="true">
          <div className={styles.scrollLine} />
        </div>

      </div>
    </section>
  );
}
