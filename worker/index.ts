/**
 * SIPERLU API + static assets worker.
 * Menyajikan hasil static export Next.js dan API /api/* dengan D1 + R2.
 */

type D1Stmt = {
  bind(...values: unknown[]): D1Stmt;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  all<T = Record<string, unknown>>(): Promise<{ results: T[] }>;
  run(): Promise<{ success: boolean }>;
};

type D1 = { prepare(query: string): D1Stmt };

type R2Object = {
  body: ReadableStream;
  size: number;
  httpEtag?: string;
};

type R2 = {
  get(key: string): Promise<R2Object | null>;
  put(
    key: string,
    value: ArrayBuffer,
    options?: { httpMetadata?: { contentType?: string; contentDisposition?: string } },
  ): Promise<unknown>;
  delete(key: string | string[]): Promise<void>;
  list(options?: { prefix?: string }): Promise<{ objects: { key: string }[] }>;
};

type Assets = { fetch(request: Request): Promise<Response> };

interface Env {
  DB: D1;
  FILES: R2;
  ASSETS: Assets;
  ADMIN_EMAIL: string;
  ADMIN_PASSWORD_HASH: string;
  SESSION_SECRET: string;
}

type DocumentRow = {
  id: string;
  category: string;
  title: string;
  year: string;
  about: string;
  file_key: string | null;
  file_name: string | null;
  file_size: number | null;
  created_at: string;
  updated_at: string;
};

const CATEGORIES = new Set(["bawaslu", "kpu", "dkpp", "hukum-lainnya", "htn"]);
const MAX_FILE_BYTES = 10 * 1024 * 1024;
const SESSION_COOKIE = "siperlu_session";
const SESSION_TTL = 60 * 60 * 12;

const encoder = new TextEncoder();

function json(data: unknown, status = 200, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...headers,
    },
  });
}

function fail(status: number, message: string) {
  return json({ error: message }, status);
}

function fmtSize(bytes: number): string {
  if (bytes >= 1048576) {
    return `${(bytes / 1048576).toLocaleString("id-ID", {
      maximumFractionDigits: 1,
    })} MB`;
  }
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function toDocument(row: DocumentRow) {
  return {
    id: row.id,
    category: row.category,
    title: row.title,
    year: row.year,
    about: row.about,
    fileLabel:
      row.file_key && row.file_name
        ? `PDF · ${row.file_name} · ${fmtSize(row.file_size ?? 0)}`
        : "PDF",
    file:
      row.file_key && row.file_name
        ? {
            name: row.file_name,
            size: row.file_size ?? 0,
            url: `/api/files/${row.id}`,
          }
        : null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function bytesToB64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64UrlToBytes(value: string): Uint8Array<ArrayBuffer> {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let index = 0; index < a.length; index += 1) {
    diff |= a[index] ^ b[index];
  }
  return diff === 0;
}

async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

async function signSession(secret: string, payload: string): Promise<string> {
  const signature = await crypto.subtle.sign(
    "HMAC",
    await hmacKey(secret),
    encoder.encode(payload),
  );
  return bytesToB64Url(new Uint8Array(signature));
}

async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, iterations, saltB64, hashB64] = stored.split("$");
  if (scheme !== "pbkdf2" || !iterations || !saltB64 || !hashB64) return false;

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: b64UrlToBytes(saltB64),
      iterations: Number(iterations),
      hash: "SHA-256",
    },
    key,
    256,
  );
  return timingSafeEqual(new Uint8Array(bits), b64UrlToBytes(hashB64));
}

function readCookie(request: Request, name: string): string | null {
  const header = request.headers.get("cookie");
  if (!header) return null;
  for (const part of header.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return rest.join("=");
  }
  return null;
}

