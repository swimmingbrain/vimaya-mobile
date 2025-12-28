/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        warm: "#C26B5C",
        cool: "#6B9B9C",
        bg: "#0f1620",
        bgAlt: "#121826",
        surface: "#1b2335",
        surface2: "#1f2a3b",
        text: "#E6EAF2",
        muted: "#A6B0C3",
        primary: "#1b2335",
        secondary: "#E6EAF2",
      },
    },
  },
  plugins: [],
};
