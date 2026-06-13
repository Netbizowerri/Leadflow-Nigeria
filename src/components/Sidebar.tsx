import { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  Search, 
  Layers, 
  Database, 
  Webhook, 
  LogOut, 
  Menu, 
  X,
  User,
  Home,
  ShieldCheck,
  Globe
} from 'lucide-react';

export default function Sidebar() {
  const { logout, privyrWebhookUrl, customWebhookUrl } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const hasWebhook = Boolean(privyrWebhookUrl || customWebhookUrl);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isHome = location.pathname === '/';

  const navItems = [
    { to: '/search', label: 'Lead Scanner', icon: Search },
    { to: '/results', label: 'Scan Results', icon: Layers },
    { to: '/leads', label: 'CRM Pipeline', icon: Database },
    { to: '/webhook', label: 'Webhook Setup', icon: Webhook },
  ];

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-[#0F172A] border-b border-[#1E293B] fixed top-0 w-full z-50">
        <div className="flex items-center space-x-2">
          <div className="relative flex h-3 w-3 items-center justify-center">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </div>
          <span className="font-sora font-bold text-lg text-white tracking-tight">
            LeadFlow <span className="text-emerald-500">NG</span>
          </span>
        </div>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="text-gray-400 hover:text-white p-2"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 bg-[#0F172A] border-r border-[#1E293B] w-64 z-50 
        transform md:transform-none transition-transform duration-300 ease-in-out
        flex flex-col justify-between pt-16 md:pt-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div>
          <div className="hidden md:flex items-center space-x-3 px-6 py-6 border-b border-[#1E293B]">
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-500/20 to-blue-600/20 text-emerald-400 border border-emerald-500/20">
              <Globe size={22} />
            </div>
            <div>
              <h1 className="font-sora font-semibold text-base text-white tracking-tight leading-none">
                LeadFlow Nigeria
              </h1>
              <span className="text-[10px] text-gray-500 font-mono tracking-wider">
                LEADS AGENT Pro
              </span>
            </div>
          </div>

          <div className="px-4 py-4 border-b border-[#1E293B]/60 bg-[#0c1424]">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400 flex items-center gap-1.5 font-mono">
                <Globe size={12} className="text-emerald-400" /> Gemini AI Scanner
              </span>
              <span className="text-emerald-500 font-bold flex items-center gap-1">
                <ShieldCheck size={12} /> Active
              </span>
            </div>
            <div className="flex items-center justify-between text-xs mt-2">
              <span className="text-gray-400 flex items-center gap-1.5 font-mono">
                <Webhook size={12} className="text-purple-400" /> Privyr CRM Sync
              </span>
              {hasWebhook ? (
                <span className="text-emerald-500 font-bold flex items-center gap-1">
                  <ShieldCheck size={12} /> Live
                </span>
              ) : (
                <span className="text-gray-500 flex items-center gap-1">
                  None
                </span>
              )}
            </div>
          </div>

          <nav className="px-4 py-4 space-y-1">
            {!isHome && (
              <NavLink
                to="/"
                onClick={() => setIsOpen(false)}
                className="flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition duration-150 text-gray-400 hover:bg-[#1E293B]/50 hover:text-white"
              >
                <Home size={18} />
                <span>Home</span>
              </NavLink>
            )}
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) => `
                    flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition duration-150
                    ${isActive 
                      ? 'bg-emerald-600/10 text-emerald-400 border-l-2 border-emerald-500 font-semibold' 
                      : 'text-gray-400 hover:bg-[#1E293B]/50 hover:text-white'}
                  `}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-[#1E293B] bg-[#0c1424]">
          <div className="flex items-center space-x-3 mb-4">
            <div className="h-9 w-9 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center font-bold">
              <User size={16} />
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-white truncate">netbiz0925@gmail.com</p>
              <p className="text-[10px] text-emerald-500 font-mono">Developer</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-[#1E293B] bg-slate-900 hover:bg-red-950/40 hover:border-red-900/50 hover:text-red-400 rounded-lg text-sm text-gray-400 font-medium transition duration-150"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
