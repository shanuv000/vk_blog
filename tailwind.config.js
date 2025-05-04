module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // New modern color scheme
        primary: "#E50914", // Netflix-inspired red
        "primary-dark": "#B81D24", // Darker red for hover states
        "primary-light": "#F5222D", // Lighter red for accents
        secondary: "#141414", // Rich black
        "secondary-light": "#1F1F1F", // Lighter black for cards
        "secondary-dark": "#0A0A0A", // Darker black for backgrounds
        "text-primary": "#F5F5F5", // Light text for dark backgrounds
        "text-secondary": "#A0A0A0", // Muted text
        accent: "#E50914", // Accent color (same as primary for consistency)

        // Keep legacy colors for backward compatibility
        "shanu-black": "#424242",
        "head-colour": "#111111",
        "urtechy-red": "#E50914", // Updated to match new primary
        "urtechy-orange": "#FF8C00",
        "urtechy-tomato": "#FF6347",
      },
      fontFamily: {
        // Modern font stack
        sans: [
          '"Inter"',
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          '"Helvetica Neue"',
          "Arial",
          "sans-serif",
        ],
        heading: [
          '"Poppins"',
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          '"Helvetica Neue"',
          "Arial",
          "sans-serif",
        ],
        mono: [
          '"JetBrains Mono"',
          "Menlo",
          "Monaco",
          "Consolas",
          '"Liberation Mono"',
          '"Courier New"',
          "monospace",
        ],
      },
      keyframes: {
        wiggle: {
          "0%, 100%": { transform: "rotate(-3deg)" },
          "50%": { transform: "rotate(3deg)" },
        },
        fadeIn: {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: 0 },
          "100%": { transform: "translateY(0)", opacity: 1 },
        },
      },
      animation: {
        fadeIn: "fadeIn 0.5s ease-in-out",
        slideUp: "slideUp 0.5s ease-in-out",
      },
      typography: {
        DEFAULT: {
          css: {
            color: "#333333",
            h1: {
              fontFamily: '"Poppins", sans-serif',
              fontWeight: 700,
            },
            h2: {
              fontFamily: '"Poppins", sans-serif',
              fontWeight: 600,
            },
            h3: {
              fontFamily: '"Poppins", sans-serif',
              fontWeight: 600,
            },
            a: {
              color: "#E50914",
              "&:hover": {
                color: "#B81D24",
              },
            },
            blockquote: {
              borderLeftColor: "#E50914",
            },
          },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
