"use client";

import { useEffect, useRef, useState } from "react";
import Aurora from "@/components/Aurora";

type UploadState = "idle" | "uploading" | "success" | "error";
type BriefFormData = { name: string; email: string; company: string; brief: string };

const FOLDER_IMAGES = [
  "/folder-images/1.webp",
  "/folder-images/2.webp",
  "/folder-images/3.webp",
];

// ── 3D folder with fanning images ─────────────────────────────────────────────
function AnimatedFolder({ isHovered, scale = 1 }: { isHovered: boolean; scale?: number }) {
  const W = Math.round(88 * scale), H = Math.round(64 * scale);
  const tabW = Math.round(W * 0.35);
  const tabH = Math.round(H * 0.25);
  const ease = "cubic-bezier(0.16, 1, 0.3, 1)";

  return (
    <div style={{ perspective: "1000px", pointerEvents: "none" }}>
      <div style={{ position: "relative", width: W, height: H, transformStyle: "preserve-3d" }}>

        {/* Folder back body */}
        <div style={{
          position: "absolute", inset: 0, borderRadius: 6,
          background: "linear-gradient(to bottom, #D99A29, #B57C1A)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
        }}>
          {/* Tab */}
          <div style={{
            position: "absolute", left: 4, top: -(tabH * 0.8),
            width: tabW, height: tabH, borderRadius: "4px 4px 0 0",
            background: "linear-gradient(to bottom, #E8A82D, #D99A29)",
          }} />
        </div>

        {/* Stacked preview images */}
        {FOLDER_IMAGES.map((src, i) => {
          const x  = isHovered ? (i - 1) * Math.round(45 * scale)  : 0;
          const y  = isHovered ? -Math.round(65 * scale) - (2 - i) * Math.round(5 * scale) : -6 - (2 - i) * 2;
          const r  = isHovered ? (i - 1) * 15  : (i - 1) * 3;
          const w  = isHovered ? Math.round(112 * scale) : Math.round(52 * scale);
          const h  = isHovered ? Math.round(76  * scale) : Math.round(36 * scale);
          const d  = `${i * 0.035}s`;
          return (
            <div
              key={i}
              style={{
                position: "absolute", top: 4, left: "50%",
                transformOrigin: "bottom center",
                overflow: "hidden", borderRadius: 6,
                background: "#000",
                boxShadow: "0 1px 4px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.08)",
                zIndex: 10 + i,
                width: w, height: h,
                transform: `translateX(calc(-50% + ${x}px)) translateY(${y}px) rotate(${r}deg)`,
                transition: `transform 0.42s ${ease} ${d}, width 0.42s ${ease} ${d}, height 0.42s ${ease} ${d}`,
              }}
            >
              <img
                src={src} alt=""
                style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.9, display: "block" }}
              />
            </div>
          );
        })}

        {/* Folder lid — rotates open on hover */}
        <div style={{
          position: "absolute", left: 0, right: 0, bottom: 0,
          height: "85%", transformOrigin: "bottom center", borderRadius: 6,
          background: "linear-gradient(to bottom, #F2C154, #E8A82D)",
          boxShadow: "0 -2px 15px rgba(0,0,0,0.3)",
          transform: `rotateX(${isHovered ? -45 : -20}deg) scaleY(${isHovered ? 0.85 : 1})`,
          transition: `transform 0.42s ${ease}`,
          transformStyle: "preserve-3d",
          zIndex: 20,
        }}>
          <div style={{ position: "absolute", top: 4, left: 4, right: 4, height: 1, background: "rgba(255,255,255,0.28)" }} />
        </div>

      </div>
    </div>
  );
}

