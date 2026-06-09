'use client';
import Logo from '@/components/Logo';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { simulateAllRFPs, getDemoRFPs } from '@/lib/rfps';
import { RFPWithResult } from '@/lib/types';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar,
} from 'recharts';

export default function DashboardPage() {
  const [results, setResults] = useState<RFPWithResult[]>([]);
  const [rfpList, setRfpList] = useState(getDemoRFPs());
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    const data = simulateAllRFPs();
    setResults(data);

    // Generate recent activity
    const now = new Date();
    const activity = [
      { time: new Date(now.getTime() - 5 * 60000).toLocaleTimeString(), action: 'RFP received', detail: 'Acme Mattress Co — $50,000', status: 'incoming' },
      { time: new Date(now.getTime() - 12 * 60000).toLocaleTimeString(), action: 'Proposal blocked', detail: 'Acme Mattress Co — segment_not_found', status: 'error' },
      { time: new Date(now.getTime() - 18 * 60000).toLocaleTimeString(), action: 'Proposal validated', detail: 'Acme Mattress Co — AdSmith passed all checks', status: 'success' },
      { time: new Date(now.getTime() - 35 * 60000).toLocaleTimeString(), action: 'RFP received', detail: 'TurboCar Insurance — $75,000', status: 'incoming' },
      { time: new Date(now.getTime() - 50 * 60000).toLocaleTimeString(), action: 'Proposal sent', detail: 'FreshBloom Organic Foods — $35,000', status: 'success' },
      { time: new Date(now.getTime() - 120 * 60000).toLocaleTimeString(), action: 'RFP received', detail: 'FreshBloom Organic Foods — $35,000', status: 'incoming' },
      { time: new Date(now.getTime() - 180 * 60000).toLocaleTimeString(), action: 'Proposal blocked', detail: 'FreshBloom — segment_not_found', status: 'error' },
    ];
    setRecentActivity(activity);
  }, []);

  // Summary metrics
  const totalRfps = rfpList.length;
  const proposalsSent = results.filter(r => r.rawProposal.status === 'sent').length;
  const proposalsValidated = results.filter(r => r.adSmithProposal.status === 'validated').length;
  const errorsFlagged = results.reduce((sum, r) => sum + r.rawProposal.validationErrors.length, 0);

  // Time series data (simulated)
  const timeSeriesData = [
    { time: '06:00', sent: 0, blocked: 0, accepted: 0 },
    { time: '08:00', sent: 1, blocked: 0, accepted: 0 },
    { time: '10:00', sent: 1, blocked: 1, accepted: 0 },
    { time: '12:00', sent: 2, blocked: 1, accepted: 0 },
    { time: '14:00', sent: 2, blocked: 2, accepted: 0 },
    { time: '16:00', sent: 2, blocked: 2, accepted: 0 },
    { time: '18:00', sent: 3, blocked: 2, accepted: 0 },
    { time: '20:00', sent: 3, blocked: 2, accepted: 0 },
    { time: '22:00', sent: 3, blocked: 3, accepted: 0 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/rfp/trace?id=rfp_001`} className="text-sm text-indigo-600 hover:text-indigo-800">
              ← Trace View
            </Link>
            <span className="text-gray-300">|</span>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center">
                <span className="text-white font-bold text-xs">A</span>
              </div>
              <h1 className="text-sm font-semibold text-gray-900">AdSmith Control</h1>
            </div>
          </div>
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">RFP Inbox</Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6">
        {/* Scene badge */}
        <div className="mb-6">
          <span className="text-xs font-medium bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full">
            Scene 4 — Visibility: the control dashboard
          </span>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <MetricCard label="RFPs Received" value={totalRfps} change="+2 today" color="indigo" />
          <MetricCard label="Proposals Sent" value={proposalsSent} change="+2 today" color="blue" />
          <MetricCard label="Acceptance Rate" value="0%" change="Awaiting responses" color="amber" />
          <MetricCard label="Errors Flagged" value={errorsFlagged} change="+3 today" color="red" />
        </div>

        {/* Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-8">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Proposals Over Time (Last 24h)</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="time" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="sent" fill="#6366f1" name="Sent" stackId="a" />
              <Bar dataKey="blocked" fill="#ef4444" name="Blocked" stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">Recent Activity</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {recentActivity.map((item, i) => (
              <div key={i} className="px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full ${
                    item.status === 'success' ? 'bg-green-500' :
                    item.status === 'error' ? 'bg-red-500' : 'bg-blue-500'
                  }`} />
                  <div>
                    <span className="text-sm text-gray-900">{item.action}</span>
                    <p className="text-xs text-gray-400">{item.detail}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-400">{item.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* End of demo */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            End of demo. This is the production vision: visibility into every agent decision.
          </p>
          <Link href="/" className="text-sm text-indigo-600 hover:text-indigo-800 mt-2 inline-block">
            ← Back to RFP Inbox
          </Link>
        </div>
      </main>
    </div>
  );
}

function MetricCard({ label, value, change, color }: {
  label: string; value: string | number; change: string; color: string;
}) {
  const colorMap: Record<string, string> = {
    indigo: 'bg-indigo-50 text-indigo-600',
    blue: 'bg-blue-50 text-blue-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className={`inline-flex px-2 py-0.5 rounded text-xs font-medium mb-2 ${colorMap[color] || colorMap.indigo}`}>
        {label}
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className={`text-xs mt-1 ${change.includes('+') ? 'text-green-600' : 'text-gray-400'}`}>{change}</div>
    </div>
  );
}
