"use client";

import { useEffect, useState, type FormEvent } from "react";
import Modal from "./Modal";
import { updateProfile } from "@/lib/api";

type ProfileModalProps = {
  open: boolean;
  onClose: () => void;
  email: string;
  onUpdated: (email: string) => void;
};

export default function ProfileModal({
  open,
  onClose,
  email,
  onUpdated,
}: ProfileModalProps) {
  const [nextEmail, setNextEmail] = useState(email);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!open) return;
    setNextEmail(email);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setBusy(false);
    setError("");
    setSuccess("");
  }, [open, email]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;

    setError("");
    setSuccess("");

    if (!currentPassword) {
      setError("Masukkan password saat ini untuk menyimpan perubahan.");
      return;
    }
    if (newPassword && newPassword.length < 8) {
      setError("Password baru minimal 8 karakter.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Konfirmasi password baru tidak cocok.");
      return;
    }
    if (nextEmail.trim().toLowerCase() === email.toLowerCase() && !newPassword) {
      setError("Tidak ada perubahan untuk disimpan.");
      return;
    }

    setBusy(true);
    try {
      const result = await updateProfile({
        currentPassword,
        email: nextEmail.trim(),
        newPassword,
      });
      onUpdated(result.email);
      setNextEmail(result.email);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSuccess("Profil berhasil diperbarui.");
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : "Gagal memperbarui profil.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} titleId="judulProfil" id="modalProfil">
      <form onSubmit={submit}>
        <div className="modal-head">
          <h3 id="judulProfil">Profil Admin</h3>
          <p>Ubah email atau password yang dipakai untuk masuk.</p>
        </div>

        <label className="field">
          Email
          <input
            type="email"
            autoComplete="email"
            required
            value={nextEmail}
            onChange={(event) => setNextEmail(event.target.value)}
          />
        </label>

        <label className="field">
          Password saat ini *
          <input
            type="password"
            autoComplete="current-password"
            required
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
          />
        </label>

        <div className="row2">
          <label className="field">
            Password baru
            <input
              type="password"
              autoComplete="new-password"
              placeholder="Kosongkan bila tetap"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
            />
          </label>
          <label className="field">
            Ulangi password baru
            <input
              type="password"
              autoComplete="new-password"
              placeholder="Ulangi password baru"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
          </label>
        </div>

        <p className="muted small">
          Password baru minimal 8 karakter. Kosongkan kedua kolom bila hanya
          ingin mengganti email.
        </p>

        {error ? <p className="form-error">{error}</p> : null}
        {success ? <p className="form-success">{success}</p> : null}

        <div className="modal-actions">
          <button
            className="btn-secondary btn-sm"
            type="button"
            onClick={onClose}
            disabled={busy}
          >
            Tutup
          </button>
          <button
            className="btn-primary btn-sm"
            type="submit"
            disabled={busy}
          >
            {busy ? "Menyimpan…" : "Simpan"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
