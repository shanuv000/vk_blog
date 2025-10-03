module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Modern, refined color palette
        primary: "#E50914", // Bold red - main brand color
        "primary-dark": "#B81D24", // Darker red for hover states
        "primary-light": "#FF1F2E", // Brighter red for highlights
        secondary: "#141414", // Rich black for cards
        "secondary-light": "#232323", // Lighter black for elevated surfaces
        "secondary-dark": "#0A0A0A", // Deep black for backgrounds
        "text-primary": "#F5F5F5", // Primary text - high contrast
        "text-secondary": "#A0A0A0", // Secondary text - muted
        "text-tertiary": "#707070", // Tertiary text - subtle
        accent: "#E50914", // Accent matches primary
        border: "rgba(255, 255, 255, 0.1)", // Subtle borders
        "border-light": "rgba(255, 255, 255, 0.05)", // Very subtle borders

        // Keep legacy colors for compatibility
        "shanu-black": "#424242",
        "head-colour": "#111111",
        "urtechy-red": "#E50914",
        "urtechy-orange": "#FF8C00",
        "urtechy-tomato": "#FF6347",
      },
      fontFamily: {
        sans: [
          '"Inter"',
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          "sans-serif",
        ],
        heading: [
          '"Poppins"',
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          "sans-serif",
        ],
        mono: [
          '"JetBrains Mono"',
          '"Fira Code"',
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },
      // Minimal animations - only essential ones
      keyframes: {
        // Simple fade in - most commonly used
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        // Subtle slide up
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        // Shimmer for loading states only
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        // Pulse for important notifications only
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
      },
      animation: {
        // Fast, smooth animations
        fadeIn: "fadeIn 0.3s ease-out",
        slideUp: "slideUp 0.3s ease-out",
        shimmer: "shimmer 2s infinite linear",
        pulse: "pulse 2s ease-in-out infinite",
      },
      borderWidth: {
        3: "3px",
      },
      spacing: {
        18: "4.5rem",
        88: "22rem",
      },
      typography: {
        DEFAULT: {
          css: {
            color: "#e5e5e5",
            maxWidth: "none",
            h1: {
              fontFamily: '"Poppins", sans-serif',
              fontWeight: "700",
              color: "#f5f5f5",
              letterSpacing: "-0.02em",
            },
            h2: {
              fontFamily: '"Poppins", sans-serif',
              fontWeight: "600",
              color: "#f5f5f5",
              letterSpacing: "-0.01em",
            },
            h3: {
              fontFamily: '"Poppins", sans-serif',
              fontWeight: "600",
              color: "#f5f5f5",
            },
            h4: {
              fontFamily: '"Poppins", sans-serif',
              fontWeight: "600",
              color: "#f5f5f5",
            },
            p: {
              color: "#d4d4d4",
              lineHeight: "1.7",
            },
            a: {
              color: "#E50914",
              textDecoration: "none",
              transition: "color 0.2s ease",
              "&:hover": {
                color: "#FF1F2E",
              },
            },
            strong: {
              color: "#f5f5f5",
              fontWeight: "600",
            },
            code: {
              color: "#FF1F2E",
              backgroundColor: "rgba(229, 9, 20, 0.1)",
              padding: "0.2em 0.4em",
              borderRadius: "0.25rem",
              fontWeight: "500",
            },
            "code::before": {
              content: '""',
            },
            "code::after": {
              content: '""',
            },
            pre: {
              backgroundColor: "#1a1a1a",
              border: "1px solid rgba(255, 255, 255, 0.1)",
            },
            blockquote: {
              borderLeftColor: "#E50914",
              borderLeftWidth: "4px",
              color: "#a0a0a0",
              fontStyle: "italic",
            },
            ul: {
              color: "#d4d4d4",
            },
            ol: {
              color: "#d4d4d4",
            },
            li: {
              color: "#d4d4d4",
            },
          },
        },
      },
      boxShadow: {
        glow: "0 0 20px rgba(229, 9, 20, 0.3)",
        "glow-sm": "0 0 10px rgba(229, 9, 20, 0.2)",
        card: "0 4px 16px rgba(0, 0, 0, 0.3)",
        "card-hover": "0 8px 24px rgba(0, 0, 0, 0.4)",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
