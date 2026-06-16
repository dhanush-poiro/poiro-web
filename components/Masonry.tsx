"use client";

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import gsap from "gsap";
import Image from "next/image";

type AnimateFrom = "top" | "bottom" | "left" | "right" | "center" | "random";

export interface MasonryItem {
  id: string;
  src: string;
  type: "image" | "video";
  url: string;
  aspectRatio: number;
  poster?: string;
}

interface MasonryProps {
  items: MasonryItem[];
  ease?: string;
  duration?: number;
  stagger?: number;
  animateFrom?: AnimateFrom;
  gap?: number;
  scaleOnHover?: boolean;
  hoverScale?: number;
  blurToFocus?: boolean;
  colorShiftOnHover?: boolean;
  animationKey?: number;
}

// ── Responsive column count ────────────────────────────────────────────────
function computeCols(): number {
  if (window.matchMedia("(min-width: 1024px)").matches) return 4;
  if (window.matchMedia("(min-width: 640px)").matches)  return 3;
  return 2;
}

function useColumnCount() {
  // Lazy init reads the real viewport on first client render — prevents a
  // 4-column first layout on mobile whose entrance tweens then fight the
  // corrected 2-column layout (the "overlapping black tiles" glitch).
  const [cols, setCols] = useState(() =>
    typeof window === "undefined" ? 4 : computeCols()
  );

  useEffect(() => {
    let rafId: number | null = null;

    const update = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        setCols(computeCols());
      });
    };

    window.addEventListener("resize", update, { passive: true });
    return () => {
      window.removeEventListener("resize", update);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, []);

  return cols;
}

