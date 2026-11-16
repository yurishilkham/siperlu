"use client";

import { useRef, useState, type FormEvent } from "react";

type HeroBannerProps = {
  variant: "public" | "admin";
  query: string;
  onQueryChange: (value: string) => void;
  onSearch: () => number;
};

export default function HeroBanner({
  variant,
  query,
  onQueryChange,
  onSearch,
}: HeroBannerProps) {
  const admin = variant === "admin";
  const inputRef = useRef<HTMLInputElement>(null);
  const [searchNotice, setSearchNotice] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const keyword = query.trim();
    if (!keyword) {
      setSearchNotice("");
      const input = inputRef.current;
      input?.setCustomValidity(
        "Masukkan kata kunci atau dokumen yang ingin dicari.",
      );
      input?.reportValidity();
      input?.focus();
      return;
    }

    inputRef.current?.setCustomValidity("");
    const matches = onSearch();
    setSearchNotice(
      matches > 0 ? "" : "Arsip yang dicari belum tersedia. Coba kata kunci lain.",
    );
  }

  /*
    The right-hand artwork (public/hero-scene.webp) is a transparent crop of
    Banner.png: building, jajaran, and ribbons only. Everything the user reads
    or types is real HTML on top, so the headline and search stay sharp at any
    screen density instead of being baked into the bitmap.
  */
  return (
    <section id="beranda" className="hb-wrap">
      <div className="hb-hero">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="hb-scene"
          src="/hero-scene.webp"
          alt=""
          width={1321}
          height={630}
          draggable={false}
          aria-hidden="true"
        />

        <span className="hb-bar" aria-hidden="true" />

        <div className="hb-copy">
          <p className="hb-eyebrow">
            <span className="hb-eyebrow-line" aria-hidden="true" />
            {admin
              ? "Panel Arsip Bawaslu Kota Pasuruan"
              : "Arsip Digital Bawaslu Kota Pasuruan"}
          </p>

          <h1 className="hb-title">
            {admin ? "Kelola" : "Cari"} <span>arsip</span> dengan Mudah,{" "}
            <br />
            Akses Informasi <span>Lebih Cepat</span>
          </h1>

          <p className="hb-desc">
            {admin
              ? "Kelola arsip digital Bawaslu Kota Pasuruan dengan cepat dan efisien."
              : "SIPERLU hadir untuk membantu Anda mencari arsip secara digital dengan efisien."}
          </p>

          <form
            className="hb-search"
            onSubmit={submit}
            role="search"
            aria-label="Pencarian arsip"
            noValidate
          >
            <svg
              className="hb-search-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="6.5" />
              <path d="m16 16 4.2 4.2" />
            </svg>

            <input
              ref={inputRef}
              name="q"
              required
              aria-label="Cari arsip berdasarkan judul, kategori, atau kata kunci"
              placeholder="Cari arsip berdasarkan judul, kategori, atau kata kunci"
              value={query}
              onChange={(event) => {
                inputRef.current?.setCustomValidity("");
                setSearchNotice("");
                onQueryChange(event.target.value);
              }}
              autoComplete="off"
            />

            <button className="hb-cari" type="submit">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="6.5" />
                <path d="m16 16 4.2 4.2" />
              </svg>
              <span>Cari</span>
            </button>
          </form>

          {searchNotice && query.trim() ? (
            <p className="hb-note" role="status">
              {searchNotice}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
