import type { ArchiveDoc, ArchiveDocDraft } from "./types";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

type Session = { authenticated: boolean; email?: string };

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, { credentials: "same-origin", ...init });
  const payload = (await response.json().catch(() => null)) as
    | (T & { error?: string })
    | null;

  if (!response.ok) {
    throw new ApiError(
      payload?.error ?? `Permintaan gagal (${response.status}).`,
      response.status,
    );
  }

  return payload as T;
}

export function fetchDocuments(): Promise<ArchiveDoc[]> {
  return request<ArchiveDoc[]>("/api/documents");
}

export function fetchSession(): Promise<Session> {
  return request<Session>("/api/auth/me");
}

export function login(email: string, password: string): Promise<Session> {
  return request<Session>("/api/auth/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
}

export function logout(): Promise<{ ok: boolean }> {
  return request<{ ok: boolean }>("/api/auth/logout", { method: "POST" });
}

export function saveDocument(
  draft: ArchiveDocDraft,
  file: File | null,
): Promise<ArchiveDoc> {
  const body = new FormData();
  body.set("category", draft.category);
  body.set("title", draft.title);
  body.set("year", draft.year);
  body.set("about", draft.about);
  if (file) body.set("file", file);

  const path = draft.id ? `/api/documents/${draft.id}` : "/api/documents";
  return request<ArchiveDoc>(path, {
    method: draft.id ? "PUT" : "POST",
    body,
  });
}

export function deleteDocument(id: string): Promise<{ ok: boolean }> {
  return request<{ ok: boolean }>(`/api/documents/${id}`, {
    method: "DELETE",
  });
}
