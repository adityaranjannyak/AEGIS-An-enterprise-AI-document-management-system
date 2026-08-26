/* AEGIS Console: preserve useful working state in sessionStorage while keeping authentication temporary. */
const SESSION_KEY = "aegis-dms.session";
const RESUME_KEY = "aegis-dms.resume-route";

export const getSession = () => { try { const raw = sessionStorage.getItem(SESSION_KEY); return raw ? JSON.parse(raw) : null; } catch { return null; } };
export const setSession = (session) => sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
export const clearSession = () => sessionStorage.removeItem(SESSION_KEY);
export const setResumeRoute = (route) => sessionStorage.setItem(RESUME_KEY, route || "/dashboard");
export const getResumeRoute = () => sessionStorage.getItem(RESUME_KEY);
export function getSessionValue(key, initialValue) { try { const stored = sessionStorage.getItem(`aegis-dms.state.${key}`); return stored ? JSON.parse(stored) : initialValue; } catch { return initialValue; } }
export function persistSessionValue(key, value) { sessionStorage.setItem(`aegis-dms.state.${key}`, JSON.stringify(value)); }
