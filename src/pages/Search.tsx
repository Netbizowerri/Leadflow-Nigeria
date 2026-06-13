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
  Sliders,
  Globe
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
  'AC & Refrigeration Services',
  'Accounting & Audit Firms',
  'Adult Education & Literacy Centers',
  'Architects & Urban Planners',
  'Artisans & Craftsmen Cooperatives',
  'Auto Spare Parts Dealers',
  'Baby Products & Toy Stores',
  'Bakeries & Confectioneries',
  'Banks & Microfinance Banks',
  'Barber Shops & Unisex Salons',
  'Bars & Nightlife Venues',
  'Bookshops & Stationery Stores',
  'Boutique Fashion Stores',
  'Boutique Hotels & Lodges',
  'Building Construction Companies',
  'Cafes & Coffee Shops',
  'Car Dealerships & Auto Garages',
  'Car Wash & Detailing Services',
  'Cargo & Shipping Services',
  'Catering & Food Delivery Services',
  'Catering Services',
  'CCTV & Security System Installers',
  'Chambers of Commerce & Trade Associations',
  'Churches & Ministries',
  'Cleaning & Janitorial Services',
  'Cobblers & Shoe Repairs',
  'Coding & Tech Bootcamps',
  'Coding Bootcamps & Tech Hubs',
  'Community Development Associations',
  'Cooperative Societies & Credit Unions',
  'Crop Farming & Agro-Processing',
  'Dental Clinics',
  'Diagnostic & Medical Labs',
  'Digital Marketing Agencies',
  'Drink Distributors & Bottled Water Companies',
  'Driving Schools',
  'Dry Cleaners & Laundry Pickup',
  'E-Commerce Platform Operators',
  'Electronics & Gadget Stores',
  'Engineering Consulting Firms',
  'Event Planners & Venues',
  'Faith-Based Outreach Programs',
  'Farmers Markets & Organic Stores',
  'Fashion Designers & Tailoring',
  'Film & Video Production Companies',
  'Fire & Emergency Services',
  'Fish Farming & Aquaculture',
  'Food & Beverage Manufacturing',
  'Funeral Homes & Mortuary Services',
  'Furniture Stores & Wood Workshops',
  'Generator Repairs & Maintenance',
  'Glass & Aluminum Fabricators',
  'Government Agencies & Parastatals',
  'Graphic Design & Branding Agencies',
  'Guest Houses & Shortlets',
  'Gyms & Fitness Centers',
  'Home Appliances & Furniture Stores',
  'Hospitals & Medical Centers',
  'HR & Recruitment Agencies',
  'Insurance Brokerage Firms',
  'Interior Designers & Decorators',
  'Investment & Stock Brokerage Firms',
  'IT Support & Computer Repairs',
  'Landscaping & Gardening Services',
  'Laundry & Dry Cleaning Services',
  'Law Firms & Solicitors',
  'Local Government Councils',
  'Makeup Artistry & Beauty Salons',
  'Management Consultants',
  'Martial Arts & Self-Defense Studios',
  'Maternity & Fertility Clinics',
  'Mechanic Workshops & Repairs',
  'Media & Broadcasting Stations',
  'Mental Health & Counseling Centers',
  'Mobile Money & Fintech Agents',
  'Money Transfer & Forex Bureaus',
  'Mosques & Islamic Centers',
  'Moving & Haulage Services',
  'Music & Art Schools',
  'Music Recording Studios',
  'Networking & ISP Providers',
  'NGOs & Non-Profit Organizations',
  'Nursery & Daycare Centers',
  'Nutrition & Weight Loss Centers',
  'Optical & Eye Care Centers',
  'Painters & Painting Contractors',
  'Party Rental & Equipment Hire',
  'Pest Control Services',
  'Pet Stores & Veterinary Shops',
  'Pharmacy & Drug Stores',
  'Phone & Accessory Shops',
  'Photography & Videography Studios',
  'Physiotherapy & Rehabilitation Centers',
  'Plumbing & Electrical Services',
  'Poultry & Livestock Farming',
  'Printing & Publishing Houses',
  'Private Clinics & Nursing Homes',
  'Private Primary & Secondary Schools',
  'Public Libraries & Community Centers',
  'Real Estate Agency',
  'Resorts & Holiday Rentals',
  'Restaurants & Fast Food Chains',
  'Roofing & Ceiling Installers',
  'Shoe & Accessory Stores',
  'Software Development Companies',
  'Spa & Wellness Centers',
  'Sporting Goods Stores',
  'Sports Academies & Coaching',
  'Supermarkets & Retail Stores',
  'Surveyors & Valuers',
  'Tailoring & Alteration Services',
  'Tattoo & Piercing Studios',
  'Tax & Financial Advisors',
  'Tile & Flooring Dealers',
  'Tire Dealers & Battery Shops',
  'Traditional Medicine & Herbal Clinics',
  'Travel Agencies & Tour Operators',
  'Truck & Logistics Companies',
  'Tutoring & Lesson Centers',
  'Universities & Polytechnics',
  'Vehicle Tracking & Security Installers',
  'Vocational Training Institutes',
  'Waste Management & Recycling',
  'Watch & Jewelry Repairs',
  'Web Design & Development Agencies',
  'Wedding Planning & Event Styling',
  'Well Drilling & Borehole Services',
  'Yoga & Pilates Studios',
  'Youth Empowerment & Skill Acquisition Centers'
];

