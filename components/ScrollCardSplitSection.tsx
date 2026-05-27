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
    title: "Curation &\nIdeation",
    sub: "Discover trends and build context-rich briefs that align your vision seamlessly.",
  },
  {
    back: "linear-gradient(150deg, #1a2744 0%, #142038 60%, #0d1528 100%)",
    textColor: "#ffffff",
    subColor: "rgba(255,255,255,0.42)",
    border: "0.5px solid rgba(100,130,200,0.2)",
    iconSvg: `<svg width="24" height="20" viewBox="0 0 24 20" fill="none">
      <rect x="2" y="2" width="20" height="16" rx="3" stroke="rgba(255,255,255,0.6)" stroke-width="1.4"/>
      <path d="M7 8h10M7 12h6" stroke="rgba(255,255,255,0.6)" stroke-width="1.4" stroke-linecap="round"/>
    </svg>`,
    title: "Briefing &\nAsset Management",
    sub: "Collaborate on briefs, manage assets and projects with intelligent support.",
  },
  {
    back: "linear-gradient(150deg, #ff8015 0%, #e56d00 48%, #b84d00 100%)",
    textColor: "#ffffff",
    subColor: "rgba(255,255,255,0.5)",
    iconSvg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M12 2L14.5 9H22L16 13.5L18.5 20.5L12 16L5.5 20.5L8 13.5L2 9H9.5Z" stroke="rgba(255,255,255,0.8)" stroke-width="1.4" fill="none" stroke-linejoin="round"/>
    </svg>`,
    title: "Limitless\nOn-Brand Creation",
    sub: "Generate on-brand content at any scale — from hooks to full TVCs.",
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
    title: "Automation &\nScaling",
    sub: "Convert workflows into no-code apps and scale your best creative processes.",
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
    title: "Final\nPolish",
    sub: "AI-powered editing and finishing — precise, pixel-perfect, entirely yours.",
  },
];

// Arc-fan geometry: centre card highest, outer cards curve down
const ARC_ROT     = [-22, -11, 0, 11, 22];           // rotation (degrees)
const ARC_DY_PX   = [200, 65,  0, 65, 200];          // Y drop (outer cards lower = more arc)
const ARC_FX_MULT = [0.35, 0.18, 0, -0.18, -0.35];  // partial X convergence (× cardW)
const FAN_Z       = [1, 2, 3, 4, 5];                 // rightmost card on top

const R = 18; // corner radius (px)

const TRIGGER_ON  = 0.78;
const TRIGGER_OFF = 0.72;

// =============================================================================
export default function ScrollCardSplitSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef   = useRef<HTMLDivElement>(null);
  const [prog, setProg]               = useState(0);
  const [cardW, setCardW]             = useState(0); // one card width in px
  const [fanned, setFanned]           = useState(false);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [overlayReady, setOverlayReady] = useState(true);
  const fannedRef                     = useRef(false);
  const lockTimerRef                  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const overlayTimerRef               = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Measure one card's width whenever the stage resizes
  useEffect(() => {
    const measure = () => {
      if (!stageRef.current) return;
      setCardW(stageRef.current.offsetWidth / 5);
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (stageRef.current) ro.observe(stageRef.current);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const onScroll = () => {
      const rect    = el.getBoundingClientRect();
      const total   = el.offsetHeight - window.innerHeight;
      const newProg = Math.max(0, Math.min(1, -rect.top / total));
      setProg(newProg);

      if (newProg >= TRIGGER_ON && !fannedRef.current) {
        fannedRef.current = true;
        setFanned(true);
        window.dispatchEvent(new Event("scroll-lock"));
        if (lockTimerRef.current) clearTimeout(lockTimerRef.current);
        lockTimerRef.current = setTimeout(() => {
          window.dispatchEvent(new Event("scroll-unlock"));
          lockTimerRef.current = null;
        }, 1100);
      } else if (newProg < TRIGGER_OFF && fannedRef.current) {
        if (lockTimerRef.current) {
          clearTimeout(lockTimerRef.current);
          lockTimerRef.current = null;
        }
        window.dispatchEvent(new Event("scroll-unlock"));
        fannedRef.current = false;
        setFanned(false);
        setHoveredCard(null);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => () => {
    if (lockTimerRef.current) clearTimeout(lockTimerRef.current);
    window.dispatchEvent(new Event("scroll-unlock"));
  }, []);

  // When cards fan out, hide the overlay immediately so the flip is visible.
  // When cards un-fan (fanned → false), delay the overlay until the flip-back
  // animation finishes (~1 s: 0.28 s delay + 0.72 s flip), then fade it in.
  useEffect(() => {
    if (overlayTimerRef.current) clearTimeout(overlayTimerRef.current);
    if (fanned) {
      setOverlayReady(false);
    } else {
      overlayTimerRef.current = setTimeout(() => setOverlayReady(true), 1000);
    }
    return () => {
      if (overlayTimerRef.current) clearTimeout(overlayTimerRef.current);
    };
  }, [fanned]);

  // ── scroll-driven values ──────────────────────────────────────────────────
  const p1 = phase(prog, 0.0,  0.40);
  const p2 = phase(prog, 0.40, 0.75);

  const stageScale   = lerp(1.0, 0.96, p1);
  const innerR       = lerp(0, R, p2);          // inner card corners sharpen as they split
  const headingP     = phase(prog, 0.08, 0.28);
  const splitPx      = cardW * 0.06 * p2;       // outward push during split phase
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
          height: "260vh",
          position: "relative",
          zIndex: 10,
          backgroundColor: "#070707",
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.12) 2px, transparent 2px)",
          backgroundSize: "48px 48px",
          backgroundPosition: "center top",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <div
          style={{
            position: "sticky",
            top: 0,
            height: "100dvh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            overflow: "visible",
            paddingTop: "clamp(52px, 6dvh, 64px)",
            paddingBottom: "clamp(40px, 6dvh, 64px)",
          }}
        >
          {/* ── Heading ──────────────────────────────────────── */}
          <h2
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(20px, 3.2vw, 46px)",
              color: "rgba(240,234,222,1)",
              fontWeight: 400,
              letterSpacing: "-0.2px",
              textAlign: "center",
              marginBottom: "clamp(20px, 3vh, 36px)",
              lineHeight: 1.15,
              opacity: headingP,
              transform: `translateY(${lerp(20, 0, headingP)}px)`,
              willChange: "opacity, transform",
              flexShrink: 0,
              position: "relative",
              zIndex: 20,
            }}
          >
            One platform <em>for</em> every creative need
          </h2>

          {/* ── Scale wrapper ────────────────────────────────── */}
          <div
            style={{
              transform: `scale(${stageScale})`,
              transformOrigin: "center center",
              willChange: "transform",
              width: "100%",
              display: "flex",
              justifyContent: "center",
              flexShrink: 0,
              overflow: "visible",
            }}
          >
            {/*
              Stage — same proportions as the original 3-card layout but for 5 cards.
              Original: aspectRatio 6/3 (= 2:1), three 2:3 cards.
              Here: aspectRatio 10/3, five 2:3 cards side-by-side.
            */}
            <div
              ref={stageRef}
              style={{
                position: "relative",
                width: "min(92vw, 1440px)",
                aspectRatio: "10 / 3",
                overflow: "visible",
              }}
            >
              {/* ── Single front overlay ────────────────────────
                Always in DOM so CSS transition has a "from" value.
                overlayReady=false while flip-back is playing (prevents
                the overlay snapping in on fast upward scroll).             ── */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "url('/assets/grass.png') center / cover no-repeat",
                  borderRadius: R,
                  zIndex: 10,
                  opacity: overlayReady ? frontOpacity : 0,
                  transition: "opacity 0.35s cubic-bezier(0.16,1,0.3,1)",
                  pointerEvents: "none",
                }}
              />

              {/* ── Five cards ─────────────────────────────── */}
              {CARDS.map((card, i) => {
                /*
                  Split phase: small outward push from centre (scroll-driven).
                  Fan phase: each card's bottom-centre translates to stage centre,
                  then the card rotates around that shared pivot.

                  CSS transform order (right-to-left execution):
                    translateX(fx)   ← 1st: slide bottom-centre to stage centre
                    rotateZ(fr)      ← 2nd: rotate around the card's own bottom-centre
                    translateY(hY)   ← 3rd (hover): lift the card along its rotated axis
                */

                // Scroll-split: push cards apart symmetrically from centre (not active when fanned)
                const sx = fanned ? 0 : (i - 2) * splitPx;

                const fr    = fanned ? ARC_ROT[i]            : 0;
                const arcDy = fanned ? ARC_DY_PX[i]          : 0;
                const fx    = fanned ? ARC_FX_MULT[i] * cardW : 0;

                // Hover: lift the hovered card upward along its own axis
                const isHovered = fanned && hoveredCard === i;
                const hY = isHovered ? -32 : 0;

                // Front-face border radius (inner edges round as cards separate)
                const radiusFront =
                  i === 0
                    ? `${R}px ${innerR}px ${innerR}px ${R}px`
                    : i === 4
                    ? `${innerR}px ${R}px ${R}px ${innerR}px`
                    : `${innerR}px`;

                return (
                  <div
                    key={i}
                    onMouseEnter={() => fanned && setHoveredCard(i)}
                    onMouseLeave={() => fanned && setHoveredCard(null)}
                    style={{
                      // Side-by-side positioning (wide rectangle)
                      position: "absolute",
                      left: `${(i / 5) * 100}%`,
                      top: 0,
                      width: "20%",
                      height: "100%",
                      zIndex: fanned ? FAN_Z[i] : 0,
                      perspective: "1200px",
                      // Scroll-split push (zeroed when fanned so fan translate is exact)
                      transform: `translateX(${sx}px)`,
                      cursor: fanned ? "pointer" : "default",
                    }}
                  >
                    {/*
                      Fan + hover wrapper.
                      transformOrigin "50% 100%" = pivot at card's own bottom-centre.
                      Combined with the translateX, all bottom-centres converge to
                      one point and cards radiate outward like a hand fan.
                    */}
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        transformOrigin: "50% 100%",
                        transform: `translateY(${arcDy + hY}px) rotateZ(${fr}deg) translateX(${fx}px)`,
                        transition: "transform 0.55s cubic-bezier(0.16, 1, 0.3, 1)",
                        willChange: "transform",
                      }}
                    >
                      {/* 3D flip container */}
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          position: "relative",
                          transformStyle: "preserve-3d",
                          transform: `rotateY(${fanned ? -180 : 0}deg)`,
                          transition:
                            "transform 0.72s 0.28s cubic-bezier(0.16, 1, 0.3, 1)",
                          willChange: "transform",
                        }}
                      >
                        {/* Front face — grass texture, cover-sized (no stretch) */}
                        <div
                          style={{
                            position: "absolute",
                            inset: 0,
                            backfaceVisibility: "hidden",
                            WebkitBackfaceVisibility: "hidden",
                            background:
                              `url('/assets/grass.png') ${i * 25}% center / 500% auto no-repeat`,
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
                            padding: "clamp(14px, 1.8vw, 24px)",
                            color: card.textColor,
                            boxShadow: fanned
                              ? isHovered
                                ? "0 44px 72px rgba(0,0,0,0.78), 0 16px 36px rgba(0,0,0,0.5)"
                                : "0 28px 56px rgba(0,0,0,0.58), 0 10px 24px rgba(0,0,0,0.38)"
                              : "none",
                            transition:
                              "box-shadow 0.55s cubic-bezier(0.16, 1, 0.3, 1)",
                          }}
                        >
                          <div
                            style={{ opacity: 0.75 }}
                            dangerouslySetInnerHTML={{ __html: card.iconSvg }}
                          />
                          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            <div
                              style={{
                                fontSize: "clamp(13px, 1.35vw, 19px)",
                                fontWeight: 500,
                                lineHeight: 1.2,
                                letterSpacing: "-0.2px",
                                whiteSpace: "pre-line",
                              }}
                            >
                              {card.title}
                            </div>
                            <div
                              style={{
                                fontSize: "clamp(7px, 0.72vw, 10px)",
                                lineHeight: 1.6,
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

          {/* ── Scroll indicator ─────────────────────────────── */}
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
