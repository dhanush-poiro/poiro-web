"use client";

import { useLayoutEffect, useRef, useCallback } from "react";
import React from "react";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface ScrollStackItemProps {
  children: React.ReactNode;
  itemClassName?: string;
}

export interface ScrollStackProps {
  children: React.ReactNode;
  className?: string;
  itemDistance?: number;
  itemScale?: number;
  itemStackDistance?: number;
  stackPosition?: string;
  scaleEndPosition?: string;
  baseScale?: number;
  scaleDuration?: number;
  rotationAmount?: number;
  blurAmount?: number;
  useWindowScroll?: boolean;
  onStackComplete?: () => void;
}

// ── ScrollStackItem ────────────────────────────────────────────────────────────

export const ScrollStackItem = ({ children, itemClassName = "" }: ScrollStackItemProps) => (
  <div className={`scroll-stack-card ${itemClassName}`.trim()}>{children}</div>
);

// ── ScrollStack ────────────────────────────────────────────────────────────────
//
// Pinning is done with CSS `position: sticky` — the compositor keeps stuck
// cards locked to the viewport with zero frame lag, which JS-driven translateY
// pinning fundamentally cannot do (scroll events trail the compositor by a
// frame, producing visible jitter — especially under Lenis smooth scrolling
// and on mobile native scroll). JavaScript only drives the depth scale, where
// a frame of latency is imperceptible.

