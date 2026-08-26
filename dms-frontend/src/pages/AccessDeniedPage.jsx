/* AEGIS Console: authorization boundaries are clear, specific, and distinct from authentication failure. */
import { Link } from "wouter";
import { Icon } from "../components/Icon.jsx";
export function AccessDeniedPage() { return <div className="recovery-page"><span className="eyebrow">ACCESS DENIED</span><h1>This area is outside your current permission scope.</h1><p>Your session is active, but the backend role rules do not permit access to this workspace area.</p><Link href="/dashboard" className="btn btn-primary">Return to workspace <Icon name="arrow" size={17} /></Link></div>; }
