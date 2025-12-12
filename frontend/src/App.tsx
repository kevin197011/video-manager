// Copyright (c) 2025 kk
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './components/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProvidersPage from './pages/ProvidersPage';
import LinesPage from './pages/LinesPage';
import DomainsPage from './pages/DomainsPage';
import StreamsPage from './pages/StreamsPage';
import StreamPathsPage from './pages/StreamPathsPage';
import VideoStreamEndpointsPage from './pages/VideoStreamEndpointsPage';
import TokenManagementPage from './pages/TokenManagementPage';
import SwaggerPage from './pages/SwaggerPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/providers" element={<ProvidersPage />} />
                  <Route path="/lines" element={<LinesPage />} />
                  <Route path="/domains" element={<DomainsPage />} />
                  <Route path="/stream-regions" element={<StreamsPage />} />
                  <Route path="/stream-paths" element={<StreamPathsPage />} />
                  <Route path="/endpoints" element={<VideoStreamEndpointsPage />} />
                  <Route path="/token-management" element={<TokenManagementPage />} />
                  <Route path="/swagger" element={<SwaggerPage />} />
                </Routes>
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
