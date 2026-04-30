"use client";

import { useState, useEffect, useRef } from "react";

// ── math ──────────────────────────────────────────────────────────────────────
const easeInOut = (t: number): number =>
  t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

const phase = (p: number, s: number, e: number): number =>
  easeInOut(Math.max(0, Math.min(1, (p - s) / (e - s))));

// ── card data ─────────────────────────────────────────────────────────────────
interface CardData {
  back: string;
  textColor: string;
  subColor: string;
  border?: string;
  iconSvg: string;
  title: string;
  sub: string;
}

const CARDS: CardData[] = [
  {
    back: "linear-gradient(155deg, #d2d2d2 0%, #b8b8b8 50%, #a4a4a4 100%)",
    textColor: "#161616",
    subColor: "rgba(22,22,22,0.5)",
    iconSvg: `<svg width="26" height="16" viewBox="0 0 26 16" fill="none">
      <path d="M2 12C6 5 10 5 14 9S20 14 24 7" stroke="#161616" stroke-width="1.6" stroke-linecap="round" fill="none"/>
      <path d="M21 4l4 4-4 4" stroke="#161616" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
    title: "Curate &\nIdeate",
    sub: "Discover trends and build context-rich briefs that align your vision seamlessly.",
  },
  {
    back: "linear-gradient(150deg, #e83535 0%, #c41e1e 48%, #8f1010 100%)",
    textColor: "#ffffff",
    subColor: "rgba(255,255,255,0.42)",
    iconSvg: `<svg width="24" height="20" viewBox="0 0 24 20" fill="none">
      <circle cx="9"  cy="6"  r="4" stroke="rgba(255,255,255,0.82)" stroke-width="1.5"/>
      <circle cx="15" cy="6"  r="4" stroke="rgba(255,255,255,0.82)" stroke-width="1.5"/>
      <circle cx="12" cy="14" r="4" stroke="rgba(255,255,255,0.82)" stroke-width="1.5"/>
    </svg>`,
    title: "Generate &\nScale",
    sub: "Instantly produce everything from social hooks to full-scale TV commercials with AI.",
  },
  {
    back: "linear-gradient(150deg, #222222 0%, #1a1a1a 60%, #111111 100%)",
    textColor: "#ffffff",
    subColor: "rgba(255,255,255,0.42)",
    border: "0.5px solid rgba(255,255,255,0.07)",
    iconSvg: `<svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M11 1.5L13 9.5L21 11L13 13L11 21L9 13L1 11L9 9.5Z"
        stroke="rgba(255,255,255,0.5)" stroke-width="1.4" fill="none" stroke-linejoin="round"/>
    </svg>`,
    title: "Build &\nAutomate",
    sub: "Turn your best proprietary workflows into simple, no-code apps to empower your team.",
  },
];

// ── fan layout ────────────────────────────────────────────────────────────────
interface FanEntry { xPct: number; yPct: number; rot: number; z: number }

const FAN: FanEntry[] = [
  { xPct:  0.40, yPct:  0.10, rot: -16, z: 1 },
  { xPct:  0,    yPct: -0.03, rot:   0, z: 2 },
  { xPct: -0.40, yPct:  0.08, rot:  14, z: 3 },
];

const R = 18;

// Auto-trigger thresholds (prog 0→1 over 260vh)
// Split completes at p2=1 → prog=0.75. Trigger fires just past that.
const TRIGGER_ON  = 0.78;
const TRIGGER_OFF = 0.72; // hysteresis so scrolling back up reverses cleanly

// =============================================================================
export default function ScrollCardSplitSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef   = useRef<HTMLDivElement>(null);
  const [prog, setProg]   = useState(0);
  const [dims, setDims]   = useState({ cardW: 0, cardH: 0 });
  // fanned = fan+flip active (CSS-transitioned, NOT scroll-driven)
  const [fanned, setFanned]   = useState(false);
  const fannedRef             = useRef(false); // ref avoids stale-closure in scroll handler
  const lockTimerRef          = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Measure card dimensions for fan offset math
  useEffect(() => {
    const measure = () => {
      if (!stageRef.current) return;
      setDims({
        cardW: stageRef.current.offsetWidth  / 3,
        cardH: stageRef.current.offsetHeight,
      });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // Scroll driver — also handles the auto-trigger threshold
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const onScroll = () => {
      const rect     = el.getBoundingClientRect();
      const total    = el.offsetHeight - window.innerHeight;
      const newProg  = Math.max(0, Math.min(1, -rect.top / total));
      setProg(newProg);

      if (newProg >= TRIGGER_ON && !fannedRef.current) {
        fannedRef.current = true;
        setFanned(true);
        // Stop Lenis so the user can't scroll past while the flip plays.
        // fan (0.55s) + flip delay (0.25s) + flip duration (0.7s) + small buffer = 1050ms
        window.dispatchEvent(new Event('scroll-lock'));
        if (lockTimerRef.current) clearTimeout(lockTimerRef.current);
        lockTimerRef.current = setTimeout(() => {
          window.dispatchEvent(new Event('scroll-unlock'));
          lockTimerRef.current = null;
        }, 1050);
      } else if (newProg < TRIGGER_OFF && fannedRef.current) {
        // User scrolled back up — cancel any pending unlock and release immediately
        if (lockTimerRef.current) {
          clearTimeout(lockTimerRef.current);
          lockTimerRef.current = null;
        }
        window.dispatchEvent(new Event('scroll-unlock'));
        fannedRef.current = false;
        setFanned(false);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Safety: always unlock Lenis and cancel timer on unmount
  useEffect(() => {
    return () => {
      if (lockTimerRef.current) clearTimeout(lockTimerRef.current);
      window.dispatchEvent(new Event('scroll-unlock'));
    };
  }, []);

  // ── scroll-driven values (phases 1 & 2 only) ──────────────────────────────
  // p1 (0.00–0.40): stage scales down
  // p2 (0.40–0.75): cards split apart, inner radii sharpen, orange layer fades
  const p1 = phase(prog, 0.0,  0.40);
  const p2 = phase(prog, 0.40, 0.75);

  const scale        = lerp(1.0, 0.88, p1);
  const innerR       = lerp(0, R, p2);
  const headingP     = phase(prog, 0.08, 0.28);
  const splitPx      = dims.cardW * 0.06 * p2;
  const frontOpacity = p2 < 0.01 ? 1 : Math.max(0, 1 - p2 * 4);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;1,400&family=Inter:wght@300;400;500&display=swap');
        .scs * { box-sizing: border-box; }
        @keyframes scs-nudge {
          0%,100% { opacity:.4; transform:translateY(0); }
          50%     { opacity:.9; transform:translateY(5px); }
        }
      `}</style>

      <section
        ref={sectionRef}
        className="scs"
        style={{
          // 260vh: enough for scale + split + a small scroll buffer after trigger.
          // No wasted scroll — user exits the section naturally after the flip fires.
          height: "260vh",
          position: "relative",
          zIndex: 10,
          backgroundColor: "#070707",
          // Exact same grid as AboutSection
          backgroundImage:
            "radial-gradient(rgba(255, 255, 255, 0.12) 2px, transparent 2px)",
          backgroundSize: "48px 48px",
          backgroundPosition: "center top",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <div
          style={{
            position: "sticky",
            top: 0,
            height: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          {/* ── Heading ─────────────────────────────────────── */}
          <h2
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(22px, 3.5vw, 48px)",
              color: "rgba(240,234,222,1)",
              fontWeight: 400,
              letterSpacing: "-0.2px",
              textAlign: "center",
              marginBottom: "clamp(24px, 4vh, 48px)",
              lineHeight: 1.15,
              opacity: headingP,
              transform: `translateY(${lerp(20, 0, headingP)}px)`,
              willChange: "opacity, transform",
            }}
          >
            One platform <em>for</em> every creative need
          </h2>

          {/* ── Scale wrapper (scroll-driven) ───────────────── */}
          <div
            style={{
              transform: `scale(${scale})`,
              transformOrigin: "center center",
              willChange: "transform",
            }}
          >
            {/* Stage: 6:3 aspect → three 2:3 cards */}
            <div
              ref={stageRef}
              style={{
                position: "relative",
                width: "min(74.8vw, 1154px)",
                aspectRatio: "6 / 3",
              }}
            >
              {/* Solid orange front layer — fades out during p2 */}
              {frontOpacity > 0 && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "url('/assets/grass.png') center / 100% 100% no-repeat",
                    borderRadius: R,
                    zIndex: 10,
                    opacity: frontOpacity,
                    pointerEvents: "none",
                  }}
                />
              )}

              {/* ── Cards ─────────────────────────────────────── */}
              {CARDS.map((card, i) => {
                // Scroll-driven: small outward split push
                const sx =
                  i === 0 ? -splitPx : i === 2 ? splitPx : 0;

                // Auto-triggered fan targets (CSS-transitioned)
                const fx = fanned ? FAN[i].xPct * dims.cardW : 0;
                const fy = fanned ? FAN[i].yPct * dims.cardH : 0;
                const fr = fanned ? FAN[i].rot : 0;

                // Inner border radius changes as cards split
                const radiusFront =
                  i === 0
                    ? `${R}px ${innerR}px ${innerR}px ${R}px`
                    : i === 2
                    ? `${innerR}px ${R}px ${R}px ${innerR}px`
                    : `${innerR}px`;

                return (
                  <div
                    key={i}
                    style={{
                      // Outer: position + split offset (scroll-driven, no transition)
                      position: "absolute",
                      left: `${(i / 3) * 100}%`,
                      top: 0,
                      width: "33.3334%",
                      height: "100%",
                      zIndex: fanned ? FAN[i].z : 0,
                      perspective: "1200px",
                      transform: `translateX(${sx}px)`,
                    }}
                  >
                    {/* Fan wrapper — CSS-transitioned (independent of scroll) */}
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        transformOrigin: "center bottom",
                        transform: `translateX(${fx}px) translateY(${fy}px) rotateZ(${fr}deg)`,
                        transition:
                          "transform 0.55s cubic-bezier(0.16, 1, 0.3, 1)",
                        willChange: "transform",
                      }}
                    >
                      {/* 3D flip — CSS-transitioned, 0.25s delay after fan starts */}
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          position: "relative",
                          transformStyle: "preserve-3d",
                          transform: `rotateY(${fanned ? -180 : 0}deg)`,
                          transition:
                            "transform 0.7s 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
                          willChange: "transform",
                        }}
                      >
                        {/* Front face — image */}
                        <div
                          style={{
                            position: "absolute",
                            inset: 0,
                            backfaceVisibility: "hidden",
                            WebkitBackfaceVisibility: "hidden",
                            background: "url('/assets/grass.png') no-repeat",
                            backgroundSize: "300% 100%",
                            backgroundPosition: `${(i / 2) * 100}% center`,
                            borderRadius: radiusFront,
                          }}
                        />

                        {/* Back face — card content */}
                        <div
                          style={{
                            position: "absolute",
                            inset: 0,
                            backfaceVisibility: "hidden",
                            WebkitBackfaceVisibility: "hidden",
                            transform: "rotateY(-180deg)",
                            background: card.back,
                            border: card.border ?? "none",
                            borderRadius: R,
                            overflow: "hidden",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                            padding: "clamp(16px, 2.2vw, 28px)",
                            color: card.textColor,
                            boxShadow: fanned
                              ? "0 25px 50px rgba(0,0,0,0.5), 0 8px 20px rgba(0,0,0,0.3)"
                              : "none",
                            transition:
                              "box-shadow 0.7s 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
                          }}
                        >
                          <div
                            style={{ opacity: 0.75 }}
                            dangerouslySetInnerHTML={{ __html: card.iconSvg }}
                          />
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 10,
                            }}
                          >
                            <div
                              style={{
                                fontSize: "clamp(16px, 1.8vw, 24px)",
                                fontWeight: 500,
                                lineHeight: 1.15,
                                letterSpacing: "-0.25px",
                                whiteSpace: "pre-line",
                              }}
                            >
                              {card.title}
                            </div>
                            <div
                              style={{
                                fontSize: "clamp(7.5px, 0.8vw, 10.5px)",
                                lineHeight: 1.55,
                                fontWeight: 300,
                                color: card.subColor,
                              }}
                            >
                              {card.sub}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Scroll indicator ────────────────────────────── */}
          <div
            style={{
              position: "absolute",
              bottom: 28,
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 7,
              opacity: prog < 0.04 ? 1 : 0,
              transition: "opacity 0.5s",
              pointerEvents: "none",
              userSelect: "none",
            }}
          >
            <span
              style={{
                fontSize: 8.5,
                letterSpacing: "4px",
                color: "rgba(255,255,255,0.28)",
              }}
            >
              SCROLL
            </span>
            <svg
              width="12"
              height="18"
              viewBox="0 0 12 18"
              fill="none"
              style={{ animation: "scs-nudge 1.8s ease-in-out infinite" }}
            >
              <rect
                x="1" y="1" width="10" height="16" rx="5"
                stroke="rgba(255,255,255,0.3)" strokeWidth="1.2"
              />
              <rect
                x="5" y="4" width="2" height="3.5" rx="1"
                fill="rgba(255,255,255,0.45)"
              />
            </svg>
          </div>
        </div>
      </section>
    </>
  );
}
