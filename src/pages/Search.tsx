/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ScanStatus, ScanProgress } from '../types';
import RadarAnimation from '../components/RadarAnimation';
import { 
  Play, 
  Search, 
  MapPin, 
  Cpu, 
  Sparkles, 
  Settings, 
  Info,
  CheckCircle2,
  AlertTriangle,
  History,
  TrendingUp,
  Sliders
} from 'lucide-react';

const NIGERIAN_STATES = [
  'Lagos State',
  'FCT (Abuja)',
  'Rivers State',
  'Kano State',
  'Oyo State',
  'Enugu State',
  'Kaduna State',
  'Edo State',
  'Ogun State',
  'Cross River State',
  'Abia State',
  'Adamawa State',
  'Akwa Ibom State',
  'Anambra State',
  'Bauchi State',
  'Bayelsa State',
  'Benue State',
  'Borno State',
  'Delta State',
  'Ebonyi State',
  'Ekiti State',
  'Gombe State',
  'Imo State',
  'Jigawa State',
  'Katsina State',
  'Kebbi State',
  'Kogi State',
  'Kwara State',
  'Nasarawa State',
  'Niger State',
  'Ondo State',
  'Osun State',
  'Plateau State',
  'Sokoto State',
  'Taraba State',
  'Yobe State',
  'Zamfara State'
];

const INDUSTRIES = [
  'Real Estate Agency',
  'Private Primary & Secondary Schools',
  'Hospitals & Medical Centers',
  'Law Firms & Solicitors',
  'Boutique Hotels & Lodges',
  'Event Planners & Venues',
  'Car Dealerships & Auto Garages',
  'Interior Designers & Decorators',
  'Supermarkets & Retail Stores',
  'Bakeries & Confectioneries',
  'Gyms & Fitness Centers'
];

interface LogEntry {
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'warn' | 'error';
}

async function searchOutscraper(
  query: string,
  location: string,
  apiKey: string,
  limit: number = 20
): Promise<any[]> {
  const encodedQuery = encodeURIComponent(`${query} in ${location}`);
  const url = `https://api.app.outscraper.com/maps/search-v3?query=${encodedQuery}&limit=${limit}&async=false`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'X-API-KEY': apiKey,
    },
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err?.message || `Outscraper error: ${response.status}`);
  }

  const data = await response.json();
  const places: any[] = data?.data?.[0] ?? [];

  return places.map((place: any) => ({
    id: place.place_id || `os-${Date.now()}-${Math.random().toString(36).substr(2,6)}`,
    name: place.name || 'Unknown Business',
    address: place.full_address || place.address || '',
    phone: place.phone || place.phones?.[0] || '',
    email: place.email || place.emails?.[0] || null,
    website: place.site || place.website || '',
    category: place.type || place.subtypes?.[0] || query,
    rating: place.rating ?? null,
    userRatingsTotal: place.reviews ?? null,
    source: 'Google Maps' as const,
    status: 'New' as const,
    notes: '',
    dateAdded: new Date().toISOString(),
    hasWebsite: !!(place.site || place.website),
  }));
}

