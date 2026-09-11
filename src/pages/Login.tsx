import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';
import { Play, AlertTriangle, Radar, ArrowLeft, UserPlus, Lock } from 'lucide-react';

type Mode = 'signin' | 'signup';

export default function LoginPage() {
  const { signIn, signUp } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/search';

  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [notice, setNotice] = useState('');

  const switchMode = (next: Mode) => {
    setMode(next);
    setLoginError('');
    setNotice('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setNotice('');

    const trimmedEmail = email.trim().slice(0, 320);

    if (mode === 'signup') {
      if (password.length < 8) {
        setLoginError('Password must be at least 8 characters long.');
        return;
      }
    }

    setLoading(true);
    try {
      if (mode === 'signin') {
        const result = await signIn(trimmedEmail, password);
        if (result.error) {
          setLoginError(result.error);
          setLoading(false);
          return;
        }
        navigate(from, { replace: true });
      } else {
        const result = await signUp(trimmedEmail, password, fullName.trim());
        if (result.error) {
          setLoginError(result.error);
          setLoading(false);
          return;
        }
        setNotice(
          'Account created. Your account is pending verification by the administrator. You will be able to sign in once approved.'
        );
        setLoading(false);
        setMode('signin');
        setPassword('');
      }
    } catch (err: any) {
      setLoginError(err.message || 'An unexpected error occurred. Please try again.');
      setLoading(false);
    }
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

        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 mb-6 transition-colors font-mono"
        >
          <ArrowLeft size={14} />
          <span>Back to Home</span>
        </button>

        <div className="text-center mb-6">
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
            {mode === 'signin' ? 'Secure Access' : 'Create Account'}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xs text-slate-400 font-mono tracking-wide mt-1.5"
          >
            {mode === 'signin'
              ? 'Sign in with your authenticated Supabase account'
              : 'Register to request access to the LeadFlow dashboard'}
          </motion.p>
        </div>

        {/* Mode toggle */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-[#0F172A] border border-slate-800 rounded-lg mb-6">
          <button
            type="button"
            onClick={() => switchMode('signin')}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-md text-xs font-bold tracking-wide transition-colors ${
              mode === 'signin'
                ? 'bg-gradient-to-r from-emerald-600 to-blue-600 text-white shadow-lg shadow-emerald-900/25'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lock size={12} />
            Sign In
          </button>
          <button
            type="button"
            onClick={() => switchMode('signup')}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-md text-xs font-bold tracking-wide transition-colors ${
              mode === 'signup'
                ? 'bg-gradient-to-r from-emerald-600 to-blue-600 text-white shadow-lg shadow-emerald-900/25'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserPlus size={12} />
            Sign Up
          </button>
        </div>

        <motion.form
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          {mode === 'signup' && (
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
                className="w-full bg-[#0F172A] border border-slate-700 text-xs text-white rounded-lg px-3.5 py-3 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 font-medium transition-colors"
              />
            </div>
          )}

          <div>
            <label className="block text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-[#0F172A] border border-slate-700 text-xs text-white rounded-lg px-3.5 py-3 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 font-medium transition-colors"
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === 'signup' ? 'At least 8 characters' : 'Enter your password'}
              className="w-full bg-[#0F172A] border border-slate-700 text-xs text-white rounded-lg px-3.5 py-3 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 font-mono transition-colors"
            />
          </div>

          {loginError && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="p-3 bg-red-950/40 border border-red-900/60 rounded-lg text-xs text-red-400 flex items-start gap-2"
            >
              <AlertTriangle size={15} className="mt-0.5 shrink-0" />
              <span>{loginError}</span>
            </motion.div>
          )}

          {notice && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="p-3 bg-emerald-950/40 border border-emerald-900/60 rounded-lg text-xs text-emerald-400 flex items-start gap-2"
            >
              <span>{notice}</span>
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
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <Play size={13} fill="currentColor" />
                <span>{mode === 'signin' ? 'Initialize Terminal Session' : 'Create Account'}</span>
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
          Authentication and sessions are managed securely by Supabase Auth. New accounts require administrator verification.
        </motion.div>
      </motion.div>
    </div>
  );
}