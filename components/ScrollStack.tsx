"use client";

import { useLayoutEffect, useRef, useCallback } from "react";
import React from "react";
import Lenis from "lenis";

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

const ScrollStack = ({
  children,
  className = "",
  itemDistance      = 100,
  itemScale         = 0.03,
  itemStackDistance = 30,
  stackPosition     = "20%",
  scaleEndPosition  = "10%",
  baseScale         = 0.85,
  scaleDuration     = 0.5,
  rotationAmount    = 0,
  blurAmount        = 0,
  useWindowScroll   = false,
  onStackComplete,
}: ScrollStackProps) => {
  const scrollerRef       = useRef<HTMLDivElement>(null);
  const stackCompletedRef = useRef(false);
  const animationFrameRef = useRef<number | null>(null);
  const lenisRef          = useRef<Lenis | null>(null);
  const cardsRef          = useRef<HTMLElement[]>([]);
  const lastTransformsRef = useRef(new Map<number, {
    translateY: number; scale: number; rotation: number; blur: number;
  }>());
  const isUpdatingRef = useRef(false);

  // ── helpers ─────────────────────────────────────────────────────────────────

  const calculateProgress = useCallback((scrollTop: number, start: number, end: number) => {
    if (scrollTop < start) return 0;
    if (scrollTop > end)   return 1;
    return (scrollTop - start) / (end - start);
  }, []);

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

  // ── animation ────────────────────────────────────────────────────────────────
  // IMPORTANT: we use element.offsetTop (layout position, NOT affected by CSS
  // transforms) to avoid a feedback loop where reading getBoundingClientRect()
  // on a transformed card feeds a wrong value back into the next frame.
  // For window-scroll mode we anchor offsetTop to the scroller's stable page
  // position (scroller itself has no transforms so its getBCR is always correct).

  const updateCardTransforms = useCallback(() => {
    if (!cardsRef.current.length || isUpdatingRef.current) return;
    isUpdatingRef.current = true;

    const { scrollTop, containerHeight } = getScrollData();
    const stackPositionPx    = parsePercentage(stackPosition, containerHeight);
    const scaleEndPositionPx = parsePercentage(scaleEndPosition, containerHeight);

    // Scroller has position:relative but zero transforms — getBCR is stable.
    const scrollerAbsTop = useWindowScroll && scrollerRef.current
      ? scrollerRef.current.getBoundingClientRect().top + window.scrollY
      : 0;

    // layout offset unaffected by any child transform
    const layoutTop = (el: HTMLElement) =>
      useWindowScroll ? scrollerAbsTop + el.offsetTop : el.offsetTop;

    const endElement = useWindowScroll
      ? document.querySelector<HTMLElement>(".scroll-stack-end")
      : scrollerRef.current?.querySelector<HTMLElement>(".scroll-stack-end");

    const endElementTop = endElement ? layoutTop(endElement) : 0;

    cardsRef.current.forEach((card, i) => {
      if (!card) return;

      const cardTop      = layoutTop(card);
      const triggerStart = cardTop - stackPositionPx - itemStackDistance * i;
      const triggerEnd   = cardTop - scaleEndPositionPx;
      const pinStart     = triggerStart;
      const pinEnd       = endElementTop - containerHeight / 2;

      const scaleProgress = calculateProgress(scrollTop, triggerStart, triggerEnd);
      const targetScale   = baseScale + i * itemScale;
      const scale         = 1 - scaleProgress * (1 - targetScale);
      const rotation      = rotationAmount ? i * rotationAmount * scaleProgress : 0;

      let blur = 0;
      if (blurAmount) {
        let topCardIndex = 0;
        for (let j = 0; j < cardsRef.current.length; j++) {
          const jCardTop      = layoutTop(cardsRef.current[j]);
          const jTriggerStart = jCardTop - stackPositionPx - itemStackDistance * j;
          if (scrollTop >= jTriggerStart) topCardIndex = j;
        }
        if (i < topCardIndex) blur = Math.max(0, (topCardIndex - i) * blurAmount);
      }

      let translateY = 0;
      const isPinned = scrollTop >= pinStart && scrollTop <= pinEnd;

      if (isPinned) {
        translateY = scrollTop - cardTop + stackPositionPx + itemStackDistance * i;
      } else if (scrollTop > pinEnd) {
        translateY = pinEnd - cardTop + stackPositionPx + itemStackDistance * i;
      }

      const newTransform = {
        translateY: Math.round(translateY * 100) / 100,
        scale:      Math.round(scale * 1000) / 1000,
        rotation:   Math.round(rotation * 100) / 100,
        blur:       Math.round(blur * 100) / 100,
      };

      const prev = lastTransformsRef.current.get(i);
      const hasChanged =
        !prev ||
        Math.abs(prev.translateY - newTransform.translateY) > 0.1  ||
        Math.abs(prev.scale     - newTransform.scale)      > 0.001 ||
        Math.abs(prev.rotation  - newTransform.rotation)   > 0.1   ||
        Math.abs(prev.blur      - newTransform.blur)        > 0.1;

      if (hasChanged) {
        card.style.transform = `translate3d(0, ${newTransform.translateY}px, 0) scale(${newTransform.scale}) rotate(${newTransform.rotation}deg)`;
        card.style.filter    = newTransform.blur > 0 ? `blur(${newTransform.blur}px)` : "";
        lastTransformsRef.current.set(i, newTransform);
      }

      if (i === cardsRef.current.length - 1) {
        const isInView = scrollTop >= pinStart && scrollTop <= pinEnd;
        if (isInView && !stackCompletedRef.current) {
          stackCompletedRef.current = true;
          onStackComplete?.();
        } else if (!isInView && stackCompletedRef.current) {
          stackCompletedRef.current = false;
        }
      }
    });

    isUpdatingRef.current = false;
  }, [
    itemScale, itemStackDistance, stackPosition, scaleEndPosition, baseScale,
    rotationAmount, blurAmount, useWindowScroll, onStackComplete,
    calculateProgress, parsePercentage, getScrollData,
  ]);

  const handleScroll = useCallback(() => updateCardTransforms(), [updateCardTransforms]);

  // ── scroll driver ────────────────────────────────────────────────────────────
  // useWindowScroll = true  → native window scroll + rAF (no Lenis, avoids GSAP conflicts)
  // useWindowScroll = false → Lenis on the internal container (smooth, scrollbar hidden)

  const setupScrollDriver = useCallback(() => {
    if (useWindowScroll) {
      const onScroll = () => {
        if (animationFrameRef.current !== null) cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = requestAnimationFrame(() => {
          handleScroll();
          animationFrameRef.current = null;
        });
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      return () => window.removeEventListener("scroll", onScroll);
    } else {
      const scroller = scrollerRef.current;
      if (!scroller) return () => {};

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const lenis = new Lenis({
        wrapper:         scroller,
        content:         scroller.querySelector(".scroll-stack-inner") as HTMLElement,
        duration:        1.2,
        easing:          (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel:     true,
        touchMultiplier: 2,
        infinite:        false,
        wheelMultiplier: 1,
        lerp:            0.1,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      lenis.on("scroll", handleScroll);

      const raf = (time: number) => {
        lenis.raf(time);
        animationFrameRef.current = requestAnimationFrame(raf);
      };
      animationFrameRef.current = requestAnimationFrame(raf);
      lenisRef.current = lenis;

      return () => {
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        lenis.destroy();
        lenisRef.current = null;
      };
    }
  }, [handleScroll, useWindowScroll]);

  // ── mount ─────────────────────────────────────────────────────────────────────

  useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const cards = Array.from(
      useWindowScroll
        ? document.querySelectorAll<HTMLElement>(".scroll-stack-card")
        : scroller.querySelectorAll<HTMLElement>(".scroll-stack-card")
    );
    cardsRef.current = cards;
    const cache = lastTransformsRef.current;

    cards.forEach((card, i) => {
      if (i < cards.length - 1) card.style.marginBottom = `${itemDistance}px`;
      // Each subsequent card sits visually on top of the previous one
      card.style.zIndex            = String(i + 1);
      card.style.willChange         = "transform, filter";
      card.style.transformOrigin    = "top center";
      card.style.backfaceVisibility = "hidden";
      card.style.transform          = "translateZ(0)";
    });

    const cleanup = setupScrollDriver();
    updateCardTransforms();

    return () => {
      cleanup?.();
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      stackCompletedRef.current = false;
      cardsRef.current          = [];
      cache.clear();
      isUpdatingRef.current     = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    itemDistance, itemScale, itemStackDistance, stackPosition, scaleEndPosition,
    baseScale, scaleDuration, rotationAmount, blurAmount, useWindowScroll,
    onStackComplete, setupScrollDriver, updateCardTransforms,
  ]);

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
          -webkit-transform: translateZ(0);
          transform: translateZ(0);
        }
        .scroll-stack-scroller::-webkit-scrollbar { display: none; }
        .scroll-stack-inner {
          ${useWindowScroll
            ? ""
            : "padding: 20vh 0 50rem; min-height: 100%;"}
        }
        .scroll-stack-card {
          transform-origin: top center;
          will-change: transform, filter;
          backface-visibility: hidden;
          width: 100%;
          box-sizing: border-box;
          position: relative;
        }
        .scroll-stack-end { width: 100%; height: 1px; }
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
