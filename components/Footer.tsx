'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './Footer.module.css';

gsap.registerPlugin(ScrollTrigger);

export default function Footer() {
  const footerRef    = useRef<HTMLElement>(null);
  const imageWrapRef = useRef<HTMLDivElement>(null);
  const contentRef   = useRef<HTMLDivElement>(null);
  const dividerRef   = useRef<HTMLDivElement>(null);
  const bottomBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const footer    = footerRef.current;
    const imageWrap = imageWrapRef.current;
    const content   = contentRef.current;
    const divider   = dividerRef.current;
    const bottomBar = bottomBarRef.current;
    if (!footer || !imageWrap || !content || !divider || !bottomBar) return;

    if (prefersReducedMotion) {
      gsap.set([...Array.from(content.children), divider, ...Array.from(bottomBar.children)], { opacity: 1, y: 0 });
      return;
    }

    /* ── 1. Intense scroll-driven zoom-out ── */
    gsap.fromTo(
      imageWrap,
      { scale: 1.08 },
      {
        scale: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: footer,
          start: 'top bottom',
          end: 'top 5%',
          scrub: 1.2,
        },
      }
    );

    /* ── 2. Center content — staggered fade+blur+rise, reverses ── */
    gsap.fromTo(
      content.children,
      { opacity: 0, y: 44, filter: 'blur(4px)' },
      {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: 1.0,
        ease: 'power3.out',
        stagger: 0.14,
        scrollTrigger: {
          trigger: footer,
          start: 'top 72%',
          toggleActions: 'play none none reverse',
        },
      }
    );

    /* ── 3. Divider line scales in ── */
    gsap.fromTo(
      divider,
      { opacity: 0, scaleX: 0.4 },
      {
        opacity: 1,
        scaleX: 1,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: footer,
          start: 'top 58%',
          toggleActions: 'play none none reverse',
        },
      }
    );

    /* ── 4. Bottom bar — staggered fade+rise, reverses ── */
    gsap.fromTo(
      bottomBar.children,
      { opacity: 0, y: 14 },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: 'power3.out',
        stagger: 0.09,
        scrollTrigger: {
          trigger: footer,
          start: 'top 55%',
          toggleActions: 'play none none reverse',
        },
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, []);

  return (
    <footer ref={footerRef} className={styles.footer} id="footer">

      {/* Card */}
      <div className={styles.imageContainer}>
        <div ref={imageWrapRef} className={styles.imageWrapper}>
          <Image
            src="/assets/footer.png"
            alt=""
            fill
            quality={100}
            unoptimized
            sizes="100vw"
            className={styles.footerImage}
          />
          <div className={styles.overlay} aria-hidden="true" />

          {/* Centered: tagline + heading + CTA */}
          <div ref={contentRef} className={styles.content}>
            {/* <p className={styles.tagline}>Poiro</p> */}
            <h2 className={styles.heading}>
              Ship <em>more</em>, Spend <em>less</em> <br /> Create without <em>Limits</em>
            </h2>
            <a href="#send-idea" className={styles.ctaButton}>
              Get in Touch
            </a>
          </div>

          {/* Divider line */}
          <div ref={dividerRef} className={styles.divider} aria-hidden="true" />

          {/* Bottom bar — inside the card */}
          <div ref={bottomBarRef} className={styles.bottomBar}>
            <p className={styles.copyright}>© 2026 Poiro&nbsp;|&nbsp;All Rights Reserved</p>
            <nav className={styles.links} aria-label="Footer navigation">
              <a href="#" className={styles.link}>Services</a>
              <a href="#" className={styles.link}>Featured Work</a>
              <a href="#" className={styles.link}>Privacy</a>
            </nav>
          </div>
        </div>
      </div>

    </footer>
  );
}
