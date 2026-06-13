import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Lead } from '../types';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Star, 
  ExternalLink,
  ChevronRight,
  Globe,
  Share2,
  CheckCircle,
  Copy,
  XCircle
} from 'lucide-react';

interface LeadCardProps {
  lead: Lead;
  onSendToCRM: (lead: Lead) => Promise<boolean>;
  isClaimed: boolean;
  onReject?: (lead: Lead) => void;
}

export default function LeadCard({ lead, onSendToCRM, isClaimed, onReject }: LeadCardProps) {
  const [sending, setSending] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  const handleCopyPhone = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(lead.phone);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  const handleCopyEmail = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lead.email) {
      navigator.clipboard.writeText(lead.email);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    }
  };

  const handleSendCRM = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isClaimed || sentSuccess) return;
    setSending(true);
    try {
      const ok = await onSendToCRM(lead);
      if (ok) {
        setSentSuccess(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const mapsSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lead.name + ' ' + lead.address)}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={`
        relative bg-[#1E293B] border rounded-xl overflow-hidden shadow-md transition-all duration-300 flex flex-col justify-between h-full group
        ${isClaimed || sentSuccess 
          ? 'border-emerald-500/30 opacity-60' 
          : 'border-slate-800 hover:border-slate-700 hover:shadow-xl hover:-translate-y-0.5'}
      `}
    >
      <div className={`h-1.5 w-full ${isClaimed || sentSuccess ? 'bg-emerald-500' : 'bg-gradient-to-r from-emerald-500 to-blue-600'}`} />

      <div className="p-5 flex-grow">
        <div className="flex items-center justify-between mb-3">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            No Website Detected
          </span>
          <span className="text-[10px] text-gray-400 font-mono font-medium bg-slate-800 px-2 py-0.5 rounded uppercase border border-slate-700/60 flex items-center gap-1">
            <Globe size={10} className="text-gray-400" />
            {lead.source}
          </span>
        </div>

        <h3 className="font-sora font-semibold text-lg text-white tracking-tight leading-snug group-hover:text-emerald-400 transition duration-150 mb-1">
          {lead.name}
        </h3>

        <p className="text-xs text-emerald-400/80 font-mono font-medium mb-3 uppercase tracking-wider">
          {lead.category}
        </p>

        {lead.rating && (
          <div className="flex items-center space-x-1 mb-4">
            <div className="flex items-center text-amber-500">
              <Star size={12} fill="currentColor" />
              <span className="text-xs font-bold text-white ml-1">{lead.rating}</span>
            </div>
            {lead.userRatingsTotal && (
              <span className="text-xs text-slate-500 font-mono">
                ({lead.userRatingsTotal} reviews)
              </span>
            )}
          </div>
        )}

        <div className="space-y-2 text-xs border-t border-[#1E293B]/80 pt-3 text-slate-300">
          <div className="flex items-start space-x-2">
            <MapPin size={14} className="text-slate-500 shrink-0 mt-0.5" />
            <span className="line-clamp-2 leading-relaxed">{lead.address}</span>
          </div>

          <div className="flex items-center justify-between group/row">
            <div className="flex items-center space-x-2">
              <Phone size={14} className="text-slate-500 shrink-0" />
              <a href={`tel:${lead.phone}`} className="hover:text-emerald-400 transition hover:underline font-mono font-semibold">
                {lead.phone}
              </a>
            </div>
            <button 
              onClick={handleCopyPhone} 
              title="Copy Phone to Clipboard"
              className="text-slate-500 hover:text-white p-1 rounded hover:bg-slate-800 transition"
            >
              {copiedPhone ? <span className="text-[10px] text-emerald-400 font-bold font-mono">Copied!</span> : <Copy size={12} />}
            </button>
          </div>

          <div className="flex items-center justify-between group/row min-h-6">
            <div className="flex items-center space-x-2 max-w-[80%]">
              <Mail size={14} className="text-slate-500 shrink-0" />
              {lead.email ? (
                <a href={`mailto:${lead.email}`} className="hover:text-emerald-400 transition hover:underline font-mono truncate">
                  {lead.email}
                </a>
              ) : (
                <span className="text-slate-500 font-mono italic text-[11px]">Email unlisted (ready to pitch)</span>
              )}
            </div>
            {lead.email && (
              <button 
                onClick={handleCopyEmail} 
                title="Copy Email to Clipboard"
                className="text-slate-500 hover:text-white p-1 rounded hover:bg-slate-800 transition"
              >
                {copiedEmail ? <span className="text-[10px] text-emerald-400 font-bold font-mono">Copied!</span> : <Copy size={12} />}
              </button>
            )}
          </div>

          <div className="mt-4 bg-[#0F172A]/45 border border-slate-800/60 p-3 rounded-lg">
            <h5 className="text-[10px] font-mono font-bold tracking-wider text-slate-500 uppercase mb-1">
              Sales Pitch Insights
            </h5>
            <p className="text-[11px] text-slate-400 leading-relaxed italic">
              {lead.notes || "Lacks any custom web platform or SEO optimizations. High conversion potential for a professional business portal."}
            </p>
          </div>
        </div>
      </div>

      <div className="px-5 py-4 border-t border-slate-800/60 bg-[#162030] flex items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <a 
            href={mapsSearchUrl} 
            target="_blank" 
            rel="noreferrer"
            className="text-slate-400 hover:text-white border border-slate-700/80 bg-slate-900/60 hover:bg-slate-900 px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition duration-150 cursor-pointer"
          >
            <ExternalLink size={13} />
            <span>Verify Map</span>
          </a>
          {onReject && (
            <button
              onClick={(e) => { e.stopPropagation(); onReject(lead); }}
              title="Reject and block this lead permanently"
              className="text-slate-500 hover:text-red-400 border border-slate-700/80 bg-slate-900/60 hover:bg-red-950/20 hover:border-red-900/60 px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition duration-150"
            >
              <XCircle size={13} />
              <span>Reject</span>
            </button>
          )}
        </div>

        {isClaimed || sentSuccess ? (
          <button 
            disabled 
            className="flex-1 bg-emerald-950/40 text-emerald-400 border border-emerald-900/60 px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-not-allowed"
          >
            <CheckCircle size={14} />
            <span>CRM Synced</span>
          </button>
        ) : (
          <button 
            onClick={handleSendCRM}
            disabled={sending}
            className="flex-grow bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 text-white font-semibold py-2 px-3 rounded-lg text-xs transition-all duration-300 flex items-center justify-center gap-1.5 shadow-md shadow-emerald-900/30 active:scale-95"
          >
            {sending ? (
              <>
                <div className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Syncing...</span>
              </>
            ) : (
              <>
                <span>Send to Privyr</span>
                <ChevronRight size={14} />
              </>
            )}
          </button>
        )}
      </div>
    </motion.div>
  );
}
