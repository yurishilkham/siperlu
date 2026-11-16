"use client";

import { useState } from "react";
import SideNav from "./SideNav";
import TopBar from "./TopBar";

type ShellProps = {
  variant: "public" | "admin";
  onLogout?: () => void;
  children: React.ReactNode;
};

export default function Shell({ variant, onLogout, children }: ShellProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className={`app-shell${menuOpen ? " sb-show" : ""}`}>
      {menuOpen ? (
        <div
          className="sb-backdrop"
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      ) : null}
      <SideNav
        variant={variant}
        onLogout={onLogout}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
      />
      <div className="app-main">
        <TopBar variant={variant} onMenu={() => setMenuOpen(true)} />
        <div className="app-content">{children}</div>
      </div>
    </div>
  );
}
