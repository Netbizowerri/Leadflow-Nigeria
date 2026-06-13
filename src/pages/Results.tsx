/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';
import { Lead } from '../types';
import LeadCard from '../components/LeadCard';
import { 
  Sparkles, 
  ArrowLeftRight, 
  Send,
  Trash2,
  BookmarkCheck,
  Search,
  ListFilter,
  CheckSquare,
  Square,
  AlertCircle,
  HelpCircle,
  TrendingDown
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ResultsPageProps {
  activeResults: Lead[];
  setActiveResults: (leads: Lead[]) => void;
}

export default function ResultsPage({ activeResults, setActiveResults }: ResultsPageProps) {
  const { claimLeadAndSendToCRM, bulkSendToCRM, claimedLeadIds, blockedLeadPhones, blockLead } = useApp();
  const navigate = useNavigate();

  // Filter input states
  const [searchTerm, setSearchTerm] = useState('');
  const [minRating, setMinRating] = useState<number>(0);
  const [onlyWithEmail, setOnlyWithEmail] = useState(false);
  const [noWebsiteOnly, setNoWebsiteOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'rating' | 'reviews' | 'name'>('rating');

  // Multi-selectable lead indexes
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [bulkSending, setBulkSending] = useState(false);
  const [bulkMessage, setBulkMessage] = useState('');

  // FILTER OUT CLAIMED LEADS + BLOCKED LEADS
  const availableResults = useMemo(() => {
    return activeResults.filter(l => !claimedLeadIds.includes(l.id) && !blockedLeadPhones.includes(l.phone));
  }, [activeResults, claimedLeadIds, blockedLeadPhones]);

  // Apply search/sorting/filtering parameters
  const filteredResults = useMemo(() => {
    const list = availableResults.filter(lead => {
      const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.category.toLowerCase().includes(searchTerm.toLowerCase());
        
      const matchesRating = lead.rating ? lead.rating >= minRating : minRating === 0;
      const matchesEmail = onlyWithEmail ? Boolean(lead.email) : true;
      const matchesNoWebsite = noWebsiteOnly ? lead.hasWebsite === false : true;

      return matchesSearch && matchesRating && matchesEmail && matchesNoWebsite;
    });

    // Sorting
    return [...list].sort((a, b) => {
      if (sortBy === 'rating') {
        return (b.rating || 0) - (a.rating || 0);
      }
      if (sortBy === 'reviews') {
        return (b.userRatingsTotal || 0) - (a.userRatingsTotal || 0);
      }
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });
  }, [availableResults, searchTerm, minRating, onlyWithEmail, sortBy]);

  // Bulk selectors
  const allSelected = filteredResults.length > 0 && selectedLeadIds.length === filteredResults.length;
  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedLeadIds([]);
    } else {
      setSelectedLeadIds(filteredResults.map(l => l.id));
    }
  };

  const toggleSelectLead = (id: string) => {
    setSelectedLeadIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleBulkSend = async () => {
    if (selectedLeadIds.length === 0) return;
    setBulkSending(true);
    setBulkMessage('');

    const targetLeads = availableResults.filter(l => selectedLeadIds.includes(l.id));
    
    try {
      const results = await bulkSendToCRM(targetLeads);
      // Success triggers, clear selections
      setSelectedLeadIds([]);
      setBulkMessage(`Successfully delivered ${results.successCount} leads to your integrated CRM accounts.`);
      setTimeout(() => setBulkMessage(''), 4500);
    } catch (err: any) {
      console.error(err);
      setBulkMessage('Failed bulk delivery sync.');
    } finally {
      setBulkSending(false);
    }
  };

  const clearCurrentSession = () => {
    setActiveResults([]);
    setSelectedLeadIds([]);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-6 max-w-7xl mx-auto py-4"
    >
      {/* Session Header Navigation Panel */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-[#1E293B] pb-6 gap-4">
        <div>
          <span className="text-xs font-mono font-medium text-blue-400">ACTIVE SCRAPING DISCOVERIES</span>
          <h2 className="font-sora text-3xl font-extrabold text-white tracking-tight flex items-center gap-2 mt-1">
            <span>Scan Results Session Workspace</span>
            <span className="text-xs font-mono text-emerald-400 font-bold border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 rounded-full uppercase leading-none">
              {availableResults.length} Exclusive Leads Available
            </span>
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Website-less leads discovered during your current session. Sync results to Privyr to claim them permanently.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button 
            type="button"
            onClick={() => navigate('/search')}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-gray-300 font-medium rounded-lg text-xs transition duration-150"
          >
            ← Scan New Target
          </button>
          
          {activeResults.length > 0 && (
            <button 
              type="button"
              onClick={clearCurrentSession}
              className="px-4 py-2 bg-[#1E293B] hover:bg-red-950/20 hover:text-red-400 hover:border-red-900/60 border border-slate-800 text-gray-400 font-medium rounded-lg text-xs transition duration-150"
            >
              Clear Session
            </button>
          )}
        </div>
      </div>

      {activeResults.length === 0 ? (
        /* Empty layout */
        <div className="text-center py-20 bg-[#1E293B] rounded-xl border border-slate-800 max-w-md mx-auto p-8 shadow-md">
          <div className="h-16 w-16 bg-blue-600/10 text-blue-500 border border-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles size={28} className="animate-pulse" />
          </div>
          <h3 className="font-sora text-lg font-semibold text-white">No active lead session found</h3>
          <p className="text-sm text-slate-400 mt-2 leading-relaxed">
            Configure your target sector and location, then trigger the scraping engine to extract high-quality prospects.
          </p>
          <button 
            onClick={() => navigate('/search')}
            className="mt-6 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 px-5 rounded-lg text-sm transition duration-150"
          >
            Open Active Scanner
          </button>
        </div>
      ) : availableResults.length === 0 ? (
        /* All leads claimed */
        <div className="text-center py-16 bg-[#162030] rounded-xl border border-slate-850 max-w-lg mx-auto p-8 shadow-xl">
          <div className="h-16 w-16 bg-emerald-600/10 text-emerald-400 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookmarkCheck size={32} />
          </div>
          <h3 className="font-sora text-xl font-bold text-white">All exclusive leads claimed!</h3>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            Outstanding! 100% of the leads resolved in this session have been sent to your integrated CRM boards and marked as claimed.
          </p>
          <div className="flex justify-center gap-3 mt-6">
            <button 
              onClick={() => navigate('/leads')}
              className="bg-sky-900/50 hover:bg-sky-900 hover:text-white border border-sky-850 px-5 py-2.5 rounded-lg text-sm font-semibold transition"
            >
              Go to CRM Board
            </button>
            <button 
              onClick={() => navigate('/search')}
              className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition"
            >
              Scan Another Sector
            </button>
          </div>
        </div>
      ) : (
        /* Results Table and Workspace Grid */
        <div className="space-y-6">
          {/* Quick Filters Toolkit Panel */}
          <div className="bg-[#1E293B] border border-slate-800 rounded-xl p-5 shadow-md grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            {/* Search inputs */}
            <div className="md:col-span-4 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input
                type="text"
                placeholder="Query name, category, city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#0F172A] border border-slate-705 text-xs text-white rounded-lg pl-9 pr-4 py-2.5 focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Ratings Filter */}
            <div className="md:col-span-3 flex items-center gap-2">
              <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider whitespace-nowrap">Rating:</span>
              <select
                value={minRating}
                onChange={(e) => setMinRating(Number(e.target.value))}
                className="w-full bg-[#0F172A] border border-slate-705 text-xs text-white rounded-lg px-2 py-2.5 font-medium"
              >
                <option value={0}>All ratings</option>
                <option value={4.5}>Outstanding (4.5+ ★)</option>
                <option value={4.0}>High (4.0+ ★)</option>
                <option value={3.5}>Moderate (3.5+ ★)</option>
              </select>
            </div>

            {/* Sort Order selection */}
            <div className="md:col-span-3 flex items-center gap-2">
              <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider whitespace-nowrap">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full bg-[#0F172A] border border-slate-750 text-xs text-white rounded-lg px-2 py-2.5 font-semibold"
              >
                <option value="rating">Rating (Highest)</option>
                <option value="reviews">Total Reviews</option>
                <option value="name">Alphabetical (A-Z)</option>
              </select>
            </div>

            {/* Filter Checkboxes panel */}
            <div className="md:col-span-2 flex flex-col gap-2">
              <label className="flex items-center space-x-2 text-xs text-slate-300 font-mono select-none cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={onlyWithEmail}
                  onChange={(e) => setOnlyWithEmail(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-850 text-blue-500" 
                />
                <span>Email Available</span>
              </label>
              <label className="flex items-center space-x-2 text-xs text-amber-400 font-mono select-none cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={noWebsiteOnly}
                  onChange={(e) => setNoWebsiteOnly(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-850 text-amber-500" 
                />
                <span>No Website Only</span>
              </label>
            </div>
          </div>

          {/* Bulk Sync Controls Status Header */}
          <div className="bg-[#1e2e4a]/40 border border-blue-900/40 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-3">
              <button 
                onClick={toggleSelectAll} 
                className="text-slate-400 hover:text-white p-1 rounded transition bg-slate-900 border border-slate-800"
                title={allSelected ? "Deselect All" : "Select All"}
              >
                {allSelected ? <CheckSquare size={16} className="text-blue-400" /> : <Square size={16} />}
              </button>
              
              <div className="text-xs">
                <p className="font-semibold text-white">
                  Bulk Actions Board
                </p>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                  {selectedLeadIds.length} of {filteredResults.length} leads selected for synchronization
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {selectedLeadIds.length > 0 && (
                <button
                  onClick={handleBulkSend}
                  disabled={bulkSending}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2.5 rounded-lg flex items-center gap-1.5 transition duration-150 active:scale-95 disabled:opacity-50"
                >
                  {bulkSending ? (
                    <>
                      <div className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Syncing bulk leads...</span>
                    </>
                  ) : (
                    <>
                      <Send size={12} fill="currentColor" />
                      <span>Sync {selectedLeadIds.length} Selected with Privyr CRM</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {bulkMessage && (
            <div className="p-3.5 bg-emerald-950/40 border border-emerald-900 text-emerald-400 rounded-lg text-xs flex items-center gap-2">
              <BookmarkCheck size={16} />
              <span>{bulkMessage}</span>
            </div>
          )}

          {/* Leads Grid list */}
          {filteredResults.length === 0 ? (
            <div className="text-center py-16 bg-slate-900/40 border border-slate-800 rounded-xl max-w-md mx-auto p-6">
              <AlertCircle className="mx-auto text-slate-500 mb-3" size={24} />
              <p className="text-xs text-slate-400 font-mono">No matching leads found checking your filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResults.map((lead) => {
                const isSelected = selectedLeadIds.includes(lead.id);
                return (
                  <div key={lead.id} className="relative">
                    {/* Visual selection tick indicator */}
                    <button
                      onClick={() => toggleSelectLead(lead.id)}
                      className={`
                        absolute top-4 left-4 z-20 p-1.5 rounded-lg border transition duration-150
                        ${isSelected
                          ? 'bg-blue-600 border-blue-500 text-white'
                          : 'bg-slate-900/60 border-slate-700/50 text-slate-400 hover:text-white'}
                      `}
                    >
                      {isSelected ? <CheckSquare size={13} /> : <Square size={13} />}
                    </button>

                    <LeadCard
                      lead={lead}
                      onSendToCRM={claimLeadAndSendToCRM}
                      isClaimed={claimedLeadIds.includes(lead.id)}
                      onReject={blockLead}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
