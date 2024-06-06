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
      },
      fontFamily: {
        Helvetica: ["Helvetica, sans-serif"],
      },
    },
  },
  plugins: [],
};
