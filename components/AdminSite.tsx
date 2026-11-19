"use client";

import { useEffect, useState } from "react";
import Shell from "./Shell";
import AppFooter from "./AppFooter";
import HeroBanner from "./HeroBanner";
import LoginScreen from "./LoginScreen";
import RecentTable from "./RecentTable";
import QuickSearchCard from "./QuickSearchCard";
import DonutCard from "./DonutCard";
import CategorySection from "./CategorySection";
import ArchiveCatalog from "./ArchiveCatalog";
import ProfileModal from "./ProfileModal";
import { DEFAULT_FILTER, documentMatchesQuery } from "@/lib/data";
import {
  deleteDocument,
  fetchDocuments,
  fetchSession,
  login,
  logout,
  saveDocument,
} from "@/lib/api";
import { downloadArchiveDoc } from "@/lib/pdf";
import type {
  ArchiveDoc,
  ArchiveDocDraft,
  ArchiveFilter,
  CategoryKey,
} from "@/lib/types";

export default function AdminSite() {
  const [checking, setChecking] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [loginBusy, setLoginBusy] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [documents, setDocuments] = useState<ArchiveDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [filter, setFilter] = useState<ArchiveFilter>(DEFAULT_FILTER);
  const [heroQuery, setHeroQuery] = useState("");
  const [downloads, setDownloads] = useState(0);

  useEffect(() => {
    fetchSession()
      .then((session) => {
        setLoggedIn(session.authenticated);
        if (session.email) setAdminEmail(session.email);
      })
      .catch(() => setLoggedIn(false))
      .finally(() => setChecking(false));
  }, []);

  useEffect(() => {
    if (!loggedIn) return;
    let active = true;

    setLoading(true);
    fetchDocuments()
      .then((items) => {
        if (active) {
          setDocuments(items);
          setLoadError("");
        }
      })
      .catch((error: unknown) => {
        if (active) {
          setLoadError(
            error instanceof Error ? error.message : "Gagal memuat arsip.",
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [loggedIn]);

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

  async function handleLogin(email: string, password: string) {
    setLoginBusy(true);
    setLoginError("");
    try {
      const session = await login(email, password);
      if (session.email) setAdminEmail(session.email);
      setLoggedIn(true);
      window.scrollTo({ top: 0 });
    } catch (error) {
      setLoginError(
        error instanceof Error ? error.message : "Tidak bisa masuk.",
      );
    } finally {
      setLoginBusy(false);
    }
  }

  async function handleLogout() {
    try {
      await logout();
    } catch {
      /* sesi lokal tetap dibersihkan */
    }
    setLoggedIn(false);
    setDocuments([]);
    setFilter(DEFAULT_FILTER);
    setHeroQuery("");
    window.scrollTo({ top: 0 });
  }

  async function handleSaveDoc(draft: ArchiveDocDraft, file: File | null) {
    const saved = await saveDocument(draft, file);
    setDocuments((previous) =>
      draft.id
        ? previous.map((document) =>
            document.id === saved.id ? saved : document,
          )
        : [saved, ...previous],
    );
  }

  async function handleDeleteDoc(id: string) {
    try {
      await deleteDocument(id);
      setDocuments((previous) =>
        previous.filter((document) => document.id !== id),
      );
    } catch (error) {
      window.alert(
        error instanceof Error ? error.message : "Gagal menghapus dokumen.",
      );
    }
  }

  if (checking) {
    return (
      <div className="login-screen">
        <div className="login-card">
          <p className="login-note">Memeriksa sesi…</p>
        </div>
      </div>
    );
  }

  if (!loggedIn) {
    return (
      <LoginScreen
        onLogin={handleLogin}
        busy={loginBusy}
        error={loginError}
      />
    );
  }

  return (
    <Shell variant="admin" onLogout={handleLogout} onProfile={() => setProfileOpen(true)}>
      <div className="board">
        <HeroBanner
          variant="admin"
          query={heroQuery}
          onQueryChange={setHeroQuery}
          onSearch={() => runSearch(heroQuery)}
        />
        {loadError ? <p className="load-note">{loadError}</p> : null}
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
          loading={loading}
        />
        <AppFooter />
      </div>
      <ProfileModal
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        email={adminEmail}
        onUpdated={setAdminEmail}
      />
    </Shell>
  );
}
