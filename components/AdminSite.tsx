"use client";

import { useRef, useState } from "react";
import Shell from "./Shell";
import AppFooter from "./AppFooter";
import HeroBanner from "./HeroBanner";
import LoginScreen from "./LoginScreen";
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
  ArchiveDocDraft,
  ArchiveFilter,
  CategoryKey,
} from "@/lib/types";

export default function AdminSite() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [documents, setDocuments] = useState<ArchiveDoc[]>(INITIAL_DOCUMENTS);
  const [filter, setFilter] = useState<ArchiveFilter>(DEFAULT_FILTER);
  const [heroQuery, setHeroQuery] = useState("");
  const [downloads, setDownloads] = useState(0);
  const nextDocumentRef = useRef(15);

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

  function incrementDownloads() {
    setDownloads((value) => value + 1);
  }

  function handleDownload(document: ArchiveDoc) {
    downloadArchiveDoc(document, incrementDownloads);
  }

  function handleSaveDoc(draft: ArchiveDocDraft) {
    setDocuments((previous) => {
      if (draft.id) {
        return previous.map((document) =>
          document.id === draft.id
            ? {
                ...document,
                category: draft.category,
                title: draft.title,
                year: draft.year,
                about: draft.about,
                fileLabel: draft.fileLabel,
                file: draft.file ?? document.file ?? null,
              }
            : document,
        );
      }
      const id = `d${nextDocumentRef.current}`;
      nextDocumentRef.current += 1;
      const { id: _ignored, ...rest } = draft;
      return [...previous, { ...rest, id }];
    });
  }

  function handleDeleteDoc(id: string) {
    setDocuments((previous) =>
      previous.filter((document) => document.id !== id),
    );
  }

  function logout() {
    setLoggedIn(false);
    window.scrollTo({ top: 0 });
  }

  if (!loggedIn) {
    return (
      <LoginScreen
        onLogin={() => {
          setLoggedIn(true);
          window.scrollTo({ top: 0 });
        }}
      />
    );
  }

  return (
    <Shell variant="admin" onLogout={logout}>
      <div className="board">
        <HeroBanner
          variant="admin"
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
          admin
          onDownload={handleDownload}
          onReset={resetFilter}
          onSaveDoc={handleSaveDoc}
          onDeleteDoc={handleDeleteDoc}
        />
        <AppFooter />
      </div>
    </Shell>
  );
}
