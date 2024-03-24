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
          "neutral-content": "#0F0F0F",
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
          primary: "#551d98" /* Kept from light theme for consistency */,
          "primary-content": "#ffffff" /* Ensures readability on primary color */,
          secondary: "#503E9D" /* Darkened version of light theme's secondary to maintain contrast */,
          "secondary-content": "#ffffff" /* Ensures readability on secondary color */,
          accent: "#5A5F7D" /* Darkened version of light theme's accent for consistency */,
          "accent-content": "#ffffff" /* Ensures readability on accent color */,
          neutral: "#303030" /* Darkened version to contrast the light theme's neutral */,
          "neutral-content": "#d1d5db" /* Lighter content color for readability against dark neutral */,
          "base-100": "#1B1B1B" /* Darker base to contrast the light theme's base-100 */,
          "base-200": "#151515" /* Adjusted for depth in UI elements, darker than base-100 */,
          "base-300": "#202020" /* Slightly lighter than base-200 for layering UI elements */,
          "base-content": "#e4e4e7" /* Light content color for contrast against dark bases */,
          info: "#4A8DD8" /* Darkened version of light theme's info for consistency */,
          success: "#1CAE76" /* Darkened version of light theme's success for better visibility */,
          warning: "#D19A2E" /* Darkened version of light theme's warning to maintain visibility */,
          error: "#CC5542" /* Darkened version of light theme's error for consistency */,

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
