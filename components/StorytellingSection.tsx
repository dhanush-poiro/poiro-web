"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function StorytellingSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      const baseTrigger = {
        trigger: sectionRef.current,
        start: "top 85%",
        end: "top 30%",
        scrub: 1.2,
      };

      /* Badge */
      gsap.fromTo(
        badgeRef.current,
        { opacity: 0, y: 24, filter: "blur(8px)" },
        { opacity: 1, y: 0, filter: "blur(0px)", ease: "none", scrollTrigger: baseTrigger }
      );

      /* Heading */
      gsap.fromTo(
        headingRef.current,
        { opacity: 0, y: 40, filter: "blur(12px)" },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          ease: "none",
          scrollTrigger: { ...baseTrigger, start: "top 80%", end: "top 25%" },
        }
      );

      /* Description */
      gsap.fromTo(
        descRef.current,
        { opacity: 0, y: 32, filter: "blur(8px)" },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          ease: "none",
          scrollTrigger: { ...baseTrigger, start: "top 75%", end: "top 20%" },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="storytelling"
      style={{
        padding: "120px 24px 48px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--color-bg)",
        position: "relative",
        zIndex: 10,
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          width: "100%",
          margin: "0 auto",
          textAlign: "center",
        }}
      >
        {/* Badge */}
        <div
          ref={badgeRef}
          style={{
            display: "inline-block",
            background: "#ff8015",
            borderRadius: "999px",
            padding: "8px 24px",
            marginBottom: "32px",
            opacity: 0,
            boxShadow: "0 4px 14px rgba(255, 128, 21, 0.4)",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-family)",
              fontSize: "0.80rem",
              textTransform: "uppercase",
              color: "#ffffff",
              letterSpacing: "0.15em",
              fontWeight: 600,
            }}
          >
            The Foundation
          </span>
        </div>

        {/* Heading */}
        <h2
          ref={headingRef}
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: "clamp(40px, 7vw, 80px)",
            fontWeight: 400,
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
            color: "var(--color-text-primary)",
            marginBottom: "24px",
            textAlign: "center",
            opacity: 0,
          }}
        >
          Prompting /= Storytelling
        </h2>

        {/* Description */}
        <p
          ref={descRef}
          style={{
            fontFamily: "var(--font-family)",
            fontSize: "clamp(1rem, 1.5vw, 1.3rem)",
            color: "var(--color-text-secondary)",
            lineHeight: 1.7,
            maxWidth: 800,
            margin: "0 auto",
            opacity: 0,
          }}
        >
          Great brand storytelling is built in layers — like a well-crafted
          burger. Each layer drives identity, engagement, and recall. Poiro
          engineers every layer with precision, so you only need to bring one
          thing: your secret sauce.
        </p>
      </div>
    </section>
  );
}