const ScrollStack = ({
  children,
  className = "",
  itemDistance      = 100,
  itemScale         = 0.03,
  itemStackDistance = 30,
  stackPosition     = "20%",
  scaleEndPosition  = "10%",
  baseScale         = 0.85,
  rotationAmount    = 0,
  blurAmount        = 0,
  useWindowScroll   = false,
  onStackComplete,
}: ScrollStackProps) => {
  const scrollerRef       = useRef<HTMLDivElement>(null);
  const cardsRef          = useRef<HTMLElement[]>([]);
  const naturalTopsRef    = useRef<number[]>([]);   // layout tops, scroll-space, sticky-independent
  const lastStylesRef     = useRef(new Map<number, { scale: number; rotation: number; blur: number }>());
  const stackCompletedRef = useRef(false);
  const measureRafRef     = useRef<number | null>(null);

  const parsePercentage = useCallback((value: string | number, containerHeight: number) => {
    if (typeof value === "string" && value.includes("%")) {
      return (parseFloat(value) / 100) * containerHeight;
    }
    return parseFloat(String(value));
  }, []);

  const getScrollData = useCallback(() => {
    if (useWindowScroll) {
      return { scrollTop: window.scrollY, containerHeight: window.innerHeight };
    }
    const el = scrollerRef.current!;
    return { scrollTop: el.scrollTop, containerHeight: el.clientHeight };
  }, [useWindowScroll]);

  // ── measure ─────────────────────────────────────────────────────────────────
  // offsetTop of a *stuck* sticky element includes the sticky displacement, so
  // cards are flipped to position:static for the read and restored before the
  // browser paints (all within one task — no visual flash). Runs on mount and
  // resize only; the per-scroll path does zero layout reads.

  const measure = useCallback(() => {
    const scroller = scrollerRef.current;
    const cards    = cardsRef.current;
    if (!scroller || !cards.length) return;

    const { containerHeight } = getScrollData();
    const stackPositionPx = parsePercentage(stackPosition, containerHeight);

    cards.forEach((card) => { card.style.position = "static"; });

    const scrollerBase = useWindowScroll
      ? scroller.getBoundingClientRect().top + window.scrollY
      : 0;
    // offsetParent is the scroller (position: relative), so offsetTop is
    // already in container scroll-space; window mode adds the doc offset.
    const tops    = cards.map((card) => scrollerBase + card.offsetTop);
    const heights = cards.map((card) => card.offsetHeight);

    cards.forEach((card, i) => {
      card.style.position = "sticky";
      card.style.top      = `${stackPositionPx + itemStackDistance * i}px`;
    });

    // Bottom spacer keeps the stack pinned through the same scroll distance as
    // the pre-sticky implementation (release at endTop - containerHeight/2).
    const last = cards.length - 1;
    const stickyTopLast = stackPositionPx + itemStackDistance * last;
    const spacer = Math.max(0, stickyTopLast + (heights[last] ?? 0) - containerHeight / 2);
    const endEl = scroller.querySelector<HTMLElement>(".scroll-stack-end");
    if (endEl) endEl.style.height = `${spacer}px`;

    naturalTopsRef.current = tops;
  }, [useWindowScroll, stackPosition, itemStackDistance, parsePercentage, getScrollData]);

  // ── per-scroll update: depth scale only (cheap — no layout reads) ───────────

  const updateCardStyles = useCallback(() => {
    const cards = cardsRef.current;
    const tops  = naturalTopsRef.current;
    if (!cards.length || tops.length !== cards.length) return;

    const { scrollTop, containerHeight } = getScrollData();
    const stackPositionPx    = parsePercentage(stackPosition, containerHeight);
    const scaleEndPositionPx = parsePercentage(scaleEndPosition, containerHeight);

    cards.forEach((card, i) => {
      const cardTop      = tops[i] ?? 0;
      const triggerStart = cardTop - stackPositionPx - itemStackDistance * i;
      const triggerEnd   = cardTop - scaleEndPositionPx;

      let progress = 0;
      if (scrollTop >= triggerEnd)        progress = 1;
      else if (scrollTop > triggerStart)  progress = (scrollTop - triggerStart) / (triggerEnd - triggerStart);

      const targetScale = baseScale + i * itemScale;
      const scale       = 1 - progress * (1 - targetScale);
      const rotation    = rotationAmount ? i * rotationAmount * progress : 0;

      let blur = 0;
      if (blurAmount) {
        let topCardIndex = 0;
        for (let j = 0; j < cards.length; j++) {
          const jTriggerStart = (tops[j] ?? 0) - stackPositionPx - itemStackDistance * j;
          if (scrollTop >= jTriggerStart) topCardIndex = j;
        }
        if (i < topCardIndex) blur = Math.max(0, (topCardIndex - i) * blurAmount);
      }

      const prev = lastStylesRef.current.get(i);
      const hasChanged =
        !prev ||
        Math.abs(prev.scale    - scale)    > 0.0005 ||
        Math.abs(prev.rotation - rotation) > 0.05   ||
        Math.abs(prev.blur     - blur)     > 0.05;

      if (hasChanged) {
        card.style.transform = `scale(${scale}) rotate(${rotation}deg)`;
        card.style.filter    = blur > 0 ? `blur(${blur}px)` : "";
        lastStylesRef.current.set(i, { scale, rotation, blur });
      }
    });

    // onStackComplete: fires while the last card is pinned
    const last = cards.length - 1;
    const lastTriggerStart = (tops[last] ?? 0) - stackPositionPx - itemStackDistance * last;
    const isInView = scrollTop >= lastTriggerStart;
    if (isInView && !stackCompletedRef.current) {
      stackCompletedRef.current = true;
      onStackComplete?.();
    } else if (!isInView && stackCompletedRef.current) {
      stackCompletedRef.current = false;
    }
  }, [
    itemScale, itemStackDistance, stackPosition, scaleEndPosition, baseScale,
    rotationAmount, blurAmount, onStackComplete, parsePercentage, getScrollData,
  ]);

  // ── mount ─────────────────────────────────────────────────────────────────────

  useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const cards = Array.from(
      scroller.querySelectorAll<HTMLElement>(".scroll-stack-card")
    );
    cardsRef.current = cards;
    const styleCache = lastStylesRef.current;

    cards.forEach((card, i) => {
      if (i < cards.length - 1) card.style.marginBottom = `${itemDistance}px`;
      // Each subsequent card sits visually on top of the previous one
      card.style.zIndex          = String(i + 1);
      card.style.willChange      = "transform";
      card.style.transformOrigin = "top center";
    });

    measure();
    updateCardStyles();

    // Scale updates ride the scroll event directly — the handler is cheap
    // (cached offsets, no layout reads), so no rAF deferral is needed.
    const scrollTarget: Window | HTMLElement = useWindowScroll ? window : scroller;
    const onScroll = () => updateCardStyles();
    scrollTarget.addEventListener("scroll", onScroll, { passive: true });

    // Re-measure on any size change (viewport, fonts, content)
    const onResize = () => {
      if (measureRafRef.current !== null) return;
      measureRafRef.current = requestAnimationFrame(() => {
        measureRafRef.current = null;
        measure();
        updateCardStyles();
      });
    };
    window.addEventListener("resize", onResize, { passive: true });
    const ro = new ResizeObserver(onResize);
    ro.observe(scroller);

    return () => {
      scrollTarget.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      ro.disconnect();
      if (measureRafRef.current !== null) cancelAnimationFrame(measureRafRef.current);
      stackCompletedRef.current = false;
      cardsRef.current          = [];
      naturalTopsRef.current    = [];
      styleCache.clear();
    };
  }, [itemDistance, useWindowScroll, measure, updateCardStyles]);

  // ── render ────────────────────────────────────────────────────────────────────

  return (
    <>
      <style>{`
        .scroll-stack-scroller {
          position: relative;
          width: 100%;
          ${useWindowScroll ? "" : `
            height: 100%;
            overflow-y: auto;
            overflow-x: visible;
            overscroll-behavior: contain;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
            -ms-overflow-style: none;
          `}
        }
        .scroll-stack-scroller::-webkit-scrollbar { display: none; }
        .scroll-stack-inner {
          ${useWindowScroll ? "" : "padding: 20vh 0 50rem; min-height: 100%;"}
        }
        .scroll-stack-card {
          position: sticky;
          transform-origin: top center;
          will-change: transform;
          width: 100%;
          box-sizing: border-box;
        }
        .scroll-stack-end { width: 100%; }
      `}</style>
      <div className={`scroll-stack-scroller ${className}`.trim()} ref={scrollerRef}>
        <div className="scroll-stack-inner">
          {children}
          <div className="scroll-stack-end" />
        </div>
      </div>
    </>
  );
};

export default ScrollStack;
