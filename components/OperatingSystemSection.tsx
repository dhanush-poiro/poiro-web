"use client";

import { useState } from "react";
import Image from "next/image";

// ── Product data ──────────────────────────────────────────────────────────────
interface Service {
  num: string;
  label: string;
  title: string;
  desc: string;
  img: string;
  video?: string; // optional: renders a looping video instead of a static image
  imgAlt: string;
}

const SERVICES: Service[] = [
  {
    num: "01",
    label: "Curate & Ideate",
    title: "Ideation Agent",
    desc: "Tap into a living universe of trends and audience signals to create content your consumers can't scroll past. Tracking the best brands and creators in your category, our Ideation Agent parses thousands of hours of content to surface the most compelling ideas, storylines, visual concepts and hooks, so inspiration is never more than a search away. Stay ahead of the curve, always.",
    img: "/os/brand-cosmos.webp",
    video: "/os/Brand-Cosmos.mp4",
    imgAlt: "Ideation Agent",
  },
  {
    num: "02",
    label: "Collaborate",
    title: "Briefing, Asset & Project Management",
    desc: "Where great ideas become brilliant briefs, and creative teams finally work as one. Ideate with an intelligent briefing agent, curate references from across the web, generate samples and manage feedback — all in one place, so your creative team nails it on the very first iteration. From first spark to final delivery, all in one place.",
    img: "/os/atlas.webp",
    imgAlt: "Briefing & Asset Management",
  },
  {
    num: "03",
    label: "Create limitlessly",
    title: "Flowboards",
    desc: "From six-second hooks to full-scale TVCs, unleash visual stories at a scale you never thought possible. Collaboratively build creative workflows, choose from 100+ AI models and proprietary pipelines, and take precise control over every step across every channel, every format, every brief. Your imagination is the only limit.",
    img: "/os/infinite-flow.webp",
    imgAlt: "Flowboards",
  },
  {
    num: "04",
    label: "Build Apps",
    title: "App Builder",
    desc: "Turn your creative workflows into powerful no-code apps, so your best ideas scale without limits. Convert even your most complex creative workflows into simple, intuitive apps and put the power of world-class content creation in the hands of everyone in your organisation. Build once, create forever.",
    img: "/os/appstudio.webp",
    imgAlt: "App Builder",
  },
  {
    num: "05",
    label: "Final Touch",
    title: "AI Editing Studio",
    desc: "Polish every pixel, perfect every frame. AI-powered editing, entirely on your terms. Edit images and videos with a level of precision and finesse that was once the preserve of the most skilled editors — because no one understands your creative vision better than you. Because the details are everything.",
    img: "/os/poiro-studio.webp",
    imgAlt: "AI Editing Studio",
  },
];

// A hairline that fades out at both edges — elegant on dark backgrounds
function Divider() {
  return (
    <div
      style={{
        height: 1,
        background:
          "linear-gradient(to right, transparent 0%, rgba(255,255,255,0.12) 20%, rgba(255,255,255,0.12) 80%, transparent 100%)",
      }}
    />
  );
}