async function currentUser(request: Request, env: Env): Promise<string | null> {
  const token = readCookie(request, SESSION_COOKIE);
  if (!token) return null;

  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  const expected = await signSession(env.SESSION_SECRET, payload);
  if (!timingSafeEqual(encoder.encode(signature), encoder.encode(expected))) {
    return null;
  }

  try {
    const decoded = JSON.parse(new TextDecoder().decode(b64UrlToBytes(payload))) as {
      sub?: string;
      exp?: number;
    };
    if (!decoded.sub || !decoded.exp || decoded.exp < Date.now()) return null;
    return decoded.sub;
  } catch {
    return null;
  }
}

async function createSession(email: string, env: Env): Promise<string> {
  const payload = bytesToB64Url(
    encoder.encode(JSON.stringify({ sub: email, exp: Date.now() + SESSION_TTL * 1000 })),
  );
  const signature = await signSession(env.SESSION_SECRET, payload);
  return `${payload}.${signature}`;
}

function sessionCookie(token: string, maxAge: number, secure: boolean): string {
  const parts = [
    `${SESSION_COOKIE}=${token}`,
    "HttpOnly",
    "SameSite=Lax",
    "Path=/",
    `Max-Age=${maxAge}`,
  ];
  if (secure) parts.push("Secure");
  return parts.join("; ");
}

function safeFileName(name: string): string {
  const base = name.split(/[\\/]/).pop() ?? "dokumen.pdf";
  const cleaned = base.replace(/[^\w.\- ]+/g, "").trim().slice(-100);
  if (!cleaned || !/\.pdf$/i.test(cleaned)) return "dokumen.pdf";
  return cleaned;
}

function cleanText(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function validateDocument(input: {
  category: string;
  title: string;
  year: string;
  about: string;
}): string | null {
  if (!CATEGORIES.has(input.category)) return "Kategori tidak valid.";
  if (input.title.length < 1) return "Nomor/Judul wajib diisi.";
  if (input.title.length > 300) return "Nomor/Judul terlalu panjang.";
  if (!/^\d{4}$/.test(input.year)) return "Tahun harus 4 digit.";
  if (input.about.length > 500) return "Tentang terlalu panjang.";
  return null;
}

async function readDocumentInput(request: Request): Promise<{
  category: string;
  title: string;
  year: string;
  about: string;
  file: File | null;
}> {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    const file = form.get("file");
    return {
      category: cleanText(form.get("category"), 40),
      title: cleanText(form.get("title"), 300),
      year: cleanText(form.get("year"), 4),
      about: cleanText(form.get("about"), 500) || "-",
      file: file instanceof File && file.size > 0 ? file : null,
    };
  }

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  return {
    category: cleanText(body.category, 40),
    title: cleanText(body.title, 300),
    year: cleanText(body.year, 4),
    about: cleanText(body.about, 500) || "-",
    file: null,
  };
}

async function assertPdf(file: File): Promise<string | null> {
  if (file.size > MAX_FILE_BYTES) return "Ukuran berkas melebihi 10 MB.";
  const head = new Uint8Array(await file.slice(0, 5).arrayBuffer());
  const magic = String.fromCharCode(...head);
  if (magic !== "%PDF-") return "Berkas harus berformat PDF.";
  return null;
}

async function listDocuments(env: Env) {
  const { results } = await env.DB.prepare(
    `SELECT id, category, title, year, about, file_key, file_name, file_size, created_at, updated_at
       FROM documents ORDER BY created_at DESC, title ASC`,
  ).all<DocumentRow>();
  return results.map(toDocument);
}

async function getDocument(env: Env, id: string): Promise<DocumentRow | null> {
  return env.DB.prepare(`SELECT * FROM documents WHERE id = ?`).bind(id).first<DocumentRow>();
}

function bodyTooLarge(request: Request): boolean {
  const declared = Number(request.headers.get("content-length") ?? "0");
  return Number.isFinite(declared) && declared > MAX_FILE_BYTES + 1048576;
}

