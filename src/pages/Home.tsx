import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Search, Radar, Zap, ArrowRight, Users, TrendingUp } from 'lucide-react';

const stats = [
  { label: 'Businesses Scanned', value: '10,000+' },
  { label: 'Leads Generated', value: '5,000+' },
  { label: 'Active Agencies', value: '500+' },
  { label: 'Nigerian States', value: '37' },
];

const features = [
  {
    icon: Search,
    title: 'Nigerian Directory Scanner',
    desc: 'Scans VConnect, BusinessList.ng and more using Google-grounded Gemini AI — finds businesses without websites across all 37 states.',
  },
  {
    icon: Users,
    title: 'CRM Pipeline Manager',
    desc: 'Track leads from New → Contacted → Qualified → Closed. Add notes, filter by status, and export to CSV.',
  },
  {
    icon: Zap,
    title: 'Privyr CRM Integration',
    desc: 'Push leads directly to Privyr with one click. Auto-sync to your mobile CRM and get instant notifications.',
  },
  {
    icon: TrendingUp,
    title: 'Smart Enrichment',
    desc: 'Gemini AI enriches each lead with contact emails using Google Search grounding — no manual research needed.',
  },
];

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden px-4">
        <div className="absolute inset-0 bg-[#0A0F1E]" />
        <div className="absolute top-1/4 -left-32 h-[500px] w-[500px] rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="absolute bottom-1/4 -right-32 h-[500px] w-[500px] rounded-full bg-blue-500/10 blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:24px_24px]" />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-bold tracking-wider uppercase mb-6">
              <Radar size={14} />
              Lead Discovery Engine v2.0
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.05] mb-6"
          >
            <span className="text-white">Discover Businesses Without Websites.<br /></span>
            <span className="bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Win Them as Clients.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            LeadFlow Nigeria is the autonomous lead scraper that finds physical Nigerian businesses 
            with no website — then prepares them for your custom web design pitch. Powered by Gemini AI.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <button
              onClick={() => navigate('/login')}
              className="group relative px-10 py-4 bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-400 hover:to-blue-500 text-white font-bold text-sm rounded-xl transition-all duration-300 flex items-center gap-2 mx-auto shadow-xl shadow-emerald-900/30 active:scale-[0.97]"
            >
              <span>Start Scanning Now</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Stats Bar */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6 }}
        className="relative border-y border-slate-800/60 bg-[#0c1424]"
      >
        <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="text-center"
            >
              <p className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-1">
                {stat.value}
              </p>
              <p className="text-xs text-slate-500 font-mono uppercase tracking-wider">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Features Grid */}
      <section className="relative py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span className="text-xs font-mono font-bold tracking-widest text-blue-400 uppercase bg-blue-500/10 px-3 py-1.5 rounded-full border border-blue-500/20">
              Everything You Need
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight mt-4 mb-4">
              Built for Nigerian Lead Generation
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              From discovery to close — one platform that handles the entire pipeline.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.5, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className="group bg-[#1E293B]/50 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="h-12 w-12 rounded-xl bg-blue-600/10 text-blue-400 border border-blue-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Icon size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{feature.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 px-4 border-t border-slate-800/60">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/5 to-transparent" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 max-w-3xl mx-auto text-center"
        >
          <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
            Ready to Find Your Next Client?
          </h2>
          <p className="text-slate-400 mb-8 max-w-lg mx-auto">
            Start scanning Nigerian directories. Discover businesses that need your web design services today.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="px-10 py-4 bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-400 hover:to-blue-500 text-white font-bold text-sm rounded-xl transition-all duration-300 flex items-center gap-2 mx-auto shadow-lg shadow-blue-900/30 active:scale-[0.97]"
          >
            <Zap size={18} />
            <span>Launch Lead Scanner</span>
            <ArrowRight size={16} />
          </button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-600 font-mono">
            LeadFlow Nigeria &copy; {new Date().getFullYear()} &mdash; Autonomous Lead Scraper &amp; Pitcher Code Tool
          </p>
          <div className="flex items-center gap-4 text-xs text-slate-600 font-mono">
            <span>Powered by Gemini AI</span>
            <span className="w-1 h-1 rounded-full bg-slate-700" />
            <span>Made in Nigeria</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
