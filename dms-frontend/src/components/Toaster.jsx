/* AEGIS Console: feedback is concise, contextual, and never obscures the working surface. */
/* eslint-disable react-refresh/only-export-components */
import { useEffect, useState } from "react";
import { Icon } from "./Icon.jsx";
let notify = () => {};
export const toast = (message, type = "info") => notify({ message, type });
export function Toaster() {
  const [items, setItems] = useState([]);
  useEffect(() => { notify = (item) => { const id = `${Date.now()}-${Math.random()}`; setItems((current) => [...current, { ...item, id }]); window.setTimeout(() => setItems((current) => current.filter((toastItem) => toastItem.id !== id)), 4200); }; return () => { notify = () => {}; }; }, []);
  return <div className="toast-stack" aria-live="polite">{items.map((item) => <div className={`app-toast toast-${item.type}`} key={item.id}><Icon name={item.type === "success" ? "check" : item.type === "error" ? "alert" : "spark"} size={18} /><span>{item.message}</span></div>)}</div>;
}
