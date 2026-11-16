"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Modal from "./Modal";
import DocumentFormModal from "./DocumentFormModal";
import {
  CATEGORIES,
  CATEGORY_LABEL,
  DEFAULT_FILTER,
  documentMatchesQuery,
} from "@/lib/data";
import { archiveSheetHtml } from "@/lib/pdf";
import type {
  ArchiveDoc,
  ArchiveDocDraft,
  ArchiveFilter,
  CategoryKey,
} from "@/lib/types";

type ArchiveCatalogProps = {
  documents: ArchiveDoc[];
  filter: ArchiveFilter;
  onFilterChange: (filter: ArchiveFilter) => void;
  admin?: boolean;
  onDownload: (doc: ArchiveDoc) => void;
  onReset?: () => void;
  onSaveDoc?: (draft: ArchiveDocDraft) => void;
  onDeleteDoc?: (id: string) => void;
};

export default function ArchiveCatalog({
  documents,
  filter,
  onFilterChange,
  admin = false,
  onDownload,
  onReset,
  onSaveDoc,
  onDeleteDoc,
}: ArchiveCatalogProps) {
  const [detailId, setDetailId] = useState<string | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const detailRef = useRef<HTMLDivElement>(null);

  const detail = documents.find((document) => document.id === detailId) ?? null;
  const preview = documents.find((document) => document.id === previewId) ?? null;
  const editing = editingId
    ? documents.find((document) => document.id === editingId) ?? null
    : null;
  const deleting = documents.find((document) => document.id === deleteId) ?? null;

  const yearOptions = useMemo(
    () =>
      Array.from(new Set(documents.map((document) => document.year)))
        .sort()
        .reverse(),
    [documents],
  );

  useEffect(() => {
    if (!detailId) return;
    detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [detailId]);

  useEffect(() => {
    if (detailId && !documents.some((document) => document.id === detailId)) {
      setDetailId(null);
    }
    if (previewId && !documents.some((document) => document.id === previewId)) {
      setPreviewId(null);
    }
  }, [documents, detailId, previewId]);

  useEffect(() => {
    if (filter.tahun && !yearOptions.includes(filter.tahun)) {
      onFilterChange({ ...filter, tahun: "" });
    }
  }, [filter, yearOptions, onFilterChange]);

  const rows = useMemo(() => {
    const query = filter.q.trim();
    const filtered = documents.filter((document) => {
      if (filter.cat !== "semua" && document.category !== filter.cat) {
        return false;
      }
      if (filter.tahun && document.year !== filter.tahun) return false;
      if (query && !documentMatchesQuery(document, query)) return false;
      return true;
    });

    return [...filtered].sort((a, b) => {
      if (filter.urut === "baru") return b.year.localeCompare(a.year);
      if (filter.urut === "lama") return a.year.localeCompare(b.year);
      return a.title.localeCompare(b.title);
    });
  }, [documents, filter]);

  function reset() {
    if (onReset) onReset();
    else onFilterChange(DEFAULT_FILTER);
  }

  function chooseCategory(category: ArchiveFilter["cat"]) {
    onFilterChange({ ...filter, cat: category });
  }

  return (
    <section id="arsip" className="wf-section katalog">
      <div className="katalog-top">
        <div>
          <h2 className="katalog-title">Jelajahi Peraturan &amp; Arsip</h2>
          <p className="muted" id="katalogSub">
            Menampilkan {rows.length} dari {documents.length} dokumen
          </p>
        </div>
        <div className="katalog-tools">
          <select
            id="urutArsip"
            aria-label="Urutkan dokumen"
            value={filter.urut}
            onChange={(event) =>
              onFilterChange({
                ...filter,
                urut: event.target.value as ArchiveFilter["urut"],
              })
            }
          >
            <option value="baru">Terbaru ↓</option>
            <option value="lama">Terlama ↑</option>
            <option value="az">Judul A–Z</option>
          </select>
          <button
            className="btn-secondary btn-sm"
            type="button"
            id="btnReset"
            onClick={reset}
          >
            Atur ulang
          </button>
          {admin ? (
            <button
              className="btn-primary btn-sm"
              type="button"
              id="btnTambah"
              onClick={() => {
                setEditingId(null);
                setFormOpen(true);
              }}
            >
              + Tambah Dokumen
            </button>
          ) : null}
        </div>
      </div>

      <div
        className="pills"
        id="pillsKat"
        role="tablist"
        aria-label="Filter kategori"
      >
        <button
          className={`pill${filter.cat === "semua" ? " active" : ""}`}
          type="button"
          onClick={() => chooseCategory("semua")}
        >
          Semua
        </button>
        {CATEGORIES.map((category) => (
          <button
            key={category.key}
            className={`pill${filter.cat === category.key ? " active" : ""}`}
            type="button"
            onClick={() => chooseCategory(category.key)}
          >
            {category.label}
          </button>
        ))}
      </div>

      <div className="katalog-body">
        <aside className="filter-panel" aria-label="Filter arsip">
          <div className="filter-head">
            <b>Filter</b>
            <button
              className="link-btn"
              type="button"
              id="btnClear"
              onClick={reset}
            >
              Bersihkan
            </button>
          </div>
          <div className="filter-group">
            <span className="filter-cap">Kata Kunci</span>
            <input
              id="cariArsip"
              aria-label="Cari arsip"
              placeholder="Judul / nomor / tag..."
              value={filter.q}
              onChange={(event) =>
                onFilterChange({ ...filter, q: event.target.value })
              }
            />
          </div>
          <div className="filter-group">
            <span className="filter-cap">Kategori</span>
            <div>
              {CATEGORIES.map((category) => {
                const count = documents.filter(
                  (document) => document.category === category.key,
                ).length;
                return (
                  <label className="cek" key={category.key}>
                    <input
                      type="checkbox"
                      value={category.key}
                      checked={filter.cat === category.key}
                      onChange={(event) =>
                        chooseCategory(
                          event.target.checked ? category.key : "semua",
                        )
                      }
                    />
                    <span>{category.label}</span>
                    <em>{count}</em>
                  </label>
                );
              })}
            </div>
          </div>
          <div className="filter-group">
            <span className="filter-cap">Tahun</span>
            <select
              id="tahunArsip"
              aria-label="Filter tahun"
              value={filter.tahun}
              onChange={(event) =>
                onFilterChange({ ...filter, tahun: event.target.value })
              }
            >
              <option value="">Semua tahun</option>
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </aside>

        <div className="katalog-main">
          {detail ? (
            <div
              className="detail-box"
              id="detailBox"
              aria-live="polite"
              ref={detailRef}
            >
              <div className="detail-head">
                <span className="detail-icon" aria-hidden="true">
                  i
                </span>
                <div>
                  <small>Detail dokumen</small>
                  <b>{detail.title}</b>
                </div>
                <button
                  type="button"
                  className="detail-close"
                  aria-label="Tutup detail"
                  onClick={() => setDetailId(null)}
                >
                  &times;
                </button>
              </div>
              <div className="detail-meta">
                <span>
                  <small>Kategori</small>
                  <b>{CATEGORY_LABEL[detail.category]}</b>
                </span>
                <span>
                  <small>Tahun</small>
                  <b>{detail.year}</b>
                </span>
                <span>
                  <small>Tentang</small>
                  <b>{detail.about}</b>
                </span>
                <span>
                  <small>Berkas</small>
                  <b>{detail.fileLabel}</b>
                </span>
              </div>
            </div>
          ) : null}

          <div className="table-wrap">
            <table className="wf-table tabel-arsip" id="tabelArsip">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Nomor / Judul</th>
                  <th>Tahun</th>
                  <th>Tentang</th>
                  <th>File</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {rows.length ? (
                  rows.map((document, index) => (
                    <tr key={document.id}>
                      <td className="cell-no">{index + 1}</td>
                      <td>
                        <div className="doc-title-cell">
                          {filter.cat === "semua" ? (
                            <span className="mini-kat" data-kat={document.category}>
                              {CATEGORY_LABEL[document.category]}
                            </span>
                          ) : null}
                          <span>{document.title}</span>
                        </div>
                      </td>
                      <td>
                        <span className="year-chip">{document.year}</span>
                      </td>
                      <td>{document.about}</td>
                      <td>
                        <span
                          className="file-badge"
                          title={document.fileLabel}
                        >
                          {admin ? document.fileLabel : "PDF"}
                        </span>
                      </td>
                      <td>
                        <div className="row-actions">
                          <button
                            type="button"
                            className="btn-small"
                            onClick={() => setDetailId(document.id)}
                          >
                            Detail
                          </button>
                          {admin ? (
                            <>
                              <button
                                type="button"
                                className="btn-small"
                                onClick={() => {
                                  setEditingId(document.id);
                                  setFormOpen(true);
                                }}
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                className="btn-small btn-danger-ghost"
                                onClick={() => setDeleteId(document.id)}
                              >
                                Hapus
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              className="btn-small"
                              onClick={() => setPreviewId(document.id)}
                            >
                              Lihat
                            </button>
                          )}
                          <button
                            type="button"
                            className="btn-small btn-icon"
                            title="Unduh dokumen"
                            onClick={() => onDownload(document)}
                          >
                            Unduh
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6}>
                      <div className="empty-state">
                        <b>Tidak ada dokumen ditemukan</b>
                        <span>Coba ubah kata kunci atau bersihkan filter.</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal
        open={Boolean(preview)}
        onClose={() => setPreviewId(null)}
        titleId="judulPratinjau"
        size="besar"
        id="modalPratinjau"
      >
        <div className="modal-head">
          <h3 id="judulPratinjau">Pratinjau Berkas</h3>
          <p>Ringkasan metadata dokumen dalam format lembar resmi.</p>
        </div>
        <div
          className="doc-paper modal-doc"
          dangerouslySetInnerHTML={{
            __html: preview ? archiveSheetHtml(preview) : "",
          }}
        />
        <div className="modal-actions">
          <button
            className="btn-secondary btn-sm"
            type="button"
            onClick={() => setPreviewId(null)}
          >
            Tutup
          </button>
          <button
            className="btn-primary btn-sm"
            type="button"
            onClick={() => {
              if (preview) onDownload(preview);
            }}
          >
            Unduh PDF
          </button>
        </div>
      </Modal>

      <DocumentFormModal
        open={formOpen}
        initial={editing}
        defaultCategory={
          filter.cat === "semua" ? CATEGORIES[0].key : filter.cat
        }
        onClose={() => {
          setFormOpen(false);
          setEditingId(null);
        }}
        onSave={(draft) => onSaveDoc?.(draft)}
      />

      <Modal
        open={Boolean(deleting)}
        onClose={() => setDeleteId(null)}
        titleId="judulHapus"
        id="modalHapus"
      >
        <div className="modal-head">
          <h3 id="judulHapus">Hapus dokumen?</h3>
          <p className="muted" id="hapusInfo">
            &quot;{deleting?.title}&quot; ({deleting?.year}) akan dihapus dari
            katalog.
          </p>
          <p>Tindakan ini tidak dapat dibatalkan.</p>
        </div>
        <div className="modal-actions">
          <button
            className="btn-secondary btn-sm"
            type="button"
            onClick={() => setDeleteId(null)}
          >
            Batal
          </button>
          <button
            className="btn-danger btn-sm"
            type="button"
            id="btnYaHapus"
            onClick={() => {
              if (!deleting) return;
              onDeleteDoc?.(deleting.id);
              setDetailId((current) =>
                current === deleting.id ? null : current,
              );
              setPreviewId((current) =>
                current === deleting.id ? null : current,
              );
              setDeleteId(null);
            }}
          >
            Ya, hapus
          </button>
        </div>
      </Modal>
    </section>
  );
}