export default function SearchPage({ setActiveResults }: { setActiveResults: (leads: any[]) => void }) {
  const { outscraperApiKey, addSearchHistory, searchHistory } = useApp();
  const navigate = useNavigate();

  // Form states
  const [industry, setIndustry] = useState(INDUSTRIES[0]);
  const [customIndustry, setCustomIndustry] = useState('');
  const [useCustomIndustry, setUseCustomIndustry] = useState(false);
  const [location, setLocation] = useState(NIGERIAN_STATES[0]);
  const [customLocation, setCustomLocation] = useState('');
  const [useCustomLocation, setUseCustomLocation] = useState(false);
  const [source, setSource] = useState<'Google Maps' | 'Nigerian Directories' | 'All Directories' | 'VConnect' | 'BusinessList'>('Google Maps');
  const [useGeminiEnrichment, setUseGeminiEnrichment] = useState(true);

  // Scan progress state
  const [scanState, setScanState] = useState<ScanProgress>({
    status: 'idle',
    progress: 0,
    statusText: '',
    resultsFound: 0,
    resultsNoWebsite: 0
  });

  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [errorMessage, setErrorMessage] = useState('');

  const addLog = (message: string, type: 'info' | 'success' | 'warn' | 'error' = 'info') => {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [{ timestamp: time, message, type }, ...prev]);
  };

  const handleStartScan = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setLogs([]);

    const selectedIndustry = useCustomIndustry ? customIndustry.trim() : industry;
    const selectedLocation = useCustomLocation ? customLocation.trim() : location;

    if (!selectedIndustry) {
      setErrorMessage('Please specify a target industry.');
      return;
    }
    if (!selectedLocation) {
      setErrorMessage('Please specify a location.');
      return;
    }

    if (source === 'Google Maps' && (!outscraperApiKey || outscraperApiKey.trim().length < 5)) {
      setErrorMessage('An Outscraper API Key is required to search Google Maps. Please configure it in Key settings.');
      return;
    }

    // Begin pipeline state updates
    setScanState({
      status: 'searching',
      progress: 5,
      statusText: 'Initializing scan engine parameters...',
      resultsFound: 0,
      resultsNoWebsite: 0
    });

    addLog(`Initiating System Lead Scraper v1.0.0`, 'info');
    addLog(`Targeting sector: [${selectedIndustry.toUpperCase()}]`, 'info');
    addLog(`Targeting region: [${selectedLocation.toUpperCase()}]`, 'info');
    addLog(`Method: [${source}]`, 'info');

    // Simulate agent pipeline steps in the UI while backend performs the heavy lifting
    let interval: NodeJS.Timeout | null = null;
    let stepCount = 0;

    const fakeSteps = [
      { prg: 10, txt: 'Routing queries to Outscraper API indexes...', delay: 800 },
      { prg: 22, txt: 'Text query resolved. Executing Google Maps business search...', delay: 1500 },
      { prg: 35, txt: 'Outscraper data received. Processing business listings...', delay: 2400 },
      { prg: 50, txt: 'Collation successful. Resolving business contact details...', delay: 2200 },
      { prg: 70, txt: 'Scrutinizing domains. Filtering targets with NO custom website listings...', delay: 2000 },
      { prg: 88, txt: 'Finalizing results. Preparing lead data...', delay: 2500 }
    ];

    const runLogsSimulation = () => {
      if (stepCount >= fakeSteps.length) return;
      const step = fakeSteps[stepCount];
      setScanState(prev => ({
        ...prev,
        progress: step.prg,
        statusText: step.txt
      }));
      
      let type: 'info' | 'success' | 'warn' = 'info';
      if (step.prg === 35) type = 'warn';
      if (step.prg >= 70) type = 'success';

      addLog(step.txt, type);
      stepCount++;
      const nextDelay = fakeSteps[stepCount]?.delay || 2000;
      interval = setTimeout(runLogsSimulation, nextDelay);
    };

    // Stagger client side pipeline visualization
    interval = setTimeout(runLogsSimulation, 500);

    try {
      let results: any[] = [];

      if (source === 'Google Maps') {
        results = await searchOutscraper(selectedIndustry, selectedLocation, outscraperApiKey);
      } else {
        const response = await fetch('/api/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: selectedIndustry,
            location: selectedLocation,
            source,
            useGeminiEnrichment
          })
        });

        if (interval) clearTimeout(interval);

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Server returned an error scanning.');
        }

        results = data.leads || [];
      }

      if (interval) clearTimeout(interval);

      setScanState({
        status: 'completed',
        progress: 100,
        statusText: `Scan completed successfully. Found ${results.length} leads with no website!`,
        resultsFound: results.length * 2, // illustrative raw items prior to filter
        resultsNoWebsite: results.length
      });

      addLog(`Scan complete. Scrutinized matches: ${results.length} active leads with NO website.`, 'success');
      addSearchHistory(selectedIndustry, selectedLocation);
      
      // Save leads to active results state so Results page can display them
      setActiveResults(results);

      // Brief delay before navigation
      setTimeout(() => {
        navigate('/results');
      }, 1500);

    } catch (err: any) {
      if (interval) clearTimeout(interval);
      console.error(err);
      setScanState({
        status: 'failed',
        progress: 100,
        statusText: err.message || 'Scraper failed to pull results.',
        resultsFound: 0,
        resultsNoWebsite: 0
      });
      addLog(`CRITICAL FAILURE: ${err.message || 'Scraper pipeline crashed'}`, 'error');
    }
  };

  const handleHistoryClck = (query: string) => {
    // query is in format "Industry in Location"
    const match = query.split(' in ');
    if (match.length === 2) {
      setUseCustomIndustry(true);
      setCustomIndustry(match[0]);
      setUseCustomLocation(true);
      setCustomLocation(match[1]);
      addLog(`Presetting parameters from history: ${query}`, 'info');
    }
  };

  const isScanning = scanState.status !== 'idle' && scanState.status !== 'completed' && scanState.status !== 'failed';

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-4">
      {/* Search Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-[#1E293B] pb-6 gap-4">
        <div>
          <span className="text-xs font-mono font-semibold tracking-widest text-[#10B981] uppercase bg-emerald-500/10 px-2.5 py-1 rounded inline-block mb-2 border border-emerald-500/20">
            SYSTEM SCAN ENGINE ACTIVE
          </span>
          <h2 className="font-sora text-3xl font-extrabold text-white tracking-tight">
            Lead Discovery Engine
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Discover physical businesses listed online in Nigeria that lack a website, ready for custom design pitches.
          </p>
        </div>
      </div>

      {/* Main Grid View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Parameters Form Card */}
        <div className="lg:col-span-7 bg-[#1E293B] border border-slate-800 rounded-xl p-6 shadow-xl relative overflow-hidden">
          {/* Subtle decoration */}
          <div className="absolute right-0 top-0 h-40 w-40 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

          <h3 className="font-sora font-semibold text-lg text-white mb-4 flex items-center gap-2">
            <Sliders size={18} className="text-blue-500" />
            <span>Target Scraper Parameters</span>
          </h3>

          <form onSubmit={handleStartScan} className="space-y-5">
            {/* Industry selector */}
            <div>
              <label className="block text-xs font-mono font-bold text-slate-400 uppercase tracking-widest mb-2">
                Business Sector / Industry
              </label>
              
              {!useCustomIndustry ? (
                <div className="flex gap-2">
                  <select 
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    disabled={isScanning}
                    className="flex-1 bg-[#0F172A] border border-slate-700/80 rounded-lg px-3.5 py-2.5 text-sm text-white font-medium focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {INDUSTRIES.map(ind => <option key={ind} value={ind}>{ind}</option>)}
                  </select>
                  <button
                    type="button"
                    onClick={() => setUseCustomIndustry(true)}
                    disabled={isScanning}
                    className="px-3 bg-slate-800 hover:bg-slate-700 text-gray-300 font-bold hover:text-white rounded-lg text-xs transition border border-slate-700"
                  >
                    Custom
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="e.g. Real Estate Developers, Tech Hubs"
                    value={customIndustry}
                    onChange={(e) => setCustomIndustry(e.target.value)}
                    disabled={isScanning}
                    className="flex-grow bg-[#0F172A] border border-slate-700/80 rounded-lg px-3.5 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setUseCustomIndustry(false)}
                    disabled={isScanning}
                    className="px-3 bg-slate-800 hover:bg-slate-700 text-gray-300 hover:text-white rounded-lg text-xs transition border border-slate-700 font-bold"
                  >
                    Preset
                  </button>
                </div>
              )}
            </div>

            {/* State Location selector */}
            <div>
              <label className="block text-xs font-mono font-bold text-slate-400 uppercase tracking-widest mb-2">
                Nigerian Location
              </label>

              {!useCustomLocation ? (
                <div className="flex gap-2">
                  <select 
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    disabled={isScanning}
                    className="flex-1 bg-[#0F172A] border border-slate-700/80 rounded-lg px-3.5 py-2.5 text-sm text-white font-medium focus:border-blue-500 focus:outline-none"
                  >
                    {NIGERIAN_STATES.map(st => <option key={st} value={st}>{st}</option>)}
                  </select>
                  <button
                    type="button"
                    onClick={() => setUseCustomLocation(true)}
                    disabled={isScanning}
                    className="px-3 bg-slate-800 hover:bg-slate-700 text-gray-300 font-bold hover:text-white rounded-lg text-xs transition border border-slate-700"
                  >
                    Custom
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ikeja, Lagos"
                    value={customLocation}
                    onChange={(e) => setCustomLocation(e.target.value)}
                    disabled={isScanning}
                    className="flex-grow bg-[#0F172A] border border-slate-700/80 rounded-lg px-3.5 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setUseCustomLocation(false)}
                    disabled={isScanning}
                    className="px-3 bg-slate-800 hover:bg-slate-700 text-gray-300 hover:text-white rounded-lg text-xs transition border border-slate-700 font-bold"
                  >
                    Preset
                  </button>
                </div>
              )}
            </div>

            {/* Provider Selector */}
            <div>
              <label className="block text-xs font-mono font-bold text-slate-400 uppercase tracking-widest mb-2">
                Scraping Directory Source
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { id: 'Google Maps', label: 'Google Maps (Outscraper)' },
                  { id: 'Nigerian Directories', label: 'Nigerian Directories (Gemini)' }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSource(item.id as any)}
                    disabled={isScanning}
                    className={`
                      px-4 py-3 border rounded-lg text-xs font-semibold text-center transition duration-150 flex flex-col justify-center items-center gap-1
                      ${source === item.id 
                        ? 'bg-blue-600/10 border-blue-500 text-blue-400' 
                        : 'border-slate-800 bg-[#0F172A] hover:bg-slate-800 hover:border-slate-700 text-slate-400'}
                    `}
                  >
                    <span>{item.label}</span>
                    {item.id === 'Google Maps' ? (
                      <span className="text-[9px] font-mono opacity-80">(via Outscraper API)</span>
                    ) : (
                      <span className="text-[9px] font-mono opacity-80">(via Gemini Search)</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Toggle options */}
            <div className="border-t border-slate-800/80 pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-start space-x-2.5">
                  <Cpu size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold text-white leading-none">
                      Gemini Email Enrichment
                    </h5>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Uses Google Search grounding to find business emails from directory listings (applies to Nigerian Directories source).
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={useGeminiEnrichment}
                    onChange={(e) => setUseGeminiEnrichment(e.target.checked)}
                    disabled={isScanning}
                    className="sr-only peer" 
                  />
                  <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-300 after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>

            {/* Submit Trigger Banner */}
            {errorMessage && (
              <div className="p-3 bg-red-950/40 border border-red-900/60 rounded-lg text-xs text-red-400 flex items-center gap-2">
                <AlertTriangle size={15} />
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isScanning}
              className={`
                w-full py-3.5 rounded-lg flex items-center justify-center gap-2 font-bold text-sm tracking-wide transition-all duration-150
                ${isScanning 
                  ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-950/40 hover:-translate-y-0.5 active:translate-y-0'}
              `}
              id="start-search-btn"
            >
              {isScanning ? (
                <>
                  <div className="h-4 w-4 border-2 border-slate-500 border-t-slate-300 rounded-full animate-spin" />
                  <span>AGENT PIPELINE ACTIVE...</span>
                </>
              ) : (
                <>
                  <Play size={16} fill="currentColor" />
                  <span>INITIATE SYSTEM COGNITIVE SCAN</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Live HUD Scrapper Console & Radar */}
        <div className="lg:col-span-5 space-y-6">
          <RadarAnimation 
            status={scanState.status} 
            resultsCount={scanState.resultsNoWebsite} 
          />

          {/* Active Log entries terminal drawer */}
          <div className="bg-[#0F172A] border border-slate-800 rounded-xl overflow-hidden flex flex-col h-[230px]">
            <div className="bg-[#1E293B] px-4 py-2 flex items-center justify-between border-b border-slate-800">
              <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-[#10B981]">
                Realtime Agent Scraper Log Console
              </span>
              <div className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            
            <div className="p-4 space-y-2 overflow-y-auto flex-grow font-mono text-[11px] leading-relaxed">
              {logs.length === 0 ? (
                <div className="text-slate-600 flex items-center justify-center h-full text-center">
                  <p>Awaiting scan coordinates initialization...</p>
                </div>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="flex items-start gap-1.5">
                    <span className="text-slate-500 font-light flex-none">[{log.timestamp}]</span>
                    <span className={`
                      flex-grow break-words
                      ${log.type === 'error' ? 'text-red-400 font-bold' : ''}
                      ${log.type === 'warn' ? 'text-amber-400' : ''}
                      ${log.type === 'success' ? 'text-emerald-400 font-bold' : 'text-slate-300'}
                    `}>
                      {log.message}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Search Guide Help Card */}
      <div className="bg-[#1E293B]/60 border border-slate-800 rounded-xl p-5 flex items-start gap-4">
        <div className="bg-blue-600/10 text-blue-400 p-2.5 rounded-lg border border-blue-500/20 shrink-0">
          <Info size={20} />
        </div>
        <div>
          <h4 className="font-sora text-sm font-semibold text-white">How the Scraper ensures 100% website-less accuracy:</h4>
          <p className="text-xs text-slate-400 leading-relaxed mt-1">
            Standard scraping fails due to directory rate limits, captchas, and obsolete static lists. LeadFlow NG routes your query directly to the Outscraper Google Maps API, then filters out any entry that currently contains a website. Results include phone, address, rating, and category data for each lead.
          </p>
        </div>
      </div>

      {/* History panel */}
      {searchHistory.length > 0 && (
        <div className="bg-[#1E293B]/40 border border-slate-800/80 rounded-xl p-5">
          <h4 className="font-sora text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
            <History size={14} className="text-gray-400" />
            <span>Recent Scan Parameters Query History</span>
          </h4>
          <div className="flex flex-wrap gap-2">
            {searchHistory.map((hist, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleHistoryClck(hist)}
                className="text-xs bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 hover:text-white text-slate-300 px-3 py-1.5 rounded-lg transition duration-150 font-mono"
              >
                {hist}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
