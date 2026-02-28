'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import AnalyticsGate from '@/components/AnalyticsGate';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://optalis-api-production.up.railway.app';

interface LocationData {
  location: string;
  total: number;
  approved: number;
  denied: number;
  pending: number;
  conversion_rate: number;
  avg_response_time: number;
}

const COLORS = {
  approved: '#10b981',
  denied: '#ef4444',
  pending: '#f59e0b',
};

export default function LocationsPage() {
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter'>('month');
  const [loading, setLoading] = useState(true);
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);

  useEffect(() => {
    fetchData();
  }, [period]);

  async function fetchData() {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/analytics/locations?period=${period}`);
      if (res.ok) {
        const data = await res.json();
        setLocations(data);
        // Select all by default
        setSelectedLocations(data.map((d: LocationData) => d.location));
      }
    } catch (error) {
      console.error('Error fetching locations:', error);
    }
    setLoading(false);
  }

  function toggleLocation(location: string) {
    setSelectedLocations(prev => 
      prev.includes(location)
        ? prev.filter(l => l !== location)
        : [...prev, location]
    );
  }

  function selectAll() {
    setSelectedLocations(locations.map(l => l.location));
  }

  function selectNone() {
    setSelectedLocations([]);
  }

  const filteredLocations = locations.filter(l => selectedLocations.includes(l.location));

  // Calculate totals
  const totals = filteredLocations.reduce((acc, loc) => ({
    total: acc.total + loc.total,
    approved: acc.approved + loc.approved,
    denied: acc.denied + loc.denied,
    pending: acc.pending + loc.pending,
  }), { total: 0, approved: 0, denied: 0, pending: 0 });

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
              Location Comparison
            </h1>
            <p style={{ color: '#6b7280', margin: '8px 0 0 0' }}>
              Compare performance across all facilities
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
            <p style={{ color: '#6b7280' }}>Loading location data...</p>
            <style jsx>{`
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        ) : (
          <>
            {/* Location Filter */}
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '20px 24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              marginBottom: '24px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0, color: '#1a1a1a' }}>
                  Filter Locations
                </h3>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    onClick={selectAll}
                    style={{
                      padding: '6px 12px',
                      fontSize: '13px',
                      color: '#275380',
                      background: 'white',
                      border: '1px solid #275380',
                      borderRadius: '6px',
                      cursor: 'pointer',
                    }}
                  >
                    Select All
                  </button>
                  <button
                    onClick={selectNone}
                    style={{
                      padding: '6px 12px',
                      fontSize: '13px',
                      color: '#6b7280',
                      background: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      cursor: 'pointer',
                    }}
                  >
                    Clear
                  </button>
                </div>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {locations.map(loc => (
                  <button
                    key={loc.location}
                    onClick={() => toggleLocation(loc.location)}
                    style={{
                      padding: '8px 16px',
                      fontSize: '14px',
                      borderRadius: '9999px',
                      border: 'none',
                      cursor: 'pointer',
                      background: selectedLocations.includes(loc.location) ? '#275380' : '#f3f4f6',
                      color: selectedLocations.includes(loc.location) ? 'white' : '#374151',
                      transition: 'all 0.2s',
                    }}
                  >
                    {loc.location}
                  </button>
                ))}
              </div>
            </div>

            {/* Summary Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '32px' }}>
              <StatCard label="Total Applications" value={totals.total} color="#275380" />
              <StatCard label="Approved" value={totals.approved} color="#10b981" />
              <StatCard label="Denied" value={totals.denied} color="#ef4444" />
              <StatCard label="Pending" value={totals.pending} color="#f59e0b" />
            </div>

            {/* Stacked Bar Chart */}
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              marginBottom: '32px',
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 24px 0', color: '#1a1a1a' }}>
                Applications by Status
              </h3>
              {filteredLocations.length > 0 ? (
                <ResponsiveContainer width="100%" height={Math.max(350, filteredLocations.length * 60)}>
                  <BarChart data={filteredLocations} layout="vertical" margin={{ left: 150, right: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" fontSize={12} stroke="#9ca3af" />
                    <YAxis type="category" dataKey="location" fontSize={12} stroke="#6b7280" width={140} />
                    <Tooltip
                      contentStyle={{
                        background: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                    <Bar dataKey="approved" name="Approved" fill={COLORS.approved} stackId="a" />
                    <Bar dataKey="denied" name="Denied" fill={COLORS.denied} stackId="a" />
                    <Bar dataKey="pending" name="Pending" fill={COLORS.pending} stackId="a" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ height: 350, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
                  Select at least one location
                </div>
              )}
            </div>

            {/* Detailed Table */}
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 24px 0', color: '#1a1a1a' }}>
                Detailed Metrics
              </h3>
              {filteredLocations.length > 0 ? (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                        <th style={thStyle}>Location</th>
                        <th style={{ ...thStyle, textAlign: 'center' }}>Total</th>
                        <th style={{ ...thStyle, textAlign: 'center' }}>Approved</th>
                        <th style={{ ...thStyle, textAlign: 'center' }}>Denied</th>
                        <th style={{ ...thStyle, textAlign: 'center' }}>Pending</th>
                        <th style={{ ...thStyle, textAlign: 'center' }}>Conversion %</th>
                        <th style={{ ...thStyle, textAlign: 'center' }}>Avg Response</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLocations.map((loc, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                          <td style={{ ...tdStyle, fontWeight: 500 }}>{loc.location}</td>
                          <td style={{ ...tdStyle, textAlign: 'center' }}>{loc.total}</td>
                          <td style={{ ...tdStyle, textAlign: 'center', color: '#10b981' }}>{loc.approved}</td>
                          <td style={{ ...tdStyle, textAlign: 'center', color: '#ef4444' }}>{loc.denied}</td>
                          <td style={{ ...tdStyle, textAlign: 'center', color: '#f59e0b' }}>{loc.pending}</td>
                          <td style={{ ...tdStyle, textAlign: 'center' }}>
                            <span style={{
                              display: 'inline-block',
                              padding: '4px 12px',
                              borderRadius: '9999px',
                              fontSize: '13px',
                              fontWeight: 500,
                              background: loc.conversion_rate >= 80 ? '#d1fae5' : loc.conversion_rate >= 60 ? '#fef3c7' : '#fee2e2',
                              color: loc.conversion_rate >= 80 ? '#065f46' : loc.conversion_rate >= 60 ? '#92400e' : '#991b1b',
                            }}>
                              {loc.conversion_rate}%
                            </span>
                          </td>
                          <td style={{ ...tdStyle, textAlign: 'center' }}>
                            <span style={{
                              color: loc.avg_response_time < 4 ? '#10b981' : loc.avg_response_time < 12 ? '#f59e0b' : '#ef4444',
                            }}>
                              {loc.avg_response_time}h
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ padding: '60px 0', textAlign: 'center', color: '#9ca3af' }}>
                  Select at least one location to view metrics
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </AnalyticsGate>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{
      background: 'white',
      borderRadius: '16px',
      padding: '24px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      borderLeft: `4px solid ${color}`,
    }}>
      <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 8px 0' }}>{label}</p>
      <p style={{ fontSize: '32px', fontWeight: 700, color: '#1a1a1a', margin: 0 }}>{value}</p>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: '12px',
  textAlign: 'left',
  fontSize: '12px',
  fontWeight: 600,
  color: '#6b7280',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

const tdStyle: React.CSSProperties = {
  padding: '16px 12px',
  fontSize: '14px',
};
