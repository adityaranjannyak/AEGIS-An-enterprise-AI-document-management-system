/* AEGIS Console: browser API access follows the supplied Spring Boot contract, attaches the active JWT, and normalizes entity responses. */
import { apiConfig } from "./apiConfig.js";

let onUnauthorized = null;
export const registerUnauthorizedHandler = (handler) => { onUnauthorized = handler; };
export class ApiError extends Error { constructor(message, status = 0, details = null) { super(message); this.name = "ApiError"; this.status = status; this.details = details; } }

function urlFor(path, query) {
  const url = new URL(`${apiConfig.baseUrl}${path}`, window.location.origin);
  Object.entries(query || {}).forEach(([key, value]) => { if (value !== undefined && value !== null && value !== "") url.searchParams.set(key, value); });
  return apiConfig.baseUrl ? url.toString() : `${url.pathname}${url.search}`;
}
function messageFrom(payload, fallback) { return payload?.message || payload?.error || payload?.detail || fallback; }
function tokenClaims(token) { try { return JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))); } catch { return {}; } }
const listFrom = (payload) => Array.isArray(payload) ? payload : (payload?.content || payload?.items || payload?.data || payload?.results || []);
const itemFrom = (payload) => payload?.data || payload?.item || payload;
const roleName = (role) => String(role?.name || role || "").toUpperCase();

export async function request(path, { method = "GET", token, body, query, formData = false } = {}) {
  let response;
  try { response = await fetch(urlFor(path, { ...query, _: undefined }), { method, headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(body && !formData ? { "Content-Type": "application/json" } : {}) }, body: body ? (formData ? body : JSON.stringify(body)) : undefined }); } catch { throw new ApiError("The document service is unavailable. Check that Spring Boot is running and try again."); }
  const type = response.headers.get("content-type") || "";
  const payload = type.includes("application/json") ? await response.json().catch(() => null) : await response.text().catch(() => "");
  if (!response.ok) { const error = new ApiError(messageFrom(payload, `Request failed (${response.status}).`), response.status, payload); if (response.status === 401 && onUnauthorized) onUnauthorized(); throw error; }
  return payload;
}

