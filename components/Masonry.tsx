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

// Responsive column count hook
function useColumnCount() {
  const [cols, setCols] = useState(4);
  useEffect(() => {
    const update = () => {
      if (window.matchMedia("(min-width: 1024px)").matches) setCols(4);
      else if (window.matchMedia("(min-width: 640px)").matches) setCols(3);
      else setCols(2);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return cols;
}

// Measure a DOM element's bounding rect reactively
function useMeasure<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [width, setWidth] = useState(0);
  const frameRef = useRef<number | null>(null);

  useLayoutEffect(() => {
    if (!ref.current) return;
    const update = () => {
      if (!ref.current) return;
      const w = ref.current.getBoundingClientRect().width;
      setWidth((prev) => (prev === w ? prev : w));
    };
    update();
    const ro = new ResizeObserver(() => {
      if (frameRef.current !== null) return;
      frameRef.current = requestAnimationFrame(() => {
        frameRef.current = null;
        update();
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

const MASONRY_STYLES = `
  .masonry-wrapper {
    position: absolute;
    top: 0;
    left: 0;
    box-sizing: border-box;
    cursor: pointer;
  }
  .masonry-inner {
    position: relative;
    width: 100%;
    height: 100%;
    border-radius: 12px;
    overflow: hidden;
    background: #111;
  }
  .masonry-color-overlay {
    position: absolute;
    inset: 0;
    background: #ff5315;
    opacity: 0;
    pointer-events: none;
    border-radius: 12px;
    z-index: 2;
  }
`;

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
  // Map from item.id → <video> element
  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());

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
        case "left":   return { x: -200,   y: item.y };
        case "right":  return { x: window.innerWidth + 200, y: item.y };
        case "center": return { x: item.x + item.w / 2, y: item.y + item.h / 2 };
        default:       return { x: item.x, y: item.y + 100 };
      }
    },
    [animateFrom]
  );

  // Pause & reset all videos on tab switch, clear ref map
  useEffect(() => {
    videoRefs.current.forEach((v) => { v.pause(); v.currentTime = 0; });
    const raf = requestAnimationFrame(() => videoRefs.current.clear());
    return () => cancelAnimationFrame(raf);
  }, [items]);

  // Page visibility — pause all when tab hidden; IO re-plays when tab returns
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) {
        videoRefs.current.forEach((v) => v.pause());
      }
      // Re-play is handled by IntersectionObserver firing on visibility restore
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  // IntersectionObserver — play/pause each video based on viewport visibility
  useEffect(() => {
    if (!videoRefs.current.size) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement;
          if (entry.isIntersecting) {
            // Kick off play; ignore NotAllowedError (autoplay policy)
            if (video.paused) video.play().catch(() => {});
          } else {
            if (!video.paused) video.pause();
          }
        });
      },
      {
        // 100px early-trigger: start playing slightly before fully in view
        rootMargin: "100px 0px 100px 0px",
        threshold: 0.1,
      }
    );

    videoRefs.current.forEach((v) => observer.observe(v));
    return () => observer.disconnect();
  // Re-run after grid settles (new items, new layout)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, containerWidth]);

  // Compute grid layout
  const grid = useMemo(() => {
    if (!containerWidth || containerWidth < 100) return [];
    const gapPx = gap ?? 20;
    const colWidth = (containerWidth - gapPx * (columns - 1)) / columns;
    const colHeights = new Array<number>(columns).fill(0);
    return items.map((item) => {
      const col = colHeights.indexOf(Math.min(...colHeights));
      const aspect = Math.min(Math.max(item.aspectRatio || 1, 0.45), 2.2);
      const x = (colWidth + gapPx) * col;
      const h = colWidth / aspect;
      const y = colHeights[col] ?? 0;
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
      const el = containerRef.current?.querySelector<HTMLElement>(`[data-key="${item.id}"]`);
      if (!el) return;
      const target = { x: item.x, y: item.y, width: item.w, height: item.h };

      if (isEntrance) {
        const from = getInitialPosition(item);
        gsap.fromTo(
          el,
          { opacity: 0, x: from.x, y: from.y, width: item.w, height: item.h,
            ...(blurToFocus && { filter: "blur(10px)" }) },
          { opacity: 1, ...target,
            ...(blurToFocus && { filter: "blur(0px)" }),
            duration, ease, delay: index * stagger }
        );
      } else {
        gsap.to(el, { ...target, opacity: 1,
          ...(blurToFocus && { filter: "blur(0px)" }),
          duration, ease, overwrite: "auto" });
      }
    });

    hasMounted.current  = true;
    lastAnimKey.current = animationKey;
  }, [grid, stagger, blurToFocus, duration, ease, animationKey, getInitialPosition, containerRef]);

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (scaleOnHover) {
      gsap.to(e.currentTarget, { scale: hoverScale, force3D: true, duration: 0.3, ease: "power2.out" });
    }
    if (colorShiftOnHover) {
      const overlay = e.currentTarget.querySelector<HTMLDivElement>(".masonry-color-overlay");
      if (overlay) gsap.to(overlay, { opacity: 0.3, duration: 0.3 });
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    if (scaleOnHover) {
      gsap.to(e.currentTarget, { scale: 1, force3D: true, duration: 0.3, ease: "power2.out" });
    }
    if (colorShiftOnHover) {
      const overlay = e.currentTarget.querySelector<HTMLDivElement>(".masonry-color-overlay");
      if (overlay) gsap.to(overlay, { opacity: 0, duration: 0.3 });
    }
  };

  return (
    <>
      <style>{MASONRY_STYLES}</style>
      <div
        ref={containerRef}
        style={{ position: "relative", height: maxHeight ? `${maxHeight}px` : "320px" }}
      >
        {grid.map((item) => (
          <div
            key={item.id}
            data-key={item.id}
            className="masonry-wrapper"
            onClick={() => window.open(item.url, "_blank", "noopener")}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div className="masonry-inner">
              {item.type === "video" ? (
                <video
                  ref={(node) => {
                    if (node) videoRefs.current.set(item.id, node);
                    // Don't delete on null — cleanup is handled by items-change effect
                  }}
                  src={item.src}
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  style={{
                    position: "absolute", inset: 0,
                    width: "100%", height: "100%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <Image
                  src={item.src}
                  alt="gallery image"
                  fill
                  loading="lazy"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  style={{ objectFit: "cover" }}
                />
              )}
              {colorShiftOnHover && <div className="masonry-color-overlay" />}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
