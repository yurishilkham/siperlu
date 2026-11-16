"use client";

import type { CSSProperties } from "react";
import { CATEGORIES } from "@/lib/data";
import type { ArchiveDoc, CategoryKey, FilterCategory } from "@/lib/types";

type CategorySectionProps = {
  documents: ArchiveDoc[];
  active: FilterCategory;
  onSelect: (category: CategoryKey) => void;
};

export default function CategorySection({
  documents,
  active,
  onSelect,
}: CategorySectionProps) {
  return (
    <section id="kategori" className="wf-section kat-section">
      <div className="kat-head">
        <div>
          <h2 className="kat-title">Kategori Arsip</h2>
          <p className="muted">
            Pilih kategori untuk memfilter katalog dokumen secara otomatis.
          </p>
        </div>
        <span className="kat-total">
          {CATEGORIES.length} kategori • {documents.length} dokumen
        </span>
      </div>
      <div className="kat-grid">
        {CATEGORIES.map((category) => {
          const count = documents.filter(
            (document) => document.category === category.key,
          ).length;
          return (
            <button
              key={category.key}
              type="button"
              className={`kat-card${active === category.key ? " active" : ""}`}
              onClick={() => onSelect(category.key)}
            >
              <span
                className="kat-icon"
                style={{ "--akbg": category.iconBg } as CSSProperties}
              >
                {category.icon}
              </span>
              <span className="kat-text">
                <b>{category.label}</b>
                <small>{category.short}</small>
              </span>
              <span className="kat-count">{count}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
