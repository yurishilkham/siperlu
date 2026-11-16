export function fmtCacah(n: number): string {
  return n >= 1000
    ? `${(n / 1000).toLocaleString("id-ID", { maximumFractionDigits: 1 })} rb`
    : n.toLocaleString("id-ID");
}

export function fmtSize(bytes: number): string {
  if (bytes >= 1048576) {
    return `${(bytes / 1048576).toLocaleString("id-ID", {
      maximumFractionDigits: 1,
    })} MB`;
  }
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export function escapeHtml(value: string | number | null | undefined): string {
  return String(value ?? "").replace(/[<>&"']/g, (char) => {
    const map: Record<string, string> = {
      "<": "&lt;",
      ">": "&gt;",
      "&": "&amp;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return map[char];
  });
}

export function tahunBerlaku(tahun: string): boolean {
  return Number(tahun) >= 2024;
}

export function namaAman(value: string): string {
  return (
    (value || "dokumen")
      .replace(/[^\w\- ]+/g, "")
      .trim()
      .slice(0, 60) || "dokumen"
  );
}