// ── Container width via ResizeObserver (no forced layout in callback) ──────
function useMeasure<T extends HTMLElement>() {
  const ref      = useRef<T | null>(null);
  const [width, setWidth] = useState(0);
  const frameRef = useRef<number | null>(null);

  useLayoutEffect(() => {
    if (!ref.current) return;

    // Initial measurement is fine here (layout is settled at this point)
    setWidth(ref.current.getBoundingClientRect().width);

    const ro = new ResizeObserver((entries) => {
      if (frameRef.current !== null) return;           // coalesce resize bursts
      frameRef.current = requestAnimationFrame(() => {
        frameRef.current = null;
        const w = entries[0]?.contentRect.width ?? 0; // no forced layout
        setWidth((prev) => (Math.abs(prev - w) < 0.5 ? prev : w));
      });
    });

    ro.observe(ref.current);
    return () => {
      ro.disconnect();
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return [ref, width] as const;
}

// ── Static styles (injected once) ─────────────────────────────────────────
const MASONRY_STYLES = `
  .masonry-wrapper {
    position: absolute;
    top: 0; left: 0;
    box-sizing: border-box;
    cursor: pointer;
    will-change: transform;
  }
  .masonry-inner {
    position: relative;
    width: 100%; height: 100%;
    border-radius: 12px;
    overflow: hidden;
    background: #111;
  }
  .masonry-color-overlay {
    position: absolute; inset: 0;
    background: #ff5315;
    opacity: 0;
    pointer-events: none;
    border-radius: 12px;
    z-index: 2;
  }
`;

// ── Find shortest column in O(cols) ───────────────────────────────────────
function shortestCol(heights: number[]): number {
  let idx = 0;
  for (let i = 1; i < heights.length; i++) {
    if ((heights[i] ?? 0) < (heights[idx] ?? 0)) idx = i;
  }
  return idx;
}

// =============================================================================
export default function Masonry({
  items,
  ease = "power3.out",
  duration = 0.6,
  stagger = 0.05,
  animateFrom = "bottom",
  gap = 20,
  scaleOnHover = true,
  hoverScale = 0.95,
  blurToFocus = true,
  colorShiftOnHover = false,
  animationKey = 0,
}: MasonryProps) {
  const columns = useColumnCount();
  const [containerRef, containerWidth] = useMeasure<HTMLDivElement>();

  // O(1) element lookup — avoids querySelector on every layout pass
  const itemRefs    = useRef<Map<string, HTMLElement>>(new Map());
  const overlayRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const videoRefs   = useRef<Map<string, HTMLVideoElement>>(new Map());
  // Singleton IOs — live for the component lifetime; videos subscribe/unsubscribe via ref callbacks
  const ioRef       = useRef<IntersectionObserver | null>(null);  // play/pause at the viewport edge
  const warmIoRef   = useRef<IntersectionObserver | null>(null);  // start buffering well ahead of it

  const getInitialPosition = useCallback(
    (item: MasonryItem & { x: number; y: number; w: number; h: number }) => {
      let dir: AnimateFrom = animateFrom;
      if (animateFrom === "random") {
        const dirs: AnimateFrom[] = ["top", "bottom", "left", "right"];
        dir = dirs[Math.floor(Math.random() * dirs.length)] ?? "bottom";
      }
      switch (dir) {
        case "top":    return { x: item.x, y: -200 };
        case "bottom": return { x: item.x, y: window.innerHeight + 200 };
        case "left":   return { x: -200, y: item.y };
        case "right":  return { x: window.innerWidth + 200, y: item.y };
        case "center": return { x: item.x + item.w / 2, y: item.y + item.h / 2 };
        default:       return { x: item.x, y: item.y + 100 };
      }
    },
    [animateFrom]
  );

  // IO cleanup on unmount — creation is lazy (inside the video ref callback)
  // so it happens the instant the first video element mounts, before any effect runs.
  useEffect(() => {
    return () => {
      ioRef.current?.disconnect();     ioRef.current = null;
      warmIoRef.current?.disconnect(); warmIoRef.current = null;
    };
  }, []);

  // Page-hidden: pause all videos (IO re-plays when tab becomes visible again)
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) videoRefs.current.forEach((v) => v.pause());
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  // Grid layout — O(n * cols), column selection is O(cols)
  const grid = useMemo(() => {
    if (!containerWidth || containerWidth < 100) return [];
    const gapPx    = gap ?? 20;
    const colWidth = (containerWidth - gapPx * (columns - 1)) / columns;
    const colHeights = new Array<number>(columns).fill(0);

    return items.map((item) => {
      const col    = shortestCol(colHeights);
      const aspect = Math.min(Math.max(item.aspectRatio || 1, 0.45), 2.2);
      const x      = (colWidth + gapPx) * col;
      const h      = colWidth / aspect;
      const y      = colHeights[col] ?? 0;
      colHeights[col] = (colHeights[col] ?? 0) + h + gapPx;
      return { ...item, x, y, w: colWidth, h };
    });
  }, [columns, items, containerWidth, gap]);

  const maxHeight = useMemo(
    () => (grid.length ? Math.max(...grid.map((i) => i.y + i.h)) : 0),
    [grid]
  );

  const hasMounted  = useRef(false);
  const lastAnimKey = useRef(animationKey);

  useLayoutEffect(() => {
    if (!containerRef.current || !grid.length) return;
    const isEntrance = !hasMounted.current || animationKey !== lastAnimKey.current;

    grid.forEach((item, index) => {
      // O(1) lookup — no DOM query
      const el = itemRefs.current.get(item.id);
      if (!el) return;

      // Kill any in-flight/pending tween (incl. staggered entrances that
      // haven't started yet) — otherwise an old tween targeting stale grid
      // positions finishes AFTER this one and strands the tile mid-layout.
      gsap.killTweensOf(el);

      const target = { x: item.x, y: item.y, width: item.w, height: item.h };

      if (isEntrance) {
        const from = getInitialPosition(item);
        gsap.fromTo(
          el,
          {
            opacity: 0, x: from.x, y: from.y, width: item.w, height: item.h,
            ...(blurToFocus && { filter: "blur(10px)" }),
          },
          {
            opacity: 1, ...target,
            ...(blurToFocus && { filter: "blur(0px)" }),
            duration, ease, delay: index * stagger,
          }
        );
      } else {
        gsap.to(el, {
          ...target, opacity: 1,
          ...(blurToFocus && { filter: "blur(0px)" }),
          duration, ease, overwrite: "auto",
        });
      }
    });

    hasMounted.current  = true;
    lastAnimKey.current = animationKey;
  }, [grid, stagger, blurToFocus, duration, ease, animationKey, getInitialPosition, containerRef]);

  // Stable hover handlers — no new function objects per render
  const handleMouseEnter = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const id = e.currentTarget.dataset.key;
      if (scaleOnHover) {
        gsap.to(e.currentTarget, { scale: hoverScale, force3D: true, duration: 0.3, ease: "power2.out" });
      }
      if (colorShiftOnHover && id) {
        const overlay = overlayRefs.current.get(id);
        if (overlay) gsap.to(overlay, { opacity: 0.3, duration: 0.3 });
      }
    },
    [scaleOnHover, hoverScale, colorShiftOnHover]
  );

  const handleMouseLeave = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const id = e.currentTarget.dataset.key;
      if (scaleOnHover) {
        gsap.to(e.currentTarget, { scale: 1, force3D: true, duration: 0.3, ease: "power2.out" });
      }
      if (colorShiftOnHover && id) {
        const overlay = overlayRefs.current.get(id);
        if (overlay) gsap.to(overlay, { opacity: 0, duration: 0.3 });
      }
    },
    [scaleOnHover, colorShiftOnHover]
  );

  return (
    <>
      <style>{MASONRY_STYLES}</style>
      <div
        ref={containerRef}
        style={{
          position: "relative",
          height: maxHeight ? `${maxHeight}px` : "320px",
          contain: "layout",
        }}
      >
        {grid.map((item) => (
          <div
            key={item.id}
            data-key={item.id}
            className="masonry-wrapper"
            ref={(el) => {
              // React calls with null on unmount — this keeps the map in sync
              if (el) itemRefs.current.set(item.id, el);
              else    itemRefs.current.delete(item.id);
            }}
            onClick={() => window.open(item.url, "_blank", "noopener")}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div className="masonry-inner">
              {item.type === "video" ? (
                <video
                  ref={(node) => {
                    if (node) {
                      // Lazy-init the IO here so it's ready before the first observe call.
                      // useEffect runs after paint — too late for the ref callbacks that fire
                      // when containerWidth is first measured (useLayoutEffect → state → render).
                      if (!ioRef.current) {
                        ioRef.current = new IntersectionObserver(
                          (entries) => {
                            entries.forEach((entry) => {
                              const v = entry.target as HTMLVideoElement;
                              if (entry.isIntersecting) {
                                // Restart from keyframe only when resuming from paused —
                                // don't disrupt a video that's already playing mid-scroll.
                                if (v.paused) {
                                  v.currentTime = 0;
                                  v.play().catch(() => {});
                                }
                              } else {
                                v.pause();
                              }
                            });
                          },
                          { rootMargin: "100px 0px 100px 0px", threshold: 0.1 }
                        );
                      }
                      if (!warmIoRef.current) {
                        // One-shot prefetch: flip preload none→auto ~900px before the
                        // tile scrolls in, so the buffer is ready by the time play() fires.
                        // preload="auto" alone is ignored by iOS Safari after mount, so
                        // load() is called to actually start the network fetch.
                        warmIoRef.current = new IntersectionObserver(
                          (entries) => {
                            entries.forEach((entry) => {
                              if (!entry.isIntersecting) return;
                              const v = entry.target as HTMLVideoElement;
                              v.preload = "auto";
                              v.load();
                              warmIoRef.current?.unobserve(v);
                            });
                          },
                          { rootMargin: "900px 0px 900px 0px", threshold: 0 }
                        );
                      }
                      videoRefs.current.set(item.id, node);
                      ioRef.current.observe(node);
                      warmIoRef.current.observe(node);
                    } else {
                      const prev = videoRefs.current.get(item.id);
                      if (prev) {
                        ioRef.current?.unobserve(prev);
                        warmIoRef.current?.unobserve(prev);
                        videoRefs.current.delete(item.id);
                      }
                    }
                  }}
                  src={item.src}
                  poster={item.poster}
                  muted
                  loop
                  playsInline
                  preload="none"     // no network hit on mount; warm IO upgrades to "auto" near viewport
                  style={{
                    position: "absolute", inset: 0,
                    width: "100%", height: "100%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <Image
                  src={item.src}
                  alt=""
                  fill
                  loading="lazy"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  style={{ objectFit: "cover" }}
                />
              )}

              <div
                className="masonry-color-overlay"
                ref={(el) => {
                  if (el) overlayRefs.current.set(item.id, el);
                  else    overlayRefs.current.delete(item.id);
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
