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
    const isMobile = window.innerWidth <= 768;

    // On mobile ScrollTrigger won't fire — show all elements immediately
    if (prefersReducedMotion || isMobile) {
      gsap.set([badgeRef.current, headingRef.current, descRef.current],
        { opacity: 1, y: 0, filter: "none" });
      return;
    }

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
        padding: "clamp(52px, 10vw, 120px) clamp(20px, 5vw, 24px) clamp(36px, 5vw, 64px)",
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
            The Problem
          </span>
        </div>

        {/* Heading */}
        <h2
          ref={headingRef}
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: "clamp(30px, 6vw, 76px)",
            fontWeight: 400,
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
            color: "var(--color-text-primary)",
            marginBottom: "24px",
            textAlign: "center",
            opacity: 0,
          }}
        >
          AI brand video is here.{" "}
          <em style={{ fontStyle: "italic" }}>The process for it isn&apos;t.</em>
        </h2>

        {/* Description */}
        <p
          ref={descRef}
          style={{
            fontFamily: "var(--font-family)",
            fontSize: "clamp(0.95rem, 1.4vw, 1.25rem)",
            color: "var(--color-text-secondary)",
            lineHeight: 1.7,
            maxWidth: 760,
            margin: "0 auto",
            opacity: 0,
          }}
        >
          Great AI brand content requires more than good prompts. It demands a
          creative system — built for how brands actually work, with the
          guardrails, workflows, and intelligence to go from idea to impact,
          every time.
        </p>
      </div>
    </section>
  );
}