function normalizeUser(raw = {}) {
  const user = raw.user || raw.profile || raw;
  return { id: user.id ?? user.userId ?? user.user_id, name: user.name ?? user.fullName ?? user.displayName ?? user.username ?? "", username: user.username ?? user.userName ?? "", role: roleName(user.role ?? user.workspaceRole), status: user.status ?? user.accountStatus ?? "ACTIVE" };
}
function normalizeSession(raw = {}) {
  const token = raw.token || raw.jwt || raw.accessToken || raw.access_token || raw.data?.token || raw.data?.jwt;
  const claims = tokenClaims(token || "");
  const user = normalizeUser(raw.user || raw.data?.user || { username: claims.sub, name: claims.sub, role: claims.roles?.[0] });
  if (!token || !user.role) throw new ApiError("The login response did not contain the authenticated user details required by the workspace.");
  return { token, user };
}
function normalizePermission(permission = {}) { return { id: permission.id, userId: permission.user?.id, userName: permission.user?.username || permission.user?.name, role: roleName(permission.role), permission: String(permission.permission || "READ").toUpperCase() }; }
function normalizeDocument(raw = {}, token, permissions = []) {
  const claims = tokenClaims(token || ""); const username = claims.sub; const roles = claims.roles || [];
  const normalizedPermissions = permissions.map(normalizePermission);
  const groupedUsers = Object.values(normalizedPermissions.filter((item) => item.userId).reduce((groups, item) => { const key = String(item.userId); groups[key] ||= { userId: item.userId, userName: item.userName, permissions: [] }; if (!groups[key].permissions.includes(item.permission)) groups[key].permissions.push(item.permission); return groups; }, {}));
  const groupedRoles = Object.values(normalizedPermissions.filter((item) => item.role).reduce((groups, item) => { const key = item.role; groups[key] ||= { role: item.role, permissions: [] }; if (!groups[key].permissions.includes(item.permission)) groups[key].permissions.push(item.permission); return groups; }, {}));
  const owns = raw.owner?.username === username;
  const userPermissions = normalizedPermissions.filter((item) => item.userId && String(item.userId) === String(claims.userId)).map((item) => item.permission);
  const rolePermissions = normalizedPermissions.filter((item) => roles.includes(item.role)).map((item) => item.permission);
  const granted = [...new Set([...userPermissions, ...rolePermissions])];
  const admin = roles.includes("ADMIN");
  return { ...raw, id: raw.id ?? raw.documentId, name: raw.name || raw.fileName, type: raw.fileType || raw.type, fileSize: raw.fileSize ?? raw.size, size: raw.fileSize ?? raw.size, modifiedAt: raw.updatedAt || raw.modifiedAt, owner: raw.owner, access: owns ? "Owner" : "Shared", permissions: { users: groupedUsers, roles: groupedRoles }, rawPermissions: normalizedPermissions, canEdit: admin || owns || granted.includes("EDIT"), canDelete: admin || owns || granted.includes("DELETE"), canShare: admin || owns || granted.includes("SHARE"), canDownload: admin || owns || granted.includes("DOWNLOAD") };
}
function normalizeActivity(entry = {}) { return { ...entry, userName: entry.user?.name || entry.userName, documentName: entry.document?.name || entry.documentName, timestamp: entry.timestamp || entry.createdAt, details: entry.details || entry.description }; }
function normalizeNotification(entry = {}) { return { ...entry, title: entry.type || "Workspace update", message: entry.message || entry.description, documentId: entry.document?.id || entry.documentId, isRead: entry.read ?? entry.isRead, read: entry.read ?? entry.isRead }; }

export const authApi = {
  login: async (credentials) => normalizeSession(await request(apiConfig.paths.login, { method: "POST", body: credentials })),
  logout: async () => null,
  me: async (token) => normalizeUser(await request(apiConfig.paths.me, { token })),
};

export const documentApi = {
  list: async (token, params = {}) => {
    let documents = (await request(apiConfig.paths.documents, { token })).map((document) => normalizeDocument(document, token));
    const term = String(params.search || "").trim().toLowerCase();
    if (term) documents = documents.filter((document) => [document.name, document.type, document.owner?.name, document.owner?.username].some((value) => String(value || "").toLowerCase().includes(term)));
    if (params.access === "MINE") { const username = tokenClaims(token).sub; documents = documents.filter((document) => document.owner?.username === username); }
    if (params.access === "SHARED") { const username = tokenClaims(token).sub; documents = documents.filter((document) => document.owner?.username !== username); }
    if (params.type) documents = documents.filter((document) => String(document.type || "").toUpperCase().includes(String(params.type).toUpperCase()));
    const direction = params.sort === "OLDEST" || params.sort === "NAME_ASC" ? 1 : -1;
    documents.sort((left, right) => params.sort?.startsWith("NAME") ? String(left.name || "").localeCompare(String(right.name || "")) * (params.sort === "NAME_DESC" ? -1 : 1) : (new Date(left.updatedAt || left.createdAt || 0) - new Date(right.updatedAt || right.createdAt || 0)) * direction);
    return documents;
  },
  get: async (token, id) => {
    const document = itemFrom(await request(`${apiConfig.paths.documents}/${encodeURIComponent(id)}`, { token }));
    const permissions = await request(`${apiConfig.paths.documents}/${encodeURIComponent(id)}/permissions`, { token }).catch(() => []);
    return normalizeDocument(document, token, listFrom(permissions));
  },
  create: async (token, formData) => itemFrom(await request(`${apiConfig.paths.documents}/upload`, { method: "POST", token, body: formData, formData: true })),
  update: (token, id, payload) => request(`${apiConfig.paths.documents}/${encodeURIComponent(id)}`, { method: "PUT", token, body: payload }),
  remove: (token, id) => request(`${apiConfig.paths.documents}/${encodeURIComponent(id)}`, { method: "DELETE", token }),
  permissions: (token, id, payload) => request(`${apiConfig.paths.documents}/${encodeURIComponent(id)}/permissions`, { method: "PUT", token, body: payload }),
  download: async (token, id, filename = "document") => {
    const response = await fetch(urlFor(`${apiConfig.paths.documents}/${encodeURIComponent(id)}/download`), { headers: { Authorization: `Bearer ${token}` } });
    if (!response.ok) throw new ApiError(`Download failed (${response.status}).`, response.status);
    const href = URL.createObjectURL(await response.blob()); const link = Object.assign(document.createElement("a"), { href, download: filename }); link.click(); URL.revokeObjectURL(href);
  },
};

