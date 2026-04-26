console.log("APP IS LOADING");

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";

import LeadTaskDetail from "./components/lead/LeadTaskDetail";
import SupervisorTaskDetail from "./components/supervisor/SupervisorTaskDetail";
// AUTH
import Login from "./components/auth/Login";
import EmailVerification from "./components/auth/EmailVerification";

// SUPERVISOR
import SupervisorLayout from "./components/supervisor/SupervisorLayout";
import SupervisorDashboard from "./components/supervisor/SupervisorDashboard";
import SupervisorProjects from "./components/supervisor/SupervisorProjects";
import SupervisorProjectDetail from "./components/supervisor/SupervisorProjectDetail";
import SupervisorTeams from "./components/supervisor/SupervisorTeams";
import SupervisorNotifications from "./components/supervisor/SupervisorNotifications";

// LEAD
import LeadLayout from "./components/lead/LeadLayout";
import LeadDashboard from "./components/lead/LeadDashboard";
import LeadProjects from "./components/lead/LeadProjects";
import ProjectDetail from "./components/lead/ProjectDetail";
import LeadTeamMembers from "./components/lead/LeadTeamMembers";
import LeadNotifications from "./components/lead/LeadNotifications";

function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();

  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;

  if (role && user.role !== role) {
    return (
      <Navigate
        to={user.role === "supervisor" ? "/supervisor" : "/lead"}
        replace
      />
    );
  }

  return children;
}

function PageLoader() {
  return (
    <div style={{
      height: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--bg-primary)",
    }}>
      <div style={{ textAlign: "center" }}>
        <div style={{
          width: 48,
          height: 48,
          border: "3px solid var(--border-default)",
          borderTopColor: "var(--accent-primary)",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
          margin: "0 auto 16px",
        }} />
        <p style={{
          color: "var(--text-muted)",
          fontSize: 14,
          fontFamily: "var(--font-display)",
        }}>
          Loading FlowDesk...
        </p>
      </div>
    </div>
  );
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>

      {/* LOGIN */}
      <Route
        path="/login"
        element={
          user ? (
            <Navigate to={user.role === "supervisor" ? "/supervisor" : "/lead"} />
          ) : (
            <Login />
          )
        }
      />

      {/* VERIFY */}
      <Route path="/verify-email" element={<EmailVerification />} />

      {/* ================= SUPERVISOR ================= */}
      <Route
  path="/supervisor"
  element={
    <ProtectedRoute role="supervisor">
      <SupervisorLayout />
    </ProtectedRoute>
  }
>
  <Route index element={<SupervisorDashboard />} />
  <Route path="projects" element={<SupervisorProjects />} />

  {/* ✅ PROJECT DETAIL */}
  <Route path="projects/:id" element={<SupervisorProjectDetail />} />

  {/* ✅ TASK DETAIL */}
  <Route path="projects/:id/tasks/:taskId" element={<SupervisorTaskDetail />} />

  <Route path="teams" element={<SupervisorTeams />} />
  <Route path="notifications" element={<SupervisorNotifications />} />
</Route>

      {/* ================= LEAD ================= */}
     <Route
  path="/lead"
  element={
    <ProtectedRoute role="lead">
      <LeadLayout />
    </ProtectedRoute>
  }
>
  <Route index element={<LeadDashboard />} />
  <Route path="projects" element={<LeadProjects />} />

  {/* ✅ PROJECT DETAIL (FULL PAGE) */}
  <Route path="projects/:id" element={<ProjectDetail />} />

  {/* ✅ TASK DETAIL */}
  <Route path="projects/:id/tasks/:taskId" element={<LeadTaskDetail />} />

  <Route path="team-members" element={<LeadTeamMembers />} />
  <Route path="notifications" element={<LeadNotifications />} />
</Route>

      {/* ROOT */}
      <Route
        path="/"
        element={
          user ? (
            <Navigate to={user.role === "supervisor" ? "/supervisor" : "/lead"} />
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      <Route path="*" element={<Navigate to="/" />} />

    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />

          <Toaster position="top-right" />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}