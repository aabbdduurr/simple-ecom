import React from "react";
import { Link } from "gatsby";

const Layout = ({ children }) => (
  <div style={{ padding: "1rem", fontFamily: "Arial, sans-serif" }}>
    <nav style={{ marginBottom: "1rem" }}>
      <Link to="/" style={{ marginRight: "1rem" }}>
        Home
      </Link>
      <Link to="/checkout">Checkout</Link>
      <Link to="/auth" style={{ marginLeft: "1rem" }}>
        Auth
      </Link>
    </nav>
    <main>{children}</main>
  </div>
);

export default Layout;
