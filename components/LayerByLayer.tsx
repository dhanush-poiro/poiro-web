"use client";

const ORANGE = "#ff8015";

const PROBLEMS = [
  {
    tag: "Idea to Brief",
    title: "Briefing is still chaos",
    body: "Ideas get lost in translation. Assets scattered across PDFs, WhatsApp, and Drive — every project restarts from zero, with no institutional memory to build on.",
  },
  {
    tag: "Brief to Creative",
    title: "Creation is scattered",
    body: "Storyboarding, prompting, and generation happen across a dozen disconnected tools. Brand consistency — lighting, character, tone — breaks down without a unified flow.",
  },
  {
    tag: "Editing & Finalisation",
    title: "Polish still requires experts",
    body: "Stitching clips, fine-tuning product placement, blending backgrounds — these still bottleneck on specialists and complex tools that most teams don't have.",
  },
  {
    tag: "Infrastructure",
    title: "Custom pipelines are expensive",
    body: "Assembling the right models, pipelines, and guardrails for a specific brand takes months of engineering — resources most creative teams simply don't have.",
  },
];

function ProblemCard({ tag, title, body, rotate = 0 }: { tag: string; title: string; body: string; rotate?: number }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.09)",
      borderRadius: 16,
      padding: "clamp(20px, 2.5vw, 32px)",
      backdropFilter: "blur(8px)",
      boxShadow: "0 8px 32px rgba(0,0,0,0.40)",
      transform: `rotate(${rotate}deg)`,
      transition: "transform 0.3s ease, box-shadow 0.3s ease",
      cursor: "default",
    }}
    onMouseEnter={e => {
      (e.currentTarget as HTMLDivElement).style.transform = "rotate(0deg) translateY(-4px)";
      (e.currentTarget as HTMLDivElement).style.boxShadow = "0 16px 48px rgba(0,0,0,0.55)";
    }}
    onMouseLeave={e => {
      (e.currentTarget as HTMLDivElement).style.transform = `rotate(${rotate}deg)`;
      (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 32px rgba(0,0,0,0.40)";
    }}
    >
      {/* Tag pill */}
      <span style={{
        display: "inline-block",
        fontFamily: "var(--font-family)",
        fontSize: 10,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "1.3px",
        color: ORANGE,
        background: "rgba(255,128,21,0.10)",
        border: "1px solid rgba(255,128,21,0.22)",
        padding: "3px 10px",
        borderRadius: 20,
        marginBottom: 14,
      }}>
        {tag}
      </span>

      <h3 style={{
        fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
        fontSize: "clamp(18px, 1.8vw, 26px)",
        fontWeight: 400,
        letterSpacing: "-0.02em",
        lineHeight: 1.15,
        color: "rgba(240,234,222,0.95)",
        margin: "0 0 10px",
      }}>
        {title}
      </h3>

      <p style={{
        fontFamily: "var(--font-family)",
        fontSize: "clamp(12px, 0.9vw, 14px)",
        color: "rgba(255,255,255,0.38)",
        lineHeight: 1.75,
        margin: 0,
      }}>
        {body}
      </p>
    </div>
  );
}

export default function LayerByLayer() {
  return (
    <>
      <style>{`
        @media (max-width: 900px) {
          .lbl-grid { grid-template-columns: 1fr 1fr !important; }
          .lbl-center-icon { display: none !important; }
        }
        @media (max-width: 520px) {
          .lbl-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <section
        id="problem"
        style={{
          background: "#060606",
          position: "relative",
          zIndex: 10,
          overflow: "hidden",
          padding: "clamp(60px, 10vw, 120px) clamp(20px, 4vw, 60px)",
        }}
      >
        {/* Dot grid background */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: "radial-gradient(rgba(255,255,255,0.06) 2px, transparent 2px)",
          backgroundSize: "48px 48px",
          backgroundPosition: "center top",
        }} />

        <div style={{ maxWidth: "min(1200px, 92vw)", margin: "0 auto", position: "relative" }}>

          {/* 3-column grid: left | center icon | right */}
          <div
            className="lbl-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr clamp(80px, 12vw, 160px) 1fr",
              gap: "clamp(20px, 3vw, 48px)",
              alignItems: "center",
            }}
          >
            {/* Left column — 2 cards, slight counter-clockwise tilt */}
            <div style={{ display: "flex", flexDirection: "column", gap: "clamp(16px, 2.5vw, 28px)" }}>
              <ProblemCard {...PROBLEMS[0]} rotate={-1.5} />
              <ProblemCard {...PROBLEMS[1]} rotate={-1} />
            </div>

            {/* Center — warning icon */}
            <div
              className="lbl-center-icon"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
              }}
            >
              {/* Warning triangle SVG */}
              <div style={{
                width: "clamp(64px, 10vw, 120px)",
                height: "clamp(64px, 10vw, 120px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                filter: "drop-shadow(0 0 28px rgba(255,128,21,0.55)) drop-shadow(0 0 60px rgba(255,128,21,0.25))",
              }}>
                <svg viewBox="0 0 100 90" fill="none" style={{ width: "100%", height: "100%" }}>
                  <path
                    d="M50 8L95 85H5L50 8Z"
                    fill="rgba(255,128,21,0.10)"
                    stroke={ORANGE}
                    strokeWidth="3"
                    strokeLinejoin="round"
                  />
                  <text
                    x="50"
                    y="68"
                    textAnchor="middle"
                    fill={ORANGE}
                    fontSize="38"
                    fontWeight="700"
                    fontFamily="var(--font-cormorant), Georgia, serif"
                  >
                    !
                  </text>
                </svg>
              </div>
            </div>

            {/* Right column — 2 cards, slight clockwise tilt */}
            <div style={{ display: "flex", flexDirection: "column", gap: "clamp(16px, 2.5vw, 28px)" }}>
              <ProblemCard {...PROBLEMS[2]} rotate={1} />
              <ProblemCard {...PROBLEMS[3]} rotate={1.5} />
            </div>
          </div>

        </div>
      </section>
    </>
  );
}
