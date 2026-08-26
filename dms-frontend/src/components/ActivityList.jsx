/* AEGIS Console: audit entries communicate what happened, to what, and when without decorative chronology. */
import { Icon } from "./Icon.jsx";

const eventIcon = (action = "") => { const value = action.toLowerCase(); if (value.includes("upload")) return "upload"; if (value.includes("download")) return "download"; if (value.includes("delete") || value.includes("revoke")) return "trash"; if (value.includes("ai")) return "spark"; if (value.includes("share") || value.includes("permission")) return "users"; if (value.includes("login") || value.includes("security")) return "lock"; return "file"; };
const eventTitle = (entry) => entry.action || entry.type || entry.event || "Workspace activity";
const eventTime = (entry) => { const value = entry.timestamp || entry.createdAt || entry.time; if (!value) return "—"; const date = new Date(value); return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(date); };

export function ActivityList({ items = [], compact = false }) {
  if (!items.length) return <p className="quiet-note activity-empty">No activity has been returned for this scope.</p>;
  return <div className={`activity-list ${compact ? "activity-compact" : ""}`}>{items.map((entry, index) => <article className="activity-item" key={entry.id || `${eventTitle(entry)}-${index}`}><span className="activity-icon"><Icon name={eventIcon(eventTitle(entry))} size={16} /></span><div><strong>{eventTitle(entry)}</strong><p>{entry.details || entry.description || entry.documentName || entry.document?.name || "No additional detail was provided."}</p><small>{entry.userName || entry.user?.name || entry.actor?.name || "System"} · {eventTime(entry)}</small></div></article>)}</div>;
}
