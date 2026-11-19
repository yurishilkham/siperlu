"use client";

import { useEffect, useRef, useState } from "react";

type SideNavProps = {
  variant: "public" | "admin";
  onLogout?: () => void;
  open: boolean;
  onClose: () => void;
};

type Item = {
  id: string;
  label: string;
  icon: "home" | "doc" | "grid" | "folder";
};

const ITEMS: Item[] = [
  { id: "beranda", label: "Dashboard", icon: "home" },
  { id: "terbaru", label: "Arsip Terbaru", icon: "doc" },
  { id: "kategori", label: "Kategori", icon: "grid" },
  { id: "arsip", label: "Arsip", icon: "folder" },
];

const ICON_STROKE = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

function ItemIcon({ name }: { name: Item["icon"] }) {
  if (name === "home") {
    return (
      <svg viewBox="0 0 24 24" {...ICON_STROKE} aria-hidden="true">
        <path d="m4 10.5 8-6.5 8 6.5V19a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 19z" />
        <path d="M9.5 20.5v-6h5v6" />
      </svg>
    );
  }
  if (name === "doc") {
    return (
      <svg viewBox="0 0 24 24" {...ICON_STROKE} aria-hidden="true">
        <path d="M5 6.5A2.5 2.5 0 0 1 7.5 4h9A2.5 2.5 0 0 1 19 6.5v11a2.5 2.5 0 0 1-2.5 2.5h-9A2.5 2.5 0 0 1 5 17.5z" />
        <path d="M9 8.5h6M9 12h6M9 15.5h3.5" />
      </svg>
    );
  }
  if (name === "grid") {
    return (
      <svg viewBox="0 0 24 24" {...ICON_STROKE} aria-hidden="true">
        <rect x="4" y="4" width="7" height="7" rx="2" />
        <rect x="13" y="4" width="7" height="7" rx="2" />
        <rect x="4" y="13" width="7" height="7" rx="2" />
        <rect x="13" y="13" width="7" height="7" rx="2" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" {...ICON_STROKE} aria-hidden="true">
      <path d="M3.5 7A2.5 2.5 0 0 1 6 4.5h4l2 2.5h6A2.5 2.5 0 0 1 20.5 9.5V17a2.5 2.5 0 0 1-2.5 2.5H6A2.5 2.5 0 0 1 3.5 17z" />
      <path d="M3.5 10.5h17" />
    </svg>
  );
}

export default function SideNav({
  variant,
  onLogout,
  open,
  onClose,
}: SideNavProps) {
  const admin = variant === "admin";
  const [active, setActive] = useState(ITEMS[0].id);
  const lockUntilRef = useRef(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    const updateActive = () => {
      const position = window.scrollY + 140;
      const sections = ITEMS.map((item) => ({
        item,
        section: document.getElementById(item.id),
      }))
        .filter(
          (
            entry,
          ): entry is { item: (typeof ITEMS)[number]; section: HTMLElement } =>
            Boolean(entry.section),
        )
        .sort((a, b) => a.section.offsetTop - b.section.offsetTop);
      let current = sections[0]?.item.id ?? ITEMS[0].id;
      for (const entry of sections) {
        if (entry.section.offsetTop <= position) current = entry.item.id;
      }
      const atBottom =
        window.innerHeight + Math.ceil(window.scrollY) >=
        document.documentElement.scrollHeight - 2;
      if (atBottom && sections.length) {
        current = sections[sections.length - 1].item.id;
      }
      setActive(current);
    };

    const onScroll = () => {
      if (Date.now() < lockUntilRef.current) {
        if (timerRef.current) window.clearTimeout(timerRef.current);
        timerRef.current = window.setTimeout(
          updateActive,
          lockUntilRef.current - Date.now() + 60,
        );
        return;
      }
      updateActive();
    };

    updateActive();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <aside className={`sb-nav${open ? " sb-open" : ""}`}>
      <div className="sb-head">
        <div className="sb-brand">
          <h1 className="sr-only">SIPERLU — Sistem Informasi Peraturan dan Regulasi Pemilu</h1>
          <img
            src="/logo-siperlu-vertikal.png"
            alt="Logo SIPERLU"
            className="sb-logo-img"
          />
          <p className="sb-tagline">
            Sistem Informasi Peraturan dan Regulasi Pemilu
          </p>
        </div>
        <button
          className="sb-close"
          type="button"
          onClick={onClose}
          aria-label="Tutup menu"
        >
          <svg viewBox="0 0 24 24" {...ICON_STROKE} aria-hidden="true">
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>
      </div>
      <nav className="sb-menu" aria-label="Navigasi samping">
        {ITEMS.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className={active === item.id ? "sb-item active" : "sb-item"}
            onClick={(event) => {
              event.preventDefault();
              setActive(item.id);
              lockUntilRef.current = Date.now() + 1000;
              onClose();
              document
                .getElementById(item.id)
                ?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
          >
            <ItemIcon name={item.icon} />
            <span>{item.label}</span>
          </a>
        ))}
      </nav>
      {admin ? (
        <>
          <div className="sb-sep" aria-hidden="true" />
          <button className="sb-exit" type="button" onClick={onLogout}>
            <svg viewBox="0 0 24 24" {...ICON_STROKE} aria-hidden="true">
              <path d="M14 4h4.5A1.5 1.5 0 0 1 20 5.5v13a1.5 1.5 0 0 1-1.5 1.5H14" />
              <path d="m10 8-4 4 4 4" />
              <path d="M4.5 12H14" />
            </svg>
            <span>Keluar</span>
          </button>
        </>
      ) : null}
    </aside>
  );
}
