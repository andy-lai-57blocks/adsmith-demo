'use client';

import { useEffect, useState } from 'react';
import Logo from './Logo';

interface ThinkingStep {
  icon: string;
  label: string;
  detail: string;
}

const steps: ThinkingStep[] = [
  { icon: '📨', label: 'Parsing RFP', detail: 'Extracting advertiser, audience, budget, flight dates...' },
  { icon: '🔍', label: 'Scanning Inventory', detail: 'Querying publisher segments, placements, capacity...' },
  { icon: '🧮', label: 'Pricing Strategy', detail: 'Calculating CPM, projecting reach, optimizing mix...' },
  { icon: '✅', label: 'Commitment Validation', detail: 'Checking segment existence, volume limits, budget caps...' },
  { icon: '📄', label: 'Generating Proposal', detail: 'Assembling line items, finalizing terms...' },
];

export default function AgentThinking({ onDone }: { onDone: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [phase, setPhase] = useState<'thinking' | 'validating' | 'done'>('thinking');

  useEffect(() => {
    if (currentStep < steps.length) {
      const timer = setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
        if (currentStep === 2) setPhase('validating');
        if (currentStep === 4) setPhase('done');
      }, currentStep === 0 ? 400 : 600);
      return () => clearTimeout(timer);
    }
  }, [currentStep]);

  useEffect(() => {
    if (phase === 'done') {
      const timer = setTimeout(onDone, 800);
      return () => clearTimeout(timer);
    }
  }, [phase, onDone]);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="max-w-lg w-full px-8">
        {/* Logo + Title */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="animate-pulse">
              <Logo size={48} />
            </div>
          </div>
          <h2 className="text-lg font-semibold text-white mb-1">AdSmith Agent</h2>
          <p className="text-sm text-gray-400">Processing RFP through agent pipeline...</p>
        </div>

        {/* Steps */}
        <div className="space-y-4">
          {steps.map((step, i) => {
            const isActive = i === currentStep && phase !== 'done';
            const isPast = i < currentStep || (phase === 'done' && i <= currentStep);
            const isPending = i > currentStep;

            return (
              <div
                key={i}
                className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-500 ${
                  isActive
                    ? 'bg-indigo-900/40 border border-indigo-500/30 shadow-lg shadow-indigo-500/10'
                    : isPast
                    ? 'bg-gray-800/50 border border-gray-700/30'
                    : 'bg-gray-800/20 border border-gray-800/30 opacity-40'
                }`}
              >
                {/* Icon */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all duration-500 ${
                  isActive
                    ? 'bg-indigo-500/20 animate-bounce'
                    : isPast
                    ? 'bg-emerald-500/20'
                    : 'bg-gray-700/30'
                }`}>
                  {isPast && phase === 'done' ? '✓' : step.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium transition-colors duration-500 ${
                      isActive ? 'text-white' : isPast ? 'text-gray-300' : 'text-gray-500'
                    }`}>
                      {step.label}
                    </span>
                    {isActive && (
                      <span className="flex gap-0.5">
                        <span className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </span>
                    )}
                    {isPast && phase === 'done' && (
                      <span className="text-xs text-emerald-400 font-medium">Done</span>
                    )}
                  </div>
                  <p className={`text-xs mt-0.5 transition-colors duration-500 ${
                    isActive ? 'text-indigo-300' : isPast ? 'text-gray-500' : 'text-gray-600'
                  }`}>
                    {step.detail}
                  </p>
                </div>

                {/* Status indicator */}
                <div className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${
                  isActive ? 'bg-indigo-400 animate-ping' : isPast ? 'bg-emerald-400' : 'bg-gray-600'
                }`} />
              </div>
            );
          })}
        </div>

        {/* Bottom status */}
        <div className="text-center mt-8">
          {phase === 'thinking' && (
            <p className="text-xs text-gray-500 animate-pulse">Agent is reasoning...</p>
          )}
          {phase === 'validating' && (
            <p className="text-xs text-indigo-400 animate-pulse">Running commitment validation...</p>
          )}
          {phase === 'done' && (
            <p className="text-xs text-emerald-400">✓ Proposal ready</p>
          )}
        </div>
      </div>
    </div>
  );
}
