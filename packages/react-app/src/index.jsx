import React from "react";
import { ThemeSwitcherProvider } from "react-css-theme-switcher";
import { BrowserRouter } from "react-router-dom";
import ReactDOM from "react-dom";
import App from "./App";
import "antd/dist/antd.css";
import "./styles/dashboard/styles.less";

const themes = {
  dark: "",
  light: "",
};

const prevTheme = window.localStorage.getItem("theme");

ReactDOM.render(
  <ThemeSwitcherProvider themeMap={themes} defaultTheme={prevTheme || "light"}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </ThemeSwitcherProvider>,
  document.getElementById("root"),
);
