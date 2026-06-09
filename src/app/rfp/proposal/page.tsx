'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { simulateRFP, getRFPById } from '@/lib/rfps';
import { RFPWithResult } from '@/lib/types';

function ProposalContent() {
  const searchParams = useSearchParams();
  const rfpId = searchParams.get('id') || 'rfp_001';
  const [result, setResult] = useState<RFPWithResult | null>(null);
  const [mode, setMode] = useState<'side-by-side' | 'raw' | 'adsmith'>('side-by-side');

  useEffect(() => {
    const data = simulateRFP(rfpId);
    setResult(data);
  }, [rfpId]);

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Generating simulation...</div>
      </div>
    );
  }

  const { rfp, rawProposal, adSmithProposal } = result;
  const rawHasErrors = rawProposal.validationErrors.length > 0;
  const adSmithHasErrors = adSmithProposal.validationErrors.length > 0;

  const formatCurrency = (n: number) => `$${n.toLocaleString()}`;
  const formatImpressions = (n: number) => n.toLocaleString();

  return (
    <>
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm text-indigo-600 hover:text-indigo-800">
              ← RFP Inbox
            </Link>
            <span className="text-gray-300">|</span>
            <div>
              <span className="text-sm font-medium text-gray-900">{rfp.advertiser}</span>
              <span className="text-xs text-gray-400 ml-2">${rfp.budget.toLocaleString()}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs">
              <button onClick={() => setMode('side-by-side')} className={`px-3 py-1.5 ${mode === 'side-by-side' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>Side by Side</button>
              <button onClick={() => setMode('raw')} className={`px-3 py-1.5 border-l border-gray-200 ${mode === 'raw' ? 'bg-red-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>Raw Agent</button>
              <button onClick={() => setMode('adsmith')} className={`px-3 py-1.5 border-l border-gray-200 ${mode === 'adsmith' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>AdSmith</button>
            </div>
            <Link href={`/rfp/trace?id=${rfpId}`} className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">Trace View →</Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6">
        <div className="mb-6">
          <span className="text-xs font-medium bg-amber-50 text-amber-700 px-2 py-1 rounded-full">
            Scene 2 — The fix: AdSmith catches the hallucination
          </span>
        </div>

        {mode === 'side-by-side' && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Raw Agent Panel */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-red-50 px-5 py-3 border-b border-red-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-red-800">Raw Agent</h3>
                  <span className="text-xs font-medium text-red-600 bg-red-100 px-2 py-0.5 rounded-full">{rawProposal.status}</span>
                </div>
                <p className="text-xs text-red-600 mt-1">No validation — hallucinated proposal sent</p>
              </div>
              <div className="p-5 space-y-4">
                {rawProposal.lineItems.map((li, i) => (
                  <div key={i} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-red-700 font-medium">{li.segmentId}</span>
                      <span className="text-gray-700">{formatCurrency(li.cpm)} CPM</span>
                    </div>
                    <div className="text-xs text-gray-500">{li.format} · {formatImpressions(li.impressions)} impressions · {formatCurrency(li.budget)}</div>
                  </div>
                ))}
                <div className="flex justify-between text-sm font-medium pt-2 border-t border-gray-100">
                  <span className="text-gray-700">Total</span>
                  <span className="text-gray-900">{formatImpressions(rawProposal.projectedReach)} impressions @ {formatCurrency(rawProposal.totalCPM)} CPM</span>
                </div>
                {rawHasErrors && (
                  <div className="space-y-2 pt-2">
                    <p className="text-xs font-semibold text-red-600 uppercase tracking-wide">Broken — Not Caught</p>
                    {rawProposal.validationErrors.map((err, i) => (
                      <div key={i} className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-red-500 text-lg">●</span>
                          <span className="text-xs font-semibold text-red-700 uppercase">{err.type.replace(/_/g, ' ')}</span>
                        </div>
                        <p className="text-sm text-red-600">{err.detail}</p>
                      </div>
                    ))}
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                      <p className="text-sm font-semibold text-red-700">❌ Proposal sent with errors — buyer receives invalid commitment</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* AdSmith Panel */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-green-50 px-5 py-3 border-b border-green-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-green-800">AdSmith</h3>
                  <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-0.5 rounded-full">{adSmithProposal.status}</span>
                </div>
                <p className="text-xs text-green-600 mt-1">Commitment validation — blocked before send</p>
              </div>
              <div className="p-5 space-y-4">
                {adSmithProposal.lineItems.map((li, i) => (
                  <div key={i} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-green-700 font-medium">{li.segmentId}</span>
                      <span className="text-gray-700">{formatCurrency(li.cpm)} CPM</span>
                    </div>
                    <div className="text-xs text-gray-500">{li.format} · {formatImpressions(li.impressions)} impressions · {formatCurrency(li.budget)}</div>
                  </div>
                ))}
                <div className="flex justify-between text-sm font-medium pt-2 border-t border-gray-100">
                  <span className="text-gray-700">Total</span>
                  <span className="text-gray-900">{formatImpressions(adSmithProposal.projectedReach)} impressions @ {formatCurrency(adSmithProposal.totalCPM)} CPM</span>
                </div>
                {!adSmithHasErrors && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                    <p className="text-sm font-semibold text-green-700">✅ All checks passed — proposal validated</p>
                    <p className="text-xs text-green-600 mt-1">Commitment validation: segment exists, volume within capacity, budget reconciled</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {mode === 'raw' && (
          <div className="bg-white rounded-xl border border-red-200 shadow-sm overflow-hidden">
            <div className="bg-red-50 px-5 py-3 border-b border-red-100"><h3 className="text-sm font-semibold text-red-800">Raw Agent — Proposal (Broken)</h3></div>
            <div className="p-5"><pre className="text-xs text-gray-700 bg-gray-50 p-4 rounded-lg overflow-x-auto">{JSON.stringify(result.rawProposal, null, 2)}</pre></div>
          </div>
        )}

        {mode === 'adsmith' && (
          <div className="bg-white rounded-xl border border-green-200 shadow-sm overflow-hidden">
            <div className="bg-green-50 px-5 py-3 border-b border-green-100"><h3 className="text-sm font-semibold text-green-800">AdSmith — Proposal (Validated)</h3></div>
            <div className="p-5"><pre className="text-xs text-gray-700 bg-gray-50 p-4 rounded-lg overflow-x-auto">{JSON.stringify(result.adSmithProposal, null, 2)}</pre></div>
          </div>
        )}

        <div className="mt-8 flex items-center justify-between">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">← Back to Inbox</Link>
          <Link href={`/rfp/trace?id=${rfpId}`} className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700">View Trace → Scene 3</Link>
        </div>
      </main>
    </>
  );
}

export default function ProposalPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-gray-500">Loading...</div></div>}>
        <ProposalContent />
      </Suspense>
    </div>
  );
}