async function createDocument(request: Request, env: Env) {
  if (bodyTooLarge(request)) return fail(413, "Ukuran berkas melebihi 10 MB.");
  const input = await readDocumentInput(request);
  const invalid = validateDocument(input);
  if (invalid) return fail(400, invalid);

  let fileKey: string | null = null;
  let fileName: string | null = null;
  let fileSize: number | null = null;

  if (input.file) {
    const fileError = await assertPdf(input.file);
    if (fileError) return fail(400, fileError);
    const id = crypto.randomUUID();
    fileName = safeFileName(input.file.name);
    fileSize = input.file.size;
    fileKey = `documents/${id}/${fileName}`;
    await env.FILES.put(fileKey, await input.file.arrayBuffer(), {
      httpMetadata: {
        contentType: "application/pdf",
        contentDisposition: `inline; filename="${fileName}"`,
      },
    });

    try {
      const row = await env.DB.prepare(
        `INSERT INTO documents (id, category, title, year, about, file_key, file_name, file_size)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?) RETURNING *`,
      )
        .bind(id, input.category, input.title, input.year, input.about, fileKey, fileName, fileSize)
        .first<DocumentRow>();
      return json(toDocument(row as DocumentRow), 201);
    } catch (error) {
      await env.FILES.delete(fileKey);
      throw error;
    }
  }

  const row = await env.DB.prepare(
    `INSERT INTO documents (id, category, title, year, about)
     VALUES (?, ?, ?, ?, ?) RETURNING *`,
  )
    .bind(crypto.randomUUID(), input.category, input.title, input.year, input.about)
    .first<DocumentRow>();
  return json(toDocument(row as DocumentRow), 201);
}

async function updateDocument(request: Request, env: Env, id: string) {
  if (bodyTooLarge(request)) return fail(413, "Ukuran berkas melebihi 10 MB.");
  const existing = await getDocument(env, id);
  if (!existing) return fail(404, "Dokumen tidak ditemukan.");

  const input = await readDocumentInput(request);
  const invalid = validateDocument(input);
  if (invalid) return fail(400, invalid);

  let fileKey = existing.file_key;
  let fileName = existing.file_name;
  let fileSize = existing.file_size;

  if (input.file) {
    const fileError = await assertPdf(input.file);
    if (fileError) return fail(400, fileError);
    fileName = safeFileName(input.file.name);
    fileSize = input.file.size;
    const nextKey = `documents/${id}/${fileName}`;
    await env.FILES.put(nextKey, await input.file.arrayBuffer(), {
      httpMetadata: {
        contentType: "application/pdf",
        contentDisposition: `inline; filename="${fileName}"`,
      },
    });
    if (existing.file_key && existing.file_key !== nextKey) {
      await env.FILES.delete(existing.file_key);
    }
    fileKey = nextKey;
  }

  const row = await env.DB.prepare(
    `UPDATE documents
        SET category = ?, title = ?, year = ?, about = ?, file_key = ?, file_name = ?, file_size = ?,
            updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
      WHERE id = ? RETURNING *`,
  )
    .bind(input.category, input.title, input.year, input.about, fileKey, fileName, fileSize, id)
    .first<DocumentRow>();

  return json(toDocument(row as DocumentRow));
}

async function deleteDocument(env: Env, id: string) {
  const existing = await getDocument(env, id);
  if (!existing) return fail(404, "Dokumen tidak ditemukan.");

  await env.DB.prepare(`DELETE FROM documents WHERE id = ?`).bind(id).run();

  if (existing.file_key) await env.FILES.delete(existing.file_key);
  const leftovers = await env.FILES.list({ prefix: `documents/${id}/` });
  if (leftovers.objects.length) {
    await env.FILES.delete(leftovers.objects.map((object) => object.key));
  }

  return json({ ok: true });
}

