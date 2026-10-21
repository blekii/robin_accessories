import { useCallback, useEffect, useState } from "react";
import { api, onUnauthorized } from "../services/api.js";
import { BRAND } from "../services/format.js";
import AdminLogin from "../components/AdminLogin.jsx";
import Dashboard from "./Dashboard.jsx";

/**
 * /admin — asks the server who is signed in. The dashboard only renders for a real admin
 * session; every admin API call is also checked server-side, so this gate is UX, not the lock.
 */
export default function Admin() {
  const [state, setState] = useState({ status: "checking", admin: null, notice: "" });

  useEffect(() => {
    document.title = `Admin — ${BRAND.name}`;
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  useEffect(() => {
    let alive = true;
    api.me()
      .then(({ admin }) => alive && setState({ status: admin ? "in" : "out", admin, notice: "" }))
      .catch((e) => alive && setState({ status: "out", admin: null, notice: e.message }));
    const off = onUnauthorized(() => setState({ status: "out", admin: null, notice: "Your session ended. Please sign in again." }));
    return () => { alive = false; off(); };
  }, []);

  const logout = useCallback(async () => {
    try { await api.logout(); } finally { setState({ status: "out", admin: null, notice: "You're signed out." }); }
  }, []);

  if (state.status === "checking") {
    return <div className="auth-screen" aria-busy="true"><p className="muted">Checking your session…</p></div>;
  }
  if (state.status === "out") {
    return <AdminLogin notice={state.notice} onLogin={(admin) => setState({ status: "in", admin, notice: "" })} />;
  }
  return <Dashboard admin={state.admin} onLogout={logout} />;
}
