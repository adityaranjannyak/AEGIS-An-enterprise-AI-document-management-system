/* AEGIS Console: an anchored navigation spine and compact command header frame every protected workspace task. */
import { useState } from "react";
import { Sidebar } from "../components/Sidebar.jsx";
import { Header } from "../components/Header.jsx";
export function AppShell({ children }) { const [open, setOpen] = useState(false); return <div className="app-shell"><Sidebar open={open} onClose={() => setOpen(false)} /><div className="workspace"><Header onMenu={() => setOpen(true)} /><main className="main-content">{children}</main></div></div>; }
