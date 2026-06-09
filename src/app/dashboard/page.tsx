'use client';

import Logo from '@/components/Logo';
import SceneBadge from '@/components/SceneBadge';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { simulateAllRFPs, getDemoRFPs } from '@/lib/rfps';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

export default function DashboardPage() {
  const [results, setResults] = useState<any[]>([]);
  const [rfpList] = useState(getDemoRFPs());

  useEffect(() => {
    const data = simulateAllRFPs();
    setResults(data);
  }, []);

  // 24h of AdSmith activity with realistic hourly pattern
  const activityPattern = [
    { hour: 0,  sent: 0,  blocked: 0, accepted: 0 },
    { hour: 1,  sent: 0,  blocked: 0, accepted: 0 },
    { hour: 2,  sent: 0,  blocked: 0, accepted: 0 },
    { hour: 3,  sent: 1,  blocked: 0, accepted: 0 },
    { hour: 4,  sent: 2,  blocked: 0, accepted: 1 },
    { hour: 5,  sent: 3,  blocked: 0, accepted: 1 },
    { hour: 6,  sent: 4,  blocked: 1, accepted: 2 },
    { hour: 7,  sent: 6,  blocked: 1, accepted: 4 },
    { hour: 8,  sent: 8,  blocked: 2, accepted: 5 },
    { hour: 9,  sent: 9,  blocked: 2, accepted: 6 },
    { hour: 10, sent: 6,  blocked: 1, accepted: 5 },
    { hour: 11, sent: 5,  blocked: 1, accepted: 4 },
    { hour: 12, sent: 5,  blocked: 0, accepted: 5 },
    { hour: 13, sent: 6,  blocked: 1, accepted: 5 },
    { hour: 14, sent: 8,  blocked: 2, accepted: 7 },
    { hour: 15, sent: 9,  blocked: 2, accepted: 8 },
    { hour: 16, sent: 7,  blocked: 1, accepted: 5 },
    { hour: 17, sent: 5,  blocked: 1, accepted: 4 },
    { hour: 18, sent: 4,  blocked: 0, accepted: 3 },
    { hour: 19, sent: 3,  blocked: 0, accepted: 2 },
    { hour: 20, sent: 2,  blocked: 0, accepted: 2 },
    { hour: 21, sent: 1,  blocked: 0, accepted: 1 },
    { hour: 22, sent: 1,  blocked: 0, accepted: 0 },
    { hour: 23, sent: 0,  blocked: 0, accepted: 0 },
  ];
  const timeSlots = activityPattern.map(p => ({
    time: `${String(p.hour).padStart(2, '0')}:00`,
    sent: p.sent,
    blocked: p.blocked,
    accepted: p.accepted,
  }));

  // Compute metrics from chart data so they always match
  const chartTotalSent = activityPattern.reduce((s, p) => s + p.sent, 0);
  const chartTotalBlocked = activityPattern.reduce((s, p) => s + p.blocked, 0);
  const chartTotalAccepted = activityPattern.reduce((s, p) => s + p.accepted, 0);
  const chartTotalRfps = chartTotalSent + chartTotalBlocked + chartTotalAccepted;
  const chartAcceptanceRate = chartTotalRfps > 0 ? Math.round((chartTotalAccepted / chartTotalRfps) * 100) : 0;
  const now = new Date();
  // Activity feed from actual simulation data with more entries
  const activityFeed = [
    { time: '14:12', action: 'Sent', detail: 'TurboCar Insurance — proposal sent to buyer, awaiting order', status: 'sent' },
    { time: '14:08', action: 'Accepted', detail: 'Acme Mattress Co — buyer accepted, 5 line items confirmed ✅', status: 'accepted' },
    { time: '13:55', action: 'Blocked', detail: 'FreshBloom Organic Foods — 0/2 audience segments match inventory 🚫', status: 'blocked' },
    { time: '13:30', action: 'Sent', detail: 'FreshBloom Organic Foods — proposal sent to buyer', status: 'sent' },
    { time: '12:30', action: 'Accepted', detail: 'TurboCar Insurance — buyer accepted, $66.5K order confirmed ✅', status: 'accepted' },
    { time: '12:15', action: 'Blocked', detail: 'TurboCar Insurance — volume_exceeds_capacity on video_sports', status: 'blocked' },
    { time: '11:20', action: 'Blocked', detail: 'Acme Mattress Co — segment_not_found: premium_sports_fans', status: 'blocked' },
    { time: '10:30', action: 'Accepted', detail: 'Acme Mattress Co — buyer accepted, $36.1K order ✅', status: 'accepted' },
    { time: '10:00', action: 'Sent', detail: 'Acme Mattress Co — proposal sent to buyer', status: 'sent' },
    { time: '09:15', action: 'Blocked', detail: 'TurboCar Insurance — segment_not_found: auto_intenders', status: 'blocked' },
    { time: '09:00', action: 'Sent', detail: 'FreshBloom Organic Foods — proposal sent to buyer', status: 'sent' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm text-indigo-600 hover:text-indigo-800">← RFP Inbox</Link>
            <span className="text-gray-300">|</span>
            <div className="flex items-center gap-2">
              <Logo size={24} />
              <h1 className="text-sm font-semibold text-gray-900">AdSmith Control</h1>
            </div>
          </div>
          <div className="flex gap-2 text-xs">
            <Link href="/rfp/proposal?id=rfp_001" className="text-gray-500 hover:text-gray-700">Proposal View</Link>
            <Link href="/rfp/trace?id=rfp_001" className="text-gray-500 hover:text-gray-700">Trace View</Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-6">
        <SceneBadge num="4" title="Control Dashboard" color="indigo" />

        {/* Four Metric Cards */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <MetricCard label="RFPs Received" value={chartTotalRfps} change="Last 24h" color="indigo" />
          <MetricCard label="Proposals Sent" value={chartTotalSent + chartTotalAccepted} change={`${chartTotalBlocked} blocked by AdSmith`} color="blue" />
          <MetricCard label="Acceptance Rate" value={chartTotalRfps > 0 ? `${Math.round((chartTotalSent + chartTotalAccepted) / chartTotalRfps * 100)}%` : '0%'} change={`${chartTotalSent + chartTotalAccepted}/${chartTotalRfps} sent`} color="green" />
          <MetricCard label="Errors Flagged" value={chartTotalBlocked} change="Caught before send" color="red" />
        </div>

        {/* Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-8">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Proposals Over Time (Last 24h)</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={timeSlots}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="time" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} domain={[0, 20]} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Bar dataKey="sent" fill="#6366f1" name="Sent" stackId="a" radius={[0, 0, 0, 0]} />
              <Bar dataKey="blocked" fill="#ef4444" name="Blocked" stackId="a" radius={[0, 0, 0, 0]} />
              <Bar dataKey="accepted" fill="#10b981" name="Accepted" stackId="a" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">Recent Activity</h2>
          </div>
          <div className="divide-y divide-gray-100 max-h-[420px] overflow-y-auto">
            {activityFeed.map((item, i) => {
              const statusColor = item.status === 'accepted' ? 'bg-emerald-500'
                : item.status === 'blocked' ? 'bg-red-500'
                : 'bg-indigo-500';
              return (
                <div key={i} className="px-5 py-3 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <span className={`w-2 h-2 rounded-full ${statusColor}`} />
                    <div>
                      <span className="text-sm text-gray-900">{item.action}</span>
                      <p className="text-xs text-gray-400">{item.detail}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">{item.time}</span>
                </div>
              );
            })}
          </div>
        </div>

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

function MetricCard({ label, value, change, color }: { label: string; value: string | number; change: string; color: string }) {
  const colorMap: Record<string, string> = {
    indigo: 'bg-indigo-50 text-indigo-600',
    blue: 'bg-blue-50 text-blue-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
  };
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className={`inline-flex px-2 py-0.5 rounded text-xs font-medium mb-2 ${colorMap[color] || colorMap.indigo}`}>{label}</div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-xs text-gray-400 mt-1">{change}</div>
    </div>
  );
}
