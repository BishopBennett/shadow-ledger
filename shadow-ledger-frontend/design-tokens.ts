/**
 * Design Tokens for Shadow Ledger
 * Generated from seed: 230b54f00bd84bd87bb494e9d75d93aaa373a542caaf8e32b7281e274a708631
 * 
 * Design System: Neumorphism / Glassmorphism
 * Color Scheme: Blue-Purple Gradient
 * Layout: Tabbed Interface
 * Component Style: Rounded Corners
 * Animation: Vibrant
 */

export const designTokens = {
  colors: {
    light: {
      primary: "#6366F1", // Indigo-500
      secondary: "#8B5CF6", // Purple-500
      accent: "#A855F7", // Purple-600
      background: "#F8FAFC", // Slate-50
      surface: "#FFFFFF",
      text: "#1E293B", // Slate-800
      textSecondary: "#64748B", // Slate-500
      success: "#10B981", // Emerald-500
      warning: "#F59E0B", // Amber-500
      error: "#EF4444", // Red-500
      border: "#E2E8F0", // Slate-200
    },
    dark: {
      primary: "#6366F1", // Indigo-500
      secondary: "#8B5CF6", // Purple-500
      accent: "#A855F7", // Purple-600
      background: "#0F172A", // Slate-900
      surface: "#1E293B", // Slate-800
      text: "#F1F5F9", // Slate-100
      textSecondary: "#94A3B8", // Slate-400
      success: "#10B981", // Emerald-500
      warning: "#F59E0B", // Amber-500
      error: "#EF4444", // Red-500
      border: "#334155", // Slate-700
    },
  },
  
  neumorphism: {
    light: {
      shadow: "inset 2px 2px 4px rgba(255,255,255,0.8), inset -2px -2px 4px rgba(0,0,0,0.1)",
      shadowHover: "inset 4px 4px 8px rgba(255,255,255,0.9), inset -4px -4px 8px rgba(0,0,0,0.15)",
      shadowActive: "inset 1px 1px 2px rgba(255,255,255,0.7), inset -1px -1px 2px rgba(0,0,0,0.08)",
    },
    dark: {
      shadow: "inset 2px 2px 4px rgba(0,0,0,0.3), inset -2px -2px 4px rgba(255,255,255,0.05)",
      shadowHover: "inset 4px 4px 8px rgba(0,0,0,0.4), inset -4px -4px 8px rgba(255,255,255,0.08)",
      shadowActive: "inset 1px 1px 2px rgba(0,0,0,0.2), inset -1px -1px 2px rgba(255,255,255,0.03)",
    },
  },
  
  borderRadius: {
    sm: "8px",
    md: "12px",
    lg: "16px",
    xl: "24px",
    full: "9999px",
  },
  
  spacing: {
    base: 4,
    scale: {
      xs: 4,
      sm: 8,
      md: 12,
      lg: 16,
      xl: 24,
      "2xl": 32,
      "3xl": 48,
      "4xl": 64,
    },
    compact: {
      xs: 3,
      sm: 6,
      md: 9,
      lg: 12,
      xl: 18,
      "2xl": 24,
      "3xl": 36,
      "4xl": 48,
    },
    comfortable: {
      xs: 5,
      sm: 10,
      md: 15,
      lg: 20,
      xl: 30,
      "2xl": 40,
      "3xl": 60,
      "4xl": 80,
    },
  },
  
  typography: {
    fontFamily: {
      sans: ["Inter", "system-ui", "sans-serif"],
      mono: ["JetBrains Mono", "monospace"],
    },
    fontSize: {
      xs: "0.75rem", // 12px
      sm: "0.875rem", // 14px
      base: "1rem", // 16px
      lg: "1.125rem", // 18px
      xl: "1.25rem", // 20px
      "2xl": "1.5rem", // 24px
      "3xl": "1.875rem", // 30px
      "4xl": "2.25rem", // 36px
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
  
  animation: {
    duration: {
      fast: "150ms",
      normal: "300ms",
      slow: "500ms",
    },
    easing: {
      standard: "cubic-bezier(0.4, 0, 0.2, 1)",
      decelerate: "cubic-bezier(0.0, 0, 0.2, 1)",
      accelerate: "cubic-bezier(0.4, 0, 1, 1)",
    },
    scale: {
      hover: 1.02,
      active: 0.98,
    },
  },
  
  breakpoints: {
    mobile: "640px",
    tablet: "1024px",
    desktop: "1280px",
  },
  
  container: {
    maxWidth: "1280px",
    padding: {
      mobile: "16px",
      tablet: "24px",
      desktop: "32px",
    },
  },
  
  zIndex: {
    base: 0,
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
  },
} as const;

export type DesignTokens = typeof designTokens;



