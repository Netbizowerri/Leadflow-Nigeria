import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { AppProvider, useApp } from './context/AppContext';
import { Lead } from './types';
import Sidebar from './components/Sidebar';
import SearchPage from './pages/Search';
import ResultsPage from './pages/Results';
import LeadsPage from './pages/Leads';
import WebhookPage from './pages/Webhook';
import HomePage from './pages/Home';
import LoginPage from './pages/Login';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = useApp();
  const location = useLocation();

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const [activeResults, setActiveResults] = useState<Lead[]>([]);
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      >
        <Routes location={location}>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Protected routes (require auth) */}
          <Route path="/search" element={
            <ProtectedRoute>
              <div className="flex min-h-screen bg-[#0A0F1E] text-slate-100 font-sans">
                <Sidebar />
                <div className="flex-1 min-h-screen pl-0 md:pl-64 pt-16 md:pt-0">
                  <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
                    <SearchPage setActiveResults={setActiveResults} />
                  </div>
                </div>
              </div>
            </ProtectedRoute>
          } />
          <Route path="/results" element={
            <ProtectedRoute>
              <div className="flex min-h-screen bg-[#0A0F1E] text-slate-100 font-sans">
                <Sidebar />
                <div className="flex-1 min-h-screen pl-0 md:pl-64 pt-16 md:pt-0">
                  <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
                    <ResultsPage activeResults={activeResults} setActiveResults={setActiveResults} />
                  </div>
                </div>
              </div>
            </ProtectedRoute>
          } />
          <Route path="/leads" element={
            <ProtectedRoute>
              <div className="flex min-h-screen bg-[#0A0F1E] text-slate-100 font-sans">
                <Sidebar />
                <div className="flex-1 min-h-screen pl-0 md:pl-64 pt-16 md:pt-0">
                  <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
                    <LeadsPage />
                  </div>
                </div>
              </div>
            </ProtectedRoute>
          } />
          <Route path="/webhook" element={
            <ProtectedRoute>
              <div className="flex min-h-screen bg-[#0A0F1E] text-slate-100 font-sans">
                <Sidebar />
                <div className="flex-1 min-h-screen pl-0 md:pl-64 pt-16 md:pt-0">
                  <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
                    <WebhookPage />
                  </div>
                </div>
              </div>
            </ProtectedRoute>
          } />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  );
}
