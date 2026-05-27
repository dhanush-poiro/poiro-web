"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const STEPS = [
  {
    num: "01",
    title: "Onboarding",
    body: "We set up Poiroscope with your brand guidelines, asset libraries, and approval workflows.",
  },
  {
    num: "02",
    title: "Team Access",
    body: "Your team logs in to a fully configured workspace — ready to go from day one.",
  },
  {
    num: "03",
    title: "Create",
    body: "Brief, generate, and finalise — all within Poiroscope, at your own pace.",
  },
];

const OPTIONS = [
  {
    featured: false,
    badge: null,
    title: "Fully self-serve",
    body: "Your team owns the entire process using Poiroscope's tools and agents — no creative agency needed.",
  },
  {
    featured: true,
    badge: "Most popular",
    title: "Self-serve + White-glove",
    body: "Create in Poiroscope, then hand off to our team — or your own creatives — for final polish and sign-off.",
  },
];

export default function GetStartedSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".gs-anim",
        { opacity: 0, y: 24, filter: "blur(8px)" },
        {
          opacity: 1, y: 0, filter: "blur(0px)",
          stagger: 0.1, ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 82%", end: "top 28%", scrub: 1.1,
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const orange = "#ff8015";
  const border = "rgba(255,255,255,0.07)";

  return (
    <>
      <style>{`
        .gs * { box-sizing: border-box; }
        .gs-step-cell { transition: background 0.25s ease; }
        .gs-step-cell:hover { background: rgba(255,255,255,0.03) !important; }
        .gs-opt-card { transition: border-color 0.25s ease, background 0.25s ease, box-shadow 0.25s ease; }
        .gs-opt-card:not(.gs-opt-featured):hover {
          border-color: rgba(255,255,255,0.18) !important;
          background: rgba(255,255,255,0.03) !important;
        }
        .gs-cta-link { transition: opacity 0.2s ease, transform 0.2s ease; }
        .gs-cta-link:hover { opacity: 0.88; transform: translateY(-2px); }
        @media (max-width: 768px) {
          .gs-steps-row { grid-template-columns: 1fr !important; }
          .gs-step-cell:not(:last-child) { border-right: none !important; border-bottom: 1px solid ${border} !important; }
          .gs-step-arrow { display: none !important; }
          .gs-opts-row { grid-template-columns: 1fr !important; }
          .gs-cta-inner { flex-direction: column !important; text-align: center !important; }
        }
      `}</style>

      <section
        ref={sectionRef}
        id="get-started"
        className="gs"
        style={{
          background: "#050505",
          position: "relative",
          zIndex: 10,
          padding: "clamp(72px, 10vw, 130px) 0 clamp(80px, 11vw, 140px)",
        }}
      >
        <div style={{
          maxWidth: "min(1100px, 90vw)",
          margin: "0 auto",
          padding: "0 24px",
        }}>

          {/* Eyebrow */}
          <div className="gs-anim" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
            <div style={{ width: 16, height: 1.5, background: orange, borderRadius: 2, flexShrink: 0 }} />
            <span style={{
              fontFamily: "var(--font-family)",
              fontSize: 11, fontWeight: 700,
              textTransform: "uppercase", letterSpacing: "1.3px",
              color: orange,
            }}>Get Started</span>
          </div>

          {/* Heading */}
          <h2 className="gs-anim" style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: "clamp(30px, 4vw, 56px)",
            fontWeight: 400, letterSpacing: "-0.02em", lineHeight: 1.1,
            color: "rgba(240,234,222,0.95)", marginBottom: 14,
          }}>
            Up and running in three steps
          </h2>

          {/* Sub */}
          <p className="gs-anim" style={{
            fontFamily: "var(--font-family)",
            fontSize: "clamp(13px, 1.05vw, 16px)",
            color: "rgba(255,255,255,0.35)", lineHeight: 1.7,
            maxWidth: 440, marginBottom: "clamp(36px, 5vw, 52px)",
          }}>
            We configure everything to your brand — then hand over the keys.
          </p>

          {/* Steps row */}
          <div className="gs-steps-row gs-anim" style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            background: "rgba(255,255,255,0.025)",
            border: `1px solid ${border}`,
            borderRadius: 14,
            overflow: "hidden",
            marginBottom: 16,
          }}>
            {STEPS.map((step, i) => (
              <div
                key={i}
                className="gs-step-cell"
                style={{
                  padding: "clamp(24px, 3.2vw, 36px) clamp(20px, 2.8vw, 30px)",
                  position: "relative",
                  borderRight: i < STEPS.length - 1 ? `1px solid ${border}` : "none",
                  background: "transparent",
                }}
              >
                {/* Arrow connector */}
                {i < STEPS.length - 1 && (
                  <div className="gs-step-arrow" style={{
                    position: "absolute", right: -10, top: "50%",
                    transform: "translateY(-50%)",
                    width: 20, height: 20,
                    background: "#0a0a0a",
                    border: `1px solid ${border}`,
                    borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 10, color: orange, fontWeight: 700, zIndex: 2,
                    pointerEvents: "none",
                  }}>
                    →
                  </div>
                )}
                <span style={{
                  display: "block",
                  fontFamily: "var(--font-family)",
                  fontSize: 10, fontWeight: 700,
                  textTransform: "uppercase", letterSpacing: "1.1px",
                  color: orange, marginBottom: 14,
                }}>
                  Step {step.num}
                </span>
                <h4 style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: "clamp(17px, 1.7vw, 22px)",
                  fontWeight: 400, letterSpacing: "-0.01em",
                  color: "rgba(240,234,222,0.92)", marginBottom: 8, margin: "0 0 8px",
                }}>
                  {step.title}
                </h4>
                <p style={{
                  fontFamily: "var(--font-family)",
                  fontSize: "clamp(12px, 0.93vw, 13.5px)",
                  color: "rgba(255,255,255,0.37)", lineHeight: 1.65, margin: 0,
                }}>
                  {step.body}
                </p>
              </div>
            ))}
          </div>

          {/* Option cards */}
          <div className="gs-opts-row gs-anim" style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
            marginBottom: 16,
          }}>
            {OPTIONS.map((opt, i) => (
              <div
                key={i}
                className={`gs-opt-card${opt.featured ? " gs-opt-featured" : ""}`}
                style={{
                  background: opt.featured ? "rgba(255,128,21,0.06)" : "rgba(255,255,255,0.02)",
                  border: `1.5px solid ${opt.featured ? orange : border}`,
                  borderRadius: 14, padding: "clamp(22px, 2.8vw, 32px)",
                }}
              >
                {opt.badge && (
                  <div style={{
                    display: "inline-block",
                    fontFamily: "var(--font-family)",
                    fontSize: 9.5, fontWeight: 700,
                    textTransform: "uppercase", letterSpacing: "0.8px",
                    padding: "3px 9px", borderRadius: 20, marginBottom: 12,
                    background: "rgba(255,128,21,0.10)",
                    color: orange,
                    border: "1px solid rgba(255,128,21,0.22)",
                  }}>
                    {opt.badge}
                  </div>
                )}
                <h4 style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: "clamp(17px, 1.6vw, 21px)",
                  fontWeight: 400, letterSpacing: "-0.01em",
                  color: "rgba(240,234,222,0.92)", marginBottom: 8, margin: `${opt.badge ? "0" : "0"} 0 8px`,
                }}>
                  {opt.title}
                </h4>
                <p style={{
                  fontFamily: "var(--font-family)",
                  fontSize: "clamp(12px, 0.93vw, 13.5px)",
                  color: "rgba(255,255,255,0.37)", lineHeight: 1.65, margin: 0,
                }}>
                  {opt.body}
                </p>
              </div>
            ))}
          </div>

          {/* CTA banner */}
          <div className="gs-anim" style={{
            background: "#0d0d0d",
            border: `1px solid ${border}`,
            borderRadius: 20,
            padding: "clamp(32px, 4vw, 48px) clamp(28px, 4vw, 52px)",
            marginTop: 4,
          }}>
            <div className="gs-cta-inner" style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 28,
            }}>
              <div>
                <h3 style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: "clamp(20px, 2.4vw, 30px)",
                  fontWeight: 400, letterSpacing: "-0.01em",
                  color: "#fff", marginBottom: 6, margin: "0 0 6px",
                }}>
                  Ready to see it in action?
                </h3>
                <p style={{
                  fontFamily: "var(--font-family)",
                  fontSize: "clamp(12px, 0.93vw, 14px)",
                  color: "rgba(255,255,255,0.36)", margin: 0, lineHeight: 1.6,
                }}>
                  Get a personalised walkthrough with your brand already in the system.
                </p>
              </div>
              <a
                href="https://calendly.com/sameer-poiro/poiro-introduction-with-founders"
                target="_blank"
                rel="noopener noreferrer"
                className="gs-cta-link"
                style={{
                  flexShrink: 0,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "14px 28px",
                  borderRadius: 10,
                  background: orange,
                  color: "#fff",
                  fontFamily: "var(--font-family)",
                  fontSize: "clamp(13px, 1vw, 14.5px)",
                  fontWeight: 600,
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                  boxShadow: "0 4px 24px rgba(255,128,21,0.3)",
                }}
              >
                Get in Touch
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M2.5 7h9M7.5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            </div>
          </div>

        </div>
      </section>
    </>
  );
}