export const activityApi = { list: async (token, params = {}) => { const path = params.role === "ADMIN" ? `${apiConfig.paths.activity}/all` : `${apiConfig.paths.activity}/me`; const entries = (await request(path, { token })).map(normalizeActivity); const type = String(params.type || "").toUpperCase(); return type ? entries.filter((entry) => String(entry.action || "").toUpperCase().includes(type)) : entries; } };
export const dashboardApi = { get: async (token, role) => { const [documents, activity] = await Promise.all([documentApi.list(token), activityApi.list(token, { role })]); const categories = Object.entries(documents.reduce((groups, document) => { const label = String(document.type || "File").split("/").pop().toUpperCase(); groups[label] = (groups[label] || 0) + 1; return groups; }, {})).map(([name, count]) => ({ name, count })); return { summary: { totalDocuments: documents.length, recentlyAdded: documents.filter((document) => Date.now() - new Date(document.createdAt || 0).getTime() < 7 * 86400000).length, storageUsed: documents.reduce((total, document) => total + Number(document.fileSize || 0), 0), aiQueries: activity.filter((entry) => String(entry.action || "").includes("AI")).length }, recentDocuments: documents.slice(0, 8), recentActivity: activity.slice(0, 8), categories }; } };
export const notificationApi = { list: async (token) => (await request(apiConfig.paths.notifications, { token })).map(normalizeNotification), markRead: (token, id) => request(`${apiConfig.paths.notifications}/${encodeURIComponent(id)}/read`, { method: "POST", token }), markAllRead: async (token) => { const notices = await notificationApi.list(token); await Promise.all(notices.filter((notice) => !notice.read).map((notice) => notificationApi.markRead(token, notice.id))); } };
export const userApi = { list: async (token, params = {}) => { const users = (await request(apiConfig.paths.users, { token })).map(normalizeUser); const term = String(params.search || "").toLowerCase(); return term ? users.filter((user) => [user.name, user.username, user.role, user.id].some((value) => String(value || "").toLowerCase().includes(term))) : users; }, create: (token, payload) => request(apiConfig.paths.users, { method: "POST", token, body: { ...payload, role: { id: payload.roleId ? Number(payload.roleId) : undefined, name: payload.role } } }), update: (token, id, payload) => request(`${apiConfig.paths.users}/${encodeURIComponent(id)}`, { method: "PUT", token, body: { ...payload, role: { id: payload.roleId ? Number(payload.roleId) : undefined, name: payload.role } } }), remove: (token, id) => request(`${apiConfig.paths.users}/${encodeURIComponent(id)}`, { method: "DELETE", token }), updateMe: (token, payload) => request(apiConfig.paths.me, { method: "PUT", token, body: payload }) };
export const roleApi = { list: async (token) => listFrom(await request(apiConfig.paths.roles, { token })) };
export const ragApi = { ask: (token, payload) => request(apiConfig.paths.rag, { method: "POST", token, body: { question: payload.question, documentIds: payload.scope === "SELECTED_DOCUMENTS" ? payload.documentIds : [] } }) };
export { listFrom, itemFrom, normalizeUser };
