/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./pages/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}", "./utils/**/*.{js,ts,jsx,tsx}"],
  plugins: [require("daisyui")],
  darkTheme: "dark",
  darkMode: ["selector", "[data-theme='dark']"],
  // DaisyUI theme colors
  daisyui: {
    themes: [
      {
        light: {
          primary: "#551d98",
          "primary-content": "#ffffff",
          secondary: "#c1aeff",
          "secondary-content": "#212638",
          accent: "#666B7C",
          "accent-content": "#212638",
          neutral: "#f1f5f9",
          "neutral-content": "#ffffff",
          "base-100": "#efeaff",
          "base-200": "#ffffff",
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
        dark: {
          primary: "#8975DB",
          "primary-content": "#E3D9FF",
          secondary: "#8975DB",
          "secondary-content": "#ede5ff",
          accent: "#eeeeee",
          "accent-content": "#cfd8e3",
          neutral: "#3F2A58",
          "neutral-content": "#BA8DE8",
          "base-100": "#29203F",
          "base-200": "#130C25",
          "base-300": "#2c2c2c",
          "base-content": "#d2d2d2",
          info: "#3b8dcb",
          success: "#2c907f",
          warning: "#c47f30",
          error: "#b2584e",

          ".tooltip": {
            "--tooltip-tail": "6px",
            "--tooltip-color": "oklch(var(--s))",
            "--tooltip-text-color": "oklch(var(--sc))",
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
