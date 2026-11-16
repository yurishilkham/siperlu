"use client";

type TopBarProps = {
  variant: "public" | "admin";
  onMenu: () => void;
};

export default function TopBar({ variant, onMenu }: TopBarProps) {
  const admin = variant === "admin";

  return (
    <header className="tb-bar">
      <button
        className="tb-burger"
        type="button"
        onClick={onMenu}
        aria-label="Buka menu navigasi"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <path d="M4 7h16M4 12h16M4 17h12" />
        </svg>
      </button>
      <div className="tb-greet">
        <small>Selamat Datang,</small>
        <b>
          <span className="tb-name">{admin ? "Admin" : "di SIPERLU"}</span>
          {admin ? (
            <span className="tb-status">
              <i aria-hidden="true" />
              Aktif
            </span>
          ) : null}
        </b>
      </div>
    </header>
  );
}
