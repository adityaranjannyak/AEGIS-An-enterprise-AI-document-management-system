/* AEGIS Console: the central document workspace uses a deliberate toolbar for scoped search, filters, ordering, and pagination. */
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "../auth/AuthContext.jsx";
import { documentApi } from "../services/api.js";
import { useApiResource } from "../hooks/useApiResource.js";
import { LoadingState, ErrorState } from "../components/AsyncState.jsx";
import { DocumentTable } from "../components/DocumentTable.jsx";
import { Icon } from "../components/Icon.jsx";

const parseSearch = (location) => new URLSearchParams(location.split("?")[1] || "").get("search") || "";
export function DocumentsPage({ scope }) {
  const { session } = useAuth();
  const [location] = useLocation();
  const incomingSearch = parseSearch(location);
  const [filters, setFilters] = useState(() => ({ search: incomingSearch, type: "", access: scope === "mine" ? "MINE" : "", sort: "NEWEST", page: 0 }));
  const [draftSearch, setDraftSearch] = useState(incomingSearch);
  // URL navigation is an external input; synchronize the local filter state when it changes.
  // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps
  useEffect(() => { if (incomingSearch !== filters.search) { setDraftSearch(incomingSearch); setFilters((current) => ({ ...current, search: incomingSearch, page: 0 })); } }, [incomingSearch]);
  const paramsKey = useMemo(() => JSON.stringify({ ...filters, scope: scope || "ALL" }), [filters, scope]);
  const resource = useApiResource(() => documentApi.list(session.token, { ...filters, scope: scope || "ALL" }), [session.token, paramsKey]);
  const result = resource.data || [];
  const documents = Array.isArray(result) ? result : result.content || result.items || [];
  const totalPages = Number(result.totalPages || result.pageCount || 1);
  const submitSearch = (event) => { event.preventDefault(); setFilters((current) => ({ ...current, search: draftSearch.trim(), page: 0 })); };
  const setFilter = (key, value) => setFilters((current) => ({ ...current, [key]: value, page: key === "page" ? value : 0 }));
  const title = scope === "mine" ? "My documents" : "Documents";
  if (resource.status === "loading") return <LoadingState label="Loading authorized documents…" />;
  if (resource.status === "error") return <ErrorState error={resource.error} onRetry={resource.reload} title="The document workspace could not be loaded." />;
  return <div className="page documents-page"><section className="page-intro document-intro"><div><span className="eyebrow">{scope === "mine" ? "YOUR AUTHORIZED SCOPE" : "DOCUMENT WORKSPACE"}</span><h1>{title}</h1><p>{scope === "mine" ? "This view includes the records your account is authorized to access." : "Search, inspect, and act on records within your assigned document scope."}</p></div><div className="intro-actions"><Link href="/assistant" className="btn btn-outline-primary"><Icon name="spark" size={17} />Ask AI</Link><Link href="/upload" className="btn btn-primary"><Icon name="upload" size={17} />Upload document</Link></div></section><section className="content-panel document-workspace"><form className="document-toolbar" onSubmit={submitSearch}><div className="document-search"><Icon name="search" size={17} /><input value={draftSearch} onChange={(event) => setDraftSearch(event.target.value)} placeholder="Search documents" aria-label="Search documents" /><button className="btn btn-primary btn-sm" type="submit">Search</button></div><select className="form-select form-select-sm" value={filters.type} onChange={(event) => setFilter("type", event.target.value)} aria-label="Filter by file type"><option value="">All file types</option><option value="PDF">PDF</option><option value="DOCX">Word</option><option value="XLSX">Spreadsheet</option><option value="PPTX">Presentation</option></select><select className="form-select form-select-sm" value={filters.access} onChange={(event) => setFilter("access", event.target.value)} aria-label="Filter by access"><option value="">All access</option><option value="MINE">My documents</option><option value="SHARED">Shared with me</option></select><select className="form-select form-select-sm" value={filters.sort} onChange={(event) => setFilter("sort", event.target.value)} aria-label="Sort documents"><option value="NEWEST">Newest</option><option value="OLDEST">Oldest</option><option value="NAME_ASC">Name A–Z</option><option value="NAME_DESC">Name Z–A</option></select></form><DocumentTable documents={documents} emptyAction={<Link href="/upload" className="btn btn-primary btn-sm"><Icon name="upload" size={15} />Upload a document</Link>} /><div className="pagination-bar"><span>Page {filters.page + 1} of {totalPages}</span><div><button className="btn btn-light btn-sm" disabled={filters.page <= 0} onClick={() => setFilter("page", filters.page - 1)}>Previous</button><button className="btn btn-light btn-sm" disabled={filters.page + 1 >= totalPages} onClick={() => setFilter("page", filters.page + 1)}>Next</button></div></div></section></div>;
}
