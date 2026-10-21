import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api.js";
import { BRAND } from "../services/format.js";

export default function AdminLogin({ notice, onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const emailRef = useRef(null);

  const submit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError("Enter your email and password.");
      (email.trim() ? null : emailRef.current)?.focus();
      return;
    }
    setBusy(true);
    setError("");
    try {
      const { admin } = await api.login(email.trim(), password);
      onLogin(admin);
    } catch (err) {
      setError(err.message);
      setPassword("");
      setBusy(false);
    }
  };

  return (
    <div className="auth-screen">
      <form className="auth-card" onSubmit={submit} noValidate aria-labelledby="authTitle">
        <div className="logo auth-logo">
          <span className="logo__mark" aria-hidden="true"><span>{BRAND.name[0]}</span></span>
          <span className="logo__word">{BRAND.name}</span>
        </div>
        <h1 id="authTitle">Staff sign in</h1>
        <p className="muted auth-sub">The inventory dashboard is for {BRAND.name} staff only.</p>

        {notice && !error && <p className="auth-notice" role="status">{notice}</p>}
        {error && <p className="form-error" role="alert" id="authError">{error}</p>}

        <label className="auth-field">
          <span>Email</span>
          <input
            ref={emailRef}
            type="email"
            autoComplete="username"
            inputMode="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-describedby={error ? "authError" : undefined}
          />
        </label>
        <label className="auth-field">
          <span>Password</span>
          <span className="pw-wrap">
            <input
              type={show ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-describedby={error ? "authError" : undefined}
            />
            <button type="button" className="pw-toggle" onClick={() => setShow((s) => !s)} aria-pressed={show} aria-label={show ? "Hide password" : "Show password"}>
              {show ? "Hide" : "Show"}
            </button>
          </span>
        </label>

        <button className="btn btn--primary btn--full" type="submit" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
        <Link to="/" className="auth-back">← Back to the store</Link>
      </form>
    </div>
  );
}
