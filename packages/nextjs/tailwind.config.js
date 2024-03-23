/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./pages/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}", "./utils/**/*.{js,ts,jsx,tsx}"],
  plugins: [require("daisyui")],
  darkTheme: "scaffoldEthDark",
  // DaisyUI theme colors
  daisyui: {
    themes: [
      {
        scaffoldEth: {
          primary: "#551d98",
          "primary-content": "#ffffff",
          secondary: "#c1aeff",
          "secondary-content": "#212638",
          accent: "#666B7C",
          "accent-content": "#212638",
          neutral: "#ffffff",
          "neutral-content": "#ffffff",
          "base-100": "#efeaff",
          "base-200": "#f4f8ff",
          "base-300": "#DAE8FF",
          "base-content": "#212638",
          info: "#93BBFB",
          success: "#34EEB6",
          warning: "#FFCF72",
          error: "#FF8863",

          ".tooltip": {
            "--tooltip-tail": "6px",
          },
          ".link": {
            textUnderlineOffset: "2px",
          },
          ".link:hover": {
            opacity: "80%",
          },
        },
      },
      {
        scaffoldEthDark: {
          primary: "#a17fe0",
          "primary-content": "#ffffff",
          secondary: "#7c3aed",
          "secondary-content": "#ffffff",
          accent: "#8b5cf6",
          "accent-content": "#ffffff",
          neutral: "#000000",
          "neutral-content": "#d1d5db",
          "base-100": "#121212",
          "base-200": "#1f1f1f",
          "base-300": "#2c2c2c",
          "base-content": "#e4e4e7",
          info: "#93c5fd",
          success: "#22c55e",
          warning: "#fbbf24",
          error: "#ef4444",

          // Retain the design tokens for tooltips and links from the light theme for consistency
          ".tooltip": {
            "--tooltip-tail": "6px",
            "--tooltip-color": "hsl(var(--p))",
          },
          ".link": {
            textUnderlineOffset: "2px",
          },
          ".link:hover": {
            opacity: "80%",
          },
        },
      },
    ],
  },
  theme: {
    extend: {
      boxShadow: {
        center: "0 0 12px -2px rgb(0 0 0 / 0.05)",
        xl: "0 0 15px -5px rgb(85 29 152)",
      },
      animation: {
        "pulse-fast": "pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      screens: {
        lg: "800px", // Change to 800 from 1024
        laptop: "1024px",
      },
    },
  },
};
