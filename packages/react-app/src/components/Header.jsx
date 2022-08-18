import React from "react";
// displays a page header

export default function Header({ link, title, subTitle, ...props }) {
  return (
    <div className="site-header">
      <div className="header-logo">
        <img className="logo logo-big" src="/logo.svg" alt="logo" />
        <img className="logo logo-small" src="/logo_small.svg" alt="logo" />
      </div>
      {props.children}
    </div>
  );
}
