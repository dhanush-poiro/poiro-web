"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ScrollStack, { ScrollStackItem } from "@/components/ScrollStack";

gsap.registerPlugin(ScrollTrigger);

const ORANGE = "#ff8015";

const DIFFS = [
  {
    num: "01",
    title: "End-to-end workflow OS",
    body: "From first brief to final export — all in one system. No context-switching, no stitching tools together yourself.",
  },
  {
    num: "02",
    title: "Gets smarter with your brand",
    body: "Poiroscope builds institutional knowledge over time. The more you use it, the sharper and faster your outputs become.",
  },
  {
    num: "03",
    title: "We own the output quality",
    body: "We take accountability for what gets produced. We don't just hand you a canvas and step back — no other platform does that.",
  },
  {
    num: "04",
    title: "One subscription. Everything included.",
    body: "All capabilities & apps under a single plan — no tool juggling, no fragmented vendors, no surprise invoices.",
  },
];

export default function WhyPoiroscopeSection() {
  const whyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.innerWidth <= 768) return;
    const ctx = gsap.context(() => {
      if (whyRef.current) {
        gsap.fromTo(
          whyRef.current.querySelectorAll(".w-anim"),
          { opacity: 0, y: 20, filter: "blur(5px)" },
          {
            opacity: 1, y: 0, filter: "blur(0px)",
            stagger: 0.07, ease: "none",
            scrollTrigger: { trigger: whyRef.current, start: "top 82%", end: "top 32%", scrub: 1 },
          }
        );
      }
    });
    return () => ctx.revert();
  }, []);

  return (
    <section style={{ background: "#060606", position: "relative", zIndex: 10 }}>

      {/* Heading */}
      <div ref={whyRef} style={{
        maxWidth: "min(860px, 90vw)", margin: "0 auto",
        padding: "clamp(72px, 9vw, 120px) clamp(24px, 3vw, 48px) clamp(48px, 6vw, 72px)",
        textAlign: "center",
      }}>
        <div className="w-anim" style={{ marginBottom: 20 }}>
          <div style={{
            display: "inline-block",
            background: ORANGE,
            borderRadius: "999px",
            padding: "8px 24px",
            boxShadow: "0 4px 14px rgba(255,128,21,0.4)",
          }}>
            <span style={{
              fontFamily: "var(--font-family)",
              fontSize: "0.80rem", fontWeight: 600,
              textTransform: "uppercase", letterSpacing: "0.15em",
              color: "#ffffff",
            }}>
              Why Poiroscope
            </span>
          </div>
        </div>
        <h2 className="w-anim" style={{
          fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
          fontSize: "clamp(34px, 4.5vw, 62px)",
          fontWeight: 400, letterSpacing: "-0.02em", lineHeight: 1.08,
          color: "rgba(240,234,222,0.95)", margin: "0 0 16px",
        }}>
          Not just another creator tool
        </h2>
        <p className="w-anim" style={{
          fontFamily: "var(--font-family)",
          fontSize: "clamp(14px, 1.2vw, 18px)",
          color: "rgba(255,255,255,0.32)", lineHeight: 1.72,
          maxWidth: 500, margin: "0 auto",
        }}>
          Most platforms give you model access and wish you luck. We give you a process, a creative system, and accountability for what gets made.
        </p>
      </div>

      {/* ScrollStack cards */}
      <div style={{ maxWidth: "min(860px, 86vw)", margin: "0 auto", paddingBottom: "clamp(80px, 10vw, 140px)" }}>
        <ScrollStack
          useWindowScroll
          itemDistance={100}
          itemStackDistance={30}
          itemScale={0.03}
          baseScale={0.85}
          stackPosition="20%"
          scaleEndPosition="10%"
        >
          {DIFFS.map((d) => (
            <ScrollStackItem key={d.num}>
              <div style={{
                borderRadius: 18,
                background: "linear-gradient(150deg, #141210 0%, #0a0908 100%)",
                border: "1px solid rgba(255,255,255,0.07)",
                boxShadow: "0 28px 80px rgba(0,0,0,0.80), inset 0 1px 0 rgba(255,255,255,0.07)",
                padding: "clamp(40px, 5vw, 60px) clamp(36px, 4.5vw, 56px)",
                display: "flex", flexDirection: "column",
                position: "relative", overflow: "hidden",
                minHeight: "clamp(260px, 28vw, 340px)",
              }}>
                {/* Grid texture */}
                <div style={{
                  position: "absolute", inset: 0, borderRadius: 18, pointerEvents: "none",
                  backgroundImage: "linear-gradient(rgba(255,255,255,0.016) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.016) 1px, transparent 1px)",
                  backgroundSize: "60px 60px",
                }} />
                {/* Warm radial glow */}
                <div style={{
                  position: "absolute", top: -100, left: -80, width: 460, height: 380,
                  background: "radial-gradient(ellipse at center, rgba(255,128,21,0.065) 0%, transparent 68%)",
                  pointerEvents: "none",
                }} />
                {/* Orange top accent */}
                <div style={{
                  position: "absolute", top: 0, left: 0, right: 0, height: 2,
                  background: `linear-gradient(to right, ${ORANGE} 0%, rgba(255,128,21,0.28) 55%, transparent 100%)`,
                  borderRadius: "18px 18px 0 0",
                }} />
                {/* Ghost number watermark */}
                <div style={{
                  position: "absolute",
                  right: "clamp(18px, 3.5vw, 44px)",
                  top: "50%",
                  transform: "translateY(-48%)",
                  fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
                  fontSize: "clamp(130px, 16vw, 220px)",
                  fontWeight: 700,
                  letterSpacing: "-0.07em",
                  lineHeight: 1,
                  color: "rgba(255,255,255,0.036)",
                  userSelect: "none",
                  pointerEvents: "none",
                }}>
                  {d.num}
                </div>

                {/* Content */}
                <div style={{ display: "flex", flexDirection: "column", gap: "clamp(16px, 2vw, 22px)", position: "relative" }}>
                  <span style={{
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    width: 32, height: 32, borderRadius: "50%",
                    background: "rgba(255,128,21,0.10)",
                    border: "1px solid rgba(255,128,21,0.26)",
                    fontFamily: "var(--font-family)", fontSize: 11, fontWeight: 700,
                    letterSpacing: "0.4px", color: ORANGE, alignSelf: "flex-start",
                    flexShrink: 0,
                  }}>
                    {d.num}
                  </span>
                  <h3 style={{
                    fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
                    fontSize: "clamp(28px, 3.2vw, 46px)",
                    fontWeight: 400, letterSpacing: "-0.025em", lineHeight: 1.08,
                    color: "rgba(240,234,222,0.96)", margin: 0,
                  }}>
                    {d.title}
                  </h3>
                  <div style={{
                    width: 36, height: 1.5, borderRadius: 1,
                    background: `linear-gradient(to right, ${ORANGE}, rgba(255,128,21,0.12))`,
                  }} />
                  <p style={{
                    fontFamily: "var(--font-family)",
                    fontSize: "clamp(14px, 1.2vw, 17px)",
                    color: "rgba(255,255,255,0.42)", lineHeight: 1.78, margin: 0,
                  }}>
                    {d.body}
                  </p>
                </div>
              </div>
            </ScrollStackItem>
          ))}
        </ScrollStack>
      </div>
    </section>
  );
}