async function serveFile(request: Request, env: Env, id: string) {
  const row = await getDocument(env, id);
  if (!row?.file_key) return fail(404, "Berkas tidak ditemukan.");

  const object = await env.FILES.get(row.file_key);
  if (!object) return fail(404, "Berkas tidak ditemukan di penyimpanan.");

  const name = row.file_name ?? "dokumen.pdf";
  const download = new URL(request.url).searchParams.get("download") === "1";
  const headers: Record<string, string> = {
    "content-type": "application/pdf",
    "content-length": String(object.size),
    "content-disposition": `${download ? "attachment" : "inline"}; filename="${name}"`,
    "cache-control": "public, max-age=3600",
  };
  if (object.httpEtag) headers.etag = object.httpEtag;

  if (request.method === "HEAD") return new Response(null, { headers });
  return new Response(object.body, { headers });
}

async function handleLogin(request: Request, env: Env) {
  if (!env.ADMIN_EMAIL || !env.ADMIN_PASSWORD_HASH || !env.SESSION_SECRET) {
    return fail(500, "Kredensial admin belum dikonfigurasi.");
  }

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const email = cleanText(body.email, 200).toLowerCase();
  const password = typeof body.password === "string" ? body.password : "";

  if (!email || !password) return fail(400, "Email dan password wajib diisi.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return fail(401, "Email atau password salah.");
  }

  const validUser = timingSafeEqual(
    encoder.encode(email),
    encoder.encode(env.ADMIN_EMAIL.trim().toLowerCase()),
  );
  const validPassword = await verifyPassword(password, env.ADMIN_PASSWORD_HASH);

  if (!validUser || !validPassword) return fail(401, "Email atau password salah.");

  const token = await createSession(env.ADMIN_EMAIL, env);
  return json(
    { ok: true, email: env.ADMIN_EMAIL },
    200,
    { "set-cookie": sessionCookie(token, SESSION_TTL, new URL(request.url).protocol === "https:") },
  );
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    if (!path.startsWith("/api/")) {
      return env.ASSETS.fetch(request);
    }

    try {
      if (path === "/api/health") {
        await env.DB.prepare("SELECT 1").first();
        return json({ ok: true, service: "siperlu", database: "d1", storage: "r2" });
      }

      if (path === "/api/auth/login" && method === "POST") {
        return handleLogin(request, env);
      }

      if (path === "/api/auth/logout" && method === "POST") {
        return json({ ok: true }, 200, {
          "set-cookie": sessionCookie("", 0, new URL(request.url).protocol === "https:"),
        });
      }

      if (path === "/api/auth/me") {
        const email = await currentUser(request, env);
        return json(email ? { authenticated: true, email } : { authenticated: false });
      }

      if (path === "/api/documents") {
        if (method === "GET") return json(await listDocuments(env));
        if (method === "POST") {
          if (!(await currentUser(request, env))) return fail(401, "Butuh login admin.");
          return createDocument(request, env);
        }
        return fail(405, "Metode tidak didukung.");
      }

      const docMatch = path.match(/^\/api\/documents\/([0-9a-fA-F-]{36})$/);
      if (docMatch) {
        const id = docMatch[1];
        if (method === "GET") {
          const row = await getDocument(env, id);
          return row ? json(toDocument(row)) : fail(404, "Dokumen tidak ditemukan.");
        }
        if (!(await currentUser(request, env))) return fail(401, "Butuh login admin.");
        if (method === "PUT" || method === "PATCH") return updateDocument(request, env, id);
        if (method === "DELETE") return deleteDocument(env, id);
        return fail(405, "Metode tidak didukung.");
      }

      const fileMatch = path.match(/^\/api\/files\/([0-9a-fA-F-]{36})$/);
      if (fileMatch) {
        if (method === "GET" || method === "HEAD") return serveFile(request, env, fileMatch[1]);
        return fail(405, "Metode tidak didukung.");
      }

      return fail(404, "Endpoint tidak ditemukan.");
    } catch (error) {
      console.error("siperlu api error", error);
      return fail(500, "Terjadi kesalahan pada server.");
    }
  },
};
