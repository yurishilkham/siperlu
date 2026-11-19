"use client";

type TopBarProps = {
  variant: "public" | "admin";
  onMenu: () => void;
  onProfile?: () => void;
};

export default function TopBar({
  variant,
  onMenu,
  onProfile,
}: TopBarProps) {
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
      {admin ? (
        <div className="tb-right">
          <button
            className="tb-avatar tb-profile"
            type="button"
            onClick={onProfile}
            aria-label="Buka profil admin"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.9"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="8.5" r="3.5" />
              <path d="M5 20c0-3.6 3.1-5.6 7-5.6s7 2 7 5.6" />
            </svg>
            <span>Profil</span>
          </button>
        </div>
      ) : null}
    </header>
  );
}
