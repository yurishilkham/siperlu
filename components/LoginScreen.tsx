"use client";

import { useState, type FormEvent } from "react";

type LoginScreenProps = {
  onLogin: () => void;
};

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onLogin();
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
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        <button className="btn-primary btn-block" type="submit">
          Masuk
        </button>
        <p className="login-note">
          Mode demo — gunakan kredensial apa pun untuk melihat dashboard.
          Halaman ini tidak ditautkan dari dashboard publik.
        </p>
      </form>
    </div>
  );
}
