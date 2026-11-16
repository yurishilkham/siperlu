"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import Modal from "./Modal";
import { CATEGORIES } from "@/lib/data";
import { fmtSize } from "@/lib/format";
import type {
  ArchiveDoc,
  ArchiveDocDraft,
  CategoryKey,
} from "@/lib/types";

type DocumentFormModalProps = {
  open: boolean;
  initial: ArchiveDoc | null;
  defaultCategory: CategoryKey;
  onClose: () => void;
  onSave: (draft: ArchiveDocDraft, file: File | null) => Promise<void>;
};

const EMPTY_INFO = "Belum ada file dipilih. Format PDF, maks 10 MB.";

export default function DocumentFormModal({
  open,
  initial,
  defaultCategory,
  onClose,
  onSave,
}: DocumentFormModalProps) {
  const [category, setCategory] = useState<CategoryKey>(defaultCategory);
  const [judul, setJudul] = useState("");
  const [tahun, setTahun] = useState(String(new Date().getFullYear()));
  const [tentang, setTentang] = useState("");
  const [pickedFile, setPickedFile] = useState<File | null>(null);
  const [fileInfo, setFileInfo] = useState(EMPTY_INFO);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    if (fileInputRef.current) fileInputRef.current.value = "";
    setSaving(false);
    setError("");
    setPickedFile(null);
    if (initial) {
      setCategory(initial.category);
      setJudul(initial.title);
      setTahun(initial.year);
      setTentang(initial.about);
      setFileInfo(
        `Berkas saat ini: ${initial.fileLabel}. Pilih file baru untuk mengganti.`,
      );
    } else {
      setCategory(defaultCategory);
      setJudul("");
      setTahun(String(new Date().getFullYear()));
      setTentang("");
      setFileInfo(EMPTY_INFO);
    }
  }, [open, initial, defaultCategory]);

  function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const picked = event.target.files?.[0];
    if (!picked) {
      setPickedFile(null);
      setFileInfo(
        initial
          ? `Berkas saat ini: ${initial.fileLabel}. Pilih file baru untuk mengganti.`
          : EMPTY_INFO,
      );
      return;
    }
    if (!/\.pdf$/i.test(picked.name) && picked.type !== "application/pdf") {
      setFileInfo("File harus berformat PDF.");
      setPickedFile(null);
      event.target.value = "";
      return;
    }
    if (picked.size > 10 * 1048576) {
      setFileInfo("Ukuran melebihi 10 MB.");
      setPickedFile(null);
      event.target.value = "";
      return;
    }

    setPickedFile(picked);
    setFileInfo(`Terpilih: ${picked.name} (${fmtSize(picked.size)})`);
  }

  async function save() {
    if (saving) return;
    const nextTitle = judul.trim();
    const nextYear = tahun.trim();
    if (!nextTitle || !nextYear) {
      window.alert("Isi Nomor/Judul dan Tahun dulu.");
      return;
    }

    const fileLabel = pickedFile
      ? `PDF · ${pickedFile.name} · ${fmtSize(pickedFile.size)}`
      : initial?.fileLabel || "PDF";

    const draft: ArchiveDocDraft = {
      id: initial?.id,
      category,
      title: nextTitle,
      year: nextYear,
      about: tentang.trim() || "-",
      fileLabel,
      file: initial?.file ?? null,
    };

    setSaving(true);
    setError("");
    try {
      await onSave(draft, pickedFile);
      onClose();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Gagal menyimpan dokumen.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      titleId="mfJudul"
      id="modalForm"
    >
      <div className="modal-head">
        <h3 id="mfJudul">
          {initial ? "Ubah Dokumen" : "Tambah Dokumen"}
        </h3>
        <p>
          Isi metadata arsip, lalu simpan untuk menerbitkannya ke katalog.
        </p>
      </div>
      <label className="field">
        Kategori *
        <select
          id="m_kat"
          value={category}
          onChange={(event) =>
            setCategory(event.target.value as CategoryKey)
          }
        >
          {CATEGORIES.map((item) => (
            <option key={item.key} value={item.key}>
              {item.label}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        Nomor / Judul *
        <input
          id="m_judul"
          placeholder="cth: Perbawaslu No. 5 Tahun 2024"
          value={judul}
          onChange={(event) => setJudul(event.target.value)}
        />
      </label>
      <div className="row2">
        <label className="field">
          Tahun *
          <input
            id="m_tahun"
            type="number"
            placeholder="2026"
            value={tahun}
            onChange={(event) => setTahun(event.target.value)}
          />
        </label>
        <label className="field">
          File PDF
          <input
            id="m_filepick"
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFile}
          />
        </label>
      </div>
      <p className="muted small" id="m_fileinfo">
        {fileInfo}
      </p>
      <label className="field">
        Tentang
        <input
          id="m_tentang"
          placeholder="cth: Pengawasan Tahapan"
          value={tentang}
          onChange={(event) => setTentang(event.target.value)}
        />
      </label>
      {error ? <p className="form-error">{error}</p> : null}
      <div className="modal-actions">
        <button
          className="btn-secondary btn-sm"
          type="button"
          onClick={onClose}
          disabled={saving}
        >
          Batal
        </button>
        <button
          className="btn-primary btn-sm"
          type="button"
          id="btnSimpanDok"
          onClick={save}
          disabled={saving}
        >
          {saving ? "Menyimpan…" : "Simpan"}
        </button>
      </div>
    </Modal>
  );
}
