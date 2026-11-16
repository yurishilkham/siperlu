import type { Metadata } from "next";
import AdminSite from "@/components/AdminSite";

export const metadata: Metadata = {
  title: "Admin — SIPERLU Bawaslu Kota Pasuruan",
  description:
    "Dashboard administrator SIPERLU — kelola arsip regulasi Bawaslu Kota Pasuruan.",
};

export default function AdminPage() {
  return <AdminSite />;
}