// =============================================================================
export default function BriefCTASection() {
  const [isHovered,    setIsHovered]    = useState(false);
  const [uploadState,  setUploadState]  = useState<UploadState>("idle");
  const [progress,     setProgress]     = useState(0);
  const [isModalOpen,  setIsModalOpen]  = useState(false);
  const [isDragOver,   setIsDragOver]   = useState(false);
  const [files,        setFiles]        = useState<File[]>([]);
  const [uploadMsg,    setUploadMsg]    = useState("");
  const [formData,     setFormData]     = useState<BriefFormData>({ name: "", email: "", company: "", brief: "" });
  const [isMobile,     setIsMobile]     = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth <= 768);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Escape key closes modal
  useEffect(() => {
    if (!isModalOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setIsModalOpen(false); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isModalOpen]);

  // Prevent background scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = isModalOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isModalOpen]);

  const appendFiles = (list: FileList | null) => {
    if (!list) return;
    const incoming = Array.from(list).filter(f => f.size > 0);
    if (!incoming.length) return;
    setFiles(prev => {
      const key = (f: File) => `${f.name}-${f.size}-${f.lastModified}`;
      const seen = new Set(prev.map(key));
      const merged = [...prev];
      incoming.forEach(f => { const k = key(f); if (!seen.has(k)) { seen.add(k); merged.push(f); } });
      return merged;
    });
  };

  const removeFile = (i: number) => setFiles(prev => prev.filter((_, idx) => idx !== i));

  const openModal = () => {
    if (uploadState === "uploading") return;
    setUploadMsg("");
    setIsModalOpen(true);
  };

  const sendBrief = async () => {
    if (uploadState === "uploading") return;
    if (!formData.email.trim()) { setUploadMsg("Please enter your email so we can reply."); return; }
    if (!formData.brief.trim() && files.length === 0) { setUploadMsg("Add a brief or attach at least one file."); return; }

    setUploadState("uploading");
    setProgress(0);
    setIsHovered(false);
    setIsModalOpen(false);
    setUploadMsg("");

    const body = new FormData();
    body.append("name",    formData.name.trim());
    body.append("email",   formData.email.trim());
    body.append("company", formData.company.trim());
    body.append("brief",   formData.brief.trim());
    files.forEach(f => body.append("files", f));

    await new Promise<void>(resolve => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/brief-submit");
      xhr.upload.onprogress = (e) => {
        if (!e.lengthComputable) return;
        setProgress(p => Math.max(p, Math.floor((e.loaded / e.total) * 97)));
      };
      xhr.onload = () => {
        if (xhr.status < 200 || xhr.status >= 300) {
          setUploadState("error");
          setUploadMsg("Upload failed. Please try again.");
          setProgress(0);
          resolve();
          return;
        }
        setProgress(100);
        setUploadState("success");
        window.setTimeout(() => {
          setUploadState("idle");
          setProgress(0);
          setFormData({ name: "", email: "", company: "", brief: "" });
          setFiles([]);
        }, 2400);
        resolve();
      };
      xhr.onerror = () => {
        setUploadState("error");
        setUploadMsg("Network error. Please try again.");
        setProgress(0);
        resolve();
      };
      xhr.send(body);
    });
  };

  const isIdle      = uploadState === "idle";
  const isUploading = uploadState === "uploading";
  const isSuccess   = uploadState === "success";
  const isError     = uploadState === "error";

  // Card & button appearance driven by state
  const cardBg = isSuccess ? "rgba(34,197,94,0.02)"
    : isUploading ? "rgba(255,128,21,0.02)"
    : isHovered   ? "rgba(255,128,21,0.015)"
    : "rgba(5,5,5,0.3)";

  const strokeColor = isSuccess  ? "rgba(34,197,94,0.45)"
    : isUploading  ? "rgba(255,128,21,0.45)"
    : isHovered    ? "rgba(255,128,21,0.55)"
    : "rgba(80,80,80,0.7)";

  const btnBg = isIdle
    ? (isHovered ? "#ffffff" : "rgba(10,10,10,0.85)")
    : isUploading ? "rgba(10,10,10,0.85)"
    : isSuccess   ? "rgba(34,197,94,0.1)"
    : "rgba(239,68,68,0.1)";

  const btnColor = isIdle
    ? (isHovered ? "#000" : "#fff")
    : isUploading ? "#fff"
    : isSuccess   ? "rgb(74,222,128)"
    : "rgb(252,165,165)";

  const btnBorder = isIdle
    ? (isHovered ? "1px solid rgba(255,255,255,1)" : "1px solid rgba(255,255,255,0.2)")
    : isUploading ? "1px solid #333"
    : isSuccess   ? "1px solid rgba(34,197,94,0.9)"
    : "1px solid rgba(239,68,68,0.9)";

  return (
    <section
      id="brief-cta"
      style={{
        position: "relative", width: "100%", background: "#020202",
        color: "#fff", overflow: "hidden", zIndex: 10,
        padding: "clamp(64px, 10vw, 180px) clamp(16px, 3vw, 48px)",
        display: "flex", justifyContent: "center",
      }}
    >
      <style>{`
        @keyframes briefTextFlow {
          0%   { background-position: 0% center; }
          100% { background-position: -200% center; }
        }
        @keyframes briefFadeUp {
          0%   { opacity: 0; transform: translateY(16px); filter: blur(4px); }
          100% { opacity: 1; transform: translateY(0);    filter: blur(0); }
        }
        @keyframes briefSuccessPop {
          0%   { transform: scale(0.95); box-shadow: 0 0 0 0   rgba(34,197,94,0.35); }
          50%  { transform: scale(1.02); box-shadow: 0 0 0 18px rgba(34,197,94,0); }
          100% { transform: scale(1);    box-shadow: 0 0 0 0   rgba(34,197,94,0); }
        }
        @keyframes briefDrawCheck {
          0%   { stroke-dashoffset: 24; }
          100% { stroke-dashoffset: 0; }
        }

        .brief-text-flow {
          background: linear-gradient(to right, #ff8015, #ff5315, #ff8015);
          background-size: 200% auto;
          animation: briefTextFlow 4s linear infinite;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .brief-fade-up    { animation: briefFadeUp    0.35s cubic-bezier(0.16,1,0.3,1) forwards; }
        .brief-success-pop { animation: briefSuccessPop 0.5s cubic-bezier(0.16,1,0.3,1) forwards; }
        .brief-draw-check {
          stroke-dasharray: 24;
          animation: briefDrawCheck 0.5s cubic-bezier(0.16,1,0.3,1) forwards 0.1s;
        }

        /* ── Modal ── */
        .brief-overlay {
          position: fixed; inset: 0; z-index: 200;
          display: flex; align-items: center; justify-content: center;
          padding: clamp(12px, 2vw, 24px);
          background: rgba(0,0,0,0.75);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
        }
        .brief-panel {
          width: min(100%, 820px);
          max-height: min(92vh, 840px);
          border-radius: 20px;
          border: 1px solid rgba(255,255,255,0.09);
          background: linear-gradient(160deg, #111 0%, #080808 100%);
          box-shadow: 0 40px 140px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.04);
          overflow: hidden;
          display: flex; flex-direction: column;
        }
        .brief-panel-header {
          display: flex; align-items: center; justify-content: space-between; gap: 16px;
          padding: 24px 32px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          flex-shrink: 0;
        }
        .brief-panel-body {
          padding: 28px 32px 32px;
          display: flex; flex-direction: column; gap: 20px;
          overflow-y: auto; flex: 1;
          scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.18) transparent;
        }
        .brief-panel-body::-webkit-scrollbar { width: 5px; }
        .brief-panel-body::-webkit-scrollbar-track { background: transparent; }
        .brief-panel-body::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.14); border-radius: 10px; }
        .brief-grid-2 { display: grid; grid-template-columns: 1fr; gap: 16px; }
        @media (min-width: 640px) { .brief-grid-2 { grid-template-columns: 1fr 1fr; } }
        .brief-input, .brief-textarea {
          width: 100%; border-radius: 12px; box-sizing: border-box;
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);
          color: #fff; font-size: 15px; outline: none; font-family: inherit;
          transition: border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
        }
        .brief-input { height: 50px; padding: 0 16px; }
        .brief-textarea { min-height: 150px; padding: 14px 16px; line-height: 1.55; resize: vertical; }
        .brief-input::placeholder, .brief-textarea::placeholder { color: rgba(255,255,255,0.3); }
        .brief-input:focus, .brief-textarea:focus {
          border-color: #ff8015; background: rgba(255,255,255,0.04);
          box-shadow: 0 0 0 3px rgba(255,128,21,0.12);
        }
        .brief-dropzone {
          border-radius: 14px; border: 2px dashed rgba(255,255,255,0.13);
          background: rgba(255,255,255,0.015); padding: 28px 20px;
          transition: border-color 0.18s ease, background 0.18s ease;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          text-align: center; cursor: pointer;
        }
        .brief-dropzone:hover { border-color: rgba(255,255,255,0.28); background: rgba(255,255,255,0.03); }
        .brief-dropzone.drag-active { border-color: #ff8015; background: rgba(255,128,21,0.07); }
        .brief-actions {
          display: flex; align-items: center; justify-content: flex-end; gap: 12px;
          padding-top: 20px; margin-top: 4px; border-top: 1px solid rgba(255,255,255,0.07);
          flex-shrink: 0;
        }
        .brief-btn {
          height: 46px; padding: 0 22px; border-radius: 11px;
          font-size: 14px; font-weight: 600; line-height: 1; white-space: nowrap; letter-spacing: 0.01em;
          display: inline-flex; align-items: center; justify-content: center;
          cursor: pointer; border: none; font-family: inherit; transition: all 0.18s ease;
        }
        .brief-btn-cancel {
          background: transparent; border: 1px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.65);
        }
        .brief-btn-cancel:hover { background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.2); color: #fff; }
        .brief-btn-send {
          background: #ff8015; color: #000;
          box-shadow: 0 0 20px rgba(255,128,21,0.28);
        }
        .brief-btn-send:hover { background: #ff9535; box-shadow: 0 0 28px rgba(255,128,21,0.4); }
        .brief-file-row {
          display: flex; align-items: center; justify-content: space-between;
          border-radius: 10px; background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08); padding: 10px 14px;
        }
        .brief-file-remove {
          font-size: 13px; color: rgba(255,255,255,0.38); font-weight: 600;
          background: none; border: none; cursor: pointer; flex-shrink: 0; transition: color 0.15s ease;
        }
        .brief-file-remove:hover { color: rgb(248,113,113); }

        /* ── Mobile card sizing ── */
        @media (max-width: 768px) {
          .brief-upload-card {
            min-height: 0 !important;
            padding: clamp(28px, 5vw, 40px) clamp(16px, 4vw, 28px) clamp(28px, 5vw, 40px) !important;
            border-radius: 20px !important;
          }
          .brief-folder-wrap { display: none !important; }
          .brief-helper-text { display: none !important; }
          .brief-dash-border rect { stroke-opacity: 0.35; stroke-dasharray: 5 7; }
        }

        /* ── Mobile modal ── */
        @media (max-width: 600px) {
          .brief-overlay { padding: 0; align-items: flex-end; }
          .brief-panel {
            width: 100%; max-height: 92dvh;
            border-radius: 20px 20px 0 0;
          }
          .brief-panel-header { padding: 16px 18px; }
          .brief-panel-body   { padding: 18px 18px 20px; gap: 14px; }
          .brief-input  { height: 48px; font-size: 16px; }
          .brief-textarea { min-height: 110px; font-size: 16px; }
          .brief-actions { padding-top: 14px; gap: 8px; }
          .brief-btn    { height: 48px; font-size: 14px; }
          .brief-dropzone { padding: 20px 12px; }
          .brief-grid-2 { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* Section top gradient — hides 1px boundary artifact vs. MasonryGallery */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 48,
        background: "linear-gradient(to bottom, #000 0%, transparent 100%)",
        zIndex: 5, pointerEvents: "none",
      }} />

      {/* Aurora WebGL glow */}
      <Aurora
        colorStops={["#F97316", "#F97316", "#EF4444"]}
        amplitude={1.1}
        blend={0.52}
        speed={0.5}
      />

      {/* ── Content ── */}
      <div style={{
        position: "relative", zIndex: 10, width: "100%", maxWidth: 1400,
        margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center",
      }}>

        {/* Header */}
        <div style={{ width: "100%", maxWidth: 1120, margin: "0 auto", textAlign: "center", marginBottom: "clamp(24px, 4vw, 60px)" }}>
          <h2 style={{
            fontFamily: "var(--font-cormorant, 'Cormorant Garamond', Georgia, serif)",
            fontSize: "clamp(36px, 6vw, 88px)",
            fontWeight: 300,
            color: "#fff",
            letterSpacing: "-0.02em",
            lineHeight: 1.05,
            margin: 0,
          }}>
            <span className="brief-text-flow">Unbelievable</span> right?
          </h2>
          <p style={{
            fontFamily: "var(--font-family)",
            marginTop: "clamp(10px, 2vw, 18px)",
            fontSize: "clamp(14px, 1.6vw, 22px)",
            lineHeight: 1.45,
            fontWeight: 400,
            color: "rgba(255,255,255,0.45)",
            letterSpacing: "0.01em",
          }}>
            Send Us Your Idea &amp; We&apos;ll Bring It To Life.
          </p>
        </div>

        {/* ── Upload card ── */}
        <div
          onClick={openModal}
          onMouseEnter={() => isIdle && setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="brief-upload-card"
          style={{
            position: "relative",
            width: "100%", maxWidth: 1120,
            borderRadius: 32,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            padding: "clamp(44px, 7vw, 80px) clamp(20px, 4vw, 40px)",
            minHeight: "clamp(240px, 30vw, 380px)",
            cursor: isIdle ? "pointer" : isUploading ? "wait" : "default",
            transition: "background 0.6s ease, box-shadow 0.6s ease",
            background: cardBg,
            boxShadow: isSuccess ? "inset 0 0 80px rgba(34,197,94,0.04)"
              : isUploading ? "inset 0 0 80px rgba(255,95,31,0.04)"
              : "inset 0 0 60px rgba(0,0,0,0.55)",
          }}
        >
          {/* Dashed SVG border */}
          <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0 }}>
            <svg className="brief-dash-border" width="100%" height="100%" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
              <rect
                x="1" y="1" width="calc(100% - 2px)" height="calc(100% - 2px)"
                rx="30" fill="none" strokeWidth="1.5" strokeDasharray={isMobile ? "6 8" : "10 10"}
                stroke={strokeColor}
                style={{ transition: "stroke 0.6s ease" }}
              />
            </svg>
          </div>

          {/* Folder animation — visible only in idle state.
              Container is tall enough (folder + max fan height ~80px) with folder
              anchored to the bottom, so fanned images stay within bounds. No overflow:hidden. */}
          <div className="brief-folder-wrap" style={{
            position: "relative", zIndex: 20,
            display: "flex", justifyContent: "center", alignItems: "flex-end", width: "100%",
            height: isIdle ? "clamp(120px, 14vw, 175px)" : 0,
            marginBottom: isIdle ? "clamp(14px, 2vw, 24px)" : 0,
            opacity: isIdle ? 1 : 0,
            transform: isIdle ? "translateY(0)" : "translateY(20px)",
            pointerEvents: "none",
            transition: "opacity 0.45s ease, transform 0.45s ease, height 0.45s ease, margin-bottom 0.45s ease",
          }}>
            <AnimatedFolder isHovered={isHovered} scale={1} />
          </div>

          {/* Button area */}
          <div style={{ position: "relative", zIndex: 40 }}>
            {/* White glow on hover */}
            <div style={{
              position: "absolute", inset: -10, borderRadius: 9999,
              background: "rgba(255,255,255,0.28)", filter: "blur(18px)",
              opacity: isHovered && isIdle ? 1 : 0,
              transition: "opacity 0.5s ease",
              pointerEvents: "none",
            }} />
            {/* Orange ambient glow at rest */}
            <div style={{
              position: "absolute", inset: -10, borderRadius: 9999,
              background: "linear-gradient(to right, transparent, rgba(255,128,21,0.38), transparent)",
              filter: "blur(16px)",
              opacity: isIdle && !isHovered ? 0.45 : 0,
              transition: "opacity 0.5s ease",
              pointerEvents: "none",
            }} />
            {/* Success glow */}
            <div style={{
              position: "absolute", inset: -10, borderRadius: 9999,
              background: "rgba(34,197,94,0.38)", filter: "blur(16px)",
              opacity: isSuccess ? 1 : 0,
              transition: "opacity 0.5s ease",
              pointerEvents: "none",
            }} />

            <button
              type="button"
              disabled={isUploading}
              className={isSuccess ? "brief-success-pop" : ""}
              style={{
                position: "relative",
                minWidth: "clamp(220px, 24vw, 340px)",
                minHeight: "clamp(48px, 4.5vw, 58px)",
                padding: "0 clamp(32px, 5vw, 56px)",
                borderRadius: 9999,
                fontFamily: "var(--font-family)",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.16em",
                fontSize: "clamp(12px, 1.1vw, 14px)",
                overflow: "hidden",
                display: "flex", alignItems: "center", justifyContent: "center",
                backdropFilter: "blur(12px)",
                cursor: isUploading ? "wait" : "pointer",
                background: btnBg,
                color: btnColor,
                border: btnBorder,
                boxShadow: isHovered && isIdle ? "0 0 40px rgba(255,255,255,0.25)" : undefined,
                transition: "background 0.45s ease, color 0.45s ease, border-color 0.45s ease, box-shadow 0.45s ease",
              }}
            >
              {/* Upload progress bar */}
              {isUploading && (
                <div style={{
                  position: "absolute", bottom: 0, left: 0, height: 2,
                  background: "#ff8015", width: `${progress}%`,
                  transition: "width 0.08s linear",
                }}>
                  <div style={{ position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)", width: 14, height: 8, background: "#ff8015", filter: "blur(4px)" }} />
                </div>
              )}

              {/* Top edge glint */}
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0, height: 1,
                background: isSuccess
                  ? "linear-gradient(to right, transparent, rgba(34,197,94,0.5), transparent)"
                  : "linear-gradient(to right, transparent, rgba(255,255,255,0.45), transparent)",
                pointerEvents: "none",
              }} />

              <span style={{ position: "relative", zIndex: 10, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, width: "100%" }}>
                {isIdle && "Upload Brief"}

                {isUploading && (
                  <span style={{ display: "flex", alignItems: "center", gap: 14, justifyContent: "center" }}>
                    <svg style={{ width: 20, height: 20, transform: "rotate(-90deg)", flexShrink: 0 }} viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.1)" strokeWidth="3" fill="none" />
                      <circle cx="12" cy="12" r="10" stroke="#ff8015" strokeWidth="3" fill="none"
                        strokeDasharray="62.83"
                        strokeDashoffset={62.83 - (62.83 * progress) / 100}
                        style={{ transition: "stroke-dashoffset 0.08s linear" }}
                      />
                    </svg>
                    <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ color: "#888" }}>Uploading</span>
                      <span style={{ fontFamily: "monospace", color: "#ff8015", minWidth: "3.5ch", textAlign: "right" }}>
                        {Math.floor(progress)}%
                      </span>
                    </span>
                  </span>
                )}

                {isSuccess && (
                  <>
                    <svg width="20" height="20" fill="none" stroke="rgb(74,222,128)" viewBox="0 0 24 24">
                      <path className="brief-draw-check" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" strokeDashoffset="24" />
                    </svg>
                    Uploaded
                  </>
                )}

                {isError && "Retry Upload"}
              </span>
            </button>
          </div>

          {/* Bottom helper text */}
          <div className="brief-helper-text" style={{
            position: "absolute", bottom: "clamp(16px, 2.5vw, 26px)", left: "50%",
            transform: "translateX(-50%)", zIndex: 10,
            opacity: isIdle ? 1 : 0,
            transition: "opacity 0.45s ease",
            pointerEvents: "none",
          }}>
            <span style={{
              color: isHovered ? "rgba(255,128,21,0.75)" : "rgba(140,140,140,0.9)",
              fontSize: "clamp(10px, 0.9vw, 13px)",
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              fontFamily: "var(--font-family)",
              fontWeight: 600,
              whiteSpace: "nowrap",
              transition: "color 0.4s ease",
            }}>
              Click &amp; Share your brief with us
            </span>
          </div>
        </div>

        {isError && uploadMsg && (
          <p style={{ marginTop: 14, fontSize: 13, color: "rgb(248,113,113)", fontFamily: "monospace", letterSpacing: "0.05em" }}>
            {uploadMsg}
          </p>
        )}
      </div>

      {/* ── Modal ── */}
      {isModalOpen && (
        <div className="brief-overlay" onClick={() => setIsModalOpen(false)}>
          <div
            className="brief-panel brief-fade-up"
            style={{ fontFamily: "var(--font-family)" }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="brief-panel-header">
              <h3 style={{
                fontFamily: "var(--font-cormorant, 'Cormorant Garamond', Georgia, serif)",
                fontSize: "clamp(22px, 3vw, 30px)",
                fontWeight: 400,
                color: "#fff",
                margin: 0,
                letterSpacing: "-0.01em",
              }}>
                Enter your Idea
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{
                  flexShrink: 0, width: 36, height: 36, borderRadius: 9999,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.55)", cursor: "pointer", fontSize: 15,
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "#fff"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "rgba(255,255,255,0.55)"; }}
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="brief-panel-body">
              <div className="brief-grid-2">
                <input type="text" placeholder="Your name" value={formData.name}
                  onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                  className="brief-input" />
                <input type="email" placeholder="Work email *" value={formData.email}
                  onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                  className="brief-input" />
              </div>

              <input type="text" placeholder="Company" value={formData.company}
                onChange={e => setFormData(p => ({ ...p, company: e.target.value }))}
                className="brief-input" style={{ width: "100%", boxSizing: "border-box" }} />

              <textarea
                placeholder="Type your brief here — goals, audience, channels, guardrails..."
                value={formData.brief}
                onChange={e => setFormData(p => ({ ...p, brief: e.target.value }))}
                className="brief-textarea"
              />

              {/* Dropzone */}
              <div
                className={`brief-dropzone${isDragOver ? " drag-active" : ""}`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={e => { e.preventDefault(); setIsDragOver(false); appendFiles(e.dataTransfer.files); }}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: 9999, marginBottom: 14,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)",
                  color: "rgba(255,255,255,0.5)",
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                </div>
                <p style={{ fontSize: 15, color: "#fff", fontWeight: 600, margin: "0 0 6px" }}>Drop files here</p>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.38)", margin: "0 0 20px" }}>Images, videos, PDFs, decks, docs</p>
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: 10 }}>
                  <span style={{
                    padding: "7px 20px", borderRadius: 9999, fontSize: 13, fontWeight: 500,
                    background: "rgba(255,255,255,0.09)", border: "1px solid rgba(255,255,255,0.05)",
                    color: "#fff", pointerEvents: "none",
                  }}>Browse Files</span>
                  {files.length > 0 && (
                    <span style={{
                      padding: "7px 14px", borderRadius: 9999, fontSize: 12, fontWeight: 500,
                      color: "#ff8015", background: "rgba(255,128,21,0.1)",
                    }}>
                      {files.length} file{files.length !== 1 ? "s" : ""} selected
                    </span>
                  )}
                </div>
                <input ref={fileInputRef} type="file" multiple style={{ display: "none" }}
                  onChange={e => { appendFiles(e.target.files); e.target.value = ""; }} />
              </div>

              {/* File list */}
              {files.length > 0 && (
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8, maxHeight: 160, overflowY: "auto", scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.15) transparent" }}>
                  {files.map((file, i) => (
                    <li key={`${file.name}-${file.size}-${file.lastModified}`} className="brief-file-row">
                      <span style={{ fontSize: 13, color: "rgba(255,255,255,0.78)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", paddingRight: 12, fontWeight: 500 }}>
                        {file.name}
                      </span>
                      <button type="button" className="brief-file-remove"
                        onClick={e => { e.stopPropagation(); removeFile(i); }}>
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {/* Validation message */}
              {uploadMsg && (
                <p style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,128,21,0.9)", margin: 0 }}>
                  {uploadMsg}
                </p>
              )}

              <div className="brief-actions">
                <button type="button" className="brief-btn brief-btn-cancel" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="button" className="brief-btn brief-btn-send" onClick={sendBrief}>
                  Send Brief
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
