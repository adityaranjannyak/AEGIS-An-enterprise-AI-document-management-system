/* AEGIS Console: unavailable routes return a calm, precise route recovery experience. */
import { Link } from "wouter";
import { Icon } from "../components/Icon.jsx";
export function NotFoundPage() { return <div className="standalone-recovery"><img src="/aegis-logo.png" alt="AEGIS" /><span className="eyebrow">404 / PAGE NOT FOUND</span><h1>That workspace route is not available.</h1><p>Return to the document workspace to continue working.</p><Link href="/documents" className="btn btn-primary">Go to documents <Icon name="arrow" size={17} /></Link></div>; }
