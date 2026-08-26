/* AEGIS Console: concrete Spring Boot paths are centralized so browser requests mirror the backend contract exactly. */
const env = import.meta.env;

export const apiConfig = {
  // Local Vite development uses the proxy in vite.config.js; deployments can override this with an absolute API URL.
  baseUrl: (env.VITE_DMS_API_BASE_URL || env.VITE_API_BASE_URL || "/api").replace(/\/$/, ""),
  paths: {
    login: "/login",
    me: "/users/me",
    documents: "/documents",
    activity: "/activities",
    notifications: "/notifications",
    users: "/users",
    roles: "/roles",
    rag: "/rag/ask",
  },
};
