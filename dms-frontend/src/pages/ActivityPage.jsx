/* AEGIS Console: the activity page makes the audit trail filterable without confusing notices for documented events. */
import { useState } from "react";
import { useAuth } from "../auth/AuthContext.jsx";
import { activityApi } from "../services/api.js";
import { useApiResource } from "../hooks/useApiResource.js";
import { LoadingState, ErrorState } from "../components/AsyncState.jsx";
import { ActivityList } from "../components/ActivityList.jsx";

export function ActivityPage() {
  const { session } = useAuth();
  const [type, setType] = useState("");
  const resource = useApiResource(() => activityApi.list(session.token, { type, role: session.user.role }), [session.token, session.user.role, type]);
  if (resource.status === "loading") return <LoadingState label="Loading activity history…" />;
  if (resource.status === "error") return <ErrorState error={resource.error} onRetry={resource.reload} title="Activity history could not be loaded." />;
  return <div className="page"><section className="page-intro"><div><span className="eyebrow">AUDIT HISTORY</span><h1>Activity</h1><p>Review actions recorded within the document scope assigned to your account.</p></div><select className="form-select activity-filter" value={type} onChange={(event) => setType(event.target.value)} aria-label="Filter activity"><option value="">All activity</option><option value="DOCUMENT">Document events</option><option value="AI">AI queries</option><option value="AUTH">Authentication</option><option value="USER">User management</option></select></section><section className="content-panel activity-page-panel"><ActivityList items={resource.data || []} /></section></div>;
}
