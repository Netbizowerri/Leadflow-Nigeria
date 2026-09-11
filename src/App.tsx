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
import AdminPage from './pages/Admin';
import { ShieldAlert, Mail, Clock } from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Shared layout for all auth-gated pages                             */
/* ------------------------------------------------------------------ */
function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#0A0F1E] text-slate-100 font-sans">
      <Sidebar />
      <div className="flex-1 min-h-screen pl-0 md:pl-64 pt-16 md:pt-0">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Protected route — redirects to /login if not signed in             */
/*  Shows "pending verification" screen if not yet verified            */
/*  Shows "account suspended" if is_active is false                    */
/* ------------------------------------------------------------------ */
function ProtectedRoute({ children, requireAdmin = false }: { children: React.ReactNode; requireAdmin?: boolean }) {
  const { user, isLoading, isVerified, isSuperAdmin, profile } = useApp();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0A0F1E]">
        <div className="text-center">
          <div className="h-6 w-6 border-2 border-slate-600 border-t-emerald-400 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-mono text-slate-400">Loading session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (profile && !profile.is_active) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0A0F1E] px-4">
        <div className="glass-panel rounded-2xl p-10 max-w-md text-center border border-red-900/40">
          <ShieldAlert className="mx-auto text-red-400 mb-4" size={40} />
          <h2 className="font-sora font-bold text-xl text-white mb-2">Account Suspended</h2>
          <p className="text-sm text-slate-400">
            Your account has been deactivated by an administrator. Please contact support to regain access.
          </p>
        </div>
      </div>
    );
  }

  if (!isVerified) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0A0F1E] px-4">
        <div className="glass-panel rounded-2xl p-10 max-w-md text-center border border-amber-900/40">
          <Clock className="mx-auto text-amber-400 mb-4" size={40} />
          <h2 className="font-sora font-bold text-xl text-white mb-2">Pending Verification</h2>
          <p className="text-sm text-slate-400 mb-6">
            Your account is awaiting administrator approval. You will receive full access once an admin
            verifies your account.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs font-mono">
            <Mail size={13} />
            {profile?.email || user.email}
          </div>
        </div>
      </div>
    );
  }

  if (requireAdmin && !isSuperAdmin) {
    return (
      <ProtectedLayout>
        <div className="flex items-center justify-center min-h-[70vh]">
          <div className="glass-panel rounded-2xl p-10 max-w-md text-center border border-red-900/40">
            <ShieldAlert className="mx-auto text-red-400 mb-4" size={40} />
            <h2 className="font-sora font-bold text-xl text-white mb-2">Access Denied</h2>
            <p className="text-sm text-slate-400">
              This page is only accessible to the Super Administrator.
            </p>
          </div>
        </div>
      </ProtectedLayout>
    );
  }

  return <>{children}</>;
}

/* ------------------------------------------------------------------ */
/*  Routes                                                             */
/* ------------------------------------------------------------------ */
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

          {/* Protected routes (require auth + verified) */}
          <Route path="/search" element={
            <ProtectedRoute>
              <ProtectedLayout><SearchPage setActiveResults={setActiveResults} /></ProtectedLayout>
            </ProtectedRoute>
          } />
          <Route path="/results" element={
            <ProtectedRoute>
              <ProtectedLayout><ResultsPage activeResults={activeResults} setActiveResults={setActiveResults} /></ProtectedLayout>
            </ProtectedRoute>
          } />
          <Route path="/leads" element={
            <ProtectedRoute>
              <ProtectedLayout><LeadsPage /></ProtectedLayout>
            </ProtectedRoute>
          } />
          <Route path="/webhook" element={
            <ProtectedRoute>
              <ProtectedLayout><WebhookPage /></ProtectedLayout>
            </ProtectedRoute>
          } />

          {/* Super Admin only */}
          <Route path="/admin" element={
            <ProtectedRoute requireAdmin>
              <ProtectedLayout><AdminPage /></ProtectedLayout>
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