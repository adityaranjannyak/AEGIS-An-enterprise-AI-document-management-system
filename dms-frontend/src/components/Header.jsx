/* AEGIS Console: global search and notifications remain compact, contextual commands at the edge of the workspace. */
import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "../auth/AuthContext.jsx";
import { notificationApi } from "../services/api.js";
import { Icon } from "./Icon.jsx";
import { toast } from "./Toaster.jsx";

export function Header({ onMenu }) {
  const { session } = useAuth();
  const [, navigate] = useLocation();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const unread = notifications.filter((notice) => !(notice.read || notice.isRead || notice.status === "READ")).length;
  const loadNotifications = async () => { setLoading(true); try { setNotifications(await notificationApi.list(session.token)); } catch (error) { toast(error.message, "error"); } finally { setLoading(false); } };
  // Load the authenticated notification inbox once when the workspace header mounts.
  // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps
  useEffect(() => { loadNotifications(); }, []);
  const search = (event) => { event.preventDefault(); const term = query.trim(); if (term) navigate(`/documents?search=${encodeURIComponent(term)}`); };
  const markAll = async () => { try { await notificationApi.markAllRead(session.token); setNotifications((current) => current.map((item) => ({ ...item, read: true, isRead: true }))); } catch (error) { toast(error.message, "error"); } };
  const openNotice = async (notice) => { if (!(notice.read || notice.isRead)) { try { await notificationApi.markRead(session.token, notice.id); } catch { /* Opening the linked item remains useful. */ } } setOpen(false); if (notice.documentId) navigate(`/documents/${notice.documentId}`); else if (notice.link) navigate(notice.link); };
  return <header className="app-header"><button className="mobile-menu" onClick={onMenu} aria-label="Open navigation"><Icon name="menu" /></button><div className="header-context"><span className="header-kicker">WORKSPACE</span><span className="header-date">{new Intl.DateTimeFormat(undefined, { weekday: "short", month: "short", day: "numeric" }).format(new Date())}</span></div><div className="header-tools"><form className="global-search" onSubmit={search}><Icon name="search" size={17} /><input aria-label="Global document search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search authorized documents" /><kbd>↵</kbd></form><div className="notification-wrap"><button className="icon-button notification-button" onClick={() => { setOpen((value) => !value); if (!open) loadNotifications(); }} aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}><Icon name="bell" size={19} />{unread > 0 && <span className="notification-count">{unread > 9 ? "9+" : unread}</span>}</button>{open && <div className="notification-panel"><div className="panel-heading"><div><span className="eyebrow">INBOX</span><h3>Notifications</h3></div><button className="text-button" onClick={markAll} disabled={!unread}>Mark all read</button></div><div className="notification-list">{loading ? <p className="panel-empty">Checking for updates…</p> : notifications.length ? notifications.slice(0, 6).map((notice) => <button className={`notice-item ${!(notice.read || notice.isRead) ? "unread" : ""}`} key={notice.id} onClick={() => openNotice(notice)}><span className="notice-dot" /><span><strong>{notice.title || notice.type || "Workspace update"}</strong><small>{notice.message || notice.description || "Open for details"}</small></span><Icon name="arrow" size={15} /></button>) : <p className="panel-empty">No notifications returned by the service.</p>}</div><Link href="/activity" className="view-all" onClick={() => setOpen(false)}>View activity <Icon name="arrow" size={15} /></Link></div>}</div><Link href="/settings" className="header-user"><span className="user-monogram">{session.user.name?.slice(0, 1)?.toUpperCase() || "U"}</span><span className="header-user-copy"><strong>{session.user.name || session.user.username}</strong><small>{session.user.role}</small></span></Link></div></header>;
}
