import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import SettingsPage from './pages/SettingsPage';
import CreateArticlePage from './pages/CreateArticlePage';
import MyArticlesPage from './pages/MyArticlesPage';
import EditArticlePage from './pages/EditArticlePage';

function App() {
  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">
        <Routes>
          {/* Public Routes */}
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
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
          <Route
            path="/create-article"
            element={
              <ProtectedRoute>
                <CreateArticlePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-articles"
            element={
              <ProtectedRoute>
                <MyArticlesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit-article/:id"
            element={
              <ProtectedRoute>
                <EditArticlePage />
              </ProtectedRoute>
            }
          />

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
