'use client';

import { useState } from 'react';
import Link from 'next/link';
import { getDemoRFPs } from '@/lib/rfps';

export default function Home() {
  const rfps = getDemoRFPs();
  const [selectedRfp, setSelectedRfp] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <h1 className="text-lg font-semibold text-gray-900">AdSmith</h1>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Test Harness Demo</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">Dashboard</Link>
            <span className="text-xs text-gray-400">57Blocks · Confidential</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Intro */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">RFP Inbox</h2>
          <p className="text-sm text-gray-500 max-w-2xl">
            Incoming buyer agent briefs. Select one to simulate the proposal workflow —
            compare a <span className="text-red-600 font-medium">raw ungrounded agent</span> against{' '}
            <span className="text-indigo-600 font-medium">AdSmith with commitment validation</span>.
          </p>
        </div>

        {/* RFP Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          {rfps.map((rfp) => (
            <div
              key={rfp.id}
              className={`bg-white rounded-xl border-2 transition-all cursor-pointer ${
                selectedRfp === rfp.id
                  ? 'border-indigo-500 shadow-md'
                  : 'border-gray-200 hover:border-gray-300 shadow-sm'
              }`}
              onClick={() => setSelectedRfp(rfp.id)}
            >
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{rfp.advertiser}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">ID: {rfp.id}</p>
                  </div>
                  <span className="text-xs font-medium bg-indigo-50 text-indigo-600 px-2 py-1 rounded-full">
                    ${rfp.budget.toLocaleString()}
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-xs text-gray-400 block mb-0.5">Audience</span>
                    <span className="text-gray-700">{rfp.audience.description}</span>
                  </div>
                  <div className="flex gap-2">
                    {rfp.formats.map((f) => (
                      <span key={f} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                        {f}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>{rfp.flightStart} → {rfp.flightEnd}</span>
                  </div>
                </div>

                {rfp.id === 'rfp_001' && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <span className="text-xs text-amber-600 font-medium">
                      ⚠ This RFP is designed to trigger a hallucination
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Action Button */}
        <div className="mt-8 flex justify-center">
          <Link
            href={selectedRfp ? `/rfp/proposal?id=${selectedRfp}` : '#'}
            className={`px-8 py-3 rounded-xl text-sm font-semibold transition-all ${
              selectedRfp
                ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
            onClick={(e) => !selectedRfp && e.preventDefault()}
          >
            {selectedRfp ? 'Run Simulation →' : 'Select an RFP to begin'}
          </Link>
        </div>

        {/* Demo narrative hint */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-400">
            Scene 1 of 3 — The problem: a raw agent hallucinates inventory that doesn&apos;t exist
          </p>
        </div>
      </main>
    </div>
  );
}
