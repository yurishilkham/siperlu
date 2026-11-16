-- SIPERLU: skema arsip digital
CREATE TABLE IF NOT EXISTS documents (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  year TEXT NOT NULL,
  about TEXT NOT NULL DEFAULT '-',
  file_key TEXT,
  file_name TEXT,
  file_size INTEGER,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_documents_category ON documents (category);
CREATE INDEX IF NOT EXISTS idx_documents_year ON documents (year);
CREATE INDEX IF NOT EXISTS idx_documents_created ON documents (created_at DESC);
