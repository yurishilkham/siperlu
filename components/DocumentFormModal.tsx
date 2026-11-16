"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import Modal from "./Modal";
import { CATEGORIES } from "@/lib/data";
import { fmtSize } from "@/lib/format";
import type {
  ArchiveDoc,
  ArchiveDocDraft,
  ArchiveFile,
  CategoryKey,
} from "@/lib/types";

type DocumentFormModalProps = {
  open: boolean;
  initial: ArchiveDoc | null;
  defaultCategory: CategoryKey;
  onClose: () => void;
  onSave: (draft: ArchiveDocDraft) => void;
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
  const [file, setFile] = useState<ArchiveFile | null>(null);
  const [fileInfo, setFileInfo] = useState(EMPTY_INFO);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (initial) {
      setCategory(initial.category);
      setJudul(initial.title);
      setTahun(initial.year);
      setTentang(initial.about);
      setFile(initial.file ?? null);
      setFileInfo(
        `Berkas saat ini: ${initial.fileLabel}. Pilih file baru untuk mengganti.`,
      );
    } else {
      setCategory(defaultCategory);
      setJudul("");
      setTahun(String(new Date().getFullYear()));
      setTentang("");
      setFile(null);
      setFileInfo(EMPTY_INFO);
    }
  }, [open, initial, defaultCategory]);

  function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const picked = event.target.files?.[0];
    if (!picked) {
      setFile(initial?.file ?? null);
      setFileInfo(
        initial
          ? `Berkas saat ini: ${initial.fileLabel}. Pilih file baru untuk mengganti.`
          : EMPTY_INFO,
      );
      return;
    }
    if (!/\.pdf$/i.test(picked.name) && picked.type !== "application/pdf") {
      setFileInfo("File harus berformat PDF.");
      event.target.value = "";
      return;
    }
    if (picked.size > 10 * 1048576) {
      setFileInfo("Ukuran melebihi 10 MB.");
      event.target.value = "";
      return;
    }

    setFileInfo(`Membaca ${picked.name} (${fmtSize(picked.size)})...`);
    const reader = new FileReader();
    reader.onload = () => {
      setFile({
        name: picked.name,
        size: picked.size,
        url: String(reader.result || ""),
      });
      setFileInfo(`Terpilih: ${picked.name} (${fmtSize(picked.size)})`);
    };
    reader.readAsDataURL(picked);
  }

  function save() {
    const nextTitle = judul.trim();
    const nextYear = tahun.trim();
    if (!nextTitle || !nextYear) {
      window.alert("Isi Nomor/Judul dan Tahun dulu.");
      return;
    }
    const nextFile = file ?? initial?.file ?? null;
    const fileLabel =
      file && nextFile
        ? `PDF · ${nextFile.name} · ${fmtSize(nextFile.size)}`
        : initial?.fileLabel || "PDF";

    onSave({
      id: initial?.id,
      category,
      title: nextTitle,
      year: nextYear,
      about: tentang.trim() || "-",
      fileLabel,
      file: nextFile,
    });
    onClose();
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
      <div className="modal-actions">
        <button className="btn-secondary btn-sm" type="button" onClick={onClose}>
          Batal
        </button>
        <button
          className="btn-primary btn-sm"
          type="button"
          id="btnSimpanDok"
          onClick={save}
        >
          Simpan
        </button>
      </div>
    </Modal>
  );
}
