import { useSession } from "@/hooks/use-session";
import { ColorScale } from "@/types/colors";

// Convert hex to HSL
function hexToHsl(hex: string): { h: number; s: number; l: number } {
  // Remove the hash if it exists
  hex = hex.replace(/^#/, "");

  // Parse the hex values
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }

    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

// Generate HSL color scale
function generateHslScale(baseColor: string): ColorScale {
  const { h, s } = hexToHsl(baseColor);

  return {
    50: `${h} ${s}% 97%`,
    100: `${h} ${s}% 92%`,
    200: `${h} ${s}% 84%`,
    300: `${h} ${s}% 73%`,
    400: `${h} ${s}% 60%`,
    500: `${h} ${s}% 45%`,
    600: `${h} ${s}% 35%`,
    700: `${h} ${s}% 27%`,
    800: `${h} ${s}% 22%`,
    900: `${h} ${s}% 18%`,
  };
}

export const colorScales: Record<string, ColorScale> = {
  brand: generateHslScale("#4ade80"), // Green
  blue: generateHslScale("#3b82f6"),
  purple: generateHslScale("#a855f7"),
  pink: generateHslScale("#ec4899"),
  red: generateHslScale("#ef4444"),
  orange: generateHslScale("#f97316"),
  yellow: generateHslScale("#eab308"),
  teal: generateHslScale("#14b8a6"),
  cyan: generateHslScale("#06b6d4"),
  indigo: generateHslScale("#6366f1"),
  violet: generateHslScale("#8b5cf6"),
  fuchsia: generateHslScale("#d946ef"),
  rose: generateHslScale("#f43f5e"),
  amber: generateHslScale("#f59e0b"),
  lime: generateHslScale("#84cc16"),
  emerald: generateHslScale("#10b981"),
};

export function updateThemeColor(color: string) {
  const scale = colorScales[color] || colorScales.brand;
  const { h, s } = hexToHsl(color);

  // Update brand color CSS variables
  Object.entries(scale).forEach(([key, value]) => {
    document.documentElement.style.setProperty(`--brand-${key}`, value);
  });

  // Update shadcn component colors for light mode
  document.documentElement.style.setProperty("--primary", `${h} ${s}% 45%`);
  document.documentElement.style.setProperty(
    "--primary-foreground",
    "0 0% 98%"
  );
  document.documentElement.style.setProperty("--secondary", `${h} ${s}% 95.9%`);
  document.documentElement.style.setProperty(
    "--secondary-foreground",
    `${h} ${s}% 10%`
  );
  document.documentElement.style.setProperty("--accent", `${h} ${s}% 95.9%`);
  document.documentElement.style.setProperty(
    "--accent-foreground",
    `${h} ${s}% 10%`
  );
  document.documentElement.style.setProperty("--muted", `${h} ${s}% 95.9%`);
  document.documentElement.style.setProperty(
    "--muted-foreground",
    `${h} ${s}% 46.1%`
  );
  document.documentElement.style.setProperty("--ring", `${h} ${s}% 45%`);
  document.documentElement.style.setProperty("--input", `${h} ${s}% 95.9%`);
  document.documentElement.style.setProperty("--border", `${h} ${s}% 90%`);

  // Store the selected color
  localStorage.setItem("brandColor", color);

  // Dispatch event for other components
  window.dispatchEvent(new CustomEvent("themeColorUpdated", { detail: color }));
}

export function initializeThemeColor(session: any) {
  if (session?.session?.user?.user_metadata?.brandColor) {
    // Use the user's saved preference from their profile
    updateThemeColor(session.session.user.user_metadata.brandColor);
  } else {
    // Fall back to localStorage only if no user preference exists
    const savedColor = localStorage.getItem("brandColor");
    if (savedColor) {
      updateThemeColor(savedColor);
    }
  }
}
