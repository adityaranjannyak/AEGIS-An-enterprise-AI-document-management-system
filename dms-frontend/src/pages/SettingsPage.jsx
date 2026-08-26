/* AEGIS Console: settings expose only real profile and session actions while clearly identifying backend features that are not yet available. */
import { useState } from "react";
import { useAuth } from "../auth/AuthContext.jsx";
import { userApi } from "../services/api.js";
import { Icon } from "../components/Icon.jsx";
import { toast } from "../components/Toaster.jsx";

export function SettingsPage() {
  const { session, signOut, updateSessionUser } = useAuth();
  const [profile, setProfile] = useState({ name: session.user.name || "", username: session.user.username || "" });
  const [profileBusy, setProfileBusy] = useState(false);
  const [message, setMessage] = useState("");
  const saveProfile = async (event) => {
  event.preventDefault();
  if (!profile.name.trim() || !profile.username.trim()) {
    setMessage("Name and username are required.");
    return;
  }

  setProfileBusy(true);
  setMessage("");

  try {
    const updatedUser = await userApi.updateMe(session.token, {
      name: profile.name.trim(),
      username: profile.username.trim(),
    });

    updateSessionUser(updatedUser);
    setProfile({
      name: updatedUser.name || "",
      username: updatedUser.username || "",
    });
    toast("Profile updated.", "success");
  } catch (error) {
    setMessage(error.message);
  } finally {
    setProfileBusy(false);
  }
};
  return <div className="page settings-page"><section className="page-intro"><div><span className="eyebrow">ACCOUNT & WORKSPACE</span><h1>Settings</h1><p>Maintain your identity and current browser session. Role and account status remain controlled by the backend.</p></div></section><section className="settings-layout"><section className="content-panel profile-panel"><span className="eyebrow">PROFILE</span><h2>Your identity</h2><p className="quiet-note">User ID, role, and account status cannot be changed from this screen.</p>{message && <div className="form-error"><Icon name="alert" size={16} />{message}</div>}<form onSubmit={saveProfile}><label className="form-label">Name</label><input className="form-control" value={profile.name} onChange={(event) => setProfile({ ...profile, name: event.target.value })} /><label className="form-label mt-3">Username</label><input className="form-control" value={profile.username} onChange={(event) => setProfile({ ...profile, username: event.target.value })} /><div className="readonly-grid"><div><span>USER ID</span><strong>{session.user.id ?? "—"}</strong></div><div><span>ROLE</span><strong>{session.user.role}</strong></div><div><span>STATUS</span><strong>{session.user.status || "ACTIVE"}</strong></div></div><button className="btn btn-primary" disabled={profileBusy}>{profileBusy ? "Saving…" : "Save profile"}</button></form></section><section className="settings-preferences"><section className="content-panel"><span className="eyebrow">CURRENT BACKEND CAPABILITY</span><h2>Preferences</h2><div className="preference-row"><div><strong>Notifications</strong><p>Read and acknowledgement actions are available from the header notification panel.</p></div><Icon name="bell" size={19} /></div><div className="preference-row"><div><strong>AI scope</strong><p>Select the authorized document scope directly when asking the RAG assistant.</p></div><Icon name="spark" size={19} /></div><div className="preference-row"><div><strong>Appearance</strong><p>The supplied backend does not expose persistent appearance preferences, so no inactive toggle is displayed.</p></div><Icon name="settings" size={19} /></div></section>{session.user.role === "ADMIN" && <section className="content-panel workspace-settings"><span className="eyebrow">ADMIN ONLY</span><h2>Workspace settings</h2><p>Workspace-wide storage and default-permission controls are not exposed by the supplied backend yet.</p></section>}</section></section><section className="logout-panel"><div><span className="eyebrow">SESSION</span><h2>End this browser session</h2><p>Logging out clears the current authenticated session and returns to the secure login page.</p></div><button className="btn btn-outline-danger" onClick={signOut}><Icon name="logout" size={17} />Log out</button></section></div>;
}
