"use client";

import { useEffect, useRef } from "react";

interface PlaceholderImageProps {
  text: string;
  width: number;
  height: number;
  theme?: "search" | "analytics" | "export" | "premium";
}

export function generatePlaceholder(
  canvas: HTMLCanvasElement,
  text: string,
  theme: "search" | "analytics" | "export" | "premium" = "search"
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // Theme colors
  const themes = {
    search: { bg: "#f0fdf4", accent: "#22c55e" },
    analytics: { bg: "#FEF2F2", accent: "#DC2626" },
    export: { bg: "#f0fdf4", accent: "#22c55e" },
    premium: { bg: "#FEF2F2", accent: "#DC2626" },
  };

  const { bg, accent } = themes[theme];

  // Fill background
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Add some shapes for visual interest
  ctx.fillStyle = accent;
  ctx.globalAlpha = 0.1;

  // Draw random shapes based on theme
  for (let i = 0; i < 5; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const size = Math.random() * 100 + 50;

    if (theme === "search") {
      // Circles for search theme
      ctx.beginPath();
      ctx.arc(x, y, size / 2, 0, Math.PI * 2);
      ctx.fill();
    } else if (theme === "analytics") {
      // Rectangles for analytics theme
      ctx.fillRect(x, y, size, size / 2);
    } else if (theme === "export") {
      // Triangles for export theme
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + size / 2, y + size);
      ctx.lineTo(x - size / 2, y + size);
      ctx.closePath();
      ctx.fill();
    } else {
      // Stars for premium theme
      const spikes = 5;
      const outerRadius = size / 2;
      const innerRadius = outerRadius / 2;

      ctx.beginPath();
      for (let i = 0; i < spikes * 2; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const angle = (i * Math.PI) / spikes;
        const pointX = x + Math.cos(angle) * radius;
        const pointY = y + Math.sin(angle) * radius;
        if (i === 0) ctx.moveTo(pointX, pointY);
        else ctx.lineTo(pointX, pointY);
      }
      ctx.closePath();
      ctx.fill();
    }
  }

  // Add mock content
  ctx.globalAlpha = 0.2;
  for (let i = 0; i < 3; i++) {
    ctx.fillRect(
      canvas.width * 0.2,
      canvas.height * (0.3 + i * 0.15),
      canvas.width * 0.6,
      20
    );
  }

  // Add text
  ctx.globalAlpha = 1;
  ctx.fillStyle = "#1F2937";
  ctx.font = "bold 24px Inter, system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);
}

export default function PlaceholderImage({
  text,
  width,
  height,
  theme = "search",
}: PlaceholderImageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size
    canvas.width = width;
    canvas.height = height;

    // Generate placeholder
    generatePlaceholder(canvas, text, theme);
  }, [text, width, height, theme]);

  return <canvas ref={canvasRef} className="w-full h-full" />;
}
