/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Webhook, 
  Send, 
  Play, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Key, 
  HelpCircle,
  Copy,
  Sliders,
  Settings,
  Flame,
  User,
  ShieldCheck,
  Building
} from 'lucide-react';

export default function WebhookPage() {
  const { 
    outscraperApiKey, 
    hunterApiKey, 
    privyrWebhookUrl, 
    customWebhookUrl,
    webhookAuthHeader,
    webhookAuthValue,
    saveKeys, 
    saveWebhookConfig,
    webhookHistory,
    clearClaimedLeads,
    testWebhook
  } = useApp();

  // API Key inputs
  const [outscraperKeyInput, setOutscraperKeyInput] = useState(outscraperApiKey);
  const [hunterKeyInput, setHunterKeyInput] = useState(hunterApiKey);
  const [keySavedMessage, setKeySavedMessage] = useState('');

  // Webhook inputs
  const [privyrUrlInput, setPrivyrUrlInput] = useState(privyrWebhookUrl);
  const [customUrlInput, setCustomUrlInput] = useState(customWebhookUrl);
  const [authHeaderInput, setAuthHeaderInput] = useState(webhookAuthHeader);
  const [authValueInput, setAuthValueInput] = useState(webhookAuthValue);
  const [webhookSavedMessage, setWebhookSavedMessage] = useState('');

  // Testing states
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSaveKeys = (e: React.FormEvent) => {
    e.preventDefault();
    saveKeys(outscraperKeyInput, hunterKeyInput);
    setKeySavedMessage('Outscraper API Key configuration saved successfully!');
    setTimeout(() => setKeySavedMessage(''), 3000);
  };

  const handleSaveWebhook = (e: React.FormEvent) => {
    e.preventDefault();
    saveWebhookConfig({
      privyrWebhookUrl: privyrUrlInput,
      customWebhookUrl: customUrlInput,
      webhookAuthHeader: authHeaderInput,
      webhookAuthValue: authValueInput
    });
    setWebhookSavedMessage('Webhook CRM parameters saved successfully!');
    setTimeout(() => setWebhookSavedMessage(''), 3000);
  };

  const handleTriggerTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await testWebhook();
      setTestResult(res);
    } catch (err: any) {
      setTestResult({ success: false, message: `System Error: ${err.message || err}` });
    } finally {
      setTesting(false);
    }
  };

  const handleResetLeadsClaimStatus = () => {
    if (confirm('Are you sure you want to release all claimed leads back into discovery rotation? This is primarily used for testing or re-scraping.')) {
      clearClaimedLeads();
      alert('Exclusivity claimed cache has been reset. All leads can now be re-discovered on search sessions.');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-4">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-[#1E293B] pb-6 gap-4">
        <div>
          <span className="text-xs font-mono font-medium text-[#10B981]">SYSTEM CONNECTIONS AND SETTINGS</span>
          <h2 className="font-sora text-3xl font-extrabold text-white tracking-tight flex items-center gap-2 mt-1">
            <span>Terminal Integrations HUD</span>
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Authorize your Outscraper API Key and configure automated webhook channels to stream leads instantly onto your mobile devices.
          </p>
        </div>
      </div>

      {/* Grid Layout splits Keys and Webhook configs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* API Credentials Configuration Card */}
        <div className="bg-[#1E293B] border border-slate-805 rounded-xl p-6 shadow-xl space-y-4">
          <h3 className="font-sora font-semibold text-lg text-white flex items-center gap-2 border-b border-[#1E293B] pb-3">
            <Key size={18} className="text-blue-500 animate-pulse" />
            <span>Developer API Keys</span>
          </h3>

          <p className="text-xs text-slate-400 leading-relaxed">
            Your Outscraper API key is required for searching Google Maps data. Your API key remains stored securely inside your browser's local memory and is never transmitted to our backend servers.
          </p>

          <form onSubmit={handleSaveKeys} className="space-y-4">
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1 font-bold">
                Outscraper API Key:
              </label>
              <input
                type="password"
                placeholder="Enter your Outscraper API key"
                value={outscraperKeyInput}
                onChange={(e) => setOutscraperKeyInput(e.target.value)}
                className="w-full bg-[#0F172A] border border-slate-750 rounded-lg text-xs font-mono text-white px-3.5 py-3 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                  Hunter.io Domain API Key (Optional):
                </label>
                <span className="text-[9px] text-[#10B981] font-mono">BETA</span>
              </div>
              <input
                type="password"
                placeholder="Hunter API key..."
                value={hunterKeyInput}
                onChange={(e) => setHunterKeyInput(e.target.value)}
                className="w-full bg-[#0F172A] border border-slate-755 rounded-lg text-xs font-mono text-white px-3.5 py-3 focus:border-blue-500 focus:outline-none"
              />
            </div>

            {keySavedMessage && (
              <p className="text-xs text-emerald-400 font-mono flex items-center gap-1.5 bg-emerald-950/30 p-2 border border-emerald-900 rounded-lg">
                <CheckCircle2 size={14} />
                <span>{keySavedMessage}</span>
              </p>
            )}

            <button
              type="submit"
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 text-white font-bold text-xs rounded-lg transition duration-150"
            >
              Update Developer Credentials
            </button>
          </form>

          {/* Quick instructions block */}
          <div className="bg-[#0F172A] p-4 rounded-lg border border-slate-800">
            <h4 className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold mb-1.5 flex items-center gap-1.5">
              <ShieldCheck size={12} className="text-emerald-400" />
              <span>How to get your Outscraper Key:</span>
            </h4>
            <ul className="list-decimal list-inside text-[11px] text-slate-400 space-y-1 font-mono">
              <li>Go to outscraper.com and sign up.</li>
              <li>Navigate to your Dashboard → API Keys.</li>
              <li>Copy your personal API key.</li>
              <li>500 free searches/month included.</li>
            </ul>
          </div>
        </div>

        {/* CRM Webhook Config Card */}
        <div className="bg-[#1E293B] border border-slate-805 rounded-xl p-6 shadow-xl space-y-4">
          <h3 className="font-sora font-semibold text-lg text-white flex items-center gap-2 border-b border-[#1E293B] pb-3">
            <Webhook size={18} className="text-purple-500 animate-pulse" />
            <span>Privyr CRM Webhook Channels</span>
          </h3>

          <p className="text-xs text-slate-400 leading-relaxed">
            Enter your mobile CRM Webhook URL (e.g. Privyr CRM webhook, Make.com, or Zapier). Once leads are verified and dispatched, they stream straight into your CRM application automatically, triggering instant mobile alerts!
          </p>

          <form onSubmit={handleSaveWebhook} className="space-y-4">
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1 font-bold">
                Privyr Ingestion Webhook URL:
              </label>
              <input
                type="text"
                placeholder="https://www.privyr.com/api/v1/incoming-leads/..."
                value={privyrUrlInput}
                onChange={(e) => setPrivyrUrlInput(e.target.value)}
                className="w-full bg-[#0F172A] border border-slate-750 rounded-lg text-xs text-white px-3.5 py-3 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1 font-bold">
                Custom Webhook Address:
              </label>
              <input
                type="text"
                placeholder="https://hooks.zapier.com/hooks/catch/..."
                value={customUrlInput}
                onChange={(e) => setCustomUrlInput(e.target.value)}
                className="w-full bg-[#0F172A] border border-slate-750 rounded-lg text-xs text-white px-3.5 py-3 focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Custom headers segment */}
            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1 font-bold">
                  Auth Header Name:
                </label>
                <input
                  type="text"
                  placeholder="Authorization"
                  value={authHeaderInput}
                  onChange={(e) => setAuthHeaderInput(e.target.value)}
                  className="w-full bg-[#0F172A] border border-slate-750 rounded-lg text-xs text-white px-3.5 py-2.5 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1 font-bold">
                  Auth Header Token:
                </label>
                <input
                  type="password"
                  placeholder="Bearer xoxb-..."
                  value={authValueInput}
                  onChange={(e) => setAuthValueInput(e.target.value)}
                  className="w-full bg-[#0F172A] border border-slate-750 rounded-lg text-xs text-white px-3.5 py-2.5 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {webhookSavedMessage && (
              <p className="text-xs text-emerald-400 font-mono flex items-center gap-1.5 bg-emerald-950/30 p-2 border border-emerald-900 rounded-lg">
                <CheckCircle2 size={14} />
                <span>{webhookSavedMessage}</span>
              </p>
            )}

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg transition duration-150 shadow-md shadow-blue-900/15"
            >
              Update Webhook Integrations
            </button>
          </form>
        </div>
      </div>

      {/* Test Payload Trigger & Utilities card */}
      <div className="bg-[#1E293B] border border-slate-805 rounded-xl p-6 shadow-xl grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        <div className="md:col-span-8 space-y-2">
          <h4 className="font-sora font-semibold text-lg text-white">Webhook Connection Diagnostician</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Test your integrated webhook channels immediately. Clicking the diagnostic button triggers a mock payload representing a newly discovered Nigerian real-estate lead, dispatched from our Full-stack container to bypass browser limitations.
          </p>
        </div>

        <div className="md:col-span-4 space-y-3.5 text-right flex flex-col md:items-end justify-center">
          <button
            onClick={handleTriggerTest}
            disabled={testing}
            className="w-full bg-[#0F172A] hover:bg-slate-900 border border-slate-750 hover:border-slate-700 text-white text-xs font-bold py-2.5 px-4 rounded-lg flex items-center justify-center gap-1.5 transition active:scale-95 disabled:opacity-50"
          >
            {testing ? (
              <>
                <div className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Testing Line...</span>
              </>
            ) : (
              <>
                <Send size={13} fill="currentColor" />
                <span>Test Configured Webhook</span>
              </>
            )}
          </button>

          <button
            onClick={handleResetLeadsClaimStatus}
            type="button"
            className="w-full text-slate-500 hover:text-red-400 border border-transparent hover:border-red-950/30 bg-transparent hover:bg-red-950/10 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center justify-center gap-1.5"
          >
            ⚙ Release Claim Exclusivity Cache
          </button>
        </div>

        {testResult && (
          <div className={`md:col-span-12 p-3.5 border rounded-lg text-xs flex items-center gap-2 font-mono ${testResult.success ? 'bg-emerald-950/45 border-emerald-900 text-emerald-400' : 'bg-red-950/45 border-red-900 text-red-400'}`}>
            {testResult.success ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
            <span>{testResult.message}</span>
          </div>
        )}
      </div>

      {/* Webhook Stream Logs History Table */}
      <div className="bg-[#1E293B] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="bg-[#0F172A] px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-sora font-semibold text-sm text-white">Dynamic Streams Deliveries History</h3>
          <span className="text-[10px] font-mono text-purple-400 uppercase font-bold border border-purple-500/10 bg-purple-500/10 px-2 rounded">
            Exhaustive System Logs
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse font-mono">
            <thead>
              <tr className="bg-[#0F172A]/40 text-[10px] text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <th className="py-3 px-5">Timestamp</th>
                <th className="py-3 px-5">Lead Target</th>
                <th className="py-3 px-5">Delivery URL</th>
                <th className="py-3 px-5">Status Code</th>
                <th className="py-3 px-5 text-right">Result Message</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {webhookHistory.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-slate-500 italic">
                    No webhook deliveries executed yet.
                  </td>
                </tr>
              ) : (
                webhookHistory.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-900/30">
                    <td className="py-3 px-5 text-slate-400">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-3 px-5 font-bold text-white">
                      {log.leadName}
                    </td>
                    <td className="py-3 px-5 text-slate-500 max-w-xs truncate" title={log.url}>
                      {log.url}
                    </td>
                    <td className="py-3 px-5">
                      <span className={`inline-flex items-center gap-1.5 font-bold ${log.status === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${log.status === 'success' ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
                        {log.statusCode || 'Crashed'}
                      </span>
                    </td>
                    <td className="py-3 px-5 text-slate-350 text-right">
                      {log.responsePreview}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
