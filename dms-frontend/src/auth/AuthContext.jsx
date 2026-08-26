/* AEGIS Console: session authentication is memory/session scoped and never persists a JWT beyond the browser session. */
/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { authApi, registerUnauthorizedHandler } from "../services/api.js";
import { clearSession, getResumeRoute, getSession, setResumeRoute, setSession } from "../utils/sessionState.js";
import { toast } from "../components/Toaster.jsx";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSessionState] = useState(() => getSession());
  const [reauthReason, setReauthReason] = useState("");
  useEffect(() => {
    registerUnauthorizedHandler(() => {
      if (window.location.pathname !== "/login") setResumeRoute(window.location.pathname + window.location.search);
      setSessionState(null);
      setReauthReason("Your session expired. Sign in again to continue where you left off.");
    });
    return () => registerUnauthorizedHandler(null);
  }, []);
  const signIn = useCallback(async (credentials) => {
    const nextSession = await authApi.login(credentials);
    setSession(nextSession);
    setSessionState(nextSession);
    setReauthReason("");
    return getResumeRoute() || "/dashboard";
  }, []);
  const signOut = useCallback(async () => {
    try { if (session?.token) await authApi.logout(session.token); } catch { /* Backend logout is best-effort. */ }
    clearSession();
    setSessionState(null);
    setReauthReason("");
    toast("You have been signed out.", "success");
  }, [session]);
  const value = useMemo(() => ({ session, reauthReason, signIn, signOut }), [session, reauthReason, signIn, signOut]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
