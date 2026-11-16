"use client";

import type { ArchiveDoc, CategoryKey } from "@/lib/types";

type DonutCardProps = {
  documents: ArchiveDoc[];
};

const GROUPS: Array<{
  label: string;
  color: string;
  cats: CategoryKey[];
}> = [
  { label: "HTN", color: "#2563eb", cats: ["htn"] },
  { label: "BAWASLU", color: "#10b981", cats: ["bawaslu"] },
  { label: "KPU", color: "#8b5cf6", cats: ["kpu"] },
  { label: "DKPP", color: "#f59e0b", cats: ["dkpp"] },
  { label: "HUKUM LAINNYA", color: "#ef4444", cats: ["hukum-lainnya"] },
];

export default function DonutCard({ documents }: DonutCardProps) {
  const total = documents.length || 1;
  const slices = GROUPS.map((group) => {
    const count = documents.filter((doc) =>
      group.cats.includes(doc.category),
    ).length;
    return { ...group, count, pct: Math.round((count / total) * 100) };
  });

  let cursor = 0;
  const stops = slices
    .map((slice) => {
      const start = cursor;
      cursor += slice.pct;
      return `${slice.color} ${start}% ${cursor}%`;
    })
    .join(", ");

  return (
    <section className="dn-card">
      <div className="dn-head">
        <h2>
          <span className="dn-magnet" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 21v-8M4 9V5M9 21v-4M9 13V3M9 3l4 1M15 21v-6M15 11V3M20 21v-6M20 11V3" />
            </svg>
          </span>
          Statistik Arsip
        </h2>
        <a
          className="dn-detail"
          href="#arsip"
          onClick={(event) => {
            event.preventDefault();
            document
              .getElementById("arsip")
              ?.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
        >
          Lihat Detail
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12h13" />
            <path d="m12.5 6.5 5.5 5.5-5.5 5.5" />
          </svg>
        </a>
      </div>
      <div className="dn-body">
        <div
          className="dn-ring"
          style={{ background: `conic-gradient(${stops})` }}
          role="img"
          aria-label={`Distribusi arsip: ${slices
            .map((s) => `${s.label} ${s.pct}%`)
            .join(", ")}`}
        >
          <span className="dn-hole">
            <b>{documents.length}</b>
            <small>Total Arsip</small>
          </span>
        </div>
        <ul className="dn-legend">
          {slices.map((slice) => (
            <li key={slice.label}>
              <i style={{ background: slice.color }} aria-hidden="true" />
              <span>{slice.label}</span>
              <b>{slice.count} · {slice.pct}%</b>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
