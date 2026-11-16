import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "SIPERLU — Arsip Digital Bawaslu Kota Pasuruan",
  description:
    "SIPERLU — pusat arsip digital peraturan dan regulasi Pemilu Bawaslu Kota Pasuruan.",
  icons: {
    icon: "/favicon-siperlu.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0b2344",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
