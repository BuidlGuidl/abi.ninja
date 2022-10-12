import React from "react";
import { Link } from "react-router-dom";
import Logo from "../assets/logo_inv-svg.png";
export default function Header({ link, title, subTitle, ...props }) {
  return (
    <header className={"header"}>
      <div className="header-logo">
        <Link to="/" className="logo-link">
          <img width={50} src={Logo} alt="logo" />
          <span className="logo-abi">
            ABI <span className="logo-ninja">Ninja</span>
          </span>
        </Link>
      </div>

      {props.children}
    </header>
  );
}
