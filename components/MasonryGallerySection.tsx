"use client";

import { useEffect, useMemo, useRef, useState, useTransition, startTransition } from "react";
import Masonry, { type MasonryItem } from "@/components/Masonry";
import { getMediaForFolder } from "@/lib/media-manifest";

type TabConfig = { label: string; folder: string };

const TABS: TabConfig[] = [
  { label: "Short Form",      folder: "short-form"    },
  { label: "Statics",         folder: "statics"       },
  { label: "UGC / Affiliate", folder: "ugc-affiliate" },
  { label: "TVC / Animatics", folder: "tvc-animatics" },
];

// Deterministic per-item aspect jitter so the grid never looks uniform
function hashToUnit(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return (Math.abs(hash) % 1000) / 1000;
}

function mapDisplayAspect(src: number, seed: string): number {
  const aspect = Number.isFinite(src) && src > 0 ? src : 1;
  const jitter = (hashToUnit(seed) - 0.5) * 0.08;
  if (aspect >= 1.35) return Math.min(2.0,  Math.max(1.35, aspect * (1 + jitter)));
  if (aspect <= 0.78) return Math.min(0.78, Math.max(0.5,  aspect * (1 + jitter)));
  return Math.min(1.15, Math.max(0.85, aspect * (1 + jitter)));
}

// Phase 1: instant — no network, uses default aspect ratios
function loadCategoryItemsFast(folder: string): MasonryItem[] {
  return getMediaForFolder(folder).map((item, i) => {
    const id = `${folder}-${i + 1}`;
    return {
      id,
      src: item.src,
      type: item.type,
      url: "https://showcase.poiroscope.com",
      // Videos default to 9:16; images default to ~1:1 (refined in phase 2)
      aspectRatio: mapDisplayAspect(
        item.type === "video" ? 9 / 16 : 1,
        id
      ),
    };
  });
}

// Phase 2: async — measure real image dimensions (videos already correct)
async function refineImageAspects(items: MasonryItem[]): Promise<MasonryItem[]> {
  return Promise.all(
    items.map((item): Promise<MasonryItem> => {
      if (item.type === "video") return Promise.resolve(item);
      return new Promise<MasonryItem>((resolve) => {
        const img = new window.Image();
        img.onload = () => {
          const r =
            img.naturalWidth > 0 && img.naturalHeight > 0
              ? img.naturalWidth / img.naturalHeight
              : 1;
          resolve({ ...item, aspectRatio: mapDisplayAspect(r, item.id) });
        };
        img.onerror = () =>
          resolve({ ...item, aspectRatio: mapDisplayAspect(1, item.id) });
        img.src = item.src;
      });
    })
  );
}

export default function MasonryGallerySection() {
  const sectionRef      = useRef<HTMLElement | null>(null);
  const hasBootstrapped = useRef(false);
  // Tracks which folder is the "current" active one to discard stale refinements
  const activeTabFolderRef = useRef(TABS[0]!.folder);

  const [, startTabTransition] = useTransition();

  const [activeTab, setActiveTab]         = useState<TabConfig>(TABS[0]!);
  const [items, setItems]                 = useState<MasonryItem[]>([]);
  const [itemsByFolder, setItemsByFolder] = useState<Record<string, MasonryItem[]>>({});
  const [hasEntered, setHasEntered]       = useState(false);
  const [animationCycle, setAnimationCycle] = useState(0);

  // Bootstrap: show first tab instantly, refine images in bg, warm others in parallel
  useEffect(() => {
    if (hasBootstrapped.current) return;
    hasBootstrapped.current = true;
    let cancelled = false;

    const initialFolder = TABS[0]!.folder;

    // Instant: render the grid with fast defaults before any network
    const fast = loadCategoryItemsFast(initialFolder);
    setItems(fast);

    // Refine first tab images in background
    void refineImageAspects(fast).then((refined) => {
      if (cancelled) return;
      setItemsByFolder({ [initialFolder]: refined });
      // Only update items if user hasn't switched tabs yet
      if (activeTabFolderRef.current === initialFolder) {
        startTransition(() => setItems(refined));
      }
    });

    // Warm remaining tabs in parallel during idle time
    const warmRest = () => {
      void Promise.all(
        TABS
          .filter((t) => t.folder !== initialFolder)
          .map(async (tab) => {
            const fastItems = loadCategoryItemsFast(tab.folder);
            const refined   = await refineImageAspects(fastItems);
            if (cancelled) return;
            setItemsByFolder((prev) => ({ ...prev, [tab.folder]: refined }));
          })
      );
    };

    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      (window as Window & { requestIdleCallback: (cb: () => void) => number })
        .requestIdleCallback(warmRest);
    } else {
      setTimeout(warmRest, 300);
    }

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    if (tab.folder === activeTabFolderRef.current) return;
    activeTabFolderRef.current = tab.folder;

    const cached = itemsByFolder[tab.folder];
    if (cached) {
      // Fully refined — instant, mark non-urgent
      startTabTransition(() => {
        setItems(cached);
        setActiveTab(tab);
        setAnimationCycle((n) => n + 1);
      });
      return;
    }

    // Show fast defaults immediately (no awaiting), then refine in background
    const fast = loadCategoryItemsFast(tab.folder);
    startTabTransition(() => {
      setItems(fast);
      setActiveTab(tab);
      setAnimationCycle((n) => n + 1);
    });

    void refineImageAspects(fast).then((refined) => {
      if (activeTabFolderRef.current !== tab.folder) return; // user switched again
      setItemsByFolder((prev) => ({ ...prev, [tab.folder]: refined }));
      startTransition(() => setItems(refined));
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