interface LogEntry {
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'warn' | 'error';
}

export default function SearchPage({ setActiveResults }: { setActiveResults: (leads: any[]) => void }) {
  const { addSearchHistory, searchHistory } = useApp();
  const navigate = useNavigate();

  // Form states
  const [industry, setIndustry] = useState(INDUSTRIES[0]);
  const [customIndustry, setCustomIndustry] = useState('');
  const [useCustomIndustry, setUseCustomIndustry] = useState(false);
  const [location, setLocation] = useState(NIGERIAN_STATES[0]);
  const [customLocation, setCustomLocation] = useState('');
  const [useCustomLocation, setUseCustomLocation] = useState(false);
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

    // Begin pipeline state updates
    setScanState({
      status: 'searching',
      progress: 5,
      statusText: 'Initializing scan engine parameters...',
      resultsFound: 0,
      resultsNoWebsite: 0
    });

    addLog(`Initiating System Lead Scraper v2.0`, 'info');
    addLog(`Targeting sector: [${selectedIndustry.toUpperCase()}]`, 'info');
    addLog(`Targeting region: [${selectedLocation.toUpperCase()}]`, 'info');
    addLog(`Method: [Nigerian Directories via Gemini AI]`, 'info');

    let interval: NodeJS.Timeout | null = null;
    let stepCount = 0;

    const fakeSteps = [
      { prg: 10, txt: 'Routing queries to Gemini AI indexes...', delay: 800 },
      { prg: 25, txt: 'Searching Nigerian business directories via Google-grounded search...', delay: 1500 },
      { prg: 40, txt: 'Directory data received. Processing business listings...', delay: 2400 },
      { prg: 55, txt: 'Collation successful. Resolving business contact details...', delay: 2200 },
      { prg: 75, txt: 'Filtering targets with NO custom website listings...', delay: 2000 },
      { prg: 90, txt: 'Finalizing results. Preparing lead data...', delay: 2500 }
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
      if (step.prg >= 55) type = 'warn';
      if (step.prg >= 75) type = 'success';

      addLog(step.txt, type);
      stepCount++;
      const nextDelay = fakeSteps[stepCount]?.delay || 2000;
      interval = setTimeout(runLogsSimulation, nextDelay);
    };

    interval = setTimeout(runLogsSimulation, 500);

    try {
      let results: any[] = [];

      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: selectedIndustry,
          location: selectedLocation,
          source: 'Nigerian Directories',
          useGeminiEnrichment
        })
      });

      if (interval) clearTimeout(interval);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Server returned an error scanning.');
      }

      results = data.leads || [];

      if (interval) clearTimeout(interval);

      setScanState({
        status: 'completed',
        progress: 100,
        statusText: `Scan completed successfully. Found ${results.length} leads with no website!`,
        resultsFound: results.length * 2,
        resultsNoWebsite: results.length
      });

      addLog(`Scan complete. Scrutinized matches: ${results.length} active leads with NO website.`, 'success');
      addSearchHistory(selectedIndustry, selectedLocation);
      
      setActiveResults(results);

      setTimeout(() => {
        navigate('/results');
      }, 1500);

    } catch (err: any) {
      if (interval) clearTimeout(interval);
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
          <span className="text-xs font-mono font-semibold tracking-widest text-emerald-400 uppercase bg-emerald-500/10 px-2.5 py-1 rounded inline-block mb-2 border border-emerald-500/20">
            GEMINI AI SCAN ENGINE
          </span>
          <h2 className="font-sora text-3xl font-extrabold text-white tracking-tight">
            Lead Discovery Engine
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Discover physical businesses listed in Nigerian directories that lack a website, ready for custom design pitches.
          </p>
        </div>
      </div>

      {/* Main Grid View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Parameters Form Card */}
        <div className="lg:col-span-7 bg-[#1E293B] border border-slate-800 rounded-xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 h-40 w-40 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

          <h3 className="font-sora font-semibold text-lg text-white mb-4 flex items-center gap-2">
            <Sliders size={18} className="text-emerald-500" />
            <span>Scanner Parameters</span>
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
                    className="flex-1 bg-[#0F172A] border border-slate-700/80 rounded-lg px-3.5 py-2.5 text-sm text-white font-medium focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
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
                    className="flex-grow bg-[#0F172A] border border-slate-700/80 rounded-lg px-3.5 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
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
                    className="flex-1 bg-[#0F172A] border border-slate-700/80 rounded-lg px-3.5 py-2.5 text-sm text-white font-medium focus:border-emerald-500 focus:outline-none"
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
                    className="flex-grow bg-[#0F172A] border border-slate-700/80 rounded-lg px-3.5 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
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

            {/* Source badge - always Nigerian Directories now */}
            <div>
              <label className="block text-xs font-mono font-bold text-slate-400 uppercase tracking-widest mb-2">
                Data Source
              </label>
              <div className="bg-emerald-600/10 border border-emerald-500/20 rounded-lg px-4 py-3 flex items-center gap-3">
                <Globe size={20} className="text-emerald-400 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-white">Nigerian Directories <span className="text-emerald-400">(Gemini AI)</span></p>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Uses Google-grounded Gemini AI to scan VConnect, BusinessList.ng and Nigerian business directories
                  </p>
                </div>
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
                      Uses Google Search grounding to find business emails from directory listings.
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
                  <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-300 after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
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
                  : 'bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 text-white shadow-lg shadow-emerald-950/30 active:scale-[0.98]'}
              `}
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
              <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-emerald-400">
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
        <div className="bg-emerald-600/10 text-emerald-400 p-2.5 rounded-lg border border-emerald-500/20 shrink-0">
          <Info size={20} />
        </div>
        <div>
          <h4 className="font-sora text-sm font-semibold text-white">How the Gemini AI scanner ensures accuracy:</h4>
          <p className="text-xs text-slate-400 leading-relaxed mt-1">
            LeadFlow NG routes your query to Google-backed Gemini AI which searches Nigerian business directories (VConnect, BusinessList.ng, etc.) and filters out any entry with an existing website. Results include phone, address, rating, and category for each lead.
          </p>
        </div>
      </div>

      {/* History panel */}
      {searchHistory.length > 0 && (
        <div className="bg-[#1E293B]/40 border border-slate-800/80 rounded-xl p-5">
          <h4 className="font-sora text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
            <History size={14} className="text-gray-400" />
            <span>Recent Scan History</span>
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
