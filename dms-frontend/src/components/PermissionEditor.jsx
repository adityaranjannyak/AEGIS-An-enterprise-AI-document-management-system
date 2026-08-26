import { useEffect, useRef, useState } from "react";
import { Icon } from "./Icon.jsx";

const ALL_PERMISSIONS = ["READ", "DOWNLOAD", "EDIT", "DELETE", "SHARE"];
const EMPLOYEE_PERMISSIONS = ["READ", "DOWNLOAD"];

function asPermissions(entry) {
  if (Array.isArray(entry?.permissions)) return entry.permissions.filter(Boolean).map((item) => String(item).toUpperCase());
  return entry?.permission ? [String(entry.permission).toUpperCase()] : [];
}

function normalizeValue(value = { roles: [], users: [] }) {
  return {
    roles: (value.roles || []).map((entry) => ({ ...entry, permissions: asPermissions(entry), permission: undefined })),
    users: (value.users || []).map((entry) => ({ ...entry, permissions: asPermissions(entry), permission: undefined })),
  };
}

function MultiSelectPermissions({ value, options = ALL_PERMISSIONS, onChange, label }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const selected = (value || []).filter((item) => options.includes(item));

  useEffect(() => {
    const close = (event) => { if (rootRef.current && !rootRef.current.contains(event.target)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return <div className="permission-multiselect" ref={rootRef}>
    <button type="button" className={`permission-select-trigger ${open ? "is-open" : ""}`} onClick={() => setOpen((current) => !current)} aria-haspopup="listbox" aria-expanded={open} aria-label={label}>
      <span className="permission-chips">{selected.length ? selected.map((permission) => <span className="permission-chip" key={permission}>{permission}</span>) : <span className="permission-placeholder">No access</span>}</span>
      <Icon name="chevron" size={15} />
    </button>
    {open && <div className="permission-select-menu" role="listbox" aria-label={`${label} permissions`}>
      {options.map((permission) => <label className="permission-option" key={permission}>
        <input type="checkbox" checked={selected.includes(permission)} onChange={(event) => onChange(event.target.checked ? [...selected, permission] : selected.filter((item) => item !== permission))} />
        <span className="permission-option-check"><Icon name="check" size={13} /></span>
        <span><strong>{permission}</strong><small>{permission === "READ" ? "Open and view" : permission === "DOWNLOAD" ? "Save a local copy" : permission === "EDIT" ? "Update metadata" : permission === "DELETE" ? "Remove the record" : "Grant access"}</small></span>
      </label>)}
    </div>}
  </div>;
}

export function PermissionEditor({ value = { roles: [], users: [] }, onChange }) {
  const draft = normalizeValue(value);
  const update = (next) => onChange(normalizeValue(next));
  const roleEntries = draft.roles || [];
  const userEntries = draft.users || [];
  const setRole = (role, permissions) => update({ ...draft, roles: [...roleEntries.filter((entry) => entry.role !== role), ...(permissions.length ? [{ role, permissions }] : [])] });
  const addUser = () => update({ ...draft, users: [...userEntries, { userId: "", permissions: ["READ"] }] });
  const updateUser = (index, key, nextValue) => update({ ...draft, users: userEntries.map((user, userIndex) => userIndex === index ? { ...user, [key]: nextValue } : user) });
  const removeUser = (index) => update({ ...draft, users: userEntries.filter((_, userIndex) => userIndex !== index) });

  return <div className="permission-editor">
    <div className="permission-section">
      <div className="permission-section-heading"><div><h3>Role access</h3><p>Grant independent permissions to each role. Changes apply only within this document.</p></div><span className="permission-count">{roleEntries.filter((entry) => asPermissions(entry).length).length} roles configured</span></div>
      {["MANAGER", "EMPLOYEE"].map((role) => {
        const entry = roleEntries.find((item) => item.role === role);
        const options = role === "EMPLOYEE" ? EMPLOYEE_PERMISSIONS : ALL_PERMISSIONS;
        const permissions = asPermissions(entry).filter((permission) => options.includes(permission));
        return <div className="permission-row" key={role}><div><span className="permission-role">{role}</span><small>{role === "EMPLOYEE" ? "Read-only collaboration scope" : "Operational document scope"}</small></div><MultiSelectPermissions label={`${role} permissions`} value={permissions} options={options} onChange={(next) => setRole(role, next)} /></div>;
      })}
    </div>
    <div className="permission-section">
      <div className="section-inline-heading"><div><h3>Specific users</h3><p>Assign multiple permissions to an individual user by backend User ID.</p></div><button className="btn btn-outline-primary btn-sm" type="button" onClick={addUser}><Icon name="plus" size={15} />Add user</button></div>
      {!userEntries.length && <p className="quiet-note">No individual grants have been added.</p>}
      {userEntries.map((entry, index) => <div className="permission-user-row" key={`${entry.userId || "new"}-${index}`}><input className="form-control form-control-sm" value={entry.userId || ""} onChange={(event) => updateUser(index, "userId", event.target.value)} placeholder="User ID" aria-label="User ID" /><MultiSelectPermissions label={`User ${entry.userId || index + 1} permissions`} value={asPermissions(entry)} options={ALL_PERMISSIONS} onChange={(next) => updateUser(index, "permissions", next)} /><button className="icon-button danger-button" type="button" onClick={() => removeUser(index)} aria-label="Remove user permission"><Icon name="trash" size={16} /></button></div>)}
    </div>
  </div>;
}
