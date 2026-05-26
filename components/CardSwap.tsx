"use client";

import React, {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import gsap from "gsap";

// ── Public types ──────────────────────────────────────────────────────────────
export interface CardSwapHandle {
  swapForward: () => void;
  swapBack: () => void;
}

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  customClass?: string;
}

interface CardSwapProps {
  width?: number;
  height?: number;
  cardDistance?: number;
  verticalDistance?: number;
  delay?: number;
  pauseOnHover?: boolean;
  skewAmount?: number;
  easing?: "elastic" | "power";
  onCardClick?: (index: number) => void;
  /** Called with the new front card's index whenever a swap completes */
  onSwap?: (frontIndex: number) => void;
  /** Skip the automatic swap that fires on mount */
  skipInitialSwap?: boolean;
  children: React.ReactNode;
}

// ── Card ──────────────────────────────────────────────────────────────────────
export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ customClass, ...rest }, ref) => (
    <div
      ref={ref}
      {...rest}
      className={[
        "cs-card",
        customClass ?? "",
        rest.className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
    />
  )
);
Card.displayName = "Card";

// ── Geometry helpers ──────────────────────────────────────────────────────────
const mkSlot = (i: number, dx: number, dy: number, total: number) => ({
  x: i * dx,
  y: -i * dy,
  z: -i * dx * 1.5,
  zIndex: total - i,
});

const placeCard = (el: HTMLElement, s: ReturnType<typeof mkSlot>, skew: number) =>
  gsap.set(el, {
    x: s.x,
    y: s.y,
    z: s.z,
    xPercent: -50,
    yPercent: -50,
    skewY: skew,
    transformOrigin: "center center",
    zIndex: s.zIndex,
    force3D: true,
  });

// ── Animation config ──────────────────────────────────────────────────────────
const getConfig = (easing: "elastic" | "power") =>
  easing === "elastic"
    ? { ease: "elastic.out(0.5,0.8)", dur: 0.50 }
    : { ease: "power3.out",           dur: 0.38 };

// ── Component ─────────────────────────────────────────────────────────────────
const CardSwap = forwardRef<CardSwapHandle, CardSwapProps>(
  (
    {
      width = 500,
      height = 400,
      cardDistance = 60,
      verticalDistance = 70,
      delay = 5000,
      pauseOnHover = false,
      skewAmount = 6,
      easing = "elastic",
      onCardClick,
      onSwap,
      skipInitialSwap = false,
      children,
    },
    ref
  ) => {
    const cfg = useMemo(() => getConfig(easing), [easing]);
    const childArr = useMemo(() => Children.toArray(children), [children]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const refs = useMemo(
      () => childArr.map(() => React.createRef<HTMLDivElement>()),
      [childArr.length]
    );

    const order   = useRef<number[]>(Array.from({ length: childArr.length }, (_, i) => i));
    const tlRef   = useRef<gsap.core.Timeline | null>(null);
    const itvRef  = useRef<ReturnType<typeof setInterval> | null>(null);
    const locked  = useRef(false);
    // Queue: stores the LAST direction requested while locked (latest wins)
    const pendingDir = useRef<"fwd" | "bk" | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const fwdRef = useRef<() => void>(() => {});
    const bkRef  = useRef<() => void>(() => {});

    const total = refs.length;

    // ── Forward swap ──────────────────────────────────────────────────────────
    fwdRef.current = () => {
      if (order.current.length < 2) return;
      if (locked.current) { pendingDir.current = "fwd"; return; }
      locked.current = true;

      const [front, ...rest] = order.current;
      const elFront = refs[front].current!;
      const backSlot = mkSlot(total - 1, cardDistance, verticalDistance, total);

      const tl = gsap.timeline({
        onComplete: () => {
          locked.current = false;
          order.current = [...rest, front];
          const next = pendingDir.current;
          pendingDir.current = null;
          if (next === "fwd") fwdRef.current();
          else if (next === "bk") bkRef.current();
        },
      });
      tlRef.current = tl;

      // Front card: quick fade-out with slight drop
      tl.to(elFront, { opacity: 0, y: "+=24", duration: 0.16, ease: "power2.in" }, 0);

      // Advance other cards simultaneously; notify parent early
      if (rest.length > 0) {
        tl.call(() => { onSwap?.(rest[0]); }, undefined, 0.06);
      }
      rest.forEach((idx, i) => {
        const s = mkSlot(i, cardDistance, verticalDistance, total);
        tl.set(refs[idx].current!, { zIndex: s.zIndex }, 0);
        tl.to(refs[idx].current!, { x: s.x, y: s.y, z: s.z, duration: cfg.dur, ease: cfg.ease }, 0);
      });

      // Teleport front card to back slot (invisible), then fade in
      tl.call(() => {
        gsap.set(elFront, { x: backSlot.x, y: backSlot.y, z: backSlot.z, zIndex: backSlot.zIndex, opacity: 0 });
      }, undefined, 0.16);
      tl.to(elFront, { opacity: 1, duration: 0.18, ease: "power2.out" }, 0.20);
    };

    // ── Backward swap ─────────────────────────────────────────────────────────
    bkRef.current = () => {
      if (order.current.length < 2) return;
      if (locked.current) { pendingDir.current = "bk"; return; }
      locked.current = true;

      const arr  = order.current;
      const back = arr[arr.length - 1];
      const rest = arr.slice(0, -1);
      const elBack = refs[back].current!;
      const tl = gsap.timeline({
        onComplete: () => {
          locked.current = false;
          order.current = [back, ...rest];
          const next = pendingDir.current;
          pendingDir.current = null;
          if (next === "fwd") fwdRef.current();
          else if (next === "bk") bkRef.current();
        },
      });
      tlRef.current = tl;

      const frontSlot = mkSlot(0, cardDistance, verticalDistance, total);

      // Elevate back card above the stack, then slide it directly to the front
      tl.set(elBack, { zIndex: total + 1 }, 0);
      tl.to(elBack, { x: frontSlot.x, y: frontSlot.y, z: frontSlot.z, duration: cfg.dur, ease: "power3.out" }, 0);

      // Notify parent early — card is visually arriving at front
      tl.call(() => { onSwap?.(back); }, undefined, cfg.dur * 0.15);

      // Other cards shift back one slot simultaneously
      rest.forEach((idx, i) => {
        const s = mkSlot(i + 1, cardDistance, verticalDistance, total);
        tl.set(refs[idx].current!, { zIndex: s.zIndex }, 0);
        tl.to(refs[idx].current!, { x: s.x, y: s.y, z: s.z, duration: cfg.dur, ease: cfg.ease }, 0);
      });
    };

    const resetTimer = () => {
      if (itvRef.current) clearInterval(itvRef.current);
      itvRef.current = setInterval(() => fwdRef.current(), delay);
    };

    // Expose controls
    useImperativeHandle(ref, () => ({
      swapForward: () => { fwdRef.current(); resetTimer(); },
      swapBack:    () => { bkRef.current();  resetTimer(); },
    }));

    // Init
    useEffect(() => {
      refs.forEach((r, i) =>
        placeCard(r.current!, mkSlot(i, cardDistance, verticalDistance, total), skewAmount)
      );
      if (!skipInitialSwap) fwdRef.current();
      resetTimer();

      if (pauseOnHover) {
        const el = containerRef.current!;
        const pause  = () => { tlRef.current?.pause(); if (itvRef.current) clearInterval(itvRef.current); };
        const resume = () => { tlRef.current?.play(); resetTimer(); };
        el.addEventListener("mouseenter", pause);
        el.addEventListener("mouseleave", resume);
        return () => {
          el.removeEventListener("mouseenter", pause);
          el.removeEventListener("mouseleave", resume);
          if (itvRef.current) clearInterval(itvRef.current);
        };
      }
      return () => { if (itvRef.current) clearInterval(itvRef.current); };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cardDistance, verticalDistance, delay, pauseOnHover, skewAmount, easing, skipInitialSwap]);

    const rendered = childArr.map((child, i) =>
      isValidElement(child)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ? cloneElement(child as React.ReactElement<any>, {
            key: i,
            ref: refs[i],
            style: {
              width,
              height,
              ...(((child as React.ReactElement<{ style?: React.CSSProperties }>).props).style ?? {}),
            },
            onClick: (e: React.MouseEvent<HTMLDivElement>) => {
              ((child as React.ReactElement<CardProps>).props).onClick?.(e);
              onCardClick?.(i);
            },
          })
        : child
    );

    return (
      <>
        <style>{`
          .cs-container { position: relative; perspective: 900px; }
          .cs-card      { position: absolute; top: 50%; left: 50%; will-change: transform; }
        `}</style>
        <div ref={containerRef} className="cs-container" style={{ width, height }}>
          {rendered}
        </div>
      </>
    );
  }
);
CardSwap.displayName = "CardSwap";

export default CardSwap;
