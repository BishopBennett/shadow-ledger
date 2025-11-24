import type { Config } from "tailwindcss";
import { designTokens } from "./design-tokens";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: designTokens.colors.light.primary,
          foreground: designTokens.colors.light.text,
        },
        secondary: {
          DEFAULT: designTokens.colors.light.secondary,
          foreground: designTokens.colors.light.text,
        },
        accent: {
          DEFAULT: designTokens.colors.light.accent,
          foreground: designTokens.colors.light.text,
        },
        background: designTokens.colors.light.background,
        foreground: designTokens.colors.light.text,
        card: {
          DEFAULT: designTokens.colors.light.surface,
          foreground: designTokens.colors.light.text,
        },
        border: designTokens.colors.light.border,
        success: designTokens.colors.light.success,
        warning: designTokens.colors.light.warning,
        error: designTokens.colors.light.error,
      },
      borderRadius: {
        sm: designTokens.borderRadius.sm,
        md: designTokens.borderRadius.md,
        lg: designTokens.borderRadius.lg,
        xl: designTokens.borderRadius.xl,
      },
      spacing: {
        ...Object.fromEntries(
          Object.entries(designTokens.spacing.scale).map(([key, value]) => [
            key,
            `${value}px`,
          ])
        ),
      },
      // Font families and typography use default Tailwind values
      // Custom animations and breakpoints can be added via CSS classes
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

