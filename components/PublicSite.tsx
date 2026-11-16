"use client";

import { useState } from "react";
import Shell from "./Shell";
import AppFooter from "./AppFooter";
import HeroBanner from "./HeroBanner";
import RecentTable from "./RecentTable";
import QuickSearchCard from "./QuickSearchCard";
import DonutCard from "./DonutCard";
import CategorySection from "./CategorySection";
import ArchiveCatalog from "./ArchiveCatalog";
import {
  DEFAULT_FILTER,
  INITIAL_DOCUMENTS,
  documentMatchesQuery,
} from "@/lib/data";
import { downloadArchiveDoc } from "@/lib/pdf";
import type {
  ArchiveDoc,
  ArchiveFilter,
  CategoryKey,
} from "@/lib/types";

export default function PublicSite() {
  const [documents] = useState<ArchiveDoc[]>(INITIAL_DOCUMENTS);
  const [filter, setFilter] = useState<ArchiveFilter>(DEFAULT_FILTER);
  const [heroQuery, setHeroQuery] = useState("");
  const [downloads, setDownloads] = useState(0);

  function runSearch(query: string): number {
    const keyword = query.trim();
    if (!keyword) return 0;

    const matches = documents.filter((item) =>
      documentMatchesQuery(item, keyword),
    ).length;

    setFilter((previous) => ({
      ...previous,
      cat: "semua",
      q: keyword,
      tahun: "",
    }));

    if (matches === 0) return 0;

    document
      .getElementById("arsip")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });

    return matches;
  }

  function selectCategory(category: CategoryKey) {
    setFilter((previous) => ({ ...previous, cat: category }));
    document
      .getElementById("arsip")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function resetFilter() {
    setFilter(DEFAULT_FILTER);
    setHeroQuery("");
  }

  function handleDownload(document: ArchiveDoc) {
    downloadArchiveDoc(document, () => setDownloads((value) => value + 1));
  }

  return (
    <Shell variant="public">
      <div className="board">
        <HeroBanner
          variant="public"
          query={heroQuery}
          onQueryChange={setHeroQuery}
          onSearch={() => runSearch(heroQuery)}
        />
        <div className="board-grid">
          <RecentTable documents={documents} onDownload={handleDownload} />
          <div className="board-side">
            <QuickSearchCard onSelect={selectCategory} />
            <DonutCard documents={documents} />
          </div>
        </div>
        <CategorySection
          documents={documents}
          active={filter.cat}
          onSelect={selectCategory}
        />
        <ArchiveCatalog
          documents={documents}
          filter={filter}
          onFilterChange={setFilter}
          onDownload={handleDownload}
          onReset={resetFilter}
        />
        <AppFooter />
      </div>
    </Shell>
  );
}
