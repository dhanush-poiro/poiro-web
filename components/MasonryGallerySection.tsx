"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import Masonry, { type MasonryItem } from "@/components/Masonry";
import { getMediaForFolder } from "@/lib/media-manifest";

type TabConfig = { label: string; folder: string };

const TABS: TabConfig[] = [
  { label: "Short Form",      folder: "short-form"    },
  { label: "Statics",         folder: "statics"       },
  { label: "UGC / Affiliate", folder: "ugc-affiliate" },
  { label: "TVC / Animatics", folder: "tvc-animatics" },
];

// Per-tab tile shape. Every tile in a tab is rendered at the tab's chosen
// aspect — vertical short-form/UGC, square statics, widescreen TVC. The clip
// fills the tile with object-fit: cover, so landscape sources are centre-
// cropped into a vertical frame (and vice-versa). This is a deliberate
// editorial choice for a consistent grid, independent of each clip's encoding.
//   9:16 = 0.5625 · 1:1 = 1 · 16:9 = 1.778
const FOLDER_ASPECT: Record<string, number> = {
  "short-form":    9 / 16,
  "statics":       1,
  "ugc-affiliate": 9 / 16,
  "tvc-animatics": 16 / 9,
};
const DEFAULT_ASPECT = 1;

// Build a tab's items straight from the manifest — zero network, zero
// post-render relayout.
function loadCategoryItems(folder: string): MasonryItem[] {
  const aspect = FOLDER_ASPECT[folder] ?? DEFAULT_ASPECT;
  return getMediaForFolder(folder).map((item, i) => {
    const id = `${folder}-${i + 1}`;
    return {
      id,
      src: item.src,
      type: item.type,
      poster: item.poster,
      url: "https://showcase.poiroscope.com",
      aspectRatio: aspect,
    };
  });
}

export default function MasonryGallerySection() {
  const sectionRef = useRef<HTMLElement | null>(null);

  const [, startTabTransition] = useTransition();

  const [activeTab, setActiveTab]           = useState<TabConfig>(TABS[0]!);
  const [hasEntered, setHasEntered]         = useState(false);
  const [animationCycle, setAnimationCycle] = useState(0);

  // Derived synchronously — the manifest is static, so no loading states needed
  const items = useMemo(() => loadCategoryItems(activeTab.folder), [activeTab.folder]);

  // Intersection observer — trigger entrance animation once
  useEffect(() => {
    if (!sectionRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setHasEntered(true);
        setAnimationCycle((n) => n + 1);
        observer.disconnect();
      },
      // 400px early trigger: Masonry renders before the section scrolls into view
      { threshold: 0, rootMargin: "400px 0px 0px 0px" }
    );
    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const handleTabChange = (tab: TabConfig) => {
    if (tab.folder === activeTab.folder) return;
    startTabTransition(() => {
      setActiveTab(tab);
      setAnimationCycle((n) => n + 1);
    });
  };

  const tabBase = useMemo<React.CSSProperties>(
    () => ({
      fontFamily: "var(--font-family)",
      fontSize: "0.80rem",
      fontWeight: 600,
      letterSpacing: "0.15em",
      textTransform: "uppercase",
      border: "1px solid",
      borderRadius: 12,
      padding: "10px 18px",
      cursor: "pointer",
      backdropFilter: "blur(10px)",
      transition: "background 0.2s ease, color 0.2s ease, border-color 0.2s ease",
    }),
    []
  );

  return (
    <>
      <style>{`
        .mgal-tabs {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 12px;
        }
        @media (max-width: 600px) {
          .mgal-tabs {
            flex-wrap: nowrap;
            overflow-x: auto;
            justify-content: flex-start;
            padding: 4px clamp(16px, 4vw, 24px) 4px;
            scrollbar-width: none;
            -ms-overflow-style: none;
            gap: 8px;
          }
          .mgal-tabs::-webkit-scrollbar { display: none; }
          .mgal-tab { flex-shrink: 0; }
        }
      `}</style>

      <section
        ref={sectionRef}
        id="gallery"
        style={{
          background: "#000",
          position: "relative",
          zIndex: 10,
          paddingTop:    "clamp(100px, 12vw, 180px)",
          paddingBottom: "clamp(72px,  8vw, 130px)",
        }}
      >
        <div style={{ maxWidth: "min(1280px, 88vw)", margin: "0 auto", width: "100%" }}>

          {/* ── Header ──────────────────────────────────────── */}
          <div style={{ paddingLeft: "clamp(6px,1vw,14px)", paddingRight: "clamp(6px,1vw,14px)" }}>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <span
                style={{
                  fontFamily: "var(--font-family)",
                  fontSize: "0.80rem",
                  fontWeight: 600,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: "#ffffff",
                  background: "#ff8015",
                  borderRadius: 9999,
                  padding: "8px 24px 10px",
                  boxShadow: "0 4px 14px rgba(255,128,21,0.4)",
                  display: "inline-block",
                }}
              >
                Gallery
              </span>
            </div>

            <h2
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: "clamp(40px, 6vw, 72px)",
                fontWeight: 400,
                letterSpacing: "-0.02em",
                lineHeight: 1.05,
                color: "#ffffff",
                textAlign: "center",
                marginTop: "clamp(24px, 3vw, 40px)",
                marginBottom: 0,
                paddingBottom: "clamp(4px, 0.6vw, 10px)",
              }}
            >
              Our Work
            </h2>

            {/* Divider */}
            <div
              style={{
                marginTop:    "clamp(20px, 2.8vw, 34px)",
                marginBottom: "clamp(24px, 3.2vw, 40px)",
                height: 1,
                width: "100%",
                background:
                  "linear-gradient(to right, rgba(0,0,0,0), rgba(68,68,68,1), rgba(0,0,0,0))",
              }}
            />
          </div>

          {/* ── Tabs ────────────────────────────────────────── */}
          <div
            className="mgal-tabs"
            style={{ marginBottom: "clamp(32px, 4vw, 52px)" }}
          >
            {TABS.map((tab) => {
              const active = tab.folder === activeTab.folder;
              return (
                <button
                  key={tab.folder}
                  type="button"
                  className="mgal-tab"
                  onClick={() => handleTabChange(tab)}
                  style={{
                    ...tabBase,
                    background:  active ? "rgba(255,95,31,0.15)" : "rgba(255,255,255,0.04)",
                    color:       active ? "#ffffff" : "var(--color-text-secondary)",
                    borderColor: active ? "#ff8015" : "#374151",
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* ── Masonry grid ────────────────────────────────── */}
          {hasEntered ? (
            <Masonry
              items={items}
              ease="power3.out"
              duration={0.6}
              stagger={0.05}
              animateFrom="bottom"
              gap={20}
              scaleOnHover
              hoverScale={0.97}
              blurToFocus
              colorShiftOnHover={false}
              animationKey={animationCycle}
            />
          ) : (
            <div style={{ minHeight: "clamp(480px, 60vw, 800px)" }} />
          )}
        </div>
      </section>
    </>
  );
}
