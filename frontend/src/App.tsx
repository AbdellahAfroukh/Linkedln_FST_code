import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryProvider } from "./components/providers/query-provider";
import { ToastProvider } from "./components/providers/toast-provider";
import { ChatProvider } from "./features/chats/context/chat-context";
import { ErrorBoundary } from "./components/error-boundary";
import {
  ProtectedRoute,
  RoleProtectedRoute,
} from "./components/auth/protected-route";

// Layout
import { AppLayout } from "./layouts/app-layout";
import { AuthLayout } from "./layouts/auth-layout";

// Auth Pages
import { LoginPage } from "./features/auth/pages/login-page";
import { RegisterPage } from "./features/auth/pages/register-page";
import { CompleteProfilePage } from "./features/auth/pages/complete-profile-page";
import { VerifyEmailPage } from "./features/auth/pages/verify-email-page";
import { ResendVerificationPage } from "./features/auth/pages/resend-verification-page";

// Dashboard
import { DashboardPage } from "./features/dashboard/pages/dashboard-page";

// Posts
import { PostsFeedPage } from "./features/posts/pages/posts-feed-page";
import { FeedPage } from "./features/posts/pages/feed-page";

// Admin
import { AdminDashboardPage } from "./features/admin/pages/admin-dashboard-page";

// CV
import { CVPage } from "./features/cv/pages/cv-page";

// Connections
import { ConnectionsPage } from "./features/connections/pages/connections-page";
import { PeoplePage } from "./features/connections/pages/people-page";

// Chats
import { ChatsPage } from "./features/chats/pages/chats-page";

// Projets
import { ProjetsPage } from "./features/projets/pages/projets-page";

// Google Scholar
import { GoogleScholarPage } from "./features/google-scholar/pages/google-scholar-page";

// Scopus
import { ScopusPage } from "./features/scopus/pages/scopus-page";

// Profile
import { ProfileSettingsPage } from "./features/profile/pages/profile-settings-page";
import { UserProfilePage } from "./features/users/pages/user-profile-page";

function App() {
  return (
    <ErrorBoundary>
      <QueryProvider>
        <ChatProvider>
          <ToastProvider />
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/verify-email" element={<VerifyEmailPage />} />
                <Route
                  path="/resend-verification"
                  element={<ResendVerificationPage />}
                />
              </Route>

              {/* Protected routes */}
              <Route element={<ProtectedRoute />}>
                <Route
                  path="/complete-profile"
                  element={<CompleteProfilePage />}
                />

                <Route element={<AppLayout />}>
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/posts" element={<PostsFeedPage />} />
                  <Route path="/feed" element={<FeedPage />} />
                  <Route path="/people" element={<PeoplePage />} />
                  <Route path="/cv" element={<CVPage />} />
                  <Route path="/connections" element={<ConnectionsPage />} />
                  <Route path="/chats" element={<ChatsPage />} />
                  <Route path="/projets" element={<ProjetsPage />} />
                  <Route
                    path="/google-scholar"
                    element={<GoogleScholarPage />}
                  />
                  <Route path="/scopus" element={<ScopusPage />} />
                  <Route
                    path="/profile/settings"
                    element={<ProfileSettingsPage />}
                  />
                  <Route path="/users/:userId" element={<UserProfilePage />} />

                  {/* Admin routes */}
                  <Route
                    element={<RoleProtectedRoute allowedRoles={["admin"]} />}
                  >
                    <Route path="/admin" element={<AdminDashboardPage />} />
                  </Route>

                  <Route
                    path="/"
                    element={<Navigate to="/dashboard" replace />}
                  />
                </Route>
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </BrowserRouter>
        </ChatProvider>
      </QueryProvider>
    </ErrorBoundary>
  );
}

export default App;
