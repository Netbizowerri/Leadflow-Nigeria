/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';
import { Lead, LeadStatus } from '../types';
import { 
  Download, 
  Plus, 
  Trash2, 
  CheckCircle, 
  Search, 
  FileSpreadsheet, 
  MessageSquare,
  ClipboardList,
  ChevronRight,
  Sparkles,
  PhoneCall,
  Menu,
  Briefcase,
  AlertCircle
} from 'lucide-react';

const STATUS_OPTIONS: LeadStatus[] = ['New', 'Contacted', 'Qualified', 'Closed', 'Not Interested'];

export default function LeadsPage() {
  const { leads, updateLeadStatus, updateLeadNotes, deleteLead, addLeadManual } = useApp();

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'date' | 'rating' | 'name'>('date');

  // Manual entry modal/form states
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualPhone, setManualPhone] = useState('');
  const [manualEmail, setManualEmail] = useState('');
  const [manualAddress, setManualAddress] = useState('');
  const [manualCategory, setManualCategory] = useState('Real Estate Agent');
  const [manualNotes, setManualNotes] = useState('');
  const [manualError, setManualError] = useState('');

  // Editing notes state
  const [editingLeadId, setEditingLeadId] = useState<string | null>(null);
  const [tempNotes, setTempNotes] = useState('');

  // Filtered and sorted list
  const filteredLeads = useMemo(() => {
    const list = leads.filter(lead => {
      const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.phone.includes(searchTerm) ||
        (lead.email && lead.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        lead.address.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'All' ? true : lead.status === statusFilter;

      return matchesSearch && matchesStatus;
    });

    return [...list].sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
      }
      if (sortBy === 'rating') {
        return (b.rating || 0) - (a.rating || 0);
      }
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });
  }, [leads, searchTerm, statusFilter, sortBy]);

  // Statistics
  const stats = useMemo(() => {
    const total = leads.length;
    const isNew = leads.filter(l => l.status === 'New').length;
    const contacted = leads.filter(l => l.status === 'Contacted').length;
    const qualified = leads.filter(l => l.status === 'Qualified').length;
    const closed = leads.filter(l => l.status === 'Closed').length;
    return { total, isNew, contacted, qualified, closed };
  }, [leads]);

  // CSV Exporter logic
  const handleExportCSV = () => {
    if (leads.length === 0) return;

    // Helper to sanitize fields to valid CSV format
    const clean = (val: string | number | null | undefined) => {
      if (val === undefined || val === null) return '""';
      const str = String(val).replace(/"/g, '""'); // escape double-quotes
      return `"${str}"`;
    };

    const headers = [
      'Name',
      'Phone Number',
      'Email Address',
      'Physical Address',
      'GMP Rating',
      'Reviews Count',
      'Industry Category',
      'Discovery Date',
      'Developer Lead Status',
      'Scraping Source Directory',
      'Outreach Pitch Notes'
    ];

    const rows = leads.map(lead => [
      clean(lead.name),
      clean(lead.phone),
      clean(lead.email || 'N/A'),
      clean(lead.address),
      clean(lead.rating || 'N/A'),
      clean(lead.userRatingsTotal || 'N/A'),
      clean(lead.category),
      clean(new Date(lead.dateAdded).toLocaleDateString()),
      clean(lead.status),
      clean(lead.source),
      clean(lead.notes)
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Trigger atomic browser download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `LeadFlow-Nigeria-Leads-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Submit manual input lead callback
  const handleAddManualLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setManualError('');

    if (!manualName.trim() || !manualPhone.trim() || !manualAddress.trim()) {
      setManualError('Name, Phone Number, and Address fields are mandatory.');
      return;
    }

    addLeadManual({
      name: manualName.trim(),
      phone: manualPhone.trim(),
      email: manualEmail.trim() || null,
      address: manualAddress.trim(),
      category: manualCategory.trim(),
      notes: manualNotes.trim() || 'Manually logged independent lead discovery.',
      source: 'Manual',
      rating: null,
      userRatingsTotal: null
    });

    // Reset fields
    setManualName('');
    setManualPhone('');
    setManualEmail('');
    setManualAddress('');
    setManualNotes('');
    setShowManualForm(false);
  };

  const handleStartEditingNotes = (lead: Lead) => {
    setEditingLeadId(lead.id);
    setTempNotes(lead.notes || '');
  };

  const handleSaveNotes = (id: string) => {
    updateLeadNotes(id, tempNotes);
    setEditingLeadId(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-6 max-w-7xl mx-auto py-4"
    >
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-[#1E293B] pb-6 gap-4">
        <div>
          <span className="text-xs font-mono font-medium text-[#10B981]">DURABLE CRM LOGS</span>
          <h2 className="font-sora text-3xl font-extrabold text-white tracking-tight flex items-center gap-2 mt-1">
            <span>Client Pipelines Board</span>
            <span className="text-xs font-mono text-emerald-400 font-bold border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 rounded-full uppercase leading-none">
              {leads.length} Saved Leads
            </span>
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Manage your warm client opportunities. Customize outreach pitches, track follow ups, and export to CSV.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowManualForm(!showManualForm)}
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2.5 rounded-lg flex items-center gap-1.5 transition duration-150 active:scale-95 shadow-md shadow-blue-900/30"
          >
            <Plus size={14} />
            <span>Add Manual Lead</span>
          </button>
          
          {leads.length > 0 && (
            <button
              onClick={handleExportCSV}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 text-emerald-400 text-xs font-bold px-4 py-2.5 rounded-lg flex items-center gap-1.5 transition duration-150"
            >
              <FileSpreadsheet size={14} />
              <span>Export CSV Sheets</span>
            </button>
          )}
        </div>
      </div>

      {/* Manual Input Leads Draw Panel */}
      {showManualForm && (
        <div className="bg-[#1E293B] border border-slate-800 rounded-xl p-6 shadow-xl max-w-2xl mx-auto">
          <h3 className="font-sora font-semibold text-base text-white mb-4">Add Manual Client Entry</h3>
          <form onSubmit={handleAddManualLeadSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1 font-bold">Business Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ikeja Dental Clinic"
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  className="w-full bg-[#0F172A] border border-slate-750 rounded-lg text-xs text-white px-3 py-2.5 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1 font-bold">Phone Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. +234 812 345 6789"
                  value={manualPhone}
                  onChange={(e) => setManualPhone(e.target.value)}
                  className="w-full bg-[#0F172A] border border-slate-750 rounded-lg text-xs text-white px-3 py-2.5 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1 font-bold">Email Address (Optional)</label>
                <input
                  type="email"
                  placeholder="e.g. sales@ikejadental.com"
                  value={manualEmail}
                  onChange={(e) => setManualEmail(e.target.value)}
                  className="w-full bg-[#0F172A] border border-slate-750 rounded-lg text-xs text-white px-3 py-2.5 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1 font-bold">Category Sector</label>
                <input
                  type="text"
                  placeholder="e.g. Healthcare, Dental Care"
                  value={manualCategory}
                  onChange={(e) => setManualCategory(e.target.value)}
                  className="w-full bg-[#0F172A] border border-slate-750 rounded-lg text-xs text-white px-3 py-2.5 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1 font-bold">Physical Address *</label>
              <input
                type="text"
                required
                placeholder="e.g. 78 Allen Avenue, Ikeja, Lagos"
                value={manualAddress}
                onChange={(e) => setManualAddress(e.target.value)}
                className="w-full bg-[#0F172A] border border-slate-750 rounded-lg text-xs text-white px-3 py-2.5 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1 font-bold">Sales Analysis & Notes</label>
              <textarea
                placeholder="Write custom outreach strategy details..."
                value={manualNotes}
                onChange={(e) => setManualNotes(e.target.value)}
                rows={3}
                className="w-full bg-[#0F172A] border border-slate-755 rounded-lg text-xs text-white px-3 py-2.5 focus:border-blue-500 focus:outline-none"
              />
            </div>

            {manualError && (
              <p className="text-xs text-red-400 font-mono font-semibold">{manualError}</p>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowManualForm(false)}
                className="px-4 py-2 border border-slate-700 bg-slate-800 hover:bg-slate-700 text-gray-300 font-medium rounded-lg text-xs transition duration-150"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs transition duration-150"
              >
                Add Lead Entry
              </button>
            </div>
          </form>
        </div>
      )}

      {/* High-Fidelity Mini CRM Stats Panel */}
      {leads.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { tag: 'Total Scraped', val: stats.total, border: 'border-slate-800', text: 'text-white' },
            { tag: 'New Opportunities', val: stats.isNew, border: 'border-blue-900/30', text: 'text-blue-400' },
            { tag: 'Contacted Pitching', val: stats.contacted, border: 'border-amber-900/30', text: 'text-amber-400' },
            { tag: 'Qualified Leads', val: stats.qualified, border: 'border-purple-900/30', text: 'text-purple-400' },
            { tag: 'Closed Contracts', val: stats.closed, border: 'border-emerald-900/30', text: 'text-emerald-400' }
          ].map((card, idx) => (
            <div key={idx} className={`bg-[#0F172A] border ${card.border} rounded-xl p-4 shadow-sm text-center`}>
              <p className="text-[10px] font-mono tracking-widest uppercase text-slate-500 font-semibold mb-1">
                {card.tag}
              </p>
              <span className={`text-2xl font-extrabold ${card.text}`}>
                {card.val}
              </span>
            </div>
          ))}
        </div>
      )}

      {leads.length === 0 ? (
        /* Empty Leads Database */
        <div className="text-center py-20 bg-[#1E293B] rounded-xl border border-slate-800 max-w-md mx-auto p-8 shadow-sm">
          <div className="h-16 w-16 bg-slate-900 text-slate-500 border border-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <ClipboardList size={26} />
          </div>
          <h3 className="font-sora text-base font-semibold text-white">Your Database is empty</h3>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            Your saved prospects will populate here. Use the Scanning Engine to search and synchronise results with Privyr or export spreadsheets.
          </p>
        </div>
      ) : (
        /* CRM Leads Dashboard display */
        <div className="space-y-4">
          {/* Filters Toolkit row */}
          <div className="bg-[#1E293B] border border-slate-850 rounded-xl p-4 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative flex-grow max-w-md w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
              <input
                type="text"
                placeholder="Search leads database (name, phone, landmark)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#0F172A] border border-slate-750 text-xs text-white rounded-lg pl-9 pr-4 py-2.5 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-1.5 flex-1 min-w-[120px]">
                <span className="text-[10px] font-mono text-slate-500 uppercase font-bold text-slate-400">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full bg-[#0F172A] border border-slate-750 text-xs text-white rounded-lg px-2 py-2 focus:border-blue-500 focus:outline-none font-medium"
                >
                  <option value="All">All statuses</option>
                  {STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>

              <div className="flex items-center gap-1.5 flex-1 min-w-[120px]">
                <span className="text-[10px] font-mono text-slate-500 uppercase font-bold text-slate-400">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full bg-[#0F172A] border border-slate-750 text-xs text-white rounded-lg px-2 py-2 focus:border-blue-500 focus:outline-none font-medium"
                >
                  <option value="date">Date Discovery</option>
                  <option value="rating">Google Rating</option>
                  <option value="name">Alphabetical</option>
                </select>
              </div>
            </div>
          </div>

          {/* CRM Leads List Display */}
          <div className="bg-[#1E293B] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#0F172A]/70 text-[10px] font-mono text-slate-400 uppercase tracking-wider border-b border-slate-800">
                    <th className="py-3 px-4">Contact Business</th>
                    <th className="py-3 px-4">Landmark location</th>
                    <th className="py-3 px-4">Source Origin</th>
                    <th className="py-3 px-4">Outreach Status</th>
                    <th className="py-3 px-4">Custom Pitch insights & notes</th>
                    <th className="py-3 px-4 text-right">Delete</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-xs">
                  {filteredLeads.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-10 text-slate-500 font-mono italic">
                        No clients matching your active filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredLeads.map((lead) => (
                      <tr key={lead.id} className="hover:bg-[#151f30]/40 transition duration-150">
                        {/* Name on maps and category, phone, email */}
                        <td className="py-4 px-4 max-w-xs">
                          <h4 className="font-bold text-sm text-white">{lead.name}</h4>
                          <span className="text-[10px] font-mono text-gray-500 mt-0.5 bg-slate-900 px-1.5 py-0.5 rounded inline-block select-all uppercase">
                            {lead.category}
                          </span>
                          <div className="mt-1.5 space-y-0.5 font-mono text-[11px] text-slate-350">
                            <p className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-500">P:</span> {lead.phone}
                            </p>
                            {lead.email && (
                              <p className="flex items-center gap-1.5">
                                <span className="font-bold text-slate-500">M:</span> {lead.email}
                              </p>
                            )}
                          </div>
                        </td>

                        {/* Landmark location */}
                        <td className="py-4 px-4 text-slate-300 max-w-xs pr-6">
                          <p className="line-clamp-2 leading-relaxed">{lead.address}</p>
                          {lead.rating && (
                            <span className="text-[10px] font-mono text-amber-500 flex items-center gap-1 mt-1 font-bold">
                              ★ {lead.rating} ({lead.userRatingsTotal || 0} reviews)
                            </span>
                          )}
                        </td>

                        {/* Source Directory origin */}
                        <td className="py-4 px-4 text-slate-400 font-mono text-[10px]">
                          <span className="bg-[#0F172A] border border-slate-750 px-2 py-0.5 rounded uppercase">
                            {lead.source}
                          </span>
                        </td>

                        {/* Status dropdown lifecycle */}
                        <td className="py-4 px-4">
                          <select
                            value={lead.status}
                            onChange={(e) => updateLeadStatus(lead.id, e.target.value as LeadStatus)}
                            className={`
                              text-xs font-bold rounded-lg px-2.5 py-1.5 focus:outline-none transition leading-none border
                              ${lead.status === 'New' ? 'bg-blue-600/10 border-blue-500/20 text-blue-400' : ''}
                              ${lead.status === 'Contacted' ? 'bg-amber-600/10 border-amber-500/20 text-amber-400' : ''}
                              ${lead.status === 'Qualified' ? 'bg-purple-600/10 border-purple-500/20 text-purple-400' : ''}
                              ${lead.status === 'Closed' ? 'bg-emerald-600/10 border-emerald-500/20 text-emerald-400' : ''}
                              ${lead.status === 'Not Interested' ? 'bg-red-650/10 border-red-500/20 text-red-400' : ''}
                            `}
                          >
                            {STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                          </select>
                        </td>

                        {/* Interactive Notes editors */}
                        <td className="py-4 px-4 max-w-md pr-6">
                          {editingLeadId === lead.id ? (
                            <div className="flex flex-col gap-1 w-full">
                              <textarea
                                value={tempNotes}
                                onChange={(e) => setTempNotes(e.target.value)}
                                rows={2}
                                className="w-full bg-[#0F172A] border border-slate-700 text-xs text-white p-2 rounded-lg focus:border-blue-500 focus:outline-none"
                              />
                              <div className="flex gap-2 justify-end self-end">
                                <button
                                  type="button"
                                  onClick={() => setEditingLeadId(null)}
                                  className="text-[10px] text-slate-400 hover:text-white"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSaveNotes(lead.id)}
                                  className="text-[10px] text-emerald-400 font-bold hover:text-emerald-350"
                                >
                                  Save Notes
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="group cursor-pointer hover:bg-slate-900/60 p-2 rounded-lg border border-transparent hover:border-slate-800 transition duration-150" onClick={() => handleStartEditingNotes(lead)}>
                              <p className="italic text-slate-300 line-clamp-2 leading-relaxed">
                                {lead.notes || "Click to add outreach details or follow-up timelines..."}
                              </p>
                              <span className="text-[9px] font-mono text-slate-500 group-hover:text-blue-400 mt-1 block font-semibold">
                                ✎ Click to Edit notes
                              </span>
                            </div>
                          )}
                        </td>

                        {/* Action Delete */}
                        <td className="py-4 px-4 text-right">
                          <button
                            onClick={() => {
                              if (confirm(`Remove custom lead "${lead.name}"?`)) {
                                deleteLead(lead.id);
                              }
                            }}
                            className="text-slate-500 hover:text-red-400 p-2 rounded hover:bg-red-950/20 transition"
                            title="Delete Lead Permanent"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination / Table Total status line */}
            <div className="bg-[#0F172A] px-4 py-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-550">
              <p>Displaying {filteredLeads.length} of {leads.length} leads in persistent cache.</p>
              <div className="flex items-center gap-1">
                <div className="h-1.5 w-1.5 bg-emerald-500 rounded-full" />
                <span>Exclusivity Protection System Active</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
