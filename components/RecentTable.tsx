"use client";

import { useState } from "react";
import Modal from "./Modal";
import { CATEGORY_LABEL } from "@/lib/data";
import { archiveSheetHtml } from "@/lib/pdf";
import type { ArchiveDoc } from "@/lib/types";

type RecentTableProps = {
  documents: ArchiveDoc[];
  onDownload: (doc: ArchiveDoc) => void;
};

export default function RecentTable({
  documents,
  onDownload,
}: RecentTableProps) {
  const [previewId, setPreviewId] = useState<string | null>(null);
  const recent = [...documents]
    .sort(
      (a, b) =>
        b.year.localeCompare(a.year) || a.title.localeCompare(b.title),
    )
    .slice(0, 5);
  const preview = recent.find((doc) => doc.id === previewId) ?? null;

  return (
    <section id="terbaru" className="rc-card">
      <div className="rc-head">
        <h2>
          <span className="rc-head-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.5 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7.5z" />
              <path d="M14.5 3v4.5H19" />
              <path d="M9 12.5h6M9 16h4" />
            </svg>
          </span>
          Arsip Terbaru
        </h2>
        <a
          className="rc-semua"
          href="#arsip"
          onClick={(event) => {
            event.preventDefault();
            document
              .getElementById("arsip")
              ?.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
        >
          Lihat Semua
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12h13" />
            <path d="m12.5 6.5 5.5 5.5-5.5 5.5" />
          </svg>
        </a>
      </div>
      <div className="rc-table-wrap">
        <table className="rc-table">
          <thead>
            <tr>
              <th className="rc-th-no">No</th>
              <th>Dokumen</th>
              <th className="rc-th-kat">Kategori</th>
              <th className="rc-th-tahun">Tahun</th>
              <th className="rc-th-aksi">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {recent.length === 0 ? (
              <tr>
                <td className="rc-empty" colSpan={5}>
                  Belum ada arsip. Dokumen yang ditambahkan akan tampil di sini.
                </td>
              </tr>
            ) : null}
            {recent.map((doc, index) => (
              <tr key={doc.id}>
                <td className="rc-no">{index + 1}</td>
                <td>
                  <div className="rc-doc">
                    <span className="rc-file">PDF</span>
                    <b>{doc.title}</b>
                  </div>
                </td>
                <td>
                  <span className="kat-pill" data-kat={doc.category}>
                    {CATEGORY_LABEL[doc.category]}
                  </span>
                </td>
                <td className="rc-tahun">{doc.year}</td>
                <td>
                  <button
                    type="button"
                    className="rc-eye"
                    aria-label={`Pratinjau ${doc.title}`}
                    title="Pratinjau dokumen"
                    onClick={() => setPreviewId(doc.id)}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        open={Boolean(preview)}
        onClose={() => setPreviewId(null)}
        titleId="judulTerbaru"
        size="besar"
        id="modalTerbaru"
      >
        <div className="modal-head">
          <h3 id="judulTerbaru">Pratinjau Berkas</h3>
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
    </section>
  );
}
