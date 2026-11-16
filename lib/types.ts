export type CategoryKey =
  | "bawaslu"
  | "kpu"
  | "dkpp"
  | "hukum-lainnya"
  | "htn";

export type FilterCategory = CategoryKey | "semua";
export type SortOrder = "baru" | "lama" | "az";

export interface Category {
  key: CategoryKey;
  label: string;
  short: string;
  description: string;
  icon: string;
  iconBg: string;
}

export interface ArchiveFile {
  name: string;
  size: number;
  url: string;
}

export interface ArchiveDoc {
  id: string;
  category: CategoryKey;
  title: string;
  year: string;
  about: string;
  fileLabel: string;
  file?: ArchiveFile | null;
}

export type ArchiveDocDraft = Omit<ArchiveDoc, "id"> & { id?: string };

export interface ArchiveFilter {
  cat: FilterCategory;
  q: string;
  tahun: string;
  urut: SortOrder;
}
