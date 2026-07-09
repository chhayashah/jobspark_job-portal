import React, { Suspense, lazy } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import Navbar from "./components/shared/Navbar";
import Spinner from "./components/shared/Spinner";
import "./index.css";

const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const JobsList = lazy(() => import("./pages/JobsList"));
const JobDetail = lazy(() => import("./pages/JobDetail"));
const CandidateDashboard = lazy(() => import("./pages/CandidateDashboard"));
const RecruiterDashboard = lazy(() => import("./pages/RecruiterDashboard"));
const RecruiterProfilePage = lazy(() => import("./pages/RecruiterProfilePage"));
const PostJob = lazy(() => import("./pages/PostJob"));
const EditJob = lazy(() => import("./pages/EditJob"));
const ApplicationsPage = lazy(() => import("./pages/ApplicationsPage"));
const AnalyticsPage = lazy(() => import("./pages/AnalyticsPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const JobApplicationsPage = lazy(() => import("./pages/JobApplicationsPage"));
const ResumeVersionsPage = lazy(() => import("./pages/ResumeVersionsPage"));
const ResumeScorePage = lazy(() => import("./pages/ResumeScorePage"));
const CandidateComparePage = lazy(() => import("./pages/CandidateComparePage"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

const PrivateRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <Spinner fullPage />;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  if (user)
    return (
      <Navigate
        to={
          user.role === "recruiter"
            ? "/recruiter/dashboard"
            : "/candidate/dashboard"
        }
        replace
      />
    );
  return children;
};

function AppRoutes() {
  return (
    <Suspense fallback={<Spinner fullPage />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/jobs" element={<JobsList />} />
        <Route path="/jobs/:id" element={<JobDetail />} />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />

        <Route
          path="/candidate/dashboard"
          element={
            <PrivateRoute roles={["candidate"]}>
              <CandidateDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/candidate/applications"
          element={
            <PrivateRoute roles={["candidate"]}>
              <ApplicationsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/candidate/profile"
          element={
            <PrivateRoute roles={["candidate"]}>
              <ProfilePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/resume-versions"
          element={
            <PrivateRoute roles={["candidate"]}>
              <ResumeVersionsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/resume-score"
          element={
            <PrivateRoute roles={["candidate"]}>
              <ResumeScorePage />
            </PrivateRoute>
          }
        />

        <Route
          path="/recruiter/dashboard"
          element={
            <PrivateRoute roles={["recruiter"]}>
              <RecruiterDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/recruiter/jobs/new"
          element={
            <PrivateRoute roles={["recruiter"]}>
              <PostJob />
            </PrivateRoute>
          }
        />
        <Route
          path="/recruiter/jobs/:id/edit"
          element={
            <PrivateRoute roles={["recruiter"]}>
              <EditJob />
            </PrivateRoute>
          }
        />
        <Route
          path="/recruiter/jobs/:id/applications"
          element={
            <PrivateRoute roles={["recruiter"]}>
              <JobApplicationsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/recruiter/jobs/:jobId/compare"
          element={
            <PrivateRoute roles={["recruiter"]}>
              <CandidateComparePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/recruiter/analytics"
          element={
            <PrivateRoute roles={["recruiter"]}>
              <AnalyticsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/recruiter/profile"
          element={
            <PrivateRoute roles={["recruiter"]}>
              <RecruiterProfilePage />
            </PrivateRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Router>
            <Navbar />
            <AppRoutes />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: "var(--card-bg)",
                  color: "var(--text-primary)",
                  border: "1px solid var(--border-color)",
                },
              }}
            />
          </Router>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
