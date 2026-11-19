# SIPERLU

Arsip digital peraturan dan regulasi Pemilu Bawaslu Kota Pasuruan, dibangun ulang dengan Next.js App Router.

## Menjalankan

```bash
npm run dev
```

Buka:

- Publik: <http://localhost:3000>
- Admin: <http://localhost:3000/admin>

Build produksi (static export ke `out/`):

```bash
npm run build
```

## Deploy ke Cloudflare

Situs diekspor sebagai berkas statis (`output: "export"`) dan disajikan oleh Cloudflare Workers Static Assets.

```bash
npx wrangler login   # sekali saja
npm run deploy       # build + wrangler deploy
npm run preview      # build + jalankan lokal lewat workerd
```

Konfigurasi ada di `wrangler.jsonc` (nama worker `siperlu`, aset dari `./out`).

## Database & storage

Situs memakai layanan Cloudflare:

| Layanan | Nama | Kegunaan |
| --- | --- | --- |
| D1 | `siperlu-db` | metadata dokumen + akun admin |
| R2 | `siperlu-files` | berkas PDF (maks 10 MB) |
| Workers Secrets | `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, `SESSION_SECRET` | kredensial awal login admin |

Terapkan migrasi skema:

```bash
npm run db:migrate
```

Membuat hash password baru:

```bash
node scripts/hash-password.mjs "password-baru"
npx wrangler secret put ADMIN_PASSWORD_HASH
```

Secret hanya dipakai untuk **seed login pertama**: saat admin masuk pertama kali, nilai `ADMIN_EMAIL` dan `ADMIN_PASSWORD_HASH` disalin ke tabel `admin_account` di D1. Setelah itu, sumber kebenaran adalah D1 — mengubah secret tidak lagi mengubah kredensial.

## Profil admin

Setelah login, buka tombol **Profil** di pojok kanan atas (topbar). Dari sana admin bisa:

- mengganti email login;
- mengganti password (minimal 8 karakter);
- wajib memasukkan password saat ini untuk menyimpan perubahan.

Jika email diganti, sesi langsung diperbarui dan login berikutnya memakai email baru. Jika terkunci, reset manual lewat D1:

```bash
node scripts/hash-password.mjs "password-baru"
# salin nilai ADMIN_PASSWORD_HASH, lalu:
npx wrangler d1 execute siperlu-db --remote --command \
  "UPDATE admin_account SET email='email-baru@domain.go.id', password_hash='pbkdf2$...' WHERE id=1"
```

Untuk pengembangan lokal, isi `.dev.vars` (tidak di-commit) dengan tiga variabel yang sama seperti contoh di `wrangler.jsonc`; `wrangler dev` membacanya otomatis.

### API

| Metode | Endpoint | Akses | Fungsi |
| --- | --- | --- | --- |
| GET | `/api/health` | publik | cek D1 + R2 |
| POST | `/api/auth/login` | publik | login, set cookie sesi |
| POST | `/api/auth/logout` | publik | hapus cookie sesi |
| GET | `/api/auth/me` | publik | status sesi |
| GET | `/api/admin/profile` | admin | baca email admin |
| PATCH | `/api/admin/profile` | admin | ubah email/password |
| GET | `/api/documents` | publik | daftar dokumen |
| POST | `/api/documents` | admin | tambah dokumen + PDF |
| PUT | `/api/documents/:id` | admin | ubah dokumen + ganti PDF |
| DELETE | `/api/documents/:id` | admin | hapus dokumen + PDF |
| GET | `/api/files/:id` | publik | unduh/pratinjau PDF dari R2 |

Sesi memakai cookie `HttpOnly` bertanda tangan HMAC (12 jam). Password disimpan sebagai hash PBKDF2-SHA256, bukan teks biasa.

## Mode demo

- Login admin menerima kredensial apa pun.
- CRUD arsip disimpan di state browser.
- Tidak ada API, database, atau autentikasi nyata.
- Data kembali ke kondisi awal saat halaman dimuat ulang.
- File PDF yang diunggah admin hanya bertahan selama sesi.

## Struktur

- `app/`: layout, halaman publik, halaman admin, dan `globals.css`.
- `components/`: shell dashboard (sidebar, topbar, hero, kartu statistik, tabel terbaru, pencarian cepat, donat), kategori, katalog, modal, dan layar login.
- `lib/`: tipe, data demo, format angka, serta generator PDF.
- `public/`: logo, favicon, dan foto yang dipakai halaman Next.js.
- `legacy-static/`: salinan halaman statis lama untuk referensi, tidak disajikan oleh Next.js.

## Lembar & PDF arsip

Tombol `Detail`/`Selengkapnya` menampilkan pratinjau lembar resmi dokumen (kop Bawaslu) di dalam modal. Tombol `Unduh` membuka dialog cetak sebagai PDF dengan ukuran kertas **F4/Folio (210×330mm)** — izinkan pop-up agar kop termuat sebelum dialog terbuka.

## Tampilan (app shell dashboard)

Halaman publik dan admin kini memakai **satu shell dashboard** yang sama (`components/Shell.tsx`): sidebar navy (`components/SideNav.tsx`) dengan logo SIPERLU, nav berikon dengan scroll-spy, serta tombol `Keluar` (hanya pada admin); topbar putih (`components/TopBar.tsx`) dengan sapaan, lonceng notifikasi, dan avatar (admin). Halaman publik tidak menyediakan tautan login admin — dashboard hanya diakses lewat `/admin`.

Isi papan (`components/HeroBanner`, `StatCards`, `RecentTable`, `QuickSearchCard`, `DonutCard`, `CategorySection`, `ArchiveCatalog`, `AppFooter`):

- Hero banner navy bergradien: judul dengan penekanan emas, kolom pencarian, tombol `Cari`, dan foto jajaran.
- Empat kartu statistik: Total Arsip, Arsip Tersedia, Kali Diunduh, dan Arsip Terbaru.
- Tabel `Arsip Terbaru` (5 dokumen terbaru) dengan tombol mata untuk pratinjau lembar resmi; modalnya juga menyediakan `Unduh PDF`.
- Kartu `Pencarian Cepat` (tile Peraturan, Bawaslu, KPU, SK & BA) dan donat `Statistik Arsip` per kategori.
- Kategori arsip dan katalog terpadu; pil kategori di tabel berwarna per kategori (`data-kat`).
- Footer ringkas.

Perbedaan publik vs admin hanyalah konteks: hero publik "Cari arsip...", hero admin "Kelola arsip...", aksi CRUD (`Tambah Dokumen`, `Edit`, `Hapus`) saat masuk dashboard, dan mode demo tetap berlaku. Pada layar ≤1080px sidebar menjadi drawer yang dibuka tombol hamburger. Gaya shell memakai awalan `hb-`/`sb-`/`tb-`/`stat-`/`rc-`/`qs-`/`dn-`/`af-` di `app/globals.css`. Layar login admin tetap kartu terang.
