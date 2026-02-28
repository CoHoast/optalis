'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import AnalyticsGate from '@/components/AnalyticsGate';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://optalis-api-production.up.railway.app';

interface ResponseTimeData {
  bucket: string;
  count: number;
}

interface LocationData {
  location: string;
  total: number;
  approved: number;
  denied: number;
  pending: number;
  conversion_rate: number;
  avg_response_time: number;
}

const BUCKET_COLORS: { [key: string]: string } = {
  '<2hr': '#10b981',
  '2-4hr': '#34d399',
  '4-8hr': '#fbbf24',
  '8-24hr': '#f59e0b',
  '1-2d': '#f97316',
  '>2d': '#ef4444',
};

export default function ResponseTimePage() {
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter'>('month');
  const [loading, setLoading] = useState(true);
  const [responseTime, setResponseTime] = useState<ResponseTimeData[]>([]);
  const [locations, setLocations] = useState<LocationData[]>([]);

  useEffect(() => {
    fetchData();
  }, [period]);

  async function fetchData() {
    setLoading(true);
    try {
      const [rtRes, locRes] = await Promise.all([
        fetch(`${API_URL}/api/analytics/response-time?period=${period}`),
        fetch(`${API_URL}/api/analytics/locations?period=${period}`),
      ]);
      if (rtRes.ok) setResponseTime(await rtRes.json());
      if (locRes.ok) setLocations(await locRes.json());
    } catch (error) {
      console.error('Error fetching response time data:', error);
    }
    setLoading(false);
  }

  // Calculate overall average
  const totalDecisions = responseTime.reduce((sum, r) => sum + r.count, 0);
  const avgBucket = responseTime.length > 0 ? responseTime[Math.floor(responseTime.length / 2)]?.bucket : 'N/A';

  // Sort locations by response time
  const sortedLocations = [...locations].sort((a, b) => a.avg_response_time - b.avg_response_time);

  return (
    <AnalyticsGate>
      <main style={{ marginLeft: 280, padding: '32px', background: '#faf8f5', minHeight: '100vh' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <Link href="/dashboard/analytics" style={{ color: '#6b7280', textDecoration: 'none', fontSize: '14px' }}>
                ← Back to Overview
              </Link>
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#1a1a1a', margin: 0 }}>
              Response Time Analysis
            </h1>
            <p style={{ color: '#6b7280', margin: '8px 0 0 0' }}>
              How quickly are applications being processed?
            </p>
          </div>

          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as 'week' | 'month' | 'quarter')}
            style={{
              padding: '10px 16px',
              fontSize: '14px',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              background: 'white',
              cursor: 'pointer',
            }}
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
          </select>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '100px 0' }}>
            <div style={{
              width: 48,
              height: 48,
              border: '3px solid #e5e7eb',
              borderTopColor: '#275380',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto 16px',
            }} />
            <p style={{ color: '#6b7280' }}>Loading response time data...</p>
            <style jsx>{`
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '32px' }}>
              <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              }}>
                <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 8px 0' }}>Total Decisions</p>
                <p style={{ fontSize: '32px', fontWeight: 700, color: '#1a1a1a', margin: 0 }}>{totalDecisions}</p>
              </div>
              <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              }}>
                <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 8px 0' }}>Most Common Range</p>
                <p style={{ fontSize: '32px', fontWeight: 700, color: '#1a1a1a', margin: 0 }}>{avgBucket}</p>
              </div>
              <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              }}>
                <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 8px 0' }}>Fastest Location</p>
                <p style={{ fontSize: '24px', fontWeight: 700, color: '#1a1a1a', margin: 0 }}>
                  {sortedLocations[0]?.location || 'N/A'}
                </p>
                {sortedLocations[0] && (
                  <p style={{ fontSize: '14px', color: '#10b981', margin: '4px 0 0 0' }}>
                    {sortedLocations[0].avg_response_time}h avg
                  </p>
                )}
              </div>
            </div>

            {/* Distribution Chart */}
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              marginBottom: '32px',
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 8px 0', color: '#1a1a1a' }}>
                Time to Decision Distribution
              </h3>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 24px 0' }}>
                How long it takes from receiving an application to making a decision
              </p>
              {responseTime.length > 0 ? (
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={responseTime} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="bucket" fontSize={14} stroke="#6b7280" />
                    <YAxis fontSize={12} stroke="#9ca3af" />
                    <Tooltip
                      contentStyle={{
                        background: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                      }}
                      formatter={(value) => [`${value} applications`, 'Count']}
                    />
                    <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                      {responseTime.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={BUCKET_COLORS[entry.bucket] || '#275380'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ height: 350, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
                  No response time data available
                </div>
              )}

              {/* Legend */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '16px', flexWrap: 'wrap' }}>
                {Object.entries(BUCKET_COLORS).map(([bucket, color]) => (
                  <div key={bucket} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: 12, height: 12, borderRadius: 3, background: color }} />
                    <span style={{ fontSize: '13px', color: '#6b7280' }}>{bucket}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Response Time by Location */}
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 24px 0', color: '#1a1a1a' }}>
                Average Response Time by Location
              </h3>
              {sortedLocations.length > 0 ? (
                <ResponsiveContainer width="100%" height={Math.max(300, sortedLocations.length * 50)}>
                  <BarChart data={sortedLocations} layout="vertical" margin={{ left: 150, right: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      type="number"
                      fontSize={12}
                      stroke="#9ca3af"
                      label={{ value: 'Hours', position: 'bottom', offset: 0 }}
                    />
                    <YAxis type="category" dataKey="location" fontSize={12} stroke="#6b7280" width={140} />
                    <Tooltip
                      contentStyle={{
                        background: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                      }}
                      formatter={(value) => [`${value} hours`, 'Avg Response Time']}
                    />
                    <Bar dataKey="avg_response_time" fill="#275380" radius={[0, 8, 8, 0]}>
                      {sortedLocations.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.avg_response_time < 4 ? '#10b981' : entry.avg_response_time < 12 ? '#f59e0b' : '#ef4444'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
                  No location data available
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </AnalyticsGate>
  );
}
