'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis
} from 'recharts';
import AnalyticsGate from '@/components/AnalyticsGate';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://optalis-api-production.up.railway.app';

interface ReferralData {
  source: string;
  hospital: string;
  count: number;
  approved: number;
  denied: number;
  conversion_rate: number;
}

export default function ReferralsPage() {
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter'>('month');
  const [loading, setLoading] = useState(true);
  const [referrals, setReferrals] = useState<ReferralData[]>([]);
  const [sortField, setSortField] = useState<keyof ReferralData>('count');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetchData();
  }, [period]);

  async function fetchData() {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/analytics/referrals?period=${period}&limit=50`);
      if (res.ok) {
        setReferrals(await res.json());
      }
    } catch (error) {
      console.error('Error fetching referrals:', error);
    }
    setLoading(false);
  }

  function handleSort(field: keyof ReferralData) {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  }

  const sortedReferrals = [...referrals].sort((a, b) => {
    const aVal = a[sortField];
    const bVal = b[sortField];
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
    }
    return sortDir === 'asc' 
      ? String(aVal).localeCompare(String(bVal))
      : String(bVal).localeCompare(String(aVal));
  });

  // Scatter plot data
  const scatterData = referrals.map(r => ({
    x: r.count,
    y: r.conversion_rate,
    z: r.count,
    name: r.hospital || r.source,
  }));

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
              Referral Sources
            </h1>
            <p style={{ color: '#6b7280', margin: '8px 0 0 0' }}>
              Analyze where your applications are coming from
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
            <p style={{ color: '#6b7280' }}>Loading referral data...</p>
            <style jsx>{`
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        ) : (
          <>
            {/* Scatter Plot */}
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              marginBottom: '32px',
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 8px 0', color: '#1a1a1a' }}>
                Volume vs Conversion Rate
              </h3>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 24px 0' }}>
                Identify high-value referral sources (top-right quadrant)
              </p>
              {scatterData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      type="number"
                      dataKey="x"
                      name="Applications"
                      fontSize={12}
                      stroke="#9ca3af"
                      label={{ value: 'Applications', position: 'bottom', offset: 0 }}
                    />
                    <YAxis
                      type="number"
                      dataKey="y"
                      name="Conversion %"
                      fontSize={12}
                      stroke="#9ca3af"
                      domain={[0, 100]}
                      label={{ value: 'Conversion %', angle: -90, position: 'insideLeft' }}
                    />
                    <ZAxis type="number" dataKey="z" range={[100, 1000]} />
                    <Tooltip
                      cursor={{ strokeDasharray: '3 3' }}
                      content={({ payload }) => {
                        if (payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div style={{
                              background: 'white',
                              border: '1px solid #e5e7eb',
                              borderRadius: '8px',
                              padding: '12px',
                              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                            }}>
                              <p style={{ fontWeight: 600, margin: '0 0 8px 0' }}>{data.name}</p>
                              <p style={{ margin: '4px 0', fontSize: '14px' }}>
                                Applications: <strong>{data.x}</strong>
                              </p>
                              <p style={{ margin: '4px 0', fontSize: '14px' }}>
                                Conversion: <strong>{data.y}%</strong>
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Scatter name="Referral Sources" data={scatterData} fill="#275380" />
                  </ScatterChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
                  No referral data available
                </div>
              )}
            </div>

            {/* Table */}
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 24px 0', color: '#1a1a1a' }}>
                Top Referral Sources
              </h3>
              {sortedReferrals.length > 0 ? (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                      <SortableHeader field="source" current={sortField} dir={sortDir} onClick={handleSort}>
                        Source
                      </SortableHeader>
                      <SortableHeader field="hospital" current={sortField} dir={sortDir} onClick={handleSort}>
                        Hospital/Facility
                      </SortableHeader>
                      <SortableHeader field="count" current={sortField} dir={sortDir} onClick={handleSort}>
                        Applications
                      </SortableHeader>
                      <SortableHeader field="approved" current={sortField} dir={sortDir} onClick={handleSort}>
                        Approved
                      </SortableHeader>
                      <SortableHeader field="denied" current={sortField} dir={sortDir} onClick={handleSort}>
                        Denied
                      </SortableHeader>
                      <SortableHeader field="conversion_rate" current={sortField} dir={sortDir} onClick={handleSort}>
                        Conversion %
                      </SortableHeader>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedReferrals.map((r, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '16px 12px', fontSize: '14px' }}>{r.source}</td>
                        <td style={{ padding: '16px 12px', fontSize: '14px', fontWeight: 500 }}>{r.hospital}</td>
                        <td style={{ padding: '16px 12px', fontSize: '14px', textAlign: 'center' }}>{r.count}</td>
                        <td style={{ padding: '16px 12px', fontSize: '14px', textAlign: 'center', color: '#10b981' }}>
                          {r.approved}
                        </td>
                        <td style={{ padding: '16px 12px', fontSize: '14px', textAlign: 'center', color: '#ef4444' }}>
                          {r.denied}
                        </td>
                        <td style={{ padding: '16px 12px', fontSize: '14px', textAlign: 'center' }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '4px 12px',
                            borderRadius: '9999px',
                            fontSize: '13px',
                            fontWeight: 500,
                            background: r.conversion_rate >= 80 ? '#d1fae5' : r.conversion_rate >= 60 ? '#fef3c7' : '#fee2e2',
                            color: r.conversion_rate >= 80 ? '#065f46' : r.conversion_rate >= 60 ? '#92400e' : '#991b1b',
                          }}>
                            {r.conversion_rate}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={{ padding: '60px 0', textAlign: 'center', color: '#9ca3af' }}>
                  No referral data available for this period
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </AnalyticsGate>
  );
}

function SortableHeader({ 
  field, 
  current, 
  dir, 
  onClick, 
  children 
}: {
  field: keyof ReferralData;
  current: keyof ReferralData;
  dir: 'asc' | 'desc';
  onClick: (field: keyof ReferralData) => void;
  children: React.ReactNode;
}) {
  const isActive = field === current;
  return (
    <th
      onClick={() => onClick(field)}
      style={{
        padding: '12px',
        textAlign: field === 'source' || field === 'hospital' ? 'left' : 'center',
        fontSize: '12px',
        fontWeight: 600,
        color: isActive ? '#275380' : '#6b7280',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        cursor: 'pointer',
        userSelect: 'none',
      }}
    >
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
        {children}
        {isActive && (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d={dir === 'asc' ? 'M18 15l-6-6-6 6' : 'M6 9l6 6 6-6'} />
          </svg>
        )}
      </span>
    </th>
  );
}
