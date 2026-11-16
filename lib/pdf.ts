import { CATEGORY_LABEL } from "./data";
import { escapeHtml, namaAman, tahunBerlaku } from "./format";
import type { ArchiveDoc } from "./types";

export const GAYA_PDF = `
  *{ box-sizing:border-box; }
  body{ margin:0; background:#fff; color:#111; font-family:"Segoe UI", Tahoma, Geneva, Verdana, sans-serif; font-size:12.5px; line-height:1.6; }
  .kop{ display:flex; gap:12px; border-bottom:3px double #111; padding-bottom:12px; align-items:flex-start; margin-bottom:14px; }
  .kop-logo{ width:64px; height:64px; object-fit:contain; flex-shrink:0; }
  .kop-brand{ line-height:1.25; }
  .kop-bawaslu{ font-weight:900; font-size:26px; letter-spacing:3px; color:#111; }
  .kop-sub{ font-size:10px; letter-spacing:1px; color:#111; }
  .kop-kota{ font-size:14px; letter-spacing:5px; color:#111; }
  .kop-addr{ font-size:11px; line-height:1.4; margin-left:auto; text-align:left; }
  .doc-judul{ text-align:center; font-weight:800; margin:8px 0 12px; font-size:14px; text-transform:uppercase; letter-spacing:.4px; }
  .doc-body > b{ display:block; margin:14px 0 4px; padding-bottom:2px; border-bottom:1px solid #111; font-size:11px; text-transform:uppercase; }
  .doc-tbl{ border-collapse:collapse; margin:4px 0 10px; width:100%; }
  .doc-tbl td{ padding:1px 6px 1px 0; vertical-align:top; }
  .doc-tbl td:first-child{ width:130px; }
  .muted{ color:#777; font-size:13px; }
  .small{ font-size:11px; }
  @page{ size:210mm 330mm; margin:18mm 16mm; }
`;

function kopHtml(): string {
  return `<div class="kop">
    <img src="/logo-bawaslu.png" class="kop-logo" alt="Bawaslu">
    <div class="kop-brand">
      <div class="kop-bawaslu">BAWASLU</div>
      <div class="kop-sub">BADAN PENGAWAS PEMILIHAN UMUM</div>
      <div class="kop-kota">KOTA PASURUAN</div>
    </div>
    <div class="kop-addr">
      Jl. Untung Suropati No. 23 Kota Pasuruan<br>
      Telepon&ensp;: (0343) 6008063<br>
      Surel&emsp;&ensp;&nbsp;: set.pasuruankota@bawaslu.go.id<br>
      Laman&ensp;&nbsp;: http://pasuruankota.bawaslu.go.id
    </div>
  </div>`;
}

export function archiveSheetHtml(doc: ArchiveDoc): string {
  const category = CATEGORY_LABEL[doc.category];
  return `${kopHtml()}
    <div class="doc-judul">${escapeHtml(doc.title)}<br><span class="muted small">${escapeHtml(category)} • Tahun ${escapeHtml(doc.year)}</span></div>
    <div class="doc-body">
      <table class="doc-tbl">
        <tr><td>Kategori</td><td>: ${escapeHtml(category)}</td></tr>
        <tr><td>Nomor / Judul</td><td>: ${escapeHtml(doc.title)}</td></tr>
        <tr><td>Tahun</td><td>: ${escapeHtml(doc.year)}</td></tr>
        <tr><td>Tentang</td><td>: ${escapeHtml(doc.about)}</td></tr>
        <tr><td>Status</td><td>: ${tahunBerlaku(doc.year) ? "Berlaku" : "Arsip"}</td></tr>
        <tr><td>Berkas</td><td>: ${escapeHtml(doc.fileLabel)}</td></tr>
      </table>
      <p class="muted small">Pratinjau arsip digital SIPERLU — Bawaslu Kota Pasuruan. Unduh berkas untuk isi lengkap.</p>
    </div>`;
}

export function unduhPDF(html: string, judul: string): void {
  if (typeof window === "undefined") return;
  const win = window.open("", "_blank");
  if (!win) {
    window.alert(
      "Pop-up diblokir. Izinkan pop-up agar berkas PDF dapat disimpan.",
    );
    return;
  }
  const base = `${window.location.origin}/`;
  win.document.write(
    `<!DOCTYPE html><html lang="id"><head><meta charset="utf-8"><base href="${base}"><title>${escapeHtml(
      judul,
    )}</title><style>${GAYA_PDF}</style></head><body><div class="doc-paper">${html}</div></body></html>`,
  );
  win.document.close();
  win.focus();

  const cetak = () => {
    win.onafterprint = () => win.close();
    win.print();
  };
  const imgs = [...win.document.images];
  let sisa = imgs.filter((img) => !img.complete).length;
  if (!sisa) {
    window.setTimeout(cetak, 300);
    return;
  }
  imgs
    .filter((img) => !img.complete)
    .forEach((img) => {
      img.addEventListener("load", () => {
        sisa -= 1;
        if (sisa === 0) window.setTimeout(cetak, 300);
      });
      img.addEventListener("error", () => {
        sisa -= 1;
        if (sisa === 0) window.setTimeout(cetak, 300);
      });
    });
}

export function downloadArchiveDoc(doc: ArchiveDoc, onDone?: () => void): void {
  if (doc.file?.url) {
    const anchor = document.createElement("a");
    anchor.href = doc.file.url;
    anchor.download = doc.file.name || `${namaAman(doc.title)}.pdf`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  } else {
    unduhPDF(archiveSheetHtml(doc), doc.title);
  }
  onDone?.();
}
