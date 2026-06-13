import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';
import { Play, AlertTriangle, Radar, ArrowLeft } from 'lucide-react';

export default function LoginPage() {
  const { login } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState('Netbiz0925@gmail.com');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const VALID_EMAIL = 'Netbiz0925@gmail.com';
  const VALID_PASS = 'NetBizOwerri0925##';

  function constantTimeEqual(a: string, b: string): boolean {
    if (a.length !== b.length) return false;
    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return result === 0;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const trimmedEmail = email.trim().slice(0, 320);
    const trimmedPassword = password.trim().slice(0, 128);

    if (!constantTimeEqual(trimmedEmail, VALID_EMAIL) || !constantTimeEqual(trimmedPassword, VALID_PASS)) {
      setLoginError('Invalid email or access token.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      login();
      setLoading(false);
      navigate('/search', { replace: true });
    }, 850);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0A0F1E] px-4 py-8 relative overflow-hidden font-sans">
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-emerald-500/5 via-blue-500/5 to-transparent pointer-events-none" />
      <div className="absolute top-1/3 -left-48 h-[400px] w-[400px] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/3 -right-48 h-[400px] w-[400px] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md bg-[#1E293B]/90 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl relative"
      >
        <div className="absolute right-0 top-0 h-1 w-full bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-600 rounded-t-2xl" />

        {/* Back to Home */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 mb-6 transition-colors font-mono"
        >
          <ArrowLeft size={14} />
          <span>Back to Home</span>
        </button>

        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mx-auto h-14 w-14 rounded-xl bg-gradient-to-br from-emerald-500/10 to-blue-600/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mb-4"
          >
            <Radar size={28} />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="font-sora font-extrabold text-2xl text-white tracking-tight leading-none mb-1"
          >
            Developer Access
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xs text-slate-400 font-mono tracking-wide mt-1.5"
          >
            Enter your credentials to access the LeadFlow dashboard
          </motion.p>
        </div>

        <motion.form
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold mb-1.5">
              Authorized Developer Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#0F172A] border border-slate-700 text-xs text-white rounded-lg px-3.5 py-3 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 font-medium transition-colors"
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold mb-1.5">
              Access Token
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your access token"
              className="w-full bg-[#0F172A] border border-slate-700 text-xs text-white rounded-lg px-3.5 py-3 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 font-mono transition-colors"
            />
          </div>

          {loginError && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="p-3 bg-red-950/40 border border-red-900/60 rounded-lg text-xs text-red-400 flex items-center gap-2"
            >
              <AlertTriangle size={15} />
              <span>{loginError}</span>
            </motion.div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 text-white font-bold text-xs tracking-wider uppercase rounded-lg transition-all duration-300 shadow-lg shadow-emerald-900/25 flex items-center justify-center gap-2 mt-2 active:scale-[0.98]"
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
        </motion.form>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center text-[10px] text-slate-500 font-mono mt-6 leading-relaxed"
        >
          Secured with double client-side sandbox containers. No credential objects are ever transmitted outside your browser.
        </motion.div>
      </motion.div>
    </div>
  );
}
