import React from "react";
import Image from "next/image";

export interface RamuLogoProps {
  /**
   * Size presets or custom pixel height:
   * sm: 24px, md: 32px, lg: 40px, xl: 52px, 2xl: 72px
   */
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | number;
  /**
   * Display variant:
   * - mark: Symbol only (clean standalone emblem without any box)
   * - horizontal: Mark on left, RAMU wordmark + optional subtitle on right
   * - vertical: Mark centered on top, RAMU wordmark below
   * - app-icon: Preserved for compatibility, now clean without heavy artificial border
   */
  variant?: "mark" | "horizontal" | "vertical" | "app-icon";
  /**
   * Color theme: "dark" (monochrome charcoal/black for light backgrounds) or "white" (for dark backgrounds)
   */
  theme?: "dark" | "white" | "monochrome";
  /**
   * Custom subtitle text below RAMU
   */
  subtitle?: boolean | string;
  /**
   * Optional custom class for outer wrapper
   */
  className?: string;
  /**
   * Optional decorative accent line (accepted for backwards-compatibility)
   */
  showAccent?: boolean;
  /**
   * Optional grid lines (accepted for backwards-compatibility)
   */
  withGrid?: boolean;
}

export function RamuLogo({
  size = "md",
  variant = "mark",
  theme = "dark",
  subtitle = false,
  className = "",
}: RamuLogoProps) {
  // Height calculation in pixels
  let height = 32;
  if (typeof size === "number") {
    height = size;
  } else {
    switch (size) {
      case "sm":
        height = 24;
        break;
      case "md":
        height = 32;
        break;
      case "lg":
        height = 40;
        break;
      case "xl":
        height = 52;
        break;
      case "2xl":
        height = 72;
        break;
    }
  }

  // Aspect ratio of the official emblem: 296 width / 324 height = ~0.9136
  const width = Math.round(height * (296 / 324));

  const isWhite = theme === "white";
  const logoSrc = isWhite ? "/ramu-logo-white.png" : "/ramu-logo-transparent.png";

  const renderMark = () => (
    <img
      src={logoSrc}
      alt="RAMU Logo"
      width={width}
      height={height}
      className="object-contain shrink-0 select-none pointer-events-none transition-transform duration-200"
      style={{
        height: `${height}px`,
        width: "auto",
        maxWidth: "none",
      }}
    />
  );

  // 1. VERTICAL VARIANT
  if (variant === "vertical") {
    return (
      <div className={`inline-flex flex-col items-center text-center gap-2.5 ${className}`}>
        {renderMark()}
        <div className="space-y-0.5">
          <span
            className={`block font-black tracking-[0.16em] leading-none ${
              isWhite ? "text-white" : "text-stone-900"
            }`}
            style={{ fontSize: Math.max(15, Math.round(height * 0.55)) }}
          >
            RAMU
          </span>
          {subtitle && (
            <span
              className={`block font-semibold uppercase tracking-[0.2em] text-[9px] ${
                isWhite ? "text-stone-400" : "text-stone-500"
              }`}
            >
              {typeof subtitle === "string" ? subtitle : "Platform Industri Kreatif"}
            </span>
          )}
        </div>
      </div>
    );
  }

  // 2. HORIZONTAL VARIANT (Clean inline mark + wordmark)
  if (variant === "horizontal") {
    return (
      <div className={`inline-flex items-center gap-3 group ${className}`}>
        {renderMark()}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={`font-black tracking-[0.12em] leading-none ${
                isWhite ? "text-white" : "text-stone-900"
              }`}
              style={{ fontSize: Math.max(16, Math.round(height * 0.54)) }}
            >
              RAMU
            </span>
            <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase rounded-md bg-stone-100 text-stone-700 border border-stone-200 shrink-0">
              Ecosystem
            </span>
          </div>
          {subtitle && (
            <p className="text-[10px] text-stone-500 font-medium tracking-wider uppercase mt-0.5 truncate">
              {typeof subtitle === "string" ? subtitle : "Platform Industri Kreatif"}
            </p>
          )}
        </div>
      </div>
    );
  }

  // 3. MARK ONLY / APP-ICON (Biarkan bersih tanpa kotak/border)
  return (
    <div className={`inline-flex items-center justify-center shrink-0 ${className}`}>
      {renderMark()}
    </div>
  );
}
