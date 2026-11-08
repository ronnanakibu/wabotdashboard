import type { FC } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { RadioProvider } from './context/RadioContext';
import { AuthProvider } from './context/AuthContext';
import { Sidebar } from './components/Sidebar';
import { MobileNav } from './components/MobileNav';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LandingPage } from './pages/LandingPage';
import { RadioPage } from './pages/RadioPage';
import { CommandsPage } from './pages/CommandsPage';
import { LoginPage } from './pages/LoginPage';
import { GroupsPage } from './pages/GroupsPage';
import { TelemetryPage } from './pages/TelemetryPage';
import { TerminalPage } from './pages/TerminalPage';
import { AiCenterPage } from './pages/AiCenterPage';
import { ObservatoryPage } from './pages/ObservatoryPage';

const AppContent: FC = () => {
  const location = useLocation();
  const isLandingPage = location.pathname === '/';

  if (isLandingPage) {
    return (
      <Routes>
        <Route path="/" element={<LandingPage />} />
      </Routes>
    );
  }

  return (
    <div className="app-layout">
      {/* Desktop persistent sidebar */}
      <Sidebar />

      {/* Mobile Header and Bottom Navigation */}
      <MobileNav />

      {/* Routed main view */}
      <main
        className="main-content"
        style={{
          width: '100%',
          maxWidth: '100%',
          minWidth: 0,
          overflowX: 'hidden',
          boxSizing: 'border-box'
        }}
      >
        <Routes>
          {/* Public Routes */}
          <Route path="/radio" element={<RadioPage />} />
          <Route path="/dashboard" element={<Navigate to="/radio" replace />} />
          <Route path="/commands" element={<CommandsPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Owner Protected Routes */}
          <Route
            path="/owner/groups"
            element={
              <ProtectedRoute>
                <GroupsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/owner/ai"
            element={
              <ProtectedRoute>
                <AiCenterPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/owner/observatory"
            element={
              <ProtectedRoute>
                <ObservatoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/owner/telemetry"
            element={
              <ProtectedRoute>
                <TelemetryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/owner/terminal"
            element={
              <ProtectedRoute>
                <TerminalPage />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
};

export const App: FC = () => {
  return (
    <AuthProvider>
      <RadioProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </RadioProvider>
    </AuthProvider>
  );
};

export default App;
