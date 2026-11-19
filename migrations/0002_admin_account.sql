-- Akun admin tunggal; kredensial dikelola dari halaman Profil.
-- Baris pertama di-seed dari secret ADMIN_EMAIL / ADMIN_PASSWORD_HASH saat login pertama.
CREATE TABLE IF NOT EXISTS admin_account (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  email TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
