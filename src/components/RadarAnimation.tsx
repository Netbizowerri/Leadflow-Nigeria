/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ScanStatus } from '../types';

interface RadarAnimationProps {
  status: ScanStatus;
  resultsCount: number;
}

export default function RadarAnimation({ status, resultsCount }: RadarAnimationProps) {
  const isScanning = status !== 'idle' && status !== 'completed' && status !== 'failed';

  return (
    <div className="relative flex flex-col items-center justify-center p-8 bg-[#0F172A] border border-[#1E293B] rounded-2xl overflow-hidden shadow-2xl glass-panel">
      {/* Absolute grid decoration */}
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:14px_24px]" />

      <div className="relative h-56 w-56 flex items-center justify-center mb-6">
        {/* Continuous Grid concentric circles */}
        <div className="absolute inset-0 border border-slate-800 rounded-full" />
        <div className="absolute inset-8 border border-slate-800/80 rounded-full" />
        <div className="absolute inset-16 border border-slate-800/60 rounded-full" />
        <div className="absolute inset-24 border border-slate-800/40 rounded-full" />
        <div className="absolute inset-32 border border-slate-800/20 rounded-full" />

        {/* Crosshair lines */}
        <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-slate-800/80" />
        <div className="absolute left-0 right-0 top-1/2 h-[1px] bg-slate-800/80" />

        {/* Radial sweeping line */}
        {isScanning && (
          <div className="absolute inset-0 bg-transparent rounded-full origin-center animate-[spin_4s_linear_infinite]"
               style={{
                 backgroundImage: 'conic-gradient(from 0deg, rgba(37, 99, 235, 0) 60%, rgba(37, 99, 235, 0.4) 100%)'
               }}
          />
        )}

        {/* Pulsing visual circles */}
        {isScanning && (
          <>
            <div className="absolute inset-0 rounded-full border border-blue-500/30 radar-wave" />
            <div className="absolute inset-0 rounded-full border border-emerald-500/20 radar-wave [animation-delay:1s]" />
            <div className="absolute inset-0 rounded-full border border-blue-600/10 radar-wave [animation-delay:2s]" />
          </>
        )}

        {/* Center Target Marker */}
        <div className={`
          relative h-8 w-8 rounded-full flex items-center justify-center z-10 border transition-all duration-300
          ${isScanning 
            ? 'bg-blue-600/30 text-blue-400 border-blue-500 animate-pulseScale' 
            : status === 'completed'
              ? 'bg-emerald-600/30 text-emerald-400 border-emerald-500'
              : 'bg-slate-800 text-slate-400 border-slate-700'}
        `}>
          <div className={`h-2.5 w-2.5 rounded-full ${isScanning ? 'bg-blue-500' : status === 'completed' ? 'bg-emerald-500' : 'bg-slate-500'}`} />
        </div>

        {/* Blips / Simulating scattered leads detected */}
        {isScanning && (
          <>
            <div className="absolute top-12 left-16 h-2 w-2 rounded-full bg-emerald-400 opacity-60 animate-ping" />
            <div className="absolute top-24 left-36 h-1.5 w-1.5 rounded-full bg-blue-400 opacity-80 animate-pulse" />
            <div className="absolute bottom-16 left-12 h-2 w-2 rounded-full bg-blue-500 opacity-50 animate-pulse [animation-delay:0.5s]" />
            <div className="absolute bottom-20 right-16 h-2 w-2 rounded-full bg-emerald-500 opacity-70 animate-ping [animation-delay:1.2s]" />
          </>
        )}
      </div>

      {/* Main Status Metrics Overlay */}
      <div className="text-center z-10">
        <h4 className="text-xs font-mono font-medium text-slate-400 tracking-wider uppercase mb-1">
          {isScanning ? 'System Active Scanning' : status === 'completed' ? 'Scan Completed Successfully' : 'Ready to Scrutinize'}
        </h4>

        <div className="flex items-baseline justify-center gap-1">
          <span className="font-sora text-3xl font-extrabold text-white tracking-tight animate-fade">
            {resultsCount}
          </span>
          <span className="text-xs font-mono text-gray-400">leads gathered</span>
        </div>

        <p className="text-xs text-slate-500 font-mono mt-2 min-h-4">
          {status === 'searching' && '🚀 Executing Google Places Text Search...'}
          {status === 'paginating' && '⏳ Mandatory 2.1s Pagination rate-delay...'}
          {status === 'details' && '🔎 Scrutinizing Business Page Details...'}
          {status === 'filtering' && '🚫 Filtering out entities with active websites...'}
          {status === 'enriching' && '✨ Grounding Gemini models for email extraction...'}
          {status === 'completed' && '✅ Scanning complete. Filtered successfully!'}
          {status === 'failed' && '❌ Scanner operation aborted.'}
          {status === 'idle' && '🎯 Awaiting instruction parameters.'}
        </p>
      </div>
    </div>
  );
}
