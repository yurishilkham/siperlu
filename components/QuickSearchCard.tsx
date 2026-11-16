"use client";

import type { CategoryKey } from "@/lib/types";

type QuickSearchCardProps = {
  onSelect: (cat: CategoryKey) => void;
};

const ICON_STROKE = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

const TILES: Array<{
  cat: CategoryKey;
  label: string;
  icon: "scale" | "shield" | "mail" | "folder";
}> = [
  { cat: "htn", label: "HTN", icon: "scale" },
  { cat: "bawaslu", label: "BAWASLU", icon: "shield" },
  { cat: "kpu", label: "KPU", icon: "mail" },
  { cat: "dkpp", label: "DKPP", icon: "folder" },
];

function TileIcon({ name }: { name: (typeof TILES)[number]["icon"] }) {
  if (name === "scale") {
    return (
      <svg viewBox="0 0 24 24" {...ICON_STROKE} aria-hidden="true">
        <path d="M12 3v18" />
        <path d="M5 21h14" />
        <path d="M3.5 7.5 4 10a2.7 2.7 0 0 0 5 .05L9.3 7.5" />
        <path d="M14.7 7.5 15 10a2.7 2.7 0 0 0 5 .05l.55-2.55" />
        <path d="M3 7.5h18" />
        <path d="M8.4 15.5A3.2 3.2 0 0 1 12 12a3.2 3.2 0 0 1 3.6 3.5" />
      </svg>
    );
  }
  if (name === "shield") {
    return (
      <svg viewBox="0 0 24 24" {...ICON_STROKE} aria-hidden="true">
        <path d="M12 3.5 19 6v5c0 4.6-3 8.1-7 9.5-4-1.4-7-4.9-7-9.5V6z" />
        <path d="m9.2 11.6 2 2.2 3.6-4" />
      </svg>
    );
  }
  if (name === "mail") {
    return (
      <svg viewBox="0 0 24 24" {...ICON_STROKE} aria-hidden="true">
        <rect x="3.5" y="5.5" width="17" height="13" rx="2.5" />
        <path d="m4.5 7.5 7.5 5.5 7.5-5.5" />
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

export default function QuickSearchCard({ onSelect }: QuickSearchCardProps) {
  function pick(category: CategoryKey) {
    onSelect(category);
    document
      .getElementById("arsip")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <section className="qs-card">
      <h2 className="qs-title">
        <span className="qs-bolt" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <path d="M13 3 5.5 13.5h5L10 21l8-11h-5.5z" />
          </svg>
        </span>
        Pencarian Cepat
      </h2>
      <div className="qs-grid">
        {TILES.map((tile) => (
          <button
            key={tile.label}
            type="button"
            className="qs-tile"
            onClick={() => pick(tile.cat)}
          >
            <TileIcon name={tile.icon} />
            {tile.label}
          </button>
        ))}
      </div>
    </section>
  );
}
