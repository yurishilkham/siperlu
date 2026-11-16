import type {
  ArchiveDoc,
  ArchiveFilter,
  Category,
  CategoryKey,
} from "./types";

export const CATEGORIES: Category[] = [
  {
    key: "htn",
    label: "HTN",
    short: "UU Pemilu & Pemilihan",
    description: "UU",
    icon: "UU",
    iconBg: "#fee2e2",
  },
  {
    key: "bawaslu",
    label: "BAWASLU",
    short: "Peraturan & Surat Edaran Bawaslu",
    description: "BW",
    icon: "BW",
    iconBg: "#dbeafe",
  },
  {
    key: "kpu",
    label: "KPU",
    short: "PKPU, SE & SK KPU",
    description: "KPU",
    icon: "KP",
    iconBg: "#ede9fe",
  },
  {
    key: "dkpp",
    label: "DKPP",
    short: "Putusan & Peraturan DKPP",
    description: "DK",
    icon: "DK",
    iconBg: "#ccfbf1",
  },
  {
    key: "hukum-lainnya",
    label: "HUKUM LAINNYA",
    short: "Surat Keputusan Bersama",
    description: "HL",
    icon: "HL",
    iconBg: "#fef3c7",
  },
];

export const CATEGORY_LABEL = Object.fromEntries(
  CATEGORIES.map((category) => [category.key, category.label]),
) as Record<CategoryKey, string>;

export function documentMatchesQuery(
  document: ArchiveDoc,
  query: string,
): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;

  return `${document.title} ${document.about} ${document.year} ${
    CATEGORY_LABEL[document.category]
  }`
    .toLowerCase()
    .includes(needle);
}

export const INITIAL_DOCUMENTS: ArchiveDoc[] = [];

export const DEFAULT_FILTER: ArchiveFilter = {
  cat: "semua",
  q: "",
  tahun: "",
  urut: "baru",
};
