"use client";

import { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import CardSwap, { Card, type CardSwapHandle } from "@/components/CardSwap";
import ScrollStack, { ScrollStackItem } from "@/components/ScrollStack";

gsap.registerPlugin(ScrollTrigger);

// ── Content ───────────────────────────────────────────────────────────────────
const PROBLEMS = [
  {
    tag: "Idea to Brief",
    title: "Briefing is still chaos",
    body: "Ideas get lost in translation. Assets scattered across PDFs, WhatsApp, and Drive — every project restarts from zero, with no institutional memory to build on.",
    img: "/os/atlas.webp",
  },
  {
    tag: "Brief to Creative",
    title: "Creation is scattered",
    body: "Storyboarding, prompting, and generation happen across a dozen disconnected tools. Brand consistency — lighting, character, tone — breaks down without a unified flow.",
    img: "/os/infinite-flow.webp",
  },
  {
    tag: "Editing & Finalisation",
    title: "Polish still requires experts",
    body: "Stitching clips, fine-tuning product placement, blending backgrounds — these still bottleneck on specialists and complex tools that most teams don't have.",
    img: "/os/poiro-studio.webp",
  },
  {
    tag: "Infrastructure",
    title: "Custom pipelines are expensive",
    body: "Assembling the right models, pipelines, and guardrails for a specific brand takes months of engineering — resources most creative teams simply don't have.",
    img: "/os/brand-cosmos.webp",
  },
];

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

const ORANGE = "#ff8015";
const N = PROBLEMS.length;

// ── Nav button ────────────────────────────────────────────────────────────────
function NavBtn({ dir, onClick }: { dir: "prev" | "next"; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`lbl-nav lbl-nav-${dir}`}
      aria-label={dir === "prev" ? "Previous" : "Next"}
    >
      {dir === "prev" ? (
        <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
          <path d="M11 4L6 9l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
          <path d="M7 4l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function LayerByLayer() {
  const whyRef      = useRef<HTMLDivElement>(null);
  const cardSwapRef = useRef<CardSwapHandle>(null);

  const [activeIdx, setActiveIdx] = useState(0);
  const [cardW,  setCardW]  = useState(650);
  const [cardH,  setCardH]  = useState(366); // 650 × 9/16
  const [cardDx, setCardDx] = useState(20);
  const [vertDy, setVertDy] = useState(40);

  useEffect(() => {
    const resize = () => {
      const vw = window.innerWidth;
      let w: number, dx: number, dy: number;
      if (vw < 500) {
        dx = 8; dy = 24;
        // Container: min(1200, 92vw) wide, padding: max(16, 3vw)*2 each side
        const avail = Math.round(Math.min(1200, vw * 0.92) - Math.max(16, vw * 0.03) * 2);
        // Card width must leave room for (N-1) horizontal stagger offsets
        w = Math.max(240, avail - dx * 3);
      } else if (vw < 768) {
        dx = 12; dy = 32;
        const avail = Math.round(Math.min(1200, vw * 0.92) - Math.max(16, vw * 0.03) * 2);
        w = Math.max(280, Math.min(520, avail - dx * 3));
      } else if (vw < 1024) {
        w = 520; dx = 16; dy = 36;
      } else {
        w = 650; dx = 20; dy = 40;
      }
      setCardW(w);
      setCardH(Math.round(w * 9 / 16));
      setCardDx(dx);
      setVertDy(dy);
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  // Heading entrance animation for the "Why Poiroscope" area
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
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

  const stackPad = (N - 1) * vertDy;

  return (
    <>
      <style>{`
        .lbl * { box-sizing: border-box; }

        @keyframes lbl-in {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .lbl-anim { animation: lbl-in 0.36s cubic-bezier(0.16,1,0.3,1) both; }

        .lbl-nav {
          width: 46px; height: 46px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.10);
          color: rgba(255,255,255,0.45);
          cursor: pointer; flex-shrink: 0;
          transition: background 0.18s ease, border-color 0.18s ease,
                      color 0.18s ease, transform 0.15s ease;
        }
        .lbl-nav:hover  { background: rgba(255,128,21,0.14); border-color: ${ORANGE}; color: ${ORANGE}; transform: scale(1.07); }
        .lbl-nav:active { transform: scale(0.92); }

        .lbl-dot { height: 5px; border-radius: 99px; border: none; padding: 0; pointer-events: none;
          background: rgba(255,255,255,0.16);
          transition: width 0.32s cubic-bezier(0.16,1,0.3,1), background 0.28s ease; }
        .lbl-dot.on { background: ${ORANGE}; }

        @media (max-width: 860px) {
          .lbl-split { grid-template-columns: 1fr !important; }
          .lbl-cards { order: -1; }
          .lbl-text-col { min-height: auto !important; padding-bottom: clamp(36px, 5vw, 52px) !important; }
          .lbl-card-body { display: none !important; }
          .lbl-controls { padding-top: 28px; }
        }
        @media (max-width: 600px) {
          .lbl-text-col { padding-bottom: 32px !important; }
          .lbl-controls { padding-top: 20px; }
        }
      `}</style>

      {/* ═══ SECTION 1: The Problem — overflow:hidden safe here ══════════════ */}
      <section
        id="problem"
        className="lbl"
        style={{ background: "#060606", position: "relative", zIndex: 10, overflow: "hidden" }}
      >
        {/* Dot background — only this section gets the grid */}
        <div style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.07) 2px, transparent 2px)",
          backgroundSize: "48px 48px",
          backgroundPosition: "center top",
        }}>
          <div style={{
            maxWidth: "min(1200px, 92vw)",
            margin: "0 auto",
            padding: "clamp(60px, 10vw, 130px) clamp(16px, 3vw, 48px) 0",
          }}>

            {/* ── Section header ─────────────────────────────────── */}
            <div style={{ marginBottom: "clamp(48px, 6vw, 80px)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 18 }}>
                <div style={{ width: 16, height: 1.5, background: ORANGE, borderRadius: 2 }} />
                <span style={{
                  fontFamily: "var(--font-family)", fontSize: 11, fontWeight: 700,
                  textTransform: "uppercase", letterSpacing: "1.4px", color: ORANGE,
                }}>
                  The Problem
                </span>
              </div>

              <h2 style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: "clamp(34px, 4.2vw, 64px)",
                fontWeight: 400, letterSpacing: "-0.02em", lineHeight: 1.08,
                color: "rgba(240,234,222,0.95)", margin: "0 0 16px",
              }}>
                AI brand video is here.
                <br />
                <em>The process for it isn&rsquo;t.</em>
              </h2>

              <p style={{
                fontFamily: "var(--font-family)",
                fontSize: "clamp(13px, 1vw, 15.5px)",
                color: "rgba(255,255,255,0.32)", lineHeight: 1.72,
                margin: 0, maxWidth: 480,
              }}>
                Every stage of AI video production carries its own friction — and right now, brands are absorbing all of it.
              </p>
            </div>

            {/* ── Two-column split ───────────────────────────────── */}
            <div
              className="lbl-split"
              style={{
                display: "grid",
                gridTemplateColumns: "36% 1fr",
                gap: "clamp(20px, 2.5vw, 36px)",
                alignItems: "center",
              }}
            >
              {/* Left: animated text + controls */}
              <div className="lbl-text-col" style={{
                display: "flex", flexDirection: "column",
                minHeight: stackPad + cardH,
                paddingBottom: "clamp(40px, 5vw, 60px)",
              }}>
                <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
                  <div key={activeIdx} className="lbl-anim">
                    <span style={{
                      display: "inline-block",
                      fontFamily: "var(--font-family)", fontSize: 10, fontWeight: 700,
                      textTransform: "uppercase", letterSpacing: "1.3px", color: ORANGE,
                      background: "rgba(255,128,21,0.09)",
                      border: "1px solid rgba(255,128,21,0.22)",
                      padding: "3px 11px", borderRadius: 20, marginBottom: 20,
                    }}>
                      {PROBLEMS[activeIdx].tag}
                    </span>

                    <h3 style={{
                      fontFamily: "'Cormorant Garamond', Georgia, serif",
                      fontSize: "clamp(32px, 3.8vw, 56px)",
                      fontWeight: 400, letterSpacing: "-0.025em", lineHeight: 1.08,
                      color: "rgba(240,234,222,0.95)", margin: "0 0 16px",
                    }}>
                      {PROBLEMS[activeIdx].title}
                    </h3>

                    <p style={{
                      fontFamily: "var(--font-family)",
                      fontSize: "clamp(13px, 1vw, 14.5px)",
                      color: "rgba(255,255,255,0.38)", lineHeight: 1.78, margin: 0,
                    }}>
                      {PROBLEMS[activeIdx].body}
                    </p>
                  </div>
                </div>

                <div className="lbl-controls">
                  <div style={{ display: "flex", gap: 5, marginBottom: 18, alignItems: "center" }}>
                    {PROBLEMS.map((_, i) => (
                      <div key={i} className={`lbl-dot${i === activeIdx ? " on" : ""}`}
                        style={{ width: i === activeIdx ? 20 : 5 }} />
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <NavBtn dir="prev" onClick={() => cardSwapRef.current?.swapBack()} />
                    <NavBtn dir="next" onClick={() => cardSwapRef.current?.swapForward()} />
                  </div>
                </div>
              </div>

              {/* Right: card stack */}
              <div
                className="lbl-cards"
                style={{
                  position: "relative",
                  paddingTop: stackPad + 16,
                  paddingBottom: "clamp(48px, 6vw, 80px)",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <CardSwap
                  ref={cardSwapRef}
                  width={cardW}
                  height={cardH}
                  cardDistance={cardDx}
                  verticalDistance={vertDy}
                  delay={5500}
                  pauseOnHover
                  skewAmount={0}
                  easing="power"
                  onSwap={setActiveIdx}
                  skipInitialSwap
                >
                  {PROBLEMS.map((p) => (
                    <Card
                      key={p.tag}
                      style={{
                        borderRadius: 16,
                        backgroundImage: `url(${p.img})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center top",
                        boxShadow: "0 0 0 2.5px rgba(255,255,255,0.17), inset 0 1px 0 rgba(255,255,255,0.20), 0 24px 80px rgba(0,0,0,0.90), 0 8px 28px rgba(0,0,0,0.55)",
                      }}
                    >
                      {/* Bottom-weighted overlay — keeps text readable */}
                      <div style={{
                        position: "absolute", inset: 0, borderRadius: 16,
                        background: "linear-gradient(to bottom, rgba(0,0,0,0.38) 0%, rgba(0,0,0,0.12) 28%, rgba(0,0,0,0.68) 64%, rgba(0,0,0,0.97) 100%)",
                      }} />
                      <div style={{
                        position: "absolute", bottom: 0, left: 0, right: 0,
                        padding: "clamp(16px, 2vw, 24px) clamp(18px, 2.2vw, 26px) clamp(18px, 2.2vw, 26px)",
                      }}>
                        <h3 style={{
                          fontFamily: "'Cormorant Garamond', Georgia, serif",
                          fontSize: "clamp(18px, 1.7vw, 24px)",
                          fontWeight: 400, letterSpacing: "-0.01em", lineHeight: 1.25,
                          color: "rgba(240,234,222,0.92)", margin: "0 0 8px",
                        }}>
                          {p.title}
                        </h3>
                        <p className="lbl-card-body" style={{
                          fontFamily: "var(--font-family)",
                          fontSize: "clamp(11px, 0.82vw, 12.5px)",
                          color: "rgba(255,255,255,0.48)", lineHeight: 1.68, margin: 0,
                        }}>
                          {p.body}
                        </p>
                      </div>
                    </Card>
                  ))}
                </CardSwap>
              </div>
            </div>
          </div>

          {/* Divider inside dot area */}
          <div style={{ maxWidth: "min(1100px, 90vw)", margin: "0 auto", padding: "0 24px" }}>
            <div style={{
              height: 1,
              background: "linear-gradient(to right, transparent, rgba(255,255,255,0.09) 25%, rgba(255,255,255,0.09) 75%, transparent)",
            }} />
          </div>
        </div>
      </section>

      {/* ═══ SECTION 2: Why Poiroscope ══════════════════════════════════════ */}
      <section style={{ background: "#060606", position: "relative", zIndex: 10 }}>

        {/* Heading — normal page flow, above the scroll container */}
        <div ref={whyRef} style={{
          maxWidth: "min(860px, 90vw)", margin: "0 auto",
          padding: "clamp(72px, 9vw, 120px) clamp(24px, 3vw, 48px) clamp(48px, 6vw, 72px)",
          textAlign: "center",
        }}>
          <div className="w-anim" style={{ display: "inline-flex", alignItems: "center", gap: 9, marginBottom: 20 }}>
            <div style={{ width: 16, height: 1.5, background: ORANGE, borderRadius: 2 }} />
            <span style={{
              fontFamily: "var(--font-family)", fontSize: 11, fontWeight: 700,
              textTransform: "uppercase", letterSpacing: "1.4px", color: ORANGE,
            }}>
              Why Poiroscope
            </span>
          </div>
          <h2 className="w-anim" style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: "clamp(34px, 4.5vw, 62px)",
            fontWeight: 400, letterSpacing: "-0.02em", lineHeight: 1.08,
            color: "rgba(240,234,222,0.95)", margin: "0 0 16px",
          }}>
            Not just another creator tool
          </h2>
          <p className="w-anim" style={{
            fontFamily: "var(--font-family)",
            fontSize: "clamp(13px, 1vw, 15.5px)",
            color: "rgba(255,255,255,0.32)", lineHeight: 1.72,
            maxWidth: 500, margin: "0 auto",
          }}>
            Most platforms give you model access and wish you luck. We give you a process, a creative system, and accountability for what gets made.
          </p>
        </div>

        {/* ScrollStack — window scroll drives animation, no isolated container */}
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
                    {/* Subtle grid texture */}
                    <div style={{
                      position: "absolute", inset: 0, borderRadius: 18, pointerEvents: "none",
                      backgroundImage: "linear-gradient(rgba(255,255,255,0.016) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.016) 1px, transparent 1px)",
                      backgroundSize: "60px 60px",
                    }} />
                    {/* Warm radial glow — top-left origin */}
                    <div style={{
                      position: "absolute", top: -100, left: -80, width: 460, height: 380,
                      background: "radial-gradient(ellipse at center, rgba(255,128,21,0.065) 0%, transparent 68%)",
                      pointerEvents: "none",
                    }} />
                    {/* Orange top accent — 2 px, strong to transparent */}
                    <div style={{
                      position: "absolute", top: 0, left: 0, right: 0, height: 2,
                      background: `linear-gradient(to right, ${ORANGE} 0%, rgba(255,128,21,0.28) 55%, transparent 100%)`,
                      borderRadius: "18px 18px 0 0",
                    }} />
                    {/* Giant ghost watermark number */}
                    <div style={{
                      position: "absolute",
                      right: "clamp(18px, 3.5vw, 44px)",
                      top: "50%",
                      transform: "translateY(-48%)",
                      fontFamily: "'Cormorant Garamond', Georgia, serif",
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

                    {/* Content — sits above decorative layers */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "clamp(16px, 2vw, 22px)", position: "relative" }}>
                      {/* Circular number badge */}
                      <span style={{
                        display: "inline-flex", alignItems: "center", justifyContent: "center",
                        width: 32, height: 32, borderRadius: "50%",
                        background: "rgba(255,128,21,0.10)",
                        border: "1px solid rgba(255,128,21,0.26)",
                        fontFamily: "var(--font-family)", fontSize: 10, fontWeight: 700,
                        letterSpacing: "0.4px", color: ORANGE, alignSelf: "flex-start",
                        flexShrink: 0,
                      }}>
                        {d.num}
                      </span>
                      {/* Title */}
                      <h3 style={{
                        fontFamily: "'Cormorant Garamond', Georgia, serif",
                        fontSize: "clamp(28px, 3.2vw, 46px)",
                        fontWeight: 400, letterSpacing: "-0.025em", lineHeight: 1.08,
                        color: "rgba(240,234,222,0.96)", margin: 0,
                      }}>
                        {d.title}
                      </h3>
                      {/* Short orange rule */}
                      <div style={{
                        width: 36, height: 1.5, borderRadius: 1,
                        background: `linear-gradient(to right, ${ORANGE}, rgba(255,128,21,0.12))`,
                      }} />
                      {/* Body */}
                      <p style={{
                        fontFamily: "var(--font-family)",
                        fontSize: "clamp(13px, 1.1vw, 15px)",
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
    </>
  );
}
