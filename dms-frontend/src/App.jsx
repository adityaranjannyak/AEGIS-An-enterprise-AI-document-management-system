/* AEGIS Console: application-level routing prioritizes authenticated work continuity and clear escape routes. */
import { Route, Switch, Redirect, useLocation } from "wouter";
import { Toaster } from "./components/Toaster.jsx";
import { AuthProvider, useAuth } from "./auth/AuthContext.jsx";
import { AppShell } from "./layouts/AppShell.jsx";
import { LoginPage } from "./pages/LoginPage.jsx";
import { DashboardPage } from "./pages/DashboardPage.jsx";
import { DocumentsPage } from "./pages/DocumentsPage.jsx";
import { DocumentDetailPage } from "./pages/DocumentDetailPage.jsx";
import { UploadPage } from "./pages/UploadPage.jsx";
import { AssistantPage } from "./pages/AssistantPage.jsx";
import { ActivityPage } from "./pages/ActivityPage.jsx";
import { UsersPage } from "./pages/UsersPage.jsx";
import { SettingsPage } from "./pages/SettingsPage.jsx";
import { ContactPage } from "./pages/ContactPage.jsx";
import { NotFoundPage } from "./pages/NotFoundPage.jsx";
import { AccessDeniedPage } from "./pages/AccessDeniedPage.jsx";
import { getResumeRoute, setResumeRoute } from "./utils/sessionState.js";

function ProtectedView({ component: Component, adminOnly = false }) {
  const { session } = useAuth();
  const [location] = useLocation();
  if (!session) {
    setResumeRoute(location);
    return <Redirect to="/login" />;
  }
  if (adminOnly && session.user.role !== "ADMIN") return <Redirect to="/access-denied" />;
  return <AppShell><Component /></AppShell>;
}

function LoginRoute() {
  const { session } = useAuth();
  return session ? <Redirect to={getResumeRoute() || "/dashboard"} /> : <LoginPage />;
}

function Router() {
  return <Switch>
    <Route path="/login" component={LoginRoute} />
    <Route path="/dashboard">{() => <ProtectedView component={DashboardPage} />}</Route>
    <Route path="/documents">{() => <ProtectedView component={DocumentsPage} />}</Route>
    <Route path="/my-documents">{() => <ProtectedView component={() => <DocumentsPage scope="mine" />} />}</Route>
    <Route path="/documents/:id">{({ id }) => <ProtectedView component={() => <DocumentDetailPage id={id} />} />}</Route>
    <Route path="/upload">{() => <ProtectedView component={UploadPage} />}</Route>
    <Route path="/assistant">{() => <ProtectedView component={AssistantPage} />}</Route>
    <Route path="/activity">{() => <ProtectedView component={ActivityPage} />}</Route>
    <Route path="/users">{() => <ProtectedView component={UsersPage} adminOnly />}</Route>
    <Route path="/settings">{() => <ProtectedView component={SettingsPage} />}</Route>
    <Route path="/contact">{() => <ProtectedView component={ContactPage} />}</Route>
    <Route path="/access-denied">{() => <ProtectedView component={AccessDeniedPage} />}</Route>
    <Route path="/">{() => <Redirect to="/dashboard" />}</Route>
    <Route component={NotFoundPage} />
  </Switch>;
}

export default function App() {
  return <AuthProvider><Router /><Toaster /></AuthProvider>;
}
