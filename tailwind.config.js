module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "shanu-black": "#424242",
        "head-colour": "#111111",
        "indian-saffron": "#FF9933", // Saffron
        "indian-white": "#FFFFFF", // White
        "indian-green": "#138808", // Green
        "urtechy-red": "#FF4500", // Orange-red
        "urtechy-orange": "#FF8C00", // Dark orange
        "urtechy-tomato": "#FF6347", // Tomato red
      },
      fontFamily: {
        Helvetica: ["Helvetica, sans-serif"],
      },
      keyframes: {
        wiggle: {
          "0%, 100%": { transform: "rotate(-3deg)" },
          "50%": { transform: "rotate(3deg)" },
        },
      },
    },
  },
  plugins: [],
};