// =============================================================================
export default function OperatingSystemSection() {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&family=Roboto:wght@300;400;500&display=swap');
        .os-section * { box-sizing: border-box; }
      `}</style>

      <section
        id="os-section"
        className="os-section"
        style={{
          backgroundColor: "#000000",
          padding: "clamp(80px, 12vh, 140px) 0",
          fontFamily: "'Roboto', sans-serif",
          position: "relative",
          zIndex: 10,
          scrollMarginTop: "80px",
        }}
      >
        {/* ── Section header ──────────────────────────────────── */}
        <div
          style={{
            maxWidth: "min(1100px, 88vw)",
            margin: "0 auto",
            padding: "0 24px",
            marginBottom: "clamp(64px, 10vh, 120px)",
          }}
        >
          {/* Label */}
          <span
            style={{
              fontFamily: "'Roboto', sans-serif",
              fontSize: "clamp(11px, 0.9vw, 13px)",
              fontWeight: 400,
              color: "rgba(255, 255, 255, 0.3)",
              letterSpacing: "2.5px",
              textTransform: "uppercase",
              display: "block",
              marginBottom: 24,
            }}
          >
            The Platform
          </span>

          {/* Main heading */}
          <h2
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(40px, 5.5vw, 80px)",
              fontWeight: 300,
              color: "rgba(240, 234, 222, 0.95)",
              letterSpacing: "-0.5px",
              lineHeight: 1.05,
              margin: 0,
            }}
          >
            An Operating System
            <br />
            <em style={{ fontWeight: 300 }}>to Scale Storytelling.</em>
          </h2>

          {/* Subline */}
          <p
            style={{
              fontFamily: "'Roboto', sans-serif",
              fontSize: "clamp(14px, 1.1vw, 17px)",
              fontWeight: 300,
              color: "rgba(255, 255, 255, 0.35)",
              marginTop: 24,
              lineHeight: 1.7,
              maxWidth: 520,
            }}
          >
            For Brand Managers &amp; Creative Teams — the only AI OS you need
            to take your story from idea to impact, without the chaos.
          </p>
        </div>

        {/* ── Service rows ────────────────────────────────────── */}
        <div
          style={{
            maxWidth: "min(1100px, 88vw)",
            margin: "0 auto",
            padding: "0 24px",
          }}
        >
          {/* Top border */}
          <Divider />

          {SERVICES.map((svc, i) => {
            const isHovered = hovered === i;
            return (
              <div key={i}>
                {/* Service row */}
                <div
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: "clamp(24px, 3vw, 48px)",
                    alignItems: "center",
                    padding: "clamp(40px, 5.5vh, 72px) 0",
                    transform: isHovered ? "scale(1.02)" : "scale(1)",
                    transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                    cursor: "default",
                  }}
                >
                  {/* Left column: number + label */}
                  <div>
                    <span
                      style={{
                        fontFamily: "'Roboto', sans-serif",
                        fontSize: "clamp(11px, 0.9vw, 13px)",
                        fontWeight: 400,
                        color: "rgba(255, 255, 255, 0.28)",
                        letterSpacing: "0.5px",
                        display: "block",
                        marginBottom: 10,
                      }}
                    >
                      ({svc.num})
                    </span>
                    <h3
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: "clamp(28px, 3vw, 44px)",
                        fontWeight: 400,
                        color: "rgba(240, 234, 222, 0.9)",
                        letterSpacing: "-0.3px",
                        lineHeight: 1.1,
                        margin: 0,
                      }}
                    >
                      {svc.label}
                    </h3>
                  </div>

                  {/* Center column: product name + description */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <span
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: "clamp(16px, 1.4vw, 22px)",
                        fontWeight: 500,
                        fontStyle: "italic",
                        color: "rgba(240, 234, 222, 0.7)",
                        letterSpacing: "0.1px",
                        lineHeight: 1.2,
                      }}
                    >
                      {svc.title}
                    </span>
                    <p
                      style={{
                        fontFamily: "'Roboto', sans-serif",
                        fontSize: "clamp(12px, 0.95vw, 14px)",
                        fontWeight: 300,
                        color: "rgba(255, 255, 255, 0.38)",
                        lineHeight: 1.75,
                        margin: 0,
                      }}
                    >
                      {svc.desc}
                    </p>
                  </div>

                  {/* Right column: service image or video */}
                  <div
                    style={{
                      width: "100%",
                      aspectRatio: "4 / 3",
                      borderRadius: 12,
                      overflow: "hidden",
                      position: "relative",
                      transform: isHovered ? "scale(1.03)" : "scale(1)",
                      transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                    }}
                  >
                    {svc.video ? (
                      <video
                        src={svc.video}
                        autoPlay
                        loop
                        muted
                        playsInline
                        poster={svc.img}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          display: "block",
                        }}
                      />
                    ) : (
                      <Image
                        src={svc.img}
                        alt={svc.imgAlt}
                        fill
                        style={{ objectFit: "cover" }}
                        sizes="(max-width: 768px) 90vw, 33vw"
                      />
                    )}
                  </div>
                </div>

                {/* Divider below every row */}
                <Divider />
              </div>
            );
          })}
        </div>

        {/* ── CTA button ──────────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
            marginTop: "clamp(48px, 8vh, 96px)",
          }}
        >
          <a
            href="https://calendly.com/sameer-poiro/poiro-introduction-with-founders"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 14,
              padding: "18px 48px",
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.96) 0%, rgba(240,234,222,0.94) 100%)",
              borderRadius: 14,
              color: "#0c0c0c",
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(16px, 1.4vw, 21px)",
              fontWeight: 500,
              fontStyle: "italic",
              letterSpacing: "0.02em",
              textDecoration: "none",
              cursor: "pointer",
              boxShadow:
                "0 4px 24px rgba(255,255,255,0.12), 0 1px 6px rgba(0,0,0,0.4)",
              transition:
                "transform 0.4s cubic-bezier(0.16,1,0.3,1), box-shadow 0.4s cubic-bezier(0.16,1,0.3,1)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px) scale(1.02)";
              e.currentTarget.style.boxShadow =
                "0 12px 48px rgba(255,255,255,0.22), 0 4px 16px rgba(0,0,0,0.5)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0) scale(1)";
              e.currentTarget.style.boxShadow =
                "0 4px 24px rgba(255,255,255,0.12), 0 1px 6px rgba(0,0,0,0.4)";
            }}
          >
            Build Your Vision With Us
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M3.5 9h11M9.5 4l5 5-5 5"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
          <span
            style={{
              fontFamily: "'Roboto', sans-serif",
              fontSize: "clamp(11px, 0.85vw, 13px)",
              color: "rgba(255,255,255,0.25)",
              letterSpacing: "0.5px",
            }}
          >
            Book a free intro call with the founders
          </span>
        </div>
      </section>
    </>
  );
}
