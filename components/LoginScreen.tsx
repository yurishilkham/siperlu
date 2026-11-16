"use client";

import { useState, type FormEvent } from "react";

type LoginScreenProps = {
  onLogin: (username: string, password: string) => Promise<void>;
  busy?: boolean;
  error?: string;
};

export default function LoginScreen({
  onLogin,
  busy = false,
  error = "",
}: LoginScreenProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    await onLogin(username.trim(), password);
  }

  return (
    <div className="login-screen">
      <form className="login-card" onSubmit={submit}>
        <img
          src="/logo-siperlu-mark.png"
          alt="Logo SIPERLU"
          className="login-logo"
        />
        <h1>Masuk SIPERLU</h1>
        <p className="login-desc">
          Kelola arsip peraturan dan regulasi pemilu.
        </p>
        <label className="field">
          Username
          <input
            placeholder="cth: admin"
            autoComplete="username"
            required
            value={username}
            onChange={(event) => setUsername(event.target.value)}
          />
        </label>
        <label className="field">
          Password
          <input
            type="password"
            placeholder="••••••"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        {error ? <p className="form-error">{error}</p> : null}
        <button className="btn-primary btn-block" type="submit" disabled={busy}>
          {busy ? "Memeriksa…" : "Masuk"}
        </button>
        <p className="login-note">
          Halaman ini tidak ditautkan dari dashboard publik.
        </p>
      </form>
    </div>
  );
}
