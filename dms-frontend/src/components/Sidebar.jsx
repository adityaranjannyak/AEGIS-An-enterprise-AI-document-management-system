import { Link, useLocation } from "wouter";
import { useAuth } from "../auth/AuthContext.jsx";
import { Icon } from "./Icon.jsx";

const primaryItems = [["/dashboard", "Dashboard", "grid"], ["/documents", "Documents", "folder"], ["/upload", "Upload Document", "upload"], ["/my-documents", "My Documents", "file"], ["/assistant", "AI Assistant", "spark"], ["/activity", "Activity", "clock"]];

export function Sidebar({ open, onClose }) {
  const [location] = useLocation();
  const { session, signOut } = useAuth();
  const isCurrent = (href) => location === href || (href === "/documents" && location.startsWith("/documents/"));
  const closeAfterNavigation = () => { if (window.innerWidth < 992) onClose(); };
  return <><aside className={`sidebar ${open ? "is-open" : ""}`}><div className="brand-lockup"><span className="aegis-mark"><Icon name="lock" size={18} /></span><div><strong>AEGIS</strong><span>SECURE WORKSPACE</span></div><button className="mobile-sidebar-close" onClick={onClose} aria-label="Close navigation"><Icon name="close" /></button></div><nav className="sidebar-nav" aria-label="Main navigation">{primaryItems.map(([href, label, icon]) => <Link href={href} className={`nav-item ${isCurrent(href) ? "active" : ""}`} onClick={closeAfterNavigation} key={href}><Icon name={icon} size={18} /><span>{label}</span></Link>)}{session.user.role === "ADMIN" && <Link href="/users" className={`nav-item ${isCurrent("/users") ? "active" : ""}`} onClick={closeAfterNavigation}><Icon name="users" size={18} /><span>Users</span></Link>}</nav><div className="sidebar-foot"><Link href="/settings" className={`nav-item ${isCurrent("/settings") ? "active" : ""}`} onClick={closeAfterNavigation}><Icon name="settings" size={18} /><span>Settings</span></Link><Link href="/contact" className={`nav-item ${isCurrent("/contact") ? "active" : ""}`} onClick={closeAfterNavigation}><Icon name="info" size={18} /><span>Contact / About</span></Link><div className="sidebar-user"><span className="user-monogram">{session.user.name?.slice(0, 1)?.toUpperCase() || "U"}</span><div><strong>{session.user.name || session.user.username}</strong><small>{session.user.role}</small></div><button className="sidebar-logout" onClick={signOut} aria-label="Log out"><Icon name="logout" size={17} /></button></div></div></aside>{open && <button className="sidebar-scrim" onClick={onClose} aria-label="Close navigation" />}</>;
}
