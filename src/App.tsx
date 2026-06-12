/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { Lead } from './types';
import Sidebar from './components/Sidebar';
import SearchPage from './pages/Search';
import ResultsPage from './pages/Results';
import LeadsPage from './pages/Leads';
import WebhookPage from './pages/Webhook';
import { Key, ShieldCheck, Play, Sparkles } from 'lucide-react';

function DashboardLayout() {
  const { isLoggedIn, login } = useApp();
  const [activeResults, setActiveResults] = useState<Lead[]>([]);

  // Simple High-Fidelity Login portal if not authenticated
  if (!isLoggedIn) {
    return <LoginPortal onLogin={login} />;
  }

  return (
    <div className="flex min-h-screen bg-[#0A0F1E] text-slate-100 font-sans">
      <Sidebar />
      <div className="flex-1 min-h-screen pl-0 md:pl-64 pt-16 md:pt-0">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full transition-all duration-300">
          <Routes>
            <Route path="/search" element={<SearchPage setActiveResults={setActiveResults} />} />
            <Route path="/results" element={<ResultsPage activeResults={activeResults} setActiveResults={setActiveResults} />} />
            <Route path="/leads" element={<LeadsPage />} />
            <Route path="/webhook" element={<WebhookPage />} />
            <Route path="*" element={<Navigate to="/search" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

interface LoginPortalProps {
  onLogin: (outscraperKey: string) => void;
}

function LoginPortal({ onLogin }: LoginPortalProps) {
  const [email, setEmail] = useState('netbiz0925@gmail.com');
  const [password, setPassword] = useState('**********');
  const [outscraperKey, setOutscraperKey] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      onLogin(outscraperKey);
      setLoading(false);
    }, 850);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0A0F1E] px-4 py-8 relative overflow-hidden font-sans">
      {/* Background decorations for brutalist glowing developer terminal theme */}
      <div className="absolute top-1/4 left-1/4 h-72 w-72 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 h-72 w-72 bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-[#1F2937]/90 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl relative">
        <div className="absolute right-0 top-0 h-1 w-full bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 rounded-t-2xl" />

        {/* Branding header */}
        <div className="text-center mb-8">
          <div className="mx-auto h-12 w-12 rounded-xl bg-blue-600/10 text-blue-500 border border-blue-500/30 flex items-center justify-center mb-3">
            <Sparkles size={24} className="animate-pulse" />
          </div>
          <h1 className="font-sora font-extrabold text-2xl text-white tracking-tight leading-none mb-1">
            LeadFlow <span className="text-blue-500">Nigeria</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono tracking-wide mt-1.5 uppercase">
            Autonomous Lead Scraper and Pitcher Code tool
          </p>
        </div>

        {/* Inputs */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold mb-1.5">
              Authorized Developer Email
            </label>
            <input
              type="email"
              required
              disabled
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#0F172A] border border-slate-750 text-xs text-slate-400 rounded-lg px-3.5 py-3 focus:outline-none cursor-not-allowed font-medium"
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold mb-1.5">
              Access Token
            </label>
            <input
              type="password"
              disabled
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#0F172A] border border-slate-750 text-xs text-slate-400 rounded-lg px-3.5 py-3 focus:outline-none cursor-not-allowed font-mono"
            />
          </div>

          <div className="border-t border-slate-800 pt-4 mt-2">
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold">
                Outscraper API Key (Optional)
              </label>
              <span className="text-[9px] text-[#10B981] font-mono flex items-center gap-1">
                <ShieldCheck size={10} /> Saved in Browser
              </span>
            </div>
            <input
              type="password"
              placeholder="Enter your Outscraper API Key — get one free at outscraper.com"
              value={outscraperKey}
              onChange={(e) => setOutscraperKey(e.target.value)}
              className="w-full bg-[#0F172A] border border-slate-750 text-xs font-mono text-white rounded-lg px-3.5 py-3 focus:border-blue-500 focus:outline-none"
            />
            <p className="text-[10px] text-slate-500 leading-relaxed mt-2 font-mono">
              500 free searches/month. Get your free key at outscraper.com
            </p>
          </div>

          {/* Login button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs tracking-wider uppercase rounded-lg transition duration-150 shadow-md shadow-blue-900/35 flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <>
                <div className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Initializing Terminal Space...</span>
              </>
            ) : (
              <>
                <Play size={13} fill="currentColor" />
                <span>Initialize Terminal Session</span>
              </>
            )}
          </button>
        </form>

        {/* Security statement */}
        <div className="text-center text-[10px] text-slate-500 font-mono mt-6 leading-relaxed">
          LeadFlow is secured with double client-side sandbox containers. No credential objects are ever transmitted outside your browser workspace limit.
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <DashboardLayout />
      </BrowserRouter>
    </AppProvider>
  );
}
