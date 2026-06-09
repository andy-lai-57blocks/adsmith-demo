'use client';

import Logo from '@/components/Logo';
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
            <Logo size={32} />
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
        {/* Scene 1 — The Problem */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-red-200 to-red-400" />
            <span className="text-xs font-semibold tracking-wider text-red-500 uppercase">Scene 1 — The Problem</span>
            <div className="h-px flex-1 bg-gradient-to-r from-red-400 via-red-200 to-transparent" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-3">RFP Inbox</h2>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 max-w-3xl mb-6">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-amber-600 text-lg">!</span>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-amber-800 mb-1">The Problem</h3>
                <p className="text-sm text-amber-700 leading-relaxed">
                  A buyer agent sends an RFP. A <strong className="text-amber-900">raw seller agent</strong> generates a proposal —
                  but it references an audience segment that <strong className="text-amber-900">doesn&apos;t exist</strong> in the publisher&apos;s inventory,
                  and commits to delivery volume the ad server <strong className="text-amber-900">cannot fulfill</strong>.
                  Nothing catches it. The broken proposal goes out.
                </p>
                <p className="text-sm text-amber-700 mt-2">
                  Select an RFP below to see the difference between a raw agent and{' '}
                  <strong className="text-indigo-700">AdSmith with commitment validation</strong>.
                </p>
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-400 mb-4">Incoming buyer agent briefs — select one to simulate</p>
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
