'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { simulateRFP } from '@/lib/rfps';
import { AgentTrace } from '@/lib/types';
import Logo from '@/components/Logo';
import SceneBadge from '@/components/SceneBadge';

function TraceContent() {
  const searchParams = useSearchParams();
  const rfpId = searchParams.get('id') || 'rfp_001';
  const [agentTrace, setAgentTrace] = useState<AgentTrace | null>(null);
  const [rawTrace, setRawTrace] = useState<AgentTrace | null>(null);
  const [expandedStage, setExpandedStage] = useState<number | null>(null);

  useEffect(() => {
    const data = simulateRFP(rfpId);
    if (data) {
      setAgentTrace(data.adSmithTrace);
      setRawTrace(data.rawTrace);
    }
  }, [rfpId]);

  if (!agentTrace || !rawTrace) {
    return <div className="min-h-screen flex items-center justify-center"><div className="text-gray-500">Loading trace...</div></div>;
  }

  return (
    <>
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/rfp/proposal?id=${rfpId}`} className="text-sm text-indigo-600 hover:text-indigo-800">← Proposal</Link>
            <span className="text-gray-300">|</span>
            <div className="flex items-center gap-2">
              <Logo size={20} />
              <h1 className="text-sm font-medium text-gray-900">Agent Trace</h1>
            </div>
          </div>
          <Link href="/dashboard" className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700">Dashboard →</Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-6">
        <SceneBadge num="3" title="Visibility" color="violet" />

        <div className="grid md:grid-cols-2 gap-8">
          {/* Raw Agent */}
          <div>
            <h3 className="text-sm font-semibold text-red-700 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full" />Raw Agent — No Observability
            </h3>
            <div className="space-y-3">
              {rawTrace.stages.map((stage, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <button onClick={() => setExpandedStage(expandedStage === i ? null : i)} className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${stage.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {stage.status === 'success' ? '✓' : '✗'}
                      </span>
                      <span className="text-sm font-medium text-gray-900">{stage.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {stage.name === 'Commitment Validation' && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">Skipped</span>}
                      <svg className={`w-4 h-4 text-gray-400 transition-transform ${expandedStage === i ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </button>
                  {expandedStage === i && (
                    <div className="px-4 py-3 border-t border-gray-100 space-y-2 bg-gray-50">
                      <div><span className="text-xs font-medium text-gray-500 block mb-1">Inputs</span><pre className="text-xs text-gray-700 bg-white p-2 rounded border border-gray-200 whitespace-pre-wrap">{stage.inputs}</pre></div>
                      <div><span className="text-xs font-medium text-gray-500 block mb-1">Reasoning</span><pre className="text-xs text-gray-700 bg-white p-2 rounded border border-gray-200 whitespace-pre-wrap">{stage.reasoning}</pre></div>
                      <div><span className="text-xs font-medium text-gray-500 block mb-1">Outputs</span><pre className="text-xs text-gray-700 bg-white p-2 rounded border border-gray-200 whitespace-pre-wrap">{stage.outputs}</pre></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* AdSmith */}
          <div>
            <h3 className="text-sm font-semibold text-emerald-700 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full" />AdSmith — Full Visibility
            </h3>
            <div className="space-y-3">
              {agentTrace.stages.map((stage, i) => (
                <div key={i} className={`bg-white rounded-xl border overflow-hidden ${stage.name === 'Commitment Validation' ? 'border-emerald-300 ring-1 ring-emerald-200' : 'border-gray-200'}`}>
                  <button onClick={() => setExpandedStage(expandedStage === i ? null : i)} className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${stage.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {stage.status === 'success' ? '✓' : '✗'}
                      </span>
                      <span className="text-sm font-medium text-gray-900">{stage.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {stage.name === 'Commitment Validation' && <span className="text-xs bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full font-medium">Passed</span>}
                      <svg className={`w-4 h-4 text-gray-400 transition-transform ${expandedStage === i ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </button>
                  {expandedStage === i && (
                    <div className="px-4 py-3 border-t border-gray-100 space-y-2 bg-gray-50">
                      <div><span className="text-xs font-medium text-gray-500 block mb-1">Inputs</span><pre className="text-xs text-gray-700 bg-white p-2 rounded border border-gray-200 whitespace-pre-wrap">{stage.inputs}</pre></div>
                      <div><span className="text-xs font-medium text-gray-500 block mb-1">Reasoning</span><pre className="text-xs text-gray-700 bg-white p-2 rounded border border-gray-200 whitespace-pre-wrap">{stage.reasoning}</pre></div>
                      <div><span className="text-xs font-medium text-gray-500 block mb-1">Outputs</span><pre className="text-xs text-gray-700 bg-white p-2 rounded border border-gray-200 whitespace-pre-wrap">{stage.outputs}</pre></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 flex items-center justify-between">
          <Link href={`/rfp/proposal?id=${rfpId}`} className="text-sm text-gray-500 hover:text-gray-700">← Proposal View</Link>
          <Link href="/dashboard" className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700">View Dashboard → Scene 4</Link>
        </div>
      </main>
    </>
  );
}

export default function TracePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-gray-500">Loading...</div></div>}>
        <TraceContent />
      </Suspense>
    </div>
  );
}
