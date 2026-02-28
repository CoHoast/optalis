'use client';

import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import AnalyticsGate from '@/components/AnalyticsGate';
import { 
  AnalyticsTabBar, 
  DateRangePicker, 
  ExportButton, 
  exportToCSV 
} from '@/components/AnalyticsUtils';

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

interface ReviewerData {
  reviewer: string;
  total_reviews: number;
  approved: number;
  denied: number;
  approval_rate: number;
  avg_time_hours: number;
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
  const [period, setPeriod] = useState('month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [responseTime, setResponseTime] = useState<ResponseTimeData[]>([]);
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [reviewers, setReviewers] = useState<ReviewerData[]>([]);

  useEffect(() => {
    const now = new Date();
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    setEndDate(now.toISOString().split('T')[0]);
    setStartDate(monthAgo.toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    if (period !== 'custom') {
      fetchData();
    }
  }, [period]);

  async function fetchData() {
    setLoading(true);
    try {
      const params = period === 'custom' 
        ? `start_date=${startDate}&end_date=${endDate}`
        : `period=${period}`;
      const [rtRes, locRes, revRes] = await Promise.all([
        fetch(`${API_URL}/api/analytics/response-time?${params}`),
        fetch(`${API_URL}/api/analytics/locations?${params}`),
        fetch(`${API_URL}/api/analytics/reviewers?${params}`),
      ]);
      if (rtRes.ok) setResponseTime(await rtRes.json());
      if (locRes.ok) setLocations(await locRes.json());
      if (revRes.ok) setReviewers(await revRes.json());
    } catch (error) {
      console.error('Error fetching response time data:', error);
    }
    setLoading(false);
  }

  const totalDecisions = responseTime.reduce((sum, r) => sum + r.count, 0);
  const avgBucket = responseTime.length > 0 ? responseTime[Math.floor(responseTime.length / 2)]?.bucket : 'N/A';
  const sortedLocations = [...locations].sort((a, b) => a.avg_response_time - b.avg_response_time);

  const exportResponseTime = () => {
    exportToCSV(responseTime as unknown as Record<string, unknown>[], 'response_time_distribution');
  };

  const exportLocations = () => {
    exportToCSV(locations as unknown as Record<string, unknown>[], 'location_response_times');
  };

  const exportReviewers = () => {
    exportToCSV(reviewers as unknown as Record<string, unknown>[], 'reviewer_performance');
  };

  return (
    <AnalyticsGate>
      <main style={{ marginLeft: 280, padding: '32px', background: '#faf8f5', minHeight: '100vh' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#1a1a1a', margin: 0 }}>
              Intake Analytics
            </h1>
            <p style={{ color: '#6b7280', margin: '8px 0 0 0' }}>
              How quickly are applications being processed?
            </p>
          </div>
          <ExportButton onClick={exportResponseTime} />
        </div>

        {/* Tab Bar */}
        <AnalyticsTabBar activeTab="/dashboard/analytics/response-time" />

        {/* Date Range Picker */}
        <div style={{ marginBottom: '24px' }}>
          <DateRangePicker
            period={period}
            setPeriod={setPeriod}
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
            onApply={fetchData}
          />
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 8px 0', color: '#1a1a1a' }}>
                    Time to Decision Distribution
                  </h3>
                  <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                    How long from receiving an application to making a decision
                  </p>
                </div>
                <ExportButton onClick={exportResponseTime} />
              </div>
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
              marginBottom: '32px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 600, margin: 0, color: '#1a1a1a' }}>
                  Average Response Time by Location
                </h3>
                <ExportButton onClick={exportLocations} />
              </div>
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

            {/* Reviewer Performance (Phase 2 Addition) */}
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 600, margin: 0, color: '#1a1a1a' }}>
                  Reviewer Performance
                </h3>
                <ExportButton onClick={exportReviewers} />
              </div>
              {reviewers.length > 0 ? (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Reviewer</th>
                      <th style={{ padding: '12px', textAlign: 'center', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Reviews</th>
                      <th style={{ padding: '12px', textAlign: 'center', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Approved</th>
                      <th style={{ padding: '12px', textAlign: 'center', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Denied</th>
                      <th style={{ padding: '12px', textAlign: 'center', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Approval Rate</th>
                      <th style={{ padding: '12px', textAlign: 'center', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Avg Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reviewers.map((r, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '16px 12px', fontSize: '14px', fontWeight: 500 }}>{r.reviewer}</td>
                        <td style={{ padding: '16px 12px', fontSize: '14px', textAlign: 'center' }}>{r.total_reviews}</td>
                        <td style={{ padding: '16px 12px', fontSize: '14px', textAlign: 'center', color: '#10b981' }}>{r.approved}</td>
                        <td style={{ padding: '16px 12px', fontSize: '14px', textAlign: 'center', color: '#ef4444' }}>{r.denied}</td>
                        <td style={{ padding: '16px 12px', fontSize: '14px', textAlign: 'center' }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '4px 12px',
                            borderRadius: '9999px',
                            fontSize: '13px',
                            fontWeight: 500,
                            background: r.approval_rate >= 80 ? '#d1fae5' : r.approval_rate >= 60 ? '#fef3c7' : '#fee2e2',
                            color: r.approval_rate >= 80 ? '#065f46' : r.approval_rate >= 60 ? '#92400e' : '#991b1b',
                          }}>
                            {r.approval_rate}%
                          </span>
                        </td>
                        <td style={{ padding: '16px 12px', fontSize: '14px', textAlign: 'center' }}>
                          <span style={{ color: r.avg_time_hours < 4 ? '#10b981' : r.avg_time_hours < 12 ? '#f59e0b' : '#ef4444' }}>
                            {r.avg_time_hours}h
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={{ padding: '60px 0', textAlign: 'center', color: '#9ca3af' }}>
                  No reviewer data available for this period
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </AnalyticsGate>
  );
}
