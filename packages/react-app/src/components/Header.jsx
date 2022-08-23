import React from "react";
import { Link } from "react-router-dom";

export default function Header({ link, title, subTitle, ...props }) {
  return (
    <div className="site-header">
      <div className="header-logo">
        <Link to="/">
          <img className="logo logo-big" src="/logo.svg" alt="logo" />
        </Link>
        <img className="logo logo-small" src="/logo_small.svg" alt="logo" />
      </div>
      {props.children}
    </div>
  );
}
