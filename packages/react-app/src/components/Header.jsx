import React from "react";
import { useLocation } from "react-router-dom";

// displays a page header

export default function Header({ link, title, subTitle, ...props }) {
  const location = useLocation();
  console.log("a", location.pathname);
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "1.2rem" }}>
      <div className="header-logo">
        <img src="/logo.svg" alt="logo" style={{ display: location.pathname === "/" ? "none" : "block" }} />
      </div>
      {props.children}
    </div>
  );
}
