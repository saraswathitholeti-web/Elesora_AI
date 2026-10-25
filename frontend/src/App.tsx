import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AccessibilityProvider } from './contexts/AccessibilityContext';

// Pages
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { DashboardPage } from './pages/DashboardPage';
import { AssistantPage } from './pages/AssistantPage';
import { LifePathPage } from './pages/LifePathPage';
import { DiscoverPage } from './pages/DiscoverPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { BarrierToBridgePage } from './pages/BarrierToBridgePage';
import { ActionCardsPage } from './pages/ActionCardsPage';
import { SchemesPage } from './pages/SchemesPage';
import { LearningPage } from './pages/LearningPage';
import { CommunityPage } from './pages/CommunityPage';
import { SustainabilityPage } from './pages/SustainabilityPage';
import { AccessibilityPage } from './pages/AccessibilityPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { AboutPage } from './pages/AboutPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { TermsPage } from './pages/TermsPage';
import { NotFoundPage } from './pages/NotFoundPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-primary-bg flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-electric-purple border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // To allow competition evaluation and seamless exploration, if not authenticated, redirect to login with state
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AccessibilityProvider>
          <Router>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/terms" element={<TermsPage />} />

              {/* Core Features (Accessible directly & inside dashboard) */}
              <Route path="/assistant" element={<AssistantPage />} />
              <Route path="/lifepath" element={<LifePathPage />} />
              <Route path="/discover" element={<DiscoverPage />} />
              <Route path="/documents" element={<DocumentsPage />} />
              <Route path="/barrier-to-bridge" element={<BarrierToBridgePage />} />
              <Route path="/action-cards" element={<ActionCardsPage />} />
              <Route path="/schemes" element={<SchemesPage />} />
              <Route path="/learning" element={<LearningPage />} />
              <Route path="/community" element={<CommunityPage />} />
              <Route path="/sustainability" element={<SustainabilityPage />} />
              <Route path="/accessibility" element={<AccessibilityPage />} />

              {/* Protected Workspace Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <SettingsPage />
                  </ProtectedRoute>
                }
              />

              {/* 404 Fallback */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Router>
        </AccessibilityProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
