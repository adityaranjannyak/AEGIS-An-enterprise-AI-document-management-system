import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "../auth/AuthContext.jsx";
import { Icon } from "../components/Icon.jsx";

export function LoginPage() {
  const { signIn, reauthReason } = useAuth();
  const [, navigate] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (event) => {
    event.preventDefault();
    if (!username.trim() || !password) { setError("Enter both your User ID and password."); return; }
    setBusy(true); setError("");
    try { navigate(await signIn({ username: username.trim(), password })); } catch (loginError) { setError(loginError.message); } finally { setBusy(false); }
  };

  return <div className="login-page">
    <section className="login-visual" aria-label="AEGIS product overview">
      <div className="login-orbit login-orbit-one" aria-hidden="true" />
      <div className="login-orbit login-orbit-two" aria-hidden="true" />
      <div className="login-visual-grid" aria-hidden="true" />
      <div className="login-visual-content">
        <div className="login-visual-brand"><span className="aegis-mark large"><Icon name="lock" size={25} /></span><span className="login-brand-rule" /></div>
        <span className="eyebrow">AI ENHANCED GOVERNANCE &amp; INFORMATION SYSTEM</span>
        <h1>AEGIS</h1>
        <p className="login-visual-tagline">Clarity for every record.<br />Confidence in every decision.</p>
        <p className="login-visual-description">A trusted document workspace for secure access, controlled collaboration, and intelligent information retrieval.</p>
        <div className="login-visual-footer"><span><i />Secure by design</span><span><i />Permission aware</span><span><i />AI assisted</span></div>
      </div>
      <div className="login-visual-corner" aria-hidden="true"><span>AEGIS</span><span>SECURE WORKSPACE</span></div>
    </section>
    <section className="login-panel"><div className="login-card">
      <div className="login-card-topline"><span>AUTHORIZED PERSONNEL</span><span className="login-status"><i />SYSTEM READY</span></div>
      <div className="login-heading"><span className="eyebrow">SECURE ACCESS</span><h2>Welcome back.</h2><p>Sign in with the credentials issued by your organization to access your permitted records.</p></div>
      {reauthReason && <div className="login-notice"><Icon name="lock" size={17} />{reauthReason}</div>}
      {error && <div className="form-error" role="alert"><Icon name="alert" size={17} />{error}</div>}
      <form onSubmit={submit} noValidate><label className="form-label" htmlFor="username">Username / User ID</label><div className="login-input-wrap"><Icon name="users" size={17} /><input className="form-control" id="username" autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value)} disabled={busy} /></div><label className="form-label mt-3" htmlFor="password">Password</label><div className="login-input-wrap"><Icon name="lock" size={17} /><input className="form-control" id="password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} disabled={busy} /></div><button className="btn btn-primary login-submit" type="submit" disabled={busy}>{busy ? <><span className="button-spinner" />Signing in…</> : <>Continue to workspace <Icon name="arrow" size={17} /></>}</button></form>
      <div className="login-assurance"><span className="assurance-icon"><Icon name="lock" size={15} /></span><span><strong>Protected workspace</strong><small>Access is governed by your organization’s permissions.</small></span></div>
      <div className="login-card-footer"><span>AEGIS v1.0</span><span>All activity is monitored</span></div>
    </div></section>
  </div>;
}
